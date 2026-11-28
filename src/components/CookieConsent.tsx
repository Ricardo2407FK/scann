'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

const GA_MEASUREMENT_ID = 'G-WTK9E3WPSX';
const CONSENT_STORAGE_KEY = 'scanterity_cookie_consent';

type ConsentChoice = 'all' | 'essential' | null;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
    [key: string]: unknown;
  }
}

function getGpcSignal(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

function readStoredConsent(): ConsentChoice {
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    return val === 'all' || val === 'essential' ? val : null;
  } catch {
    return null;
  }
}

function ensureGtagStub(): GtagFn {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
  return window.gtag;
}

function clearNonEssentialCookies() {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const domains = ['', hostname];
  if (parts.length >= 2) {
    domains.push('.' + parts.slice(-2).join('.'));
  }

  for (const raw of cookies) {
    const eqPos = raw.indexOf('=');
    const name = (eqPos > -1 ? raw.slice(0, eqPos) : raw).trim();
    if (/^(_ga|_gid|_gat|_gcl|__gads|__gpi|_gac_)/.test(name)) {
      for (const domain of domains) {
        const domainAttr = domain ? `; domain=${domain}` : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}; SameSite=Lax`;
      }
    }
  }
}

function loadGoogleAnalyticsOnce() {
  if (typeof document === 'undefined') return;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  if (document.getElementById('scanterity-ga-script')) return;

  const gtag = ensureGtagStub();
  const script = document.createElement('script');
  script.id = 'scanterity-ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}

function applyConsentState(choice: 'all' | 'essential') {
  if (typeof window === 'undefined') return;
  const gtag = ensureGtagStub();

  if (choice === 'all') {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = 0;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    gtag('set', 'ads_data_redaction', false);
    loadGoogleAnalyticsOnce();
  } else {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = 1;
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    gtag('set', 'ads_data_redaction', true);
    clearNonEssentialCookies();
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [savedChoice, setSavedChoice] = useState<ConsentChoice>(null);
  const [gpcActive, setGpcActive] = useState(false);

  useEffect(() => {
    const gpc = getGpcSignal();
    const consent = readStoredConsent();

    if (consent === 'all' && !gpc) {
      applyConsentState('all');
    } else {
      applyConsentState('essential');
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!consent) {
      timer = setTimeout(() => {
        setGpcActive(getGpcSignal());
        setSavedChoice(readStoredConsent());
        setShow(true);
      }, 800);
    }

    const handleOpenSettings = () => {
      setSavedChoice(readStoredConsent());
      setGpcActive(getGpcSignal());
      setShow(true);
    };

    window.addEventListener('scanterity:open-cookie-settings', handleOpenSettings);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scanterity:open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'all');
    } catch {}
    setSavedChoice('all');
    applyConsentState('all');
    setShow(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'essential');
    } catch {}
    setSavedChoice('essential');
    applyConsentState('essential');
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Cookie and privacy preferences"
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
          <Cookie size={22} strokeWidth={2.5} color="#000" aria-hidden="true" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#000' }}>
              Cookie &amp; Privacy Preferences
            </h2>
            <button
              type="button"
              onClick={handleEssentialOnly}
              aria-label="Use essential cookies only and close banner"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                color: '#444',
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#333', margin: '0 0 0.75rem 0' }}>
            We use essential browser storage for security and preferences. With your consent, Google AdSense and Google Analytics help keep Scanterity free without storing your uploaded documents.{' '}
            <Link
              href="/privacy"
              style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}
            >
              Privacy Policy
            </Link>{' '}
            &middot;{' '}
            <Link
              href="/compliance"
              style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}
            >
              Your Privacy Rights
            </Link>.
          </p>

          {(gpcActive || savedChoice) && (
            <p style={{ fontSize: '11.5px', lineHeight: 1.4, color: '#555', margin: '0 0 0.75rem 0', fontWeight: 600 }}>
              {gpcActive
                ? 'Global Privacy Control (GPC) signal detected — analytics and personalized ads stay off unless you explicitly allow all.'
                : savedChoice === 'all'
                ? 'Current preference: All cookies accepted.'
                : 'Current preference: Essential only (analytics & personalized ads off).'}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
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
              <Check size={14} strokeWidth={3} aria-hidden="true" />
              Accept All
            </button>

            <button
              type="button"
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
