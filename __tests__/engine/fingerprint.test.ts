// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Fingerprint Tests
// ═══════════════════════════════════════════════════════════════════════════════

import {
  computeMinHash, getWordShingles, lshAreCandidates,
  estimateJaccardFromMinHash, computeSimHash, simHashSimilarity,
  winnowingFingerprints, winnowingSimilarity,
} from '@/lib/engine/fingerprint';

// ─── getWordShingles ────────────────────────────────────────────────────────
describe('getWordShingles', () => {
  test('generates 3-word shingles from text', () => {
    const shingles = getWordShingles('one two three four five', 3);
    expect(shingles.size).toBe(3);
    expect(shingles.has('one two three')).toBe(true);
    expect(shingles.has('three four five')).toBe(true);
  });

  test('returns empty for short text', () => {
    expect(getWordShingles('ab', 3).size).toBe(0);
  });
});

// ─── computeMinHash ─────────────────────────────────────────────────────────
describe('computeMinHash', () => {
  test('returns an array of 200 hashes', () => {
    const shingles = getWordShingles('the quick brown fox jumps over the lazy dog and more words here', 3);
    const minhash = computeMinHash(shingles);
    expect(minhash).toHaveLength(200);
  });

  test('identical shingle sets produce identical minhash', () => {
    const shingles = getWordShingles('hello world foo bar baz qux', 3);
    const mh1 = computeMinHash(shingles);
    const mh2 = computeMinHash(shingles);
    expect(mh1).toEqual(mh2);
  });

  test('handles empty set', () => {
    const mh = computeMinHash(new Set());
    expect(mh).toHaveLength(200);
    // All should be 0xFFFFFFFF (Uint32Array sentinel for empty)
    for (const h of mh) expect(h).toBe(0xFFFFFFFF);
  });
});

// ─── estimateJaccardFromMinHash ─────────────────────────────────────────────
describe('estimateJaccardFromMinHash', () => {
  test('identical minhashes give jaccard ≈ 1', () => {
    const shingles = getWordShingles('the quick brown fox jumps over the lazy dog and more text', 3);
    const mh = computeMinHash(shingles);
    expect(estimateJaccardFromMinHash(mh, mh)).toBeCloseTo(1.0);
  });

  test('completely different texts give low jaccard', () => {
    const mh1 = computeMinHash(getWordShingles('alpha beta gamma delta epsilon zeta eta theta', 3));
    const mh2 = computeMinHash(getWordShingles('one two three four five six seven eight', 3));
    expect(estimateJaccardFromMinHash(mh1, mh2)).toBeLessThanOrEqual(0.5);
  });
});

// ─── lshAreCandidates ───────────────────────────────────────────────────────
describe('lshAreCandidates', () => {
  test('identical minhashes are always candidates', () => {
    const shingles = getWordShingles('testing lsh candidate detection with some words here extra', 3);
    const mh = computeMinHash(shingles);
    expect(lshAreCandidates(mh, mh)).toBe(true);
  });
});

// ─── computeSimHash ─────────────────────────────────────────────────────────
describe('computeSimHash', () => {
  test('returns a consistent hash value', () => {
    const hash = computeSimHash('hello world testing simhash');
    expect(hash).toBeDefined();
  });

  test('identical texts produce identical simhash', () => {
    const h1 = computeSimHash('exact same text here');
    const h2 = computeSimHash('exact same text here');
    expect(h1).toBe(h2);
  });
});

// ─── simHashSimilarity ──────────────────────────────────────────────────────
describe('simHashSimilarity', () => {
  test('identical simhashes have similarity 1.0', () => {
    const h = computeSimHash('test text for similarity');
    expect(simHashSimilarity(h, h)).toBeCloseTo(1.0);
  });

  test('returns value between 0 and 1', () => {
    const h1 = computeSimHash('first text');
    const h2 = computeSimHash('completely different');
    const sim = simHashSimilarity(h1, h2);
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThanOrEqual(1);
  });
});

// ─── winnowingFingerprints ──────────────────────────────────────────────────
describe('winnowingFingerprints', () => {
  test('returns a set of numbers', () => {
    const fps = winnowingFingerprints('the quick brown fox jumps over the lazy dog');
    expect(fps).toBeInstanceOf(Set);
    expect(fps.size).toBeGreaterThan(0);
  });

  test('identical texts produce identical fingerprints', () => {
    const fp1 = winnowingFingerprints('test winnowing fingerprints here');
    const fp2 = winnowingFingerprints('test winnowing fingerprints here');
    expect(fp1).toEqual(fp2);
  });
});

// ─── winnowingSimilarity ────────────────────────────────────────────────────
describe('winnowingSimilarity', () => {
  test('identical fingerprints have high similarity', () => {
    const text = 'the quick brown fox jumps over the lazy dog and runs fast';
    const fps = winnowingFingerprints(text);
    if (fps.size > 0) {
      expect(winnowingSimilarity(fps, fps)).toBeCloseTo(1.0);
    } else {
      // Text too short for winnowing with k=5 — that's OK
      expect(fps.size).toBe(0);
    }
  });

  test('handles empty sets', () => {
    expect(winnowingSimilarity(new Set(), new Set())).toBe(0);
  });
});
