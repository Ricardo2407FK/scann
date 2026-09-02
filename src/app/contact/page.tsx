import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield, Building2, MessageCircle, Scale, FileText } from 'lucide-react';
import styles from '../privacy/PrivacyPolicy.module.css';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Scanterity — Reach our Data Protection Officer, legal team, or support. Submit GDPR data requests, report issues, or get help with plagiarism detection.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | Scanterity',
    description: 'Contact Scanterity for support, legal inquiries, GDPR data requests, or partnership opportunities.',
    url: 'https://scanterity.com/contact',
  },
};

export default function ContactPage() {
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
          <h1 className={styles.title}>Contact Us</h1>
          <div className={styles.lastUpdated}>We typically respond within 24 hours</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <MessageCircle className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Need Help?</strong> Whether you have questions about our plagiarism detection service, need to exercise your data rights under GDPR/CCPA, or want to report an issue — we&rsquo;re here to help. Choose the appropriate contact channel below.
            </p>
          </div>

          {/* General Support */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Mail size={18} strokeWidth={2.5} /></div>
              General Support
            </h2>
            <p className={styles.text}>
              For questions about using Scanterity, technical issues, scan results, or feature requests:
            </p>
            <div className={styles.highlight}>
              <Mail className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Support Team</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                Response time: Within 24 hours (business days)
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Shield size={18} strokeWidth={2.5} /></div>
              Data Protection &amp; Privacy
            </h2>
            <p className={styles.text}>
              For GDPR data access, rectification, erasure, or portability requests, CCPA consumer requests, or any privacy-related inquiries:
            </p>
            <div className={styles.highlight}>
              <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Data Protection Officer (DPO)</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                Privacy inquiries: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                Response time: Within 30 days (as required by GDPR Art. 12)
              </div>
            </div>
            <p className={styles.text}>
              When submitting a data request, please include sufficient information to verify your identity (full name and email address associated with your use of the Service). See our <Link href="/compliance" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>GDPR &amp; Compliance</Link> page for full details on your rights.
            </p>
          </section>

          {/* Legal */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Scale size={18} strokeWidth={2.5} /></div>
              Legal Inquiries
            </h2>
            <p className={styles.text}>
              For legal matters, DMCA takedown requests, intellectual property disputes, enterprise Data Processing Agreements (DPAs), or law enforcement requests:
            </p>
            <div className={styles.highlight}>
              <Scale className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Legal Department</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                DPA Requests: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                Response time: Within 5 business days
              </div>
            </div>
          </section>

          {/* Enterprise */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Building2 size={18} strokeWidth={2.5} /></div>
              Enterprise &amp; Partnerships
            </h2>
            <p className={styles.text}>
              For institutional licensing, API access, white-label solutions, academic partnerships, or volume pricing:
            </p>
            <div className={styles.highlight}>
              <Building2 className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Enterprise Sales</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                Response time: Within 48 hours
              </div>
            </div>
          </section>

          {/* Bug Reports */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><FileText size={18} strokeWidth={2.5} /></div>
              Security &amp; Bug Reports
            </h2>
            <p className={styles.text}>
              If you discover a security vulnerability or bug, please report it responsibly. We appreciate security researchers who help keep our platform safe.
            </p>
            <div className={styles.highlight}>
              <FileText className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Security Team</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a><br />
                Please include: steps to reproduce, impact assessment, and any supporting evidence
              </div>
            </div>
          </section>

          {/* Company Info */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Building2 size={18} strokeWidth={2.5} /></div>
              Company Information
            </h2>
            <div className={styles.highlight}>
              <Building2 className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Scanterity Forensic Systems</strong><br />
                Website: <a href="https://scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>scanterity.com</a><br />
                General: <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
