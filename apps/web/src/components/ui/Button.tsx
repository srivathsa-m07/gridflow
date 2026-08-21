import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'blue' | 'secondary' | 'danger';

interface BaseButtonProps {
  variant?: ButtonVariant;
  // Outline variants ('secondary'/'danger') read ambient text/border colors
  // that differ between the light marketing theme and the dark dashboard —
  // set `dark` when placing one of those variants on a dark background.
  dark?: boolean;
  style?: React.CSSProperties;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

interface LinkButtonProps extends BaseButtonProps {
  asLink: true;
  href: string;
}

interface ActionButtonProps extends BaseButtonProps {
  asLink?: false;
  href?: undefined;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

type ButtonProps = LinkButtonProps | ActionButtonProps;

// Solid mint pill (primary "ENTER APP"-style CTA), thin-border outline pill
// (secondary), and a danger outline for destructive dashboard actions.
const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  blue: {
    background: 'var(--mint)',
    color: 'var(--mint-text)',
    border: '1px solid var(--mint)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-2)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--crit)',
    border: '1px solid rgba(193,71,63,0.35)',
  },
};

const DARK_VARIANT_STYLES: Partial<Record<ButtonVariant, React.CSSProperties>> = {
  secondary: {
    background: 'var(--d-overlay)',
    color: 'var(--d-text-2)',
    border: '1px solid var(--d-border)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--crit)',
    border: '1px solid rgba(193,71,63,0.4)',
  },
};

const BASE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 'var(--radius-pill)',
  padding: '10px 20px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'opacity 0.15s, transform 0.1s',
};

export const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'blue', dark, style, title, children, className } = props;
  const computedStyle: React.CSSProperties = {
    ...BASE_STYLE,
    ...VARIANT_STYLES[variant],
    ...(dark ? DARK_VARIANT_STYLES[variant] : undefined),
    ...style,
  };

  if (props.asLink) {
    return (
      <Link to={props.href} title={title} className={className} style={computedStyle}>
        {children}
      </Link>
    );
  }

  const { onClick, disabled, type = 'button' } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
      style={{ ...computedStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {children}
    </button>
  );
};
