import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'blue' | 'secondary' | 'danger';

interface BaseButtonProps {
  variant?: ButtonVariant;
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

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  blue: {
    background: 'var(--accent-blue)',
    color: '#fff',
    border: '1px solid var(--accent-blue)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--d-text-2)',
    border: '1px solid var(--d-border)',
  },
  danger: {
    background: 'rgba(220,38,38,0.12)',
    color: 'var(--crit)',
    border: '1px solid rgba(220,38,38,0.28)',
  },
};

const BASE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 10,
  padding: '9px 16px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'opacity 0.15s',
};

export const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'blue', style, title, children, className } = props;
  const computedStyle: React.CSSProperties = {
    ...BASE_STYLE,
    ...VARIANT_STYLES[variant],
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
