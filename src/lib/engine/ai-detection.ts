// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Advanced AI Content Detection (16 Signals)
// v6.0: +Coherence Score, +Contraction Avoidance
// ═══════════════════════════════════════════════════════════════════════════════

import { STOP_WORDS, countWords } from './text-utils';
import type { AISignal, AIAnalysis } from './types';

// ─── AI Marker Phrases (90+) ────────────────────────────────────────────────
const AI_MARKERS = [
  // Classic GPT overused words
  "furthermore", "moreover", "additionally", "in conclusion", "in summary",
  "it is important to note", "it is worth noting", "it should be noted",
  "it is crucial", "it is essential", "it is noteworthy", "it is imperative",
  // Overused AI vocabulary
  "delve into", "delve deeper", "delving", "tapestry", "testament",
  "multifaceted", "nuanced", "intricate", "pivotal", "paramount",
  "underscore", "beacon", "landscape", "realm", "synergy",
  "holistic", "comprehensive", "robust", "leverage", "facilitate",
  "paradigm", "innovative", "transformative", "groundbreaking",
  "commendable", "meticulous", "arguably", "notably", "crucially",
  // Structural markers
  "in this regard", "in light of", "with regard to", "in terms of",
  "on the other hand", "by the same token", "in the same vein",
  "it goes without saying", "needless to say", "it bears mentioning",
  // Hedging patterns
  "it can be argued", "one could argue", "it is widely recognized",
  "it is generally accepted", "broadly speaking", "in a broader context",
  "it is worth considering", "it remains to be seen",
  // Conclusive patterns
  "all in all", "in essence", "ultimately", "at its core",
  "the crux of the matter", "the bottom line", "to sum up",
  "in the final analysis", "when all is said and done",
  // Emphasis
  "plays a crucial role", "serves as a catalyst", "stands as a testament",
  "paves the way", "sets the stage", "sheds light on",
  "offers valuable insights", "provides a framework",
  "cannot be overstated", "of paramount importance",
  // Transitions
  "that being said", "having said that", "with that in mind",
  "taking into account", "given the fact that", "in the context of",
  // Formality
  "encompasses", "constitutes", "exemplifies", "underscores",
  "necessitates", "warrants", "merits", "entails",
  // Empathy simulation
  "resonate with", "strikes a chord", "speaks volumes",
  "foster a sense of", "cultivate an environment",
  // Context fillers
  "navigate the complexities", "at the forefront", "in today's world",
  "in the ever-evolving", "dynamic landscape", "rich tapestry",
  "cornerstone", "linchpin", "bedrock", "underpinning",
  "a myriad of", "plethora of", "a testament to",
  "it's important to remember", "one must consider",
  "this highlights the importance", "this underscores the need",
];

// Pre-compile AI marker regexes at module load (was 90+ compilations per call)
const AI_MARKER_REGEXES: RegExp[] = AI_MARKERS.map(
  marker => new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
);

// Formulaic sentence-start patterns (pre-compiled at module load)
const AI_PATTERNS: RegExp[] = [
  /^(in conclusion|to summarize|in summary|to sum up),?\s/i,
  /^(furthermore|moreover|additionally|consequently|subsequently),?\s/i,
  /^(first(?:ly)?|second(?:ly)?|third(?:ly)?|finally|lastly),?\s/i,
  /^(however|nevertheless|nonetheless|conversely|alternatively),?\s/i,
  /^(it is (?:important|crucial|essential|worth|noteworthy|imperative|evident|clear))/i,
  /\b(plays a (?:crucial|vital|important|key|significant|pivotal) role)\b/i,
  /\b(in (?:today's|the modern|the contemporary|the current|the digital))\b/i,
  /\b(has (?:become|emerged as|proven to be|evolved into|gained))\b/i,
  /^(while|although|despite|regardless)\b.*,\s*(it|this|the|there)\b/i,
  /^(this (?:demonstrates|illustrates|highlights|underscores|reveals))\b/i,
];

// Pre-compile passive voice patterns (avoids re-compilation per sentence)
const PASSIVE_PATTERNS: RegExp[] = [
  /\b(is|was|were|are|been|be|being)\s+\w+(ed|en|t)\b/i,
  /\b(has|have|had)\s+been\s+\w+/i,
];

// ─── Helper: clamp score to valid range ─────────────────────────────────────
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

// ─── Signal Functions ───────────────────────────────────────────────────────

/** 1. Burstiness — sentence length variance (AI is unnaturally uniform) */
function analyzeBurstiness(sentences: string[]): AISignal {
  const lengths = sentences.map(s => countWords(s));
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return { name: 'Burstiness', score: 0, maxScore: 12, description: 'No measurable variance' };
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
  const cv = Math.sqrt(variance) / mean;

  let score = 0;
  if (cv < 0.12) score = 12;
  else if (cv < 0.20) score = 9;
  else if (cv < 0.30) score = 5;
  else if (cv < 0.38) score = 2;

  return { name: 'Burstiness', score: clamp(score, 0, 12), maxScore: 12, description: `CV=${cv.toFixed(3)} — ${cv < 0.2 ? 'Suspiciously uniform' : cv < 0.35 ? 'Moderate variance' : 'Natural variance'}` };
}

/** 2. Shannon Entropy uniformity across sentences */
function analyzeEntropy(sentences: string[]): AISignal {
  const entropies = sentences.map(s => {
    const chars = s.toLowerCase().split('');
    if (chars.length === 0) return 0;
    const freq = new Map<string, number>();
    for (const c of chars) freq.set(c, (freq.get(c) || 0) + 1);
    let h = 0;
    for (const count of freq.values()) {
      const p = count / chars.length;
      if (p > 0) h -= p * Math.log2(p);
    }
    return h;
  });

  if (entropies.length < 3) return { name: 'Entropy Uniformity', score: 0, maxScore: 10, description: 'Too few sentences' };

  const mean = entropies.reduce((a, b) => a + b, 0) / entropies.length;
  const variance = entropies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / entropies.length;

  let score = 0;
  if (variance < 0.05) score = 10;
  else if (variance < 0.12) score = 6;
  else if (variance < 0.20) score = 3;

  return { name: 'Entropy Uniformity', score: clamp(score, 0, 10), maxScore: 10, description: `Var=${variance.toFixed(4)} — ${variance < 0.1 ? 'Very uniform (AI-like)' : 'Natural distribution'}` };
}

/** 3. Type-Token Ratio */
function analyzeTTR(sentences: string[]): AISignal {
  const words = sentences.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 20) return { name: 'Vocabulary Diversity', score: 0, maxScore: 8, description: 'Too few words' };

  const unique = new Set(words);
  const ttr = unique.size / words.length;

  let score = 0;
  // AI tends toward TTR of 0.40-0.55 (moderate, predictable diversity)
  if (ttr > 0.38 && ttr < 0.52) score = 8;
  else if (ttr > 0.35 && ttr < 0.58) score = 4;

  return { name: 'Vocabulary Diversity', score: clamp(score, 0, 8), maxScore: 8, description: `TTR=${ttr.toFixed(3)} — ${ttr < 0.55 && ttr > 0.38 ? 'Suspiciously moderate' : 'Normal range'}` };
}

/** 4. Hapax Legomena (words appearing exactly once) */
function analyzeHapax(sentences: string[]): AISignal {
  const words = sentences.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 20) return { name: 'Hapax Ratio', score: 0, maxScore: 8, description: 'Too few words' };

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  let hapax = 0;
  for (const c of freq.values()) if (c === 1) hapax++;
  const ratio = hapax / words.length;

  let score = 0;
  if (ratio < 0.25) score = 8;
  else if (ratio < 0.35) score = 4;

  return { name: 'Hapax Ratio', score: clamp(score, 0, 8), maxScore: 8, description: `Ratio=${ratio.toFixed(3)} — ${ratio < 0.3 ? 'Low uniqueness (AI-like)' : 'Normal'}` };
}

/** 5. AI Marker Phrase Density — uses pre-compiled regexes */
function analyzeMarkers(sentences: string[]): AISignal {
  const text = sentences.join(' ').toLowerCase();
  let count = 0;
  for (const re of AI_MARKER_REGEXES) {
    re.lastIndex = 0;
    const matches = text.match(re);
    if (matches) count += matches.length;
  }

  const density = sentences.length > 0 ? count / sentences.length : 0;
  let score = 0;
  if (density > 0.35) score = 12;
  else if (density > 0.20) score = 8;
  else if (density > 0.08) score = 4;
  else if (density > 0.03) score = 2;

  return { name: 'AI Marker Phrases', score: clamp(score, 0, 12), maxScore: 12, description: `${count} markers in ${sentences.length} sentences (density=${density.toFixed(3)})` };
}

/** 6. Formulaic Pattern Matching — uses pre-compiled patterns */
function analyzeFormulaic(sentences: string[]): AISignal {
  let patternHits = 0;
  for (const s of sentences) {
    for (const p of AI_PATTERNS) {
      p.lastIndex = 0;
      if (p.test(s)) { patternHits++; break; }
    }
  }

  const ratio = sentences.length > 0 ? patternHits / sentences.length : 0;
  let score = 0;
  if (ratio > 0.35) score = 10;
  else if (ratio > 0.20) score = 6;
  else if (ratio > 0.10) score = 3;

  return { name: 'Formulaic Structure', score: clamp(score, 0, 10), maxScore: 10, description: `${patternHits}/${sentences.length} sentences match formulaic patterns` };
}

/** 7. Paragraph Length Uniformity */
function analyzeParagraphUniformity(sentences: string[]): AISignal {
  const paraWordCounts: number[] = [];
  for (let i = 0; i < sentences.length; i += 5) {
    paraWordCounts.push(sentences.slice(i, i + 5).reduce((s, sent) => s + countWords(sent), 0));
  }

  if (paraWordCounts.length < 3) return { name: 'Paragraph Uniformity', score: 0, maxScore: 7, description: 'Too few paragraphs' };

  const mean = paraWordCounts.reduce((a, b) => a + b, 0) / paraWordCounts.length;
  if (mean === 0) return { name: 'Paragraph Uniformity', score: 0, maxScore: 7, description: 'Empty paragraphs' };
  const cv = Math.sqrt(paraWordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / paraWordCounts.length) / mean;

  let score = 0;
  if (cv < 0.12) score = 7;
  else if (cv < 0.20) score = 4;
  else if (cv < 0.30) score = 2;

  return { name: 'Paragraph Uniformity', score: clamp(score, 0, 7), maxScore: 7, description: `CV=${cv.toFixed(3)} — ${cv < 0.15 ? 'Suspiciously uniform' : 'Normal'}` };
}

/** 8. Perplexity Estimation (char-level n-gram) */
function analyzePerplexity(sentences: string[]): AISignal {
  const text = sentences.join(' ').toLowerCase();
  const n = 3;
  const chars = text.split('');
  if (chars.length < n + 20) return { name: 'Perplexity', score: 0, maxScore: 7, description: 'Too short' };

  const ngramCounts = new Map<string, number>();
  const contextCounts = new Map<string, number>();

  for (let i = 0; i <= chars.length - n; i++) {
    const ngram = chars.slice(i, i + n).join('');
    const ctx = chars.slice(i, i + n - 1).join('');
    ngramCounts.set(ngram, (ngramCounts.get(ngram) || 0) + 1);
    contextCounts.set(ctx, (contextCounts.get(ctx) || 0) + 1);
  }

  let logProb = 0, count = 0;
  for (let i = 0; i <= chars.length - n; i++) {
    const ngram = chars.slice(i, i + n).join('');
    const ctx = chars.slice(i, i + n - 1).join('');
    const p = (ngramCounts.get(ngram) || 0) / (contextCounts.get(ctx) || 1);
    if (p > 0) { logProb += Math.log2(p); count++; }
  }

  const ppl = count > 0 ? Math.pow(2, -logProb / count) : 0;
  let score = 0;
  if (ppl > 0 && ppl < 2.5) score = 7;
  else if (ppl < 4) score = 3;

  return { name: 'Perplexity', score: clamp(score, 0, 7), maxScore: 7, description: `PPL=${ppl.toFixed(2)} — ${ppl < 3 ? 'Low (predictable/AI-like)' : 'Normal'}` };
}

/** 9. Zipf's Law Conformity — natural text follows Zipf, AI deviates */
function analyzeZipf(sentences: string[]): AISignal {
  const words = sentences.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 50) return { name: "Zipf's Law", score: 0, maxScore: 8, description: 'Too few words' };

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  const sortedFreqs = Array.from(freq.values()).sort((a, b) => b - a);
  if (sortedFreqs.length < 10) return { name: "Zipf's Law", score: 0, maxScore: 8, description: 'Too few unique words' };

  const topN = Math.min(50, sortedFreqs.length);
  const logRanks = Array.from({ length: topN }, (_, i) => Math.log(i + 1));
  const logFreqs = sortedFreqs.slice(0, topN).map(f => Math.log(f));

  // Linear regression on log-log scale
  const n = logRanks.length;
  const sumX = logRanks.reduce((a, b) => a + b, 0);
  const sumY = logFreqs.reduce((a, b) => a + b, 0);
  const sumXY = logRanks.reduce((a, x, i) => a + x * logFreqs[i], 0);
  const sumX2 = logRanks.reduce((a, x) => a + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { name: "Zipf's Law", score: 0, maxScore: 8, description: 'Cannot compute slope' };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const deviation = Math.abs(slope + 1.0);

  let score = 0;
  if (deviation > 0.35) score = 8;
  else if (deviation > 0.25) score = 5;
  else if (deviation > 0.15) score = 2;

  return { name: "Zipf's Law", score: clamp(score, 0, 8), maxScore: 8, description: `Slope=${slope.toFixed(3)} (ideal: -1.0, deviation: ${deviation.toFixed(3)})` };
}

/** 10. Bigram Transition Predictability — uses STOP_WORDS Set */
function analyzeBigramPredictability(sentences: string[]): AISignal {
  const words = sentences.join(' ').toLowerCase().split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length < 30) return { name: 'Bigram Predictability', score: 0, maxScore: 7, description: 'Too few words' };

  const bigramCounts = new Map<string, number>();
  const unigramCounts = new Map<string, number>();

  for (let i = 0; i < words.length; i++) {
    unigramCounts.set(words[i], (unigramCounts.get(words[i]) || 0) + 1);
    if (i < words.length - 1) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1);
    }
  }

  // Calculate average conditional probability of bigrams
  let totalProb = 0, bigramCount = 0;
  for (const [bigram, count] of bigramCounts) {
    const firstWord = bigram.split(' ')[0];
    const uniCount = unigramCounts.get(firstWord) || 1;
    totalProb += count / uniCount;
    bigramCount++;
  }

  const avgProb = bigramCount > 0 ? totalProb / bigramCount : 0;
  let score = 0;
  if (avgProb > 0.7) score = 7;
  else if (avgProb > 0.5) score = 4;
  else if (avgProb > 0.35) score = 2;

  return { name: 'Bigram Predictability', score: clamp(score, 0, 7), maxScore: 7, description: `Avg P=${avgProb.toFixed(3)} — ${avgProb > 0.5 ? 'Highly predictable' : 'Normal'}` };
}

/** 11. Self-Repetition Rate — uses STOP_WORDS Set */
function analyzeRepetition(sentences: string[]): AISignal {
  const text = sentences.join(' ').toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length < 30) return { name: 'Self-Repetition', score: 0, maxScore: 7, description: 'Too few words' };

  // Count repeated 4-grams
  const fourgrams = new Map<string, number>();
  for (let i = 0; i <= words.length - 4; i++) {
    const gram = words.slice(i, i + 4).join(' ');
    fourgrams.set(gram, (fourgrams.get(gram) || 0) + 1);
  }

  let repeatedCount = 0;
  for (const count of fourgrams.values()) {
    if (count > 1) repeatedCount += count - 1;
  }

  const denom = words.length - 3;
  const repetitionRate = denom > 0 ? repeatedCount / denom : 0;
  let score = 0;
  if (repetitionRate > 0.15) score = 7;
  else if (repetitionRate > 0.08) score = 4;
  else if (repetitionRate > 0.04) score = 2;

  return { name: 'Self-Repetition', score: clamp(score, 0, 7), maxScore: 7, description: `Rate=${repetitionRate.toFixed(4)} — ${repetitionRate > 0.1 ? 'High repetition (AI-like)' : 'Normal'}` };
}

/** 12. Vocabulary Sophistication — uses STOP_WORDS Set */
function analyzeVocabSophistication(sentences: string[]): AISignal {
  const words = sentences.join(' ').toLowerCase().split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  if (words.length < 20) return { name: 'Vocabulary Sophistication', score: 0, maxScore: 6, description: 'Too few words' };

  const avgLen = words.reduce((a, w) => a + w.length, 0) / words.length;
  const lenVariance = words.reduce((a, w) => a + Math.pow(w.length - avgLen, 2), 0) / words.length;
  const lenCV = avgLen > 0 ? Math.sqrt(lenVariance) / avgLen : 0;

  let score = 0;
  if (lenCV < 0.25 && avgLen > 5.5 && avgLen < 8) score = 6;
  else if (lenCV < 0.30 && avgLen > 5 && avgLen < 8.5) score = 3;

  return { name: 'Vocabulary Sophistication', score: clamp(score, 0, 6), maxScore: 6, description: `AvgLen=${avgLen.toFixed(1)}, CV=${lenCV.toFixed(3)} — ${lenCV < 0.25 ? 'Uniformly moderate (AI-like)' : 'Natural variation'}` };
}

/** 13. Sentence Opening Diversity */
function analyzeSentenceOpenings(sentences: string[]): AISignal {
  if (sentences.length < 5) return { name: 'Opening Diversity', score: 0, maxScore: 5, description: 'Too few sentences' };

  const openings = sentences.map(s => {
    const words = s.trim().split(/\s+/);
    return words.slice(0, 2).join(' ').toLowerCase();
  });

  const unique = new Set(openings);
  const diversityRatio = openings.length > 0 ? unique.size / openings.length : 0;

  let score = 0;
  if (diversityRatio > 0.6 && diversityRatio < 0.85) score = 5;
  else if (diversityRatio > 0.5 && diversityRatio < 0.9) score = 3;

  return { name: 'Opening Diversity', score: clamp(score, 0, 5), maxScore: 5, description: `${unique.size}/${openings.length} unique openings (ratio=${diversityRatio.toFixed(3)})` };
}

/** 14. Passive Voice Density Estimation — uses pre-compiled patterns */
function analyzePassiveVoice(sentences: string[]): AISignal {
  let passiveCount = 0;
  for (const s of sentences) {
    for (const p of PASSIVE_PATTERNS) {
      p.lastIndex = 0;
      if (p.test(s)) { passiveCount++; break; }
    }
  }

  const ratio = sentences.length > 0 ? passiveCount / sentences.length : 0;
  let score = 0;
  if (ratio > 0.35) score = 5;
  else if (ratio > 0.25) score = 3;
  else if (ratio > 0.18) score = 1;

  return { name: 'Passive Voice', score: clamp(score, 0, 5), maxScore: 5, description: `${passiveCount}/${sentences.length} passive sentences (ratio=${ratio.toFixed(3)})` };
}

// ─── v6.0: New Signal #15 — Contraction Avoidance ──────────────────────
/** 15. AI rarely uses contractions (don't, won't, can't, it's, etc.) */
const CONTRACTION_RE = /\b(?:don't|won't|can't|couldn't|shouldn't|wouldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|didn't|doesn't|it's|he's|she's|that's|there's|who's|what's|let's|i'm|i've|i'd|i'll|we're|we've|we'd|we'll|they're|they've|they'd|they'll|you're|you've|you'd|you'll)\b/gi;

function analyzeContractions(sentences: string[]): AISignal {
  const text = sentences.join(' ');
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 50) return { name: 'Contraction Avoidance', score: 0, maxScore: 6, description: 'Too few words' };

  const matches = text.match(CONTRACTION_RE) || [];
  const contractionRate = matches.length / (wordCount / 100); // per 100 words

  let score = 0;
  if (contractionRate < 0.3) score = 6;
  else if (contractionRate < 0.8) score = 4;
  else if (contractionRate < 1.5) score = 2;

  return { name: 'Contraction Avoidance', score: clamp(score, 0, 6), maxScore: 6, description: `${matches.length} contractions in ${wordCount} words (rate=${contractionRate.toFixed(2)}/100w) — ${contractionRate < 0.5 ? 'Very formal (AI-like)' : 'Natural'}` };
}

// ─── v6.0: New Signal #16 — Sentence Coherence Score ──────────────────
/** 16. AI produces unnaturally high coherence between consecutive sentences */
function analyzeCoherence(sentences: string[]): AISignal {
  if (sentences.length < 5) return { name: 'Coherence Score', score: 0, maxScore: 6, description: 'Too few sentences' };

  let totalOverlap = 0;
  let pairs = 0;

  for (let i = 0; i < sentences.length - 1; i++) {
    const wordsA = new Set(sentences[i].toLowerCase().split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w)));
    const wordsB = new Set(sentences[i + 1].toLowerCase().split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w)));

    if (wordsA.size === 0 || wordsB.size === 0) continue;

    let shared = 0;
    for (const w of wordsA) { if (wordsB.has(w)) shared++; }
    const overlapRatio = shared / Math.min(wordsA.size, wordsB.size);
    totalOverlap += overlapRatio;
    pairs++;
  }

  if (pairs === 0) return { name: 'Coherence Score', score: 0, maxScore: 6, description: 'No valid pairs' };

  const avgCoherence = totalOverlap / pairs;

  let score = 0;
  if (avgCoherence > 0.35) score = 6;
  else if (avgCoherence > 0.25) score = 4;
  else if (avgCoherence > 0.18) score = 2;

  return { name: 'Coherence Score', score: clamp(score, 0, 6), maxScore: 6, description: `Avg coherence=${avgCoherence.toFixed(3)} — ${avgCoherence > 0.3 ? 'Unnaturally smooth (AI-like)' : 'Natural topic flow'}` };
}

// ─── Main AI Analysis ───────────────────────────────────────────────────────
export function analyzeAIContent(sentences: string[]): AIAnalysis {
  if (!sentences || sentences.length < 3) {
    return { overallScore: 0, signals: [], verdict: 'Insufficient text for AI analysis' };
  }

  const signals: AISignal[] = [
    analyzeBurstiness(sentences),       // /12
    analyzeEntropy(sentences),          // /10
    analyzeTTR(sentences),              // /8
    analyzeHapax(sentences),            // /8
    analyzeMarkers(sentences),          // /12
    analyzeFormulaic(sentences),        // /10
    analyzeParagraphUniformity(sentences), // /7
    analyzePerplexity(sentences),       // /7
    analyzeZipf(sentences),             // /8
    analyzeBigramPredictability(sentences), // /7
    analyzeRepetition(sentences),       // /7
    analyzeVocabSophistication(sentences), // /6
    analyzeSentenceOpenings(sentences), // /5
    analyzePassiveVoice(sentences),     // /5
    analyzeContractions(sentences),     // /6 (v6.0)
    analyzeCoherence(sentences),        // /6 (v6.0)
  ];

  const totalScore = signals.reduce((a, s) => a + s.score, 0);
  const maxPossible = signals.reduce((a, s) => a + s.maxScore, 0); // 124
  const overallScore = maxPossible === 0 ? 0 : Math.min(100, Math.round((totalScore / maxPossible) * 100));

  let verdict: string;
  if (overallScore >= 75) verdict = 'Very likely AI-generated';
  else if (overallScore >= 55) verdict = 'Probably AI-generated';
  else if (overallScore >= 35) verdict = 'Possibly AI-assisted';
  else if (overallScore >= 20) verdict = 'Likely human-written';
  else verdict = 'Almost certainly human-written';

  return { overallScore, signals, verdict };
}
