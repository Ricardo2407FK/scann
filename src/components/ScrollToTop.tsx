'use client';

import { useEffect } from 'react';

/**
 * Tiny client component that scrolls to top on mount.
 * Extracted so parent page can remain a server component for SEO.
 */
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return null;
}
