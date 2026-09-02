// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v5.0 — Core Types
// ═══════════════════════════════════════════════════════════════════════════════

export type SearchResult = { url: string; snippet: string };
export type SourceText = { url: string; pageText: string; reliability: number };
export type ReportSource = { url: string; matchPercentage: number; domain: string; reliability: string };

export type MatchResult = {
  matched: boolean;
  bestSnippet: string;
  matchType: string;
  confidence: number;
  algorithm: string;
};

export type SentenceMatch = {
  index: number;
  sentence: string;
  matched: boolean;
  matchType: string;
  confidence: number;
  algorithm: string;
  urls: string[];
  snippets: string[];
};

export type AISignal = {
  name: string;
  score: number;
  maxScore: number;
  description: string;
};

export type AIAnalysis = {
  overallScore: number;
  signals: AISignal[];
  verdict: string;
};

export type AlgorithmContribution = {
  name: string;
  matchCount: number;
  color: string;
};

export type ReportStats = {
  totalWords: number;
  totalSentences: number;
  eligibleSentences: number;
  uniqueSources: number;
  avgConfidence: number;
  matchBreakdown: { exact: number; paraphrase: number; conceptual: number };
  algorithmContributions: AlgorithmContribution[];
  documentFingerprint: string;
};

export type Report = {
  score: number;
  aiScore: number;
  originalityScore: number;
  highlightedText: string;
  sources: ReportSource[];
  stats: ReportStats;
  heatmap: number[];
  aiAnalysis: AIAnalysis;
  blockCount: number;
  matches: SentenceMatch[];
};

export type StreamPayload =
  | { type: 'status'; message: string; step?: number; totalSteps?: number; partialMatches?: number }
  | { type: 'error'; message: string }
  | { type: 'result'; report: Report };

export type ActiveViewer = {
  text: string;
  snippets: string[];
  urls: string[];
  matchType: string;
  confidence: string;
  algorithm: string;
};

