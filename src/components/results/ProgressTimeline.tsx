"use client";

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import styles from '../PlagiarismChecker.module.css';

type ProgressTimelineProps = {
  status: 'idle' | 'checking' | 'completed' | 'error';
  currentStep: number;
  totalSteps: number;
  streamStatus: string;
};

export default function ProgressTimeline({ status, currentStep, totalSteps, streamStatus }: ProgressTimelineProps) {
  // Minimal status indicator — no live analytics stepper
  if (status === 'idle') return null;

  return (
    <div className={styles.statusBox}>
      {status === 'checking' && (
        <div className={styles.scanningIndicator} role="status" aria-live="polite">
          <div className={styles.scanningDots}>
            <span /><span /><span />
          </div>
          <span className={styles.scanningLabel}>{streamStatus || 'Analyzing...'}</span>
          <span className={styles.scanningStep}>{currentStep}/{totalSteps}</span>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: 'var(--red)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          role="alert">
          <AlertCircle size={15} aria-hidden="true" />{streamStatus}
        </div>
      )}

      {status === 'completed' && (
        <div className={styles.statusComplete} role="status">
          <CheckCircle size={14} aria-hidden="true" />Scan complete
        </div>
      )}
    </div>
  );
}
