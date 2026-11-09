import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = Boolean(useReducedMotion());

  const isLight = theme === 'light';
  // Shows the theme you would SWITCH TO:
  // On light theme, render Moon (click -> dark)
  // On dark theme, render Sun (click -> light)
  const ariaLabel = isLight ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`w-[36px] h-[36px] rounded-full flex items-center justify-center border-none bg-transparent text-[rgba(10,31,43,0.62)] dark:text-[rgba(243,246,250,0.66)] hover:text-[#0A1F2B] dark:hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.55)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--dh-focus-ring)] select-none ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLight ? (
          <motion.span
            key="moon"
            initial={shouldReduceMotion ? false : { rotate: -60, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { rotate: 60, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeInOut' }}
            className="flex items-center justify-center pointer-events-none"
          >
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={shouldReduceMotion ? false : { rotate: -60, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { rotate: 60, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeInOut' }}
            className="flex items-center justify-center pointer-events-none"
          >
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

