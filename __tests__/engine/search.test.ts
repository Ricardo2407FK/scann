// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Search Module Tests
// Tests source reliability classification and cache functionality.
//
// Note: The search module imports jsdom/cheerio/axios which have deep ESM
// dependency chains. We mock those modules to keep tests fast and focused
// on the pure logic we want to verify.
// ═══════════════════════════════════════════════════════════════════════════════

// Mock heavy dependencies that cause ESM issues in Jest
jest.mock('cheerio', () => ({ load: jest.fn() }));
jest.mock('axios', () => ({ default: { get: jest.fn() } }));
jest.mock('jsdom', () => ({ JSDOM: jest.fn() }));
jest.mock('@mozilla/readability', () => ({ Readability: jest.fn() }));

import { classifySourceReliability, pageCache, searchCache } from '@/lib/engine/search';

// ─── classifySourceReliability ──────────────────────────────────────────────
describe('classifySourceReliability', () => {
  test('rates .edu domains as institutional', () => {
    const result = classifySourceReliability('https://stanford.edu/paper.html');
    expect(result.label).toBe('Institutional');
    expect(result.reliability).toBeGreaterThanOrEqual(0.9);
  });

  test('rates .gov domains as institutional', () => {
    const result = classifySourceReliability('https://cdc.gov/health-data');
    expect(result.label).toBe('Institutional');
    expect(result.reliability).toBeGreaterThanOrEqual(0.9);
  });

  test('rates Wikipedia as encyclopedic', () => {
    const result = classifySourceReliability('https://en.wikipedia.org/wiki/Machine_learning');
    expect(result.label).toBe('Encyclopedia');
    expect(result.reliability).toBeGreaterThanOrEqual(0.8);
  });

  test('rates other domains as web', () => {
    const result = classifySourceReliability('https://medium.com/article');
    expect(result.label).toBe('Web');
    expect(result.reliability).toBeLessThanOrEqual(0.7);
  });

  test('rates academic publishers correctly', () => {
    expect(classifySourceReliability('https://doi.org/10.1234/test').label).toBe('Academic');
    expect(classifySourceReliability('https://arxiv.org/abs/1234.5678').label).toBe('Academic');
    expect(classifySourceReliability('https://ncbi.nlm.nih.gov/pubmed').label).toBe('Academic');
  });

  test('rates news domains correctly', () => {
    const result = classifySourceReliability('https://reuters.com/article/test');
    expect(result.label).toBe('News');
    expect(result.reliability).toBeGreaterThanOrEqual(0.7);
  });

  test('rates .org domains as organization', () => {
    const result = classifySourceReliability('https://example.org/about');
    expect(result.label).toBe('Organization');
    expect(result.reliability).toBeGreaterThanOrEqual(0.6);
  });

  test('handles invalid URLs gracefully', () => {
    const result = classifySourceReliability('not-a-valid-url');
    expect(result.label).toBe('Unknown');
    expect(result.reliability).toBe(0.5);
  });

  test('handles empty string', () => {
    const result = classifySourceReliability('');
    expect(result.label).toBe('Unknown');
    expect(result.reliability).toBe(0.5);
  });

  test('academic domains have highest reliability', () => {
    const academic = classifySourceReliability('https://arxiv.org/abs/1234.5678');
    const web = classifySourceReliability('https://random-blog.com/post');
    expect(academic.reliability).toBeGreaterThan(web.reliability);
  });

  test('rates .ac.uk domains as institutional', () => {
    const result = classifySourceReliability('https://ox.ac.uk/research');
    expect(result.label).toBe('Institutional');
    expect(result.reliability).toBeGreaterThanOrEqual(0.9);
  });

  test('rates Britannica as encyclopedic', () => {
    const result = classifySourceReliability('https://britannica.com/topic/test');
    expect(result.label).toBe('Encyclopedia');
  });
});

// ─── LRU Cache Instances ────────────────────────────────────────────────────
describe('Cache instances', () => {
  test('pageCache is initialized and functional', () => {
    expect(pageCache.size).toBeGreaterThanOrEqual(0);
    expect(typeof pageCache.memoryUsage).toBe('number');
    expect(typeof pageCache.hits).toBe('number');
    expect(typeof pageCache.misses).toBe('number');
  });

  test('searchCache is initialized and functional', () => {
    expect(searchCache.size).toBeGreaterThanOrEqual(0);
    expect(typeof searchCache.memoryUsage).toBe('number');
    expect(typeof searchCache.hits).toBe('number');
    expect(typeof searchCache.misses).toBe('number');
  });

  test('pageCache hit/miss tracking works', () => {
    const initialMisses = pageCache.misses;
    pageCache.get('nonexistent-key-for-test');
    expect(pageCache.misses).toBe(initialMisses + 1);
  });

  test('searchCache hit/miss tracking works', () => {
    const initialMisses = searchCache.misses;
    searchCache.get('nonexistent-key-for-test-2');
    expect(searchCache.misses).toBe(initialMisses + 1);
  });
});
