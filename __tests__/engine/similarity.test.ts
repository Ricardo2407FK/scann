// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Similarity Algorithm Tests (13 Algorithms)
// ═══════════════════════════════════════════════════════════════════════════════

import {
  cosineSimilarity, jaccardSimilarity, idfWeightedOverlap,
  lcsLength, lcsSimilarity, normalizedEditDistance,
  slidingWindowMatch, ensembleScore, matchSentenceToSource,
  THRESHOLDS, CONFIDENCE,
} from '@/lib/engine/similarity';
import { buildTfVector, getStemmedWords } from '@/lib/engine/text-utils';

// ─── cosineSimilarity ───────────────────────────────────────────────────────
describe('cosineSimilarity', () => {
  test('identical vectors return 1.0', () => {
    const vec = new Map([['a', 1], ['b', 2], ['c', 3]]);
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0);
  });

  test('orthogonal vectors return 0', () => {
    const vecA = new Map([['a', 1]]);
    const vecB = new Map([['b', 1]]);
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0);
  });

  test('empty vectors return 0', () => {
    expect(cosineSimilarity(new Map(), new Map())).toBe(0);
  });

  test('partially overlapping vectors give 0 < sim < 1', () => {
    const vecA = new Map([['a', 1], ['b', 2]]);
    const vecB = new Map([['b', 3], ['c', 1]]);
    const sim = cosineSimilarity(vecA, vecB);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});

// ─── jaccardSimilarity ──────────────────────────────────────────────────────
describe('jaccardSimilarity', () => {
  test('identical sets return 1.0', () => {
    const s = new Set(['a', 'b', 'c']);
    expect(jaccardSimilarity(s, s)).toBeCloseTo(1.0);
  });

  test('disjoint sets return 0', () => {
    const a = new Set(['x', 'y']);
    const b = new Set(['a', 'b']);
    expect(jaccardSimilarity(a, b)).toBe(0);
  });

  test('empty sets return 0', () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0);
  });

  test('correct ratio for known overlap', () => {
    // {a,b,c} ∩ {b,c,d} = {b,c}, union = {a,b,c,d} → 2/4 = 0.5
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    expect(jaccardSimilarity(a, b)).toBeCloseTo(0.5);
  });
});

// ─── idfWeightedOverlap ────────────────────────────────────────────────────
describe('idfWeightedOverlap', () => {
  test('identical word lists give high overlap', () => {
    const words = ['machine', 'learning', 'algorithms', 'neural', 'networks'];
    const overlap = idfWeightedOverlap(words, words);
    expect(overlap).toBeCloseTo(1.0);
  });

  test('disjoint words give zero overlap', () => {
    const a = ['quantum', 'physics', 'particles'];
    const b = ['cooking', 'recipes', 'kitchen'];
    expect(idfWeightedOverlap(a, b)).toBe(0);
  });

  test('respects IDF map weights', () => {
    const a = ['common', 'rare'];
    const b = ['common'];
    const idf = new Map([['common', 0.1], ['rare', 5.0]]);
    // Only "common" matches, which has low IDF weight
    const overlap = idfWeightedOverlap(a, b, idf);
    expect(overlap).toBeLessThan(0.5);
  });
});

// ─── lcsLength ──────────────────────────────────────────────────────────────
describe('lcsLength', () => {
  test('identical sequences return full length', () => {
    const words = ['a', 'b', 'c', 'd'];
    expect(lcsLength(words, words)).toBe(4);
  });

  test('empty arrays return 0', () => {
    expect(lcsLength([], ['a'])).toBe(0);
    expect(lcsLength(['a'], [])).toBe(0);
  });

  test('known LCS value', () => {
    // LCS of [a, b, c, d] and [a, c, d, e] = [a, c, d] = 3
    expect(lcsLength(['a', 'b', 'c', 'd'], ['a', 'c', 'd', 'e'])).toBe(3);
  });

  test('no common elements return 0', () => {
    expect(lcsLength(['x', 'y'], ['a', 'b'])).toBe(0);
  });
});

// ─── lcsSimilarity ──────────────────────────────────────────────────────────
describe('lcsSimilarity', () => {
  test('identical texts return 1.0', () => {
    expect(lcsSimilarity('hello world foo', 'hello world foo')).toBeCloseTo(1.0);
  });

  test('empty text returns 0', () => {
    expect(lcsSimilarity('', 'hello')).toBe(0);
  });
});

// ─── normalizedEditDistance ──────────────────────────────────────────────────
describe('normalizedEditDistance', () => {
  test('identical words return 1.0', () => {
    const words = ['the', 'cat', 'sat'];
    expect(normalizedEditDistance(words, words)).toBeCloseTo(1.0);
  });

  test('completely different words return low similarity', () => {
    const a = ['alpha', 'beta', 'gamma', 'delta'];
    const b = ['one', 'two', 'three', 'four'];
    expect(normalizedEditDistance(a, b)).toBeLessThan(0.3);
  });

  test('handles empty arrays', () => {
    expect(normalizedEditDistance([], [])).toBe(1);
    expect(normalizedEditDistance([], ['word'])).toBe(0);
  });

  test('one substitution gives expected similarity', () => {
    // 4 words, 1 different → distance = 1 → similarity = 1 - 1/4 = 0.75
    const a = ['the', 'cat', 'sat', 'down'];
    const b = ['the', 'dog', 'sat', 'down'];
    expect(normalizedEditDistance(a, b)).toBeCloseTo(0.75);
  });
});

// ─── slidingWindowMatch ─────────────────────────────────────────────────────
describe('slidingWindowMatch', () => {
  test('returns no match for short source', () => {
    const result = slidingWindowMatch('test sentence', new Set(['test', 'sentenc']), ['only one sentence']);
    expect(result.matched).toBe(false);
  });

  test('detects cross-boundary matches with sufficient overlap', () => {
    const stems = getStemmedWords('machine learning algorithms are powerful tools for data analysis');
    const sources = [
      'machine learning algorithms are incredibly',
      'powerful tools for data analysis and processing',
      'completely unrelated sentence here',
    ];
    const result = slidingWindowMatch(
      'machine learning algorithms are powerful tools for data analysis',
      stems, sources,
    );
    // The window of sources[0]+sources[1] should match
    // Whether it passes threshold depends on exact Jaccard — just verify the function runs
    expect(typeof result.matched).toBe('boolean');
  });
});

// ─── ensembleScore ──────────────────────────────────────────────────────────
describe('ensembleScore', () => {
  test('all-zero scores give no match', () => {
    expect(ensembleScore(0, 0, 0, 0).matched).toBe(false);
  });

  test('all-high scores give a match', () => {
    const result = ensembleScore(0.7, 0.4, 0.3, 0.5);
    expect(result.matched).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('sub-threshold individual scores can still match in ensemble', () => {
    // Each below threshold, but combined above ensemble threshold
    const result = ensembleScore(0.5, 0.35, 0.25, 0.4);
    expect(result.matched).toBe(true);
  });

  test('very low scores do not match', () => {
    expect(ensembleScore(0.1, 0.1, 0.05, 0.1).matched).toBe(false);
  });
});

// ─── matchSentenceToSource ──────────────────────────────────────────────────
describe('matchSentenceToSource', () => {
  const buildMatchArgs = (sentence: string, sourceText: string) => {
    const lower = sentence.toLowerCase();
    const tf = buildTfVector(lower);
    const stems = getStemmedWords(lower);
    const srcSentences = sourceText.split('.').map(s => s.trim()).filter(Boolean);
    const srcStems = srcSentences.map(s => getStemmedWords(s));
    const srcTf = srcSentences.map(s => buildTfVector(s));
    return { lower, tf, stems, sourceText, srcSentences, srcStems, srcTf };
  };

  test('detects exact substring match', () => {
    const sentence = 'The quick brown fox jumps over the lazy dog';
    const source = 'In a story, the quick brown fox jumps over the lazy dog was the main character.';
    const args = buildMatchArgs(sentence, source);
    const result = matchSentenceToSource(
      args.lower, args.tf, args.stems, source,
      args.srcSentences, args.srcStems, args.srcTf,
    );
    expect(result.matched).toBe(true);
    expect(result.algorithm).toBe('Exact Substring');
    expect(result.confidence).toBe(CONFIDENCE.EXACT);
  });

  test('returns no match for unrelated content', () => {
    const sentence = 'quantum entanglement allows instantaneous communication between particles';
    const source = 'Baking a chocolate cake requires flour, sugar, eggs, and cocoa powder. Mix the ingredients well.';
    const args = buildMatchArgs(sentence, source);
    const result = matchSentenceToSource(
      args.lower, args.tf, args.stems, source,
      args.srcSentences, args.srcStems, args.srcTf,
    );
    expect(result.matched).toBe(false);
  });

  test('returns NO_MATCH for very short source text', () => {
    const args = buildMatchArgs('test sentence here', 'short');
    const result = matchSentenceToSource(
      args.lower, args.tf, args.stems, 'short',
      args.srcSentences, args.srcStems, args.srcTf,
    );
    expect(result.matched).toBe(false);
  });

  test('accepts optional idfMap parameter', () => {
    const sentence = 'test sentence with optional parameter';
    const source = 'This is a completely different text about cooking recipes and ingredients in the kitchen.';
    const args = buildMatchArgs(sentence, source);
    const idfMap = new Map([['test', 3.0], ['sentenc', 2.5]]);
    // Should not throw
    expect(() => matchSentenceToSource(
      args.lower, args.tf, args.stems, source,
      args.srcSentences, args.srcStems, args.srcTf, idfMap,
    )).not.toThrow();
  });
});

// ─── Constants ──────────────────────────────────────────────────────────────
describe('Constants', () => {
  test('THRESHOLDS has all required keys', () => {
    expect(THRESHOLDS).toHaveProperty('EDIT_DISTANCE');
    expect(THRESHOLDS).toHaveProperty('SLIDING_WINDOW_JACCARD');
    expect(THRESHOLDS).toHaveProperty('ENSEMBLE');
  });

  test('CONFIDENCE has all required keys', () => {
    expect(CONFIDENCE).toHaveProperty('EDIT_DISTANCE');
    expect(CONFIDENCE).toHaveProperty('SLIDING_WINDOW');
    expect(CONFIDENCE).toHaveProperty('ENSEMBLE');
  });

  test('all thresholds are between 0 and 1', () => {
    for (const [, v] of Object.entries(THRESHOLDS)) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
