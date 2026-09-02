// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Fingerprinting (MinHash, SimHash, Winnowing)
// v6.0: 200-hash MinHash, bigram SimHash, 25-band LSH
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Configuration ────────────────────────────────────────────────────────────
const MINHASH_NUM_HASHES = 200;    // v6.0: was 128 — better Jaccard estimation
const LSH_BANDS = 25;              // v6.0: was 16 — more bands for finer candidate selection
const LSH_ROWS = MINHASH_NUM_HASHES / LSH_BANDS; // 8
const SIMHASH_BITS = 64;
const WINNOW_KGRAM = 5;
const WINNOW_WINDOW = 4;
const LARGE_PRIME = 4294967311;

// ─── Hash Utilities ─────────────────────────────────────────────────────────
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0x7FFFFFFF;
  }
  return hash;
}

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) & 0x7FFFFFFF;
  }
  return hash;
}

// ─── MinHash ────────────────────────────────────────────────────────────────

// Pre-computed hash coefficients (deterministic)
const HASH_COEFFICIENTS: [number, number][] = (() => {
  const coeffs: [number, number][] = [];
  let a = 1, b = 0;
  for (let i = 0; i < MINHASH_NUM_HASHES; i++) {
    a = ((a * 6364136223846793005) + 1442695040888963407) & 0x7FFFFFFF;
    b = ((b * 1103515245) + 12345) & 0x7FFFFFFF;
    coeffs.push([a % LARGE_PRIME, b % LARGE_PRIME]);
  }
  return coeffs;
})();

export function getWordShingles(text: string, k: number): Set<string> {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const shingles = new Set<string>();
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return shingles;
}

export function computeMinHash(shingles: Set<string>): Uint32Array {
  const sig = new Uint32Array(MINHASH_NUM_HASHES).fill(0xFFFFFFFF);
  if (shingles.size === 0) return sig;

  for (const shingle of shingles) {
    const h = simpleHash(shingle);
    for (let i = 0; i < MINHASH_NUM_HASHES; i++) {
      const [a, b] = HASH_COEFFICIENTS[i];
      const perm = ((a * h + b) % LARGE_PRIME) & 0x7FFFFFFF;
      if (perm < sig[i]) sig[i] = perm;
    }
  }
  return sig;
}

export function estimateJaccardFromMinHash(sig1: Uint32Array | number[], sig2: Uint32Array | number[]): number {
  if (sig1.length === 0) return 0;
  let matches = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) matches++;
  }
  return matches / sig1.length;
}

export function lshAreCandidates(sig1: Uint32Array | number[], sig2: Uint32Array | number[]): boolean {
  if (sig1.length === 0 || sig2.length === 0) return false;
  for (let band = 0; band < LSH_BANDS; band++) {
    const start = band * LSH_ROWS;
    let match = true;
    for (let r = 0; r < LSH_ROWS; r++) {
      if (sig1[start + r] !== sig2[start + r]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

// ─── SimHash (Charikar) ─────────────────────────────────────────────────────

/**
 * Compute a SimHash fingerprint for a text document.
 * v6.0: Uses word bigrams instead of unigrams for better locality sensitivity.
 * SimHash is locality-sensitive: similar documents produce similar hashes.
 */
export function computeSimHash(text: string): string {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return '0'.repeat(SIMHASH_BITS);

  const vector = new Array(SIMHASH_BITS).fill(0);

  // v6.0: Use bigrams for better locality sensitivity
  const features: string[] = [];
  for (let i = 0; i < words.length; i++) {
    features.push(words[i]); // unigram
    if (i < words.length - 1) features.push(`${words[i]} ${words[i + 1]}`); // bigram
  }

  for (const feature of features) {
    // Generate a SIMHASH_BITS-bit hash for each feature
    const h1 = simpleHash(feature);
    const h2 = fnv1a(feature);
    // Combine two 32-bit hashes to get ~64 bits
    const bits = h1.toString(2).padStart(32, '0') + h2.toString(2).padStart(32, '0');

    for (let i = 0; i < SIMHASH_BITS; i++) {
      vector[i] += bits[i] === '1' ? 1 : -1;
    }
  }

  return vector.map(v => (v >= 0 ? '1' : '0')).join('');
}

export function simHashDistance(hash1: string, hash2: string): number {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/**
 * SimHash similarity (0.0 to 1.0): 1.0 = identical, 0.0 = completely different.
 */
export function simHashSimilarity(hash1: string, hash2: string): number {
  const dist = simHashDistance(hash1, hash2);
  return 1.0 - (dist / SIMHASH_BITS);
}

// ─── Winnowing Algorithm (Stanford MOSS) ────────────────────────────────────

function rollingHash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h * 31) + text.charCodeAt(i)) & 0x7FFFFFFF;
  }
  return h;
}

export function winnowingFingerprints(text: string): Set<number> {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < WINNOW_KGRAM) return new Set();

  // Generate k-gram hashes
  const kgramHashes: number[] = [];
  for (let i = 0; i <= words.length - WINNOW_KGRAM; i++) {
    kgramHashes.push(rollingHash(words.slice(i, i + WINNOW_KGRAM).join(' ')));
  }

  if (kgramHashes.length === 0) return new Set();
  if (kgramHashes.length <= WINNOW_WINDOW) {
    return new Set([Math.min(...kgramHashes)]);
  }

  const fps = new Set<number>();
  let prevMinIdx = -1;

  for (let i = 0; i <= kgramHashes.length - WINNOW_WINDOW; i++) {
    let minIdx = i, minVal = kgramHashes[i];
    for (let j = 1; j < WINNOW_WINDOW; j++) {
      if (kgramHashes[i + j] <= minVal) {
        minVal = kgramHashes[i + j];
        minIdx = i + j;
      }
    }
    if (minIdx !== prevMinIdx) {
      fps.add(minVal);
      prevMinIdx = minIdx;
    }
  }
  return fps;
}

export function winnowingSimilarity(fp1: Set<number>, fp2: Set<number>): number {
  if (fp1.size === 0 || fp2.size === 0) return 0;
  let intersection = 0;
  for (const fp of fp1) { if (fp2.has(fp)) intersection++; }
  return intersection / Math.min(fp1.size, fp2.size);
}

// ─── Combined Document Fingerprint ──────────────────────────────────────────
export function computeDocumentFingerprint(text: string): string {
  if (!text) return '0'.repeat(SIMHASH_BITS);
  return computeSimHash(text);
}
