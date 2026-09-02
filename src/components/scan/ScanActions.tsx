"use client";

import React, { useEffect, useCallback } from 'react';
import styles from '../PlagiarismChecker.module.css';

type ScanActionsProps = {
  status: 'idle' | 'checking' | 'completed' | 'error';
  hasReport: boolean;
  hasText: boolean;
  onUploadClick: () => void;
  onScan: () => void;
  onNewScan: () => void;
  onExport: () => void;
};

export default function ScanActions({
  status, hasReport, hasText, onUploadClick, onScan, onNewScan, onExport,
}: ScanActionsProps) {
  // Ctrl+Enter keyboard shortcut for scan
  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && hasText && status !== 'checking' && !hasReport) {
      e.preventDefault();
      onScan();
    }
  }, [hasText, status, hasReport, onScan]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  return (
    <div className={styles.customActions}>
      {!hasReport ? (
        <>
          <button
            type="button"
            className={styles.customBtnSecondary}
            onClick={onUploadClick}
            disabled={status === 'checking'}
            aria-label="Upload a document file"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 0" }}>upload</span>
            Upload
          </button>
          <button
            type="button"
            className={styles.customBtnPrimary}
            onClick={onScan}
            disabled={status === 'checking' || !hasText}
            aria-label={status === 'checking' ? 'Scan in progress' : 'Start forensic scan'}
          >
            {status === 'checking' ? (
              <div className={styles.loader} role="status" aria-label="Loading" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
            )}
            {status === 'checking' ? 'Scanning...' : 'Forensic Scan'}
            {status !== 'checking' && (
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '0.5rem', opacity: 0.8, fontVariationSettings: "'FILL' 0" }}>keyboard_command_key</span>
            )}
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={styles.customBtnSecondary}
            onClick={onNewScan}
            aria-label="Start a new scan"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 0" }}>refresh</span>
            New Scan
          </button>
          <button
            type="button"
            className={styles.customBtnPrimary}
            onClick={onExport}
            aria-label="Export report to PDF"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>download</span>
            Export PDF
          </button>
        </>
      )}
    </div>
  );
}
