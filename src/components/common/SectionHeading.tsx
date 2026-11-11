import React from 'react';
import './SectionHeading.css';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  align?: 'center' | 'start';
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  accent,
  subtitle,
  align = 'center',
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`dh-section-heading dh-section-heading--${align} ${className}`}
    >
      {eyebrow && (
        <div className="dh-section-heading__pill">
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="dh-section-heading__title">
        {title}
        {accent && (
          <>
            {' '}
            <span className="dh-section-heading__accent">{accent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="dh-section-heading__subtitle">{subtitle}</p>
      )}
    </div>
  );
};
