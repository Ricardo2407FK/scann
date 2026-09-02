"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import styles from '../PlagiarismChecker.module.css';
import type { ActiveViewer } from '@/lib/engine/types';

type ForensicViewerProps = {
  viewer: ActiveViewer;
  onClose: () => void;
};

export default function ForensicViewer({ viewer, onClose }: ForensicViewerProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap + ESC close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    // Trap Tab within the modal
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, [onClose]);

  useEffect(() => {
    // Focus the close button on open
    closeBtnRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const confidenceNum = parseInt(viewer.confidence);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className={styles.sideBySideViewer}
        role="dialog"
        aria-modal="true"
        aria-label="Match forensics details"
      >
        <div className={styles.viewerHeader}>
          <h2><ShieldAlert color="var(--accent)" size={20} aria-hidden="true" />Match Details</h2>
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close forensic viewer"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.viewerAlgorithmBadge}>
          <strong>Similarity Confidence:</strong>
          <span className={`${styles.confidenceBadge} ${confidenceNum >= 80 ? styles.high : confidenceNum >= 50 ? styles.medium : styles.low}`}
            aria-label={`Confidence: ${viewer.confidence}%`}>
            {viewer.confidence}%
          </span>
        </div>

        <div className={styles.viewerGrid}>
          <div className={styles.snippetBox}>
            <h3>Your Document</h3>
            <p className={styles.matchedText}>{viewer.text}</p>
          </div>
          <div className={styles.snippetBox}>
            <h3>Matched Content</h3>
            {viewer.snippets.map((snippet, idx) => (
              <div key={idx} style={{ marginBottom: '0.85rem' }}>
                <p>{snippet}</p>
                {viewer.urls[idx] && (
                  <a href={viewer.urls[idx]} target="_blank" rel="noreferrer"
                    style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.3rem', display: 'block', wordBreak: 'break-all' }}>
                    {viewer.urls[idx]}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
