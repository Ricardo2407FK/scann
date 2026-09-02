'use client';

import React from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import styles from '../PlagiarismChecker.module.css';
import type { Report } from '@/lib/engine/types';

interface ScanResultsViewProps {
  report: Report;
  onNewScan: () => void;
  onExport: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ScanResultsView({ report, onNewScan, onExport, containerRef }: ScanResultsViewProps) {
  // Plagiarism Risk assessment
  const isHighRisk = report.score > 40;
  const plagiarismBadgeStyle = isHighRisk ? 'bg-[#FF6B6B]' : report.score > 15 ? 'bg-[#FF9F43]' : 'bg-[#90FFD0]';
  const plagiarismBadgeText = isHighRisk ? 'HIGH RISK' : report.score > 15 ? 'MODERATE' : 'LOW RISK';

  // AI assessment
  const isAiLikely = report.aiScore > 50;
  const aiBadgeStyle = isAiLikely ? 'bg-[#C0F7FE]' : 'bg-[#90FFD0]';
  const aiBadgeText = isAiLikely ? 'LIKELY AI' : 'LIKELY HUMAN';

  // Dynamic orb color
  const orbBg = report.originalityScore >= 65
    ? '#90FFD0'
    : report.originalityScore >= 35
    ? '#FF9F43'
    : '#FF6B6B';

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col"
      style={{ background: 'var(--nb-bg)' }}>
      {/* TopNavBar — Neo-Brutalist */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b-[1.5px] border-black">
        <div className="flex justify-between items-center px-4 md:px-10 py-2.5 max-w-[1200px] mx-auto">
          <a onClick={onNewScan} className="text-[22px] font-black text-black tracking-tight flex items-center gap-2 cursor-pointer">
            <img src="/Scanterity.png" alt="Scanterity Logo" className={styles.scanterityLogo} />
          </a>
          <div className="hidden md:flex space-x-8 items-center" role="navigation" aria-label="Main navigation">
            <button type="button" className="text-black hover:bg-[#B794F6] transition-colors font-semibold cursor-pointer text-[14px] bg-transparent border-0 px-3 py-1.5 rounded-full" aria-current="page">Scanner</button>
            <button type="button" className="text-[#555] hover:bg-[#B794F6] hover:text-black transition-colors font-medium cursor-pointer text-[14px] bg-transparent border-0 px-3 py-1.5 rounded-full">Pricing</button>
            <button type="button" className="text-[#555] hover:bg-[#B794F6] hover:text-black transition-colors font-medium cursor-pointer text-[14px] bg-transparent border-0 px-3 py-1.5 rounded-full">Enterprise</button>
            <button type="button" className="text-[#555] hover:bg-[#B794F6] hover:text-black transition-colors font-medium cursor-pointer text-[14px] bg-transparent border-0 px-3 py-1.5 rounded-full">Resources</button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className={styles.customBtnPrimary} style={{ padding: '0.5rem 1.5rem' }}>
              Get Started
            </button>
          </div>
          <button className={`${styles.customNavHamburger} md:hidden`}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-10 py-20 flex flex-col gap-6 md:gap-10">
        {/* Hero Section */}
        <header className="text-center mt-4 mb-4">
          <h1 className="text-[24px] md:text-[36px] text-black mb-2 md:mb-3 font-black" style={{lineHeight: '1.1'}}>Scan Results</h1>
          <p className="text-[13px] md:text-[15px] text-[#333] font-medium max-w-xl mx-auto">
            Comprehensive forensic analysis of your document. Review matches, AI indicators, and source attributions below.
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">

          {/* Left Column: Document Analysis */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="panel-3d p-4 md:p-7 flex flex-col gap-4 md:gap-6 h-full relative overflow-hidden">

              <div className="flex justify-between items-start md:items-center pb-2 flex-wrap gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#B794F6] border-[1.5px] border-black rounded-md flex items-center justify-center" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                    <span className="material-symbols-outlined text-lg md:text-xl text-black">description</span>
                  </div>
                  <h2 className="text-[18px] md:text-[22px] font-black text-black">Analysis Breakdown</h2>
                </div>

                <div className="flex gap-2 md:gap-3 flex-wrap">
                  <span className="px-2.5 md:px-3.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-black border-[1.5px] border-black bg-[#FFE0E0] rounded-full"><span className="w-2 h-2 bg-[#FF6B6B] border border-black rounded-full"></span>Exact</span>
                  <span className="px-2.5 md:px-3.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-black border-[1.5px] border-black bg-[#FFECD0] rounded-full"><span className="w-2 h-2 bg-[#FF9F43] border border-black rounded-full"></span>Paraphrase</span>
                  <span className="px-2.5 md:px-3.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-black border-[1.5px] border-black bg-[#E0FBFF] rounded-full"><span className="w-2 h-2 bg-[#C0F7FE] border border-black rounded-full"></span>Conceptual</span>
                </div>
              </div>

              {/* Highlighted Document */}
              <div
                ref={containerRef}
                className="flex-grow overflow-y-auto text-[13px] md:text-[15px] leading-relaxed text-[#333] font-normal bg-white border-[1.5px] border-black p-4 md:p-6"
                style={{ boxShadow: '2px 2px 0 0 #000', minHeight: '300px', maxHeight: '500px', borderRadius: '8px' }}
                role="document"
                aria-label="Scan results with highlighted matches"
                tabIndex={0}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(report.highlightedText || '', {
                    ALLOWED_TAGS: ['span', 'br'],
                    ALLOWED_ATTR: ['class', 'data-urls', 'data-snippets', 'data-match-type', 'data-confidence', 'data-algorithm', 'title'],
                  } )
                }}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-3">
                <button onClick={onNewScan} className={`${styles.customBtnSecondary} w-full sm:w-auto justify-center`}>
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  New Scan
                </button>
                <button onClick={onExport} className={`${styles.customBtnPrimary} w-full sm:w-auto justify-center`}>
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Metrics — Neo-Brutalist */}
          <div className="lg:col-span-4 flex flex-col gap-7">

            {/* Primary Metric Card */}
            <div className="panel-3d p-5 md:p-7 flex flex-col items-center justify-center relative overflow-hidden min-h-[240px] md:min-h-[300px]">
              <div className="absolute top-4 md:top-6 left-4 md:left-6 flex items-center gap-2 text-black font-bold tracking-widest px-3 py-1.5 text-[10px] md:text-[11px] uppercase bg-[#90FFD0] border-[1.5px] border-black rounded-full" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <span className="material-symbols-outlined text-sm">verified_user</span>
                SCAN COMPLETE
              </div>

              <div className="relative w-40 h-40 md:w-56 md:h-56 mt-6 md:mt-8 flex items-center justify-center border-[2px] border-black rounded-full" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                {/* Score orb */}
                <div
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center text-center z-20 border-[2px] border-black"
                  style={{ background: orbBg, boxShadow: 'inset 0 0 0 4px #000' }}
                >
                  <span className="text-[40px] md:text-[64px] font-black leading-none text-black">{report.originalityScore}%</span>
                  <span className="mt-2 md:mt-3 font-bold tracking-widest uppercase text-[8px] md:text-[10px] bg-white px-2 md:px-3 py-0.5 md:py-1 border-[1.5px] border-black rounded-full text-black">Original Content</span>
                </div>
              </div>
            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              {/* Plagiarism Metric */}
              <div className="panel-3d p-3 md:p-5 flex flex-col items-center justify-center text-center relative">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-3 md:mb-4 relative border-[1.5px] border-black bg-white rounded-lg" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                  <span className="text-xl md:text-2xl font-black text-black font-mono z-10">{report.score}</span>
                </div>
                <span className="text-[9px] md:text-[10px] text-black tracking-widest font-bold mb-2 md:mb-3 uppercase">PLAGIARIZED</span>
                <span className={`px-2.5 md:px-3.5 py-1 md:py-1.5 text-[8px] md:text-[9px] font-black tracking-widest text-black border-[1.5px] border-black rounded-full ${plagiarismBadgeStyle}`}>
                  {plagiarismBadgeText}
                </span>
              </div>

              {/* AI Content Metric */}
              <div className="panel-3d p-3 md:p-5 flex flex-col items-center justify-center text-center relative">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-3 md:mb-4 relative border-[1.5px] border-black bg-white rounded-lg" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                  <span className="text-xl md:text-2xl font-black text-black font-mono z-10">{report.aiScore}</span>
                </div>
                <span className="text-[9px] md:text-[10px] text-black tracking-widest font-bold mb-2 md:mb-3 uppercase">AI TEXT</span>
                <span className={`px-2.5 md:px-3.5 py-1 md:py-1.5 text-[8px] md:text-[9px] font-black tracking-widest text-black border-[1.5px] border-black rounded-full ${aiBadgeStyle}`}>
                  {aiBadgeText}
                </span>
              </div>
            </div>

            {/* Stats Tiles */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-5 flex flex-col items-center justify-center text-center cursor-default bg-[#C0F7FE] border-[1.5px] border-black rounded-lg" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <span className="text-2xl md:text-3xl font-black text-black font-mono">{report.stats.totalWords}</span>
                <span className="text-[9px] md:text-[10px] text-black tracking-widest mt-1.5 md:mt-2 font-bold uppercase">WORDS</span>
              </div>
              <div className="p-3 md:p-5 flex flex-col items-center justify-center text-center cursor-default bg-[#B794F6] border-[1.5px] border-black rounded-lg" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <span className="text-2xl md:text-3xl font-black text-black font-mono">{report.stats.totalSentences}</span>
                <span className="text-[9px] md:text-[10px] text-black tracking-widest mt-1.5 md:mt-2 font-bold uppercase">SENTENCES</span>
              </div>
            </div>

            {/* AI Assessment Panel */}
            <div className="bg-white border-[1.5px] border-black rounded-[6px] p-3 pr-4 flex items-center justify-between gap-4" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <div className="flex items-center gap-3 shrink-0 pl-1">
                <div className="w-11 h-11 bg-[#B794F6] flex items-center justify-center border-[1.5px] border-black rounded-lg" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                  <span className="material-symbols-outlined text-black text-[22px]">fingerprint</span>
                </div>
                <div className="text-[15px] leading-[1.1] text-black font-black tracking-tight">
                  AI<br />Analysis
                </div>
              </div>
              
              <div className="flex items-center grow justify-end">
                <div className="grow bg-[#FFF8E8] h-[38px] flex items-center justify-center px-2 border-[1.5px] border-black rounded-md" title={report.aiAnalysis.verdict}>
                  <span className="text-[11px] font-bold text-black whitespace-nowrap text-center">
                    {report.aiAnalysis.verdict}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer — Neo-Brutalist */}
      <footer className={styles.customFooter}>
          <div className={styles.customFooterInner}>
            <div className={styles.customFooterTopRow}>
              <img src="/Scanterity.png" alt="Scanterity Logo" className={styles.scanterityLogo} />
              <div className={styles.customFooterLinks}>
                <Link href="/privacy" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
                <Link href="/terms" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
                <Link href="/compliance" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>Compliance</Link>
                <Link href="/contact" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>Contact</Link>
              </div>
            </div>
            <div className={styles.customFooterBottomRow}>
              <p className={styles.customFooterText}>© {new Date().getFullYear()} Scanterity Forensic Systems. All rights reserved.</p>
            </div>
          </div>
        </footer>
    </div>
  );
}
