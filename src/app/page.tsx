import PlagiarismChecker from "@/components/PlagiarismChecker";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ShieldCheck, Zap, FileText, Search, Target, Users, BookOpen, AlertTriangle, Globe, Cpu, Lock, Award, Clock, BarChart3, GraduationCap, Briefcase, PenTool, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createPageMetadata, HOME_DESCRIPTION, HOME_TITLE, HOME_KEYWORDS, homeJsonLd, serializeJsonLd, FAQS } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: '/',
  keywords: HOME_KEYWORDS,
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
        Rich, server-rendered semantic HTML targeting high-intent keywords:
        "free plagiarism checker", "AI detector", "plagiarism checker for students",
        "check plagiarism online", "Turnitin alternative", "plagiarism checker no sign up",
        "ChatGPT detector", "paraphrase detector", "duplicate content checker",
        "best free plagiarism checker 2026", and 40+ long-tail variations.
      */}
      <article className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-black">
        {/* Why Scanterity */}
        <section className="mb-24" id="why-scanterity">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Why Choose Scanterity for Plagiarism Detection?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="neumorphic-extruded p-8">
              <ShieldCheck className="w-12 h-12 text-[#B794F6] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">Forensic-Level Accuracy</h3>
              <p className="text-gray-800 text-lg">
                Unlike basic <strong>free plagiarism checkers</strong> that only look for exact phrasing, Scanterity utilizes a proprietary multi-signal forensic engine with <strong>15 detection algorithms</strong>. It detects deep paraphrasing, structural similarities, and conceptual overlaps across billions of web pages and academic sources — making it the <strong>best free plagiarism checker</strong> available online.
              </p>
              <div className="mt-4">
                <Link href="/why-choose-us" className="text-[#9333ea] underline font-bold text-base hover:opacity-80 inline-flex items-center gap-1">
                  Compare our 15 forensic algorithms &rarr;
                </Link>
              </div>
            </div>

            <div className="neumorphic-extruded p-8 bg-[#FFE0E0]">
              <Zap className="w-12 h-12 text-[#FF6B6B] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">Advanced AI Content Detector</h3>
              <p className="text-gray-900 text-lg">
                With the rise of ChatGPT, Gemini, and Claude, traditional plagiarism tools fall short. Scanterity includes a built-in <strong>AI writing detector</strong> that analyzes 16 linguistic signals including perplexity, burstiness, lexical diversity, and sentence structure to identify <strong>AI-generated text</strong> with industry-leading precision. Our <strong>free ChatGPT detector</strong> catches content from GPT-4, GPT-4o, Claude, and Gemini.
              </p>
            </div>

            <div className="neumorphic-extruded p-8 bg-[#E0FFF0]">
              <FileText className="w-12 h-12 text-[#23C4A7] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">Professional PDF Reports</h3>
              <p className="text-gray-900 text-lg">
                Need to prove originality to a professor or client? Download a comprehensive forensic <strong>plagiarism report PDF</strong> instantly. Our reports include detailed source attributions, match percentages, confidence scores, algorithm breakdowns, and <strong>AI detection analysis</strong> — everything you need for academic integrity compliance.
              </p>
            </div>

            <div className="neumorphic-extruded p-8 bg-[#FFF0DD]">
              <Search className="w-12 h-12 text-[#FF9F43] mb-5" strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-3">No Sign-up Required</h3>
              <p className="text-gray-900 text-lg">
                We believe in frictionless access to essential academic tools. You don&apos;t need to create an account, verify an email, or enter credit card details. Just paste your text and <strong>check for plagiarism</strong> instantly. Scanterity is a truly <strong>free plagiarism checker without login</strong> — no strings attached.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-24" id="how-it-works">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            How Our Free Plagiarism Checker Works
          </h2>
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 neumorphic-extruded p-6 bg-white" id="step1">
              <div className="w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center font-black text-2xl bg-[#B794F6] shrink-0 shadow-[4px_4px_0_0_#000]">1</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Upload or Paste Your Document</h3>
                <p className="text-lg text-gray-800">Support for PDF, DOCX, and TXT files up to <strong className="bg-[#B794F6]/20 text-[#9333ea] px-2 py-0.5 rounded font-black whitespace-nowrap">15,000 words</strong>. You can also paste your essay, research paper, thesis, dissertation, or blog post directly into the editor for a fast <strong>plagiarism scan</strong>.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 neumorphic-extruded p-6 bg-white" id="step2">
              <div className="w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center font-black text-2xl bg-[#C0F7FE] shrink-0 shadow-[4px_4px_0_0_#000]">2</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Initiate the Forensic Scan</h3>
                <p className="text-lg text-gray-800">Click the scan button. Our engine breaks down your text, normalizes it to defeat evasion tricks, and cross-references it against a massive live database using <strong>7 search engines simultaneously</strong> — including Google, Bing, DuckDuckGo, Wikipedia, CrossRef, and Semantic Scholar for <strong>academic plagiarism detection</strong>.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 neumorphic-extruded p-6 bg-white" id="step3">
              <div className="w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center font-black text-2xl bg-[#90FFD0] shrink-0 shadow-[4px_4px_0_0_#000]">3</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Review Detailed Results &amp; Download Report</h3>
                <p className="text-lg text-gray-800">Get an exact breakdown of <strong>duplicate content</strong>, paraphrased sections, and potential AI-generated text. Every flagged sentence comes with a direct link to the original source, confidence scores, and the specific detection algorithm used. Download a comprehensive forensic PDF report for your records.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Capabilities — Keyword-rich section for "how does plagiarism detection work" queries */}
        <section className="mb-24" id="technology">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            How Our Plagiarism Detection Technology Works
          </h2>
          <p className="text-lg text-gray-800 mb-8 leading-relaxed">
            Scanterity&apos;s forensic engine goes far beyond simple <strong>copy-paste detection</strong>. Our proprietary <strong>15-algorithm cascade</strong> analyzes your document at multiple levels — from exact character sequences to deep semantic meaning — to catch plagiarism that other tools miss entirely.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neumorphic-extruded p-6 bg-white">
              <Cpu className="w-10 h-10 text-[#B794F6] mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-2">15-Algorithm Forensic Cascade</h3>
              <p className="text-[15px] text-gray-700">Our engine uses TF-IDF cosine similarity, n-gram shingling (3 to 7-gram), MinHash/LSH fingerprinting, SimHash, Winnowing, LCS analysis, edit distance, IDF-weighted overlap, stemmed Jaccard, sliding window matching, and weighted ensemble scoring to detect every form of <strong>plagiarism</strong> — from verbatim copying to sophisticated paraphrasing.</p>
            </div>
            <div className="neumorphic-extruded p-6 bg-white">
              <Globe className="w-10 h-10 text-[#23C4A7] mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-2">7-Engine Parallel Search</h3>
              <p className="text-[15px] text-gray-700">Scanterity queries Google, Bing, DuckDuckGo, Yahoo, Wikipedia, CrossRef, and Semantic Scholar in parallel — searching across billions of web pages, academic journals, research papers, and encyclopedias. Each engine is protected by circuit breakers for maximum reliability during your <strong>plagiarism check</strong>.</p>
            </div>
            <div className="neumorphic-extruded p-6 bg-white">
              <Lock className="w-10 h-10 text-[#FF6B6B] mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-2">Zero Data Retention</h3>
              <p className="text-[15px] text-gray-700">Your privacy matters. All documents are processed in volatile memory (RAM) and immediately wiped after analysis. We never store, index, or share your text with third parties. Unlike Turnitin, which adds your work to its database, Scanterity operates on a strict <strong>zero-retention policy</strong>.</p>
              <div className="mt-3">
                <Link href="/privacy" className="text-[#9333ea] underline font-bold text-[14px] hover:opacity-80 inline-flex items-center gap-1">
                  Read our privacy &amp; security architecture &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases — Targeting "plagiarism checker for students/teachers/writers" */}
        <section className="mb-24" id="use-cases">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Who is Scanterity For?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="neumorphic-extruded p-8 text-center bg-white">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#B794F6]" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-3">Students &amp; Researchers</h3>
              <p className="text-[15px] text-gray-700">Check your essays, research papers, theses, and dissertations before submission to avoid academic penalties. A powerful, <strong>free Turnitin alternative</strong> trusted by thousands of students worldwide. Our <strong>plagiarism checker for students</strong> supports documents up to 15,000 words with no sign-up required.</p>
            </div>
            <div className="neumorphic-extruded p-8 text-center bg-white">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#FF9F43]" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-3">Educators &amp; Teachers</h3>
              <p className="text-[15px] text-gray-700">Verify student submissions for originality. Catch subtle paraphrasing, reworded passages, and the unauthorized use of <strong>ChatGPT in assignments</strong>. Our <strong>AI content detector</strong> flags AI-generated text with 16 statistical signals, helping maintain <strong>academic integrity</strong>.</p>
            </div>
            <div className="neumorphic-extruded p-8 text-center bg-white">
              <Target className="w-12 h-12 mx-auto mb-4 text-[#23C4A7]" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-3">Writers, Bloggers &amp; SEOs</h3>
              <p className="text-[15px] text-gray-700">Ensure your content is 100% original to protect your search engine rankings and avoid Google penalties for <strong>duplicate content</strong>. Our <strong>online plagiarism checker</strong> helps content creators, copywriters, and SEO professionals publish with confidence.</p>
            </div>
          </div>
        </section>

        {/* Comparison Section — Targeting "Turnitin alternative", "Grammarly vs", "best plagiarism checker" */}
        <section className="mb-24" id="comparison">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Scanterity vs. Turnitin vs. Grammarly vs. Copyscape
          </h2>
          <p className="text-lg text-gray-800 mb-8 leading-relaxed">
            Wondering how Scanterity compares to paid <strong>plagiarism checkers</strong>? Here&apos;s a detailed comparison of the <strong>best plagiarism detection tools</strong> available in 2026:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px] md:text-[15px]">
              <thead>
                <tr className="border-b-[3px] border-black">
                  <th className="py-4 pr-4 font-black text-lg">Feature</th>
                  <th className="py-4 px-4 font-black text-lg bg-[#B794F6]/20">Scanterity</th>
                  <th className="py-4 px-4 font-bold">Turnitin</th>
                  <th className="py-4 px-4 font-bold">Grammarly</th>
                  <th className="py-4 px-4 font-bold">Copyscape</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">Price</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10 font-bold text-[#9333ea]">100% Free</td>
                  <td className="py-3 px-4">$3/student (institutional)</td>
                  <td className="py-3 px-4">$30/month (Premium)</td>
                  <td className="py-3 px-4">$0.05/search</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">AI Detection</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">✅ 16 signals</td>
                  <td className="py-3 px-4">✅ Basic</td>
                  <td className="py-3 px-4">❌ No</td>
                  <td className="py-3 px-4">❌ No</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">Algorithms</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">15 algorithms</td>
                  <td className="py-3 px-4">Proprietary</td>
                  <td className="py-3 px-4">Basic matching</td>
                  <td className="py-3 px-4">Fingerprinting</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">Sign-up Required</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">❌ No</td>
                  <td className="py-3 px-4">✅ Yes (institutional)</td>
                  <td className="py-3 px-4">✅ Yes</td>
                  <td className="py-3 px-4">✅ Yes</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">PDF Reports</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">✅ Free</td>
                  <td className="py-3 px-4">✅ Paid</td>
                  <td className="py-3 px-4">❌ No</td>
                  <td className="py-3 px-4">✅ Paid</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">Document Storage</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">Zero retention</td>
                  <td className="py-3 px-4">Adds to database</td>
                  <td className="py-3 px-4">Cloud stored</td>
                  <td className="py-3 px-4">Not stored</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 font-semibold">Word Limit</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">15,000 words</td>
                  <td className="py-3 px-4">Unlimited</td>
                  <td className="py-3 px-4">100,000 chars</td>
                  <td className="py-3 px-4">10,000 words</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold">Academic Databases</td>
                  <td className="py-3 px-4 bg-[#B794F6]/10">✅ CrossRef, Semantic Scholar</td>
                  <td className="py-3 px-4">✅ Extensive</td>
                  <td className="py-3 px-4">✅ Limited</td>
                  <td className="py-3 px-4">❌ Web only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[14px] text-gray-500 italic m-0">
              Comparison based on publicly available information as of October 2026. Features and pricing may vary.
            </p>
            <Link
              href="/why-choose-us"
              className="inline-flex items-center justify-center gap-2 bg-[#B794F6] text-black font-bold px-5 py-2.5 rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_#000] transition-all text-[14px] shrink-0"
            >
              See Full Why Scanterity Breakdown &rarr;
            </Link>
          </div>
        </section>

        {/* Statistics / Trust Signals */}
        <section className="mb-24" id="stats">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Trusted by Students and Educators Worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="neumorphic-extruded p-6 text-center bg-white">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-[#B794F6]" strokeWidth={2} />
              <div className="text-3xl md:text-4xl font-black text-black">15</div>
              <p className="text-[13px] text-gray-600 mt-1 font-semibold">Detection Algorithms</p>
            </div>
            <div className="neumorphic-extruded p-6 text-center bg-white">
              <Globe className="w-10 h-10 mx-auto mb-3 text-[#23C4A7]" strokeWidth={2} />
              <div className="text-3xl md:text-4xl font-black text-black">7</div>
              <p className="text-[13px] text-gray-600 mt-1 font-semibold">Search Engines</p>
            </div>
            <div className="neumorphic-extruded p-6 text-center bg-white">
              <Clock className="w-10 h-10 mx-auto mb-3 text-[#FF9F43]" strokeWidth={2} />
              <div className="text-3xl md:text-4xl font-black text-black">30s</div>
              <p className="text-[13px] text-gray-600 mt-1 font-semibold">Average Scan Time</p>
            </div>
            <div className="neumorphic-extruded p-6 text-center bg-white">
              <Award className="w-10 h-10 mx-auto mb-3 text-[#FF6B6B]" strokeWidth={2} />
              <div className="text-3xl md:text-4xl font-black text-black">16</div>
              <p className="text-[13px] text-gray-600 mt-1 font-semibold">AI Detection Signals</p>
            </div>
          </div>
        </section>

        {/* Deep Content Section — What is Plagiarism? (Targeting informational queries) */}
        <section className="mb-24" id="what-is-plagiarism">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            What Is Plagiarism and Why Does It Matter?
          </h2>
          <div className="space-y-6 text-lg text-gray-800 leading-relaxed">
            <p>
              <strong>Plagiarism</strong> is the act of using someone else&apos;s words, ideas, or creative work without proper attribution, presenting them as your own. It ranges from direct <strong>copy-paste plagiarism</strong> to more subtle forms like <strong>paraphrasing plagiarism</strong>, mosaic plagiarism (patchwork writing), and even self-plagiarism (reusing your own previously submitted work).
            </p>
            <p>
              In academic settings, plagiarism can result in failing grades, course expulsion, degree revocation, and permanent damage to your academic record. For professional writers, content marketers, and journalists, publishing plagiarized content can lead to legal action, SEO penalties from Google, loss of credibility, and career-ending consequences.
            </p>
            <p>
              With the rise of <strong>AI writing tools</strong> like ChatGPT, GPT-4, and Claude, a new challenge has emerged: <strong>AI-generated plagiarism</strong>. Students and writers may use AI to generate content that, while technically &quot;original,&quot; violates academic honesty policies. This is why modern <strong>plagiarism checkers</strong> need to include robust <strong>AI content detection</strong> — exactly what Scanterity provides.
            </p>
            <p>
              Using a reliable <strong>free plagiarism checker online</strong> like Scanterity before submitting your work is the best way to protect yourself from unintentional plagiarism and ensure your content meets the highest standards of originality and academic integrity.
            </p>
          </div>
        </section>

        {/* Types of Plagiarism Section */}
        <section className="mb-24" id="types-of-plagiarism">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Types of Plagiarism Scanterity Detects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="neumorphic-extruded p-6 bg-white">
              <CheckCircle className="w-8 h-8 text-[#FF6B6B] mb-3" strokeWidth={2.5} />
              <h3 className="text-xl font-bold mb-2">Direct Plagiarism</h3>
              <p className="text-[15px] text-gray-700">Word-for-word copying of another&apos;s work without quotation marks or attribution. Our <strong>exact substring matching</strong> algorithm catches this with 100% confidence.</p>
            </div>
            <div className="neumorphic-extruded p-6 bg-white">
              <CheckCircle className="w-8 h-8 text-[#FF9F43] mb-3" strokeWidth={2.5} />
              <h3 className="text-xl font-bold mb-2">Paraphrasing Plagiarism</h3>
              <p className="text-[15px] text-gray-700">Rewriting someone&apos;s ideas in your own words without credit. Scanterity&apos;s <strong>stemmed Jaccard similarity</strong>, <strong>TF-IDF cosine analysis</strong>, and <strong>IDF-weighted overlap</strong> algorithms detect even heavily reworded passages.</p>
            </div>
            <div className="neumorphic-extruded p-6 bg-white">
              <CheckCircle className="w-8 h-8 text-[#23C4A7] mb-3" strokeWidth={2.5} />
              <h3 className="text-xl font-bold mb-2">Mosaic Plagiarism</h3>
              <p className="text-[15px] text-gray-700">Combining phrases from multiple sources into a patchwork of borrowed text. Our <strong>n-gram shingling</strong> (3 to 7-gram) and <strong>sliding window matching</strong> catch cross-boundary overlaps between sentences.</p>
            </div>
            <div className="neumorphic-extruded p-6 bg-white">
              <CheckCircle className="w-8 h-8 text-[#B794F6] mb-3" strokeWidth={2.5} />
              <h3 className="text-xl font-bold mb-2">AI-Generated Content</h3>
              <p className="text-[15px] text-gray-700">Text produced by <strong>ChatGPT</strong>, GPT-4, Gemini, or Claude. Our <strong>AI detector</strong> analyzes 16 signals including burstiness, perplexity, lexical diversity, contraction avoidance, and formulaic patterns to flag machine-written text.</p>
            </div>
          </div>
        </section>

        {/* FAQs — Synchronized byte-for-byte with JSON-LD FAQPage Schema */}
        <section className="mb-20" id="faq">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-black mb-10 border-b-[3px] border-black pb-4">
            Frequently Asked Questions About Scanterity
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, index) => (
              <div key={index} className="neumorphic-extruded p-8 bg-white">
                <h3 className="text-2xl font-bold mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-10 text-center" id="cta">
          <div className="neumorphic-extruded p-10 md:p-16 bg-[#B794F6]/10">
            <h2 className="text-[28px] md:text-[40px] font-black mb-4">Ready to Check Your Document?</h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Join thousands of students, teachers, and writers who trust Scanterity as their go-to <strong>free plagiarism checker</strong> and <strong>AI detector</strong>. No sign-up, no credit card, no limits.
            </p>
            <Link href="/" className="inline-block bg-black text-white px-8 py-4 font-bold text-lg border-[3px] border-black shadow-[4px_4px_0_0_#B794F6] hover:shadow-[6px_6px_0_0_#B794F6] transition-shadow cursor-pointer" style={{ borderRadius: '8px', textDecoration: 'none' }}>
              Start Free Plagiarism Check →
            </Link>
          </div>
        </section>
      </article>

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
              <Link href="/why-choose-us" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Why Scanterity</Link>
              <Link href="/privacy" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
              <Link href="/compliance" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Compliance</Link>
              <Link href="/contact" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Contact</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href="mailto:hello@scanterity.com" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Contact us via Email">
                  <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </a>
              </div>
            </nav>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#888', margin: 0 }}>
              &copy; {new Date().getFullYear()} Scanterity Forensic Systems. All rights reserved. | Free Plagiarism Checker &amp; AI Detector
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
    </main>
  );
}
