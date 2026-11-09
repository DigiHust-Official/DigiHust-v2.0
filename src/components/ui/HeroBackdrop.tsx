import React, { useEffect, useRef } from 'react';
import './HeroBackdrop.css';

export const POINTER_LIGHT = true;

interface HeroBackdropProps {
  heroRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export const HeroBackdrop: React.FC<HeroBackdropProps> = ({
  heroRef,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerLightRef = useRef<HTMLDivElement>(null);

  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // 1. IntersectionObserver + Document Visibility to pause drift animations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targetEl = heroRef?.current || container;

    const setPaused = (paused: boolean) => {
      container.setAttribute('data-paused', paused ? 'true' : 'false');
    };

    let isIntersecting = true;
    let isDocumentVisible = !document.hidden;

    const updatePausedState = () => {
      setPaused(!isIntersecting || !isDocumentVisible);
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      updatePausedState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        updatePausedState();
      },
      { threshold: 0.05 }
    );

    observer.observe(targetEl);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [heroRef]);

  // 2. Pointer Light lerp (0.08) in requestAnimationFrame loop
  useEffect(() => {
    if (!POINTER_LIGHT) return;

    // Check prefers-reduced-motion and fine pointer match
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !isFinePointer) return;

    const heroEl = heroRef?.current || containerRef.current;
    if (!heroEl) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = heroEl.getBoundingClientRect();
      targetX.current = e.clientX - rect.left;
      targetY.current = e.clientY - rect.top;

      if (pointerLightRef.current) {
        pointerLightRef.current.style.opacity = '1';
      }
    };

    const onPointerLeave = () => {
      if (pointerLightRef.current) {
        pointerLightRef.current.style.opacity = '0';
      }
    };

    heroEl.addEventListener('pointermove', onPointerMove, { passive: true });
    heroEl.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Smooth lerp loop
    const tick = () => {
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      if (pointerLightRef.current) {
        pointerLightRef.current.style.transform = `translate3d(${currentX.current - 260}px, ${currentY.current - 260}px, 0)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      heroEl.removeEventListener('pointermove', onPointerMove);
      heroEl.removeEventListener('pointerleave', onPointerLeave);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [heroRef]);

  return (
    <div
      ref={containerRef}
      className={`dh-hero-backdrop ${className}`}
      aria-hidden="true"
    >
      {/* a) Static Grid */}
      <div className="dh-backdrop-grid" />

      {/* b) Glow A (Teal) */}
      <div className="dh-glow-a" />

      {/* c) Glow B (Periwinkle) */}
      <div className="dh-glow-b" />

      {/* d) Pointer Light */}
      {POINTER_LIGHT && <div ref={pointerLightRef} className="dh-pointer-light" />}
    </div>
  );
};

