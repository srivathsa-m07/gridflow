import React from 'react';

interface CardProps {
  variant?: 'dark' | 'darkOverlay';
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  dark: {
    background: 'var(--d-raised)',
    border: '1px solid var(--d-border)',
    borderRadius: 20,
  },
  darkOverlay: {
    background: 'var(--d-overlay)',
    border: '1px solid var(--d-border)',
    borderRadius: 16,
  },
};

export const Card: React.FC<CardProps> = ({ variant = 'dark', style, children }) => (
  <div style={{ ...VARIANT_STYLES[variant], ...style }}>{children}</div>
);
