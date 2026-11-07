import React, { useRef, useEffect } from 'react';
import {
  motion,
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
  Palette,
  Code2,
  Bot,
  TrendingUp,
  Search,
  ShieldCheck,
  LayoutDashboard,
  Briefcase,
} from 'lucide-react';

export interface OrbitService {
  id: string;
  name: string;
  icon: React.ElementType;
  ariaLabel: string;
}

const ORBIT_SERVICES: OrbitService[] = [
  {
    id: 'graphic-design',
    name: 'Graphic Design & Branding',
    icon: Palette,
    ariaLabel: 'Graphic Design and Branding Service',
  },
  {
    id: 'fullstack-dev',
    name: 'Full Stack Development',
    icon: Code2,
    ariaLabel: 'Full Stack Web Development Service',
  },
  {
    id: 'ai-automations',
    name: 'AI Automations',
    icon: Bot,
    ariaLabel: 'AI and Workflow Automations Service',
  },
  {
    id: 'growth-marketing',
    name: 'Growth & Marketing',
    icon: TrendingUp,
    ariaLabel: 'Growth Marketing and SEO Optimization Service',
  },
  {
    id: 'seo',
    name: 'SEO',
    icon: Search,
    ariaLabel: 'Search Engine Optimization Service',
  },
  {
    id: 'cybersecurity',
    name: 'Cyber Security',
    icon: ShieldCheck,
    ariaLabel: 'Cyber Security and Hardening Service',
  },
  {
    id: 'bi-dashboards',
    name: 'BI Dashboards',
    icon: LayoutDashboard,
    ariaLabel: 'Business Intelligence and Data Dashboards Service',
  },
  {
    id: 'business-solutions',
    name: 'Business Solutions',
    icon: Briefcase,
    ariaLabel: 'Custom Business and Enterprise Solutions',
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
}

const OrbitArm: React.FC<OrbitArmProps> = ({
  service,
  idx,
  stepDeg,
  ringRotation,
  tailOpacity,
  tailScaleSigned,
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
        - Recolor: LIGHT rgba(31,122,140,0.45), DARK rgba(46,196,214,0.40).
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

      {/* Polished 3D Stone Badge Anchor at Centerline (0, 0) */}
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
            aria-label={service.ariaLabel}
            title={service.name}
            className="orbit-badge group relative rounded-full flex items-center justify-center transition-transform duration-300 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2EC4D6] hover:scale-105"
            style={{
              width: 'var(--badge)',
              height: 'var(--badge)',
            }}
          >
            {/* Contact Shadow INSIDE stone: stays fixed bottom-right with counter-rotation */}
            <div className="orbit-contact-shadow pointer-events-none" />

            {/* Engraved Icon (48% of badge size, strokeWidth: 2.25) */}
            <div
              className="flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-110 relative z-10"
              style={{
                width: 'calc(var(--badge) * 0.48)',
                height: 'calc(var(--badge) * 0.48)',
              }}
            >
              <IconComp
                strokeWidth={2.25}
                className="w-full h-full orbit-badge-icon"
              />
            </div>

            {/* Hover Tooltip */}
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-xl text-xs font-bold text-[var(--text-heading)] whitespace-nowrap z-50 pointer-events-none transition-all duration-200">
              {service.name}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const OrbitRing: React.FC<OrbitRingProps> = ({
  runwayRef,
  containerRef,
  className = '',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(true);
  const shouldReduceMotion = Boolean(useReducedMotion());

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
      return;
    }
    if (!isInViewRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const dt = delta / 1000;
    const idleStep = degPerSec * dt;
    idleAngle.set(idleAngle.get() + idleStep);

    ringRotation.set(idleAngle.get() + scrollAngle.get());
  });

  const stepDeg = 45; // 360 / 8 = 45 deg spacing

  return (
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

        /* ── Spherical Polished Stones (Light Theme) ─────────────────── */
        .orbit-badge {
          position: relative;
          will-change: transform;
          border-radius: 50%;
          border: none !important;
          background: radial-gradient(circle at 32% 26%, #6DB2C4 0%, #2F7C90 24%, #0F4254 56%, #022B3A 82%, #011820 100%);
          box-shadow:
            inset -10px -14px 22px rgba(0, 10, 16, 0.55),
            inset 5px 6px 12px rgba(255, 255, 255, 0.22),
            inset -3px -4px 6px rgba(120, 220, 235, 0.28),
            0 2px 4px rgba(2, 43, 58, 0.35);
        }

        /* Gloss (::before) */
        .orbit-badge::before {
          content: "";
          position: absolute;
          left: 14%;
          top: 5%;
          width: 72%;
          height: 46%;
          border-radius: 50%;
          transform: rotate(-12deg);
          pointer-events: none;
          z-index: 20;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0.05) 70%, rgba(255, 255, 255, 0));
        }

        /* Specular (::after) */
        .orbit-badge::after {
          content: "";
          position: absolute;
          left: 23%;
          top: 14%;
          width: 17%;
          height: 9%;
          border-radius: 50%;
          transform: rotate(-32deg);
          filter: blur(1.5px);
          pointer-events: none;
          z-index: 25;
          background: rgba(255, 255, 255, 0.8);
        }

        /* Engraved Icon (Light) */
        .orbit-badge-icon {
          color: rgba(1, 20, 28, 0.62);
          stroke: rgba(1, 20, 28, 0.62);
          filter: url(#dh-engrave) drop-shadow(1px 1.5px 0 rgba(255, 255, 255, 0.30));
        }

        /* ── Spherical Polished Stones (Dark Theme) ──────────────────── */
        .dark .orbit-badge {
          border: none !important;
          background: radial-gradient(circle at 32% 26%, #4C8FA3 0%, #1F5568 24%, #0E2E3C 54%, #07161F 82%, #030A0F 100%) !important;
          box-shadow:
            inset -10px -14px 22px rgba(0, 0, 0, 0.65),
            inset 5px 6px 12px rgba(255, 255, 255, 0.14),
            inset -3px -4px 8px rgba(46, 196, 214, 0.30),
            0 0 28px rgba(46, 196, 214, 0.10) !important;
        }

        .dark .orbit-badge::before {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.04) 70%, rgba(255, 255, 255, 0)) !important;
        }

        .dark .orbit-badge::after {
          background: rgba(255, 255, 255, 0.65) !important;
        }

        /* Engraved Icon (Dark) */
        .dark .orbit-badge-icon {
          color: #03121A !important;
          stroke: #03121A !important;
          filter: url(#dh-engrave) drop-shadow(1px 1.5px 0 rgba(46, 196, 214, 0.50)) !important;
        }

        /* Contact Shadow: child element INSIDE the stone */
        .orbit-contact-shadow {
          position: absolute;
          left: 10%;
          top: 80%;
          width: 82%;
          height: 28%;
          border-radius: 50%;
          filter: blur(10px);
          z-index: -1;
          transform: translate(12%, 14%);
          background: rgba(2, 43, 58, 0.45);
        }
        .dark .orbit-contact-shadow {
          background: rgba(0, 0, 0, 0.55) !important;
        }

        /* ── Tail Themes ─────────────────────────────────────────────── */
        .orbit-trail {
          background: linear-gradient(to left, rgba(31, 122, 140, 0.45), rgba(31, 122, 140, 0));
        }
        .dark .orbit-trail {
          background: linear-gradient(to left, rgba(46, 196, 214, 0.40), rgba(46, 196, 214, 0)) !important;
        }
      `}</style>

      <div className="relative w-full h-full select-none">
        {/* ── A) BAND LAYER (ONLY this element gets mask-image fades) ──────── */}
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
                  LIGHT: radial gradient across band thickness (r=362.07 to r=500),
                  outer edge rgba(2,43,58,0.10) to inner edge rgba(2,43,58,0.03).
                */}
                <radialGradient
                  id="bandRadGradLight"
                  cx="500"
                  cy="500"
                  r="500"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="rgba(2, 43, 58, 0.03)" />
                  <stop offset="72%" stopColor="rgba(2, 43, 58, 0.03)" />
                  <stop offset="100%" stopColor="rgba(2, 43, 58, 0.10)" />
                </radialGradient>

                {/* 
                  DARK: radial gradient across band thickness (r=362.07 to r=500),
                  outer edge rgba(255,255,255,0.07) to inner edge rgba(255,255,255,0.02).
                  Clearly defined and visible in dark mode.
                */}
                <radialGradient
                  id="bandRadGradDark"
                  cx="500"
                  cy="500"
                  r="500"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.02)" />
                  <stop offset="72%" stopColor="rgba(255, 255, 255, 0.02)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.07)" />
                </radialGradient>
              </defs>

              {/* 1. Recessed Track Fill (Centerline r=431.03, strokeWidth=137.93: inner 362.07, outer 500) */}
              <circle
                cx="500"
                cy="500"
                r="431.03"
                stroke="url(#bandRadGradLight)"
                strokeWidth="137.93"
                fill="none"
                className="dark:hidden"
              />
              <circle
                cx="500"
                cy="500"
                r="431.03"
                stroke="url(#bandRadGradDark)"
                strokeWidth="137.93"
                fill="none"
                className="hidden dark:block"
              />

              {/* 2. Soft Inner Groove Shadows (giving depth to the recessed track) */}
              <circle
                cx="500"
                cy="500"
                r="364"
                stroke="rgba(2, 43, 58, 0.08)"
                strokeWidth="3"
                fill="none"
                className="dark:hidden"
              />
              <circle
                cx="500"
                cy="500"
                r="364"
                stroke="rgba(0, 0, 0, 0.55)"
                strokeWidth="3"
                fill="none"
                className="hidden dark:block"
              />
              <circle
                cx="500"
                cy="500"
                r="498"
                stroke="rgba(2, 43, 58, 0.05)"
                strokeWidth="3"
                fill="none"
                className="dark:hidden"
              />
              <circle
                cx="500"
                cy="500"
                r="498"
                stroke="rgba(0, 0, 0, 0.35)"
                strokeWidth="3"
                fill="none"
                className="hidden dark:block"
              />

              {/* 3. Dashed Center Guide Line (12% opacity of edge line color, stroke-dasharray 5 7) */}
              <circle
                cx="500"
                cy="500"
                r="431.03"
                stroke="var(--border-subtle)"
                strokeOpacity="0.12"
                strokeWidth="1"
                strokeDasharray="5 7"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />

              {/* 4. 1px Outer Edge Line (r=500): light var(--border-subtle) / dark rgba(255,255,255,0.08) */}
              <circle
                cx="500"
                cy="500"
                r="500"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />

              {/* 5. 1px Inner Edge Line (r=362.07): light var(--border-subtle) / dark rgba(255,255,255,0.08) */}
              <circle
                cx="500"
                cy="500"
                r="362.07"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                fill="none"
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
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
