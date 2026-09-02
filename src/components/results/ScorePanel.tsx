"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import styles from '../PlagiarismChecker.module.css';
import type { Report } from '@/lib/engine/types';

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, label, colorClass, size = 140 }: { score: number; label: string; colorClass: string; size?: number }) {
  const svgSize = Math.round(size * 0.85);
  const r = (svgSize - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className={styles.scoreRingWrapper} style={{ width: size, height: size }}
      role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}
      aria-label={`${label}: ${score}%`}>
      <svg className={styles.scoreRingSvg} width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <circle className={styles.scoreRingBg} cx={svgSize / 2} cy={svgSize / 2} r={r} />
        <circle className={`${styles.scoreRingFill} ${styles[colorClass]}`} cx={svgSize / 2} cy={svgSize / 2} r={r}
          strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className={styles.scoreValueOverlay}>
        <span className={styles.scoreNumber}>{score}</span>
        <span className={styles.scoreLabel}>{label}</span>
      </div>
    </div>
  );
}

// ─── Risk Context Label ─────────────────────────────────────────────────────
function RiskLabel({ score, type }: { score: number; type: 'plag' | 'ai' }) {
  let text: string;
  let cls: string;
  if (type === 'plag') {
    text = score > 40 ? 'High Risk' : score > 15 ? 'Moderate' : 'Low Risk';
    cls = score > 40 ? styles.riskHigh : score > 15 ? styles.riskMedium : styles.riskLow;
  } else {
    text = score > 60 ? 'Likely AI' : score > 30 ? 'Mixed' : 'Likely Human';
    cls = score > 60 ? styles.riskHigh : score > 30 ? styles.riskMedium : styles.riskLow;
  }
  return <span className={`${styles.scoreContext} ${cls}`}>{text}</span>;
}

// ─── Score Panel ─────────────────────────────────────────────────────────────
type ScorePanelProps = {
  report: Report | null;
};

export default function ScorePanel({ report }: ScorePanelProps) {
  const plagClass = report ? (report.score > 40 ? 'high' : report.score > 15 ? 'medium' : 'low') : 'low';
  const aiClass = report ? ((report.aiScore) > 60 ? 'aiHigh' : (report.aiScore) > 30 ? 'aiMedium' : 'aiLow') : 'aiLow';
  const origClass = report ? (report.originalityScore < 50 ? 'danger' : report.originalityScore < 75 ? 'warning' : '') : '';

  return (
    <div className={styles.glassPanel}>
      <div className={styles.scoreContainer} role="group" aria-label="Scan scores">
        <div className={styles.scoreCard}>
          <ScoreRing score={report?.score || 0} label="Plagiarized" colorClass={plagClass} />
          <h3>Content Match</h3>
          {report && <RiskLabel score={report.score} type="plag" />}
        </div>
        <div className={styles.scoreCard}>
          <ScoreRing score={report?.aiScore || 0} label="AI Text" colorClass={aiClass} />
          <h3>AI Content</h3>
          {report && <RiskLabel score={report.aiScore} type="ai" />}
        </div>
      </div>
      {report && (
        <>
          <div
            className={`${styles.originalityBadge} ${origClass ? styles[origClass] : ''}`}
            style={{ '--orig-pct': `${report.originalityScore}%` } as React.CSSProperties}
            role="status"
            aria-label={`Originality: ${report.originalityScore}%`}
          >
            <Shield size={15} aria-hidden="true" />
            <span className={styles.originalityValue}>{report.originalityScore}%</span>
            <span className={styles.originalityLabel}>Original Content</span>
          </div>
          {(report.stats.matchBreakdown.exact > 0 || report.stats.matchBreakdown.paraphrase > 0 || report.stats.matchBreakdown.conceptual > 0) && (
            <div className={styles.matchBreakdown} role="list" aria-label="Match breakdown">
              {report.stats.matchBreakdown.exact > 0 && <span className={`${styles.breakdownChip} ${styles.exact}`} role="listitem">{report.stats.matchBreakdown.exact} exact</span>}
              {report.stats.matchBreakdown.paraphrase > 0 && <span className={`${styles.breakdownChip} ${styles.paraphrase}`} role="listitem">{report.stats.matchBreakdown.paraphrase} paraphrase</span>}
              {report.stats.matchBreakdown.conceptual > 0 && <span className={`${styles.breakdownChip} ${styles.conceptual}`} role="listitem">{report.stats.matchBreakdown.conceptual} conceptual</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
