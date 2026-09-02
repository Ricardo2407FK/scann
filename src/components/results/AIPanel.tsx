"use client";

import React from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../PlagiarismChecker.module.css';
import type { AIAnalysis, AISignal } from '@/lib/engine/types';

// ─── AI Signal Bar ──────────────────────────────────────────────────────────
function AISignalBar({ signal }: { signal: AISignal }) {
  const pct = signal.maxScore > 0 ? (signal.score / signal.maxScore) * 100 : 0;
  const barColor = pct > 60 ? 'var(--red)' : pct > 30 ? 'var(--amber)' : 'var(--green)';
  return (
    <div className={styles.signalRow} role="listitem"
      aria-label={`${signal.name}: ${signal.score} of ${signal.maxScore}`}>
      <div className={styles.signalHeader}>
        <span className={styles.signalName}>{signal.name}</span>
        <span className={styles.signalScore}>{signal.score}/{signal.maxScore}</span>
      </div>
      <div className={styles.signalBarBg} role="meter"
        aria-valuenow={signal.score} aria-valuemin={0} aria-valuemax={signal.maxScore}>
        <div className={styles.signalBarFill}
          style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className={styles.signalDesc}>{signal.description}</div>
    </div>
  );
}

// ─── AI Panel ───────────────────────────────────────────────────────────────
type AIPanelProps = {
  aiAnalysis: AIAnalysis;
  showDetail: boolean;
  onToggleDetail: () => void;
};

export default function AIPanel({ aiAnalysis, showDetail, onToggleDetail }: AIPanelProps) {
  return (
    <div className={styles.glassPanel}>
      <div className={styles.statusBox} style={{ marginBottom: 0 }}>
        <h3
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={onToggleDetail}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleDetail(); } }}
          tabIndex={0}
          role="button"
          aria-expanded={showDetail}
          aria-controls="ai-signals-list"
          aria-label={`AI Analysis: ${aiAnalysis.verdict}. ${showDetail ? 'Click to collapse' : 'Click to expand'}`}
        >
          <Brain size={15} color="var(--violet)" aria-hidden="true" />
          AI Analysis — {aiAnalysis.verdict}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }} aria-hidden="true">
            {showDetail
              ? <ChevronUp size={14} color="var(--text-muted)" />
              : <ChevronDown size={14} color="var(--text-muted)" />
            }
          </span>
        </h3>
        {showDetail && aiAnalysis.signals.length > 0 && (
          <div className={styles.signalList} id="ai-signals-list" role="list" aria-label="AI detection signals">
            {aiAnalysis.signals.map((s, i) => <AISignalBar key={i} signal={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
