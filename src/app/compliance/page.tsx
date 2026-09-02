import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Globe, Database, Lock, Eye, FileCheck, Bell, Users, Scale, Cookie, Clock, Server } from 'lucide-react';
import styles from '../privacy/PrivacyPolicy.module.css';

export const metadata: Metadata = {
  title: 'GDPR & Compliance',
  description: 'Scanterity GDPR, CCPA & global data protection compliance — Your rights under EU General Data Protection Regulation, California Consumer Privacy Act, and ePrivacy Directive.',
  alternates: { canonical: '/compliance' },
  openGraph: {
    title: 'GDPR & Compliance | Scanterity',
    description: 'Full GDPR, CCPA & ePrivacy compliance documentation for Scanterity forensic plagiarism detection.',
    url: 'https://scanterity.com/compliance',
  },
};

export default function CompliancePage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.backButtonContainer}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Scanner
          </Link>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>GDPR &amp; Compliance</h1>
          <div className={styles.lastUpdated}>Effective: August 18, 2026</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <Globe className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Global Compliance Commitment:</strong> Scanterity is designed from the ground up to comply with the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA/CPRA), the ePrivacy Directive, the UK Data Protection Act 2018, and applicable international data protection laws.
            </p>
          </div>

          {/* GDPR Rights */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Shield size={18} strokeWidth={2.5} /></div>
              1. Your Rights Under GDPR (EU/EEA Residents)
            </h2>
            <p className={styles.text}>
              If you are a resident of the European Economic Area (EEA) or the United Kingdom, you have the following rights under Articles 13–22 of the General Data Protection Regulation (EU) 2016/679:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Right of Access (Art. 15):</strong> Request a copy of all personal data we hold about you, including processing purposes, data categories, recipients, and retention periods. We will respond within 30 days.</li>
              <li className={styles.listItem}><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate personal data or completion of incomplete data without undue delay.</li>
              <li className={styles.listItem}><strong>Right to Erasure (Art. 17):</strong> Request deletion of your personal data when the data is no longer necessary, you withdraw consent, or you object to processing. Also known as the &ldquo;right to be forgotten.&rdquo;</li>
              <li className={styles.listItem}><strong>Right to Restriction (Art. 18):</strong> Request restriction of processing while we verify accuracy of your data, while we assess an objection, or if processing is unlawful but you prefer restriction over erasure.</li>
              <li className={styles.listItem}><strong>Right to Data Portability (Art. 20):</strong> Receive your personal data in a structured, commonly used, machine-readable format (JSON/CSV) and transmit it to another controller.</li>
              <li className={styles.listItem}><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or direct marketing at any time. We will cease processing unless we demonstrate compelling legitimate grounds.</li>
              <li className={styles.listItem}><strong>Right Against Automated Decision-Making (Art. 22):</strong> Not be subject to decisions based solely on automated processing that produce legal effects. Our plagiarism scores are analytical tools — not automated legal decisions.</li>
            </ul>
            <p className={styles.text}>
              To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a>. We will respond within 30 calendar days. You also have the right to lodge a complaint with your local supervisory authority.
            </p>
          </section>

          {/* CCPA Rights */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Scale size={18} strokeWidth={2.5} /></div>
              2. Your Rights Under CCPA/CPRA (California Residents)
            </h2>
            <p className={styles.text}>
              If you are a California resident, the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA) grants you the following rights:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected, the sources of collection, the business purposes, and the categories of third parties with whom we share it.</li>
              <li className={styles.listItem}><strong>Right to Delete:</strong> Request deletion of personal information we have collected from you, subject to certain exceptions (legal obligations, security, etc.).</li>
              <li className={styles.listItem}><strong>Right to Correct:</strong> Request correction of inaccurate personal information.</li>
              <li className={styles.listItem}><strong>Right to Opt-Out of Sale/Sharing:</strong> We do <strong>NOT</strong> sell or share your personal information for cross-context behavioral advertising. There is no data to opt out of.</li>
              <li className={styles.listItem}><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA/CPRA rights. You will receive equal service and pricing.</li>
              <li className={styles.listItem}><strong>Right to Limit Use of Sensitive Data:</strong> You can direct us to limit use of sensitive personal information to purposes necessary to provide the Service.</li>
            </ul>
            <p className={styles.text}>
              To submit a verifiable consumer request, contact us at <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a>. We will verify your identity and respond within 45 calendar days.
            </p>
          </section>

          {/* Legal Basis */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><FileCheck size={18} strokeWidth={2.5} /></div>
              3. Legal Basis for Processing (GDPR Art. 6)
            </h2>
            <p className={styles.text}>
              We process personal data on the following legal bases:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Contract Performance (Art. 6(1)(b)):</strong> Processing necessary to provide the plagiarism detection service you requested — including scanning submitted text and generating reports.</li>
              <li className={styles.listItem}><strong>Legitimate Interests (Art. 6(1)(f)):</strong> Processing for platform security (rate limiting, abuse prevention, DDoS protection), service improvement, and aggregate analytics. We have conducted a Legitimate Interest Assessment (LIA) confirming these interests do not override your fundamental rights.</li>
              <li className={styles.listItem}><strong>Legal Obligation (Art. 6(1)(c)):</strong> Processing required to comply with applicable laws, including tax reporting, fraud prevention, and responses to valid legal process.</li>
              <li className={styles.listItem}><strong>Consent (Art. 6(1)(a)):</strong> Where specifically requested, such as for marketing communications. You may withdraw consent at any time without affecting the lawfulness of prior processing.</li>
            </ul>
          </section>

          {/* Data Processing */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Database size={18} strokeWidth={2.5} /></div>
              4. Data Processing &amp; Retention
            </h2>
            <p className={styles.text}>
              Scanterity implements a strict data minimization policy. Below are our data categories and retention periods:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Scanned Document Content:</strong> Processed in volatile memory (RAM) only. <strong>Retention: 0 seconds after scan completion.</strong> Content is never written to disk, indexed, or stored in any database.</li>
              <li className={styles.listItem}><strong>Scan Results/Reports:</strong> Generated client-side in your browser. We do not store copies of your reports on our servers.</li>
              <li className={styles.listItem}><strong>Technical Logs (IP, User Agent):</strong> Retained for a maximum of 90 days for security monitoring and abuse prevention. Automatically purged thereafter.</li>
              <li className={styles.listItem}><strong>Account Data (if registered):</strong> Retained for the duration of your active account plus 30 days after account deletion request.</li>
              <li className={styles.listItem}><strong>Payment Records:</strong> Retained for 7 years as required by tax and financial regulation. Processed by PCI DSS-compliant third-party payment processors — we never store full payment card details.</li>
              <li className={styles.listItem}><strong>Cookie Data:</strong> Session cookies expire when you close your browser. Functional cookies expire after 30 days maximum.</li>
            </ul>
          </section>

          {/* Cookie Policy */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Cookie size={18} strokeWidth={2.5} /></div>
              5. Cookie &amp; ePrivacy Compliance
            </h2>
            <p className={styles.text}>
              In compliance with the ePrivacy Directive (2002/58/EC) and its national implementations, we provide full transparency about our cookie usage:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Strictly Necessary Cookies:</strong> Required for the service to function (session management, CSRF protection). These do not require consent under Art. 5(3) of the ePrivacy Directive.</li>
              <li className={styles.listItem}><strong>Functional Cookies:</strong> Store user preferences such as scan settings. These are set only with your consent.</li>
              <li className={styles.listItem}><strong>Analytics Cookies:</strong> We do <strong>NOT</strong> use third-party analytics trackers (Google Analytics, Facebook Pixel, etc.). We use privacy-preserving, first-party aggregate analytics only.</li>
              <li className={styles.listItem}><strong>Advertising Cookies:</strong> We do <strong>NOT</strong> use any advertising or tracking cookies. We do not participate in ad networks or retargeting programs.</li>
            </ul>
            <p className={styles.text}>
              You can manage cookies through your browser settings at any time. Disabling strictly necessary cookies may affect the functionality of the Service.
            </p>
          </section>

          {/* International Transfers */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Server size={18} strokeWidth={2.5} /></div>
              6. International Data Transfers
            </h2>
            <p className={styles.text}>
              If your personal data is transferred outside the EEA/UK, we ensure adequate protection through one or more of the following safeguards, in compliance with GDPR Chapter V:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>EU-U.S. Data Privacy Framework (DPF):</strong> Where applicable, we rely on the adequacy decision for the EU-U.S. Data Privacy Framework.</li>
              <li className={styles.listItem}><strong>Standard Contractual Clauses (SCCs):</strong> We use the European Commission&rsquo;s approved Standard Contractual Clauses (Decision 2021/914) with all sub-processors.</li>
              <li className={styles.listItem}><strong>UK International Data Transfer Agreement (IDTA):</strong> For UK transfers, we use the UK Addendum to the EU SCCs or the UK IDTA as appropriate.</li>
              <li className={styles.listItem}><strong>Supplementary Measures:</strong> Including encryption in transit (TLS 1.3) and at rest (AES-256), pseudonymization, and access controls.</li>
            </ul>
          </section>

          {/* DPA */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Lock size={18} strokeWidth={2.5} /></div>
              7. Data Processing Agreement (DPA)
            </h2>
            <p className={styles.text}>
              For enterprise and institutional customers where Scanterity acts as a Data Processor under Article 28 of the GDPR, we offer a comprehensive Data Processing Agreement that includes:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Detailed description of processing activities, purposes, and data categories</li>
              <li className={styles.listItem}>Technical and organizational security measures (Art. 32 GDPR)</li>
              <li className={styles.listItem}>Sub-processor disclosure and change notification procedures</li>
              <li className={styles.listItem}>Data breach notification obligations (within 48 hours)</li>
              <li className={styles.listItem}>Audit rights and compliance verification procedures</li>
              <li className={styles.listItem}>Data return and deletion obligations upon contract termination</li>
            </ul>
            <p className={styles.text}>
              To request a signed DPA, contact <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a>.
            </p>
          </section>

          {/* Security */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Eye size={18} strokeWidth={2.5} /></div>
              8. Security Measures (Art. 32 GDPR)
            </h2>
            <p className={styles.text}>
              We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256.</li>
              <li className={styles.listItem}><strong>Access Controls:</strong> Role-based access control (RBAC) with principle of least privilege. Multi-factor authentication for all administrative access.</li>
              <li className={styles.listItem}><strong>Ephemeral Processing:</strong> Submitted documents are processed in volatile memory and never written to persistent storage.</li>
              <li className={styles.listItem}><strong>Rate Limiting:</strong> Per-IP rate limiting to prevent abuse and ensure fair resource allocation.</li>
              <li className={styles.listItem}><strong>Input Validation:</strong> Comprehensive server-side input validation and sanitization to prevent injection attacks.</li>
              <li className={styles.listItem}><strong>Content Security Policy:</strong> Strict CSP headers to prevent XSS and code injection attacks.</li>
              <li className={styles.listItem}><strong>Regular Audits:</strong> Periodic security assessments and vulnerability scanning.</li>
            </ul>
          </section>

          {/* Breach Notification */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Bell size={18} strokeWidth={2.5} /></div>
              9. Data Breach Notification
            </h2>
            <p className={styles.text}>
              In compliance with GDPR Articles 33–34 and applicable breach notification laws:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Supervisory Authority Notification:</strong> We will notify the relevant supervisory authority within 72 hours of becoming aware of a personal data breach, unless the breach is unlikely to result in a risk to individual rights and freedoms.</li>
              <li className={styles.listItem}><strong>Data Subject Notification:</strong> Where a breach is likely to result in a high risk to your rights and freedoms, we will notify you without undue delay via email and a prominent notice on the Service.</li>
              <li className={styles.listItem}><strong>Documentation:</strong> All breaches are documented in our internal breach register, including the nature of the breach, categories and approximate number of individuals affected, likely consequences, and remedial measures taken.</li>
            </ul>
          </section>

          {/* Children */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Users size={18} strokeWidth={2.5} /></div>
              10. Children&rsquo;s Privacy
            </h2>
            <p className={styles.text}>
              The Service is not directed to individuals under the age of 16 (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect personal data from children. If we become aware that we have collected personal data from a child without appropriate parental consent, we will take steps to delete such data promptly. If you believe a child has provided us with personal data, please contact our DPO immediately.
            </p>
          </section>

          {/* Supervisory Authorities */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Clock size={18} strokeWidth={2.5} /></div>
              11. Supervisory Authorities &amp; Contact
            </h2>
            <p className={styles.text}>
              You have the right to lodge a complaint with your local data protection supervisory authority. Key authorities include:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>EU:</strong> Your national Data Protection Authority (full list at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" style={{ color: 'var(--nb-purple)', fontWeight: 700 }} target="_blank" rel="noopener noreferrer">edpb.europa.eu</a>)</li>
              <li className={styles.listItem}><strong>UK:</strong> Information Commissioner&rsquo;s Office (ICO) — <a href="https://ico.org.uk" style={{ color: 'var(--nb-purple)', fontWeight: 700 }} target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
              <li className={styles.listItem}><strong>California:</strong> California Attorney General — <a href="https://oag.ca.gov/privacy" style={{ color: 'var(--nb-purple)', fontWeight: 700 }} target="_blank" rel="noopener noreferrer">oag.ca.gov/privacy</a></li>
            </ul>
            <div className={styles.highlight}>
              <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Data Protection Officer</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                General Privacy: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                DPA Requests: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
