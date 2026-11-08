import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './GlowCtaButton.css';

interface GlowCtaButtonProps {
  to?: string;
  className?: string;
  onClick?: () => void;
  label?: string;
  children?: React.ReactNode;
}

export const GlowCtaButton: React.FC<GlowCtaButtonProps> = ({
  to = '/contact',
  className = '',
  onClick,
  label = 'Start a Project',
  children,
}) => {
  const buttonRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // 1. Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 2. IntersectionObserver + Tab Visibility to pause animation when off-screen or tab hidden
  useEffect(() => {
    if (prefersReducedMotion) return;

    let isIntersecting = false;
    let isVisible = !document.hidden;

    const updatePlayState = () => {
      setIsPlaying(isIntersecting && isVisible);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      updatePlayState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        updatePlayState();
      },
      { threshold: 0.1 }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  const playState = isPlaying && !prefersReducedMotion ? 'running' : 'paused';

  const baseClassName = `dh-glow-btn group relative inline-flex items-center justify-center bg-[#022B3A] dark:bg-[#01222E] text-white font-extrabold border border-[#1F7A8C]/50 dark:border-cyan-400 shadow-xl shadow-[#022B3A]/25 hover:shadow-2xl hover:shadow-[#022B3A]/35 dark:shadow-[0_0_35px_rgba(34,211,238,0.4)] dark:hover:shadow-[0_0_50px_rgba(34,211,238,0.65)] overflow-hidden select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98] transition-all duration-200 ${className}`;

  const innerContent = (
    <>
      {/* ── LAVA CONTAINER (ORGANIC FLUID MORPHING WITH STATIC CSS BLUR) ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          filter: prefersReducedMotion ? 'none' : 'blur(14px)',
          transform: 'translateZ(0)',
        }}
        aria-hidden="true"
      >
        {/* Blob 1: Electric Cyan (Left-to-Center Surge) */}
        <div
          className="absolute -top-8 -left-8 w-36 h-36 bg-[#1F7A8C] dark:bg-[#00E5FF] opacity-85 dark:opacity-90"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : `dh-glow-lavaMorphOne 6.5s ease-in-out infinite alternate`,
            animationPlayState: playState,
          }}
        />

        {/* Blob 2: Deep Ocean Teal / Seafoam (Right Reservoir) */}
        <div
          className="absolute -bottom-10 -right-8 w-40 h-40 bg-[#14535F] dark:bg-[#0D9488] opacity-80 dark:opacity-85"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : `dh-glow-lavaMorphTwo 7s ease-in-out 0.5s infinite alternate`,
            animationPlayState: playState,
          }}
        />

        {/* Blob 3: Petrol Slate-Teal / Sky Cyan (Center Rising Fluid) */}
        <div
          className="absolute -top-6 left-[30%] w-32 h-32 bg-[#0E7490] dark:bg-[#38BDF8] opacity-80 dark:opacity-85"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : `dh-glow-lavaMorphThree 5.8s ease-in-out 1s infinite alternate`,
            animationPlayState: playState,
          }}
        />

        {/* Blob 4: Marine Deep Teal / Radiant Aqua (Bottom-Center Surge) */}
        <div
          className="absolute -bottom-8 left-[42%] w-32 h-32 bg-[#155E75] dark:bg-[#14B8A6] opacity-85 dark:opacity-90"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : `dh-glow-lavaMorphFour 6.2s ease-in-out 1.5s infinite alternate`,
            animationPlayState: playState,
          }}
        />

        {/* Blob 5: Brand Highlight Cyan (Floating Morphing Droplet) */}
        <div
          className="absolute top-1 left-[18%] w-28 h-28 bg-[#22A0B4] dark:bg-[#22D3EE] opacity-70 dark:opacity-90"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : `dh-glow-lavaMorphFive 5.2s ease-in-out 0.3s infinite alternate`,
            animationPlayState: playState,
          }}
        />

        {/* Blob 6: Cyber Blue / Vivid Ocean Swirl */}
        <div
          className="absolute -bottom-4 right-[22%] w-30 h-30 bg-[#164E63] dark:bg-[#0284C7] opacity-75 dark:opacity-85"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : `dh-glow-lavaMorphSix 7.2s ease-in-out 2s infinite alternate`,
            animationPlayState: playState,
          }}
        />
      </div>

      {/* Subtle top glossy sheen rim for glass-capsule effect */}
      <div
        className="absolute inset-0 pointer-events-none border border-white/15 dark:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
        style={{ borderRadius: 'var(--dh-glow-radius, 14px)' }}
        aria-hidden="true"
      />

      {/* ── TEXT & ICON (High-contrast pure white over rich teals) ── */}
      <span className="relative z-10 flex items-center space-x-2.5 font-display tracking-tight text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.7)] select-none whitespace-nowrap">
        {children ? children : <span>{label}</span>}
        <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1.5 transition-transform duration-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
      </span>
    </>
  );

  if (to) {
    return (
      <Link ref={buttonRef} to={to} onClick={onClick} className={baseClassName}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button ref={buttonRef} type="button" onClick={onClick} className={baseClassName}>
      {innerContent}
    </button>
  );
};

