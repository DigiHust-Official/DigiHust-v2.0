import React from 'react';
import './SectionHeading.css';

export interface SectionHeadingProps {
  title: string;
  accent?: string;
  subtitle?: string;
  align?: 'center' | 'start';
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  accent,
  subtitle,
  align = 'center',
  className = '',
  id,
}) => {
  return (
    <div
      className={`dh-section-heading dh-section-heading--${align} ${className}`}
    >
      <h2 id={id} className="dh-section-heading__title">
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
