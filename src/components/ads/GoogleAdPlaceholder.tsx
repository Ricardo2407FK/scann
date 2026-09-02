import React from 'react';

type AdFormat = 'horizontal' | 'vertical' | 'rectangle';

interface GoogleAdPlaceholderProps {
  slot: string;
  format?: AdFormat;
  responsive?: boolean;
}

export function GoogleAdPlaceholder({ slot, format = 'horizontal', responsive = true }: GoogleAdPlaceholderProps) {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--nb-white)',
    border: '1.5px dashed #888',
    borderRadius: 'var(--nb-radius-sm)',
    color: '#888',
    fontFamily: 'var(--font-jetbrains), monospace',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '1rem auto',
    boxShadow: 'var(--nb-shadow-sm)',
    overflow: 'hidden',
    position: 'relative',
    opacity: 0.8,
  };

  const getDimensions = (): React.CSSProperties => {
    switch (format) {
      case 'horizontal':
        return { width: '100%', maxWidth: '728px', height: '90px' };
      case 'vertical':
        return { width: '100%', maxWidth: '160px', height: '600px' };
      case 'rectangle':
        return { width: '100%', maxWidth: '300px', height: '250px' };
      default:
        return { width: '100%', height: '90px' };
    }
  };

  const responsiveStyles: React.CSSProperties = responsive 
    ? { maxWidth: '100%', width: '100%', overflow: 'hidden' }
    : {};

  return (
    <div
      style={{
        ...baseStyles,
        ...getDimensions(),
        ...responsiveStyles,
      }}
      aria-hidden="true"
    >
      <div style={{ textAlign: 'center' }}>
        <div>Google Ads</div>
        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '4px' }}>Slot: {slot}</div>
      </div>
    </div>
  );
}
