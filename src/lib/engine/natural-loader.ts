// ═══════════════════════════════════════════════════════════════════════════════
// Lazy loader for 'natural' package
// Reason: 'natural' has ESM-only sub-dependencies (afinn-165) that crash
// when Vercel's Node v24 runtime tries to require() them at module load time.
// By using dynamic import(), we defer loading until first use, which works.
// ═══════════════════════════════════════════════════════════════════════════════

let _natural: Awaited<typeof import('natural')> | null = null;

export async function getNatural() {
  if (!_natural) {
    _natural = await import('natural');
  }
  return _natural;
}

// Pre-resolved stemmer for synchronous use after initialization
let _stemmer: typeof import('natural').PorterStemmer | null = null;
let _stopwords: string[] | null = null;

export async function getPorterStemmer() {
  if (!_stemmer) {
    const natural = await getNatural();
    _stemmer = natural.PorterStemmer;
  }
  return _stemmer;
}

export async function getStopwords() {
  if (!_stopwords) {
    const natural = await getNatural();
    _stopwords = natural.stopwords;
  }
  return _stopwords;
}

// Initialize all lazy singletons — call once at request start
export async function initNatural() {
  await getPorterStemmer();
  await getStopwords();
  return { stemmer: _stemmer!, stopwords: _stopwords! };
}
