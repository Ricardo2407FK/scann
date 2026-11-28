import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Globe, Database, Lock, Eye, FileCheck, Bell, Users, Scale, Cookie, Clock, Server } from 'lucide-react';
import styles from '../privacy/PrivacyPolicy.module.css';
import CookiePreferencesTrigger from '@/components/CookiePreferencesTrigger';

export const metadata = createPageMetadata({
  title: 'GDPR & Compliance',
  description: 'Learn about Scanterity\'s data processing, privacy rights, security measures and international data transfers in our GDPR and CCPA documentation.',
  path: '/compliance',
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'GDPR & Compliance', path: '/compliance' },
]);

const linkStyle: React.CSSProperties = {
  color: '#6d28d9',
  fontWeight: 700,
  textDecoration: 'underline',
};

export default function CompliancePage() {
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
          <h1 className={styles.title}>GDPR &amp; Compliance</h1>
          <div className={styles.lastUpdated}>Effective: November 28, 2026</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <Globe className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Global Compliance Commitment:</strong> Scanterity is engineered with privacy by design to align with the EU General Data Protection Regulation (GDPR), UK GDPR, the California Consumer Privacy Act (CCPA/CPRA), the ePrivacy Directive, and applicable international privacy regulations.
            </p>
          </div>

          {/* GDPR Rights */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Shield size={18} strokeWidth={2.5} /></div>
              1. Your Rights Under GDPR (EU/UK Residents)
            </h2>
            <p className={styles.text}>
              Under Articles 13&ndash;22 of the GDPR / UK GDPR, eligible residents have rights to:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Access, Rectification, Erasure &amp; Portability (Arts. 15&ndash;20):</strong> Request access to, correction of, deletion of, or machine-readable export of any personal data we hold (such as support correspondence). Because submitted documents are processed ephemerally without accounts or persistent databases, there are no stored essays or profiles on our servers.</li>
              <li className={styles.listItem}><strong>Right to Object &amp; Restrict (Arts. 18, 21):</strong> Object to or request restriction of processing based on legitimate interests, or withdraw consent for optional cookies at any time.</li>
              <li className={styles.listItem}><strong>Automated Decisions (Art. 22):</strong> Scanterity produces purely informational similarity percentages and probabilistic AI-writing indicators; it never makes legally binding or automated disciplinary decisions.</li>
            </ul>
            <p className={styles.text}>
              To submit a data rights inquiry, email <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a>. We respond within 30 calendar days.
            </p>
          </section>

          {/* CCPA Rights */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Scale size={18} strokeWidth={2.5} /></div>
              2. Your Rights Under CCPA/CPRA (California &amp; US State Privacy Laws)
            </h2>
            <p className={styles.text}>
              Residents of California and applicable U.S. states with comprehensive privacy statutes have rights to know, delete, correct, limit use of sensitive information, avoid discrimination, and opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal data for cross-context behavioral advertising:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>No Sale of Data or Documents:</strong> Scanterity never sells personal data or uploaded content.</li>
              <li className={styles.listItem}><strong>Your Privacy Choices &amp; Global Privacy Control (GPC):</strong> We automatically detect and honor browser <code>Global Privacy Control (GPC)</code> signals by keeping Google Analytics disabled and limiting Google AdSense to non-personalized ads. You can also adjust your preference anytime via <CookiePreferencesTrigger style={{ color: '#6d28d9', fontWeight: 700 }} /> or <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Google Ads Settings</a>.</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><FileCheck size={18} strokeWidth={2.5} /></div>
              3. Legal Basis for Processing (GDPR Art. 6)
            </h2>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Service Delivery (Art. 6(1)(b) / Request Fulfillment):</strong> Processing submitted text in RAM and transmitting short search queries to external search/academic APIs solely to execute the scan you requested.</li>
              <li className={styles.listItem}><strong>Legitimate Interests (Art. 6(1)(f)):</strong> In-memory rate limiting, concurrency queuing, SSRF safeguards, and redacted security logging to prevent abuse and maintain uptime.</li>
              <li className={styles.listItem}><strong>Consent (Art. 6(1)(a)):</strong> Optional Google Analytics measurement and personalized Google AdSense cookies are activated strictly upon explicit opt-in consent.</li>
            </ul>
          </section>

          {/* Data Processing */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Database size={18} strokeWidth={2.5} /></div>
              4. Accurate Data Architecture &amp; Transient Retention
            </h2>
            <p className={styles.text}>
              Scanterity does not maintain user accounts, billing systems, or persistent document databases. Exact in-memory and runtime lifecycle periods are:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Full Uploaded Documents / Extracted Text:</strong> Processed only in volatile server memory during the active request and not persisted to disk or a plagiarism repository.</li>
              <li className={styles.listItem}><strong>Short Search Queries &amp; Public Reference Pages (In-Memory Cache):</strong> Selected search query strings derived from probes may remain in transient server RAM cache for up to 15 minutes (and public web/academic page text extracts for up to 60 minutes) before automatic TTL/LRU eviction.</li>
              <li className={styles.listItem}><strong>Generated Reports:</strong> Created client-side inside your browser and never stored on Scanterity servers.</li>
              <li className={styles.listItem}><strong>Rate Limiting &amp; Diagnostic Logs:</strong> IP rate-limit counters exist in transient RAM (1&ndash;2 minute sliding windows). Application logs avoid logging full client IPs or uploaded filenames, and hosting infrastructure retains standard HTTP access logs per hosting provider policy.</li>
            </ul>
          </section>

          {/* Cookie Policy */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Cookie size={18} strokeWidth={2.5} /></div>
              5. Cookie, Consent Mode v2 &amp; ePrivacy Compliance
            </h2>
            <p className={styles.text}>
              In compliance with the ePrivacy Directive (2002/58/EC) and Google&rsquo;s EU User Consent Policy:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Essential Storage:</strong> Browser <code>localStorage</code> stores your consent choice (<code>scanterity_cookie_consent</code>) so we remember whether to enable or block optional scripts.</li>
              <li className={styles.listItem}><strong>Google Analytics &amp; AdSense Gating:</strong> Consent defaults to <code>denied</code> for <code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code>, and <code>analytics_storage</code>. Google Analytics does not load without explicit opt-in, and AdSense defaults to non-personalized ads until you accept.</li>
            </ul>
            <p className={styles.text}>
              Manage or withdraw consent anytime:{' '}
              <CookiePreferencesTrigger style={{ color: '#6d28d9', fontWeight: 700 }} />
            </p>
          </section>

          {/* International Transfers */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Server size={18} strokeWidth={2.5} /></div>
              6. International Data Transfers
            </h2>
            <p className={styles.text}>
              Requests routed through global cloud hosting, external search/academic APIs, or consent-enabled Google services may traverse jurisdictions outside the EEA/UK under applicable transfer mechanisms (such as Standard Contractual Clauses or adequacy decisions including the EU-U.S. Data Privacy Framework where applicable to third-party providers).
            </p>
          </section>

          {/* Institutional DPAs */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Lock size={18} strokeWidth={2.5} /></div>
              7. Institutional Inquiries
            </h2>
            <p className={styles.text}>
              Educational institutions evaluating Scanterity or requesting technical documentation may reach us at <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a>.
            </p>
          </section>

          {/* Security */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Eye size={18} strokeWidth={2.5} /></div>
              8. Technical Security Controls (GDPR Art. 32)
            </h2>
            <p className={styles.text}>
              Technical safeguards built directly into the application include:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Transport Security &amp; HSTS:</strong> HTTPS enforcement with HSTS, strict <code>Referrer-Policy</code>, and <code>X-Content-Type-Options: nosniff</code> headers.</li>
              <li className={styles.listItem}><strong>Origin / CSRF &amp; SSRF Protections:</strong> Cross-origin request validation on API endpoints and IPv4/IPv6 private-network SSRF filtering on outbound source lookups.</li>
              <li className={styles.listItem}><strong>XSS Sanitization &amp; Strict CSP:</strong> All highlighted output is sanitized via DOMPurify and guarded by Content Security Policy headers.</li>
              <li className={styles.listItem}><strong>Abuse Prevention &amp; Data Minimization:</strong> File magic-byte validation, payload caps, rate limiting, and exclusion of document filenames from server logs.</li>
            </ul>
          </section>

          {/* Breach Notification */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Bell size={18} strokeWidth={2.5} /></div>
              9. Security Incident &amp; Breach Handling
            </h2>
            <p className={styles.text}>
              If a personal data security incident occurs affecting any personal data under our control, we will evaluate risk and provide notifications to relevant supervisory authorities (such as within 72 hours under GDPR Art. 33 where required) and affected individuals as mandated by law.
            </p>
          </section>

          {/* Children */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Users size={18} strokeWidth={2.5} /></div>
              10. Children&rsquo;s Privacy
            </h2>
            <p className={styles.text}>
              Scanterity is not directed to children under 13 (or under 16 / the applicable digital consent age in the EEA/UK unless authorized by a parent, guardian, or educational institution). We do not knowingly collect personal information from children. If you believe a child has shared personal data with us, contact <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a> promptly.
            </p>
          </section>

          {/* Supervisory Authorities */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Clock size={18} strokeWidth={2.5} /></div>
              11. Supervisory Authorities &amp; Contact
            </h2>
            <p className={styles.text}>
              You may lodge a complaint with your local data protection authority:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>EU:</strong> National Data Protection Authorities (<a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" style={linkStyle} target="_blank" rel="noopener noreferrer">edpb.europa.eu</a>)</li>
              <li className={styles.listItem}><strong>UK:</strong> Information Commissioner&rsquo;s Office (ICO) &mdash; <a href="https://ico.org.uk" style={linkStyle} target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
              <li className={styles.listItem}><strong>California:</strong> California Privacy Protection Agency / Attorney General &mdash; <a href="https://oag.ca.gov/privacy" style={linkStyle} target="_blank" rel="noopener noreferrer">oag.ca.gov/privacy</a></li>
            </ul>
            <div className={styles.highlight}>
              <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Privacy &amp; Compliance Contact</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a><br />
                Related Policies: <Link href="/privacy" style={linkStyle}>Privacy Policy</Link> | <Link href="/terms" style={linkStyle}>Terms of Service</Link> | <Link href="/about" style={linkStyle}>About Us</Link> | <Link href="/contact" style={linkStyle}>Contact</Link>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
