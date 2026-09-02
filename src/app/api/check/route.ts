// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Main API Orchestrator
// v6.0: Word-weighted scoring, false positive suppression, 15-algorithm cascade
// ═══════════════════════════════════════════════════════════════════════════════

// Dynamic import: 'natural' has ESM-only sub-deps that crash on Vercel's Node v24
let _natural: Awaited<typeof import('natural')> | null = null;
async function getNatural() {
  if (!_natural) _natural = await import('natural');
  return _natural;
}

import type { StreamPayload, Report, SourceText, AlgorithmContribution, SentenceMatch } from '@/lib/engine/types';
import { STOP_WORDS, sanitizeEvasions, filterCitations, escapeHtml, countWords, getStemmedWords, buildTfVector, buildIdfMap, generateQueryVariants, groupIntoParagraphs } from '@/lib/engine/text-utils';
import { computeMinHash, getWordShingles, lshAreCandidates, estimateJaccardFromMinHash, computeSimHash, simHashSimilarity, winnowingFingerprints, winnowingSimilarity, computeDocumentFingerprint } from '@/lib/engine/fingerprint';
import { matchSentenceToSource, paragraphSimilarity, sentenceReorderScore } from '@/lib/engine/similarity';
import { analyzeAIContent } from '@/lib/engine/ai-detection';
import { searchAllEngines, fetchPageText, classifySourceReliability } from '@/lib/engine/search';
import { checkRateLimit } from '@/lib/rate-limit';
import { scanQueue } from '@/lib/engine/scan-queue';
import { getAvailableEngineCount } from '@/lib/engine/circuit-breaker';
import { config } from '@/lib/config';
import { logger, generateRequestId } from '@/lib/logger';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Configuration ──────────────────────────────────────────────────────────
const MAX_WORDS = config.MAX_WORDS;
const MAX_PROBES = config.MAX_PROBES;
const MAX_SOURCE_URLS = config.MAX_SOURCE_URLS;
const MIN_MATCH_WORDS = config.MIN_MATCH_WORDS;
const HIGHLIGHT_CLASS = 'plagiarism-highlight';
const TOTAL_STEPS = 8;
const SEARCH_BATCH = config.SEARCH_BATCH;
const BATCH_SLEEP_MS = config.BATCH_SLEEP_MS;
const HIGH_CONFIDENCE_CUTOFF = config.HIGH_CONFIDENCE_CUTOFF;
const GLOBAL_TIMEOUT_MS = config.GLOBAL_TIMEOUT_MS;
const YIELD_EVERY_N = config.YIELD_EVERY_N;
const MAX_SOURCE_SENTS = config.MAX_SOURCE_SENTS;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Yield control back to the event loop.
 * This is the key to not blocking other users' requests during CPU-heavy analysis.
 * setImmediate runs after I/O callbacks, allowing pending requests to be handled.
 */
const yieldEventLoop = () => new Promise<void>(resolve => setImmediate(resolve));

// Lazy SentenceTokenizer — initialized on first use
let _sentenceTokenizer: InstanceType<(typeof import('natural'))['SentenceTokenizer']> | null = null;
async function getSentenceTokenizer() {
  if (!_sentenceTokenizer) {
    const natural = await getNatural();
    _sentenceTokenizer = new natural.SentenceTokenizer([]);
  }
  return _sentenceTokenizer;
}

/**
 * Safe sentence tokenization — falls back to regex splitting if the NLP
 * tokenizer throws on malformed Unicode / control characters.
 */
async function safeTokenize(text: string): Promise<string[]> {
  try {
    const tokenizer = await getSentenceTokenizer();
    return tokenizer.tokenize(text).map(s => s.trim()).filter(Boolean);
  } catch (err) {
    logger.warn('SentenceTokenizer crashed, using regex fallback', { error: err instanceof Error ? err.message : String(err) });
    // Regex fallback: split on period/question/exclamation followed by whitespace + uppercase
    return text
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
}

// ─── Probe Sentence Selection (TF-IDF + diversity) ─────────────────────────
async function selectProbes(sentences: string[]): Promise<string[]> {
  if (sentences.length <= MAX_PROBES) return sentences;

  const natural = await getNatural();
  const tfidf = new natural.TfIdf();
  sentences.forEach(s => tfidf.addDocument(s));

  const scored = sentences.map((sentence, idx) => {
    let score = 0;
    const words = sentence.toLowerCase().split(/\s+/)
      .filter(w => !STOP_WORDS.has(w) && w.length > 3);
    const unique = Array.from(new Set(words));
    unique.forEach(w => { score += tfidf.tfidf(w, idx); });

    // Boost proper nouns
    const properNouns = sentence.match(/\b(?<!^)[A-Z][a-z]+\b/g) || [];
    score += properNouns.length * 2.5;

    // Boost sentences with numbers/dates
    const numbers = sentence.match(/\b\d{2,}\b/g) || [];
    score += numbers.length * 2;

    // Boost sentences with technical terms (contains hyphens, acronyms)
    const technical = sentence.match(/\b[A-Z]{2,}\b/g) || [];
    score += technical.length * 1.5;

    return { sentence, score, length: countWords(sentence), idx };
  });

  // Prefer 8-35 word sentences
  const valid = scored.filter(s => s.length >= 8 && s.length <= 35);
  const pool = (valid.length >= MAX_PROBES ? valid : scored).sort((a, b) => b.score - a.score);

  // Diversity: ensure probes are ≥3 sentences apart
  const selected: typeof pool = [];
  const usedIdx = new Set<number>();

  for (const c of pool) {
    if (selected.length >= MAX_PROBES) break;
    let tooClose = false;
    for (const used of usedIdx) { if (Math.abs(c.idx - used) < 3) { tooClose = true; break; } }
    if (!tooClose) { selected.push(c); usedIdx.add(c.idx); }
  }

  // Fill remaining slots
  for (const c of pool) {
    if (selected.length >= MAX_PROBES) break;
    if (!selected.includes(c)) selected.push(c);
  }

  return selected.slice(0, MAX_PROBES).map(s => s.sentence);
}

// ─── Block Detection (merge adjacent matched sentences) ─────────────────────
function detectBlocks(matches: SentenceMatch[]): number {
  let blocks = 0;
  let inBlock = false;
  for (const m of matches) {
    if (m.matched && !inBlock) { blocks++; inBlock = true; }
    else if (!m.matched) { inBlock = false; }
  }
  return blocks;
}

// ─── Algorithm Contribution Tracking ────────────────────────────────────────
const ALGO_COLORS: Record<string, string> = {
  'Exact Substring': '#ef4444',
  '7-Gram Shingling': '#dc2626',  // v6.0
  '6-Gram Shingling': '#ea580c',  // v6.0
  '5-Gram Shingling': '#f97316',
  '4-Gram Shingling': '#f59e0b',
  '3-Gram Shingling': '#eab308',
  'LCS Analysis': '#84cc16',
  'Sliding Window': '#22c55e',
  'TF-IDF Cosine': '#06b6d4',
  'TF-IDF Cosine (Relaxed)': '#0ea5e9',
  'Dice Coefficient': '#8b5cf6',
  'Edit Distance': '#6366f1',
  'IDF-Weighted Overlap': '#a855f7',
  'Stemmed Jaccard': '#ec4899',
  'Weighted Ensemble': '#f472b6',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════


export async function POST(req: Request) {
  const requestId = generateRequestId();
  const log = logger.child({ requestId });

  // Rate limit: configurable scans per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const { limited, retryAfterMs } = checkRateLimit(ip, config.RATE_LIMIT_SCAN_MAX, config.RATE_LIMIT_SCAN_WINDOW_MS);
  if (limited) {
    log.warn('Rate limit exceeded', { ip });
    return new Response(JSON.stringify({ type: 'error', message: 'Rate limit exceeded. Please wait and try again.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(retryAfterMs / 1000)), 'X-Request-Id': requestId },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Global timeout — guarantees stream closes even if scan hangs
      let aborted = false;
      const globalTimer = setTimeout(() => {
        aborted = true;
        try {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: 'Scan timed out. This can happen with slow network or heavy server load. Please try again.' } satisfies StreamPayload) + '\n'));
          controller.close();
        } catch { /* already closed */ }
      }, GLOBAL_TIMEOUT_MS);

      const send = (p: StreamPayload) => {
        if (aborted) return;
        try { controller.enqueue(encoder.encode(JSON.stringify(p) + '\n')); }
        catch { /* stream already closed */ }
      };
      const status = (msg: string, step?: number, partialMatches?: number) => {
        // Override all internal status messages to show a simple, static message
        send({ type: 'status', message: 'Scanning your document — please wait...', step, totalSteps: TOTAL_STEPS, partialMatches });
      };

      // ── Scan Queue: acquire a slot (limits concurrent scans) ──────────
      let releaseSlot: (() => void) | null = null;

      try {
        // ── Parse request body with dedicated error handling ────────────
        let text: string;
        try {
          const body = await req.json();
          text = body?.text;
        } catch {
          send({ type: 'error', message: 'Invalid request body. Please send valid JSON with a "text" field.' });
          controller.close();
          return;
        }

        if (!text || typeof text !== 'string') {
          send({ type: 'error', message: 'Valid text is required' });
          controller.close();
          return;
        }

        // Input length validation — prevent memory exhaustion
        if (text.length > config.MAX_INPUT_CHARS) {
          send({ type: 'error', message: `Text exceeds maximum length of ${config.MAX_INPUT_CHARS.toLocaleString()} characters.` });
          controller.close();
          return;
        }

        // Quick word count for queue priority
        const roughWordCount = text.trim().split(/\s+/).length;

        // Acquire scan slot (may queue if server is busy)
        const queueStats = scanQueue.getStats();
        if (queueStats.queuedScanCount > 0) {
          status('Processing — please wait, do not close this page...', 0);
        }

        try {
          const slot = await scanQueue.acquire(roughWordCount);
          releaseSlot = slot.release;
          if (slot.position > 0) {
            status('Processing your document...', 0);
          }
        } catch (queueErr) {
          // Queue is full or timed out
          send({ type: 'error', message: queueErr instanceof Error ? queueErr.message : 'Server is too busy. Please try again later.' });
          clearTimeout(globalTimer);
          controller.close();
          return;
        }

        // ════════════════════════════════════════════════════════════════════
        // STEP 1: PREPROCESSING
        // ════════════════════════════════════════════════════════════════════
        status('Preparing your document for analysis...', 1);
        text = sanitizeEvasions(text);
        const cleanText = filterCitations(text).replace(/\s+/g, ' ').trim();
        const wordCount = countWords(cleanText);

        if (wordCount > MAX_WORDS) {
          send({ type: 'error', message: `Text exceeds ${MAX_WORDS.toLocaleString()} word limit` });
          clearTimeout(globalTimer);
          controller.close();
          return;
        }

        // ════════════════════════════════════════════════════════════════════
        // STEP 2: TOKENIZATION
        // ════════════════════════════════════════════════════════════════════
        status(`Processing ${wordCount.toLocaleString()} words...`, 2);
        const sentences = await safeTokenize(cleanText);

        const emptyReport = (): Report => ({
          score: 0, aiScore: 0, originalityScore: 100,
          highlightedText: escapeHtml(text), sources: [],
          stats: { totalWords: wordCount, totalSentences: sentences.length, eligibleSentences: 0, uniqueSources: 0, avgConfidence: 0, matchBreakdown: { exact: 0, paraphrase: 0, conceptual: 0 }, algorithmContributions: [], documentFingerprint: '' },
          heatmap: [], aiAnalysis: { overallScore: 0, signals: [], verdict: 'Insufficient text' }, blockCount: 0,
          matches: [],
        });

        if (sentences.length === 0) {
          send({ type: 'result', report: emptyReport() });
          clearTimeout(globalTimer);
          controller.close();
          return;
        }

        // ════════════════════════════════════════════════════════════════════
        // STEP 3: FINGERPRINTING (MinHash + SimHash + Winnowing)
        // ════════════════════════════════════════════════════════════════════
        status('Generating document fingerprint...', 3);
        const inputLower = cleanText.toLowerCase();
        const inputShingles = getWordShingles(inputLower, 3);
        const inputMinHash = computeMinHash(inputShingles);
        const inputSimHash = computeSimHash(inputLower);
        const inputWinnow = winnowingFingerprints(inputLower);
        const docFingerprint = computeDocumentFingerprint(inputLower);

        // Yield after fingerprinting (can be CPU-heavy for large docs)
        await yieldEventLoop();

        // ════════════════════════════════════════════════════════════════════
        // STEP 4: PROBE SELECTION & QUERY REFORMULATION
        // ════════════════════════════════════════════════════════════════════
        status('Identifying key passages...', 4);
        const probes = await selectProbes(sentences);

        // Generate query variants for each probe
        const allQueries: string[] = [];
        for (const probe of probes) {
          const variants = generateQueryVariants(probe);
          allQueries.push(...variants);
        }
        // Deduplicate queries
        const uniqueQueries = Array.from(new Set(allQueries));

        // ════════════════════════════════════════════════════════════════════
        // STEP 5: PARALLEL 7-ENGINE WEB SEARCH (with circuit breaker awareness)
        // ════════════════════════════════════════════════════════════════════
        const discoveredUrls = new Set<string>();
        const availableEngines = getAvailableEngineCount();
        status('Querying deep database...', 5);

        // Process queries in batches (parallel across 7 engines each)
        for (let i = 0; i < uniqueQueries.length; i += SEARCH_BATCH) {
          if (aborted) break;

          const batch = uniqueQueries.slice(i, i + SEARCH_BATCH);
          const batchNum = Math.floor(i / SEARCH_BATCH) + 1;
          const totalBatches = Math.ceil(uniqueQueries.length / SEARCH_BATCH);
          status('Querying deep database — please wait...', 5);

          if (i > 0) await sleep(BATCH_SLEEP_MS);

          const batchResults = await Promise.allSettled(batch.map(q => searchAllEngines(q)));
          for (const r of batchResults) {
            if (r.status === 'fulfilled') r.value.forEach(v => discoveredUrls.add(v.url));
          }
        }

        const targetUrls = Array.from(discoveredUrls).slice(0, MAX_SOURCE_URLS);

        if (targetUrls.length === 0) {
          status('No matches found — your document appears original.', 6);
          const aiAnalysis = analyzeAIContent(sentences);
          const report = emptyReport();
          report.aiScore = aiAnalysis.overallScore;
          report.aiAnalysis = aiAnalysis;
          report.stats.documentFingerprint = docFingerprint;
          report.heatmap = new Array(Math.ceil(sentences.length / 5)).fill(0);
          send({ type: 'result', report });
          clearTimeout(globalTimer);
          controller.close();
          return;
        }

        // ════════════════════════════════════════════════════════════════════
        // STEP 6: DEEP SOURCE DOWNLOAD & FINGERPRINT PRE-FILTER
        // ════════════════════════════════════════════════════════════════════
        status(`Comparing against ${targetUrls.length} potential matches...`, 6);

        const sourceTexts: SourceText[] = [];
        const fetchResults = await Promise.allSettled(
          targetUrls.map(async url => {
            const pageText = await fetchPageText(url);
            const { reliability } = classifySourceReliability(url);
            return { url, pageText, reliability };
          })
        );
        for (const r of fetchResults) {
          if (r.status === 'fulfilled' && r.value.pageText.length >= 50) {
            sourceTexts.push(r.value);
          }
        }

        if (sourceTexts.length === 0) {
          status('Could not retrieve match content.', 7);
          const aiAnalysis = analyzeAIContent(sentences);
          const report = emptyReport();
          report.aiScore = aiAnalysis.overallScore;
          report.aiAnalysis = aiAnalysis;
          report.stats.documentFingerprint = docFingerprint;
          report.heatmap = new Array(Math.ceil(sentences.length / 5)).fill(0);
          send({ type: 'result', report });
          clearTimeout(globalTimer);
          controller.close();
          return;
        }

        // MinHash/LSH + SimHash + Winnowing pre-filter & scoring
        status('Analyzing potential matches...', 6);
        const fingerScores = new Map<string, { minhash: number; simhash: number; winnow: number; combined: number }>();

        for (const src of sourceTexts) {
          const srcShingles = getWordShingles(src.pageText, 3);
          const srcMinHash = computeMinHash(srcShingles);
          const srcSimHash = computeSimHash(src.pageText);
          const srcWinnow = winnowingFingerprints(src.pageText);

          const scores = { minhash: 0, simhash: 0, winnow: 0, combined: 0 };

          if (lshAreCandidates(inputMinHash, srcMinHash)) {
            scores.minhash = estimateJaccardFromMinHash(inputMinHash, srcMinHash);
          }
          scores.simhash = simHashSimilarity(inputSimHash, srcSimHash);
          scores.winnow = winnowingSimilarity(inputWinnow, srcWinnow);

          // Combined score for ranking (weighted)
          scores.combined = scores.minhash * 0.4 + scores.simhash * 0.3 + scores.winnow * 0.3;

          fingerScores.set(src.url, scores);
        }

        // Sort sources by fingerprint relevance (most promising first)
        // This makes early termination much more effective
        sourceTexts.sort((a, b) => {
          const sa = fingerScores.get(a.url)?.combined ?? 0;
          const sb = fingerScores.get(b.url)?.combined ?? 0;
          return sb - sa;
        });

        // Yield after fingerprinting all sources
        await yieldEventLoop();

        // ════════════════════════════════════════════════════════════════════
        // STEP 7: DEEP MULTI-ALGORITHM SENTENCE ANALYSIS (ASYNC CHUNKED)
        // ════════════════════════════════════════════════════════════════════
        status('Performing deep content analysis...', 7);

        // Pre-process source sentences + TF-IDF vectors
        // Only compute stems/TF for sentences with >= 5 words (others are skipped anyway)
        const srcSentencesMap = new Map<string, string[]>();
        const srcStemsMap = new Map<string, Set<string>[]>();
        const srcTfVecsMap = new Map<string, Map<string, number>[]>();

        // Collect all source words for IDF computation
        const allSourceWordArrays: string[][] = [];

        for (const src of sourceTexts) {
          // Use safeTokenize (not raw sentenceTokenizer) — source HTML can have malformed chars
          const allSrcSents = await safeTokenize(src.pageText);
          // Cap source sentences — a Wikipedia page can have 300+ sentences, which causes O(n²) blowup
          const srcSents = allSrcSents.length > MAX_SOURCE_SENTS ? allSrcSents.slice(0, MAX_SOURCE_SENTS) : allSrcSents;
          srcSentencesMap.set(src.url, srcSents);

          // Pre-compute stems and TF vectors, but only for eligible (≥5 words) sentences
          const stems: Set<string>[] = new Array(srcSents.length);
          const tfVecs: Map<string, number>[] = new Array(srcSents.length);

          for (let j = 0; j < srcSents.length; j++) {
            if (countWords(srcSents[j]) >= 5) {
              stems[j] = await getStemmedWords(srcSents[j]);
              tfVecs[j] = await buildTfVector(srcSents[j]);
            } else {
              stems[j] = new Set();
              tfVecs[j] = new Map();
            }
          }

          srcStemsMap.set(src.url, stems);
          srcTfVecsMap.set(src.url, tfVecs);

          // Collect word arrays for IDF
          for (const sent of srcSents) {
            allSourceWordArrays.push(sent.split(/\s+/));
          }

          // Yield between sources — each source's pre-computation is heavy
          await yieldEventLoop();
        }

        // Build IDF map from all source documents for IDF-weighted overlap
        const idfMap = await buildIdfMap(allSourceWordArrays);

        // Yield after heavy pre-computation
        await yieldEventLoop();

        // Sentence-level analysis
        const allMatches: SentenceMatch[] = [];
        let totalWeighted = 0;
        let eligibleCount = 0;
        let highlightHTML = '';
        const sourcesMap = new Map<string, { hits: number; totalConf: number }>();
        const breakdown = { exact: 0, paraphrase: 0, conceptual: 0 };
        const algoHits = new Map<string, number>();
        const confidences: number[] = [];

        // Heatmap
        const HEAT_CHUNK = 5;
        const heatChunks: number[] = [];
        let chunkMatches = 0, chunkTotal = 0;
        let runningMatchCount = 0;

        for (let i = 0; i < sentences.length; i++) {
          // Bail out if global timeout fired
          if (aborted) break;

          const sentence = sentences[i];
          const lower = sentence.toLowerCase();
          const wc = countWords(sentence);

          if (i % 20 === 0) {
            status(`Analyzing — ${Math.round(((i + 1) / sentences.length) * 100)}% complete...`, 7, runningMatchCount);
          }

          // ═══════════════════════════════════════════════════════════════════
          // ASYNC YIELD — The critical scalability fix.
          // Every YIELD_EVERY_N sentences, we yield control back to the
          // event loop. This allows Node.js to:
          //   1. Handle other incoming HTTP requests
          //   2. Process I/O callbacks (search responses, page fetches)
          //   3. Run timers (timeouts, keepalives)
          //   4. Prevent "event loop lag" that makes the server unresponsive
          //
          // On a shared hosting server with 3 concurrent scans:
          //   - Without yield: each scan blocks for 30-90s → total blockage
          //   - With yield every 12 sentences: max ~200ms block per chunk
          //     → other users get sub-second response times
          // ═══════════════════════════════════════════════════════════════════
          if (i > 0 && i % YIELD_EVERY_N === 0) {
            await yieldEventLoop();
          }

          // Heatmap tracking
          chunkTotal++;
          if (chunkTotal > HEAT_CHUNK) {
            heatChunks.push(Math.round((chunkMatches / HEAT_CHUNK) * 100));
            chunkMatches = 0;
            chunkTotal = 1;
          }

          let best = { matched: false, bestSnippet: '', matchType: '', confidence: 0, algorithm: '', urls: [] as string[], snippets: [] as string[] };

          try { // Per-sentence crash guard — one bad sentence won't kill the scan

          if (wc >= MIN_MATCH_WORDS) {
            eligibleCount++;
            const tfVec = await buildTfVector(lower);
            const stems = await getStemmedWords(lower);

            for (const src of sourceTexts) {
              const result = await matchSentenceToSource(
                lower, tfVec, stems, src.pageText,
                srcSentencesMap.get(src.url) || [],
                srcStemsMap.get(src.url) || [],
                srcTfVecsMap.get(src.url) || [],
                idfMap,
              );

              if (result.matched) {
                // Fingerprint confidence boost
                let boosted = result.confidence;
                const fs = fingerScores.get(src.url);
                if (fs) {
                  if (fs.minhash > 0.1) boosted = Math.min(1.0, boosted * 1.12);
                  if (fs.simhash > 0.6) boosted = Math.min(1.0, boosted * 1.08);
                  if (fs.winnow > 0.05) boosted = Math.min(1.0, boosted * 1.06);
                }

                // Source reliability boost
                boosted = Math.min(1.0, boosted * (0.85 + src.reliability * 0.15));

                if (boosted > best.confidence) {
                  best = {
                    matched: true, bestSnippet: result.bestSnippet, matchType: result.matchType,
                    confidence: boosted, algorithm: result.algorithm,
                    urls: [...best.urls, src.url],
                    snippets: [...best.snippets, result.bestSnippet.length > 150 ? result.bestSnippet.substring(0, 150) + '…' : result.bestSnippet],
                  };
                } else {
                  best.urls.push(src.url);
                  best.snippets.push(result.bestSnippet.length > 150 ? result.bestSnippet.substring(0, 150) + '…' : result.bestSnippet);
                }

                const existing = sourcesMap.get(src.url) || { hits: 0, totalConf: 0 };
                existing.hits++;
                existing.totalConf += boosted;
                sourcesMap.set(src.url, existing);

                // ── Early termination: skip remaining sources if very high confidence ──
                if (best.confidence >= HIGH_CONFIDENCE_CUTOFF) break;
              }
            }
          }

          const safe = escapeHtml(sentence);

          const match: SentenceMatch = {
            index: i, sentence, matched: best.matched, matchType: best.matchType,
            confidence: best.confidence, algorithm: best.algorithm,
            urls: best.urls, snippets: best.snippets,
          };
          allMatches.push(match);

          if (best.matched) {
            chunkMatches++;
            runningMatchCount++;
            totalWeighted += best.confidence;
            confidences.push(best.confidence);

            // Breakdown
            if (best.matchType.includes('Exact')) breakdown.exact++;
            else if (best.matchType.includes('Paraphras') || best.matchType.includes('Gram') || best.matchType.includes('LCS') || best.matchType.includes('Reorder') || best.matchType.includes('Fuzzy') || best.matchType.includes('Overlap')) breakdown.paraphrase++;
            else breakdown.conceptual++;

            // Algorithm tracking
            algoHits.set(best.algorithm, (algoHits.get(best.algorithm) || 0) + 1);

            // Severity class
            let severity = 'low';
            if (best.confidence >= 0.8) severity = 'high';
            else if (best.confidence >= 0.5) severity = 'medium';

            const urlsJson = escapeHtml(JSON.stringify(best.urls));
            const snippetsJson = escapeHtml(JSON.stringify(best.snippets));
            const mtStr = escapeHtml(best.matchType);
            const confStr = Math.round(best.confidence * 100).toString();
            const algoStr = escapeHtml(best.algorithm);

            highlightHTML += `<span class="${HIGHLIGHT_CLASS} ${severity}" data-urls="${urlsJson}" data-snippets="${snippetsJson}" data-match-type="${mtStr}" data-confidence="${confStr}" data-algorithm="${algoStr}" title="${mtStr} (${confStr}% confidence via ${algoStr})">${safe}</span> `;
          } else {
            highlightHTML += `${safe} `;
          }
          } catch (sentErr) {
            // Log but continue — don't let one sentence crash the whole scan
            log.warn('Sentence analysis failed', { sentenceIndex: i, error: sentErr instanceof Error ? sentErr.message : String(sentErr) });
          }
        }

        // Final heatmap chunk
        if (chunkTotal > 0) {
          heatChunks.push(Math.round((chunkMatches / chunkTotal) * 100));
        }

        // Yield before paragraph analysis
        await yieldEventLoop();

        // ════════════════════════════════════════════════════════════════════
        // STEP 7.5: PARAGRAPH-LEVEL & REORDER ANALYSIS
        // ════════════════════════════════════════════════════════════════════
        status('Cross-referencing results...', 7, runningMatchCount);

        const inputParagraphs = groupIntoParagraphs(sentences, 5);
        let paraBoost = 0;

        // Cap paragraph comparisons to prevent O(n²) blowup on large documents.
        // For a 15K-word doc: 120 input paras × 100 src paras × 12 sources = 144K comparisons (uncapped)
        // With cap: 30 × 30 × 12 = 10.8K comparisons — 13x reduction
        const MAX_PARA_COMPARE = 30;
        const MAX_REORDER_SENTENCES = 100;

        for (const src of sourceTexts) {
          if (aborted) break;

          const srcSents = srcSentencesMap.get(src.url) || [];
          if (srcSents.length < 5) continue;

          const srcParagraphs = groupIntoParagraphs(srcSents, 5);

          // Only compare a sample of paragraphs (evenly distributed through the document)
          const inputSample = inputParagraphs.length <= MAX_PARA_COMPARE
            ? inputParagraphs
            : inputParagraphs.filter((_, i) => i % Math.ceil(inputParagraphs.length / MAX_PARA_COMPARE) === 0);
          const srcSample = srcParagraphs.length <= MAX_PARA_COMPARE
            ? srcParagraphs
            : srcParagraphs.filter((_, i) => i % Math.ceil(srcParagraphs.length / MAX_PARA_COMPARE) === 0);

          for (const inputPara of inputSample) {
            for (const srcPara of srcSample) {
              const paraSim = await paragraphSimilarity(inputPara, srcPara);
              if (paraSim > 0.45) paraBoost += 0.02;
            }
          }

          // Sentence reorder detection (capped to prevent O(n²) on large docs)
          const reorderInput = sentences.length <= MAX_REORDER_SENTENCES
            ? sentences
            : sentences.slice(0, MAX_REORDER_SENTENCES);
          const reorderScore = await sentenceReorderScore(reorderInput, srcSents);
          if (reorderScore > 0.3) paraBoost += reorderScore * 0.05;
        }

        // ════════════════════════════════════════════════════════════════════
        // STEP 8: SCORE AGGREGATION & AI ANALYSIS
        // ════════════════════════════════════════════════════════════════════
        status('Generating your report...', 8);

        // Yield before AI analysis (CPU-heavy)
        await yieldEventLoop();

        // Confidence-weighted plagiarism score + paragraph boost
        // v6.0: Word-count-weighted scoring — longer matched sentences contribute more
        let totalWeightedWords = 0;
        let totalEligibleWords = 0;
        for (const m of allMatches) {
          const wc = countWords(m.sentence);
          if (wc >= MIN_MATCH_WORDS) {
            totalEligibleWords += wc;
            if (m.matched) {
              // v6.0: Suppress false positives — very short snippets with low confidence
              const snippetLen = m.snippets?.[0]?.length ?? 0;
              if (m.confidence < 0.4 && snippetLen < 20) continue; // Skip weak, tiny matches
              totalWeightedWords += wc * m.confidence;
            }
          }
        }

        let rawScore = totalEligibleWords === 0 ? 0 : (totalWeightedWords / totalEligibleWords) * 100;
        rawScore = Math.min(100, rawScore + paraBoost * 100);

        // Guard against NaN/Infinity
        if (!Number.isFinite(rawScore)) rawScore = 0;

        const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
        const originalityScore = Math.max(0, 100 - finalScore);

        // AI analysis (16 signals, v6.0)
        const aiAnalysis = analyzeAIContent(sentences);

        const avgConfidence = confidences.length > 0
          ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) : 0;

        // Format sources with reliability labels
        const formattedSources = Array.from(sourcesMap.entries()).map(([url, data]) => {
          const pct = Math.min(100, Math.round((data.totalConf / Math.max(eligibleCount, 1)) * 100));
          let domain = '';
          try { domain = new URL(url).hostname; } catch { domain = url; }
          const { label } = classifySourceReliability(url);
          return { url, matchPercentage: Math.max(1, pct), domain, reliability: label };
        }).sort((a, b) => b.matchPercentage - a.matchPercentage);

        // Algorithm contributions
        const algoContributions: AlgorithmContribution[] = Array.from(algoHits.entries())
          .map(([name, count]) => ({ name, matchCount: count, color: ALGO_COLORS[name] || '#64748b' }))
          .sort((a, b) => b.matchCount - a.matchCount);

        // Block detection
        const blockCount = detectBlocks(allMatches);

        const report: Report = {
          score: Math.min(100, finalScore),
          aiScore: aiAnalysis.overallScore,
          originalityScore,
          highlightedText: highlightHTML.trim(),
          sources: formattedSources,
          stats: {
            totalWords: wordCount,
            totalSentences: sentences.length,
            eligibleSentences: eligibleCount,
            uniqueSources: formattedSources.length,
            avgConfidence,
            matchBreakdown: breakdown,
            algorithmContributions: algoContributions,
            documentFingerprint: docFingerprint,
          },
          heatmap: heatChunks,
          aiAnalysis,
          blockCount,
          matches: allMatches.filter(m => m.matched),
        };

        send({ type: 'result', report });
        clearTimeout(globalTimer);
        try { controller.close(); } catch { /* timeout may have already closed */ }
      } catch (err) {
        clearTimeout(globalTimer);
        if (!aborted) {
          log.error('Engine error during analysis', { error: err instanceof Error ? err.message : String(err) });
          try {
            send({ type: 'error', message: 'Internal server error during analysis' });
            controller.close();
          } catch { /* stream already closed */ }
        }
      } finally {
        // ═══════════════════════════════════════════════════════════════════
        // ALWAYS release the scan queue slot, even on error/timeout.
        // Without this, crashed scans would permanently consume a slot
        // and eventually deadlock the entire server.
        // ═══════════════════════════════════════════════════════════════════
        if (releaseSlot) releaseSlot();
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Request-Id': requestId },
  });
}
