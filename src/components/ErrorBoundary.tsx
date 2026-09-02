"use client";

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; };
type State = { hasError: boolean; error: Error | null; };

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
          background: 'var(--nb-bg, #FAFAFA)', color: '#000',
          fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', Inter, -apple-system, sans-serif", padding: '2rem',
        }}>
          <div style={{
            background: '#fff', border: '2px solid #000',
            borderRadius: '10px', padding: '2.5rem', maxWidth: 480,
            textAlign: 'center', width: '100%',
            boxShadow: '6px 6px 0 0 #000',
          }}>
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 1.25rem',
              background: 'var(--nb-purple, #B794F6)', border: '2px solid #000',
              borderRadius: '8px', boxShadow: '3px 3px 0 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
            }}>⚠️</div>
            <h2 style={{
              fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.75rem',
              fontFamily: "var(--font-outfit), Outfit, sans-serif",
              letterSpacing: '-0.03em', color: '#000',
            }}>Something went wrong</h2>
            <p style={{
              color: '#555', fontSize: '0.95rem',
              lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500,
            }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                background: '#000', color: '#fff', border: '2px solid #000',
                padding: '0.75rem 2rem', borderRadius: '6px',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', Inter, sans-serif",
                boxShadow: '4px 4px 0 0 #000',
                letterSpacing: '0.02em', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--nb-purple, #B794F6)'; e.currentTarget.style.color = '#000'; e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 0 #000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 0 #000'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 0 #000'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 0 #000'; }}
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
