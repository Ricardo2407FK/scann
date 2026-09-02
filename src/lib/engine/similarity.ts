// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Similarity Algorithms (15-Algorithm Cascade)
// v6.0: Best-match tracking, 6/7-gram shingling, false positive suppression
// ═══════════════════════════════════════════════════════════════════════════════

import { PorterStemmer } from 'natural';
import stringSimilarity from 'string-similarity';
import { STOP_WORDS, buildTfVector, getNGrams, getStemmedWords, countWords } from './text-utils';

// ─── Thresholds (tuned for accuracy) ────────────────────────────────────────
export const THRESHOLDS = {
  COSINE_HIGH: 0.78,
  COSINE_MEDIUM: 0.58,
  DICE: 0.48,
  JACCARD: 0.33,
  NGRAM7_RATIO: 0.30,    // v6.0: Near-exact detection for long sentences
  NGRAM6_RATIO: 0.32,    // v6.0: Near-exact detection for long sentences
  NGRAM5_RATIO: 0.35,
  NGRAM3_RATIO: 0.45,
  NGRAM4_RATIO: 0.40,
  LCS_RATIO: 0.55,
  IDF_OVERLAP: 0.40,
  EDIT_DISTANCE: 0.65,
  SLIDING_WINDOW_JACCARD: 0.37,
  ENSEMBLE: 0.42,
};

// ─── Confidence Weights ─────────────────────────────────────────────────────
export const CONFIDENCE = {
  EXACT: 1.0,
  HEAVY_PARAPHRASE: 0.88,
  MODERATE_PARAPHRASE: 0.75,
  STRUCTURAL: 0.68,
  CONCEPTUAL: 0.50,
  LCS: 0.80,
  IDF_OVERLAP: 0.72,
  EDIT_DISTANCE: 0.75,
  SLIDING_WINDOW: 0.72,
  ENSEMBLE: 0.55,
};

// ─── Cosine Similarity ─────────────────────────────────────────────────────
export function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  if (vecA.size === 0 || vecB.size === 0) return 0;

  // Compute dot product: iterate the smaller map for speed
  let dot = 0;
  const [smaller, larger] = vecA.size <= vecB.size ? [vecA, vecB] : [vecB, vecA];
  for (const [key, aVal] of smaller) {
    const bVal = larger.get(key);
    if (bVal !== undefined) dot += aVal * bVal;
  }

  // Compute norms separately (must use original vecA/vecB, not smaller/larger)
  let normA = 0;
  for (const val of vecA.values()) normA += val * val;
  let normB = 0;
  for (const val of vecB.values()) normB += val * val;

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Jaccard Similarity (Stemmed) ───────────────────────────────────────────
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  // Iterate the smaller set for speed
  const [smaller, larger] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  for (const x of smaller) { if (larger.has(x)) intersection++; }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ─── IDF-Weighted Word Overlap ──────────────────────────────────────────────
/**
 * Calculates overlap ratio weighted by IDF — rare/unique words contribute more.
 * Uses O(1) STOP_WORDS Set instead of O(n) array scan.
 */
export function idfWeightedOverlap(
  wordsA: string[],
  wordsB: string[],
  idfMap?: Map<string, number>,
): number {
  const stemsA = wordsA
    .filter(w => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
    .map(w => PorterStemmer.stem(w.toLowerCase()));
  const stemsB = new Set(
    wordsB
      .filter(w => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
      .map(w => PorterStemmer.stem(w.toLowerCase()))
  );

  if (stemsA.length === 0 || stemsB.size === 0) return 0;

  let weightedOverlap = 0;
  let totalWeight = 0;

  const uniqueStemsA = new Set(stemsA);
  for (const stem of uniqueStemsA) {
    const weight = idfMap?.get(stem) ?? 1.0;
    totalWeight += weight;
    if (stemsB.has(stem)) {
      weightedOverlap += weight;
    }
  }

  return totalWeight === 0 ? 0 : weightedOverlap / totalWeight;
}

// ─── Longest Common Subsequence (LCS) ──────────────────────────────────────
/**
 * Finds the length of the longest common subsequence of words between two texts.
 * Uses optimized space: O(min(m,n)) memory instead of O(m*n).
 */
export function lcsLength(wordsA: string[], wordsB: string[]): number {
  // Ensure wordsA is the shorter array for memory optimization
  if (wordsA.length > wordsB.length) {
    [wordsA, wordsB] = [wordsB, wordsA];
  }

  const m = wordsA.length;
  const n = wordsB.length;
  if (m === 0 || n === 0) return 0;

  // Cap at 100 words each to prevent O(n²) blowup
  const capA = wordsA.slice(0, 100);
  const capB = wordsB.slice(0, 100);
  const cm = capA.length;
  const cn = capB.length;

  let prev = new Array(cn + 1).fill(0);
  let curr = new Array(cn + 1).fill(0);

  for (let i = 1; i <= cm; i++) {
    for (let j = 1; j <= cn; j++) {
      if (capA[i - 1].toLowerCase() === capB[j - 1].toLowerCase()) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }

  return prev[cn];
}

/**
 * LCS similarity ratio: LCS length / length of shorter sequence.
 */
export function lcsSimilarity(textA: string, textB: string): number {
  const wordsA = textA.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordsB = textB.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const lcs = lcsLength(wordsA, wordsB);
  const minLen = Math.min(wordsA.length, wordsB.length);
  return minLen === 0 ? 0 : lcs / minLen;
}

// ─── Normalized Edit Distance ───────────────────────────────────────────────
/**
 * Word-level Levenshtein distance normalized to 0–1 similarity.
 * Uses O(min(m,n)) space with two-row DP.
 */
export function normalizedEditDistance(wordsA: string[], wordsB: string[]): number {
  // Ensure wordsA is the shorter for memory optimization
  if (wordsA.length > wordsB.length) {
    [wordsA, wordsB] = [wordsB, wordsA];
  }

  const m = wordsA.length;
  const n = wordsB.length;
  if (m === 0) return n === 0 ? 1 : 0;

  // Cap to prevent blowup on very long sequences
  const capA = wordsA.slice(0, 80);
  const capB = wordsB.slice(0, 80);
  const cm = capA.length;
  const cn = capB.length;

  let prev = Array.from({ length: cn + 1 }, (_, j) => j);
  let curr = new Array(cn + 1).fill(0);

  for (let i = 1; i <= cm; i++) {
    curr[0] = i;
    for (let j = 1; j <= cn; j++) {
      if (capA[i - 1].toLowerCase() === capB[j - 1].toLowerCase()) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }

  const maxLen = Math.max(cm, cn);
  return maxLen === 0 ? 1 : Math.max(0, 1 - prev[cn] / maxLen);
}

// ─── Sliding Window Cross-Boundary Match ────────────────────────────────────
/**
 * Detects plagiarism that spans across sentence boundaries in the source.
 */
export function slidingWindowMatch(
  lowerSentence: string,
  sentenceStems: Set<string>,
  sourceSentences: string[],
): { matched: boolean; snippet: string; confidence: number } {
  const NO_MATCH = { matched: false, snippet: '', confidence: 0 };

  if (sourceSentences.length < 2 || sentenceStems.size < 4) return NO_MATCH;

  // Try window sizes of 2 and 3 source sentences
  for (const windowSize of [2, 3]) {
    const limit = Math.min(sourceSentences.length - windowSize + 1, 50);
    for (let i = 0; i < limit; i++) {
      const windowSentences = sourceSentences.slice(i, i + windowSize);
      const compositeText = windowSentences.join(' ');
      if (countWords(compositeText) < 5) continue;

      const compositeStems = getStemmedWords(compositeText);
      const jaccard = jaccardSimilarity(sentenceStems, compositeStems);

      if (jaccard >= THRESHOLDS.SLIDING_WINDOW_JACCARD) {
        const snippet = compositeText.length > 150
          ? compositeText.substring(0, 150) + '…'
          : compositeText;
        return {
          matched: true,
          snippet,
          confidence: Math.min(1, CONFIDENCE.SLIDING_WINDOW * jaccard),
        };
      }
    }
  }

  return NO_MATCH;
}

// ─── Weighted Ensemble Score ────────────────────────────────────────────────
/**
 * Combines multiple sub-threshold signals into a weighted ensemble decision.
 */
export function ensembleScore(
  cosine: number,
  dice: number,
  jaccard: number,
  lcsRatio: number,
): { matched: boolean; confidence: number } {
  // Normalize each metric to its respective threshold range
  const normalizedCosine = Math.min(1, cosine / THRESHOLDS.COSINE_HIGH);
  const normalizedDice = Math.min(1, dice / THRESHOLDS.DICE);
  const normalizedJaccard = Math.min(1, jaccard / THRESHOLDS.JACCARD);
  const normalizedLcs = Math.min(1, lcsRatio / THRESHOLDS.LCS_RATIO);

  // Weighted combination — cosine and LCS are strongest indicators
  const weightedScore =
    normalizedCosine * 0.35 +
    normalizedDice * 0.20 +
    normalizedJaccard * 0.20 +
    normalizedLcs * 0.25;

  if (weightedScore >= THRESHOLDS.ENSEMBLE) {
    return {
      matched: true,
      confidence: Math.min(1, CONFIDENCE.ENSEMBLE * weightedScore),
    };
  }

  return { matched: false, confidence: 0 };
}

// ─── Paragraph-Level Comparison ─────────────────────────────────────────────
export function paragraphSimilarity(paraSentences: string[], srcSentences: string[]): number {
  const paraText = paraSentences.join(' ');
  const srcText = srcSentences.join(' ');
  const paraVec = buildTfVector(paraText);
  const srcVec = buildTfVector(srcText);
  return cosineSimilarity(paraVec, srcVec);
}

// ─── Sentence Reorder Detection ─────────────────────────────────────────────
export function sentenceReorderScore(
  inputSentences: string[],
  sourceSentences: string[],
): number {
  if (inputSentences.length === 0 || sourceSentences.length === 0) return 0;

  const srcStems = sourceSentences.map(s => getStemmedWords(s));
  let matchedCount = 0;

  for (const inputSent of inputSentences) {
    const inputStems = getStemmedWords(inputSent);
    if (inputStems.size < 4) continue;

    for (const srcStemSet of srcStems) {
      const jaccard = jaccardSimilarity(inputStems, srcStemSet);
      if (jaccard > 0.5) {
        matchedCount++;
        break;
      }
    }
  }

  return inputSentences.length === 0 ? 0 : matchedCount / inputSentences.length;
}

// ─── Multi-Algorithm Sentence Matcher ───────────────────────────────────────
export type SentenceMatchResult = {
  matched: boolean;
  bestSnippet: string;
  matchType: string;
  confidence: number;
  algorithm: string;
};

/**
 * Helper: truncate a snippet to 350 characters with ellipsis.
 * Longer snippets give more context in the PDF report.
 */
function truncSnippet(text: string): string {
  if (!text) return '';
  return text.length > 350 ? text.substring(0, 350) + '…' : text;
}

/**
 * Pre-compute a boolean mask of which source sentences have >= 5 words.
 * Avoids calling countWords() repeatedly inside every algorithm loop.
 */
function buildEligibleMask(sourceSentences: string[]): boolean[] {
  return sourceSentences.map(s => countWords(s) >= 5);
}

// ─── Source Sentence Caps (prevent O(n²) blowup) ───────────────────────
const LOOP_CAP_EXPENSIVE = 80;   // Cosine, Dice, Edit Distance
const LOOP_CAP_CHEAP = 120;      // IDF overlap, Jaccard (cheaper per iteration)

// v6.0: Common phrase exclusion — hoisted to module level to avoid per-call allocation.
// Short sentences composed mostly of these phrases are not plagiarism.
const COMMON_PHRASES = [
  'on the other hand', 'in order to', 'as a result', 'in addition to',
  'for example', 'for instance', 'in other words', 'such as',
  'according to', 'as well as', 'due to the fact', 'in the case of',
  'it is important', 'it should be noted', 'it can be seen',
  'the results show', 'the data suggest', 'based on the',
  'in this paper', 'in this study', 'this paper presents',
  'the purpose of this', 'the aim of this', 'the goal of this',
  // v6.1: Additional common academic/boilerplate phrases
  'in conclusion', 'to summarize', 'in summary', 'as mentioned above',
  'it is worth noting', 'it is well known', 'it has been shown',
  'plays a crucial role', 'plays an important role', 'is widely used',
  'can be defined as', 'is defined as', 'refers to the',
  'in recent years', 'over the past decade', 'in the field of',
  'the following section', 'the next section', 'as shown in',
  'the main objective', 'the primary goal', 'the key findings',
  'literature review', 'previous research', 'prior work',
];
// Pre-compute word counts to avoid repeated split in hot loop
const COMMON_PHRASE_WORD_COUNTS = COMMON_PHRASES.map(p => p.split(/\s+/).length);

/**
 * Quick stem-overlap pre-filter: rank source sentences by how many stems
 * they share with the input sentence. Returns indices sorted by relevance.
 * This lets expensive algorithms (Dice, Cosine) skip irrelevant source sentences.
 *
 * Cost: O(sourceSentences.length) — just Set.has() lookups, very fast.
 */
function rankSourcesByRelevance(
  sentenceStems: Set<string>,
  sourceStemmedSets: Set<string>[],
  eligible: boolean[],
  limit: number,
): number[] {
  if (sentenceStems.size === 0) return [];

  const scored: { idx: number; overlap: number }[] = [];
  for (let j = 0; j < sourceStemmedSets.length; j++) {
    if (!eligible[j]) continue;
    const srcStems = sourceStemmedSets[j];
    if (!srcStems || srcStems.size === 0) continue;
    let overlap = 0;
    for (const stem of sentenceStems) {
      if (srcStems.has(stem)) overlap++;
    }
    if (overlap > 0) scored.push({ idx: j, overlap });
  }

  // Sort by overlap descending, take top `limit`
  scored.sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map(s => s.idx);
}

/**
 * Run the full battery of 15 algorithms against a single sentence and source.
 * Returns the highest-confidence match found.
 *
 * Algorithm cascade (ordered by cost and specificity):
 *  1. Exact Substring
 *  2. 7-Gram Shingling (v6.0)
 *  3. 6-Gram Shingling (v6.0)
 *  4. 5-Gram Shingling
 *  5. 4-Gram Shingling
 *  6. 3-Gram Shingling
 *  7. LCS Analysis
 *  8. Sliding Window Cross-Boundary
 *  9. TF-IDF Cosine (High)
 * 10. Dice Coefficient
 * 11. Normalized Edit Distance (v6.0: best-match)
 * 12. TF-IDF Cosine (Medium / Relaxed)
 * 13. IDF-Weighted Overlap (v6.0: best-match)
 * 14. Stemmed Jaccard (v6.0: best-match)
 * 15. Weighted Ensemble
 *
 * v6.0 optimizations:
 * - All loops capped at 80-120 source sentences (prevents O(n²) blowup)
 * - Stem-overlap pre-filter ranks source sentences by relevance
 * - Edit Distance, IDF Overlap, Stemmed Jaccard now track best-match (not first-match)
 * - Added 6-gram and 7-gram for near-exact detection on longer sentences
 */
export function matchSentenceToSource(
  lowerSentence: string,
  sentenceTfVec: Map<string, number>,
  sentenceStems: Set<string>,
  sourcePageText: string,
  sourceSentences: string[],
  sourceStemmedSets: Set<string>[],
  sourceTfVecs: Map<string, number>[],
  idfMap?: Map<string, number>,
): SentenceMatchResult {
  const NO_MATCH: SentenceMatchResult = { matched: false, bestSnippet: '', matchType: '', confidence: 0, algorithm: '' };

  if (!sourcePageText || sourcePageText.length < 50) return NO_MATCH;

  // v6.0: Common phrase exclusion — skip short boilerplate sentences
  const lowTrimmed = lowerSentence.trim();
  let commonWordCount = 0;
  for (let p = 0; p < COMMON_PHRASES.length; p++) {
    if (lowTrimmed.includes(COMMON_PHRASES[p])) {
      commonWordCount += COMMON_PHRASE_WORD_COUNTS[p];
    }
  }
  const totalWords = lowTrimmed.split(/\s+/).length;
  if (totalWords > 0 && totalWords <= 10 && commonWordCount / totalWords > 0.6) return NO_MATCH;

  const sentWords = lowerSentence.split(/\s+/);
  const sentWordCount = sentWords.length;

  // Pre-compute eligibility mask once (avoids repeated countWords calls)
  const eligible = buildEligibleMask(sourceSentences);

  // Pre-filter: rank source sentences by stem overlap for expensive algorithms
  const rankedIndices = rankSourcesByRelevance(sentenceStems, sourceStemmedSets, eligible, LOOP_CAP_EXPENSIVE);

  // ── 1. Exact Substring Match ──────────────────────────────────────────
  if (sourcePageText.includes(lowerSentence)) {
    return { matched: true, bestSnippet: lowerSentence, matchType: 'Exact Match', confidence: CONFIDENCE.EXACT, algorithm: 'Exact Substring' };
  }

  // ── 2. 7-Gram Shingling (v6.0: near-exact for long sentences) ───────
  if (sentWordCount >= 10) {
    const ng7 = getNGrams(lowerSentence, 7);
    if (ng7.length > 0) {
      let cnt = 0;
      const matched: string[] = [];
      for (const g of ng7) {
        if (sourcePageText.includes(g)) { cnt++; matched.push(g); }
      }
      const ratio = cnt / ng7.length;
      if (ratio >= THRESHOLDS.NGRAM7_RATIO) {
        return {
          matched: true,
          bestSnippet: matched.slice(0, 3).join(' … '),
          matchType: 'Near-Exact Match',
          confidence: Math.min(1, CONFIDENCE.EXACT * ratio * 0.95),
          algorithm: '7-Gram Shingling',
        };
      }
    }
  }

  // ── 3. 6-Gram Shingling (v6.0: near-exact for medium sentences) ────
  if (sentWordCount >= 8) {
    const ng6 = getNGrams(lowerSentence, 6);
    if (ng6.length > 0) {
      let cnt = 0;
      const matched: string[] = [];
      for (const g of ng6) {
        if (sourcePageText.includes(g)) { cnt++; matched.push(g); }
      }
      const ratio = cnt / ng6.length;
      if (ratio >= THRESHOLDS.NGRAM6_RATIO) {
        return {
          matched: true,
          bestSnippet: matched.slice(0, 3).join(' … '),
          matchType: 'Heavy Paraphrasing',
          confidence: Math.min(1, CONFIDENCE.HEAVY_PARAPHRASE * ratio * 0.98),
          algorithm: '6-Gram Shingling',
        };
      }
    }
  }

  // ── 2. 5-Gram Shingling ──────────────────────────────────────────────
  const ng5 = getNGrams(lowerSentence, 5);
  if (ng5.length > 0) {
    let cnt = 0;
    const matched: string[] = [];
    for (const g of ng5) {
      if (sourcePageText.includes(g)) { cnt++; matched.push(g); }
    }
    const ratio = cnt / ng5.length;
    if (ratio >= THRESHOLDS.NGRAM5_RATIO) {
      return {
        matched: true,
        bestSnippet: matched.slice(0, 3).join(' … '),
        matchType: 'Heavy Paraphrasing',
        confidence: Math.min(1, CONFIDENCE.HEAVY_PARAPHRASE * ratio),
        algorithm: '5-Gram Shingling',
      };
    }
  }

  // ── 3. 4-Gram Shingling ──────────────────────────────────────────────
  const ng4 = getNGrams(lowerSentence, 4);
  if (ng4.length > 0) {
    let cnt = 0;
    for (const g of ng4) { if (sourcePageText.includes(g)) cnt++; }
    const ratio = cnt / ng4.length;
    if (ratio >= THRESHOLDS.NGRAM4_RATIO) {
      return {
        matched: true,
        bestSnippet: `${cnt}/${ng4.length} 4-gram matches`,
        matchType: 'Moderate Paraphrasing',
        confidence: Math.min(1, CONFIDENCE.MODERATE_PARAPHRASE * ratio),
        algorithm: '4-Gram Shingling',
      };
    }
  }

  // ── 4. 3-Gram Shingling ──────────────────────────────────────────────
  const ng3 = getNGrams(lowerSentence, 3);
  if (ng3.length > 0) {
    let cnt = 0;
    for (const g of ng3) { if (sourcePageText.includes(g)) cnt++; }
    const ratio = cnt / ng3.length;
    if (ratio >= THRESHOLDS.NGRAM3_RATIO) {
      return {
        matched: true,
        bestSnippet: `${cnt}/${ng3.length} 3-gram matches`,
        matchType: 'Light Paraphrasing',
        confidence: Math.min(1, CONFIDENCE.MODERATE_PARAPHRASE * ratio * 0.85),
        algorithm: '3-Gram Shingling',
      };
    }
  }

  // ── 5. LCS (Longest Common Subsequence) ──────────────────────────────
  const lcsLimit = Math.min(sourceSentences.length, 60);
  let bestLcsRatio = 0;
  let bestLcsSnippet = '';
  for (let j = 0; j < lcsLimit; j++) {
    if (!eligible[j]) continue;
    const srcWords = sourceSentences[j].toLowerCase().split(/\s+/);
    const lcs = lcsLength(sentWords, srcWords);
    const minLen = Math.min(sentWords.length, srcWords.length);
    const lcsRatio = minLen === 0 ? 0 : lcs / minLen;
    if (lcsRatio > bestLcsRatio) {
      bestLcsRatio = lcsRatio;
      bestLcsSnippet = sourceSentences[j];
    }
    if (lcsRatio >= THRESHOLDS.LCS_RATIO) {
      return {
        matched: true,
        bestSnippet: truncSnippet(sourceSentences[j]),
        matchType: 'Reordered / Word-Substituted',
        confidence: Math.min(1, CONFIDENCE.LCS * lcsRatio),
        algorithm: 'LCS Analysis',
      };
    }
  }

  // ── 6. Sliding Window Cross-Boundary Detection ───────────────────────
  const slideResult = slidingWindowMatch(lowerSentence, sentenceStems, sourceSentences);
  if (slideResult.matched) {
    return {
      matched: true,
      bestSnippet: slideResult.snippet,
      matchType: 'Cross-Boundary Match',
      confidence: Math.min(1, slideResult.confidence),
      algorithm: 'Sliding Window',
    };
  }

  // ── 7. TF-IDF Cosine Similarity (capped + pre-filtered) ──────────────
  let bestCos = 0, bestCosSnippet = '';
  for (const j of rankedIndices) {
    const srcVec = sourceTfVecs[j] || new Map();
    if (srcVec.size === 0) continue;
    const cos = cosineSimilarity(sentenceTfVec, srcVec);
    if (cos > bestCos) { bestCos = cos; bestCosSnippet = sourceSentences[j]; }
    // Early break: if we found a high-confidence cosine match, no need to check remaining
    if (cos >= THRESHOLDS.COSINE_HIGH) break;
  }

  if (bestCos >= THRESHOLDS.COSINE_HIGH) {
    return {
      matched: true,
      bestSnippet: truncSnippet(bestCosSnippet),
      matchType: 'Structural Paraphrasing',
      confidence: Math.min(1, CONFIDENCE.STRUCTURAL * bestCos),
      algorithm: 'TF-IDF Cosine',
    };
  }

  // ── 10. Dice Coefficient (capped + pre-filtered) ─────────────────────
  let bestDice = 0, bestDiceSnippet = '';
  for (const j of rankedIndices) {
    const srcLower = sourceSentences[j].toLowerCase();
    // Guard: string-similarity throws on empty strings
    if (!srcLower || !lowerSentence) continue;
    const dice = stringSimilarity.compareTwoStrings(lowerSentence, srcLower);
    if (dice > bestDice) { bestDice = dice; bestDiceSnippet = sourceSentences[j]; }
    if (dice > THRESHOLDS.DICE) {
      return {
        matched: true,
        bestSnippet: truncSnippet(sourceSentences[j]),
        matchType: 'Fuzzy String Match',
        confidence: Math.min(1, CONFIDENCE.STRUCTURAL * dice),
        algorithm: 'Dice Coefficient',
      };
    }
  }

  // ── 11. Normalized Edit Distance (v6.0: best-match tracking) ───────
  let bestEditSim = 0, bestEditSnippet = '';
  const editLimit = Math.min(sourceSentences.length, 60);
  for (let j = 0; j < editLimit; j++) {
    if (!eligible[j]) continue;
    const srcWords = sourceSentences[j].toLowerCase().split(/\s+/);
    const editSim = normalizedEditDistance(sentWords, srcWords);
    if (editSim > bestEditSim) {
      bestEditSim = editSim;
      bestEditSnippet = sourceSentences[j];
    }
  }
  if (bestEditSim >= THRESHOLDS.EDIT_DISTANCE) {
    return {
      matched: true,
      bestSnippet: truncSnippet(bestEditSnippet),
      matchType: 'Character-Level Match',
      confidence: Math.min(1, CONFIDENCE.EDIT_DISTANCE * bestEditSim),
      algorithm: 'Edit Distance',
    };
  }

  // ── 12. Medium Cosine ─────────────────────────────────────────────────
  if (bestCos >= THRESHOLDS.COSINE_MEDIUM) {
    return {
      matched: true,
      bestSnippet: truncSnippet(bestCosSnippet),
      matchType: 'AI Rewritten (Semantic)',
      confidence: Math.min(1, CONFIDENCE.CONCEPTUAL * (bestCos / THRESHOLDS.COSINE_HIGH)),
      algorithm: 'TF-IDF Cosine (Relaxed)',
    };
  }

  // ── 13. IDF-Weighted Overlap (v6.0: best-match tracking) ──────────
  let bestOverlap = 0;
  let bestOverlapSnippet = '';
  const idfLimit = Math.min(sourceSentences.length, LOOP_CAP_CHEAP);
  for (let j = 0; j < idfLimit; j++) {
    if (!eligible[j]) continue;
    const overlap = idfWeightedOverlap(
      lowerSentence.split(/\s+/),
      sourceSentences[j].split(/\s+/),
      idfMap,
    );
    if (overlap > bestOverlap) { bestOverlap = overlap; bestOverlapSnippet = sourceSentences[j]; }
  }
  if (bestOverlap >= THRESHOLDS.IDF_OVERLAP) {
    return {
      matched: true,
      bestSnippet: truncSnippet(bestOverlapSnippet),
      matchType: 'Key-Term Overlap',
      confidence: Math.min(1, CONFIDENCE.IDF_OVERLAP * bestOverlap),
      algorithm: 'IDF-Weighted Overlap',
    };
  }

  // ── 14. Stemmed Jaccard (v6.0: best-match tracking) ───────────────
  let bestJaccard = 0;
  let bestJaccardSnippet = '';
  const jaccardLimit = Math.min(sourceSentences.length, LOOP_CAP_CHEAP);
  for (let j = 0; j < jaccardLimit; j++) {
    if (!eligible[j]) continue;
    const srcStems = sourceStemmedSets[j] || new Set<string>();
    if (srcStems.size === 0) continue;
    const jaccard = jaccardSimilarity(sentenceStems, srcStems);
    if (jaccard > bestJaccard) {
      bestJaccard = jaccard;
      bestJaccardSnippet = sourceSentences[j];
    }
  }
  if (bestJaccard > THRESHOLDS.JACCARD) {
    return {
      matched: true,
      bestSnippet: truncSnippet(bestJaccardSnippet),
      matchType: 'Conceptual Overlap',
      confidence: Math.min(1, CONFIDENCE.CONCEPTUAL * bestJaccard),
      algorithm: 'Stemmed Jaccard',
    };
  }

  // ── 15. Weighted Ensemble (combines sub-threshold signals) ────────────
  const ens = ensembleScore(bestCos, bestDice, bestJaccard, bestLcsRatio);
  if (ens.matched) {
    const bestSnippet = bestCosSnippet || bestDiceSnippet || bestOverlapSnippet || bestLcsSnippet;
    return {
      matched: true,
      bestSnippet: truncSnippet(bestSnippet),
      matchType: 'Multi-Signal Ensemble',
      confidence: Math.min(1, ens.confidence),
      algorithm: 'Weighted Ensemble',
    };
  }

  return NO_MATCH;
}
