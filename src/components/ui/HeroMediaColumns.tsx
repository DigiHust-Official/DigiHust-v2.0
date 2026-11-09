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

  // Rank: 1 to 8 based on position in HERO_FRAMES
  const rank = HERO_FRAMES.findIndex((f) => f.id === frame.id) + 1;

  return (
    <div
      className="hero-media-frame dh-card"
      tabIndex={isClone ? -1 : 0}
      aria-hidden={isClone}
      aria-label={isClone ? undefined : displayLabel}
    >
      {/* ── Window (4:5, relative, overflow hidden, radius 6px) ── */}
      <div className="dh-card-window">
        {/* Real media: <img> or <video> */}
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
          /* Architectural Placeholder */
          <div
            className="w-full h-full flex flex-col items-center justify-center relative p-4"
            style={{
              background: 'var(--dh-placeholder-gradient)',
            }}
          >
            <div className="w-[30%] h-[30%] max-w-[100px] max-h-[100px] flex items-center justify-center text-[var(--dh-card-ink)] opacity-40">
              <IconComponent
                strokeWidth={1.25}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-mono text-[var(--dh-card-ink)] opacity-55">
              {isVideo ? '4:5 · 1080x1350 · MP4 4-6s' : '4:5 · 1200x1500'}
            </div>
          </div>
        )}

        {/* ── Corner Tabs (Top-Left & Mirrored Bottom-Right) ── */}
        <div className="dh-card-tab dh-card-tab-tl" aria-hidden="true">
          <span className="dh-card-tab-rank">{rank}</span>
          <IconComponent className="dh-card-tab-icon" strokeWidth={1.75} />
        </div>

        <div className="dh-card-tab dh-card-tab-br" aria-hidden="true">
          <span className="dh-card-tab-rank">{rank}</span>
          <IconComponent className="dh-card-tab-icon" strokeWidth={1.75} />
        </div>
      </div>

      {/* ── Name Row Under Window ── */}
      <div className="dh-card-name-row" aria-hidden="true">
        <span className="dh-card-rule" />
        <span className="dh-card-name">{displayLabel}</span>
        <span className="dh-card-rule" />
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
          --dh-placeholder-gradient: linear-gradient(160deg, rgba(31, 122, 140, 0.10), rgba(31, 122, 140, 0.03));
        }
        .dark .hero-media-columns-container,
        [data-theme="dark"] .hero-media-columns-container,
        html.dark .hero-media-columns-container,
        html[data-theme="dark"] .hero-media-columns-container {
          --dh-placeholder-gradient: linear-gradient(160deg, rgba(46, 196, 214, 0.10), rgba(46, 196, 214, 0.03));
        }

        /* ── Playing Card Styling ── */
        .dh-card {
          container-type: inline-size;
          width: 100%;
          position: relative;
          background: var(--dh-card-face);
          border: 1px solid rgba(10, 31, 43, 0.14);
          border-radius: 12px;
          padding: 5.5% 5.5% 4%;
          margin-bottom: var(--hero-column-gap);
          box-shadow: var(--dh-card-shadow);
          user-select: none;
          box-sizing: border-box;
        }

        /* Inner border */
        .dh-card::before {
          content: '';
          position: absolute;
          inset: 2.5%;
          border: 1px solid var(--dh-card-line);
          border-radius: 9px;
          pointer-events: none;
          z-index: 2;
        }

        /* Window: 4:5 aspect ratio */
        .dh-card-window {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          border-radius: 6px;
          overflow: hidden;
          z-index: 1;
        }

        .dh-card-window::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(10, 31, 43, 0.14);
          border-radius: 6px;
          pointer-events: none;
          z-index: 5;
        }

        /* Corner tabs (Top-Left & Mirrored Bottom-Right) */
        .dh-card-tab {
          position: absolute;
          background: var(--dh-card-face);
          padding: 1.8cqw 2.2cqw 2.2cqw;
          border-bottom-right-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8cqw;
          z-index: 10;
          pointer-events: none;
          box-sizing: border-box;
        }

        .dh-card-tab-tl {
          left: 0;
          top: 0;
        }

        .dh-card-tab-br {
          right: 0;
          bottom: 0;
          transform: rotate(180deg);
        }

        .dh-card-tab-rank {
          font-family: ui-serif, Georgia, "Times New Roman", serif;
          font-weight: 700;
          font-size: clamp(14px, 6.6cqw, 28px);
          line-height: 1;
          color: var(--dh-card-ink);
        }

        .dh-card-tab-icon {
          width: clamp(11px, 5cqw, 20px);
          height: clamp(11px, 5cqw, 20px);
          color: var(--dh-card-ink);
        }

        /* Name row under window */
        .dh-card-name-row {
          margin-top: 3.2cqw;
          display: flex;
          align-items: center;
          gap: 2.4cqw;
          text-align: center;
          width: 100%;
          z-index: 1;
          position: relative;
        }

        .dh-card-rule {
          flex: 1;
          min-width: 12px;
          height: 1px;
          background: var(--dh-card-line);
        }

        .dh-card-name {
          text-transform: uppercase;
          font-size: clamp(9.5px, 3cqw, 13px);
          font-weight: 600;
          letter-spacing: 0.1em;
          line-height: 1.25;
          text-wrap: balance;
          color: var(--dh-card-ink);
          white-space: normal;
          text-align: center;
        }

        /* Desktop Layout (lg and up) */
        @media (min-width: 1024px) {
          .hero-media-columns-desktop {
            position: absolute;
            top: calc(var(--dh-nav-bottom, 68px) + 12px);
            bottom: 0;
            right: clamp(1.5rem, 2vw, 2rem);
            width: min(34vw, 36rem);
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: var(--hero-column-gap);
            z-index: 1;
            overflow: hidden;
            mask-image: linear-gradient(to bottom, transparent 0, #000 12%, #000 90%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 12%, #000 90%, transparent 100%);
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
