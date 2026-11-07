import React, { useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
  useScroll,
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
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

/* ── Individual Rotating Arm Component ───────────────────────────────────── */
interface OrbitArmProps {
  service: OrbitService;
  idx: number;
  stepDeg: number;
  ringRotation: MotionValue<number>;
}

const OrbitArm: React.FC<OrbitArmProps> = ({
  service,
  idx,
  stepDeg,
  ringRotation,
}) => {
  const angleDeg = idx * stepDeg;
  const IconComp = service.icon;

  // Counter-rotate badge so icon ALWAYS stays upright
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
        transform: `rotate(${angleDeg}deg) translateY(calc(-1 * var(--orbit-radius)))`,
        transformOrigin: '0 0',
      }}
    >
      {/* 
        Tapered Motion Trail:
        - Positioned on trailing (clockwise) side, curving with the ring.
        - Length: calc(var(--badge) * 2.4); Height: calc(var(--badge) * 0.8)
        - border-radius: 999px; filter: blur(10px)
        - Starts under badge and fades to fully transparent.
      */}
      <div
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
          transform: 'rotate(188deg)',
          zIndex: 10,
        }}
      />

      {/* Badge Anchor at Centerline (0, 0) */}
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
            {/* Centered Icon (40% of badge size) */}
            <div
              className="flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-110"
              style={{
                width: 'calc(var(--badge) * 0.40)',
                height: 'calc(var(--badge) * 0.40)',
              }}
            >
              <IconComp className="w-full h-full stroke-[2.2] orbit-badge-icon" />
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
  containerRef,
  className = '',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(true);
  const lastScrollYRef = useRef(0);

  const shouldReduceMotion = Boolean(useReducedMotion());

  // ── Scroll Parallax Elevation & Fade ───────────────────────────────────────
  const { scrollY, scrollYProgress } = useScroll(
    containerRef?.current
      ? { target: containerRef, offset: ['start start', 'end start'] }
      : {}
  );

  const ringTranslateY = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.94, 0.7]);

  // ── Unified Rotation MotionValue (Idle + Scroll Boost) ─────────────────────
  // Idle speed: 1 full turn per 16s (counter-clockwise = negative deg/sec)
  const ringRotation = useMotionValue(0);
  const degPerSec = -360 / 16; // -22.5 deg/sec

  // IntersectionObserver to pause loop when hero is off-screen
  useEffect(() => {
    const target = containerRef?.current || rootRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [containerRef]);

  // Animation frame loop: GPU transform updates, zero React state re-renders
  useAnimationFrame((_time, delta) => {
    if (shouldReduceMotion) return;
    if (!isInViewRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const dt = delta / 1000;
    const idleStep = degPerSec * dt;

    // Scroll boost: extra rotation proportional to scroll delta (~0.28 deg per px scrolled)
    const currentScrollY = scrollY.get();
    const scrollDelta = currentScrollY - lastScrollYRef.current;
    lastScrollYRef.current = currentScrollY;

    const scrollBoost = -scrollDelta * 0.28;

    ringRotation.set(ringRotation.get() + idleStep + scrollBoost);
  });

  const stepDeg = 45; // 360 / 8 = 45 deg spacing

  /* 
    COMPUTED DIMENSIONS & CLEARANCE VERIFICATION:

    1. Viewport 1920x900 (min-width: 1500px):
       - Formula: clamp(700px, min(150vh, 78vw), 1500px)
       - min(150vh = 1350px, 78vw = 1497.6px) => ring-size: 1350.00px
       - Wrapper left: calc(100% - 1350 * 0.5) = 1920 - 675 = 1245.00px (Ring center is at 1920px, the exact right edge of hero)
       - Band: 1350 * 0.14 = 189.00px
       - Badge: clamp(60px, 1350 * 0.065 = 87.75px, 96px) = 87.75px
       - Orbit radius: 1350/2 - 189/2 = 580.50px
       - Leftmost badge reach: 1920 - 580.5 = 1339.50px (badge left edge at 1295.62px)
       - Text column boundary: ends at ~950px (Active Squads row)
       - Clearance gap: 1245.00 - 950 = 295.00px clear to ring wrapper; 345.62px clear to any badge!
       - Visible arc: Only "(" arc visible. Exactly 2-3 badges on-screen at once.

    2. Viewport 1440x800 (1024px to 1499px, with 10-15% reduction):
       - Formula: clamp(620px, min(135vh, 70vw), 1150px)
       - min(135vh = 1080px, 70vw = 1008px) => ring-size: 1008.00px
       - Wrapper left: calc(100% - 1008 * 0.5) = 1440 - 504 = 936.00px
       - Band: 1008 * 0.14 = 141.12px
       - Badge: clamp(56px, 1008 * 0.065 = 65.52px, 84px) = 65.52px
       - Orbit radius: 1008/2 - 141.12/2 = 433.44px
       - Leftmost badge reach: 1440 - 433.44 = 1006.56px (badge left edge at 973.80px)
       - Text column boundary: ends at ~780px
       - Clearance gap: 936.00 - 780 = 156.00px clear to ring wrapper; 193.80px clear to any badge!

    3. Viewport 1366x768 (1024px to 1499px):
       - Formula: clamp(620px, min(135vh, 70vw), 1150px)
       - min(135vh = 1036.8px, 70vw = 956.2px) => ring-size: 956.20px
       - Wrapper left: calc(100% - 956.2 * 0.5) = 1366 - 478.1 = 887.90px
       - Band: 956.2 * 0.14 = 133.87px
       - Badge: clamp(56px, 956.2 * 0.065 = 62.15px, 84px) = 62.15px
       - Orbit radius: 956.2/2 - 133.87/2 = 411.17px
       - Leftmost badge reach: 1366 - 411.17 = 954.83px (badge left edge at 923.75px)
       - Text column boundary: ends at ~740px
       - Clearance gap: 887.90 - 740 = 147.90px clear to ring wrapper; 183.75px clear to any badge!
       - Left-edge fade mask (0% to 15%) melts band into transparent between 887.9px and 1031px.
  */

  return (
    <div
      ref={rootRef}
      className={`orbit-ring-outer ${className}`}
      style={{
        position: 'absolute',
        top: '55%',
        transform: 'translateY(-50%)',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <style>{`
        /* ── Screens >= 1500px ────────────────────────────────────────── */
        @media (min-width: 1500px) {
          .orbit-ring-outer {
            --ring-size: clamp(700px, min(150vh, 78vw), 1500px);
            --band: calc(var(--ring-size) * 0.14);
            --badge: clamp(60px, calc(var(--ring-size) * 0.065), 96px);
            --orbit-radius: calc(var(--ring-size) / 2 - var(--band) / 2);
            --orbit-duration: 16s;
            left: calc(100% - var(--ring-size) * 0.5) !important;
            top: 55% !important;
            width: var(--ring-size) !important;
            height: var(--ring-size) !important;
            opacity: 1 !important;
          }
          .orbit-trail {
            display: block !important;
          }
        }

        /* ── Screens 1024px to 1499px (Reduced by ~10-15% for safety) ── */
        @media (min-width: 1024px) and (max-width: 1499px) {
          .orbit-ring-outer {
            --ring-size: clamp(620px, min(135vh, 70vw), 1150px);
            --band: calc(var(--ring-size) * 0.14);
            --badge: clamp(56px, calc(var(--ring-size) * 0.065), 84px);
            --orbit-radius: calc(var(--ring-size) / 2 - var(--band) / 2);
            --orbit-duration: 16s;
            left: calc(100% - var(--ring-size) * 0.5) !important;
            top: 55% !important;
            width: var(--ring-size) !important;
            height: var(--ring-size) !important;
            opacity: 1 !important;
          }
          .orbit-trail {
            display: block !important;
          }
        }

        /* ── Mobile & Tablet (< 1024px) ───────────────────────────────── */
        @media (max-width: 1023px) {
          .orbit-ring-outer {
            --ring-size: 520px;
            --band: calc(var(--ring-size) * 0.14);
            --badge: 52px;
            --orbit-radius: calc(var(--ring-size) / 2 - var(--band) / 2);
            --orbit-duration: 16s;
            left: calc(100% - 260px) !important;
            top: 55% !important;
            width: 520px !important;
            height: 520px !important;
            opacity: 0.35 !important;
          }
          .orbit-trail {
            display: none !important;
          }
        }

        /* ── Badge Themes ─────────────────────────────────────────────── */
        .orbit-badge {
          background: linear-gradient(145deg, #0B3B4D, #022B3A);
          box-shadow: 0 10px 28px rgba(2, 43, 58, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        .orbit-badge-icon {
          color: #FFFFFF;
        }

        .dark .orbit-badge {
          background: #0A1A24 !important;
          border: 1px solid rgba(46, 196, 214, 0.35) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55) !important;
        }
        .dark .orbit-badge-icon {
          color: #2EC4D6 !important;
        }

        /* ── Trail Themes ─────────────────────────────────────────────── */
        .orbit-trail {
          background: linear-gradient(to left, rgba(2, 43, 58, 0.55), rgba(2, 43, 58, 0));
        }
        .dark .orbit-trail {
          background: linear-gradient(to left, rgba(46, 196, 214, 0.40), rgba(46, 196, 214, 0)) !important;
        }
      `}</style>

      {/* ── Parallax Elevation & Scroll Fade Wrapper ─────────────────────── */}
      <motion.div
        style={{
          y: ringTranslateY,
          opacity: ringOpacity,
        }}
        className="relative w-full h-full select-none"
      >
        {/* ── A) BAND LAYER (ONLY this element gets mask-image) ────────────── */}
        <div
          className="orbit-band absolute inset-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
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
                LIGHT: radial gradient across band thickness,
                outer edge rgba(2,43,58,0.10) fading to inner edge rgba(2,43,58,0.02).
                No blur smear, no grey halo.
              */}
              <radialGradient
                id="bandRadGradLight"
                cx="500"
                cy="500"
                r="500"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(2, 43, 58, 0.02)" />
                <stop offset="72%" stopColor="rgba(2, 43, 58, 0.02)" />
                <stop offset="100%" stopColor="rgba(2, 43, 58, 0.10)" />
              </radialGradient>

              {/* 
                DARK: outer edge rgba(255,255,255,0.07) fading to inner edge rgba(255,255,255,0.01).
                No teal glow on the band.
              */}
              <radialGradient
                id="bandRadGradDark"
                cx="500"
                cy="500"
                r="500"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.01)" />
                <stop offset="72%" stopColor="rgba(255, 255, 255, 0.01)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.07)" />
              </radialGradient>
            </defs>

            {/* Thick Soft Band (centerline at 430, strokeWidth 140 = inner 360, outer 500) */}
            <circle
              cx="500"
              cy="500"
              r="430"
              stroke="url(#bandRadGradLight)"
              strokeWidth="140"
              fill="none"
              className="dark:hidden"
            />
            <circle
              cx="500"
              cy="500"
              r="430"
              stroke="url(#bandRadGradDark)"
              strokeWidth="140"
              fill="none"
              className="hidden dark:block"
            />

            {/* Light Mode: 1px inner highlight rgba(255,255,255,0.6) */}
            <circle
              cx="500"
              cy="500"
              r="360"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="1"
              fill="none"
              className="dark:hidden"
            />

            {/* Dark Mode: 1px border rgba(255,255,255,0.08) at inner and outer edges */}
            <circle
              cx="500"
              cy="500"
              r="360"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              fill="none"
              className="hidden dark:block"
            />
            <circle
              cx="500"
              cy="500"
              r="500"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              fill="none"
              className="hidden dark:block"
            />
          </svg>
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
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
