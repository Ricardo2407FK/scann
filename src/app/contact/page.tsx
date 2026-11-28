import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield, Building2, MessageCircle, Scale, FileText, Megaphone } from 'lucide-react';
import styles from '../privacy/PrivacyPolicy.module.css';

export const metadata = createPageMetadata({
  title: 'Contact Us',
  description: 'Contact Scanterity for plagiarism checker support, AI detector questions, bug reports, privacy requests, legal inquiries or enterprise partnerships.',
  path: '/contact',
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'Contact Us', path: '/contact' },
]);

const linkStyle: React.CSSProperties = {
  color: '#6d28d9',
  fontWeight: 700,
  textDecoration: 'underline',
};

export default function ContactPage() {
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
          <h1 className={styles.title}>Contact Us</h1>
          <div className={styles.lastUpdated}>We typically respond within 24&ndash;48 hours</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <MessageCircle className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Need Help?</strong> Whether you have questions about our plagiarism detection service, need to exercise your data rights under GDPR/CCPA, want to submit a legal/DMCA notice, or wish to inquire about advertising — choose the appropriate channel below.
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
                Email: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a>
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
              For GDPR data access, rectification, erasure, or portability requests, CCPA/CPRA consumer requests, or privacy inquiries:
            </p>
            <div className={styles.highlight}>
              <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Privacy &amp; Compliance Contact</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a><br />
                Response window: Within 30 days under GDPR Art. 12 (or 45 days under CCPA/CPRA)
              </div>
            </div>
            <p className={styles.text}>
              See our <Link href="/compliance" style={linkStyle}>GDPR &amp; Compliance</Link> page for details on your privacy rights and cookie preferences.
            </p>
          </section>

          {/* Legal & DMCA */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Scale size={18} strokeWidth={2.5} /></div>
              Legal &amp; DMCA Inquiries
            </h2>
            <p className={styles.text}>
              For legal notices, DMCA / copyright inquiries, intellectual property questions, or law enforcement requests:
            </p>
            <div className={styles.highlight}>
              <Scale className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Legal Department</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a>
              </div>
            </div>
          </section>

          {/* Advertising & Sponsorships */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Megaphone size={18} strokeWidth={2.5} /></div>
              Advertising &amp; Direct Sponsorships
            </h2>
            <p className={styles.text}>
              For banner sponsorship placements and &ldquo;Place Bid&rdquo; inquiries on Scanterity (subject to editorial review and approval under our <Link href="/terms" style={linkStyle}>Terms of Service</Link>):
            </p>
            <div className={styles.highlight}>
              <Megaphone className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Advertising Desk (Arbovane)</strong><br />
                Email: <a href="mailto:advertise@arbovane.com" style={linkStyle}>advertise@arbovane.com</a>
              </div>
            </div>
          </section>

          {/* Security & Bug Reports */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><FileText size={18} strokeWidth={2.5} /></div>
              Security &amp; Bug Reports
            </h2>
            <p className={styles.text}>
              If you discover a security vulnerability or bug, please report it responsibly with reproduction steps:
            </p>
            <div className={styles.highlight}>
              <FileText className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Security Team</strong><br />
                Email: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a>
              </div>
            </div>
          </section>

          {/* Company Info */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Building2 size={18} strokeWidth={2.5} /></div>
              Operator Information &amp; Legal Links
            </h2>
            <div className={styles.highlight}>
              <Building2 className={styles.highlightIcon} size={24} strokeWidth={2.5} />
              <div style={{ margin: 0 }}>
                <strong>Scanterity Forensic Systems</strong> (operated by <strong>Arbovane</strong>)<br />
                Website: <Link href="/" style={linkStyle}>www.scanterity.com</Link><br />
                General: <a href="mailto:hello@scanterity.com" style={linkStyle}>hello@scanterity.com</a> | Ads: <a href="mailto:advertise@arbovane.com" style={linkStyle}>advertise@arbovane.com</a><br />
                Policies: <Link href="/about" style={linkStyle}>About Us</Link> | <Link href="/privacy" style={linkStyle}>Privacy Policy</Link> | <Link href="/terms" style={linkStyle}>Terms of Service</Link> | <Link href="/compliance" style={linkStyle}>GDPR &amp; Compliance</Link>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
