import React, { useEffect, useRef } from 'react';
import './HeroBackdrop.css';

export const WAVE_PARALLAX = true;

const CURVE = 'M -200 900 C 220 900, 520 650, 860 520 S 1320 200, 1760 70';

interface HeroBackdropProps {
  heroRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export const HeroBackdrop: React.FC<HeroBackdropProps> = ({
  heroRef,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxLayerRef = useRef<HTMLDivElement>(null);
  const svg2Ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    // ── 1. Pause animations when off-screen or tab hidden ──
    const heroEl = heroRef?.current || containerRef.current;
    let isIntersecting = true;
    let isVisible = !document.hidden;

    const updateSvg2State = () => {
      const svg = svg2Ref.current;
      if (!svg || prefersReducedMotion) return;
      if (isIntersecting && isVisible) {
        try {
          if (svg.animationsPaused && svg.animationsPaused()) {
            svg.unpauseAnimations();
          }
        } catch {
          // ignore
        }
      } else {
        try {
          if (svg.pauseAnimations) {
            svg.pauseAnimations();
          }
        } catch {
          // ignore
        }
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        updateSvg2State();
      },
      { threshold: 0.05 }
    );
    if (heroEl) io.observe(heroEl);

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      updateSvg2State();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── 2. Parallax (up to 14px, lerp 0.08, rAF, refs only) ──
    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isParallaxRunning = false;

    const startParallaxLoop = () => {
      if (isParallaxRunning) return;
      isParallaxRunning = true;

      const loop = () => {
        if (!isIntersecting || !isVisible) {
          isParallaxRunning = false;
          rafId = null;
          return;
        }

        const dx = targetX - currentX;
        const dy = targetY - currentY;

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          currentX += dx * 0.08;
          currentY += dy * 0.08;
          if (parallaxLayerRef.current) {
            parallaxLayerRef.current.style.transform = `translate3d(${currentX.toFixed(
              2
            )}px, ${currentY.toFixed(2)}px, 0)`;
          }
          rafId = requestAnimationFrame(loop);
        } else {
          currentX = targetX;
          currentY = targetY;
          if (parallaxLayerRef.current) {
            parallaxLayerRef.current.style.transform = `translate3d(${currentX.toFixed(
              2
            )}px, ${currentY.toFixed(2)}px, 0)`;
          }
          isParallaxRunning = false;
          rafId = null;
        }
      };

      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!WAVE_PARALLAX || prefersReducedMotion || !hasFinePointer) return;
      const normX = e.clientX / window.innerWidth - 0.5;
      const normY = e.clientY / window.innerHeight - 0.5;
      targetX = normX * 28; // -14px to +14px
      targetY = normY * 28; // -14px to +14px
      startParallaxLoop();
    };

    if (WAVE_PARALLAX && !prefersReducedMotion && hasFinePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    return () => {
      if (heroEl) io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (WAVE_PARALLAX && !prefersReducedMotion && hasFinePointer) {
        window.removeEventListener('pointermove', onPointerMove);
        if (rafId) cancelAnimationFrame(rafId);
      }
    };
  }, [heroRef]);

  return (
    <div
      ref={containerRef}
      className={`dh-hero-backdrop ${className}`}
      aria-hidden="true"
    >
      <div ref={parallaxLayerRef} className="dh-wave-parallax-layer">
        {/* SVG 1: STATIC LAYER (breathing animation, will-change: transform) */}
        <svg
          className="dh-wave-svg dh-wave-svg--static"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          width="100%"
          height="100%"
        >
          <defs>
            <linearGradient
              id="dh-wave-g"
              gradientUnits="userSpaceOnUse"
              x1="-200"
              y1="0"
              x2="1760"
              y2="0"
            >
              <stop
                offset="0%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-1))',
                  stopOpacity: 0,
                }}
              />
              <stop
                offset="22%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-1))',
                  stopOpacity: 0.5,
                }}
              />
              <stop
                offset="52%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-2))',
                  stopOpacity: 0.45,
                }}
              />
              <stop
                offset="80%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-3))',
                  stopOpacity: 0.42,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-3))',
                  stopOpacity: 0,
                }}
              />
            </linearGradient>

            <filter
              id="dh-wave-blur-28"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="28" />
            </filter>
            <filter
              id="dh-wave-blur-6"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* 1. Band (stroke 150, blur 28) */}
          <g filter="url(#dh-wave-blur-28)">
            <path
              d={CURVE}
              stroke="url(#dh-wave-g)"
              strokeWidth="150"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* 2. Crest (stroke 10, blur 6, opacity 0.55) */}
          <path
            d={CURVE}
            stroke="url(#dh-wave-g)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            filter="url(#dh-wave-blur-6)"
            opacity="0.55"
          />

          {/* 3. Hairlines (stroke 1.5, translated, no blur) */}
          <path
            d={CURVE}
            stroke="url(#dh-wave-g)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            transform="translate(0, -46)"
            opacity="0.55"
          />
          <path
            d={CURVE}
            stroke="url(#dh-wave-g)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            transform="translate(0, 52)"
            opacity="0.35"
          />
        </svg>

        {/* SVG 2: MOTION LAYER (no filters, circle r=140 along CURVE) */}
        <svg
          ref={svg2Ref}
          className="dh-wave-svg dh-wave-svg--motion"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          width="100%"
          height="100%"
        >
          <defs>
            <radialGradient id="dh-wave-orb" cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-hi))',
                  stopOpacity: 0.6,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: 'rgb(var(--dh-wave-hi))',
                  stopOpacity: 0,
                }}
              />
            </radialGradient>
          </defs>

          <circle r="140" fill="url(#dh-wave-orb)">
            <animateMotion
              dur="22s"
              repeatCount="indefinite"
              path={CURVE}
              rotate="0"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.15;0.85;1"
              dur="22s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </div>
  );
};
