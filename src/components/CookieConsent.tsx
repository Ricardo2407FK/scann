'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    try {
      const consent = localStorage.getItem('scanterity_cookie_consent');
      if (!consent) {
        // Small delay to prevent layout pop
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors (e.g. incognito restrictions)
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('scanterity_cookie_consent', 'all');
    } catch {}
    setShow(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('scanterity_cookie_consent', 'essential');
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      role="region"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '560px',
        margin: '0 auto',
        zIndex: 9999,
        background: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: '10px',
        boxShadow: '5px 5px 0px 0px #000000',
        padding: '1.25rem 1.5rem',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            background: 'var(--nb-mint, #90FFD0)',
            border: '1.5px solid #000',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '2px 2px 0px 0px #000',
          }}
        >
          <Cookie size={22} strokeWidth={2.5} color="#000" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#000' }}>
              Cookie &amp; Privacy Preferences
            </h2>
            <button
              onClick={handleEssentialOnly}
              aria-label="Close cookie consent banner"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                color: '#666',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#333', margin: '0 0 1rem 0' }}>
            We use strictly necessary cookies to keep our forensic scanner running securely. We also partner with Google AdSense and Google Analytics to serve relevant ads that keep Scanterity 100% free with zero document retention. Learn more in our{' '}
            <Link
              href="/privacy"
              style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'underline' }}
            >
              Privacy Policy
            </Link>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAcceptAll}
              style={{
                background: 'var(--nb-purple, #B794F6)',
                color: '#000',
                border: '1.5px solid #000',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '2px 2px 0px 0px #000',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Check size={14} strokeWidth={3} />
              Accept All
            </button>

            <button
              onClick={handleEssentialOnly}
              style={{
                background: '#FFFFFF',
                color: '#000',
                border: '1.5px solid #000',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
