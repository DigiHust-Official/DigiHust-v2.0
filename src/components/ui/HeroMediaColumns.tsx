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
  const railLabel = frame.shortLabel || displayLabel;

  // Render upright stacked letters (Joker playing-card style)
  const renderStackedLetters = () => {
    const chars = Array.from((railLabel || '').toUpperCase());
    const len = chars.length;
    const sizeModifier =
      len >= 12
        ? 'dh-card-stacked-label--sm'
        : len >= 8
        ? 'dh-card-stacked-label--md'
        : 'dh-card-stacked-label--lg';

    return (
      <div className={`dh-card-stacked-label ${sizeModifier}`} aria-hidden="true">
        {chars.map((char, i) => {
          if (char === ' ') {
            return (
              <span
                key={i}
                className="dh-card-stacked-space"
                aria-hidden="true"
              />
            );
          }
          return (
            <span
              key={i}
              className="dh-card-stacked-char"
              aria-hidden="true"
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  // Render rail content: corner icon + small gap + upright stacked letters (shared center axis)
  const renderRailContent = () => (
    <div className="dh-card-rail-content" aria-hidden="true">
      <IconComponent className="dh-card-corner-icon" strokeWidth={2.5} />
      <span className="dh-card-rail-gap" aria-hidden="true" />
      {renderStackedLetters()}
    </div>
  );

  return (
    <div
      className="hero-media-frame dh-card"
      tabIndex={isClone ? -1 : 0}
      aria-hidden={isClone}
      aria-label={isClone ? undefined : displayLabel}
    >
      {/* a) Left Rail: Icon at top + small gap + upright stacked letters on one straight line */}
      <div className="dh-card-rail-left" aria-hidden="true">
        {renderRailContent()}
      </div>

      {/* b) Window (area win): aspect-ratio 4/5, recessed */}
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
          <div className="dh-card-placeholder">
            <div className="dh-card-placeholder-icon">
              <IconComponent strokeWidth={1.25} className="w-full h-full object-contain" />
            </div>
            <div className="dh-card-placeholder-spec">
              {isVideo ? '4:5 · 1080x1350 · MP4 4-6s' : '4:5 · 1200x1500'}
            </div>
          </div>
        )}
      </div>

      {/* c) Right Rail: Same stack rotated 180deg as a whole */}
      <div className="dh-card-rail-right" aria-hidden="true">
        {renderRailContent()}
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

    window.addEventListener('resize', measureHeights);
    window.addEventListener('load', measureHeights);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureHeights);
      window.removeEventListener('load', measureHeights);
    };
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

        /* ── Silver Playing Card Styling ── */
        .dh-card {
          container-type: inline-size;
          width: 100%;
          aspect-ratio: 63 / 88;
          position: relative;
          margin-bottom: var(--hero-column-gap);
          border-radius: 12px;
          background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.10) 0 1px, rgba(0, 0, 0, 0.025) 1px 2px), var(--dh-silver-face);
          box-shadow: var(--dh-silver-edge), var(--dh-silver-shadow);
          --card-inset: clamp(20px, 11.962cqw, 32px);
          --dh-engrave-steel: #5d6773;
          user-select: none;
          box-sizing: border-box;
        }

        .dark .dh-card,
        [data-theme="dark"] .dh-card,
        html.dark .dh-card,
        html[data-theme="dark"] .dh-card {
          --dh-engrave-steel: #4a535d;
        }

        /* Engraved inner line */
        .dh-card::before {
          content: '';
          position: absolute;
          inset: 2%;
          border: 1px solid rgba(10, 31, 43, 0.20);
          border-radius: 9px;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
          pointer-events: none;
          z-index: 2;
        }

        /* Rails */
        .dh-card-rail-left {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: var(--card-inset);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: calc(var(--card-inset) / 2);
          z-index: 3;
          overflow: hidden;
          box-sizing: border-box;
        }

        .dh-card-rail-right {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: var(--card-inset);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: calc(var(--card-inset) / 2);
          z-index: 3;
          overflow: hidden;
          transform: rotate(180deg);
          box-sizing: border-box;
        }

        .dh-card-rail-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
        }

        .dh-card-corner-icon {
          width: clamp(13px, 5.8cqw, 20px);
          height: clamp(13px, 5.8cqw, 20px);
          color: var(--dh-engrave-steel);
          stroke: var(--dh-engrave-steel);
          flex-shrink: 0;
        }

        /* Left Rail: top light source */
        .dh-card-rail-left .dh-card-corner-icon {
          filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.85)) drop-shadow(0 -1px 0 rgba(0, 0, 0, 0.30));
        }

        /* Right Rail (180deg rotated): inverted shadow offsets keep top highlight and bottom shadow */
        .dh-card-rail-right .dh-card-corner-icon {
          filter: drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.85)) drop-shadow(0 1px 0 rgba(0, 0, 0, 0.30));
        }

        .dh-card-rail-gap {
          display: block;
          height: clamp(4px, 1.8cqw, 7px);
          width: 1px;
          flex-shrink: 0;
        }

        .dh-card-stacked-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          line-height: 1.08;
          font-family: 'Plus Jakarta Sans', var(--font-sans, sans-serif);
          font-weight: 600;
          letter-spacing: 0.04em;
          color: transparent;
          background-color: var(--dh-engrave-steel);
          background-clip: text;
          -webkit-background-clip: text;
          user-select: none;
        }

        /* Left Rail: top highlight, bottom shadow */
        .dh-card-rail-left .dh-card-stacked-label {
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85), 0 -1px 0 rgba(0, 0, 0, 0.28);
        }

        /* Right Rail (180deg rotated): inverted offsets so light source remains from the top */
        .dh-card-rail-right .dh-card-stacked-label {
          text-shadow: 0 -1px 0 rgba(255, 255, 255, 0.85), 0 1px 0 rgba(0, 0, 0, 0.28);
        }

        .dh-card-stacked-label--sm {
          font-size: clamp(7.5px, 2.5cqw, 10.5px);
        }

        .dh-card-stacked-label--md {
          font-size: clamp(8px, 2.8cqw, 11.5px);
        }

        .dh-card-stacked-label--lg {
          font-size: clamp(8.5px, 3.2cqw, 12.5px);
        }

        .dh-card-stacked-char {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 1.08em;
          flex-shrink: 0;
          color: inherit;
          background-color: inherit;
          background-clip: inherit;
          -webkit-background-clip: inherit;
          text-shadow: inherit;
        }

        .dh-card-stacked-space {
          height: 0.6em;
          width: 1px;
          display: block;
          flex-shrink: 0;
        }

        /* Window: recessed portrait media, even insets on all four sides */
        .dh-card-window {
          position: absolute;
          inset: var(--card-inset);
          border-radius: 6px;
          overflow: hidden;
          z-index: 1;
          box-shadow: inset 0 0 0 1px rgba(10, 31, 43, 0.28), 0 1px 0 rgba(255, 255, 255, 0.60);
        }

        /* Flat tint architectural placeholder */
        .dh-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1rem;
          box-sizing: border-box;
          background: linear-gradient(160deg, rgba(31, 122, 140, 0.14), rgba(31, 122, 140, 0.05));
        }

        html[data-theme="dark"] .dh-card-placeholder,
        html.dark .dh-card-placeholder,
        :root .dh-card-placeholder {
          background: linear-gradient(160deg, rgba(10, 31, 43, 0.22), rgba(10, 31, 43, 0.10));
        }

        .dh-card-placeholder-icon {
          width: 30%;
          height: 30%;
          max-width: 90px;
          max-height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dh-ink);
          opacity: 0.45;
        }

        .dh-card-placeholder-spec {
          position: absolute;
          bottom: 8px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          font-family: monospace;
          color: var(--dh-ink);
          opacity: 0.60;
        }

        /* Desktop Layout (lg and up) */
        @media (min-width: 1024px) {
          .hero-media-columns-desktop {
            position: absolute;
            top: calc(var(--dh-nav-bottom, 68px) + 12px);
            bottom: 0;
            right: var(--dh-gutter, clamp(16px, 3.5vw, 40px));
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
            height: 78vw;
            max-height: 540px;
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
