// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — AI Detection Tests (14 Signals)
// ═══════════════════════════════════════════════════════════════════════════════

import { analyzeAIContent } from '@/lib/engine/ai-detection';
import { SentenceTokenizer } from 'natural';

// ─── Helper: tokenize text into sentences ───────────────────────────────────
function tokenize(text: string): string[] {
  return new SentenceTokenizer([]).tokenize(text).map(s => s.trim()).filter(Boolean);
}

// ─── Helper Texts ───────────────────────────────────────────────────────────
const HUMAN_TEXT = `
I went to the store yesterday and bought some groceries. The weather was pretty nice, 
though a bit windy. My neighbor's cat was sitting on the fence again — she does that 
every morning. I think it's because she likes watching the birds. Anyway, I got home 
and realized I forgot the milk. Happens every time! So I had to go back, which was 
annoying but at least the drive is short. Later that evening, my friend called and 
we talked for about an hour. She's planning a trip to Iceland next month and is super 
excited about seeing the Northern Lights. I've always wanted to visit there too but 
never got around to booking anything. Maybe next year I'll finally do it. The rest 
of the night was pretty quiet — I just watched some TV and went to bed early. Nothing 
too exciting, but sometimes boring days are the best days.
`;

const AI_TEXT = `
In the realm of modern technological innovation, artificial intelligence has emerged 
as a transformative force that is reshaping the very fabric of our society. It is 
important to note that the implications of this technology are far-reaching and 
multifaceted. Furthermore, the integration of machine learning algorithms into 
various sectors has demonstrated remarkable potential for enhancing productivity 
and efficiency. Additionally, it is worth considering the ethical dimensions that 
accompany these advancements. Moreover, the landscape of artificial intelligence 
continues to evolve at an unprecedented pace, presenting both opportunities and 
challenges. In conclusion, it is essential to approach this technological revolution 
with a balanced perspective that considers both innovation and responsibility. 
Furthermore, delving into the nuances of AI governance reveals a complex tapestry 
of regulatory frameworks. It is crucial to navigate these complexities with care 
and consideration. Moreover, the intersection of technology and society presents 
a myriad of possibilities for positive transformation.
`;

// ─── analyzeAIContent ───────────────────────────────────────────────────────
describe('analyzeAIContent', () => {
  const humanSentences = tokenize(HUMAN_TEXT);
  const aiSentences = tokenize(AI_TEXT);

  test('returns an object with required fields', () => {
    const result = analyzeAIContent(humanSentences);
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('signals');
    expect(result).toHaveProperty('verdict');
    expect(Array.isArray(result.signals)).toBe(true);
  });

  test('score is between 0 and 100', () => {
    const result = analyzeAIContent(humanSentences);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  test('human-written text gets a lower score', () => {
    const result = analyzeAIContent(humanSentences);
    // Human text should score below 50
    expect(result.overallScore).toBeLessThan(50);
  });

  test('AI-generated text gets a higher score', () => {
    const result = analyzeAIContent(aiSentences);
    // AI text should score above 30 at minimum
    expect(result.overallScore).toBeGreaterThan(30);
  });

  test('AI text scores higher than human text', () => {
    const human = analyzeAIContent(humanSentences);
    const ai = analyzeAIContent(aiSentences);
    expect(ai.overallScore).toBeGreaterThan(human.overallScore);
  });

  test('returns exactly 16 signals', () => {
    const result = analyzeAIContent(humanSentences);
    expect(result.signals).toHaveLength(16);
  });

  test('each signal has required fields', () => {
    const result = analyzeAIContent(humanSentences);
    for (const signal of result.signals) {
      expect(signal).toHaveProperty('name');
      expect(signal).toHaveProperty('score');
      expect(signal).toHaveProperty('maxScore');
      expect(signal).toHaveProperty('description');
      expect(typeof signal.name).toBe('string');
      expect(typeof signal.score).toBe('number');
      expect(typeof signal.maxScore).toBe('number');
      expect(signal.score).toBeGreaterThanOrEqual(0);
      expect(signal.score).toBeLessThanOrEqual(signal.maxScore);
    }
  });

  test('verdict is one of the expected values', () => {
    const result = analyzeAIContent(humanSentences);
    expect([
      'Almost certainly human-written',
      'Likely human-written',
      'Possibly AI-assisted',
      'Probably AI-generated',
      'Very likely AI-generated',
    ]).toContain(result.verdict);
  });

  test('handles very short text gracefully', () => {
    // Less than 3 sentences → returns early with 0 score
    const result = analyzeAIContent(['Short.', 'Two.']);
    expect(result).toHaveProperty('overallScore');
    expect(result.overallScore).toBe(0);
  });

  test('handles empty array', () => {
    const result = analyzeAIContent([]);
    expect(result).toHaveProperty('overallScore');
    expect(result.overallScore).toBe(0);
  });

  test('max scores sum to 124', () => {
    const result = analyzeAIContent(humanSentences);
    const totalMax = result.signals.reduce((sum, s) => sum + s.maxScore, 0);
    expect(totalMax).toBe(124);
  });
});
