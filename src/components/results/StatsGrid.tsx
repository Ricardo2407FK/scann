"use client";

import React from 'react';
import { BarChart3, Fingerprint } from 'lucide-react';
import styles from '../PlagiarismChecker.module.css';
import type { ReportStats } from '@/lib/engine/types';

// ─── Heatmap ────────────────────────────────────────────────────────────────
function Heatmap({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.heatmapLabel}><BarChart3 size={11} aria-hidden="true" />Document Heatmap</div>
      <div className={styles.heatmapBar} role="img" aria-label="Plagiarism heatmap across document sections">
        {data.map((v, i) => (
          <div key={i}
            className={`${styles.heatmapSegment} ${v > 60 ? styles.high : v > 30 ? styles.medium : v > 0 ? styles.low : styles.clean}`}
            title={`Section ${i + 1}: ${v}% flagged`}
            aria-label={`Section ${i + 1}: ${v}% flagged`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
type StatsGridProps = {
  stats: ReportStats;
  heatmap: number[];
  blockCount: number;
};

export default function StatsGrid({ stats, heatmap, blockCount }: StatsGridProps) {
  return (
    <>
      <div className={styles.statsGrid} role="list" aria-label="Scan statistics">
        <div className={styles.statItem} role="listitem"><div className={styles.statValue}>{stats.totalWords.toLocaleString()}</div><div className={styles.statLabel}>Words</div></div>
        <div className={styles.statItem} role="listitem"><div className={styles.statValue}>{stats.totalSentences}</div><div className={styles.statLabel}>Sentences</div></div>
        <div className={styles.statItem} role="listitem"><div className={styles.statValue}>{stats.uniqueSources}</div><div className={styles.statLabel}>Matches</div></div>
        <div className={styles.statItem} role="listitem"><div className={styles.statValue}>{stats.avgConfidence}%</div><div className={styles.statLabel}>Confidence</div></div>
        <div className={styles.statItem} role="listitem"><div className={styles.statValue}>{blockCount}</div><div className={styles.statLabel}>Blocks</div></div>
        <div className={styles.statItem} role="listitem"><div className={styles.statValue}>{stats.eligibleSentences}</div><div className={styles.statLabel}>Eligible</div></div>
      </div>

      <Heatmap data={heatmap} />



      {stats.documentFingerprint && (
        <div className={styles.fingerprintRow} aria-label={`Document fingerprint: ${stats.documentFingerprint.substring(0, 24)}`}>
          <Fingerprint size={11} color="var(--text-muted)" aria-hidden="true" />
          <span className={styles.fingerprintHash}>{stats.documentFingerprint.substring(0, 24)}...</span>
        </div>
      )}
    </>
  );
}
