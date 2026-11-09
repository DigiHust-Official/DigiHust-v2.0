import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './GlassCtaButton.css';

export interface GlassCtaButtonProps {
  to?: string;
  className?: string;
  onClick?: () => void;
  label?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
}

export const GlassCtaButton: React.FC<GlassCtaButtonProps> = ({
  to = '/contact',
  className = '',
  onClick,
  label = 'Get a Proposal in 24h',
  children,
  'aria-label': ariaLabel,
}) => {
  const content = (
    <>
      <span className="dh-glass-btn__label">{children || label}</span>
      <span className="dh-glass-btn__chip" aria-hidden="true">
        <ArrowRight className="dh-glass-btn__icon" size={18} strokeWidth={2} />
      </span>
    </>
  );

  const combinedClass = `dh-glass-btn ${className}`.trim();

  if (to && !to.startsWith('http')) {
    return (
      <Link
        to={to}
        className={combinedClass}
        onClick={onClick}
        aria-label={ariaLabel || (typeof children === 'string' ? children : label)}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={to || '#'}
      className={combinedClass}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === 'string' ? children : label)}
    >
      {content}
    </a>
  );
};

