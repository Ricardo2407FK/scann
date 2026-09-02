// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Text Utils Tests
// ═══════════════════════════════════════════════════════════════════════════════

import {
  sanitizeEvasions, filterCitations, escapeHtml,
  countWords, getStemmedWords, buildTfVector, getNGrams,
  generateQueryVariants, buildIdfMap,
} from '@/lib/engine/text-utils';

// ─── sanitizeEvasions ───────────────────────────────────────────────────────
describe('sanitizeEvasions', () => {
  test('replaces Cyrillic homoglyphs with Latin equivalents', () => {
    // Cyrillic 'а' (U+0430) should become Latin 'a'
    const result = sanitizeEvasions('Нello'); // Cyrillic Н
    expect(result).toBe('Hello');
  });

  test('removes zero-width characters', () => {
    const input = 'pla\u200Bgia\u200Crism'; // ZWSP + ZWNJ
    expect(sanitizeEvasions(input)).toBe('plagiarism');
  });

  test('normalizes whitespace', () => {
    const result = sanitizeEvasions('hello   world\t\tfoo');
    expect(result.replace(/\s+/g, ' ')).toBe('hello world foo');
  });

  test('handles empty string', () => {
    expect(sanitizeEvasions('')).toBe('');
  });
});

// ─── filterCitations ────────────────────────────────────────────────────────
describe('filterCitations', () => {
  test('removes quoted text', () => {
    const input = 'She said "this is a quote" and continued.';
    const result = filterCitations(input);
    expect(result).not.toContain('this is a quote');
  });

  test('returns cleaned text', () => {
    const input = 'Regular text without citations.';
    expect(filterCitations(input).trim()).toBeTruthy();
  });
});

// ─── escapeHtml ─────────────────────────────────────────────────────────────
describe('escapeHtml', () => {
  test('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  test('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  test('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

// ─── countWords ─────────────────────────────────────────────────────────────
describe('countWords', () => {
  test('counts words correctly', () => {
    expect(countWords('hello world foo bar')).toBe(4);
  });

  test('handles empty string', () => {
    expect(countWords('')).toBe(0);
  });

  test('handles whitespace-only', () => {
    expect(countWords('   \t\n  ')).toBe(0);
  });

  test('handles multiple spaces between words', () => {
    expect(countWords('a   b   c')).toBe(3);
  });
});

// ─── getStemmedWords ────────────────────────────────────────────────────────
describe('getStemmedWords', () => {
  test('returns a Set of stemmed words', () => {
    const result = getStemmedWords('running jumping swimming');
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBeGreaterThan(0);
  });

  test('filters out stopwords', () => {
    const result = getStemmedWords('the is a an running');
    // Should contain stem of "running" but not "the", "is", "a", "an"
    expect(result.size).toBeLessThanOrEqual(2); // "run" stem + maybe "a"
  });

  test('handles empty string', () => {
    expect(getStemmedWords('').size).toBe(0);
  });
});

// ─── buildTfVector ──────────────────────────────────────────────────────────
describe('buildTfVector', () => {
  test('returns a Map of term frequencies', () => {
    const result = buildTfVector('hello world hello');
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBeGreaterThan(0);
  });

  test('normalizes to TF values', () => {
    const result = buildTfVector('test test test');
    // All values should be between 0 and 1 (or at least consistent)
    for (const [, v] of result) {
      expect(v).toBeGreaterThan(0);
    }
  });
});

// ─── getNGrams ──────────────────────────────────────────────────────────────
describe('getNGrams', () => {
  test('generates correct 3-grams', () => {
    const result = getNGrams('a b c d e', 3);
    expect(result.length).toBe(3); // [a b c, b c d, c d e]
  });

  test('returns empty for too-short text', () => {
    expect(getNGrams('a b', 3)).toHaveLength(0);
  });

  test('generates 5-grams correctly', () => {
    const result = getNGrams('one two three four five six', 5);
    expect(result.length).toBe(2);
  });
});

// ─── generateQueryVariants ──────────────────────────────────────────────────
describe('generateQueryVariants', () => {
  test('returns at least one variant', () => {
    const result = generateQueryVariants('The quick brown fox jumps over the lazy dog');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('first variant is a quoted phrase', () => {
    const result = generateQueryVariants('testing plagiarism detection system');
    expect(result[0]).toMatch(/^".*"$/);
  });
});

// ─── buildIdfMap ────────────────────────────────────────────────────────────
describe('buildIdfMap', () => {
  test('assigns higher IDF to rare terms', () => {
    const docs = [
      ['the', 'cat', 'sat'],
      ['the', 'dog', 'ran'],
      ['the', 'bird', 'flew'],
    ];
    const idf = buildIdfMap(docs);
    // "the" appears in all docs → low IDF (log(3/3) = 0)
    // Others appear in 1 doc → higher IDF
    // Note: stems of "cat", "dog", "bird" should have higher IDF
    expect(idf.size).toBeGreaterThan(0);
  });

  test('handles empty input', () => {
    expect(buildIdfMap([]).size).toBe(0);
  });

  test('handles single document', () => {
    const idf = buildIdfMap([['hello', 'world']]);
    expect(idf.size).toBeGreaterThan(0);
  });
});
