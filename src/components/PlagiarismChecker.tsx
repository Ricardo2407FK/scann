"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import styles from './PlagiarismChecker.module.css';

import type { Report, ActiveViewer } from '@/lib/engine/types';

// Sub-components
import ScanInput from './scan/ScanInput';
import ScanActions from './scan/ScanActions';
import ForensicViewer from './results/ForensicViewer';
import ScanResultsView from './results/ScanResultsView';
import ExportModal from './results/ExportModal';
import type { ExportOptions } from './results/ExportModal';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PlagiarismChecker() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'completed' | 'error'>('idle');
  const [streamStatus, setStreamStatus] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(8);
  const [report, setReport] = useState<Report | null>(null);
  const [activeViewer, setActiveViewer] = useState<ActiveViewer | null>(null);
  const [, setPartialMatches] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup: abort any in-flight scan on unmount
  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0, [text]);

  // File Upload
  const handleFileUpload = useCallback(async (file: File) => {
    // Clear previous scan state
    setReport(null);
    setCurrentStep(0);
    setPartialMatches(0);
    setActiveViewer(null);

    if (file.size > 15 * 1024 * 1024) {
      alert('File is too large. Maximum size is 15MB.');
      return;
    }

    try {
      if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        setStreamStatus('Extracting text from file...');
        setStatus('checking');
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/parse-pdf', { method: 'POST', body: fd });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('[Scanterity] Parse API error:', res.status, errBody);
          throw new Error(errBody.error || `Parse failed (${res.status})`);
        }
        const data = await res.json();
        if (!data.text || data.text.trim().length === 0) {
          throw new Error('Document appears to be empty or contains only images.');
        }
        setText(data.text);
        setStatus('idle');
      } else if (file.name.endsWith('.txt')) {
        setText(await file.text());
        setStatus('idle');
      } else {
        alert('Unsupported file type. Upload .pdf, .docx, or .txt');
      }
    } catch (err) {
      console.error('[Scanterity] File upload error:', err);
      const msg = err instanceof Error ? err.message : 'Error parsing file.';
      setStatus('error');
      setStreamStatus(msg);
    }
  }, []);

  // Check Handler
  const handleCheck = useCallback(async () => {
    if (!text.trim()) return;
    // Abort any previous in-flight scan
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('checking'); setReport(null); setCurrentStep(0); setPartialMatches(0);
    setStreamStatus('Initializing Scanterity engine...');

    // Client-side timeout: 180s (generous buffer over server's 150s)
    const clientTimeout = setTimeout(() => {
      controller.abort();
      setStatus('error');
      setStreamStatus('Scan timed out. This can happen with slow network or heavy server load. Please try again.');
    }, 180_000);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) {
        if (res.status === 429) {
          setStatus('error');
          setStreamStatus('Rate limit exceeded. Please wait a moment and try again.');
          return;
        }
        throw new Error('Check failed');
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const d = JSON.parse(line);
            if (d.type === 'status') {
              setStreamStatus(d.message);
              if (typeof d.step === 'number') setCurrentStep(d.step);
              if (typeof d.totalSteps === 'number') setTotalSteps(d.totalSteps);
            } else if (d.type === 'result') {
              setReport(d.report);
              setStatus('completed');
              setCurrentStep(prev => d.totalSteps || prev);
            }
            else if (d.type === 'error') { setStatus('error'); setStreamStatus(d.message); }
          } catch { /* ignore parse errors from partial chunks */ }
        }
      }
    } catch (err) {
      // Don't show error if we intentionally aborted
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setStatus('error');
      setStreamStatus('Connection failed. Please check your network and try again.');
    } finally {
      clearTimeout(clientTimeout);
    }
  }, [text]);

  // Export Modal handlers
  const openExportModal = useCallback(() => setShowExportModal(true), []);
  const closeExportModal = useCallback(() => setShowExportModal(false), []);

  // ═══════════════════════════════════════════════════════════════════
  // PDF Export — Professional Forensic Report (Scribbr/Turnitin Style)
  // ═══════════════════════════════════════════════════════════════════

  // Helper: download via data: URI (avoids blob URLs → avoids UUID filenames)
  function downloadViaDataUri(pdfBytes: ArrayBuffer, name: string): void {
    const uint8 = new Uint8Array(pdfBytes);
    let binary = '';
    // Convert in chunks to avoid call stack overflow for large PDFs
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);
    const dataUri = 'data:application/pdf;base64,' + b64;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 200);
    console.log('[Scanterity] PDF saved via data URI (' + Math.round(uint8.length / 1024) + ' KB).');
  }

  const generatePDF = useCallback(async (options: ExportOptions) => {
    if (!report) return;
    setShowExportModal(false);

    try {
      console.log('[Scanterity] Starting PDF generation...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pw = pdf.internal.pageSize.getWidth();  // 210
    const ph = pdf.internal.pageSize.getHeight(); // 297
    const ml = 18;   // margin left
    const mr = pw - 18; // margin right
    const cw = mr - ml; // content width
    let y = 0;
    let pageNum = 1;

    // ── Color Palette (refined, professional) ───────────────────
    const C = {
      primary:   [16, 140, 100]  as [number, number, number],  // teal-green
      dark:      [24, 24, 40]    as [number, number, number],
      heading:   [32, 32, 50]    as [number, number, number],
      body:      [55, 65, 80]    as [number, number, number],
      muted:     [130, 140, 155] as [number, number, number],
      faint:     [175, 185, 195] as [number, number, number],
      line:      [218, 224, 232] as [number, number, number],
      bg:        [246, 248, 252] as [number, number, number],
      bgAlt:     [240, 243, 248] as [number, number, number],
      white:     [255, 255, 255] as [number, number, number],
      red:       [210, 45, 45]   as [number, number, number],
      redBg:     [254, 243, 243] as [number, number, number],
      amber:     [200, 115, 10]  as [number, number, number],
      amberBg:   [255, 250, 235] as [number, number, number],
      green:     [22, 155, 75]   as [number, number, number],
      greenBg:   [238, 252, 243] as [number, number, number],
      blue:      [40, 95, 220]   as [number, number, number],
      blueBg:    [238, 244, 255] as [number, number, number],
      teal:      [14, 140, 128]  as [number, number, number],
      tealBg:    [238, 252, 249] as [number, number, number],
    };

    // ── Helpers ──────────────────────────────────────────────────
    const setC = (c: [number, number, number]) => pdf.setTextColor(c[0], c[1], c[2]);
    const setF = (c: [number, number, number]) => pdf.setFillColor(c[0], c[1], c[2]);
    const setD = (c: [number, number, number]) => pdf.setDrawColor(c[0], c[1], c[2]);
    const rr = (x: number, yy: number, w: number, h: number, r: number, color: [number, number, number]) => {
      setF(color); pdf.roundedRect(x, yy, w, h, r, r, 'F');
    };

    const addFooter = () => {
      setD(C.line); pdf.setLineWidth(0.3);
      pdf.line(ml, ph - 16, mr, ph - 16);
      pdf.setFontSize(7); setC(C.muted); pdf.setFont('helvetica', 'normal');
      pdf.text('Scanterity — Document Originality Report', ml, ph - 11);
      pdf.text(`Page ${pageNum}`, mr, ph - 11, { align: 'right' });
      pdf.setFontSize(6); setC(C.faint);
      pdf.text('This report is generated by automated analysis and should be reviewed by a qualified assessor.', ml, ph - 7);
    };

    const newPage = () => { addFooter(); pdf.addPage(); pageNum++; y = 18; };
    const check = (needed: number) => { if (y + needed > ph - 24) newPage(); };

    const drawDivider = (marginTop = 4, marginBottom = 4) => {
      y += marginTop;
      setD(C.line); pdf.setLineWidth(0.25); pdf.line(ml, y, mr, y);
      y += marginBottom;
    };

    const drawSectionTitle = (title: string, subtitle?: string) => {
      check(20);
      // Left accent bar
      rr(ml, y, 3, subtitle ? 14 : 10, 1.5, C.primary);
      // Title
      pdf.setFontSize(13); setC(C.heading); pdf.setFont('helvetica', 'bold');
      pdf.text(title, ml + 8, y + 7);
      if (subtitle) {
        pdf.setFontSize(8); setC(C.muted); pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, ml + 8, y + 12.5);
      }
      pdf.setFont('helvetica', 'normal');
      y += subtitle ? 20 : 15;
    };

    // ════════════════════════════════════════════════════════════════
    //  PAGE 1: COVER — Overall Similarity + Document Info
    // ════════════════════════════════════════════════════════════════

    // Top accent band
    setF(C.primary); pdf.rect(0, 0, pw, 4, 'F');

    y = 18;

    // Brand header
    pdf.setFontSize(24); setC(C.primary); pdf.setFont('helvetica', 'bold');
    pdf.text('Scanterity', ml, y);
    pdf.setFontSize(9); setC(C.faint); pdf.setFont('helvetica', 'normal');
    pdf.text('ORIGINALITY REPORT', ml + pdf.getTextWidth('Scanterity ') + 4, y - 3);
    y += 10;

    // ── Large "overall similarity" display (Scribbr-style) ──
    check(55);
    rr(ml, y, cw, 48, 6, C.bg);
    setD(C.line); pdf.setLineWidth(0.5);
    pdf.roundedRect(ml, y, cw, 48, 6, 6);

    pdf.setFontSize(10); setC(C.muted); pdf.setFont('helvetica', 'normal');
    pdf.text('overall similarity', ml + cw / 2, y + 10, { align: 'center' });

    // Big percentage
    const scoreColor: [number, number, number] = report.score > 40 ? C.red : report.score > 15 ? C.amber : C.green;
    pdf.setFontSize(48); setC(scoreColor); pdf.setFont('helvetica', 'bold');
    pdf.text(`${report.score}%`, ml + cw / 2, y + 32, { align: 'center' });

    // Risk label
    const riskLabel = report.score > 40 ? 'HIGH RISK' : report.score > 15 ? 'MODERATE' : 'LOW RISK';
    const riskBg = report.score > 40 ? C.redBg : report.score > 15 ? C.amberBg : C.greenBg;
    const riskW = pdf.getTextWidth(riskLabel) * 1.5 + 12;
    rr(ml + cw / 2 - riskW / 2, y + 36, riskW, 8, 4, riskBg);
    pdf.setFontSize(8); setC(scoreColor); pdf.setFont('helvetica', 'bold');
    pdf.text(riskLabel, ml + cw / 2, y + 41.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal');

    y += 55;

    // ── Document metadata table (Title, Date, Report ID) ──
    check(28);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const reportId = report.stats.documentFingerprint
      ? report.stats.documentFingerprint.substring(0, 20)
      : Math.random().toString(36).substring(2, 22);

    rr(ml, y, cw, 22, 4, C.bgAlt);
    pdf.setFontSize(8); setC(C.muted); pdf.setFont('helvetica', 'bold');
    pdf.text('Title:', ml + 6, y + 7);
    pdf.text('Date:', ml + cw * 0.55, y + 7);
    pdf.text('Report ID:', ml + 6, y + 15);

    pdf.setFont('helvetica', 'normal'); setC(C.dark);
    pdf.text('Document Analysis', ml + 22, y + 7);
    pdf.text(dateStr, ml + cw * 0.55 + 15, y + 7);
    pdf.setFontSize(7); setC(C.body);
    pdf.text(reportId, ml + 30, y + 15);
    y += 28;

    // ── Score overview cards (always included) ──
    check(38);
    type CardDef = { score: number; label: string; sublabel: string; bg: [number, number, number]; fg: [number, number, number] };
    const cards: CardDef[] = [];

    if (options.includePlagiarism) {
      cards.push({
        score: report.score, label: 'PLAGIARISM',
        sublabel: report.score > 40 ? 'High Risk' : report.score > 15 ? 'Moderate' : 'Low Risk',
        bg: report.score > 40 ? C.redBg : report.score > 15 ? C.amberBg : C.greenBg,
        fg: report.score > 40 ? C.red : report.score > 15 ? C.amber : C.green,
      });
      cards.push({
        score: report.originalityScore, label: 'ORIGINALITY',
        sublabel: report.originalityScore >= 65 ? 'Original' : report.originalityScore >= 35 ? 'Moderate' : 'Low',
        bg: report.originalityScore >= 65 ? C.greenBg : report.originalityScore >= 35 ? C.amberBg : C.redBg,
        fg: report.originalityScore >= 65 ? C.green : report.originalityScore >= 35 ? C.amber : C.red,
      });
    }

    if (options.includeAI) {
      cards.push({
        score: report.aiScore, label: 'AI CONTENT',
        sublabel: report.aiScore > 50 ? 'Likely AI' : report.aiScore > 30 ? 'Mixed' : 'Likely Human',
        bg: report.aiScore > 50 ? C.blueBg : report.aiScore > 30 ? C.amberBg : C.tealBg,
        fg: report.aiScore > 50 ? C.blue : report.aiScore > 30 ? C.amber : C.teal,
      });
    }

    if (cards.length > 0) {
      const cardW = (cw - (cards.length - 1) * 4) / cards.length;
      for (let ci = 0; ci < cards.length; ci++) {
        const c = cards[ci];
        const cx = ml + ci * (cardW + 4);
        rr(cx, y, cardW, 32, 5, c.bg);
        pdf.setFontSize(28); setC(c.fg); pdf.setFont('helvetica', 'bold');
        pdf.text(`${c.score}%`, cx + cardW / 2, y + 17, { align: 'center' });
        pdf.setFontSize(7); setC(C.muted); pdf.setFont('helvetica', 'bold');
        pdf.text(c.label, cx + cardW / 2, y + 23, { align: 'center' });
        pdf.setFontSize(6.5); setC(c.fg); pdf.setFont('helvetica', 'normal');
        pdf.text(c.sublabel, cx + cardW / 2, y + 28, { align: 'center' });
      }
      y += 36;
    }

    // ── Executive Summary ──
    check(30);
    rr(ml, y, cw, 26, 4, C.bgAlt);
    rr(ml, y, 3, 26, 1.5, C.primary);

    pdf.setFontSize(10); setC(C.heading); pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', ml + 8, y + 7);
    pdf.setFont('helvetica', 'normal');

    let summaryText = '';
    if (options.includePlagiarism) {
      const matchedCount = report.matches.filter(m => m.matched).length;
      if (report.score <= 5) {
        summaryText = `This document of ${report.stats.totalWords.toLocaleString()} words was analyzed using comprehensive multi-signal analysis across ${report.stats.eligibleSentences} sentence groups. No significant content matches were detected. `;
      } else if (report.score <= 20) {
        summaryText = `Analysis of ${report.stats.totalWords.toLocaleString()} words found ${report.score}% similarity across ${matchedCount} matched passages. These may indicate common phrasing or referenced material. `;
      } else {
        summaryText = `Analysis of ${report.stats.totalWords.toLocaleString()} words detected ${report.score}% similarity across ${matchedCount} matched passages from ${report.sources.length} source${report.sources.length !== 1 ? 's' : ''}. Review recommended. `;
      }
    } else {
      summaryText = `Document of ${report.stats.totalWords.toLocaleString()} words (${report.stats.totalSentences} sentences) analyzed. `;
    }
    if (options.includeAI) {
      summaryText += `AI detection scored ${report.aiScore}% — verdict: "${report.aiAnalysis.verdict}".`;
    }

    pdf.setFontSize(7.5); setC(C.body);
    const sLines = pdf.splitTextToSize(summaryText, cw - 14);
    pdf.text(sLines, ml + 8, y + 13);
    y += 32;

    // Quick stats row
    if (options.includeStats) {
      check(14);
      const qStats = [
        { label: 'Words', val: report.stats.totalWords.toLocaleString() },
        { label: 'Sentences', val: String(report.stats.totalSentences) },
        { label: 'Analyzed', val: String(report.stats.eligibleSentences) },
        { label: 'Sources', val: String(report.sources.length) },
        { label: 'Confidence', val: `${report.stats.avgConfidence}%` },
      ];
      const qw = cw / qStats.length;
      for (let i = 0; i < qStats.length; i++) {
        const qx = ml + i * qw;
        pdf.setFontSize(12); setC(C.primary); pdf.setFont('helvetica', 'bold');
        pdf.text(qStats[i].val, qx + qw / 2, y + 5, { align: 'center' });
        pdf.setFontSize(6); setC(C.faint); pdf.setFont('helvetica', 'normal');
        pdf.text(qStats[i].label.toUpperCase(), qx + qw / 2, y + 10, { align: 'center' });
      }
      y += 15;
    }

    // ════════════════════════════════════════════════════════════════
    //  PLAGIARISM MATCHES — Scribbr/Turnitin Style
    // ════════════════════════════════════════════════════════════════
    if (options.includePlagiarism) {
      drawDivider(6, 6);
      drawSectionTitle('Plagiarism Analysis', `${report.matches.filter(m => m.matched).length} matched passages from ${report.sources.length} sources`);

      const matchedSentences = report.matches.filter(m => m.matched);

      if (matchedSentences.length === 0 && report.score <= 5) {
        // ── Clean scan ──
        check(20);
        rr(ml, y, cw, 16, 4, C.greenBg);
        rr(ml, y, 3, 16, 1.5, C.green);
        pdf.setFontSize(10); setC(C.green); pdf.setFont('helvetica', 'bold');
        pdf.text('No plagiarism detected', ml + 10, y + 7);
        pdf.setFontSize(7.5); setC(C.body); pdf.setFont('helvetica', 'normal');
        pdf.text('All analyzed content appears to be original. No significant text matches were found.', ml + 10, y + 12.5);
        y += 22;
      } else if (matchedSentences.length > 0) {
        // ── Match type breakdown bar ──
        const bd = report.stats.matchBreakdown;
        const total = bd.exact + bd.paraphrase + bd.conceptual;
        if (total > 0) {
          check(18);
          rr(ml, y, cw, 8, 3, C.bgAlt);
          const ew = Math.max(0, (bd.exact / total) * cw);
          const ppw = Math.max(0, (bd.paraphrase / total) * cw);
          let bx = ml;
          if (ew > 0) { setF(C.red); pdf.roundedRect(bx, y, ew, 8, 3, 3, 'F'); bx += ew; }
          if (ppw > 0) { setF(C.amber); pdf.rect(bx, y, ppw, 8, 'F'); bx += ppw; }
          if (total - bd.exact - bd.paraphrase > 0) { setF(C.blue); pdf.roundedRect(bx, y, cw - ew - ppw, 8, 3, 3, 'F'); }
          y += 11;

          // Legend
          const legends = [
            { label: `Exact (${bd.exact})`, color: C.red },
            { label: `Paraphrase (${bd.paraphrase})`, color: C.amber },
            { label: `Conceptual (${bd.conceptual})`, color: C.blue },
          ];
          let lx = ml;
          for (const item of legends) {
            setF(item.color); pdf.circle(lx + 2, y + 0.5, 1.5, 'F');
            pdf.setFontSize(7); setC(C.body); pdf.setFont('helvetica', 'normal');
            pdf.text(item.label, lx + 5, y + 1.5);
            lx += 48;
          }
          y += 8;
        }

        // ── "Your plagiarism matches are listed below" ──
        check(10);
        pdf.setFontSize(9); setC(C.heading); pdf.setFont('helvetica', 'bold');
        pdf.text('Your plagiarism matches are listed below', ml, y + 4);
        pdf.setFont('helvetica', 'normal');
        y += 12;

        // ── Match cards — Scribbr/Turnitin style ──
        const topMatches = matchedSentences.slice(0, 30);

        for (let mi = 0; mi < topMatches.length; mi++) {
          const m = topMatches[mi];
          const conf = Math.round(m.confidence * 100);
          const mt = m.matchType.toLowerCase();
          const isExact = mt.includes('exact') || mt.includes('shingl');
          const isParaphrase = mt.includes('paraphras') || mt.includes('reorder') || mt.includes('fuzzy') || mt.includes('cross-boundary') || mt.includes('structural') || mt.includes('character') || mt.includes('dice') || mt.includes('lcs') || mt.includes('idf') || mt.includes('ensemble') || mt.includes('cosine') || mt.includes('jaccard') || mt.includes('edit');
          // Human-readable label (hide algorithm internals)
          const matchLabel = isExact ? 'Exact Match' : isParaphrase ? 'Paraphrase' : 'Similar Concept';
          const typeColor: [number, number, number] = isExact ? C.red : isParaphrase ? C.amber : C.blue;

          // Pre-calculate heights
          const sentText = m.sentence;
          const sentLines = pdf.splitTextToSize(sentText, cw - 8);
          const sourceUrl = m.urls.length > 0 ? m.urls[0] : '';
          const urlLines = sourceUrl ? pdf.splitTextToSize(sourceUrl, cw - 8) : [];
          const snippetText = m.snippets.length > 0 ? m.snippets[0] : '';
          const snippetLines = snippetText ? pdf.splitTextToSize(`...${snippetText.substring(0, 400)}...`, cw - 16) : [];
          const neededHeight = 16 + sentLines.length * 3.8 + (urlLines.length > 0 ? urlLines.length * 3.2 + 4 : 0) + (snippetLines.length > 0 ? snippetLines.length * 3.2 + 10 : 0);

          check(neededHeight + 8);

          // ── Top separator line ──
          setD(C.line); pdf.setLineWidth(0.3); pdf.line(ml, y, mr, y);
          y += 6;

          // ── "Match #1      72% similar" ──
          pdf.setFontSize(11); setC(C.heading); pdf.setFont('helvetica', 'bold');
          pdf.text(`Match #${mi + 1}`, ml, y + 1);

          // Similarity badge
          const simText = `${conf}% similar`;
          const simW = pdf.getTextWidth(simText) + 10;
          rr(ml + 32, y - 4, simW, 8, 4, typeColor);
          pdf.setFontSize(8); pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold');
          pdf.text(simText, ml + 37, y + 1);

          // Match type label on right (human-readable, no algorithm name)
          pdf.setFontSize(7); setC(C.muted); pdf.setFont('helvetica', 'normal');
          pdf.text(matchLabel, mr, y + 1, { align: 'right' });

          y += 10;

          // ── Matched sentence (bold) ──
          pdf.setFontSize(9); setC(C.dark); pdf.setFont('helvetica', 'bold');
          pdf.text(sentLines, ml + 4, y);
          pdf.setFont('helvetica', 'normal');
          y += sentLines.length * 3.8 + 3;

          // ── Source URL (green/accent) ──
          if (sourceUrl) {
            pdf.setFontSize(7.5); setC(C.primary); pdf.setFont('helvetica', 'normal');
            pdf.text(urlLines, ml + 4, y);
            y += urlLines.length * 3.2 + 3;
          }

          // ── Source snippet (blockquote style) ──
          if (snippetLines.length > 0) {
            const blockH = snippetLines.length * 3.2 + 6;
            rr(ml + 4, y, cw - 8, blockH, 3, C.bgAlt);
            // Left colored bar
            setF(typeColor); pdf.rect(ml + 4, y, 2.5, blockH, 'F');
            pdf.setFontSize(7); setC(C.body); pdf.setFont('helvetica', 'normal');
            pdf.text(snippetLines, ml + 11, y + 4);
            y += blockH + 3;
          }

          y += 4;
        }

        if (matchedSentences.length > 30) {
          check(10);
          pdf.setFontSize(7.5); setC(C.muted); pdf.setFont('helvetica', 'italic');
          pdf.text(`... and ${matchedSentences.length - 30} more matched passages (showing top 30)`, ml, y + 3);
          y += 10;
        }
      }

      // Algorithm Contributions table removed — reveals internal detection methodology

      // ══ Sources Found Table ══
      if (report.sources.length > 0) {
        drawDivider(4, 6);
        drawSectionTitle('Sources Found', `${report.sources.length} unique source${report.sources.length !== 1 ? 's' : ''} identified`);

        check(10);
        rr(ml, y, cw, 8, 3, C.primary);
        pdf.setFontSize(7); pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold');
        pdf.text('#', ml + 4, y + 5.5);
        pdf.text('SOURCE', ml + 12, y + 5.5);
        pdf.text('MATCH', mr - 42, y + 5.5);
        pdf.text('TYPE', mr - 5, y + 5.5, { align: 'right' });
        pdf.setFont('helvetica', 'normal'); y += 10;

        const topSources = report.sources.slice(0, 15);
        for (let si = 0; si < topSources.length; si++) {
          check(14);
          const src = topSources[si];
          if (si % 2 === 0) rr(ml, y, cw, 12, 0, C.bg);

          pdf.setFontSize(7); setC(C.faint); pdf.setFont('helvetica', 'bold');
          pdf.text(String(si + 1), ml + 4, y + 5);

          pdf.setFontSize(7.5); setC(C.dark); pdf.setFont('helvetica', 'bold');
          const domain = src.domain.length > 35 ? src.domain.substring(0, 35) + '…' : src.domain;
          pdf.text(domain, ml + 12, y + 5);

          pdf.setFontSize(5.5); setC(C.faint); pdf.setFont('helvetica', 'normal');
          const url = src.url.length > 70 ? src.url.substring(0, 70) + '…' : src.url;
          pdf.text(url, ml + 12, y + 9.5);

          // Match bar
          const barX = mr - 44;
          const barW = 26;
          rr(barX, y + 2.5, barW, 4, 2, C.bgAlt);
          const pctW = Math.max(1, (src.matchPercentage / 100) * barW);
          const pctColor: [number, number, number] = src.matchPercentage > 40 ? C.red : src.matchPercentage > 15 ? C.amber : C.green;
          setF(pctColor); pdf.roundedRect(barX, y + 2.5, pctW, 4, 2, 2, 'F');
          pdf.setFontSize(6.5); setC(C.body); pdf.setFont('helvetica', 'bold');
          pdf.text(`${src.matchPercentage}%`, barX + barW + 2, y + 5.5);

          const relColor: [number, number, number] = src.reliability === 'Academic' ? C.green : src.reliability === 'News' ? C.blue : C.muted;
          pdf.setFontSize(6); setC(relColor); pdf.setFont('helvetica', 'bold');
          pdf.text(src.reliability || 'General', mr - 5, y + 5, { align: 'right' });
          y += 12;
        }

        if (report.sources.length > 15) {
          check(8);
          pdf.setFontSize(7); setC(C.muted); pdf.setFont('helvetica', 'italic');
          pdf.text(`... and ${report.sources.length - 15} more sources`, ml, y + 3);
          y += 8;
        }
        y += 4;
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  AI DETECTION REPORT
    // ════════════════════════════════════════════════════════════════
    if (options.includeAI) {
      drawDivider(6, 6);
      const signals = report.aiAnalysis.signals;
      drawSectionTitle('AI Content Analysis', `${signals.length} linguistic signals evaluated`);

      // Verdict banner
      check(18);
      const vBg = report.aiScore > 50 ? C.blueBg : report.aiScore > 30 ? C.amberBg : C.tealBg;
      const vFg = report.aiScore > 50 ? C.blue : report.aiScore > 30 ? C.amber : C.teal;
      rr(ml, y, cw, 14, 4, vBg);
      pdf.setFontSize(10); setC(vFg); pdf.setFont('helvetica', 'bold');
      pdf.text(report.aiAnalysis.verdict, ml + 6, y + 9);
      rr(mr - 28, y + 3, 24, 8, 3, vFg);
      pdf.setFontSize(8); pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold');
      pdf.text(`${report.aiScore}/100`, mr - 16, y + 8.5, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      y += 20;

      // Context paragraph
      const aiContext = report.aiScore > 50
        ? 'Multiple linguistic patterns associated with AI-generated text were detected, including uniform sentence structure and predictable word distributions. Manual review recommended.'
        : report.aiScore > 20
        ? 'Some AI-like patterns detected, but overall writing style is predominantly consistent with human authorship.'
        : 'The document displays strong indicators of human authorship, including varied vocabulary and natural sentence rhythm.';
      pdf.setFontSize(8); setC(C.body); pdf.setFont('helvetica', 'normal');
      const ctxLines = pdf.splitTextToSize(aiContext, cw);
      check(ctxLines.length * 4 + 4);
      pdf.text(ctxLines, ml, y + 3);
      y += ctxLines.length * 4 + 6;

      // Signal table
      if (signals.length > 0) {
        check(10);
        rr(ml, y, cw, 8, 3, vFg);
        pdf.setFontSize(7); pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold');
        pdf.text('SIGNAL', ml + 5, y + 5.5);
        pdf.text('SCORE', ml + cw * 0.42, y + 5.5);
        pdf.text('INDICATOR', mr - 5, y + 5.5, { align: 'right' });
        pdf.setFont('helvetica', 'normal'); y += 10;

        for (let si = 0; si < signals.length; si++) {
          check(12);
          const s = signals[si];
          if (si % 2 === 0) rr(ml, y, cw, 10, 0, C.bg);
          pdf.setFontSize(7.5); setC(C.dark); pdf.setFont('helvetica', 'bold');
          pdf.text(s.name, ml + 5, y + 4.5);
          pdf.setFont('helvetica', 'normal');

          const barW = cw * 0.28;
          const barX = ml + cw * 0.42;
          rr(barX, y + 2, barW, 3.5, 1.8, C.bgAlt);
          const pct = s.maxScore > 0 ? s.score / s.maxScore : 0;
          const fillW = Math.max(0, barW * pct);
          if (fillW > 0) {
            const clr: [number, number, number] = pct > 0.66 ? C.red : pct > 0.33 ? C.amber : C.green;
            setF(clr); pdf.roundedRect(barX, y + 2, fillW, 3.5, 1.8, 1.8, 'F');
          }

          setC(C.muted); pdf.setFontSize(7);
          pdf.text(`${s.score}/${s.maxScore}`, mr - 5, y + 4.5, { align: 'right' });

          pdf.setFontSize(6); setC(C.faint);
          const dLines = pdf.splitTextToSize(s.description, cw - 10);
          pdf.text(dLines[0] || '', ml + 5, y + 8.5);
          y += 10;
        }
        y += 4;
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  DOCUMENT STATISTICS
    // ════════════════════════════════════════════════════════════════
    if (options.includeStats) {
      drawDivider(6, 6);
      drawSectionTitle('Document Statistics', 'Complete analysis metrics and document fingerprint');

      check(50);
      const statItems = [
        { label: 'Total Words', value: report.stats.totalWords.toLocaleString() },
        { label: 'Total Sentences', value: report.stats.totalSentences.toLocaleString() },
        { label: 'Analyzed', value: report.stats.eligibleSentences.toLocaleString() },
        { label: 'Sources Found', value: report.sources.length.toLocaleString() },
        { label: 'Matched Blocks', value: report.blockCount.toLocaleString() },
        { label: 'Avg Confidence', value: `${report.stats.avgConfidence}%` },
      ];

      const cols = 3;
      const gap = 4;
      const scW = (cw - gap * (cols - 1)) / cols;
      for (let i = 0; i < statItems.length; i++) {
        if (i % cols === 0 && i > 0) y += 20;
        check(20);
        const col = i % cols;
        const sx = ml + col * (scW + gap);
        rr(sx, y, scW, 17, 4, C.bg);
        pdf.setFontSize(14); setC(C.primary); pdf.setFont('helvetica', 'bold');
        pdf.text(statItems[i].value, sx + 5, y + 9);
        pdf.setFontSize(6); setC(C.muted); pdf.setFont('helvetica', 'normal');
        pdf.text(statItems[i].label.toUpperCase(), sx + 5, y + 14);
      }
      y += 24;

      // Fingerprint
      if (report.stats.documentFingerprint) {
        check(16);
        rr(ml, y, cw, 13, 4, C.bgAlt);
        rr(ml, y, 3, 13, 1.5, C.primary);
        pdf.setFontSize(7); setC(C.body); pdf.setFont('helvetica', 'bold');
        pdf.text('DOCUMENT FINGERPRINT', ml + 8, y + 5);
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6); setC(C.muted);
        pdf.text(report.stats.documentFingerprint, ml + 8, y + 10);
        y += 18;
      }

      // Methodology note — keep generic, no algorithm details
      check(16);
      rr(ml, y, cw, 12, 4, C.bg);
      pdf.setFontSize(6.5); setC(C.faint); pdf.setFont('helvetica', 'italic');
      const methodNote = 'Generated by Scanterity using proprietary multi-signal text analysis. This document has been scanned against billions of web pages, academic papers, and published content to assess originality.';
      const mLines = pdf.splitTextToSize(methodNote, cw - 10);
      pdf.text(mLines, ml + 5, y + 5);
      pdf.setFont('helvetica', 'normal');
      y += 16;
    }

    // ── Final footer ──────────────────────────────────────────────
    addFooter();

    // ── Download the PDF ───────────────────────────────────────────
    const pdfBytes = pdf.output('arraybuffer');
    const fileName = 'Scanterity_Forensic_Report.pdf';

    // Try modern File System Access API first (shows native Save As dialog)
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(new Uint8Array(pdfBytes));
        await writable.close();
        console.log('[Scanterity] PDF saved via File System API.');
      } catch (fsErr) {
        // User cancelled the save dialog — not an error
        if (fsErr instanceof Error && fsErr.name === 'AbortError') {
          console.log('[Scanterity] Save cancelled by user.');
        } else {
          console.warn('[Scanterity] File System API failed, using data URI fallback:', fsErr);
          downloadViaDataUri(pdfBytes, fileName);
        }
      }
    } else {
      // Fallback: data: URI download (avoids blob URLs which produce UUID filenames)
      downloadViaDataUri(pdfBytes, fileName);
    }
    } catch (err) {
      console.error('[Scanterity] PDF generation FAILED:', err);
      alert('PDF generation failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [report]);


  // Highlight click handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.classList.contains('plagiarism-highlight')) {
        document.querySelectorAll('.plagiarism-highlight').forEach(el => el.classList.remove('active'));
        t.classList.add('active');
        try {
          setActiveViewer({
            text: t.textContent || '', snippets: JSON.parse(t.getAttribute('data-snippets') || '[]'),
            urls: JSON.parse(t.getAttribute('data-urls') || '[]'),
            matchType: t.getAttribute('data-match-type') || '', confidence: t.getAttribute('data-confidence') || '0',
            algorithm: t.getAttribute('data-algorithm') || '',
          });
        } catch { /* ignore */ }
      }
    };
    const c = containerRef.current;
    if (c) c.addEventListener('click', handler);
    return () => { if (c) c.removeEventListener('click', handler); };
  }, [report]);

  // Reset handler
  const handleNewScan = useCallback(() => {
    abortControllerRef.current?.abort(); // Cancel any in-flight scan
    setReport(null);
    setStatus('idle');
    setStreamStatus('');
    setCurrentStep(0);
    setPartialMatches(0);
    setActiveViewer(null);
  }, []);

  // Determine if we're in "idle" hero mode or "results" mode
  const showHero = status === 'idle';

  return (
    <div className={styles.container}>
      {/* ─── Header ────────────────────────────────────────────────────── */}
      {(!report || status !== 'completed') && (
        <nav className={styles.customNav}>
          <div className={styles.customNavInner}>
            <div className={styles.navLogo} style={{ cursor: 'pointer' }}>
              <img src="/Scanterity.png" alt="Scanterity Logo" className={styles.scanterityLogo} />
            </div>

            <div className={styles.customNavLinks} role="navigation" aria-label="Main navigation">
              <button type="button" className={`${styles.customNavLink} ${styles.active}`} aria-current="page">Scanner</button>
              <button type="button" className={styles.customNavLink}>Pricing</button>
              <button type="button" className={styles.customNavLink}>Enterprise</button>
              <button type="button" className={styles.customNavLink}>Resources</button>
            </div>

            <div className={styles.customNavRight}>
              <button className={`${styles.customBtnPrimary} ${styles.customNavGetStarted}`} style={{ padding: '0.5rem 1.5rem', fontSize: '14px' }}>
                Get Started
              </button>
              <button className={styles.customNavHamburger} aria-label="Open menu">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Background Decorations */}
      {showHero && (
        <>
          <div className={`${styles.blob1} glassmorphism`}></div>
          <div className={`${styles.blob2} glassmorphism`}></div>
        </>
      )}

      {showHero ? (
        /* ─── Idle: Hero Layout ─────────────────────────────────────────── */
        <main className={styles.customMain}>
          <section className={styles.customHeroSection}>
            <h1 className={styles.customHeroTitle}>Free Plagiarism Checker & AI Detector</h1>
            <h2 className={styles.customHeroSubtitle}>Forensic-grade accuracy.</h2>
            <p className={styles.customHeroDesc}>
               Check your text for plagiarism, paraphrasing, and AI-generated content instantly. Powered by our proprietary multi-signal analysis engine — trusted by students, educators, and researchers worldwide. No sign-up required.
            </p>

            {/* Feature capability badges */}
            <div className={styles.customChips}>
              <div className={styles.customChip}>
                <span className="material-symbols-outlined" style={{ color: '#000', fontSize: '14px' }}>hub</span>
                NLP Engine
              </div>
              <div className={styles.customChip}>
                <span className="material-symbols-outlined" style={{ color: '#000', fontSize: '14px' }}>fingerprint</span>
                Fingerprinting
              </div>
              <div className={styles.customChip}>
                <span className="material-symbols-outlined" style={{ color: '#000', fontSize: '14px' }}>psychology</span>
                AI Detection
              </div>
              <div className={styles.customChip}>
                <span className="material-symbols-outlined" style={{ color: '#000', fontSize: '14px' }}>layers</span>
                Multi-Algorithm
              </div>
              <div className={styles.customChip}>
                <span className="material-symbols-outlined" style={{ color: '#000', fontSize: '14px' }}>schema</span>
                Deep Analysis
              </div>
              <div className={styles.customChip}>
                <span className="material-symbols-outlined" style={{ color: '#000', fontSize: '14px' }}>compare_arrows</span>
                Paraphrase Check
              </div>
            </div>

            <div className={styles.customScannerArea}>
              <ScanInput
                text={text} setText={setText} status={status}
                wordCount={wordCount}
                highlightedText={null} containerRef={containerRef}
                hasReport={false} onFileUpload={handleFileUpload}
              />
              <ScanActions
                status={status}
                hasReport={false}
                hasText={!!text.trim()}
                onUploadClick={() => fileInputRef.current?.click()}
                onScan={handleCheck}
                onNewScan={handleNewScan}
                onExport={openExportModal}
              />
            </div>
          </section>


        </main>
      ) : (
        /* ─── Active: Results Layout ────────────────────────────────────── */
        (status === 'completed' && report) ? (
          <ScanResultsView
            report={report}
            onNewScan={handleNewScan}
            onExport={openExportModal}
            containerRef={containerRef}
          />
        ) : status === 'error' ? (
          /* ─── Error State ─────────────────────────────────────────────── */
          <main className={styles.customMain}>
            <section className={styles.scanningView}>
              <div className={styles.scanningErrorBox}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--red)' }}>error</span>
                <span>{streamStatus}</span>
                <button onClick={handleNewScan} className={styles.scanningRetryBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                  Try Again
                </button>
              </div>
            </section>
          </main>
        ) : (
          /* ─── Scanning: Immersive 3D Animation ───────────────────────── */
          <div className={styles.scanCanvas}>
            {/* Ambient gradient blobs */}
            <div className={styles.scanBlob1} />
            <div className={styles.scanBlob2} />
            <div className={styles.scanBlob3} />

            {/* Central orb assembly */}
            <div className={styles.scanOrbContainer}>
              {/* Outer orbital ring */}
              <div className={styles.scanOrbitRing}>
                <div className={styles.scanOrbitDot} />
              </div>
              {/* Second orbital ring */}
              <div className={styles.scanOrbitRing2}>
                <div className={styles.scanOrbitDot2} />
              </div>
              {/* Main glass orb */}
              <div className={styles.scanOrb}>
                <div className={styles.scanOrbInner} />
                {/* Center icon */}
                <span className={`material-symbols-outlined ${styles.scanOrbIcon}`}>radar</span>
                <div className={styles.scanOrbHighlight} />
              </div>
            </div>

            {/* Label and Progress Bar */}
            <div className={styles.scanLabelGroup}>
              <p className={styles.scanLabel}>SCANNING<span className={styles.scanDots}><span /><span /><span /></span></p>
              
              {/* Progress Bar Container */}
              <div className="w-56 h-2.5 bg-white overflow-hidden mt-4 mb-3 relative" style={{ border: '1.5px solid #000', borderRadius: '4px' }}>
                <div 
                  className="absolute top-0 left-0 h-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${totalSteps > 0 ? Math.min(100, Math.round((currentStep / totalSteps) * 100)) : 0}%`,
                    background: '#B794F6'
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <p className={styles.scanSublabel}>{streamStatus || 'Scanning your document — please wait...'}</p>
                {totalSteps > 0 && currentStep > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, color: '#000',
                    fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                    padding: '0.2rem 0.55rem',
                    background: '#fff', border: '1.5px solid #000', borderRadius: '999px',
                    boxShadow: '2px 2px 0 0 #000', letterSpacing: '0.04em'
                  }}>
                    {Math.min(100, Math.round((currentStep / totalSteps) * 100))}%
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.75rem', letterSpacing: '0.05em', opacity: 0.7, fontWeight: 500 }}>
                Please wait and do not close this page.
              </p>
            </div>


          </div>
        )
      )}

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      {showHero && (
        <div className={styles.pointingGuyWrapper}>
          <img src="/png1.png" alt="Pointing guy" className={styles.pointingGuy} />
        </div>
      )}

      {(!report || status !== 'completed') && (
        <footer className={styles.customFooter}>
          <div className={styles.customFooterInner}>
            <div className={styles.customFooterTopRow}>
              <img src="/Scanterity.png" alt="Scanterity Logo" className={styles.scanterityLogo} />
              <div className={styles.customFooterLinks}>
                <Link href="/privacy" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
                <Link href="/terms" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
                <Link href="/compliance" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Compliance</Link>
                <Link href="/contact" style={{ cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>Contact</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Join our Discord">
                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                  <a href="https://t.me/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Join our Telegram">
                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                  <a href="mailto:hello@scanterity.com" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Contact us via Email">
                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className={styles.customFooterBottomRow}>
              <p className={styles.customFooterText}>© {new Date().getFullYear()} Scanterity Forensic Systems. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Hidden file input — single instance, always rendered */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
        accept=".pdf,.txt,.docx"
        aria-label="Upload document file"
      />

      {/* Export Modal */}
      {showExportModal && report && (
        <ExportModal onClose={closeExportModal} onGenerate={generatePDF} />
      )}

      {/* Forensic Viewer Modal */}
      {activeViewer && (
        <ForensicViewer viewer={activeViewer} onClose={() => setActiveViewer(null)} />
      )}
    </div>
  );
}
