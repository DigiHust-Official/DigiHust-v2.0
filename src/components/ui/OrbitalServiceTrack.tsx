import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
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
import * as LucideIcons from 'lucide-react';

// Robust fallback for BriefcaseBusiness across lucide-react version variants
const BusinessIcon: React.ElementType =
  (LucideIcons as Record<string, any>)['BriefcaseBusiness'] || Briefcase;

export interface ServiceTrackItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  accentColor: string;
  badge: string;
}

const SERVICES: ServiceTrackItem[] = [
  {
    id: 'branding',
    name: 'Graphic Designing & Branding',
    shortName: 'Branding & UI',
    icon: Palette,
    accentColor: '#C084FC',
    badge: 'Design Systems',
  },
  {
    id: 'development',
    name: 'Full Stack Development',
    shortName: 'Full Stack Dev',
    icon: Code2,
    accentColor: '#22D3EE',
    badge: 'React & Next.js',
  },
  {
    id: 'ai-automation',
    name: 'AI Automations',
    shortName: 'AI & Automations',
    icon: Bot,
    accentColor: '#38BDF8',
    badge: 'LLMs & Workflows',
  },
  {
    id: 'growth-marketing',
    name: 'Growth & Marketing',
    shortName: 'Growth & Ads',
    icon: TrendingUp,
    accentColor: '#FBBF24',
    badge: 'Performance & CRO',
  },
  {
    id: 'seo',
    name: 'SEO',
    shortName: 'Technical SEO',
    icon: Search,
    accentColor: '#2DD4BF',
    badge: 'Organic Search',
  },
  {
    id: 'cybersecurity',
    name: 'Cyber Security',
    shortName: 'Cyber Security',
    icon: ShieldCheck,
    accentColor: '#F43F5E',
    badge: 'Audits & Hardening',
  },
  {
    id: 'bi-dashboards',
    name: 'BI Dashboards',
    shortName: 'BI Dashboards',
    icon: LayoutDashboard,
    accentColor: '#34D399',
    badge: 'Data Intelligence',
  },
  {
    id: 'business-solutions',
    name: 'Business Solutions',
    shortName: 'Business Solutions',
    icon: BusinessIcon,
    accentColor: '#818CF8',
    badge: 'Enterprise Architecture',
  },
];

interface OrbitalServiceItemProps {
  service: ServiceTrackItem;
  baseAngle: number;
  scrollProgress: MotionValue<number>;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  shouldReduceMotion: boolean;
}

const OrbitalServiceItem: React.FC<OrbitalServiceItemProps> = ({
  service,
  baseAngle,
  scrollProgress,
  centerX,
  centerY,
  radiusX,
  radiusY,
  shouldReduceMotion,
}) => {
  // Travel range along orbit during full Hero scroll (proportional sweep ~115 degrees)
  const maxRotation = Math.PI * 0.64;

  // Scroll-driven angle calculation:
  // When motion is reduced, remain stationary at baseAngle
  const angle = useTransform(
    scrollProgress,
    [0, 1],
    shouldReduceMotion ? [baseAngle, baseAngle] : [baseAngle, baseAngle + maxRotation]
  );

  // Parameterized coordinates:
  // x = centerX + radiusX * cos(angle)
  // y = centerY + radiusY * sin(angle)
  const x = useTransform(angle, (a) => centerX + radiusX * Math.cos(a));
  const y = useTransform(angle, (a) => centerY + radiusY * Math.sin(a));

  // Depth simulation:
  // Points on the left side (cos(a) < 0, closest to hero text & viewer) have scale: 1.05 and full opacity.
  // Points that curve towards the far right / cropped side (cos(a) > 0) recede with scale: 0.88 and opacity: 0.68.
  const scale = useTransform(angle, (a) => {
    const depth = (Math.cos(a) + 1) / 2; // 0 = front/left, 1 = back/right
    return 1.05 - depth * 0.17;
  });

  const opacity = useTransform(angle, (a) => {
    const depth = (Math.cos(a) + 1) / 2;
    return 1.0 - depth * 0.32;
  });

  const IconComponent = service.icon;

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        opacity,
        translateX: '-50%',
        translateY: '-50%',
      }}
      className="absolute top-0 left-0 select-none z-20 pointer-events-auto"
      whileHover={{ scale: 1.12, zIndex: 30 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="group relative flex items-center gap-2.5 cursor-pointer">
        {/* Directional Soft Motion Trail / Radial Shadow behind icon */}
        <div
          className="absolute -inset-2 rounded-full blur-md opacity-35 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: service.accentColor }}
        />

        {/* Compact Circular Icon Container (Deep Navy #022B3A with Sea Teal border) */}
        <div
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl"
          style={{
            backgroundColor: '#022B3A',
            border: `1.5px solid ${service.accentColor}`,
            boxShadow: `0 6px 18px rgba(2, 43, 58, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.22)`,
          }}
        >
          <IconComponent className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />

          {/* Accent beacon indicator */}
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#022B3A]"
            style={{ backgroundColor: service.accentColor }}
          />
        </div>

        {/* Crisp Label Badge: visible on tablet/desktop, compact tooltip on mobile */}
        <div className="hidden sm:flex flex-col items-start px-2.5 py-1 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] group-hover:border-[var(--brand-teal)] shadow-md transition-all duration-300 whitespace-nowrap">
          <span className="text-[11px] font-bold text-[var(--text-heading)] group-hover:text-[var(--brand-teal)] transition-colors leading-tight">
            {service.name}
          </span>
          <span className="text-[9px] font-medium text-[var(--text-muted)] leading-tight">
            {service.badge}
          </span>
        </div>

        {/* Mobile hover/touch popover label */}
        <div className="sm:hidden opacity-0 group-hover:opacity-100 absolute left-full ml-2 px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-heading)] shadow-lg pointer-events-none transition-opacity duration-200 whitespace-nowrap z-30">
          {service.shortName}
        </div>
      </div>
    </motion.div>
  );
};

export interface OrbitalServiceTrackProps {
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export const OrbitalServiceTrack: React.FC<OrbitalServiceTrackProps> = ({
  containerRef,
  className = '',
}) => {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const targetRef = containerRef || fallbackRef;

  const shouldReduceMotion = Boolean(useReducedMotion());

  // Scroll progress bound to the Hero section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  // Track Geometry Specifications:
  // Center is biased slightly right (360) and downward (310) within a 620x620 stage.
  // This allows the orbital circle to sweep prominently past the hero text on the left,
  // and extend naturally beyond the right and bottom boundaries of the visible hero area.
  const centerX = 360;
  const centerY = 310;
  const radiusX = 240;
  const radiusY = 240;

  // Eight services distributed evenly along the circumference (360° / 8 = 45° step).
  // Starting at 180° (Math.PI) places index 0 directly on the visible left arc facing the hero text.
  const step = (2 * Math.PI) / SERVICES.length;
  const startAngle = Math.PI;

  return (
    <div
      ref={fallbackRef}
      className={`relative w-full h-[400px] sm:h-[480px] lg:h-[580px] flex items-center justify-center lg:justify-end overflow-visible select-none pointer-events-none ${className}`}
      aria-label="DigiHust Core Services Orbital Path"
    >
      {/* 
        Scaled Orbital Stage:
        - 620x620 coordinate plane.
        - Scales proportionally on mobile (0.64) and tablet (0.82) to eliminate any horizontal overflow.
        - On desktop (lg), scale is 1.0 with origin-right, extending beyond the right boundary.
      */}
      <div className="relative w-[620px] h-[620px] shrink-0 scale-[0.62] sm:scale-[0.80] md:scale-[0.88] lg:scale-100 origin-center lg:origin-right pointer-events-auto">
        
        {/* ── Stationary SVG Orbital Track ─────────────────────────────────── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 620 620"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle glow filter for the primary orbital ring */}
            <filter id="orbitalTrackBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Depth gradient for the orbital ring */}
            <linearGradient id="orbitalTrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-teal)" stopOpacity="0.55" />
              <stop offset="40%" stopColor="var(--orbit-ring)" stopOpacity="0.4" />
              <stop offset="70%" stopColor="rgba(225, 229, 242, 0.25)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--brand-teal)" stopOpacity="0.45" />
            </linearGradient>

            {/* Ambient center celestial glow */}
            <radialGradient id="orbitalCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--brand-teal)" stopOpacity="0.16" />
              <stop offset="60%" stopColor="var(--brand-teal)" stopOpacity="0.03" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient radial glow field */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radiusX + 45}
            fill="url(#orbitalCenterGlow)"
          />

          {/* Outer dashed companion ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radiusX + 28}
            stroke="var(--orbit-ring-dashed)"
            strokeWidth="1"
            strokeDasharray="4 9"
            opacity="0.45"
          />

          {/* Soft outer glow ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radiusX}
            stroke="var(--brand-teal)"
            strokeWidth="5"
            strokeOpacity="0.12"
            filter="url(#orbitalTrackBlur)"
          />

          {/* Primary Crisp Stationary Track */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radiusX}
            stroke="url(#orbitalTrackGradient)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />

          {/* Inner concentric technical dashed ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radiusX - 32}
            stroke="var(--orbit-ring-dashed)"
            strokeWidth="1"
            strokeDasharray="3 7"
            opacity="0.5"
          />

          {/* Precision quadrant tick marks */}
          <line
            x1={centerX - radiusX - 10}
            y1={centerY}
            x2={centerX - radiusX + 10}
            y2={centerY}
            stroke="var(--brand-teal)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <line
            x1={centerX}
            y1={centerY - radiusY - 10}
            x2={centerX}
            y2={centerY - radiusY + 10}
            stroke="var(--brand-teal)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <line
            x1={centerX + radiusX - 10}
            y1={centerY}
            x2={centerX + radiusX + 10}
            y2={centerY}
            stroke="var(--brand-teal)"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <line
            x1={centerX}
            y1={centerY + radiusY - 10}
            x2={centerX}
            y2={centerY + radiusY + 10}
            stroke="var(--brand-teal)"
            strokeWidth="1.5"
            opacity="0.4"
          />

          {/* Central Anchor Core */}
          <circle
            cx={centerX}
            cy={centerY}
            r="20"
            fill="var(--bg-surface)"
            stroke="var(--border-subtle)"
            strokeWidth="1.5"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="7"
            fill="var(--brand-teal)"
            opacity="0.85"
          />
        </svg>

        {/* ── Eight Travelling Service Icons ─────────────────────────────────── */}
        {SERVICES.map((service, index) => {
          // Counter-clockwise distribution around track
          const baseAngle = startAngle - index * step;

          return (
            <OrbitalServiceItem
              key={service.id}
              service={service}
              baseAngle={baseAngle}
              scrollProgress={scrollYProgress}
              centerX={centerX}
              centerY={centerY}
              radiusX={radiusX}
              radiusY={radiusY}
              shouldReduceMotion={shouldReduceMotion}
            />
          );
        })}

        {/* Subtle subtle instruction cue at bottom of track */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-60">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-teal)] animate-ping" />
            <span>Scroll to orbit services</span>
          </p>
        </div>

      </div>
    </div>
  );
};

