// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Text Processing & Evasion Detection
// v6.0: Expanded homoglyphs, Markdown/LaTeX stripping, Unicode boundaries
// ═══════════════════════════════════════════════════════════════════════════════

import { initNatural, getPorterStemmer } from './natural-loader';

// ─── O(1) Stop-Word Lookup — lazy initialized ──────────────────────────────
let _STOP_WORDS: ReadonlySet<string> | null = null;
export async function getStopWords(): Promise<ReadonlySet<string>> {
  if (!_STOP_WORDS) {
    const { stopwords } = await initNatural();
    _STOP_WORDS = new Set(stopwords);
  }
  return _STOP_WORDS;
}
// Synchronous fallback for use after initialization
export const STOP_WORDS: ReadonlySet<string> = new Set([
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'yourself','yourselves','he','him','his','himself','she','her','hers',
  'herself','it','its','itself','they','them','their','theirs','themselves',
  'what','which','who','whom','this','that','these','those','am','is','are',
  'was','were','be','been','being','have','has','had','having','do','does',
  'did','doing','a','an','the','and','but','if','or','because','as','until',
  'while','of','at','by','for','with','about','against','between','through',
  'during','before','after','above','below','to','from','up','down','in',
  'out','on','off','over','under','again','further','then','once',
]);

// ─── Expanded Homoglyph Table (60+ substitutions) ───────────────────────────
const HOMOGLYPHS: Record<string, string> = {
  // Cyrillic → Latin
  'а': 'a', 'А': 'A', 'В': 'B', 'с': 'c', 'С': 'C', 'е': 'e', 'Е': 'E',
  'Н': 'H', 'і': 'i', 'ј': 'j', 'К': 'K', 'М': 'M', 'о': 'o', 'О': 'O',
  'р': 'p', 'Р': 'P', 'ѕ': 's', 'Т': 'T', 'у': 'y', 'х': 'x', 'Х': 'X',
  // Greek → Latin
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K',
  'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X',
  'ο': 'o', 'α': 'a', 'ε': 'e', 'ι': 'i', 'κ': 'k', 'ν': 'v', 'τ': 't',
  // Look-alike Latin Extended
  'ɑ': 'a', 'ɡ': 'g', 'ɾ': 'r', 'ԁ': 'd', 'ℓ': 'l', 'ⅰ': 'i', 'ⅱ': 'ii',
  // Mathematical symbols
  '𝐀': 'A', '𝐁': 'B', '𝐂': 'C', '𝐃': 'D', '𝐄': 'E',
  '𝑎': 'a', '𝑏': 'b', '𝑐': 'c', '𝑑': 'd', '𝑒': 'e',
  // Special whitespace → normal space
  '\u00A0': ' ', '\u2000': ' ', '\u2001': ' ', '\u2002': ' ', '\u2003': ' ',
  '\u2004': ' ', '\u2005': ' ', '\u2006': ' ', '\u2007': ' ', '\u2008': ' ',
  '\u2009': ' ', '\u200A': ' ', '\u202F': ' ', '\u205F': ' ', '\u3000': ' ',
  // Full-width → ASCII
  'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c',
  // v6.0: Armenian look-alikes
  'Օ': 'O', 'Ս': 'S', 'Տ': 'T', 'Ր': 'R', 'Ո': 'U',
  // v6.0: Cherokee look-alikes
  'Ꭰ': 'D', 'Ꭱ': 'R', 'Ꭲ': 'T', 'Ꭹ': 'Y', 'Ꭻ': 'A',
  'Ꮃ': 'W', 'Ꮐ': 'G', 'Ꮒ': 'h', 'Ꮓ': 'Z', 'Ꮟ': 'b',
  'Ꮢ': 'R', 'Ꮤ': 'C', 'Ꮪ': 'L', 'Ꮮ': 'P', 'Ꮯ': 'K',
};

// Pre-compile the evasion regex (avoids re-compilation on every call)
const INVISIBLE_CHARS_RE = /[\u200B-\u200F\u2028-\u2029\u2060-\u2064\u206A-\u206F\u00AD\u034F\uFEFF\u180E\u200E\u200F]/g;

/**
 * Sanitize text evasion techniques:
 * - Zero-width and invisible Unicode characters
 * - Homoglyph substitutions (Cyrillic, Greek, Math, Full-width)
 * - Whitespace normalization
 * - Soft hyphens and direction marks
 */
export function sanitizeEvasions(text: string): string {
  if (!text) return '';
  // Remove invisible / zero-width / control characters
  let clean = text.replace(INVISIBLE_CHARS_RE, '');
  // Replace homoglyphs (use Array.from for surrogate-pair safety with emoji/CJK)
  clean = Array.from(clean).map(ch => HOMOGLYPHS[ch] || ch).join('');
  // v6.0: Normalize tabs and newlines to spaces
  clean = clean.replace(/[\t\r\n]+/g, ' ');
  // Normalize whitespace runs
  clean = clean.replace(/\s+/g, ' ');
  // v6.0: Strip Markdown formatting
  clean = stripMarkdownLatex(clean);
  return clean;
}

/**
 * v6.0: Strip Markdown and LaTeX formatting artifacts.
 * Students often paste from Markdown/LaTeX sources with residual formatting.
 */
export function stripMarkdownLatex(text: string): string {
  if (!text) return '';
  let clean = text;
  // Remove Markdown bold/italic: **text** or __text__ or *text* or _text_
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  // Remove Markdown headers: # ## ### etc.
  clean = clean.replace(/^#{1,6}\s+/gm, '');
  // Remove Markdown links: [text](url) → text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove inline code: `code`
  clean = clean.replace(/`([^`]+)`/g, '$1');
  // Remove LaTeX inline math: $formula$ or \(formula\)
  clean = clean.replace(/\$([^$]+)\$/g, '$1');
  clean = clean.replace(/\\\(([^)]+)\\\)/g, '$1');
  // Remove LaTeX commands: \textbf{text} → text
  clean = clean.replace(/\\(?:textbf|textit|emph|underline)\{([^}]+)\}/g, '$1');
  return clean;
}

// Pre-compile footnote regex with lookbehind (with fallback for edge environments)
let FOOTNOTE_RE: RegExp | null = null;
try {
  FOOTNOTE_RE = new RegExp('(?<=\w)[¹²³⁴⁵⁶⁷⁸⁹⁰]+', 'g');
} catch {
  // Lookbehind not supported — use a simpler pattern
  FOOTNOTE_RE = /[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g;
}

/**
 * Remove properly cited / quoted text so we don't penalize legitimate citations.
 */
export function filterCitations(text: string): string {
  if (!text) return '';
  let cleaned = text;
  // Remove double-quoted text
  cleaned = cleaned.replace(/"[^"]{5,}"/g, '');
  // Remove smart-quoted text
  cleaned = cleaned.replace(/\u201C[^\u201D]{5,}\u201D/g, '');
  // Remove academic inline citations: (Author, Year) or (Author et al., Year)
  cleaned = cleaned.replace(/\([A-Z][a-z]+(?:\s(?:et\s+al\.?|and|&)\s+[A-Z][a-z]+)*,?\s*\d{4}[a-z]?\)/g, '');
  // Remove numbered citations: [1] or [1, 2, 3]
  cleaned = cleaned.replace(/\[\d+(?:[,;\s]+\d+)*\]/g, '');
  // Remove footnote markers: superscript-like patterns
  if (FOOTNOTE_RE) {
    FOOTNOTE_RE.lastIndex = 0;
    cleaned = cleaned.replace(FOOTNOTE_RE, '');
  }
  return cleaned;
}

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extract stemmed, stop-word-filtered word set from text.
 * Uses O(1) Set lookup instead of O(n) array scan.
 */
export async function getStemmedWords(text: string): Promise<Set<string>> {
  if (!text) return new Set();
  const stemmer = await getPorterStemmer();
  return new Set(
    text.toLowerCase().split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
      .map(w => stemmer.stem(w))
  );
}

/**
 * Build normalized TF vector (stemmed, stop-word-filtered).
 * Uses O(1) Set lookup instead of O(n) array scan.
 */
export async function buildTfVector(text: string): Promise<Map<string, number>> {
  if (!text) return new Map();
  const stemmer = await getPorterStemmer();
  const words = text.toLowerCase().split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .map(w => stemmer.stem(w));

  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) || 0) + 1);

  const len = words.length || 1;
  for (const [k, v] of tf) tf.set(k, v / len);
  return tf;
}

/**
 * Build IDF map from a corpus of documents (arrays of words).
 * Uses O(1) Set lookup instead of O(n) array scan.
 */
export async function buildIdfMap(documents: string[][]): Promise<Map<string, number>> {
  if (!documents || documents.length === 0) return new Map();
  const stemmer = await getPorterStemmer();
  const N = documents.length;
  const df = new Map<string, number>();

  for (const doc of documents) {
    const seen = new Set<string>();
    for (const w of doc) {
      const lower = w.toLowerCase();
      const stem = stemmer.stem(lower);
      if (!seen.has(stem) && stem.length > 2 && !STOP_WORDS.has(lower)) {
        seen.add(stem);
        df.set(stem, (df.get(stem) || 0) + 1);
      }
    }
  }

  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((N + 1) / (count + 1)) + 1);
  }
  return idf;
}

/**
 * Extract N-grams from text.
 */
export function getNGrams(text: string, n: number): string[] {
  if (!text || n < 1) return [];
  const words = text.split(/\s+/);
  if (words.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Group sentences into paragraphs of ~size sentences.
 */
export function groupIntoParagraphs(sentences: string[], size: number = 5): string[][] {
  if (!sentences || sentences.length === 0) return [];
  const paragraphs: string[][] = [];
  for (let i = 0; i < sentences.length; i += size) {
    paragraphs.push(sentences.slice(i, i + size));
  }
  return paragraphs;
}

/**
 * Generate query variants for a probe sentence:
 * 1. Exact phrase (quoted)
 * 2. Key terms only (high-IDF words)
 * Uses O(1) Set lookup instead of O(n) array scan.
 */
export function generateQueryVariants(sentence: string): string[] {
  if (!sentence) return [];
  const words = sentence.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];
  const variants: string[] = [];

  // Variant 1: Exact phrase (quoted, truncated to 32 words for search engines)
  const truncated = words.slice(0, 32).join(' ');
  variants.push(`"${truncated}"`);

  // Variant 2: Key terms (remove stop words, take top unique words)
  const keyTerms = words
    .filter(w => !STOP_WORDS.has(w.toLowerCase()) && w.length > 3)
    .slice(0, 10)
    .join(' ');
  if (keyTerms.length > 10) variants.push(keyTerms);

  // v6.0 Variant 3: Partial phrase — a distinctive 5-6 word window
  // Catches paraphrased content that exact-phrase and keyword searches miss
  if (words.length >= 8) {
    const contentWords = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
    if (contentWords.length >= 5) {
      const partialPhrase = `"${contentWords.slice(0, 6).join(' ')}"`;
      if (!variants.includes(partialPhrase)) variants.push(partialPhrase);
    }
  }

  return variants;
}
