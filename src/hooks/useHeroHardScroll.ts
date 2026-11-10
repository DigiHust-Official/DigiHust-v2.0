import { useEffect, useRef } from 'react';

interface UseHeroHardScrollOptions {
  runwayRef?: React.RefObject<HTMLElement | null>;
  duration?: number; // default ~800ms
}

/**
 * useHeroHardScroll
 *
 * Scoped hard scroll on Home desktop (>= 1024px only) across ordered stops:
 *   Stop 0: Hero top (scrollY 0)
 *   Stop 1: About section top (data-hard-stop="about")
 *   Stop 2: Core Capabilities top (data-hard-stop="capabilities")
 *   Stop 3: Why DigiHust top (data-hard-stop="why-digihust")
 *
 * Inside Core Capabilities, normal native scrolling occurs.
 * When the end of Core Capabilities is reached, a new downward gesture jumps to Stop 3.
 * Scrolling up from Stop 3 jumps back to the end of Core Capabilities.
 */
export function useHeroHardScroll({
  runwayRef,
  duration = 800,
}: UseHeroHardScrollOptions = {}): void {
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const endReachedTimeRef = useRef<number>(0);

  useEffect(() => {
    // 1. Guard check: Reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // 2. Guard check: Viewport >= 1024px
    const isDesktop = () => window.innerWidth >= 1024;
    if (!isDesktop()) return;

    // Helper: check if a modal, mobile menu, or language dropdown is open
    const isModalOrMenuOpen = () => {
      return (
        document.body.classList.contains('overflow-hidden') ||
        document.body.style.overflow === 'hidden' ||
        Boolean(document.querySelector('[role="dialog"]')) ||
        Boolean(document.querySelector('.dh-nav-mobile-panel')) ||
        Boolean(document.querySelector('[role="listbox"]'))
      );
    };

    // Helper: check if target is inside an internally scrollable element or form field
    const isInsideScrollable = (target: EventTarget | null): boolean => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        return true;
      }

      let el = target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        if (
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT'
        ) {
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

    // Helper: get ordered stops (0: Hero, 1: About, 2: Capabilities, 3: Why DigiHust)
    const getStops = (): number[] => {
      const stops: number[] = [0];

      // Stop 1: About section top
      const aboutEl = document.querySelector<HTMLElement>('[data-hard-stop="about"]');
      if (aboutEl) {
        const top = aboutEl.getBoundingClientRect().top + window.scrollY;
        stops.push(Math.round(top));
      } else if (runwayRef?.current) {
        const rect = runwayRef.current.getBoundingClientRect();
        const bottom = rect.top + window.scrollY + runwayRef.current.offsetHeight;
        stops.push(Math.round(bottom));
      }

      // Stop 2: Core Capabilities top
      const capEl = document.querySelector<HTMLElement>('[data-hard-stop="capabilities"]');
      if (capEl) {
        const top = capEl.getBoundingClientRect().top + window.scrollY;
        stops.push(Math.round(top));
      }

      // Stop 3: Why DigiHust top
      const whyEl = document.querySelector<HTMLElement>('[data-hard-stop="why-digihust"]');
      if (whyEl) {
        const top = whyEl.getBoundingClientRect().top + window.scrollY;
        stops.push(Math.round(top));
      }

      return stops;
    };

    // Custom rAF tween over ~0.8s with silky sinusoidal ease-in-out
    const animateScrollTo = (targetY: number) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const startY = window.scrollY;
      const distance = targetY - startY;

      if (Math.abs(distance) < 2) {
        isAnimatingRef.current = false;
        return;
      }

      const startTime = performance.now();
      const easeInOut = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

      let rafId: number;
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOut(progress);

        window.scrollTo(0, startY + distance * ease);

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);

          // Notify Navbar to reveal if hidden
          window.dispatchEvent(new CustomEvent('dh-show-nav'));

          // 150ms trackpad inertia cooldown buffer to ignore trailing events
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 150);
        }
      };

      rafId = requestAnimationFrame(step);
    };

    // Wheel event handler
    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop() || isModalOrMenuOpen()) return;
      if (e.ctrlKey || e.metaKey) return; // Allow pinch-to-zoom / ctrl-zoom
      if (isInsideScrollable(e.target)) return;

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const stops = getStops();
      if (stops.length < 3) return;

      const currentY = window.scrollY;
      const s0 = stops[0];
      const s1 = stops[1];
      const s2 = stops[2];
      const s3 = stops[3];
      const TOL = 40;
      const deltaY = e.deltaY;
      const THRESHOLD = 12;

      if (Math.abs(deltaY) < THRESHOLD) return;

      const now = performance.now();
      const timeSinceLastWheel = now - lastWheelTimeRef.current;
      lastWheelTimeRef.current = now;

      // Check capabilities section bounds
      const capEl = document.querySelector<HTMLElement>('[data-hard-stop="capabilities"]');
      let isAtServicesEnd = false;
      let servicesReturnY = 0;

      if (capEl) {
        const capRect = capEl.getBoundingClientRect();
        // End reached when bottom edge is within 2px of viewport bottom
        isAtServicesEnd = capRect.bottom <= window.innerHeight + 2;
        servicesReturnY = Math.round(capRect.bottom + window.scrollY - window.innerHeight);

        if (!isAtServicesEnd) {
          endReachedTimeRef.current = 0;
        } else if (endReachedTimeRef.current === 0) {
          endReachedTimeRef.current = now;
        }
      }

      const timeSinceEndReached = endReachedTimeRef.current > 0 ? now - endReachedTimeRef.current : 0;

      if (deltaY > 0) {
        // ── SCROLLING DOWN ──
        if (currentY < s1 - TOL) {
          e.preventDefault();
          animateScrollTo(s1);
        } else if (currentY < s2 - TOL) {
          e.preventDefault();
          animateScrollTo(s2);
        } else if (s3 && isAtServicesEnd && currentY < s3 - 2) {
          // At the end of services: require new gesture (gap >= 120ms) and >= 150ms since end reached
          if (timeSinceLastWheel >= 120 && timeSinceEndReached >= 150) {
            e.preventDefault();
            animateScrollTo(s3);
          }
        }
        // Inside services: free native scroll down
      } else {
        // ── SCROLLING UP ──
        if (s3 && currentY >= s3 - 2 && currentY <= s3 + 60) {
          // Scrolling UP from next section top: animate back to services end
          e.preventDefault();
          animateScrollTo(servicesReturnY);
        } else if (currentY > s2 + 60) {
          // Inside services: free native scroll up
          return;
        } else if (currentY <= s2 + 60 && currentY > s1 + TOL) {
          e.preventDefault();
          animateScrollTo(s1);
        } else if (currentY <= s1 + TOL && currentY > s0 + 5) {
          e.preventDefault();
          animateScrollTo(s0);
        }
      }
    };

    // Keyboard navigation (PageDown, PageUp, ArrowDown, ArrowUp, Space)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDesktop() || isModalOrMenuOpen()) return;
      if (isInsideScrollable(e.target)) return;

      const isDownKey =
        e.key === 'ArrowDown' ||
        e.key === 'PageDown' ||
        (e.key === ' ' && !e.shiftKey);
      const isUpKey =
        e.key === 'ArrowUp' ||
        e.key === 'PageUp' ||
        (e.key === ' ' && e.shiftKey);

      if (!isDownKey && !isUpKey) return;

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const stops = getStops();
      if (stops.length < 3) return;

      const currentY = window.scrollY;
      const s0 = stops[0];
      const s1 = stops[1];
      const s2 = stops[2];
      const s3 = stops[3];
      const TOL = 40;

      const capEl = document.querySelector<HTMLElement>('[data-hard-stop="capabilities"]');
      let isAtServicesEnd = false;
      let servicesReturnY = 0;

      if (capEl) {
        const capRect = capEl.getBoundingClientRect();
        isAtServicesEnd = capRect.bottom <= window.innerHeight + 2;
        servicesReturnY = Math.round(capRect.bottom + window.scrollY - window.innerHeight);
      }

      if (isDownKey) {
        if (currentY < s1 - TOL) {
          e.preventDefault();
          animateScrollTo(s1);
        } else if (currentY < s2 - TOL) {
          e.preventDefault();
          animateScrollTo(s2);
        } else if (s3 && isAtServicesEnd && currentY < s3 - 2) {
          e.preventDefault();
          animateScrollTo(s3);
        }
        // Inside services: let down key scroll naturally
      } else if (isUpKey) {
        if (s3 && currentY >= s3 - 2 && currentY <= s3 + 60) {
          e.preventDefault();
          animateScrollTo(servicesReturnY);
        } else if (currentY > s2 + 60) {
          // Inside services: let up key scroll naturally
          return;
        } else if (currentY <= s2 + 60 && currentY > s1 + TOL) {
          e.preventDefault();
          animateScrollTo(s1);
        } else if (currentY <= s1 + TOL && currentY > s0 + 5) {
          e.preventDefault();
          animateScrollTo(s0);
        }
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
      const deltaY = touchStartYRef.current - touchCurrentY; // > 0 = swiping up = scrolling down
      const SWIPE_THRESHOLD = 30;

      if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

      const stops = getStops();
      if (stops.length < 3) return;

      const currentY = window.scrollY;
      const s0 = stops[0];
      const s1 = stops[1];
      const s2 = stops[2];
      const s3 = stops[3];
      const TOL = 40;

      const capEl = document.querySelector<HTMLElement>('[data-hard-stop="capabilities"]');
      let isAtServicesEnd = false;
      let servicesReturnY = 0;

      if (capEl) {
        const capRect = capEl.getBoundingClientRect();
        isAtServicesEnd = capRect.bottom <= window.innerHeight + 2;
        servicesReturnY = Math.round(capRect.bottom + window.scrollY - window.innerHeight);
      }

      if (deltaY > 0) {
        // ── SWIPE UP = SCROLL DOWN ──
        if (currentY < s1 - TOL) {
          e.preventDefault();
          touchStartYRef.current = null;
          animateScrollTo(s1);
        } else if (currentY < s2 - TOL) {
          e.preventDefault();
          touchStartYRef.current = null;
          animateScrollTo(s2);
        } else if (s3 && isAtServicesEnd && currentY < s3 - 2) {
          e.preventDefault();
          touchStartYRef.current = null;
          animateScrollTo(s3);
        }
      } else {
        // ── SWIPE DOWN = SCROLL UP ──
        if (s3 && currentY >= s3 - 2 && currentY <= s3 + 60) {
          e.preventDefault();
          touchStartYRef.current = null;
          animateScrollTo(servicesReturnY);
        } else if (currentY > s2 + 60) {
          return;
        } else if (currentY <= s2 + 60 && currentY > s1 + TOL) {
          e.preventDefault();
          touchStartYRef.current = null;
          animateScrollTo(s1);
        } else if (currentY <= s1 + TOL && currentY > s0 + 5) {
          e.preventDefault();
          touchStartYRef.current = null;
          animateScrollTo(s0);
        }
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
