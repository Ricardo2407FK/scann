"use client";

import React from 'react';
import styles from '../PlagiarismChecker.module.css';
import type { ReportSource } from '@/lib/engine/types';

type SourceListProps = {
  sources: ReportSource[];
};

/**
 * Generate a first-letter avatar background instead of leaking domains to Google favicons.
 */
function LetterAvatar({ domain }: { domain: string }) {
  const letter = domain.charAt(0).toUpperCase();
  return (
    <div
      className={styles.sourceFavicon}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.58rem', fontWeight: 900, color: '#000',
        background: '#B794F6', borderRadius: '4px',
      }}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
}

export default function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className={styles.sourceList}>
      <h3>Sources ({sources.length})</h3>
      {sources.map((src, idx) => (
        <div key={idx} className={styles.sourceItem} role="listitem">
          <div className={styles.sourceItemHeader}>
            <LetterAvatar domain={src.domain} />
            <a href={src.url} target="_blank" rel="noreferrer"
              aria-label={`Visit source: ${src.domain}`}>
              {src.domain}
            </a>
            <span className={styles.reliabilityBadge}>{src.reliability}</span>
          </div>
          <div className={styles.sourceMatchBar}
            role="meter" aria-valuenow={src.matchPercentage} aria-valuemin={0} aria-valuemax={100}
            aria-label={`${src.matchPercentage}% match from ${src.domain}`}>
            <div className={styles.sourceMatchFill} style={{ width: `${src.matchPercentage}%` }} />
          </div>
          <span>{src.matchPercentage}% match</span>
        </div>
      ))}
    </div>
  );
}
