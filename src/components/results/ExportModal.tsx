'use client';

import React, { useState } from 'react';

export type ExportOptions = {
  includePlagiarism: boolean;
  includeAI: boolean;
  includeStats: boolean;
};

interface ExportModalProps {
  onClose: () => void;
  onGenerate: (options: ExportOptions) => void;
}

export default function ExportModal({ onClose, onGenerate }: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includePlagiarism: true,
    includeAI: true,
    includeStats: true,
  });

  const toggle = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: { key: keyof ExportOptions; icon: string; label: string; desc: string }[] = [
    { key: 'includePlagiarism', icon: 'plagiarism', label: 'Plagiarism Report', desc: 'Matched sentences, algorithm breakdown, and document heatmap' },
    { key: 'includeAI', icon: 'psychology', label: 'AI Detection Report', desc: 'AI score verdict and all detection signals with scores' },
    { key: 'includeStats', icon: 'bar_chart', label: 'Document Statistics', desc: 'Word count, sentences, blocks, fingerprint, and confidence' },
  ];

  const enabledCount = Object.values(options).filter(Boolean).length;

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="export-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="export-modal-header">
          <div className="export-modal-title-row">
            <div className="export-modal-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#000' }}>picture_as_pdf</span>
            </div>
            <div>
              <h2 className="export-modal-title">Export Report</h2>
              <p className="export-modal-subtitle">Choose what to include in your PDF</p>
            </div>
          </div>
          <button className="export-modal-close" onClick={onClose} aria-label="Close export modal">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Always-included summary notice */}
        <div className="export-modal-always">
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#000' }}>verified</span>
          <span><strong>Score Overview</strong> is always included (score cards + executive summary)</span>
        </div>

        {/* Section toggles — using div+onClick, NOT label+input */}
        <div className="export-modal-sections">
          {sections.map(s => (
            <div
              key={s.key}
              className={`export-modal-section ${options[s.key] ? 'active' : ''}`}
              onClick={() => toggle(s.key)}
              role="switch"
              aria-checked={options[s.key]}
              tabIndex={0}
              onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(s.key); } }}
            >
              <div className="export-modal-section-left">
                <div className={`export-modal-section-icon ${options[s.key] ? 'checked' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon}</span>
                </div>
                <div className="export-modal-section-text">
                  <span className="export-modal-section-label">{s.label}</span>
                  <span className="export-modal-section-desc">{s.desc}</span>
                </div>
              </div>
              <div className={`export-modal-toggle ${options[s.key] ? 'on' : ''}`}>
                <div className="export-modal-toggle-thumb" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="export-modal-footer">
          <span className="export-modal-footer-hint">{enabledCount + 1} section{enabledCount + 1 !== 1 ? 's' : ''} selected</span>
          <div className="export-modal-footer-actions">
            <button className="export-modal-cancel" onClick={onClose}>Cancel</button>
            <button className="export-modal-generate" onClick={() => onGenerate(options)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
