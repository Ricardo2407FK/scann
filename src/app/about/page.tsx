import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd, absoluteUrl } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Award, Cpu, Globe, CheckCircle, Mail, Sparkles, Lock, BookOpen } from 'lucide-react';
import styles from '../privacy/PrivacyPolicy.module.css';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata = createPageMetadata({
  title: 'About Us',
  description: 'Learn about Scanterity, our mission in academic integrity, our 15-algorithm forensic detection engine, zero-retention privacy standards, and team.',
  path: '/about',
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'About Us', path: '/about' },
]);

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': absoluteUrl('/about#webpage'),
  url: absoluteUrl('/about'),
  name: 'About Scanterity — Forensic Plagiarism Detection & AI Analysis',
  description: 'Learn about Scanterity, our mission in academic integrity, our 15-algorithm forensic detection engine, zero-retention privacy standards, and team.',
  inLanguage: 'en',
  mainEntity: {
    '@type': 'Organization',
    name: 'Scanterity Forensic Systems',
    url: absoluteUrl('/'),
    parentOrganization: {
      '@type': 'Organization',
      name: 'Arbovane',
      url: 'https://arbovane.com',
    },
    email: 'hello@scanterity.com',
  },
};

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <ScrollToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutJsonLd) }}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.backButtonContainer}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Scanner
          </Link>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>About Scanterity</h1>
          <div className={styles.lastUpdated}>Forensic Systems &amp; Academic Integrity</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <Sparkles className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Our Mission:</strong> To provide students, educators, and professional writers with forensic-grade plagiarism and AI content detection — completely free, accessible to all, and built with an uncompromising commitment to user privacy and intellectual property protection.
            </p>
          </div>

          {/* Section 1: Who We Are */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Users size={18} strokeWidth={2.5} /></div>
              1. Who We Are
            </h2>
            <p className={styles.text}>
              <strong>Scanterity</strong> is an advanced forensic text analysis platform engineered by <strong>Scanterity Forensic Systems</strong>, a technology initiative by <strong>Arbovane</strong>. Developed by natural language processing researchers, software engineers, and digital forensics specialists, Scanterity was founded to solve a critical inequality in academic technology: students and independent researchers deserve access to the same institutional-grade plagiarism analysis tools that universities use, without being forced behind expensive paywalls or having their intellectual property secretly stored in corporate repositories.
            </p>
            <p className={styles.text}>
              Today, Scanterity serves thousands of students, teachers, university faculty, journalists, and content authors worldwide, analyzing essays, research papers, dissertations, and technical articles with industry-leading precision.
            </p>
          </section>

          {/* Section 2: Why We Built Scanterity */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><BookOpen size={18} strokeWidth={2.5} /></div>
              2. The Academic Integrity Challenge
            </h2>
            <p className={styles.text}>
              Modern writing verification faces unprecedented challenges. The proliferation of web content and generative AI models (ChatGPT, GPT-4, Claude, Gemini) has made simplistic keyword-matching tools obsolete. Furthermore, legacy institutional services routinely save student submissions into centralized databases, inadvertently subjecting honest students to future false-positive flags if their drafts are shared across institutions.
            </p>
            <p className={styles.text}>
              Scanterity was built to champion two foundational principles:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Privacy-First Architecture:</strong> Documents submitted to Scanterity are processed ephemerally in volatile memory (RAM) and are never stored in a persistent submission repository or sold. Short representative search phrases are sent over HTTPS to external search and academic APIs strictly for source comparison.</li>
              <li className={styles.listItem}><strong>Multi-Signal Analysis:</strong> Instead of relying on a single string-comparison check, Scanterity runs a 15-algorithm similarity cascade alongside a 16-signal probabilistic AI linguistic analyzer to help users review potential verbatim matches, paraphrasing, and machine-like patterns.</li>
            </ul>
          </section>

          {/* Section 3: Technology & Engineering */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Cpu size={18} strokeWidth={2.5} /></div>
              3. Technology &amp; Engineering
            </h2>
            <p className={styles.text}>
              Our engine combines computational linguistics with parallel distributed search across academic repositories and web engines:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>15-Algorithm Forensic Cascade:</strong> Including TF-IDF cosine similarity, n-gram shingling (3-gram to 7-gram), MinHash/LSH locality-sensitive hashing, 64-bit SimHash, Winnowing fingerprints, longest common subsequence (LCS), edit distance, stemmed Jaccard, and weighted ensemble scoring.</li>
              <li className={styles.listItem}><strong>Anti-Evasion Normalization:</strong> Our preprocessor detects and eliminates over 60 homoglyph substitutions (Cyrillic, Greek, mathematical look-alikes), zero-width characters, and formatting tricks commonly used in evasion attempts.</li>
              <li className={styles.listItem}><strong>7-Engine Parallel Search:</strong> Scanning concurrently across Google, Bing, DuckDuckGo, Yahoo, Wikipedia, CrossRef (DOIs and scientific papers), and Semantic Scholar.</li>
              <li className={styles.listItem}><strong>16-Signal AI Detection:</strong> Evaluating burstiness, perplexity variance, vocabulary entropy, and formulaic syntax patterns to differentiate authentic human voice from LLM outputs.</li>
            </ul>
          </section>

          {/* Section 4: Ethical Commitments */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Shield size={18} strokeWidth={2.5} /></div>
              4. Ethical Commitments &amp; Standards
            </h2>
            <p className={styles.text}>
              Scanterity is strictly an analytical aid to foster originality and academic honesty. We adhere to high ethical and editorial standards:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Pro-Integrity Mission:</strong> We do not offer essay spinning, rewriting tools designed to bypass detection, or services that facilitate academic dishonesty.</li>
              <li className={styles.listItem}><strong>Transparent Reporting:</strong> Every match is accompanied by exact source links, algorithmic attribution, and similarity confidence scores so authors and educators can evaluate context fairly.</li>
              <li className={styles.listItem}><strong>Sustainable Free Access:</strong> We support our infrastructure and server costs through non-intrusive Google AdSense advertising, ensuring our tool remains universally accessible without requiring credit cards or accounts.</li>
            </ul>
          </section>

          {/* Section 5: Company & Team Info */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Globe size={18} strokeWidth={2.5} /></div>
              5. Organization &amp; Contact
            </h2>
            <p className={styles.text}>
              Scanterity Forensic Systems is operated under Arbovane. We welcome inquiries from academic institutions, researchers, teachers, and students.
            </p>
            <div className={styles.highlight}>
              <Mail className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Scanterity Forensic Systems</strong><br />
                Parent Organization: Arbovane (<a href="https://arbovane.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>arbovane.com</a>)<br />
                General Inquiries &amp; Support: <a href="mailto:hello@scanterity.com" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>hello@scanterity.com</a><br />
                Website: <Link href="/" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>www.scanterity.com</Link>
              </div>
            </div>
            <p className={styles.text} style={{ marginTop: '1.25rem', fontSize: '14px' }}>
              <strong>Explore Scanterity:</strong>{' '}
              <Link href="/" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>Scanner</Link> |{' '}
              <Link href="/why-choose-us" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>Why Scanterity</Link> |{' '}
              <Link href="/privacy" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>Privacy Policy</Link> |{' '}
              <Link href="/terms" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>Terms of Service</Link> |{' '}
              <Link href="/compliance" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>GDPR &amp; Compliance</Link> |{' '}
              <Link href="/contact" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>Contact Us</Link>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
