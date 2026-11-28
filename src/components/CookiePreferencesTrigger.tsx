'use client';

import React from 'react';

export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('scanterity:open-cookie-settings'));
  }
}

export default function CookiePreferencesTrigger({
  label = 'Cookie Preferences / Privacy Choices',
  style,
  className,
}: {
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={className}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'underline',
        ...style,
      }}
    >
      {label}
    </button>
  );
}
