import React, { useRef, useEffect, useState } from 'react';
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

/* ── Individual Rotating Arm Component (preserves top-level Hook calls) ─── */
interface OrbitArmProps {
  service: OrbitService;
  idx: number;
  stepDeg: number;
  radius: number;
  ringRotation: MotionValue<number>;
}

const OrbitArm: React.FC<OrbitArmProps> = ({
  service,
  idx,
  stepDeg,
  radius,
  ringRotation,
}) => {
  const angleDeg = idx * stepDeg;
  const IconComp = service.icon;

  // Counter-rotate badge by -(angle + currentRotation) so icon ALWAYS stays upright
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
        transform: `rotate(${angleDeg}deg) translateY(-${radius}px)`,
        transformOrigin: '0 0',
      }}
    >
      {/* 
        Comet Trail:
        - 150px wide x 44px high pill, border-radius: 999px
        - background: linear-gradient(to left, rgba(2,43,58,0.55), rgba(2,43,58,0))
        - filter: blur(8px)
        - Placed on the clockwise side of the badge (the direction it came from).
        - Child of rotating arm (follows curve), NO counter-rotation.
      */}
      <div
        className="orbit-trail pointer-events-none"
        style={{
          position: 'absolute',
          top: '-22px',
          right: '0px',
          width: '150px',
          height: '44px',
          borderRadius: '999px',
          background:
            'linear-gradient(to left, rgba(2, 43, 58, 0.55), rgba(2, 43, 58, 0))',
          filter: 'blur(8px)',
          transformOrigin: '100% 50%',
          transform: 'rotate(190deg)',
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
            className="group relative w-[68px] h-[68px] rounded-full flex items-center justify-center bg-[#022B3A] border border-white/10 dark:border-white/20 transition-all duration-300 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)] hover:scale-105"
            style={{
              boxShadow: '0 8px 24px rgba(2, 43, 58, 0.35)',
            }}
          >
            {/* Centered White Icon */}
            <IconComp className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />

            {/* Subtle hover beacon highlight */}
            <span className="absolute inset-0 rounded-full border border-[var(--brand-teal)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Accessible Contextual Tooltip */}
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

  /* ── Responsive Diameter Computation & Client-side Sync ──────────────── */
  const getInitialDiameter = () => {
    if (typeof window === 'undefined') return 900;
    const w = window.innerWidth;
    if (w >= 1500) {
      return Math.min(900, Math.max(520, w * 0.47));
    }
    if (w >= 1024) {
      return Math.min(750, Math.max(520, w * 0.40));
    }
    return 480;
  };

  const [ringDiameter, setRingDiameter] = useState<number>(getInitialDiameter);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const handleResize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setRingDiameter(rect.width);
      }
    };

    handleResize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setRingDiameter(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ── Scroll Parallax Elevation & Fade ───────────────────────────────────────
  const { scrollY, scrollYProgress } = useScroll(
    containerRef?.current
      ? { target: containerRef, offset: ['start start', 'end start'] }
      : {}
  );

  const ringTranslateY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.94, 0.7]);

  // ── Unified Rotation MotionValue (Idle + Scroll Boost) ─────────────────────
  const ringRotation = useMotionValue(0);
  const degPerSec = -360 / 36; // -10 deg/sec (counter-clockwise)

  // IntersectionObserver to pause loop when off-screen
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

  // ── Geometric Parameters ──────────────────────────────────────────────────
  // Band thickness: 100px on desktop (>=1024px), 80px on smaller screens
  const bandThickness = ringDiameter < 600 ? 80 : 100;
  // Radius formula: (ringDiameter - bandThickness) / 2
  const trackRadius = (ringDiameter - bandThickness) / 2;
  const stepDeg = 45; // 360 / 8 = 45 deg spacing

  /* 
    COMPUTED DIMENSIONS (Exact verification):
    1. Viewport 1920px (min-width: 1500px):
       - Diameter: clamp(520px, 47vw, 900px) = clamp(520px, 902.4px, 900px) = 900.00px
       - Left offset: 56% = 1920 * 0.56 = 1075.20px
       - Band thickness: 100.00px
       - Centerline radius: (900 - 100) / 2 = 400.00px
       - Text column clearance gap: Left edge at 1075.20px, text column boundary ends at ~1000px => gap = ~75.20px (>70px clear).
       - Ring right edge: 1075.20 + 900 = 1975.20px (bleeds ~55.20px off-screen). At least 6-7 badges visible.
    
    2. Viewport 1440px (1024px to 1499px):
       - Diameter: clamp(520px, 40vw, 750px) = clamp(520px, 576.0px, 750px) = 576.00px
       - Left offset: 60% = 1440 * 0.60 = 864.00px
       - Band thickness: 100.00px
       - Centerline radius: (576 - 100) / 2 = 238.00px
       - Text column clearance gap: Left edge at 864.00px, text column ends at ~780px => gap = ~84.00px.
       - Ring right edge: 864.00 + 576 = 1440.00px (flush with edge).

    3. Viewport 1280px (1024px to 1499px):
       - Diameter: clamp(520px, 40vw, 750px) = clamp(520px, 512.0px, 750px) = 520.00px (clamped to min)
       - Left offset: 60% = 1280 * 0.60 = 768.00px
       - Band thickness: 100.00px
       - Centerline radius: (520 - 100) / 2 = 210.00px
       - Text column clearance gap: Left edge at 768.00px, text column ends at ~660px => gap = ~108.00px.
       - Ring right edge: 768.00 + 520 = 1288.00px (bleeds 8.00px off-screen).
  */

  return (
    <div
      ref={rootRef}
      className={`orbit-ring-outer ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 0,
        pointerEvents: 'none',
        // NO mask-image and NO overflow-hidden on outer wrapper!
      }}
      aria-hidden="true"
    >
      <style>{`
        /* Screens >= 1500px: diameter clamp(520px, 47vw, 900px), left: 56% */
        @media (min-width: 1500px) {
          .orbit-ring-outer {
            left: 56% !important;
            right: auto !important;
            width: clamp(520px, 47vw, 900px) !important;
            height: clamp(520px, 47vw, 900px) !important;
            opacity: 1 !important;
          }
          .orbit-trail {
            display: block !important;
          }
        }

        /* Screens 1024px to 1499px: diameter clamp(520px, 40vw, 750px), left: 60% */
        @media (min-width: 1024px) and (max-width: 1499px) {
          .orbit-ring-outer {
            left: 60% !important;
            right: auto !important;
            width: clamp(520px, 40vw, 750px) !important;
            height: clamp(520px, 40vw, 750px) !important;
            opacity: 1 !important;
          }
          .orbit-trail {
            display: block !important;
          }
        }

        /* Mobile & Tablet (< 1024px) */
        @media (max-width: 1023px) {
          .orbit-ring-outer {
            left: auto !important;
            right: -45% !important;
            width: 480px !important;
            height: 480px !important;
            opacity: 0.35 !important;
          }
          .orbit-trail {
            display: none !important;
          }
        }

        /* Dark mode boost for comet trail */
        .dark .orbit-trail {
          background: linear-gradient(to left, rgba(34, 160, 180, 0.55), rgba(34, 160, 180, 0)) !important;
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
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%)',
          }}
        >
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${ringDiameter} ${ringDiameter}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="bandSoftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(2, 43, 58, 0.10)" />
                <stop offset="50%" stopColor="rgba(31, 122, 140, 0.08)" />
                <stop offset="100%" stopColor="rgba(2, 43, 58, 0.04)" />
              </linearGradient>

              <linearGradient id="bandSoftGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.09)" />
                <stop offset="50%" stopColor="rgba(34, 160, 180, 0.11)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
              </linearGradient>
            </defs>

            {/* Thick Soft Band */}
            <circle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={trackRadius}
              stroke="url(#bandSoftGrad)"
              strokeWidth={bandThickness}
              fill="none"
              className="dark:hidden"
            />
            <circle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={trackRadius}
              stroke="url(#bandSoftGradDark)"
              strokeWidth={bandThickness}
              fill="none"
              className="hidden dark:block"
            />

            {/* Faint 1px Inner Border */}
            <circle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={trackRadius - bandThickness / 2}
              stroke="rgba(2, 43, 58, 0.08)"
              strokeWidth="1"
              fill="none"
              className="dark:stroke-white/10"
            />

            {/* Faint 1px Outer Border */}
            <circle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={trackRadius + bandThickness / 2}
              stroke="rgba(2, 43, 58, 0.08)"
              strokeWidth="1"
              fill="none"
              className="dark:stroke-white/10"
            />

            {/* Dashed Centerline Guide */}
            <circle
              cx={ringDiameter / 2}
              cy={ringDiameter / 2}
              r={trackRadius}
              stroke="rgba(2, 43, 58, 0.16)"
              strokeWidth="1"
              strokeDasharray="5 10"
              fill="none"
              opacity="0.35"
              className="dark:stroke-teal-400/25"
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
              radius={trackRadius}
              ringRotation={ringRotation}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
