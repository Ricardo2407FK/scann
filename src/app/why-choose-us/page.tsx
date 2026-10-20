import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd, absoluteUrl } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, FileText, Search, Globe, Cpu, Lock, Award, Clock, BarChart3, GraduationCap, Briefcase, PenTool, CheckCircle, Target, Users, BookOpen, Database, Brain } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Why Choose Scanterity — Best Free Plagiarism Checker 2026',
  description: 'Discover why Scanterity is the best free plagiarism checker and AI detector in 2026. 15 detection algorithms, 7 search engines, AI detection, no sign-up. Free Turnitin & Grammarly alternative for students, teachers, and writers.',
  path: '/why-choose-us',
  keywords: [
    'best free plagiarism checker',
    'best plagiarism checker 2026',
    'free plagiarism checker for students',
    'Turnitin alternative free',
    'Grammarly alternative free',
    'plagiarism checker online free',
    'AI content detector free',
    'ChatGPT detector',
    'plagiarism checker no sign up',
    'best online plagiarism checker',
    'free plagiarism detector',
    'plagiarism checker for teachers',
    'academic plagiarism checker free',
    'essay plagiarism checker',
    'research paper plagiarism checker',
    'Scanterity',
  ],
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'Why Choose Scanterity', path: '/why-choose-us' },
]);

const whyChooseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': absoluteUrl('/why-choose-us#webpage'),
  url: absoluteUrl('/why-choose-us'),
  name: 'Why Choose Scanterity — Best Free Plagiarism Checker 2026',
  description: 'Discover why Scanterity is the best free plagiarism checker and AI detector. 15 algorithms, 7 search engines, AI detection, no sign-up required.',
  inLanguage: 'en',
  isPartOf: { '@id': absoluteUrl('/#website') },
};

export default function WhyChooseUsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(whyChooseJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-black font-semibold hover:text-[#9333ea] transition-colors">
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Scanner
          </Link>
        </div>

        <article className="text-black">
          {/* Hero */}
          <header className="mb-16">
            <h1 className="text-[36px] md:text-[56px] leading-tight font-black mb-6">
              Why Scanterity Is the Best Free Plagiarism Checker in 2026
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
              Scanterity is a <strong>free plagiarism checker and AI detector</strong> that uses forensic-grade technology to scan your documents against billions of web pages and academic sources. No sign-up, no credit card, no limits — just paste your text and get instant results.
            </p>
          </header>

          {/* Key Advantages */}
          <section className="mb-20">
            <h2 className="text-[28px] md:text-[40px] font-black mb-10 border-b-[3px] border-black pb-4">
              What Makes Scanterity Different From Other Plagiarism Checkers?
            </h2>

            <div className="space-y-10">
              <div className="neumorphic-extruded p-8 bg-white">
                <div className="flex items-start gap-4">
                  <Cpu className="w-10 h-10 text-[#B794F6] shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">15-Algorithm Forensic Analysis Engine</h3>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      Most <strong>free plagiarism checkers</strong> use a single algorithm — typically basic string matching. Scanterity runs <strong>15 different detection algorithms</strong> in a cascade: TF-IDF cosine similarity, 3-gram through 7-gram shingling, MinHash/LSH fingerprinting, 64-bit SimHash, Winnowing fingerprints, longest common subsequence (LCS), normalized edit distance, IDF-weighted word overlap, stemmed Jaccard similarity, sliding window matching, Dice coefficient, and a weighted ensemble score. This multi-layered approach catches every form of plagiarism — from exact copies to sophisticated paraphrasing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="neumorphic-extruded p-8 bg-[#FFE0E0]">
                <div className="flex items-start gap-4">
                  <Brain className="w-10 h-10 text-[#FF6B6B] shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">16-Signal AI Content Detection</h3>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      Our <strong>AI writing detector</strong> analyzes 16 distinct linguistic signals to identify content generated by ChatGPT, GPT-4, GPT-4o, Gemini, Claude, and other AI writing tools. Signals include: burstiness (sentence length uniformity — AI writes with unnaturally consistent lengths), perplexity proxy (word frequency distribution), lexical diversity (Type-Token Ratio), hapax legomena ratio (unique word usage), passive voice frequency, formulaic sentence starters, AI marker phrase detection (90+ known AI-overused phrases like &quot;delve into&quot;, &quot;it is worth noting&quot;, &quot;rich tapestry&quot;), contraction avoidance, paragraph coherence scoring, and more. This is the most comprehensive <strong>free AI detector</strong> available.
                    </p>
                  </div>
                </div>
              </div>

              <div className="neumorphic-extruded p-8 bg-[#E0FFF0]">
                <div className="flex items-start gap-4">
                  <Globe className="w-10 h-10 text-[#23C4A7] shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">7-Engine Parallel Search Across Academic &amp; Web Sources</h3>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      Scanterity doesn&apos;t rely on a single search engine. Every scan queries <strong>7 search engines simultaneously</strong>: Google, Bing, DuckDuckGo, Yahoo, Wikipedia API, CrossRef API (academic papers and DOIs), and Semantic Scholar API (research papers). Each engine is protected by individual circuit breakers with exponential backoff — ensuring maximum reliability even under heavy load. This gives our <strong>plagiarism scanner</strong> the broadest possible coverage across web content, academic journals, research papers, encyclopedias, and preprints.
                    </p>
                  </div>
                </div>
              </div>

              <div className="neumorphic-extruded p-8 bg-[#FFF0DD]">
                <div className="flex items-start gap-4">
                  <Lock className="w-10 h-10 text-[#FF9F43] shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">True Privacy — Zero Data Retention</h3>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      Unlike Turnitin, which adds every submitted paper to its proprietary database, Scanterity processes all documents in volatile memory (RAM) and immediately purges them after the scan. Your essays, research papers, and assignments are <strong>never stored, never indexed, and never shared</strong>. We operate on a strict zero-retention architecture, meaning your intellectual property remains yours. This makes Scanterity the safest <strong>plagiarism checker for students</strong> who are concerned about their work being added to a database.
                    </p>
                  </div>
                </div>
              </div>

              <div className="neumorphic-extruded p-8 bg-white">
                <div className="flex items-start gap-4">
                  <FileText className="w-10 h-10 text-[#B794F6] shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Comprehensive Forensic PDF Reports</h3>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      Every scan generates a downloadable forensic <strong>plagiarism report</strong> in PDF format — completely free. Reports include: overall plagiarism percentage, AI detection score, originality score, sentence-by-sentence analysis with highlighted matches, direct links to matched sources, confidence scores for each match, algorithm contribution breakdown, document fingerprint hash, heatmap visualization, and match type classification (exact, paraphrased, or conceptual). No other free tool provides this level of detail.
                    </p>
                  </div>
                </div>
              </div>

              <div className="neumorphic-extruded p-8 bg-white">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-10 h-10 text-[#23C4A7] shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Anti-Evasion Technology</h3>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      Students and bad actors try to fool plagiarism checkers by replacing characters with look-alike Unicode symbols (Cyrillic &quot;а&quot; for Latin &quot;a&quot;), inserting invisible zero-width characters, or using special whitespace. Scanterity&apos;s preprocessing engine strips <strong>60+ homoglyph substitutions</strong> (Cyrillic, Greek, Armenian, Cherokee, Mathematical, Full-width look-alikes), removes invisible Unicode control characters, normalizes whitespace, and strips Markdown/LaTeX formatting artifacts — before any analysis begins. This means plagiarism evasion tricks don&apos;t work against Scanterity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Who is it for */}
          <section className="mb-20">
            <h2 className="text-[28px] md:text-[40px] font-black mb-10 border-b-[3px] border-black pb-4">
              Who Uses Scanterity?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="neumorphic-extruded p-8 bg-white">
                <GraduationCap className="w-12 h-12 text-[#B794F6] mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold mb-3">University Students</h3>
                <p className="text-gray-700 text-[15px] leading-relaxed">Check essays, research papers, theses, and dissertations before submission. Avoid unintentional plagiarism and academic integrity violations. A <strong>free Turnitin alternative</strong> with no institutional access required.</p>
              </div>
              <div className="neumorphic-extruded p-8 bg-white">
                <BookOpen className="w-12 h-12 text-[#FF9F43] mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold mb-3">High School Students</h3>
                <p className="text-gray-700 text-[15px] leading-relaxed">Submit original homework and assignments with confidence. Our <strong>plagiarism checker for students</strong> is simple enough for anyone to use — just paste your text and click scan.</p>
              </div>
              <div className="neumorphic-extruded p-8 bg-white">
                <Users className="w-12 h-12 text-[#23C4A7] mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold mb-3">Teachers &amp; Professors</h3>
                <p className="text-gray-700 text-[15px] leading-relaxed">Verify student submissions for originality. Catch AI-generated assignments from ChatGPT. Our <strong>AI content detector</strong> uses 16 signals to flag machine-written text with high accuracy.</p>
              </div>
              <div className="neumorphic-extruded p-8 bg-white">
                <Briefcase className="w-12 h-12 text-[#FF6B6B] mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold mb-3">Content Marketers &amp; SEOs</h3>
                <p className="text-gray-700 text-[15px] leading-relaxed">Ensure your blog posts, articles, and web content are 100% original. Avoid Google penalties for <strong>duplicate content</strong> and protect your search engine rankings.</p>
              </div>
              <div className="neumorphic-extruded p-8 bg-white">
                <PenTool className="w-12 h-12 text-[#B794F6] mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold mb-3">Freelance Writers &amp; Journalists</h3>
                <p className="text-gray-700 text-[15px] leading-relaxed">Verify the originality of your work before publishing or submitting to clients. Download a professional PDF report as proof of originality. No subscription required.</p>
              </div>
              <div className="neumorphic-extruded p-8 bg-white">
                <Database className="w-12 h-12 text-[#FF9F43] mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold mb-3">Researchers &amp; Academics</h3>
                <p className="text-gray-700 text-[15px] leading-relaxed">Cross-reference your manuscripts against CrossRef and Semantic Scholar databases before journal submission. Our <strong>academic plagiarism checker</strong> covers millions of published papers and preprints.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-10 text-center">
            <div className="neumorphic-extruded p-10 md:p-16 bg-[#B794F6]/10">
              <h2 className="text-[28px] md:text-[40px] font-black mb-4">Try Scanterity Free — No Sign-Up Required</h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Join thousands of students, teachers, and professionals who trust Scanterity as the <strong>best free plagiarism checker</strong> available online.
              </p>
              <Link href="/" className="inline-block bg-black text-white px-8 py-4 font-bold text-lg border-[3px] border-black shadow-[4px_4px_0_0_#B794F6] hover:shadow-[6px_6px_0_0_#B794F6] transition-shadow" style={{ borderRadius: '8px', textDecoration: 'none' }}>
                Start Free Plagiarism Check →
              </Link>
            </div>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1.5px solid #000', width: '100%', padding: '2.5rem 0', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <Link href="/" aria-label="Scanterity Home">
                <img
                  src="/Scanterity.png"
                  alt="Scanterity Logo — Free Plagiarism Checker & AI Detector"
                  width={114}
                  height={38}
                  loading="lazy"
                  decoding="async"
                  style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                />
              </Link>
              <div style={{ height: '22px', width: '1.5px', background: '#ccc' }} aria-hidden="true" />
              <a
                href="https://arbovane.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Arbovane website (arbovane.com)"
                style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <img
                  src="/arbovane.png"
                  alt="Arbovane Logo"
                  width={114}
                  height={38}
                  loading="lazy"
                  decoding="async"
                  style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
                />
              </a>
            </div>
            <nav style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-end', fontSize: '13px', fontWeight: 600, color: '#000', alignItems: 'center', flexWrap: 'wrap' }} aria-label="Footer navigation">
              <Link href="/" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Scanner</Link>
              <Link href="/about" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>About</Link>
              <Link href="/privacy" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
              <Link href="/terms" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Terms</Link>
              <Link href="/compliance" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Compliance</Link>
              <Link href="/contact" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Contact</Link>
            </nav>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#888', margin: 0 }}>
              &copy; {new Date().getFullYear()} Scanterity Forensic Systems. All rights reserved.
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#888', margin: 0 }}>
              An{' '}
              <a
                href="https://arbovane.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}
              >
                Arbovane
              </a>{' '}
              Company
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
