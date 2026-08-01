import React from 'react';

interface TypographyProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const H1: React.FC<TypographyProps> = ({ style, children }) => (
  <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.12, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', ...style }}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ style, children }) => (
  <h2 style={{ margin: '0 0 4px', fontSize: 22, lineHeight: 1.3, fontWeight: 700, color: 'var(--text)', ...style }}>
    {children}
  </h2>
);

export const Lead: React.FC<TypographyProps> = ({ style, children }) => (
  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--text-3)', ...style }}>
    {children}
  </p>
);
