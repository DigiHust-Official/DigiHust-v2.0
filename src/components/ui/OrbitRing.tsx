import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
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
import { useLanguage } from '../../context/LanguageContext';

export interface OrbitService {
  id: string;
  numStr: string;
  nameKey: string;
  outcomeKey: string;
  audienceKey: string;
  defaultName: string;
  defaultOutcome: string;
  defaultAudience: string;
  icon: React.ElementType;
}

export const ORBIT_SERVICES: OrbitService[] = [
  {
    id: 'graphic-design',
    numStr: '01',
    nameKey: 'orbit_service_1_name',
    outcomeKey: 'orbit_service_1_outcome',
    audienceKey: 'orbit_service_1_audience',
    defaultName: 'Graphic Design & Branding',
    defaultOutcome: 'A brand customers remember and trust.',
    defaultAudience: 'Startups launching and companies rebranding',
    icon: PenTool,
  },
  {
    id: 'fullstack-dev',
    numStr: '02',
    nameKey: 'orbit_service_2_name',
    outcomeKey: 'orbit_service_2_outcome',
    audienceKey: 'orbit_service_2_audience',
    defaultName: 'Full Stack Development',
    defaultOutcome: 'Web and mobile products built to scale with you.',
    defaultAudience: 'Businesses taking an idea to a live product',
    icon: Code2,
  },
  {
    id: 'ai-automations',
    numStr: '03',
    nameKey: 'orbit_service_3_name',
    outcomeKey: 'orbit_service_3_outcome',
    audienceKey: 'orbit_service_3_audience',
    defaultName: 'AI Automations',
    defaultOutcome: 'Repetitive work handled automatically, so your team can focus on growth.',
    defaultAudience: 'Operations teams buried in manual tasks',
    icon: Workflow,
  },
  {
    id: 'growth-marketing',
    numStr: '04',
    nameKey: 'orbit_service_4_name',
    outcomeKey: 'orbit_service_4_outcome',
    audienceKey: 'orbit_service_4_audience',
    defaultName: 'Growth & Marketing',
    defaultOutcome: 'Campaigns that turn attention into paying customers.',
    defaultAudience: 'Brands ready to grow their audience and revenue',
    icon: TrendingUp,
  },
  {
    id: 'seo',
    numStr: '05',
    nameKey: 'orbit_service_5_name',
    outcomeKey: 'orbit_service_5_outcome',
    audienceKey: 'orbit_service_5_audience',
    defaultName: 'SEO',
    defaultOutcome: 'Be found by the people who are already searching for you.',
    defaultAudience: 'Businesses that want steady organic traffic',
    icon: Search,
  },
  {
    id: 'cybersecurity',
    numStr: '06',
    nameKey: 'orbit_service_6_name',
    outcomeKey: 'orbit_service_6_outcome',
    audienceKey: 'orbit_service_6_audience',
    defaultName: 'Cyber Security',
    defaultOutcome: 'Find the weak spots before attackers do.',
    defaultAudience: 'Companies protecting customer data and uptime',
    icon: ShieldCheck,
  },
  {
    id: 'bi-dashboards',
    numStr: '07',
    nameKey: 'orbit_service_7_name',
    outcomeKey: 'orbit_service_7_outcome',
    audienceKey: 'orbit_service_7_audience',
    defaultName: 'BI Dashboards',
    defaultOutcome: 'Your data, turned into decisions you can act on.',
    defaultAudience: 'Leaders who need clear numbers, not spreadsheets',
    icon: BarChart3,
  },
  {
    id: 'business-solutions',
    numStr: '08',
    nameKey: 'orbit_service_8_name',
    outcomeKey: 'orbit_service_8_outcome',
    audienceKey: 'orbit_service_8_audience',
    defaultName: 'Business Solutions',
    defaultOutcome: 'Custom systems that fit how your business actually works.',
    defaultAudience: 'Teams outgrowing off-the-shelf tools',
    icon: Puzzle,
  },
];

export interface OrbitRingProps {
  runwayRef?: React.RefObject<HTMLElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/* ── Individual Rotating Arm Component ───────────────────────────────────── */
interface OrbitArmProps {
  service: OrbitService;
  idx: number;
  stepDeg: number;
  ringRotation: MotionValue<number>;
  tailOpacity: MotionValue<number>;
  tailScaleSigned: MotionValue<number>;
  isActive: boolean;
}

const OrbitArm: React.FC<OrbitArmProps> = ({
  service,
  idx,
  stepDeg,
  ringRotation,
  tailOpacity,
  tailScaleSigned,
  isActive,
}) => {
  const angleDeg = idx * stepDeg;
  const IconComp = service.icon;

  // Counter-rotate badge so lighting (highlight at top-left) and icons stay fixed
  const badgeRot = useTransform(ringRotation, (rot) => -(angleDeg + rot));

  return (
    <div
      className="orbit-arm"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        transform: `rotate(${angleDeg}deg) translateY(calc(-1 * var(--R)))`,
        transformOrigin: '0 0',
      }}
    >
      {/* 
        Velocity-Driven Motion Tail:
        - Tapered comet tail trailing behind stone motion along orbit curve.
        - Length: calc(var(--badge) * 2.4); Height: calc(var(--badge) * 0.8)
        - Starts under stone, fades to fully transparent.
        - Recolor: LIGHT rgba(23,31,37,0.32), DARK rgba(217,224,228,0.30).
        - Invisible when idle or below 150 px/s (|v| < 150, opacity: 0).
        - Smoothly grows and fades in with scroll velocity (|v| >= 150, full at 1500 px/s).
        - Direction automatically follows velocity sign (flips when scrolling upward).
      */}
      <motion.div
        className="orbit-trail pointer-events-none"
        style={{
          position: 'absolute',
          top: 'calc(var(--badge) * -0.4)',
          right: '0px',
          width: 'calc(var(--badge) * 2.4)',
          height: 'calc(var(--badge) * 0.8)',
          borderRadius: '999px',
          filter: 'blur(10px)',
          transformOrigin: '100% 50%',
          rotate: 188,
          scaleX: tailScaleSigned,
          opacity: tailOpacity,
          zIndex: 10,
        }}
      />

      {/* Ceramic Stone Badge Anchor at Centerline (0, 0) */}
      <div
        className="orbit-badge-anchor"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }}
      >
        <motion.div style={{ rotate: badgeRot }} className="will-change-transform">
          <div
            tabIndex={0}
            role="img"
            aria-label={service.defaultName}
            title={service.defaultName}
            className="orbit-badge group relative rounded-full flex items-center justify-center pointer-events-auto cursor-pointer focus:outline-none"
            style={{
              width: 'var(--badge)',
              height: 'var(--badge)',
            }}
          >
            {/* Engraved Icon (48% of badge size): Two stacked copies */}
            <div
              className="relative flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-110 z-10"
              style={{
                width: 'calc(var(--badge) * 0.48)',
                height: 'calc(var(--badge) * 0.48)',
              }}
            >
              {/* (a) GROOVE (bottom copy): strokeWidth 3.6 */}
              <IconComp
                strokeWidth={3.6}
                className="w-full h-full absolute inset-0 orbit-icon-groove"
              />

              {/* (b) INLAY (top copy): strokeWidth 2.25 */}
              <IconComp
                strokeWidth={2.25}
                className="w-full h-full absolute inset-0 orbit-icon-inlay"
              />
            </div>

            {/* Hover Tooltip */}
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-xl text-xs font-bold text-[var(--text-heading)] whitespace-nowrap z-50 pointer-events-none transition-all duration-200">
              {service.defaultName}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ── Angular Distance Helper ─────────────────────────────────────────────── */
function getAngularDistance(angle1: number, angle2: number): number {
  const diff = (((angle1 - angle2 + 180) % 360) + 360) % 360 - 180;
  return Math.abs(diff);
}

export const OrbitRing: React.FC<OrbitRingProps> = ({
  runwayRef,
  containerRef,
  className = '',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(true);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const { t } = useLanguage();

  // Active stone state with 4-degree hysteresis
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Velocity freeze state: freeze displayed caption during high scroll velocity
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const displayedIndexRef = useRef(0);
  const [isFastScroll, setIsFastScroll] = useState(false);
  const isFastScrollRef = useRef(false);

  // ── Scroll Tracking across Runway ─────────────────────────────────────────
  const scrollTarget = runwayRef?.current ? runwayRef : containerRef;
  const { scrollY, scrollYProgress } = useScroll(
    scrollTarget?.current
      ? { target: scrollTarget, offset: ['start start', 'end end'] }
      : {}
  );

  // During scroll runway, map scrollYProgress to an extra -450 deg rotation
  const scrollAngleRaw = useTransform(scrollYProgress, [0, 1], [0, -450]);
  const scrollAngle = useSpring(scrollAngleRaw, { stiffness: 120, damping: 30 });

  // Measure velocity of scrollY in PX/SECOND (thresholds independent of runway length)
  const scrollVelocityRaw = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocityRaw, { stiffness: 200, damping: 40 });

  // Map velocity magnitude |v| in px/s to tail length and tail opacity:
  // - |v| < 150 px/s: tails are invisible (opacity: 0, scale: 0.3)
  // - 150 px/s <= |v| <= 1500 px/s: tails smoothly grow in length and fade in (0 -> 1, scale 0.3 -> 1.0)
  // - |v| > 1500 px/s: fully visible (opacity: 1, scale: 1.0)
  // - When scrolling stops, smoothVelocity decays to 0 over ~250ms back to idle
  const tailOpacity = useTransform(smoothVelocity, (v) => {
    if (shouldReduceMotion) return 0;
    const speed = Math.abs(v);
    if (speed < 150) return 0;
    if (speed >= 1500) return 1;
    return (speed - 150) / (1500 - 150);
  });

  // Tail orientation: when scrolling down (v >= -10 px/s), dir = 1 (tails trail clockwise).
  // When scrolling up (v < -10 px/s), dir = -1 (tails flip along orbit arc to trail counter-clockwise).
  const tailScaleSigned = useTransform(smoothVelocity, (v) => {
    if (shouldReduceMotion) return 0.3;
    const speed = Math.abs(v);
    const dir = v < -10 ? -1 : 1;
    const scale = speed < 150 ? 0.3 : speed >= 1500 ? 1 : 0.3 + (0.7 * (speed - 150)) / (1500 - 150);
    return scale * dir;
  });

  // ── Unified Rotation (Idle + Scroll Runway Drive) ─────────────────────────
  // Idle duration: 60s per full turn counter-clockwise (-6 deg/sec)
  // Start angle: offset by -22.5 deg so at rest, exactly TWO stones sit inside
  // the visible quarter arc (roughly at 22.5 deg and 67.5 deg from horizontal).
  const initialOffset = -22.5;
  const idleAngle = useMotionValue(initialOffset);
  const ringRotation = useMotionValue(initialOffset);
  const degPerSec = -360 / 60; // -6 deg/sec

  // IntersectionObserver to pause loop when off-screen
  useEffect(() => {
    const target = runwayRef?.current || containerRef?.current || rootRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [runwayRef, containerRef]);

  // Frame loop: continuous smooth rotation combining idle + spring-smoothed scroll
  useAnimationFrame((_time, delta) => {
    if (shouldReduceMotion) {
      ringRotation.set(initialOffset);
      if (activeIndexRef.current !== 0) {
        activeIndexRef.current = 0;
        setActiveIndex(0);
      }
      if (displayedIndexRef.current !== 0) {
        displayedIndexRef.current = 0;
        setDisplayedIndex(0);
      }
      return;
    }
    if (!isInViewRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const dt = delta / 1000;
    const idleStep = degPerSec * dt;
    idleAngle.set(idleAngle.get() + idleStep);

    const currentTotalRotation = idleAngle.get() + scrollAngle.get();
    ringRotation.set(currentTotalRotation);

    // Velocity check for fast scrolling (dimming and freezing caption)
    const currentVelocity = smoothVelocity.get();
    const speed = Math.abs(currentVelocity);
    const fastNow = speed >= 150;

    if (fastNow !== isFastScrollRef.current) {
      isFastScrollRef.current = fastNow;
      setIsFastScroll(fastNow);
    }

    // ── Active Service Detection with 4-degree Hysteresis ──────────────────
    // Target is top-left diagonal from bottom-right corner = -45 deg
    const currentActive = activeIndexRef.current;
    const currentDist = getAngularDistance(currentActive * 45 + currentTotalRotation, -45);

    let bestCandidate = currentActive;
    let bestDist = currentDist;

    for (let i = 0; i < 8; i++) {
      if (i === currentActive) continue;
      const dist = getAngularDistance(i * 45 + currentTotalRotation, -45);
      if (dist < bestDist) {
        bestDist = dist;
        bestCandidate = i;
      }
    }

    // Switch active index only if best candidate is at least 4 degrees closer to -45 deg
    if (bestCandidate !== currentActive && bestDist <= currentDist - 4) {
      activeIndexRef.current = bestCandidate;
      setActiveIndex(bestCandidate);
    }

    // Update displayed index for caption when not scrolling fast
    if (!fastNow) {
      if (displayedIndexRef.current !== activeIndexRef.current) {
        displayedIndexRef.current = activeIndexRef.current;
        setDisplayedIndex(activeIndexRef.current);
      }
    }
  });

  const stepDeg = 45; // 360 / 8 = 45 deg spacing
  const displayedService = ORBIT_SERVICES[displayedIndex] || ORBIT_SERVICES[0];

  return (
    <>
      <div
        ref={rootRef}
        className={`orbit-ring-outer ${className}`}
        style={{
          position: 'absolute',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {/* Hidden Inline SVG Filter for Engraved Icon Carving */}
        <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
          <defs>
            <filter id="dh-engrave" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
              <feOffset in="SourceAlpha" dx="1.6" dy="2" result="off" />
              <feGaussianBlur in="off" stdDeviation="1.3" result="offBlur" />
              <feComposite in="SourceAlpha" in2="offBlur" operator="out" result="inner" />
              <feFlood floodColor="#000" floodOpacity="0.9" result="black" />
              <feComposite in="black" in2="inner" operator="in" result="innerShadow" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="innerShadow" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        <style>{`
          /* ── Base / Screens >= 1024px (One Unified Width-Only Formula) ── */
          .orbit-ring-outer {
            --R: 37vw;
            --band: calc(var(--R) * 0.32);
            --ring-size: calc(2 * var(--R) + var(--band));
            --badge: calc(var(--R) * 0.21);
            --orbit-duration: 60s;
            left: calc(100% + 2.5% - var(--ring-size) / 2) !important;
            top: calc(100% - var(--ring-size) / 2) !important;
            width: var(--ring-size) !important;
            height: var(--ring-size) !important;
            opacity: 1 !important;
          }
          .orbit-trail {
            display: block !important;
          }

          /* ── Mobile & Tablet (< 1024px) ───────────────────────────────── */
          @media (max-width: 1023px) {
            .orbit-ring-outer {
              opacity: 0.35 !important;
            }
            .orbit-trail {
              display: none !important;
            }
          }

          /* ── Stone Matte Ceramic Colors (Single Source of Truth) ────── */
          :root, .orbit-ring-outer {
            --dh-stone-1: #5A6B76;
            --dh-stone-2: #3B4A54;
            --dh-stone-3: #26333B;
            --dh-stone-4: #151D23;
            --dh-inlay: #2EC4D6;
            --dh-caption-accent: #1F7A8C;
          }

          .dark .orbit-ring-outer, .dark .service-caption, .dark {
            --dh-stone-1: #F3F6F8;
            --dh-stone-2: #DDE4E8;
            --dh-stone-3: #BFCAD1;
            --dh-stone-4: #98A8B3;
            --dh-inlay: #17707F;
            --dh-caption-accent: #2EC4D6;
          }

          /* ── Matte Ceramic Stones (Light Theme - Ink Ceramic) ───────── */
          .orbit-badge {
            position: relative;
            will-change: transform;
            border-radius: 50%;
            border: none !important;
            outline: none !important;
            background: radial-gradient(
              circle at 34% 28%,
              var(--dh-stone-1) 0%,
              var(--dh-stone-2) 30%,
              var(--dh-stone-3) 62%,
              var(--dh-stone-4) 100%
            );
            box-shadow:
              inset calc(var(--badge) * -10 / 150) calc(var(--badge) * -14 / 150) calc(var(--badge) * 22 / 150) rgba(0, 0, 0, 0.45),
              inset calc(var(--badge) * 6 / 150) calc(var(--badge) * 8 / 150) calc(var(--badge) * 14 / 150) rgba(255, 255, 255, 0.10),
              calc(var(--badge) * 3 / 150) calc(var(--badge) * 5 / 150) calc(var(--badge) * 5 / 150) rgba(2, 43, 58, 0.35),
              calc(var(--badge) * 7 / 150) calc(var(--badge) * 11 / 150) calc(var(--badge) * 12 / 150) calc(var(--badge) * -5 / 150) rgba(2, 43, 58, 0.30);
          }

          /* ── Matte Ceramic Stones (Dark Theme - Soft Porcelain) ─────── */
          .dark .orbit-badge {
            border: none !important;
            outline: none !important;
            background: radial-gradient(
              circle at 34% 28%,
              var(--dh-stone-1) 0%,
              var(--dh-stone-2) 30%,
              var(--dh-stone-3) 62%,
              var(--dh-stone-4) 100%
            ) !important;
            box-shadow:
              inset calc(var(--badge) * -10 / 150) calc(var(--badge) * -14 / 150) calc(var(--badge) * 22 / 150) rgba(24, 38, 50, 0.38),
              inset calc(var(--badge) * 6 / 150) calc(var(--badge) * 8 / 150) calc(var(--badge) * 14 / 150) rgba(255, 255, 255, 0.40),
              calc(var(--badge) * 3 / 150) calc(var(--badge) * 5 / 150) calc(var(--badge) * 5 / 150) rgba(0, 0, 0, 0.55),
              calc(var(--badge) * 7 / 150) calc(var(--badge) * 11 / 150) calc(var(--badge) * 12 / 150) calc(var(--badge) * -5 / 150) rgba(0, 0, 0, 0.50) !important;
          }

          /* Stacked Icons: (a) Groove (bottom) */
          .orbit-icon-groove {
            color: rgba(0, 0, 0, 0.45);
            stroke: rgba(0, 0, 0, 0.45);
          }
          .dark .orbit-icon-groove {
            color: rgba(30, 45, 58, 0.40) !important;
            stroke: rgba(30, 45, 58, 0.40) !important;
          }

          /* Stacked Icons: (b) Inlay (top) */
          .orbit-icon-inlay {
            color: var(--dh-inlay);
            stroke: var(--dh-inlay);
            filter: url(#dh-engrave) drop-shadow(1px 1.5px 0 rgba(255, 255, 255, 0.14));
          }
          .dark .orbit-icon-inlay {
            color: var(--dh-inlay) !important;
            stroke: var(--dh-inlay) !important;
            filter: url(#dh-engrave) drop-shadow(1px 1.5px 0 rgba(255, 255, 255, 0.55)) !important;
          }

          /* ── Velocity Motion Tails ───────────────────────────────────── */
          .orbit-trail {
            background: linear-gradient(to left, rgba(23, 31, 37, 0.32), rgba(23, 31, 37, 0));
          }
          .dark .orbit-trail {
            background: linear-gradient(to left, rgba(217, 224, 228, 0.30), rgba(217, 224, 228, 0)) !important;
          }

          /* ── Editorial Service Caption Styling ───────────────────────── */
          .service-caption {
            --R: 37vw;
          }
          @media (max-width: 1365px) {
            .service-caption-built-for {
              display: none !important;
            }
          }
          @media (max-width: 1023px) {
            .service-caption {
              display: none !important;
            }
          }
        `}</style>

        <div className="relative w-full h-full select-none">
          {/* ── A) BAND LAYER: CLEAN RECESSED GROOVE (ONLY this element gets mask-image fades) ── */}
          {/* Left-edge fade (0% to 15%) AND top-edge fade (0% to 12%) via nested mask containers */}
          <div
            className="orbit-band-wrapper absolute inset-0 pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
            }}
          >
            <div
              className="orbit-band-inner absolute inset-0 pointer-events-none"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%)',
              }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 1000 1000"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* 
                    LIGHT: Recessed groove radialGradient
                    inner = 0.724, outer = 1.0 (r=500, cx=cy=0.5)
                  */}
                  <radialGradient
                    id="grooveGradLight"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0.7235" stopColor="rgba(255, 255, 255, 0)" />
                    <stop offset="0.7240" stopColor="rgba(255, 255, 255, 0.90)" />
                    <stop offset="0.7330" stopColor="rgba(255, 255, 255, 0.55)" />
                    <stop offset="0.7440" stopColor="rgba(2, 43, 58, 0.10)" />
                    <stop offset="0.8200" stopColor="rgba(2, 43, 58, 0.15)" />
                    <stop offset="0.9400" stopColor="rgba(2, 43, 58, 0.26)" />
                    <stop offset="0.9800" stopColor="rgba(2, 43, 58, 0.34)" />
                    <stop offset="0.9960" stopColor="rgba(2, 43, 58, 0.16)" />
                    <stop offset="1.0000" stopColor="rgba(2, 43, 58, 0)" />
                  </radialGradient>

                  {/* 
                    DARK: Recessed groove radialGradient
                    inner = 0.724, outer = 1.0 (r=500, cx=cy=0.5)
                  */}
                  <radialGradient
                    id="grooveGradDark"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0.7235" stopColor="rgba(255, 255, 255, 0)" />
                    <stop offset="0.7240" stopColor="rgba(255, 255, 255, 0.16)" />
                    <stop offset="0.7330" stopColor="rgba(255, 255, 255, 0.07)" />
                    <stop offset="0.7440" stopColor="rgba(0, 0, 0, 0.22)" />
                    <stop offset="0.8200" stopColor="rgba(0, 0, 0, 0.32)" />
                    <stop offset="0.9400" stopColor="rgba(0, 0, 0, 0.46)" />
                    <stop offset="0.9800" stopColor="rgba(0, 0, 0, 0.58)" />
                    <stop offset="0.9960" stopColor="rgba(0, 0, 0, 0.25)" />
                    <stop offset="1.0000" stopColor="rgba(0, 0, 0, 0)" />
                  </radialGradient>
                </defs>

                {/* 1. Single SVG Circle Filled with Recessed Groove Gradient (r=500 at cx=500, cy=500) */}
                <circle
                  cx="500"
                  cy="500"
                  r="500"
                  fill="url(#grooveGradLight)"
                  className="dark:hidden"
                />
                <circle
                  cx="500"
                  cy="500"
                  r="500"
                  fill="url(#grooveGradDark)"
                  className="hidden dark:block"
                />

                {/* 2. Crisp 1.2px Outer Edge Line (r=499.4) */}
                <circle
                  cx="500"
                  cy="500"
                  r="499.4"
                  stroke="rgba(2, 43, 58, 0.22)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                  className="dark:hidden"
                />
                <circle
                  cx="500"
                  cy="500"
                  r="499.4"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                  className="hidden dark:block"
                />
              </svg>
            </div>
          </div>

          {/* ── B) ROTATING LAYER (motion.div, NOT masked, z-index above band) ── */}
          <motion.div
            style={{ rotate: ringRotation }}
            className="orbit-rotating-layer absolute inset-0 pointer-events-none z-10 will-change-transform"
          >
            {ORBIT_SERVICES.map((service, idx) => (
              <OrbitArm
                key={service.id}
                service={service}
                idx={idx}
                stepDeg={stepDeg}
                ringRotation={ringRotation}
                tailOpacity={tailOpacity}
                tailScaleSigned={tailScaleSigned}
                isActive={idx === activeIndex}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── C) SERVICE CAPTION IN THE HOLLOW OF THE ARC (lg and up only) ───── */}
      <div
        className="service-caption hidden lg:block"
        aria-live="off"
        style={{
          position: 'absolute',
          right: '3.5%',
          bottom: '56px',
          width: 'max(240px, calc(var(--R) * 0.38))',
          zIndex: 5,
          pointerEvents: 'none',
          opacity: isFastScroll ? 0.35 : 1,
          transition: 'opacity 200ms ease',
        }}
      >
        {/* Editorial container: 2px vertical rule in unified accent color with 18px padding */}
        <div
          className="service-caption-inner relative"
          style={{
            borderLeft: '2px solid var(--dh-caption-accent)',
            paddingLeft: '18px',
          }}
        >
          {/* Animated content crossfade: 180ms exit, 450ms enter + translateY */}
          <AnimatePresence mode="wait">
            <motion.div
              key={displayedService.id}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: 0,
                      transition: { duration: 0.18, ease: 'easeIn' },
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      opacity: { duration: 0.45, ease: 'easeOut' },
                      y: { duration: 0.45, ease: 'easeOut' },
                    }
              }
            >
              {/* Row 1: "0N / 08" */}
              <div className="font-mono text-[12px] tracking-[0.12em] text-[var(--text-muted)] select-none tabular-nums mb-1">
                {displayedService.numStr} / 08
              </div>

              {/* Row 2: Service Name */}
              <h3
                className="font-display font-semibold text-[var(--text-heading)] leading-tight mb-1.5"
                style={{
                  fontSize: 'max(20px, calc(var(--R) * 0.032))',
                }}
              >
                {t(displayedService.nameKey) || displayedService.defaultName}
              </h3>

              {/* Row 3: Outcome (max 2 lines) */}
              <p
                className="text-[var(--text-muted)] line-clamp-2 mb-2.5"
                style={{
                  fontSize: 'max(13px, calc(var(--R) * 0.019))',
                  lineHeight: 1.5,
                }}
              >
                {t(displayedService.outcomeKey) || displayedService.defaultOutcome}
              </p>

              {/* Row 4: "BUILT FOR" + Audience (Hidden below 1366px) */}
              <div className="service-caption-built-for text-xs text-[var(--text-muted)] mb-3">
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold opacity-75 mr-1.5">
                  {t('service_caption_built_for') || 'BUILT FOR'}:
                </span>
                <span className="text-[13px] text-[var(--text-body)]">
                  {t(displayedService.audienceKey) || displayedService.defaultAudience}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Row 5: 8 dots (6px) with 18px active pill; colors switch instantly */}
          <div className="flex items-center gap-1.5 pt-1" aria-hidden="true">
            {ORBIT_SERVICES.map((s, i) => {
              const isDotActive = i === displayedIndex;
              return (
                <div
                  key={s.id}
                  className="transition-all duration-200 rounded-full"
                  style={{
                    width: isDotActive ? '18px' : '6px',
                    height: '6px',
                    backgroundColor: isDotActive ? 'var(--dh-caption-accent)' : 'var(--text-muted)',
                    opacity: isDotActive ? 1 : 0.35,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Screen Reader accessible list of all 8 services */}
        <ul className="sr-only">
          {ORBIT_SERVICES.map((s) => (
            <li key={s.id}>
              <h4>{t(s.nameKey) || s.defaultName}</h4>
              <p>{t(s.outcomeKey) || s.defaultOutcome}</p>
              <p>
                {(t('service_caption_built_for') || 'Built for') +
                  ': ' +
                  (t(s.audienceKey) || s.defaultAudience)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
