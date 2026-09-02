'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Database, Lock, Eye, AlertCircle } from 'lucide-react';
import styles from './PrivacyPolicy.module.css';

export default function PrivacyPolicy() {
  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.lastUpdated}>Last Updated: August 13, 2026</div>
        </div>

        <article className={styles.document}>
          <div className={styles.highlight}>
            <Shield className={styles.highlightIcon} size={24} strokeWidth={2.5} />
            <p style={{ margin: 0 }}>
              <strong>Our Core Promise:</strong> We are a forensic scanning tool, not a data broker. We do not store, sell, or claim ownership of any intellectual property you scan using Scanterity. Your documents remain yours.
            </p>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Database size={18} strokeWidth={2.5} /></div>
              1. Information We Collect
            </h2>
            <p className={styles.text}>
              We collect only the minimal data strictly necessary to provide our forensic plagiarism detection services:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Uploaded Content:</strong> Text or files you upload specifically for scanning. These are processed ephemerally in volatile memory (RAM).</li>
              <li className={styles.listItem}><strong>Technical & Usage Data:</strong> Automatically collected information including IP addresses, browser types, device identifiers, and interaction metrics to optimize performance and prevent abuse.</li>
              <li className={styles.listItem}><strong>Account Information:</strong> If you register, we securely store your email address, encrypted authentication credentials, and billing history (if applicable) through secure third-party payment processors.</li>
              <li className={styles.listItem}><strong>Cookies & Local Storage:</strong> We use strictly necessary cookies to maintain session states and functional local storage for user preferences. We do not use intrusive third-party tracking cookies.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Lock size={18} strokeWidth={2.5} /></div>
              2. How We Process Your Data
            </h2>
            <p className={styles.text}>
              Scanterity operates on a rigorous "process-and-discard" architecture designed to protect intellectual property:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Ephemeral Scanning:</strong> Documents uploaded by anonymous users are processed exclusively in RAM and instantly purged from our servers the millisecond a report is generated.</li>
              <li className={styles.listItem}><strong>Zero-Retention Policy:</strong> We explicitly do not add your scanned documents to any internal database to check against future submissions by other users.</li>
              <li className={styles.listItem}><strong>Mathematical Fingerprinting:</strong> Our proprietary NLP engines create irreversible mathematical hashes of your text. These abstract hashes cannot be reverse-engineered to reconstruct your original document.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><Eye size={18} strokeWidth={2.5} /></div>
              3. Data Sharing & Third Parties
            </h2>
            <p className={styles.text}>
              We maintain absolute confidentiality over your submissions. We have never sold, and will never sell, your personal data or your scanned content to data brokers or third parties. We only share data with:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Secure Infrastructure Partners:</strong> Cloud providers (e.g., AWS, Vercel) necessary to host and scale our forensic engines. All partners are bound by strict Data Processing Agreements (DPAs).</li>
              <li className={styles.listItem}><strong>Legal Compliance:</strong> Law enforcement agencies, but strictly only if mandated by a valid, legally binding court order or subpoena.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.sectionIcon}><AlertCircle size={18} strokeWidth={2.5} /></div>
              4. Global Privacy Rights (GDPR & CCPA)
            </h2>
            <p className={styles.text}>
              Depending on your jurisdiction, including the European Economic Area (GDPR) and California (CCPA), you are granted comprehensive rights regarding your personal data:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Right to Access & Portability:</strong> Request a copy of the personal data we hold about you.</li>
              <li className={styles.listItem}><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request immediate deletion of your account and all associated personal data.</li>
              <li className={styles.listItem}><strong>Right to Rectification:</strong> Correct any inaccurate data we hold about you.</li>
            </ul>
            <p className={styles.text}>
              Because we do not store scanned content for anonymous users, there is no uploaded content to delete. Registered users can permanently delete their account and history instantly from their dashboard settings.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              5. Children's Privacy
            </h2>
            <p className={styles.text}>
              Scanterity is not directed at children under the age of 13 (or 16 in certain European jurisdictions). We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected such data, we will take immediate steps to securely delete it in compliance with COPPA and GDPR.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              6. Policy Updates & Contact
            </h2>
            <p className={styles.text}>
              We reserve the right to update this Privacy Policy to reflect changes in legal requirements or our operational practices. Any material changes will be communicated via email or a prominent notice on our website.
            </p>
            <p className={styles.text}>
              If you have any questions or require legal assistance regarding this Privacy Policy, please contact our Data Protection Officer at:
              <br /><br />
              <strong>Email:</strong> <a href="mailto:hello@scanterity.com" style={{ color: 'var(--nb-purple)', fontWeight: 700 }}>hello@scanterity.com</a>
            </p>
          </section>

        </article>
      </div>
    </div>
  );
}
