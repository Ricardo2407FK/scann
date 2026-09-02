"use client";

import React, { useState, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import styles from '../PlagiarismChecker.module.css';

type ScanInputProps = {
  text: string;
  setText: (text: string) => void;
  status: 'idle' | 'checking' | 'completed' | 'error';
  wordCount: number;
  highlightedText: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  hasReport: boolean;
  onFileUpload: (file: File) => void;
};

const ACCEPTED_TYPES = ['.txt', '.pdf', '.docx'];

export default function ScanInput({
  text, setText, status, wordCount,
  highlightedText, containerRef, hasReport, onFileUpload
}: ScanInputProps) {
  const charCount = text.length;
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Use a counter to prevent child-element dragLeave from toggling off
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (ACCEPTED_TYPES.includes(ext)) {
        // Show the success state briefly, then process
        setTimeout(() => {
          onFileUpload(file);
          setIsDragging(false);
        }, 600);
      } else {
        setIsDragging(false);
        alert(`Unsupported file type "${ext}". Please use .pdf, .docx, or .txt`);
      }
    } else {
      const droppedText = e.dataTransfer.getData('text/plain');
      if (droppedText) {
        setText(droppedText);
      }
      setIsDragging(false);
    }
  }, [setText, onFileUpload]);

  return (
    <>
      {hasReport && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1.5rem', marginBottom: '1rem' }}>
          <div className={styles.matchLegend} role="list" aria-label="Match type legend">
            <span className={styles.legendItem} role="listitem">
              <span className={`${styles.legendDot} ${styles.exact}`} aria-hidden="true" />
              Exact
            </span>
            <span className={styles.legendItem} role="listitem">
              <span className={`${styles.legendDot} ${styles.paraphrase}`} aria-hidden="true" />
              Paraphrase
            </span>
            <span className={styles.legendItem} role="listitem">
              <span className={`${styles.legendDot} ${styles.conceptual}`} aria-hidden="true" />
              Conceptual
            </span>
          </div>
        </div>
      )}

      {highlightedText ? (
        <div className={styles.customTextareaContainer}>
          <div
            ref={containerRef}
            className={styles.customTextarea}
            style={{ overflowY: 'auto' }}
            role="document"
            aria-label="Scan results with highlighted matches. Click highlighted text for details."
            tabIndex={0}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(highlightedText, {
                ALLOWED_TAGS: ['span', 'br'],
                ALLOWED_ATTR: ['class', 'data-urls', 'data-snippets', 'data-match-type', 'data-confidence', 'data-algorithm', 'title'],
              })
            }}
          />
        </div>
      ) : (
        <div>
          <div className={styles.customStatsBar}>
            <div className={styles.customStatsPill}>
              <span style={{ color: wordCount > 15000 ? '#dc2626' : wordCount > 12000 ? '#d97706' : undefined }}>{wordCount.toLocaleString()} / 15,000 words</span>
              <span style={{ width: '5px', height: '5px', background: '#000', borderRadius: '50%', flexShrink: 0 }}></span>
              <span>{charCount.toLocaleString()} chars</span>
            </div>
          </div>
          <div
            className={styles.customTextareaContainer}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              className={styles.customTextarea}
              placeholder="Paste your text or drag a document here for forensic scanning..."
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={status === 'checking'}
              aria-label="Text input for plagiarism scanning"
            />
            {isDragging && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(183,148,246,0.15)', border: '2px dashed #000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', zIndex: 5 }}>
                Drop file to upload
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
