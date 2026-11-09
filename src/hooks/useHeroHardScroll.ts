import { useEffect, useRef } from 'react';

interface UseHeroHardScrollOptions {
  runwayRef: React.RefObject<HTMLElement | null>;
  duration?: number; // default ~1500ms for a silky, cinematic glide
}

/**
 * useHeroHardScroll
 *
 * Scoped hard scroll on the Home hero section (desktop >= 1024px only).
 * - Within the hero runway zone (scrollY 0 to runway bottom): one down-scroll gesture
 *   (wheel, touch swipe, PageDown/Space/ArrowDown) smoothly animates to the next section top.
 * - At the next section top: one up-scroll gesture animates back to scrollY 0.
 * - Locks input during the ~1.5s animation + trackpad inertia cooldown to prevent stutter.
 * - Completely disabled on mobile (<1024px), prefers-reduced-motion, and when modals/mobile menus are open.
 */
export function useHeroHardScroll({
  runwayRef,
  duration = 1500,
}: UseHeroHardScrollOptions): void {
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Guard checks: Reduced motion & Viewport >= 1024px
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const isDesktop = () => window.innerWidth >= 1024;
    if (!isDesktop()) return;

    // Helper: check if a modal or mobile menu is open
    const isModalOrMenuOpen = () => {
      return (
        document.body.classList.contains('overflow-hidden') ||
        document.body.style.overflow === 'hidden' ||
        Boolean(document.querySelector('[role="dialog"]')) ||
        Boolean(document.querySelector('.dh-nav-mobile-panel'))
      );
    };

    // Helper: check if target is inside an internally scrollable element
    const isInsideScrollable = (target: EventTarget | null): boolean => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          return true;
        }
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight
        ) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    // Smooth scroll animation with silky organic sinusoidal ease-in-out
    const animateScrollTo = (targetY: number) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      // Silky, organic sinusoidal ease-in-out (smooth acceleration & soft deceleration)
      const easeInOutSmooth = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

      let rafId: number;
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutSmooth(progress);

        window.scrollTo(0, startY + distance * ease);

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          // Extra buffer (200ms) to swallow trackpad inertia
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 200);
        }
      };

      rafId = requestAnimationFrame(step);
    };

    const getRunwayBounds = () => {
      const runway = runwayRef.current;
      if (!runway) return null;
      const rect = runway.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + runway.offsetHeight;
      return { top, bottom, height: runway.offsetHeight };
    };

    // Wheel event handler
    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop() || isModalOrMenuOpen()) return;
      if (isInsideScrollable(e.target)) return;

      // If animation is in progress, swallow wheel events (prevents trackpad inertia glitches)
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const bounds = getRunwayBounds();
      if (!bounds) return;

      const currentY = window.scrollY;
      const deltaY = e.deltaY;
      const THRESHOLD = 14;

      // 1. Inside hero runway zone (from scrollY 0 up to near bottom of runway)
      // Scrolling down -> animate to bottom of runway (next section top)
      if (currentY >= 0 && currentY < bounds.bottom - 40) {
        if (deltaY > THRESHOLD) {
          e.preventDefault();
          animateScrollTo(bounds.bottom);
        }
      }
      // 2. Near next section top (within 50px of runway bottom)
      // Scrolling up -> animate back to hero top (scrollY 0)
      else if (
        currentY >= bounds.bottom - 40 &&
        currentY <= bounds.bottom + 60
      ) {
        if (deltaY < -THRESHOLD) {
          e.preventDefault();
          animateScrollTo(0);
        }
      }
    };

    // Keyboard navigation (PageDown, PageUp, ArrowDown, ArrowUp, Space)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDesktop() || isModalOrMenuOpen()) return;
      if (isInsideScrollable(e.target)) return;

      if (isAnimatingRef.current) {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) {
          e.preventDefault();
        }
        return;
      }

      const bounds = getRunwayBounds();
      if (!bounds) return;

      const currentY = window.scrollY;
      const isDownKey =
        e.key === 'ArrowDown' ||
        e.key === 'PageDown' ||
        (e.key === ' ' && !e.shiftKey);
      const isUpKey =
        e.key === 'ArrowUp' ||
        e.key === 'PageUp' ||
        (e.key === ' ' && e.shiftKey);

      if (currentY >= 0 && currentY < bounds.bottom - 40 && isDownKey) {
        e.preventDefault();
        animateScrollTo(bounds.bottom);
      } else if (
        currentY >= bounds.bottom - 40 &&
        currentY <= bounds.bottom + 60 &&
        isUpKey
      ) {
        e.preventDefault();
        animateScrollTo(0);
      }
    };

    // Touch swipe handler
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDesktop() || isModalOrMenuOpen() || touchStartYRef.current === null) return;
      if (isInsideScrollable(e.target)) return;

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchCurrentY; // positive = swiping up = scrolling down
      const SWIPE_THRESHOLD = 35;

      const bounds = getRunwayBounds();
      if (!bounds) return;

      const currentY = window.scrollY;

      if (currentY >= 0 && currentY < bounds.bottom - 40 && deltaY > SWIPE_THRESHOLD) {
        e.preventDefault();
        touchStartYRef.current = null;
        animateScrollTo(bounds.bottom);
      } else if (
        currentY >= bounds.bottom - 40 &&
        currentY <= bounds.bottom + 60 &&
        deltaY < -SWIPE_THRESHOLD
      ) {
        e.preventDefault();
        touchStartYRef.current = null;
        animateScrollTo(0);
      }
    };

    // Attach passive: false listeners for wheel and touchmove to enable preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      isAnimatingRef.current = false;
    };
  }, [runwayRef, duration]);
}

