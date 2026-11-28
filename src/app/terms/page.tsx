import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle, Users, Ban, RefreshCw, Globe, Gavel, Megaphone } from 'lucide-react';
import styles from '../privacy/PrivacyPolicy.module.css';

export const metadata = createPageMetadata({
  title: 'Terms of Service',
  description: 'Read the terms for using Scanterity\'s free plagiarism checker and AI detector, including acceptable use, content ownership and service limitations.',
  path: '/terms',
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'Terms of Service', path: '/terms' },
]);

const linkStyle: React.CSSProperties = {
  color: '#6d28d9',
  fontWeight: 700,
  textDecoration: 'underline',
};

export default function TermsOfService() {
  return (
    <main className={styles.container}>
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
          <h1 className={styles.title}>Terms of Service</h1>
          <div className={styles.lastUpdated}>Effective: November 28, 2026</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <Scale className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Summary:</strong> By using Scanterity, you agree to these terms. We provide automated text-similarity and AI-signal analysis &ldquo;as is&rdquo; as a decision-support aid. You retain full ownership of all content you submit.
            </p>
          </div>

          {/* Section 1 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><FileText size={18} strokeWidth={2.5} /></div>
              1. Acceptance of Terms
            </h2>
            <p className={styles.text}>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and <strong>Scanterity Forensic Systems</strong>, operated by <strong>Arbovane</strong> (&ldquo;Scanterity,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using Scanterity, you agree to these Terms, our <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>, and our <Link href="/compliance" style={linkStyle}>GDPR &amp; Compliance Policy</Link>.
            </p>
            <p className={styles.text}>
              You must be at least 13 years of age (or 16, or the applicable age of digital consent in your jurisdiction, unless used under authorized parent, guardian, or school supervision) to use the Service. If you do not agree to these Terms, you must not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Shield size={18} strokeWidth={2.5} /></div>
              2. Description of Service &amp; Fair-Use Limits
            </h2>
            <p className={styles.text}>
              Scanterity provides automated text-similarity detection, probabilistic AI-writing pattern analysis, and client-side PDF reporting against publicly reachable web and academic search indices.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Exact &amp; Paraphrase Similarity:</strong> Multi-signal string, n-gram, fingerprinting, and semantic overlap comparison against external search and academic source results.</li>
              <li className={styles.listItem}><strong>AI Writing Indicators:</strong> Statistical evaluation of 16 linguistic signals to provide probabilistic human vs. LLM likelihood scores.</li>
              <li className={styles.listItem}><strong>Fair-Use Technical Limits:</strong> Scans currently support up to 15,000 words per document (15 MB max file upload for PDF, DOCX, and TXT) and are protected by per-IP rate limits and concurrency queuing to preserve shared server availability.</li>
            </ul>
            <p className={styles.text}>
              <strong>Human Review Required:</strong> Results are analytical aids only and must be reviewed by a qualified human assessor. Automated scores do not independently prove plagiarism, copyright infringement, or AI authorship and should never serve as the sole basis for academic discipline, grading, termination, or legal action.
            </p>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Users size={18} strokeWidth={2.5} /></div>
              3. User Obligations &amp; Acceptable Use
            </h2>
            <p className={styles.text}>
              You agree to use the Service lawfully and in compliance with all applicable laws. You shall NOT:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Submit content you do not have the right or authorization to check, or upload confidential third-party records in violation of applicable privacy or contractual duties.</li>
              <li className={styles.listItem}>Use automated bots, scripts, or scrapers to bypass rate limits or impose excessive load on our infrastructure.</li>
              <li className={styles.listItem}>Upload malformed files intended to exploit parsers, inject malicious code, or disrupt the Service.</li>
              <li className={styles.listItem}>Resell, frame, or redistribute the Service without prior written authorization.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><FileText size={18} strokeWidth={2.5} /></div>
              4. Intellectual Property &amp; DMCA Copyright Notice
            </h2>
            <p className={styles.text}>
              <strong>Your Content:</strong> You retain full copyright and ownership of all text and files you submit. Scanterity processes uploaded text ephemerally in volatile memory and sends only short search queries to external providers to find matching URLs; we do not claim ownership over your documents or store them in a submission database.
            </p>
            <p className={styles.text}>
              <strong>Third-Party Sources &amp; DMCA (17 U.S.C. &sect; 512):</strong> Scanterity acts solely as an analytical search interface linking to publicly accessible third-party websites and academic indices (CrossRef, Semantic Scholar, Wikipedia, and search providers) and does not permanently host third-party copyrighted content. If you believe any displayed excerpt or reference raises an intellectual property concern, please email our designated contact at <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a> with complete identification details and supporting authorization.
            </p>
            <p className={styles.text}>
              <strong>Trademarks Disclaimer:</strong> Any third-party product names mentioned for comparison (such as Turnitin, Grammarly, or Copyscape) remain the property of their respective trademark owners. Scanterity is independent and not endorsed by or affiliated with them.
            </p>
          </section>

          {/* Section 5 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Megaphone size={18} strokeWidth={2.5} /></div>
              5. Advertising &amp; Direct Sponsorship Inquiries
            </h2>
            <p className={styles.text}>
              Scanterity may display Google AdSense advertisements as well as direct sponsorship placements (such as &ldquo;Your Ad Here — Place Bid&rdquo; inquiries directed to <a href="mailto:advertise@arbovane.com" style={linkStyle}>advertise@arbovane.com</a>):
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Non-Binding Inquiries:</strong> Mentioned starting bid figures (e.g., &ldquo;for just $1&rdquo;) are invitations to submit an advertising inquiry and do not constitute an automatic binding offer, guaranteed inventory, or fixed pricing. Final placement terms, pricing, and duration require written approval by Arbovane / Scanterity.</li>
              <li className={styles.listItem}><strong>Ad Standards:</strong> All sponsored content must comply with applicable advertising disclosure laws and must not promote illegal goods/services, malware, phishing, academic essay-writing mills, deceptive claims, or adult content. We reserve the right to reject or remove any advertisement at our discretion.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><AlertTriangle size={18} strokeWidth={2.5} /></div>
              6. Disclaimers &amp; Limitation of Liability
            </h2>
            <p className={styles.text}>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COMPLETENESS.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Probabilistic Results:</strong> Search availability depends on third-party search providers, and both similarity and AI-detection scores may produce false positives or false negatives.</li>
              <li className={styles.listItem}><strong>Not Legal or Academic Advice:</strong> Scan outputs do not constitute legal advice or definitive proof of misconduct.</li>
            </ul>
            <p className={styles.text}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SCANTERITY, ARBOVANE, OR THEIR PERSONNEL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE. OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS SHALL NOT EXCEED THE GREATER OF (A) AMOUNTS PAID BY YOU TO US IN THE PRECEDING 12 MONTHS, OR (B) ONE HUNDRED U.S. DOLLARS ($100), EXCEPT WHERE LIABILITY CANNOT BE EXCLUDED BY MANDATORY LAW.
            </p>
          </section>

          {/* Section 7 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Ban size={18} strokeWidth={2.5} /></div>
              7. Indemnification &amp; Termination
            </h2>
            <p className={styles.text}>
              You agree to indemnify and hold harmless Scanterity Forensic Systems and Arbovane from claims arising out of your misuse of the Service, your violation of these Terms, or your violation of third-party rights. We may suspend or restrict access to protect infrastructure integrity or prevent abuse without prior notice.
            </p>
          </section>

          {/* Section 8 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><RefreshCw size={18} strokeWidth={2.5} /></div>
              8. Modifications to Terms
            </h2>
            <p className={styles.text}>
              We may revise these Terms periodically by updating the effective date above. Continued use of the Service after updated Terms are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* Section 9 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Globe size={18} strokeWidth={2.5} /></div>
              9. Governing Law &amp; Consumer Protections
            </h2>
            <p className={styles.text}>
              These Terms are governed by the laws of the State of Delaware, United States, excluding conflict-of-law principles. For consumers in the European Economic Area (EEA), the United Kingdom, or other jurisdictions with mandatory consumer-protection statutes, nothing in these Terms overrides mandatory protections or statutory forum rights under the laws of your country of residence.
            </p>
          </section>

          {/* Section 10 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Gavel size={18} strokeWidth={2.5} /></div>
              10. General Provisions &amp; Contact
            </h2>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Severability &amp; Entire Agreement:</strong> If any clause is held unenforceable, the remaining provisions remain valid. These Terms, together with our <Link href="/privacy" style={linkStyle}>Privacy Policy</Link> and <Link href="/compliance" style={linkStyle}>GDPR &amp; Compliance Policy</Link>, constitute the entire agreement regarding the Service.</li>
            </ul>
            <div className={styles.highlight}>
              <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Scanterity Forensic Systems (Arbovane)</strong><br />
                Legal &amp; Support Email: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a><br />
                Advertising Inquiries: <a href="mailto:advertise@arbovane.com" style={linkStyle}>advertise@arbovane.com</a><br />
                About Us: <Link href="/about" style={linkStyle}>About Scanterity</Link> | <Link href="/contact" style={linkStyle}>Contact Page</Link>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
