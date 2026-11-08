import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useScroll,
  useVelocity,
  useSpring,
  useReducedMotion,
  MotionValue,
} from 'framer-motion';
import {
  PenTool,
  Code2,
  Workflow,
  TrendingUp,
  Search,
  ShieldCheck,
  BarChart3,
  Puzzle,
} from 'lucide-react';
import { HERO_FRAMES, HeroFrame } from '../../data/heroFrames';
import { useLanguage } from '../../context/LanguageContext';

const ICON_MAP: Record<string, React.ElementType> = {
  '01': PenTool,
  '02': Code2,
  '03': Workflow,
  '04': TrendingUp,
  '05': Search,
  '06': ShieldCheck,
  '07': BarChart3,
  '08': Puzzle,
};

// Named constant: 28 px per second base constant pace
export const BASE_HERO_SPEED = 28;

interface HeroMediaColumnsProps {
  className?: string;
  heroRef?: React.RefObject<HTMLElement | null>;
  runwayRef?: React.RefObject<HTMLElement | null>;
}

interface FrameCardProps {
  frame: HeroFrame;
  isClone?: boolean;
  videoRefs?: React.MutableRefObject<HTMLVideoElement[]>;
  isMobile?: boolean;
}

const FrameCard: React.FC<FrameCardProps> = ({
  frame,
  isClone = false,
  videoRefs,
  isMobile = false,
}) => {
  const { t } = useLanguage();
  const IconComponent = ICON_MAP[frame.serviceNumber] || PenTool;
  const isVideo = frame.type === 'video';
  const hasSource = Boolean(frame.src && frame.src.trim() !== '');

  const localizedLabel = frame.labelKey ? t(frame.labelKey) : frame.label;
  const displayLabel = localizedLabel || frame.label;

  return (
    <div
      className="hero-media-frame relative w-full aspect-[4/5] rounded-[20px] overflow-hidden select-none border border-[var(--dh-border)] bg-[var(--dh-surface-alt)]"
      style={{
        boxShadow: 'var(--hero-frame-shadow)',
        marginBottom: 'var(--hero-column-gap)',
      }}
      tabIndex={isClone ? -1 : 0}
      aria-hidden={isClone}
    >
      {/* ── Media: <img> or <video> ── */}
      {hasSource ? (
        isVideo ? (
          <video
            ref={(el) => {
              if (el && videoRefs && !videoRefs.current.includes(el)) {
                videoRefs.current.push(el);
              }
            }}
            src={frame.src}
            poster={frame.poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover pointer-events-none"
            aria-label={isClone ? '' : frame.alt}
          />
        ) : (
          <img
            src={frame.src}
            alt={isClone ? '' : frame.alt}
            decoding="async"
            className="w-full h-full object-cover pointer-events-none"
          />
        )
      ) : (
        /* ── Architectural Placeholder ── */
        <div
          className="w-full h-full flex flex-col items-center justify-center relative p-4"
          style={{
            background:
              'linear-gradient(135deg, var(--dh-surface) 0%, var(--dh-surface-alt) 100%)',
          }}
        >
          {/* Centered Lucide Icon: 34% width, strokeWidth 1.25, muted at 40% opacity */}
          <div className="w-[34%] h-[34%] max-w-[120px] max-h-[120px] flex items-center justify-center text-[var(--text-muted)] opacity-40">
            <IconComponent
              strokeWidth={1.25}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Dimension Specifications Line */}
          <div className="text-[11px] font-mono text-[var(--text-muted)] opacity-75 mt-3 tracking-tight text-center">
            {isVideo ? '4:5 · 1080x1350 · MP4 4-6s' : '4:5 · 1200x1500'}
          </div>
        </div>
      )}

      {/* ── Bottom Scrim ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(2, 12, 18, 0.60) 0%, rgba(2, 12, 18, 0) 42%)',
        }}
      />

      {/* ── Bottom-Left Label ── */}
      <div className="absolute left-4 bottom-4 right-4 z-20 flex items-center pointer-events-none">
        <span className="text-[11px] font-mono text-white/70 tabular-nums mr-2 shrink-0">
          {frame.serviceNumber}
        </span>
        <span
          className={`font-semibold text-white tracking-[0.02em] truncate ${
            isMobile ? 'text-[11px]' : 'text-[12.5px] lg:text-[13px]'
          }`}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
};

export const HeroMediaColumns: React.FC<HeroMediaColumnsProps> = ({
  className = '',
  heroRef,
  runwayRef,
}) => {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [isInView, setIsInView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Column frames
  const upFrames = useMemo(
    () => HERO_FRAMES.filter((f) => f.column === 'up'),
    []
  );
  const downFrames = useMemo(
    () => HERO_FRAMES.filter((f) => f.column === 'down'),
    []
  );

  // Video element tracking
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  // Heights of one 4-frame set per column (measured via ResizeObserver)
  const upSetRef = useRef<HTMLDivElement>(null);
  const downSetRef = useRef<HTMLDivElement>(null);
  const [upSetHeight, setUpSetHeight] = useState(0);
  const [downSetHeight, setDownSetHeight] = useState(0);

  // MotionValues for column Y transforms
  const yUp = useMotionValue(0);
  const yDown = useMotionValue(0);

  // Unbounded position tracking
  const upPos = useRef(0);
  const downPos = useRef(0);
  const hasInitializedDownOffset = useRef(false);

  // Scroll velocity tracking across runway or window
  const scrollTarget = runwayRef?.current ? runwayRef : undefined;
  const { scrollY } = useScroll(
    scrollTarget?.current ? { target: scrollTarget } : {}
  );
  const scrollVelocity = useVelocity(scrollY);
  // Smoothly decay back to 0 over ~0.6s
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 120,
    damping: 30,
  });

  // Check mobile viewport (< 1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Measure single-set height H with ResizeObserver
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    const measureHeights = () => {
      if (upSetRef.current) {
        const cards = upSetRef.current.querySelectorAll('.hero-media-frame');
        if (cards.length > 0) {
          const first = cards[0].getBoundingClientRect();
          const last = cards[cards.length - 1].getBoundingClientRect();
          const gap = cards.length > 1
            ? cards[1].getBoundingClientRect().top - first.bottom
            : 16;
          const h = (last.bottom - first.top) + gap;
          if (h > 0) setUpSetHeight(h);
        }
      }
      if (downSetRef.current) {
        const cards = downSetRef.current.querySelectorAll('.hero-media-frame');
        if (cards.length > 0) {
          const first = cards[0].getBoundingClientRect();
          const last = cards[cards.length - 1].getBoundingClientRect();
          const gap = cards.length > 1
            ? cards[1].getBoundingClientRect().top - first.bottom
            : 16;
          const h = (last.bottom - first.top) + gap;
          if (h > 0) {
            setDownSetHeight(h);
            if (!hasInitializedDownOffset.current) {
              const frameHeight = first.height;
              downPos.current = frameHeight / 2;
              hasInitializedDownOffset.current = true;
            }
          }
        }
      }
    };

    const observer = new ResizeObserver(measureHeights);
    if (upSetRef.current) observer.observe(upSetRef.current);
    if (downSetRef.current) observer.observe(downSetRef.current);
    measureHeights();

    return () => observer.disconnect();
  }, []);

  // IntersectionObserver to pause loop and videos when hero is off-screen
  useEffect(() => {
    const target = heroRef?.current || runwayRef?.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [heroRef, runwayRef]);

  // Video play/pause management
  useEffect(() => {
    const handleVisibility = () => {
      const active =
        isInView && !document.hidden && !shouldReduceMotion && !isMobile;
      videoRefs.current.forEach((video) => {
        if (!video) return;
        if (active) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [isInView, shouldReduceMotion, isMobile]);

  // Modulo wrap helper functions
  const wrapUp = (pos: number, H: number): number => {
    if (H <= 0) return 0;
    const rem = pos % H;
    return rem > 0 ? rem - H : rem;
  };

  const wrapDown = (pos: number, H: number): number => {
    if (H <= 0) return 0;
    const rem = ((pos % H) + H) % H;
    return rem - H;
  };

  // Continuous animation frame loop
  useAnimationFrame((_time, delta) => {
    if (shouldReduceMotion) {
      yUp.set(0);
      yDown.set(downSetHeight > 0 ? -downSetHeight / 8 : 0);
      return;
    }

    if (!isInView || (typeof document !== 'undefined' && document.hidden)) {
      return;
    }

    // Clamp dt to 50ms (0.05s) for frame-rate independence
    const dt = Math.min(delta / 1000, 0.05);

    // Scroll speed boost (only active on desktop >= 1024px)
    let extraSpeed = 0;
    if (!isMobile) {
      const v = Math.abs(smoothVelocity.get());
      extraSpeed = Math.min(v * 0.8, 2400);
    }

    const currentSpeed = BASE_HERO_SPEED + extraSpeed;

    // Up column moves up (content decreases)
    if (upSetHeight > 0) {
      upPos.current -= currentSpeed * dt;
      yUp.set(wrapUp(upPos.current, upSetHeight));
    }

    // Down column moves down (content increases)
    if (downSetHeight > 0) {
      downPos.current += currentSpeed * dt;
      yDown.set(wrapDown(downPos.current, downSetHeight));
    }
  });

  return (
    <div
      className={`hero-media-columns-container select-none ${className}`}
      aria-hidden="true"
    >
      <style>{`
        .hero-media-columns-container {
          --hero-column-gap: clamp(12px, 1.2vw, 20px);
          --hero-frame-shadow: 0 10px 30px rgba(2, 43, 58, 0.10);
        }
        .dark .hero-media-columns-container,
        [data-theme="dark"] .hero-media-columns-container {
          --hero-frame-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        }

        /* Desktop Layout (lg and up) */
        @media (min-width: 1024px) {
          .hero-media-columns-desktop {
            position: absolute;
            top: 0;
            bottom: 0;
            right: clamp(1.5rem, 2vw, 2rem);
            width: min(40vw, 46rem);
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: var(--hero-column-gap);
            z-index: 1;
            overflow: hidden;
            mask-image: linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%);
            pointer-events: none;
          }
        }

        /* Mobile Layout (< 1024px) */
        @media (max-width: 1023px) {
          .hero-media-columns-mobile {
            position: relative;
            width: 100%;
            height: 70vw;
            max-height: 520px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: var(--hero-column-gap);
            overflow: hidden;
            mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
            pointer-events: none;
            margin-top: 2rem;
          }
        }
      `}</style>

      {/* ── DESKTOP TWO-COLUMN VIEW (lg and up) ── */}
      <div className="hidden lg:grid hero-media-columns-desktop">
        {/* Column 1: "up" */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.div
            style={{ y: yUp }}
            className="w-full flex flex-col will-change-transform"
          >
            {/* Set 1 (Original 4 frames) */}
            <div ref={upSetRef} className="w-full flex flex-col">
              {upFrames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  videoRefs={videoRefs}
                  isMobile={false}
                />
              ))}
            </div>

            {/* Set 2 (Clone 4 frames for seamless loop) */}
            {!shouldReduceMotion && (
              <div className="w-full flex flex-col" aria-hidden="true">
                {upFrames.map((frame) => (
                  <FrameCard
                    key={`${frame.id}-clone`}
                    frame={frame}
                    isClone={true}
                    videoRefs={videoRefs}
                    isMobile={false}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Column 2: "down" */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.div
            style={{ y: yDown }}
            className="w-full flex flex-col will-change-transform"
          >
            {/* Set 1 (Original 4 frames) */}
            <div ref={downSetRef} className="w-full flex flex-col">
              {downFrames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  videoRefs={videoRefs}
                  isMobile={false}
                />
              ))}
            </div>

            {/* Set 2 (Clone 4 frames for seamless loop) */}
            {!shouldReduceMotion && (
              <div className="w-full flex flex-col" aria-hidden="true">
                {downFrames.map((frame) => (
                  <FrameCard
                    key={`${frame.id}-clone`}
                    frame={frame}
                    isClone={true}
                    videoRefs={videoRefs}
                    isMobile={false}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE TWO-COLUMN VIEW (< 1024px) ── */}
      <div className="grid lg:hidden hero-media-columns-mobile">
        {/* Column 1: "up" */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.div
            style={{ y: yUp }}
            className="w-full flex flex-col will-change-transform"
          >
            <div className="w-full flex flex-col">
              {upFrames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  videoRefs={videoRefs}
                  isMobile={true}
                />
              ))}
            </div>
            {!shouldReduceMotion && (
              <div className="w-full flex flex-col" aria-hidden="true">
                {upFrames.map((frame) => (
                  <FrameCard
                    key={`${frame.id}-clone-mobile`}
                    frame={frame}
                    isClone={true}
                    videoRefs={videoRefs}
                    isMobile={true}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Column 2: "down" */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.div
            style={{ y: yDown }}
            className="w-full flex flex-col will-change-transform"
          >
            <div className="w-full flex flex-col">
              {downFrames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  videoRefs={videoRefs}
                  isMobile={true}
                />
              ))}
            </div>
            {!shouldReduceMotion && (
              <div className="w-full flex flex-col" aria-hidden="true">
                {downFrames.map((frame) => (
                  <FrameCard
                    key={`${frame.id}-clone-mobile`}
                    frame={frame}
                    isClone={true}
                    videoRefs={videoRefs}
                    isMobile={true}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
