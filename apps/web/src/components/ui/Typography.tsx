import React from 'react';

interface TypographyProps {
  // Set when placing this text on a dark dashboard surface — swaps the
  // ambient color from the light marketing token to its dark counterpart.
  dark?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const H1: React.FC<TypographyProps> = ({ dark, style, children }) => (
  <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 46, lineHeight: 1.08, fontWeight: 600, color: dark ? 'var(--d-text)' : 'var(--text)', letterSpacing: '-0.01em', ...style }}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ dark, style, children }) => (
  <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.3, fontWeight: 600, color: dark ? 'var(--d-text)' : 'var(--text)', ...style }}>
    {children}
  </h2>
);

// Body copy in the reference reads as a small, muted monospace paragraph —
// distinct from the serif display headings.
export const Lead: React.FC<TypographyProps> = ({ dark, style, children }) => (
  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 13.5, lineHeight: 1.8, color: dark ? 'var(--d-text-3)' : 'var(--text-3)', ...style }}>
    {children}
  </p>
);
