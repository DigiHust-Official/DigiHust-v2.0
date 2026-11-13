import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Avatar } from '../common/Avatar';
import { StarRating } from '../common/StarRating';
import './TestimonialsSection.css';

export interface TestimonialItem {
  id?: string;
  name: string;
  role: string;
  company?: string;
  rating?: number;
  quote: string;
  avatarUrl?: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

const AUTO_ADVANCE_DURATION = 7000; // 7 seconds
const TICK_INTERVAL = 50; // 50ms for smooth progress bar

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Show up to 6 in CMS order
  const items = testimonials.slice(0, 6);
  const hasMultiple = items.length > 2;

  // Handle Tab Switching
  const handleSelectTab = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  // Keyboard navigation for rail tablist
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!hasMultiple) return;
      let nextIndex = index;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (index + 1) % items.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (index - 1 + items.length) % items.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = items.length - 1;
      } else {
        return;
      }

      handleSelectTab(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    },
    [items.length, hasMultiple, handleSelectTab]
  );

  // Auto-advance timer (7s, paused on hover/focus/hidden, disabled in reduced-motion)
  useEffect(() => {
    if (!hasMultiple) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (isPaused || document.hidden) return;

      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL / AUTO_ADVANCE_DURATION) * 100;
        if (next >= 100) {
          setActiveIndex((current) => (current + 1) % items.length);
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasMultiple, isPaused, items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  const activeItem = items[activeIndex] || items[0];

  return (
    <section
      id="testimonials"
      data-hard-stop="testimonials"
      className="dh-testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Client Testimonials"
    >
      <div className="dh-testimonials__container">
        {/* Centered Shared Heading */}
        <div className="dh-testimonials__header">
          <SectionHeading
            lead={t('testimonials_lead') || 'What clients'}
            accent={t('testimonials_accent') || 'say'}
            align="center"
          />
        </div>

        {/* Two-column layout on desktop (>=1024px) */}
        <div className="dh-testimonials__content">
          {/* Left Column: Quote Card (~7/12) */}
          <div
            className="dh-testimonials__card"
            role="tabpanel"
            id={`testimonial-panel-${activeIndex}`}
            aria-labelledby={`testimonial-tab-${activeIndex}`}
          >
            {/* Opening Quote Glyph */}
            <svg
              className="dh-testimonials__quote-glyph"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Quote Stack: all quotes in same cell so card height equals tallest quote */}
            <div className="dh-testimonials__stack">
              {items.map((item, idx) => {
                const isActive = idx === activeIndex;
                const photoUrl = item.avatarUrl || item.avatar || null;

                return (
                  <div
                    key={item.id || item.name || idx}
                    className={`dh-testimonials__pane ${
                      isActive
                        ? 'dh-testimonials__pane--active'
                        : 'dh-testimonials__pane--inactive'
                    }`}
                    aria-hidden={!isActive}
                  >
                    {/* Clamped Quote text */}
                    <blockquote className="dh-testimonials__quote-text">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>

                    {/* Divider */}
                    <hr className="dh-testimonials__divider" />

                    {/* Reviewer Row */}
                    <div className="dh-testimonials__reviewer-row">
                      <Avatar
                        name={item.name}
                        src={photoUrl}
                        size={56}
                      />
                      <div className="dh-testimonials__reviewer-meta">
                        <span className="dh-testimonials__reviewer-name">
                          {item.name}
                        </span>
                        <span className="dh-testimonials__reviewer-role">
                          {item.role}
                          {item.company ? ` · ${item.company}` : ''}
                        </span>
                      </div>
                      {typeof item.rating === 'number' && item.rating > 0 && (
                        <div className="dh-testimonials__rating">
                          <StarRating value={item.rating} size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Vertical Reviewer Rail (~5/12) */}
          {hasMultiple && (
            <div
              className="dh-testimonials__rail"
              role="tablist"
              aria-label="Client testimonials"
              aria-orientation="vertical"
            >
              {items.map((item, idx) => {
                const isActive = idx === activeIndex;
                const photoUrl = item.avatarUrl || item.avatar || null;

                return (
                  <button
                    key={item.id || item.name || idx}
                    ref={(el) => (tabRefs.current[idx] = el)}
                    role="tab"
                    id={`testimonial-tab-${idx}`}
                    aria-selected={isActive}
                    aria-controls={`testimonial-panel-${idx}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`dh-testimonials__rail-item ${
                      isActive ? 'dh-testimonials__rail-item--active' : ''
                    }`}
                    onClick={() => handleSelectTab(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <Avatar
                      name={item.name}
                      src={photoUrl}
                      size={44}
                    />
                    <div className="dh-testimonials__rail-meta">
                      <span className="dh-testimonials__rail-name">
                        {item.name}
                      </span>
                      <span className="dh-testimonials__rail-company">
                        {item.company || item.role}
                      </span>
                    </div>

                    {/* 2px progress line on active rail item */}
                    {isActive && (
                      <div
                        className="dh-testimonials__progress-line"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

