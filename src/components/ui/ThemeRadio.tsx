import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeRadioProps {
  className?: string;
}

export const ThemeRadio: React.FC<ThemeRadioProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const lightRef = useRef<HTMLButtonElement>(null);
  const darkRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const selectLight = () => {
    if (theme !== 'light') setTheme('light');
    lightRef.current?.focus();
  };

  const selectDark = () => {
    if (theme !== 'dark') setTheme('dark');
    darkRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, current: 'light' | 'dark') => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (current === 'light') {
        selectDark();
      } else {
        selectLight();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (current === 'dark') {
        selectLight();
      } else {
        selectDark();
      }
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (current === 'light') selectLight();
      else selectDark();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center h-[32px] p-[2px] rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] relative select-none box-border ${className}`}
    >
      {/* Light Option */}
      <button
        ref={lightRef}
        type="button"
        role="radio"
        aria-checked={isLight}
        aria-label="Light"
        tabIndex={isLight ? 0 : -1}
        onClick={selectLight}
        onKeyDown={(e) => handleKeyDown(e, 'light')}
        className="w-[28px] h-[28px] rounded-full flex items-center justify-center relative cursor-pointer border-none bg-transparent outline-none group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand-teal)]"
      >
        {isLight && (
          <motion.div
            layoutId="themeRadioPill"
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[var(--brand-teal-subtle)] pointer-events-none"
          />
        )}
        <Sun
          className={`w-[15px] h-[15px] relative z-10 transition-colors duration-150 ${
            isLight
              ? 'text-[var(--brand-teal-text)]'
              : 'text-[var(--text-muted)] group-hover:text-[var(--text-heading)]'
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {/* Dark Option */}
      <button
        ref={darkRef}
        type="button"
        role="radio"
        aria-checked={isDark}
        aria-label="Dark"
        tabIndex={isDark ? 0 : -1}
        onClick={selectDark}
        onKeyDown={(e) => handleKeyDown(e, 'dark')}
        className="w-[28px] h-[28px] rounded-full flex items-center justify-center relative cursor-pointer border-none bg-transparent outline-none group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand-teal)]"
      >
        {isDark && (
          <motion.div
            layoutId="themeRadioPill"
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[var(--brand-teal-subtle)] pointer-events-none"
          />
        )}
        <Moon
          className={`w-[15px] h-[15px] relative z-10 transition-colors duration-150 ${
            isDark
              ? 'text-[var(--brand-teal-text)]'
              : 'text-[var(--text-muted)] group-hover:text-[var(--text-heading)]'
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

