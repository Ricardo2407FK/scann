import PlagiarismChecker from "@/components/PlagiarismChecker";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ShieldCheck, Zap, FileText, Search, Target, Users, BookOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createPageMetadata, HOME_DESCRIPTION, HOME_TITLE, homeJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: '/',
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd) }}
      />
      {/* Main App Component */}
      <ErrorBoundary>
        <PlagiarismChecker />
      </ErrorBoundary>

      {/* 
        ======================================================================
        SEO CONTENT MARKETING SECTION
        ======================================================================
        This block provides rich, server-rendered semantic HTML (H2, H3, P)
        optimized for high-intent keywords like "free plagiarism checker",
        "AI detector", "plagiarism checker for students", etc.
      */}
      <article className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-black">
        {/* Why Scanterity */}
        <section className="mb-24">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Why Choose Scanterity for Plagiarism Detection?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="neumorphic-extruded p-8">
              <ShieldCheck className="w-12 h-12 text-[#B794F6] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">Forensic-Level Accuracy</h3>
              <p className="text-gray-800 text-lg">
                Unlike basic <strong>free plagiarism checkers</strong> that only look for exact phrasing, Scanterity utilizes a proprietary multi-signal forensic engine. It detects deep paraphrasing, structural similarities, and conceptual overlaps across billions of web pages and academic sources.
              </p>
            </div>

            <div className="neumorphic-extruded p-8 bg-[#FFE0E0]">
              <Zap className="w-12 h-12 text-[#FF6B6B] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">Advanced AI Content Detector</h3>
              <p className="text-gray-900 text-lg">
                With the rise of ChatGPT, Gemini, and Claude, traditional plagiarism tools fall short. Scanterity includes a built-in <strong>AI writing detector</strong> that analyzes perplexity and burstiness to identify AI-generated text with industry-leading precision.
              </p>
            </div>

            <div className="neumorphic-extruded p-8 bg-[#E0FFF0]">
              <FileText className="w-12 h-12 text-[#23C4A7] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">Professional PDF Reports</h3>
              <p className="text-gray-900 text-lg">
                Need to prove originality to a professor or client? Download a comprehensive forensic PDF report instantly. Our reports include detailed source attributions, match percentages, and confidence scores.
              </p>
            </div>

            <div className="neumorphic-extruded p-8 bg-[#FFF0DD]">
              <Search className="w-12 h-12 text-[#FF9F43] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">No Sign-up Required</h3>
              <p className="text-gray-900 text-lg">
                We believe in frictionless access to essential academic tools. You don&apos;t need to create an account, verify an email, or enter credit card details. Just paste your text and <strong>check for plagiarism</strong> instantly.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-24">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            How Our Free Plagiarism Checker Works
          </h2>
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 neumorphic-extruded p-6 bg-white">
              <div className="w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center font-black text-2xl bg-[#B794F6] shrink-0 shadow-[4px_4px_0_0_#000]">1</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Upload or Paste Your Document</h3>
                <p className="text-lg text-gray-800">Support for PDF, DOCX, and TXT files up to <strong className="bg-[#B794F6]/20 text-[#9333ea] px-2 py-0.5 rounded font-black whitespace-nowrap">15,000 words</strong>. You can also paste your essay, research paper, or blog post directly into the editor for a fast scan.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 neumorphic-extruded p-6 bg-white">
              <div className="w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center font-black text-2xl bg-[#C0F7FE] shrink-0 shadow-[4px_4px_0_0_#000]">2</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Initiate the Forensic Scan</h3>
                <p className="text-lg text-gray-800">Click the scan button. Our engine breaks down your text, normalizes it, and cross-references it against a massive live database of academic and web content in real-time.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 neumorphic-extruded p-6 bg-white">
              <div className="w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center font-black text-2xl bg-[#90FFD0] shrink-0 shadow-[4px_4px_0_0_#000]">3</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Review Detailed Results</h3>
                <p className="text-lg text-gray-800">Get an exact breakdown of duplicate content, paraphrased sections, and potential AI-generated text. Every flagged sentence comes with a direct link to the original source.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-24">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Who is Scanterity For?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="neumorphic-extruded p-8 text-center bg-white">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#B794F6]" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-3">Students</h3>
              <p className="text-[15px] text-gray-700">Check your essays and research papers before submission to avoid academic penalties. A powerful, free Turnitin alternative.</p>
            </div>
            <div className="neumorphic-extruded p-8 text-center bg-white">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#FF9F43]" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-3">Educators & Teachers</h3>
              <p className="text-[15px] text-gray-700">Verify student submissions for originality. Catch subtle paraphrasing and the unauthorized use of ChatGPT in assignments.</p>
            </div>
            <div className="neumorphic-extruded p-8 text-center bg-white">
              <Target className="w-12 h-12 mx-auto mb-4 text-[#23C4A7]" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-3">Writers & SEOs</h3>
              <p className="text-[15px] text-gray-700">Ensure your content is 100% original to protect your search engine rankings and avoid Google penalties for duplicate content.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-20">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="neumorphic-extruded p-8 bg-white">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <AlertTriangle className="text-[#FF6B6B] w-7 h-7" />
                Is this plagiarism checker actually free?
              </h3>
              <p className="text-gray-800 text-lg leading-relaxed">Yes, Scanterity is a <strong>100% free plagiarism checker online</strong>. There are no paywalls, no daily limits for reasonable use, and we never ask for your credit card. We sustain the platform through optional premium features for enterprise users.</p>
            </div>

            <div className="neumorphic-extruded p-8 bg-white">
              <h3 className="text-2xl font-bold mb-3">Do you save or steal my documents?</h3>
              <p className="text-gray-800 text-lg leading-relaxed">Absolutely not. We care about your privacy. All scans are processed in volatile memory (RAM) and immediately wiped after the session ends. Your work is never indexed, stored, or shared with third parties.</p>
            </div>

            <div className="neumorphic-extruded p-8 bg-white">
              <h3 className="text-2xl font-bold mb-3">Can it detect AI writing?</h3>
              <p className="text-gray-800 text-lg leading-relaxed">Yes. The Scanterity <strong>AI content detector</strong> is designed specifically to catch text generated by large language models like ChatGPT, GPT-4, and Claude. It flags unnatural linguistic patterns and low perplexity.</p>
            </div>

            <div className="neumorphic-extruded p-8 bg-white">
              <h3 className="text-2xl font-bold mb-3">How accurate is it compared to Turnitin or Grammarly?</h3>
              <p className="text-gray-800 text-lg leading-relaxed">Scanterity is designed to be highly competitive with premium tools like Turnitin and Grammarly. Our forensic engine uses deep semantic analysis to find paraphrased matches that many basic online checkers miss entirely.</p>
            </div>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1.5px solid #000', width: '100%', padding: '2.5rem 0', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1.25rem' }}>
            <img src="/Scanterity.png" alt="Scanterity Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-end', fontSize: '13px', fontWeight: 600, color: '#000', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/privacy" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
              <Link href="/compliance" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Compliance</Link>
              <Link href="/contact" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Contact</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Join our Discord">
                  <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                <a href="https://t.me/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Join our Telegram">
                  <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a href="mailto:hello@scanterity.com" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Contact us via Email">
                  <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#888', margin: 0 }}>&copy; {new Date().getFullYear()} Scanterity Forensic Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
