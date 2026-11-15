import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Code2,
  Terminal,
  Cloud,
  Database,
  Cpu,
  Workflow,
  Palette,
  CheckSquare,
  Shield,
  BarChart3,
  ShoppingBag,
  Smartphone,
  Wrench,
} from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { useApp } from '../../context/AppContext';
import { TechLogo } from './TechLogo';

const TOOL_CATEGORIES = [
  {
    category: 'Web Frameworks',
    icon: Code2,
    tools: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'Vite'],
  },
  {
    category: 'Languages',
    icon: Terminal,
    tools: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML5/CSS3'],
  },
  {
    category: 'Cloud & Hosting',
    icon: Cloud,
    tools: ['AWS', 'Vercel', 'Docker', 'Supabase', 'Cloudflare'],
  },
  {
    category: 'Databases',
    icon: Database,
    tools: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase DB', 'SQLite'],
  },
  {
    category: 'AI & Machine Learning',
    icon: Cpu,
    tools: ['OpenAI API', 'Claude API', 'Custom LLMs', 'Hugging Face', 'LangChain'],
  },
  {
    category: 'Automation & Integrations',
    icon: Workflow,
    tools: ['n8n', 'Zapier', 'Webhooks', 'REST APIs', 'Python Scripts'],
  },
  {
    category: 'UI/UX & 3D Design',
    icon: Palette,
    tools: ['Figma', 'Cinema 4D', 'Blender', 'Adobe CC', 'Framer'],
  },
  {
    category: 'Testing & QA',
    icon: CheckSquare,
    tools: ['Playwright', 'Jest', 'Vitest', 'Cypress', 'Lighthouse'],
  },
  {
    category: 'Cybersecurity',
    icon: Shield,
    tools: ['OWASP Standards', 'Penetration Testing', 'SSL/TLS', 'Dependency Auditing'],
  },
  {
    category: 'Analytics & BI',
    icon: BarChart3,
    tools: ['PowerBI', 'GA4', 'Mixpanel', 'Custom Dashboards'],
  },
  {
    category: 'CMS & E-commerce',
    icon: ShoppingBag,
    tools: ['Headless CMS', 'WordPress', 'Shopify', 'Stripe'],
  },
  {
    category: 'Mobile & Cross-Platform',
    icon: Smartphone,
    tools: ['React Native', 'Flutter', 'PWA'],
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Requirement Intake & Scoping',
    detail: 'Submit your requirements via our quote portal. We schedule a 20-minute discovery session to define technical architecture, deliverables, timeline constraints, and success criteria.',
    points: [
      'Comprehensive functional specifications review',
      'Target user persona and performance metrics alignment',
      'Tech stack and infrastructure evaluation',
      'Fixed scope proposal with milestone breakdown',
    ],
  },
  {
    num: '02',
    title: 'Specialized Squad Assembly',
    detail: "DigiHust's management architects the project team, assigning domain-verified Digiskill specialists under a single accountable lead. You get specialists, not generalists.",
    points: [
      'Single lead point of contact assigned to your project',
      'Engineers, UI/UX designers, and QA matched to requirements',
      'Direct oversight and sprint tracking by management',
      'Clear NDA and IP assignment signed upfront',
    ],
  },
  {
    num: '03',
    title: 'Sprint Execution & Live Previews',
    detail: 'We build in transparent weekly sprints. You receive staging preview links, regular progress updates, and structured feedback milestones so there are zero surprises.',
    points: [
      'Structured weekly milestone delivery checkpoints',
      'Private staging environments to review live progress',
      'Included revision rounds on all UI and logic scopes',
      'Comprehensive automated and manual QA passes',
    ],
  },
  {
    num: '04',
    title: 'Production Handover & Support',
    detail: "We deploy to your live production infrastructure, hand over 100% of source code and assets, provide documentation, and initiate your post-launch support window.",
    points: [
      'Complete Git repository and asset ownership transfer',
      'Architecture diagrams and developer documentation',
      'Dedicated post-launch warranty and bug-fix window',
      'Optional ongoing retainer or continuous feature squad',
    ],
  },
];

const FAQS = [
  {
    q: 'How does working with DigiHust differ from hiring freelancers on Upwork or Fiverr?',
    a: 'On freelancer marketplaces, you bear 100% of the burden of vetting, coordinating, and managing multiple disparate freelancers. If one drops out or writes buggy code, the project stalls. With DigiHust, you contract with a single company that guarantees delivery, enforces quality standards, and manages the entire team internally.',
  },
  {
    q: 'Who owns the intellectual property (IP) and source code?',
    a: 'You do. Upon project completion and milestone settlement, 100% of source code, vector design assets, databases, and deployment keys are transferred directly to your organization with complete IP ownership.',
  },
  {
    q: 'What is the typical project turnaround time?',
    a: 'Landing pages and brand identity kits typically take 1–2 weeks. Full-stack web applications and AI automations range between 3–8 weeks depending on complexity. We establish fixed milestone dates before contract signing.',
  },
  {
    q: 'How are project scopes and milestones structured?',
    a: 'We work on structured milestone deliverables and agile sprint scopes. You review and approve each milestone as verified features are demonstrated on live staging environments.',
  },
  {
    q: 'Can DigiHust handle ongoing maintenance after launch?',
    a: 'Yes. We offer monthly maintenance, server monitoring, security patching, and ongoing feature development squads.',
  },
];

const SHORT_DESCRIPTIONS: Record<string, string> = {
  '01': 'Discovery session to define architecture, scope, milestones, and success criteria.',
  '02': 'Domain-verified specialists assigned under a single accountable project lead.',
  '03': 'Transparent weekly agile sprints with live staging previews and feedback.',
  '04': 'Production deployment, 100% IP code handover, documentation, and warranty support.',
};

const PHASE_THEMES = [
  { color: '#0D9488' }, // 01: Teal
  { color: '#2563EB' }, // 02: Royal Blue
  { color: '#7C3AED' }, // 03: Purple / Violet
  { color: '#EA580C' }, // 04: Coral / Amber
];

// Centralized animation timings for easy tweaking
export const ANIMATION_TIMINGS = {
  // Intro Sequence
  headerTitleDuration: 0.6,
  headerSubtitleDelay: 0.15,
  headerSubtitleDuration: 0.5,
  roadDrawDuration: 2.0,
  roadDrawEase: [0.16, 1, 0.3, 1] as [number, number, number, number],

  // Node arrival delays along the 2.0s road draw
  // (Trough 1, Crest 1, Trough 2, Crest 2)
  nodeDelays: [0.45, 0.92, 1.40, 1.76],
  nodeSpring: { type: 'spring' as const, stiffness: 380, damping: 24 },
  cardAppearDelayOffset: 0.12,
  cardAppearDuration: 0.45,

  // Ambient Motion Loops
  dashFlowDuration: 16,
  markerLoopDuration: 14,
  nodePulseDuration: 2.5,
  nodePulseHoverDuration: 1.2,
  contourDriftDuration: 36,
  blobFloatDuration: 22,

  // Parallax
  maxParallaxOffset: 10,
};

interface RoadmapCardProps {
  step: typeof STEPS[0];
  shortDesc: string;
  phaseColor: string;
  pointerDirection: 'down' | 'right' | 'up';
  flipUp?: boolean;
  alignRight?: boolean;
  introDelay?: number;
  slideOffset?: { x?: number; y?: number };
  prefersReduced?: boolean;
  isInView?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({
  step,
  shortDesc,
  phaseColor,
  pointerDirection,
  flipUp = false,
  alignRight = false,
  introDelay = 0,
  slideOffset = { x: 0, y: 0 },
  prefersReduced = false,
  isInView = true,
  onHoverChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const handleFocus = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleBlur = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  return (
    <motion.div
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
      aria-label={`Phase ${step.num}: ${step.title}. ${isOpen ? 'Expanded' : 'Collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={() => setIsOpen((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }}
      initial={
        prefersReduced
          ? { opacity: 1, scale: 1, x: 0, y: 0 }
          : { opacity: 0, scale: 0.96, x: slideOffset.x ?? 0, y: slideOffset.y ?? 0 }
      }
      animate={
        isInView
          ? {
              opacity: 1,
              scale: 1,
              x: 0,
              y: isHovered ? -4 : 0,
            }
          : prefersReduced
          ? { opacity: 1, scale: 1, x: 0, y: 0 }
          : { opacity: 0, scale: 0.96, x: slideOffset.x ?? 0, y: slideOffset.y ?? 0 }
      }
      transition={
        isHovered
          ? { duration: 0.2, ease: 'easeOut' }
          : prefersReduced
          ? { duration: 0.2 }
          : {
              delay: introDelay,
              duration: ANIMATION_TIMINGS.cardAppearDuration,
              ease: [0.16, 1, 0.3, 1],
            }
      }
      className={`relative w-[clamp(170px,19vw,260px)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-teal)] rounded-xl select-none ${
        isOpen ? 'z-50' : 'z-20'
      }`}
    >
      {/* Pointer notch notch aimed at its node */}
      {pointerDirection === 'down' && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-[var(--border-subtle)] pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -left-[5px] -top-[8px] w-0 h-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-[var(--bg-surface)]" />
        </div>
      )}
      {pointerDirection === 'right' && (
        <div
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[var(--border-subtle)] pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -left-[8px] -top-[5px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-[var(--bg-surface)]" />
        </div>
      )}
      {pointerDirection === 'up' && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-b-[8px] border-b-[var(--border-subtle)] pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -left-[5px] top-[1px] w-0 h-0 border-x-[5px] border-x-transparent border-b-[7px] border-b-[var(--bg-surface)]" />
        </div>
      )}

      {/* Default Base Card: White / surface card with colored circle and bold uppercase title */}
      <div
        className={`flex items-center space-x-3 px-3.5 py-2.5 sm:px-4 sm:py-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${
          isHovered ? 'shadow-xl' : 'shadow-md'
        } transition-shadow duration-200 ${
          isOpen ? 'ring-1 ring-[var(--brand-teal)]/40 border-[var(--brand-teal)]/40' : ''
        }`}
      >
        <motion.div
          style={{ backgroundColor: phaseColor }}
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex-shrink-0 shadow-xs ring-2 ring-white/30 dark:ring-white/10"
          aria-hidden="true"
        />
        <h3 className="font-display font-extrabold text-xs sm:text-[13px] text-[var(--text-heading)] leading-snug uppercase tracking-tight line-clamp-2">
          {step.title}
        </h3>
      </div>

      {/* Hover / Focused / Tapped Expanding Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute ${
              flipUp ? 'bottom-0' : 'top-0'
            } ${
              alignRight ? 'right-0' : 'left-0'
            } w-[clamp(260px,25vw,340px)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-2xl z-50 text-left cursor-default`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  style={{ backgroundColor: phaseColor }}
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-heading)]">
                  Phase {step.num}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors px-1"
                aria-label="Close details"
              >
                ✕ Close
              </button>
            </div>

            <h3 className="font-display font-black text-sm sm:text-base text-[var(--text-heading)] leading-snug uppercase mb-2">
              {step.title}
            </h3>

            <p className="text-xs text-[var(--text-body)] leading-relaxed mb-3">
              {step.detail}
            </p>

            <div className="grid grid-cols-1 gap-1.5 pt-2.5 border-t border-[var(--border-subtle)]">
              {step.points.map((pt) => (
                <div key={pt} className="flex items-start space-x-2">
                  <CheckCircle2
                    style={{ color: phaseColor }}
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] sm:text-xs text-[var(--text-body)] font-medium leading-snug">
                    {pt}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const HowItWorks: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileOpenIndex, setMobileOpenIndex] = useState<string | null>(null);
  const { siteContent } = useApp();
  const videoUrl = siteContent?.howItWorksVideoUrl;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 1200, h: 600 });

  // Animation States & Reduced Motion Detection
  const prefersReduced = useReducedMotion() ?? false;
  const [isInView, setIsInView] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  // Parallax on non-touch devices (opposite to pointer)
  const rawParallaxX = useMotionValue(0);
  const rawParallaxY = useMotionValue(0);
  const parallaxX = useSpring(rawParallaxX, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(rawParallaxY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleVisChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isAmbientActive = isInView && isTabVisible && !prefersReduced;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || e.pointerType === 'touch' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relX = (e.clientX - centerX) / (rect.width / 2);
    const relY = (e.clientY - centerY) / (rect.height / 2);
    rawParallaxX.set(-Math.max(-1, Math.min(1, relX)) * ANIMATION_TIMINGS.maxParallaxOffset);
    rawParallaxY.set(-Math.max(-1, Math.min(1, relY)) * ANIMATION_TIMINGS.maxParallaxOffset);
  };

  const handlePointerLeave = () => {
    rawParallaxX.set(0);
    rawParallaxY.set(0);
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDims({ w: rect.width, h: rect.height });
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(containerRef.current);
    window.addEventListener('resize', updateDims);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDims);
    };
  }, []);

  const { w, h } = dims;

  // Road thickness: min(0.13 * h, 0.07 * w)
  const roadThickness = Math.min(0.13 * h, 0.07 * w);
  const R = roadThickness / 2;

  // Sine wave extremes as fractions of the window (w, h):
  // start  (-0.03, 0.56)
  // trough1 (0.21, 0.83)
  // crest1  (0.375, 0.25)
  // trough2 (0.63, 0.77)
  // crest2  (0.83, 0.24)
  // end    (1.03, 0.58)
  const pts = [
    { x: -0.03 * w, y: 0.56 * h },
    { x: 0.21 * w, y: 0.83 * h },
    { x: 0.375 * w, y: 0.25 * h },
    { x: 0.63 * w, y: 0.77 * h },
    { x: 0.83 * w, y: 0.24 * h },
    { x: 1.03 * w, y: 0.58 * h },
  ];

  let roadPathD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const pA = pts[i];
    const pB = pts[i + 1];
    const dx = 0.5 * (pB.x - pA.x);
    const c1x = pA.x + dx;
    const c1y = pA.y;
    const c2x = pB.x - dx;
    const c2y = pB.y;
    roadPathD += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${pB.x.toFixed(1)} ${pB.y.toFixed(1)}`;
  }

  // Node placements matching reference:
  // 01 at bottom edge of trough 1
  const node1 = { x: pts[1].x, y: pts[1].y + R * 0.72 };
  // 02 at top-left of crest 1
  const node2 = { x: pts[2].x - R * 0.7, y: pts[2].y - R * 0.45 };
  // 03 at bottom edge of trough 2
  const node3 = { x: pts[3].x, y: pts[3].y + R * 0.72 };
  // 04 at top edge of crest 2
  const node4 = { x: pts[4].x, y: pts[4].y - R * 0.72 };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="pt-16 sm:pt-[var(--dh-nav-bottom,64px)]">
      <SEOHead
        title="How It Works & Project Methodology | DigiHust"
        description="Learn about DigiHust's structured 4-step process: Intake & Scoping, Specialist Squad Assembly, Sprint Execution, and Production Handover."
        schema={faqSchema}
      />

      {/* ── Centered Header Section (Above Roadmap) ── */}
      <section
        data-hero="true"
        className="bg-[var(--bg-page)] pt-20 sm:pt-24 pb-12 sm:pb-16 px-6 lg:px-8 border-b border-[var(--border-subtle)] text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div>
            <motion.h1
              initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: ANIMATION_TIMINGS.headerTitleDuration,
                ease: 'easeOut',
              }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-heading)] mb-4 tracking-tight"
            >
              How DigiHust Works.
            </motion.h1>
            <motion.p
              initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: ANIMATION_TIMINGS.headerSubtitleDuration,
                delay: ANIMATION_TIMINGS.headerSubtitleDelay,
                ease: 'easeOut',
              }}
              className="text-base sm:text-lg text-[var(--text-body)] max-w-2xl mx-auto leading-relaxed"
            >
              A disciplined, 4-step process transforming ideas into production-ready digital products with zero guesswork.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Roadmap Window Section = calc(100svh - navbar height) ── */}
      <section
        id="roadmap-section"
        style={{ scrollMarginTop: 'var(--dh-nav-bottom, 64px)' }}
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full sm:h-[calc(100svh-var(--dh-nav-bottom,64px))] sm:min-h-[calc(100svh-var(--dh-nav-bottom,64px))] sm:max-h-[calc(100svh-var(--dh-nav-bottom,64px))] overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-page)] select-none"
      >
        {/* Soft gradient wash across the window with gentle float */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-rose-200/25 dark:to-cyan-950/20"
          animate={
            isAmbientActive
              ? {
                  scale: [1, 1.04, 0.98, 1],
                  x: [0, -10, 8, 0],
                  y: [0, 8, -10, 0],
                }
              : { scale: 1, x: 0, y: 0 }
          }
          transition={{
            duration: ANIMATION_TIMINGS.blobFloatDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        {/* Thin wavy contour lines running behind the road with subtle parallax and drift */}
        <motion.div
          style={{ x: parallaxX, y: parallaxY }}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <motion.svg
            className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.05]"
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            fill="none"
            animate={
              isAmbientActive
                ? {
                    x: [0, 8, -6, 0],
                    y: [0, -6, 5, 0],
                  }
                : { x: 0, y: 0 }
            }
            transition={{
              duration: ANIMATION_TIMINGS.contourDriftDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path
              d={`M 0 ${0.2 * h} Q ${0.25 * w} ${0.1 * h}, ${0.5 * w} ${0.25 * h} T ${w} ${0.15 * h}`}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              className="text-[var(--text-heading)]"
            />
            <path
              d={`M 0 ${0.45 * h} Q ${0.3 * w} ${0.35 * h}, ${0.6 * w} ${0.5 * h} T ${w} ${0.4 * h}`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-[var(--text-heading)]"
            />
            <path
              d={`M 0 ${0.75 * h} Q ${0.25 * w} ${0.65 * h}, ${0.55 * w} ${0.8 * h} T ${w} ${0.7 * h}`}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="8 6"
              className="text-[var(--text-heading)]"
            />
          </motion.svg>
        </motion.div>

        {/* ── Desktop & Tablet Roadmap View (sm and up) ── */}
        <div className="hidden sm:block absolute inset-0 w-full h-full">
          {/* Sine Wave Road Ribbon SVG with Soft Drop Shadow & Ambient Motion */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="road-ribbon-shadow" x="-10%" y="-10%" width="125%" height="135%">
                <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#022B3A" floodOpacity="0.16" />
              </filter>
              {/* SVG mask that draws the road from left to right */}
              <mask id="road-reveal-mask">
                <motion.path
                  d={roadPathD}
                  stroke="white"
                  strokeWidth={roadThickness + 8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: prefersReduced ? 1 : 0 }}
                  transition={{
                    duration: ANIMATION_TIMINGS.roadDrawDuration,
                    ease: ANIMATION_TIMINGS.roadDrawEase,
                  }}
                />
              </mask>
            </defs>

            {/* Masked group that reveals the road ribbon as it draws */}
            <g mask={prefersReduced ? undefined : 'url(#road-reveal-mask)'}>
              {/* Road Base with Drop Shadow */}
              <path
                d={roadPathD}
                stroke="var(--bg-subtle)"
                strokeWidth={roadThickness}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#road-ribbon-shadow)"
              />

              {/* Subtle outer casing for definition */}
              <path
                d={roadPathD}
                stroke="var(--border-subtle)"
                strokeWidth={roadThickness + 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Road Surface Ribbon */}
              <path
                d={roadPathD}
                stroke="var(--bg-subtle)"
                strokeWidth={roadThickness}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dashed Center Line (flows slowly in ambient loop) */}
              <motion.path
                d={roadPathD}
                stroke="white"
                strokeWidth={Math.max(2.5, roadThickness * 0.045)}
                strokeDasharray="14 14"
                strokeLinecap="round"
                className="opacity-90 dark:opacity-40"
                animate={isAmbientActive ? { strokeDashoffset: [0, -56] } : { strokeDashoffset: 0 }}
                transition={{
                  duration: ANIMATION_TIMINGS.dashFlowDuration,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Traveling marker dot that glides along the center line */}
              {isAmbientActive && (
                <g>
                  <circle
                    r={Math.max(6, roadThickness * 0.08)}
                    fill="var(--brand-teal)"
                    opacity="0.3"
                  >
                    <animateMotion
                      path={roadPathD}
                      dur={`${ANIMATION_TIMINGS.markerLoopDuration}s`}
                      repeatCount="indefinite"
                      calcMode="spline"
                      keyTimes="0; 0.5; 1"
                      keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                    />
                  </circle>
                  <circle
                    r={Math.max(3.2, roadThickness * 0.045)}
                    fill="white"
                    opacity="0.95"
                  >
                    <animateMotion
                      path={roadPathD}
                      dur={`${ANIMATION_TIMINGS.markerLoopDuration}s`}
                      repeatCount="indefinite"
                      calcMode="spline"
                      keyTimes="0; 0.5; 1"
                      keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                    />
                  </circle>
                </g>
              )}
            </g>
          </svg>

          {/* ── Node 01 (At bottom edge of trough 1) ── */}
          <motion.div
            style={{
              left: `${node1.x}px`,
              top: `${node1.y}px`,
              backgroundColor: PHASE_THEMES[0].color,
            }}
            initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
            animate={
              isInView
                ? { scale: hoveredPhase === '01' ? 1.12 : 1, opacity: 1 }
                : prefersReduced
                ? { scale: 1, opacity: 1 }
                : { scale: 0.6, opacity: 0 }
            }
            transition={
              hoveredPhase === '01'
                ? { duration: 0.2, ease: 'easeOut' }
                : prefersReduced
                ? { duration: 0.2 }
                : {
                    scale: { delay: ANIMATION_TIMINGS.nodeDelays[0], ...ANIMATION_TIMINGS.nodeSpring },
                    opacity: { delay: ANIMATION_TIMINGS.nodeDelays[0], duration: 0.3 },
                  }
            }
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white shadow-lg ring-[3px] ring-white dark:ring-[var(--bg-page)] flex items-center justify-center font-display font-black text-sm select-none"
          >
            01
            {/* Soft expanding ring pulse */}
            {isAmbientActive && (
              <motion.div
                style={{ borderColor: PHASE_THEMES[0].color }}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                initial={{ scale: 1, opacity: 0.35 }}
                animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                transition={{
                  duration: hoveredPhase === '01' ? ANIMATION_TIMINGS.nodePulseHoverDuration : ANIMATION_TIMINGS.nodePulseDuration,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: ANIMATION_TIMINGS.nodeDelays[0] + 0.3,
                }}
              />
            )}
          </motion.div>

          {/* ── Card 01 (Above Node 01, pointer down) ── */}
          <div
            style={{ left: `${node1.x}px`, top: `${node1.y - 28}px` }}
            className="absolute -translate-x-1/2 -translate-y-full z-20"
          >
            <RoadmapCard
              step={STEPS[0]}
              shortDesc={SHORT_DESCRIPTIONS['01']}
              phaseColor={PHASE_THEMES[0].color}
              pointerDirection="down"
              flipUp={true}
              alignRight={false}
              introDelay={ANIMATION_TIMINGS.nodeDelays[0] + ANIMATION_TIMINGS.cardAppearDelayOffset}
              slideOffset={{ y: 12 }}
              prefersReduced={prefersReduced}
              isInView={isInView}
              onHoverChange={(hov) => setHoveredPhase(hov ? '01' : null)}
            />
          </div>

          {/* ── Node 02 (At top-left of crest 1) ── */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white shadow-lg ring-[3px] ring-white dark:ring-[var(--bg-page)] flex items-center justify-center font-display font-black text-sm select-none"
            style={{
              left: `${node2.x}px`,
              top: `${node2.y}px`,
              backgroundColor: PHASE_THEMES[1].color,
            }}
            initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
            animate={
              isInView
                ? { scale: hoveredPhase === '02' ? 1.12 : 1, opacity: 1 }
                : prefersReduced
                ? { scale: 1, opacity: 1 }
                : { scale: 0.6, opacity: 0 }
            }
            transition={
              hoveredPhase === '02'
                ? { duration: 0.2, ease: 'easeOut' }
                : prefersReduced
                ? { duration: 0.2 }
                : {
                    scale: { delay: ANIMATION_TIMINGS.nodeDelays[1], ...ANIMATION_TIMINGS.nodeSpring },
                    opacity: { delay: ANIMATION_TIMINGS.nodeDelays[1], duration: 0.3 },
                  }
            }
          >
            02
            {/* Soft expanding ring pulse */}
            {isAmbientActive && (
              <motion.div
                style={{ borderColor: PHASE_THEMES[1].color }}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                initial={{ scale: 1, opacity: 0.35 }}
                animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                transition={{
                  duration: hoveredPhase === '02' ? ANIMATION_TIMINGS.nodePulseHoverDuration : ANIMATION_TIMINGS.nodePulseDuration,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: ANIMATION_TIMINGS.nodeDelays[1] + 0.3,
                }}
              />
            )}
          </motion.div>

          {/* ── Card 02 (Left of Node 02, pointer right) ── */}
          <div
            style={{ left: `${node2.x - 28}px`, top: `${node2.y}px` }}
            className="absolute -translate-x-full -translate-y-1/2 z-20"
          >
            <RoadmapCard
              step={STEPS[1]}
              shortDesc={SHORT_DESCRIPTIONS['02']}
              phaseColor={PHASE_THEMES[1].color}
              pointerDirection="right"
              flipUp={false}
              alignRight={false}
              introDelay={ANIMATION_TIMINGS.nodeDelays[1] + ANIMATION_TIMINGS.cardAppearDelayOffset}
              slideOffset={{ x: 12 }}
              prefersReduced={prefersReduced}
              isInView={isInView}
              onHoverChange={(hov) => setHoveredPhase(hov ? '02' : null)}
            />
          </div>

          {/* ── Node 03 (At bottom edge of trough 2) ── */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white shadow-lg ring-[3px] ring-white dark:ring-[var(--bg-page)] flex items-center justify-center font-display font-black text-sm select-none"
            style={{
              left: `${node3.x}px`,
              top: `${node3.y}px`,
              backgroundColor: PHASE_THEMES[2].color,
            }}
            initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
            animate={
              isInView
                ? { scale: hoveredPhase === '03' ? 1.12 : 1, opacity: 1 }
                : prefersReduced
                ? { scale: 1, opacity: 1 }
                : { scale: 0.6, opacity: 0 }
            }
            transition={
              hoveredPhase === '03'
                ? { duration: 0.2, ease: 'easeOut' }
                : prefersReduced
                ? { duration: 0.2 }
                : {
                    scale: { delay: ANIMATION_TIMINGS.nodeDelays[2], ...ANIMATION_TIMINGS.nodeSpring },
                    opacity: { delay: ANIMATION_TIMINGS.nodeDelays[2], duration: 0.3 },
                  }
            }
          >
            03
            {/* Soft expanding ring pulse */}
            {isAmbientActive && (
              <motion.div
                style={{ borderColor: PHASE_THEMES[2].color }}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                initial={{ scale: 1, opacity: 0.35 }}
                animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                transition={{
                  duration: hoveredPhase === '03' ? ANIMATION_TIMINGS.nodePulseHoverDuration : ANIMATION_TIMINGS.nodePulseDuration,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: ANIMATION_TIMINGS.nodeDelays[2] + 0.3,
                }}
              />
            )}
          </motion.div>

          {/* ── Card 03 (Below Node 03, pointer up) ── */}
          <div
            style={{ left: `${node3.x}px`, top: `${node3.y + 28}px` }}
            className="absolute -translate-x-1/2 z-20"
          >
            <RoadmapCard
              step={STEPS[2]}
              shortDesc={SHORT_DESCRIPTIONS['03']}
              phaseColor={PHASE_THEMES[2].color}
              pointerDirection="up"
              flipUp={true}
              alignRight={false}
              introDelay={ANIMATION_TIMINGS.nodeDelays[2] + ANIMATION_TIMINGS.cardAppearDelayOffset}
              slideOffset={{ y: -12 }}
              prefersReduced={prefersReduced}
              isInView={isInView}
              onHoverChange={(hov) => setHoveredPhase(hov ? '03' : null)}
            />
          </div>

          {/* ── Node 04 (At top edge of crest 2) ── */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white shadow-lg ring-[3px] ring-white dark:ring-[var(--bg-page)] flex items-center justify-center font-display font-black text-sm select-none"
            style={{
              left: `${node4.x}px`,
              top: `${node4.y}px`,
              backgroundColor: PHASE_THEMES[3].color,
            }}
            initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
            animate={
              isInView
                ? { scale: hoveredPhase === '04' ? 1.12 : 1, opacity: 1 }
                : prefersReduced
                ? { scale: 1, opacity: 1 }
                : { scale: 0.6, opacity: 0 }
            }
            transition={
              hoveredPhase === '04'
                ? { duration: 0.2, ease: 'easeOut' }
                : prefersReduced
                ? { duration: 0.2 }
                : {
                    scale: { delay: ANIMATION_TIMINGS.nodeDelays[3], ...ANIMATION_TIMINGS.nodeSpring },
                    opacity: { delay: ANIMATION_TIMINGS.nodeDelays[3], duration: 0.3 },
                  }
            }
          >
            04
            {/* Soft expanding ring pulse */}
            {isAmbientActive && (
              <motion.div
                style={{ borderColor: PHASE_THEMES[3].color }}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                initial={{ scale: 1, opacity: 0.35 }}
                animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                transition={{
                  duration: hoveredPhase === '04' ? ANIMATION_TIMINGS.nodePulseHoverDuration : ANIMATION_TIMINGS.nodePulseDuration,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: ANIMATION_TIMINGS.nodeDelays[3] + 0.3,
                }}
              />
            )}
          </motion.div>

          {/* ── Card 04 (Above Node 04, pointer down) ── */}
          <div
            style={{ left: `${node4.x}px`, top: `${node4.y - 28}px` }}
            className="absolute -translate-x-1/2 -translate-y-full z-20"
          >
            <RoadmapCard
              step={STEPS[3]}
              shortDesc={SHORT_DESCRIPTIONS['04']}
              phaseColor={PHASE_THEMES[3].color}
              pointerDirection="down"
              flipUp={false}
              alignRight={true}
              introDelay={ANIMATION_TIMINGS.nodeDelays[3] + ANIMATION_TIMINGS.cardAppearDelayOffset}
              slideOffset={{ y: 12 }}
              prefersReduced={prefersReduced}
              isInView={isInView}
              onHoverChange={(hov) => setHoveredPhase(hov ? '04' : null)}
            />
          </div>
        </div>

        {/* ── Mobile Roadmap View (< 640px) ── */}
        <div className="sm:hidden px-4 py-8 relative z-10">
          <div className="relative pl-7 space-y-6">
            {/* Smooth mobile timeline spine */}
            <div
              className="absolute left-3.5 top-3 bottom-3 w-0.5 -translate-x-1/2 bg-[var(--border-subtle)]"
              aria-hidden="true"
            >
              <div className="w-full h-full bg-gradient-to-b from-[#0D9488] via-[#2563EB] to-[#EA580C]" />
            </div>

            {STEPS.map((step, idx) => {
              const isMobileOpen = mobileOpenIndex === step.num;
              const theme = PHASE_THEMES[idx] || PHASE_THEMES[0];
              return (
                <motion.div
                  key={step.num}
                  className="relative"
                  initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.12,
                    ease: 'easeOut',
                  }}
                >
                  {/* Node */}
                  <div
                    style={{ backgroundColor: theme.color }}
                    className="absolute -left-7 top-2 -translate-x-1/2 w-7 h-7 rounded-full text-white shadow-sm ring-[3px] ring-white dark:ring-[var(--bg-page)] flex items-center justify-center font-display font-black text-xs select-none z-10"
                  >
                    {step.num}
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setMobileOpenIndex(isMobileOpen ? null : step.num)}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div
                          style={{ backgroundColor: theme.color }}
                          className="w-3 h-3 rounded-full flex-shrink-0"
                        />
                        <span className="text-[10px] font-extrabold text-[var(--text-heading)] uppercase tracking-wider">
                          Phase {step.num}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        {isMobileOpen ? 'Collapse ▴' : 'Expand ▾'}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-sm text-[var(--text-heading)] leading-snug uppercase mb-1">
                      {step.title}
                    </h3>

                    <p className="text-xs text-[var(--text-body)] leading-relaxed">
                      {SHORT_DESCRIPTIONS[step.num]}
                    </p>

                    {isMobileOpen && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                        <p className="text-xs text-[var(--text-body)] leading-relaxed">
                          {step.detail}
                        </p>
                        <div className="space-y-1.5 pt-1">
                          {step.points.map((pt) => (
                            <div key={pt} className="flex items-start space-x-2">
                              <CheckCircle2
                                style={{ color: theme.color }}
                                className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                              />
                              <span className="text-xs text-[var(--text-body)] font-medium leading-snug">
                                {pt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {videoUrl && (
        <section className="bg-[var(--bg-subtle)] py-16 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-subtle)]"
            >
              <iframe
                src={videoUrl}
                title="How DigiHust Works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </motion.div>
          </div>
        </section>
      )}

      {/* Model Comparison Table */}
      <section className="bg-[var(--bg-surface)] py-20 px-6 lg:px-8 border-y border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl text-[var(--text-heading)] mb-3">
              Why DigiHust vs. Freelance Marketplaces
            </h2>
            <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
              How managed team delivery compares to individual freelance contracting.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-body)] border-collapse border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-[var(--bg-page)] text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <th className="p-4 sm:p-5">Comparison Metric</th>
                  <th className="p-4 sm:p-5 text-[var(--text-heading)]">DigiHust Managed Model</th>
                  <th className="p-4 sm:p-5 text-[var(--text-dim)]">Individual Freelancers</th>
                </tr> 
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
                {[
                  ['Point of Contact', 'Single accountable lead manager', 'You manage 3–6 separate people'],
                  ['Accountability', 'Guaranteed company SLA & backup talent', 'High risk of ghosting or delays'],
                  ['Talent Verification', 'Strictly verified Digiskill domain leads', 'Self-reported marketplace ratings'],
                  ['Quality Assurance', 'Internal pre-handover QA & code review', 'You must QA everything yourself'],
                  ['Billing & Contracts', 'Single consolidated contract & invoices', 'Multiple separate invoices & fees'],
                ].map(([metric, digi, free]) => (
                  <tr key={metric} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[var(--text-dim)]">{metric}</td>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{digi}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-[var(--text-muted)]">{free}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Technologies & Tools Section */}
      <section className="bg-[var(--bg-page)] py-20 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] mb-4">
              Technologies & Tools
            </h2>
            <p className="text-[var(--text-body)] text-base max-w-2xl mx-auto leading-relaxed">
              We leverage modern, industry-standard engineering stacks, frameworks, and workflows to build performant, secure, and production-scalable software.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TOOL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:border-[var(--brand-teal)]/40 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--brand-teal)]/10 text-[var(--brand-teal)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-base text-[var(--text-heading)]">
                        {cat.category}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {cat.tools.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-page)] text-[var(--text-heading)] border border-[var(--border-subtle)] font-medium transition-all duration-150 hover:border-[var(--brand-teal)]/40 hover:bg-[var(--bg-surface)] hover:shadow-xs group"
                        >
                          <TechLogo name={t} className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[var(--bg-page)] py-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={faq.q}
                  className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden transition-all bg-[var(--bg-surface)]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg text-[var(--text-heading)] hover:text-[var(--brand-teal)] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--text-dim)] flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[var(--brand-teal)]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[var(--text-body)] leading-relaxed border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--bg-page)] py-20 px-6 lg:px-8 text-center border-t border-[var(--border-subtle)]">
        <h2 className="font-display font-extrabold text-3xl text-[var(--text-heading)] mb-4">
          Ready to Start Your Project?
        </h2>
        <p className="text-[var(--text-body)] mb-8 max-w-md mx-auto">
          Submit your scope to receive a formal proposal and timeline within 24 hours.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[#1F7A8C] hover:bg-[#186473] text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          <span>Get a Quote</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
