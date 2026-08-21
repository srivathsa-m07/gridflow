import React from 'react';

interface CardProps {
  variant?: 'surface' | 'dark' | 'darkOverlay';
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  // Light "marketing" card — cream surface, thin sage border, generous
  // radius. This is the default so every existing bare `<Card>` on the
  // marketing pages picks it up automatically.
  surface: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  },
  dark: {
    background: 'var(--d-raised)',
    border: '1px solid var(--d-border)',
    borderRadius: 'var(--radius-lg)',
  },
  darkOverlay: {
    background: 'var(--d-overlay)',
    border: '1px solid var(--d-border)',
    borderRadius: 'var(--radius-md)',
  },
};

export const Card: React.FC<CardProps> = ({ variant = 'surface', style, children }) => (
  <div style={{ ...VARIANT_STYLES[variant], ...style }}>{children}</div>
);
