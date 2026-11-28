import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Database, Lock, Eye, AlertCircle, Cookie } from 'lucide-react';
import styles from './PrivacyPolicy.module.css';
import ScrollToTop from '@/components/ScrollToTop';
import CookiePreferencesTrigger from '@/components/CookiePreferencesTrigger';

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'Read Scanterity\'s privacy policy to understand document processing, data retention, cookies, third-party services and your privacy rights.',
  path: '/privacy',
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'Privacy Policy', path: '/privacy' },
]);

const linkStyle: React.CSSProperties = {
  color: '#6d28d9',
  fontWeight: 700,
  textDecoration: 'underline',
};

export default function PrivacyPolicy() {
  return (
    <main className={styles.container}>
      <ScrollToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.backButtonContainer}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Scanner
          </Link>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.lastUpdated}>Last Updated: November 28, 2026</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Our Core Promise:</strong> Scanterity Forensic Systems (operated by Arbovane) is a forensic scanning utility, not a data broker or document repository. We do not persist submitted documents to a database, sell personal data, or claim ownership over your writing.
            </p>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Database size={18} strokeWidth={2.5} /></div>
              1. Information We Process
            </h2>
            <p className={styles.text}>
              Scanterity operates without user registration or accounts. We process only the minimal data needed to deliver plagiarism and AI-signal analysis securely:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Submitted Text &amp; Files:</strong> Text pasted into the editor or extracted from uploaded <code>.pdf</code>, <code>.docx</code>, or <code>.txt</code> files is processed ephemerally in volatile server memory (RAM) for analysis. Uploaded files are not written to persistent disk storage or added to any user-submission repository.</li>
              <li className={styles.listItem}><strong>Technical &amp; Security Data:</strong> IP addresses (processed in-memory for sliding-window rate limiting and redacted in diagnostic logs), HTTP request metadata, and error diagnostics required to maintain stability and prevent automated abuse.</li>
              <li className={styles.listItem}><strong>Direct Inquiries:</strong> If you email us at <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a> or send an advertising sponsorship inquiry to <a href="mailto:advertise@arbovane.com" style={linkStyle}>advertise@arbovane.com</a>, we retain your message and email address only as needed to respond to your inquiry.</li>
              <li className={styles.listItem}><strong>Browser Storage &amp; Optional Cookies:</strong> We store your cookie consent choice locally in your browser (<code>localStorage</code>). Non-essential cookies for Google Analytics and personalized Google AdSense ads are disabled by default and load only if you select &ldquo;Accept All&rdquo; and no Global Privacy Control (GPC) signal is active.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Lock size={18} strokeWidth={2.5} /></div>
              2. How Your Documents Are Processed &amp; Cached
            </h2>
            <p className={styles.text}>
              Scanterity is designed around ephemeral, database-free document handling:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>No Persistent Submission Storage:</strong> Your uploaded files and full documents are never saved to a persistent database, never indexed to check against future users&rsquo; submissions, and never retained on disk after parsing or scanning completes.</li>
              <li className={styles.listItem}><strong>External Search Queries &amp; Transient In-Memory Caches:</strong> To identify online matches, our engine selects short representative search phrases (probes) from submitted text and sends those query strings over HTTPS to external search and academic lookup providers (Wikipedia, CrossRef, Semantic Scholar, and web search engines). Query lookups may stay in transient server RAM cache for up to 15 minutes (and public reference page extracts for up to 1 hour) purely for performance before automatic expiration.</li>
              <li className={styles.listItem}><strong>Client-Side Report Generation:</strong> Your highlighted report and downloadable PDF export are generated directly in your browser. We do not store copies of generated reports on our servers.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Cookie size={18} strokeWidth={2.5} /></div>
              3. Cookies, Google AdSense, Analytics &amp; Consent Choices
            </h2>
            <p className={styles.text}>
              To keep Scanterity free without sign-ups, we display ads via Google AdSense and (with your consent) use Google Analytics to measure site reliability. We implement Google Consent Mode v2 and honor browser privacy signals:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Opt-In Consent &amp; Essential Only Mode:</strong> Advertising storage, ad personalization, and analytics cookies default to <em>denied</em>. If you click &ldquo;Essential Only&rdquo; or have Global Privacy Control (GPC) enabled, Google Analytics does not load and Google AdSense is instructed to serve strictly non-personalized ads.
              </li>
              <li className={styles.listItem}>
                <strong>Third-Party Ad Serving &amp; Cookies:</strong> When you consent via &ldquo;Accept All,&rdquo; Google and third-party vendors may use cookies to serve relevant ads and measure usage. You can opt out of personalized advertising anytime via{' '}
                <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  Google Ads Settings
                </a>.
              </li>
              <li className={styles.listItem}>
                <strong>Industry Opt-Out Resources:</strong> Opt out of participating third-party ad networks at{' '}
                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  aboutads.info
                </a>,{' '}
                <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  networkadvertising.org/choices
                </a>, or{' '}
                <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  youronlinechoices.eu
                </a>.
              </li>
              <li className={styles.listItem}>
                <strong>Google Analytics Opt-Out:</strong> When active, you may also use the{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  Google Analytics Opt-Out Browser Add-on
                </a>.
              </li>
              <li className={styles.listItem}>
                <strong>Document Isolation Guarantee:</strong> Submitted document content is never sold or shared with Google AdSense, direct sponsorship advertisers, or marketing data brokers.
              </li>
            </ul>
            <p className={styles.text}>
              You can update or withdraw your consent at any time:{' '}
              <CookiePreferencesTrigger style={{ color: '#6d28d9', fontWeight: 700 }} />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Eye size={18} strokeWidth={2.5} /></div>
              4. External Service Providers &amp; Data Recipients
            </h2>
            <p className={styles.text}>
              We do not sell your personal information or submitted documents. Categories of external entities that may receive limited technical or query data include:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Search &amp; Academic API Providers:</strong> Short, selected text search queries (not full uploaded files) are sent to external search and academic databases (such as CrossRef, Semantic Scholar, Wikipedia, and web search providers) solely to locate matching public sources.</li>
              <li className={styles.listItem}><strong>Hosting &amp; Infrastructure Providers:</strong> Cloud hosting and content delivery infrastructure providers (e.g., Vercel) that process HTTP traffic and runtime telemetry subject to standard provider security and privacy terms.</li>
              <li className={styles.listItem}><strong>Advertising &amp; Analytics (Consent-Gated):</strong> Google AdSense and Google Analytics process browser telemetry in accordance with Google&rsquo;s privacy policies and your consent choices.</li>
              <li className={styles.listItem}><strong>Legal Obligations:</strong> Authorities only if compelled by a valid, legally binding subpoena, court order, or statutory obligation.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><AlertCircle size={18} strokeWidth={2.5} /></div>
              5. Global Privacy Rights (GDPR, UK GDPR &amp; CCPA/CPRA)
            </h2>
            <p className={styles.text}>
              Depending on your jurisdiction, including the EEA, UK, and California (CCPA/CPRA), you may have rights to access, correct, delete, restrict, or port personal data, object to processing, withdraw consent, and opt out of the &ldquo;sharing&rdquo; of personal information for cross-context behavioral advertising:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>No Document Accounts to Delete:</strong> Because Scanterity does not store uploaded documents or maintain user accounts, submitted papers are not retained for deletion.</li>
              <li className={styles.listItem}><strong>Opt-Out / Consent Withdrawal:</strong> Use <CookiePreferencesTrigger style={{ color: '#6d28d9', fontWeight: 700 }} /> at any time or enable Global Privacy Control (GPC) in your browser to opt out of personalized advertising and analytics.</li>
              <li className={styles.listItem}><strong>Non-Discrimination:</strong> Exercising any privacy right will never restrict access to Scanterity&rsquo;s free scanning features.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              6. Children&rsquo;s Privacy
            </h2>
            <p className={styles.text}>
              Scanterity is intended for users aged 13 and older (or aged 16 and older, or the applicable age of digital consent, in the EEA/UK unless used with verifiable parental, guardian, or institutional educator authorization). We do not knowingly collect personal information from children under applicable digital consent laws. If you believe a child has submitted personal contact information to us (for example via email), please contact us immediately so we can delete it.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              7. Policy Updates &amp; Contact
            </h2>
            <p className={styles.text}>
              We may update this Privacy Policy to reflect operational or legal changes, with the updated date reflected at the top of this page. For privacy inquiries or data rights requests, contact:
              <br /><br />
              <strong>Operator:</strong> Scanterity Forensic Systems (Arbovane)<br />
              <strong>Privacy &amp; Data Protection Email:</strong> <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a><br />
              <strong>Direct Advertising Inquiries:</strong> <a href="mailto:advertise@arbovane.com" style={linkStyle}>advertise@arbovane.com</a>
            </p>
            <p className={styles.text} style={{ marginTop: '1.25rem', fontSize: '14px' }}>
              <strong>Related Legal Documents:</strong>{' '}
              <Link href="/about" style={linkStyle}>About Us</Link> |{' '}
              <Link href="/compliance" style={linkStyle}>GDPR &amp; Compliance</Link> |{' '}
              <Link href="/terms" style={linkStyle}>Terms of Service</Link> |{' '}
              <Link href="/contact" style={linkStyle}>Contact Support</Link>
            </p>
          </section>

        </article>
      </div>
    </main>
  );
}
