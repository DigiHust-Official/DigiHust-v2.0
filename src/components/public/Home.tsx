import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Code,
  Palette,
  Cpu,
  TrendingUp,
  Shield,
  Database,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Layers,
  Users2,
  Star,
  Quote,
  Check,
  Briefcase,
  ExternalLink,
  X,
} from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { HeroBackdrop } from '../ui/HeroBackdrop';
import { ServiceCard } from '../ui/ServiceCard';
import { WorkShowcaseSection } from './WorkShowcaseSection';
import { LavaProposalButton } from '../ui/LavaProposalButton';
import { GlowCtaButton } from '../ui/GlowCtaButton';
import { GlassCtaButton } from '../ui/GlassCtaButton';
import { HeroRotator } from '../ui/HeroRotator';
import { OrbitRing } from '../ui/OrbitRing';
import { HeroMediaColumns } from '../ui/HeroMediaColumns';
import { AboutSection } from './AboutSection';
import { ServicesSection } from './ServicesSection';
import { ModelAdvantageSection } from './ModelAdvantageSection';
import { useHeroHardScroll } from '../../hooks/useHeroHardScroll';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Project, getProjectLiveUrl, PROJECTS, getValidProjects, normalizeProject } from '../../data/workProjects';
import { getServiceIcon } from '../../lib/serviceIcons';
import { handleCardSpotlightMove, handleCardSpotlightLeave } from '../../lib/cardSpotlight';
import { GenerativePattern } from '../ui/ServiceBentoCard';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';

// ── Service categories ──────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: <Code className="w-6 h-6" />,
    title: 'Development',
    summary: 'Websites · Web Apps · APIs · Full Stack',
    description: 'Fast, scalable, and responsive digital products built with React, Next.js, Node.js, and modern cloud architecture.',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    color: '#1F7A8C', // Brand Teal
    slug: 'saas-mvp-development',
    linkTarget: '/services/saas-mvp-development',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Creative & UI/UX',
    summary: 'Brand Identity · UI/UX · Figma · Motion',
    description: 'Visual identities and user-friendly interfaces designed to elevate brand authority and convert visitors into customers.',
    tags: ['Brand Identity', 'UI/UX Design', 'Figma', 'Motion'],
    color: '#8B5CF6', // Creative Purple
    slug: 'brand-identity-design-system',
    linkTarget: '/services/brand-identity-design-system',
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'AI & Automation',
    summary: 'LLM Solutions · Chatbots · n8n · Workflows',
    description: 'Integrating customized AI models, workflow automations, and intelligent bots to eliminate repetitive business overhead.',
    tags: ['OpenAI', 'Python', 'n8n', 'Zapier'],
    color: '#0284C7', // Cyber Cyan Blue
    slug: 'ai-workflow-automation',
    linkTarget: '/services/ai-workflow-automation',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Marketing & SEO',
    summary: 'Search Optimization · Ads · Content Growth',
    description: 'Targeted search engine optimization, performance ad campaigns, and authoritative content strategies that drive revenue.',
    tags: ['Technical SEO', 'Google Ads', 'Meta Ads', 'Copywriting'],
    color: '#D97706', // Growth Amber
    slug: 'digital-marketing-seo',
    linkTarget: '/services/digital-marketing-seo',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Cybersecurity',
    summary: 'Security Audits · Pen Testing · Hardening',
    description: 'Comprehensive vulnerability assessments, penetration testing, and security hardening for web applications and cloud servers.',
    tags: ['Pen Testing', 'OWASP Audit', 'Cloud Security'],
    color: '#E11D48', // Security Crimson Red
    slug: 'cybersecurity-audit',
    linkTarget: '/services/cybersecurity-audit',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Data Intelligence',
    summary: 'PowerBI · ETL · Analytics · Automation',
    description: 'Converting siloed data into actionable executive dashboards, automated reporting, and structured business insights.',
    tags: ['PowerBI', 'Data Pipelines', 'SQL', 'Analytics'],
    color: '#059669', // Data Emerald Green
    slug: 'data-intelligence-analytics',
    linkTarget: '/services/data-intelligence-analytics',
  },
];

// ── Portfolio previews ──────────────────────────────────────────────────────
const WORK_PREVIEWS = [
  {
    slug: 'real-estate-marketplace-portal',
    category: 'Web Development',
    title: 'Real-Estate Marketplace Portal',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    stat: '+140% Conversion Rate',
  },
  {
    slug: 'automotive-brand-identity',
    category: 'Creative & Branding',
    title: 'Automotive Brand Identity & Motion Ads',
    tags: ['Brand Identity', 'After Effects', '3D Animation'],
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    stat: 'Complete 3D Ad Suite',
  },
  {
    slug: 'hospital-bi-dashboard',
    category: 'AI & Data',
    title: 'Executive Sales BI Dashboard',
    tags: ['PowerBI', 'Python', 'Automated ETL'],
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    stat: '12+ Hours Saved/Week',
  },
];

// ── Verified Client Testimonials ────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: 'DigiHust transformed our slow, crashing property platform into the fastest portal in our UK regional market. Zero headache managing separate freelancers.',
    name: 'David Sterling',
    role: 'Managing Director',
    company: 'Estates Direct UK',
    avatar: '',
    rating: 5,
  },
  {
    quote: 'The 3D promotional trailers and brand system produced by DigiHust established our electric vehicle startup as an immediate serious contender in Europe.',
    name: 'Markus Vogel',
    role: 'Chief Brand Officer',
    company: 'Veloce Motors DE',
    avatar: '',
    rating: 5,
  },
  {
    quote: 'Their AI squad built an automated tracking bot that resolved 78% of our customer tickets within seconds. Our support team can finally focus on VIP accounts.',
    name: 'Sarah Chen',
    role: 'Head of Operations',
    company: 'LogiXpress Global',
    avatar: '',
    rating: 5,
  },
];

// ── Frequently Asked Questions (Native details/summary for SEO text ratio) ──
const HOME_FAQ_ITEMS = [
  {
    question: 'What does DigiHust do?',
    answer:
      'DigiHust is a managed digital services company delivering end-to-end solutions across five core disciplines: Web Engineering, Creative & UI/UX Design, AI & Workflow Automation, Growth Marketing & SEO, and Cybersecurity. Instead of leaving clients to coordinate disconnected contractors, we assemble dedicated specialist squads under unified technical leadership.',
  },
  {
    question: 'How does DigiHust differ from hiring independent freelancers?',
    answer:
      'Managing separate freelancers means multiple negotiations, misaligned schedules, blame-shifting, and unpredictable quality. DigiHust operates as a single accountable agency partner. You receive a dedicated point of contact, synchronized sprint milestones, unified delivery, and strict service-level agreements (SLAs) for the entire project lifecycle.',
  },
  {
    question: 'How fast does a project proposal arrive?',
    answer:
      'We review your project requirements and deliver a calibrated scope breakdown, architectural recommendation, and transparent milestone quote within 24 hours of your intake submission.',
  },
  {
    question: 'Who does the work on client projects?',
    answer:
      "All work is completed by verified domain specialists trained and vetted through Pakistan's Digiskill ecosystem and DigiHust's internal technical benchmarks. Each squad member is matched specifically to your technical stack, whether React, Next.js, Python AI pipelines, Figma design systems, or security auditing.",
  },
  {
    question: 'How does DigiHust handle quality assurance?',
    answer:
      'Every deliverable undergoes multi-stage internal review before reaching your team. Senior technical architects verify code quality, performance metrics, and security compliance to ensure all work meets production standards prior to milestone sign-off.',
  },
  {
    question: 'What does the Quality & Milestone Guarantee cover?',
    answer:
      'We provide a 100% Quality & Milestone Guarantee. Projects are divided into transparent staging sprints with agreed-upon acceptance criteria. Client feedback is integrated into each review, and you maintain complete visibility over deliverables before milestones are accepted.',
  },
  {
    question: 'How do contracts, communication, and invoicing work?',
    answer:
      'You work under a single legal contract and receive a single consolidated invoice, regardless of how many disciplines are involved in your build. One dedicated project manager handles communication, timeline tracking, and squad coordination from kickoff to final handover.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface TestimonialData {
  id?: string | number;
  name: string;
  role: string;
  company?: string;
  quote: string;
  avatar?: string;
  avatarUrl?: string;
  rating?: number;
}

interface HomeTestimonialsSectionProps {
  testimonials: TestimonialData[];
  t: (key: string) => string;
}

const HomeTestimonialsSection: React.FC<HomeTestimonialsSectionProps> = ({ testimonials, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [cardStep, setCardStep] = useState(300);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMetrics = () => {
      if (!trackRef.current) return;
      const firstCard = trackRef.current.querySelector<HTMLElement>('[data-testimonial-card]');
      if (firstCard) {
        const rect = firstCard.getBoundingClientRect();
        // 24px gap (gap-6)
        setCardStep(rect.width + 24);
      }
    };
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [testimonials]);

  const maxIndex = Math.max(0, testimonials.length - 1);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -250) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 250) {
      handlePrev();
    }
  };

  const progressPercent = testimonials.length > 1
    ? ((currentIndex + 1) / testimonials.length) * 100
    : 100;

  return (
    <section
      id="feedback"
      data-hard-stop="feedback"
      style={{
        scrollMarginTop: 'var(--dh-nav-bottom, 64px)',
        scrollPaddingTop: 'var(--dh-nav-bottom, 64px)',
        height: 'calc(100svh - var(--dh-nav-bottom, 64px))',
        minHeight: 'calc(100svh - var(--dh-nav-bottom, 64px))',
        background: 'linear-gradient(to bottom, var(--bg-page), color-mix(in srgb, var(--brand-teal) 3.5%, var(--bg-page)))',
      }}
      className="flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-10 lg:pb-12 border-t border-[var(--border-subtle)] overflow-hidden relative select-none"
    >
      <style>{`
        #feedback {
          --testimonial-even-bg: color-mix(in srgb, var(--brand-teal) 9%, var(--bg-surface));
          --testimonial-even-border: color-mix(in srgb, var(--brand-teal) 22%, var(--border-subtle));
        }
        .dark #feedback, [data-theme="dark"] #feedback {
          --testimonial-even-bg: color-mix(in srgb, black 32%, var(--bg-surface));
          --testimonial-even-border: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Header Block: Centered title & subtitle, sized with clamp() */}
      <div className="text-center mb-2 sm:mb-4 lg:mb-6 max-w-4xl mx-auto flex-none">
        <h2 className="font-display font-extrabold text-[clamp(1.5rem,2.8vw,2.25rem)] text-[var(--text-heading)] mb-2 leading-tight tracking-tight">
          {t('testimonials_heading')}
        </h2>
        <p className="text-[var(--text-body)] text-[clamp(0.8125rem,1.1vw,0.9375rem)] max-w-[56rem] mx-auto leading-relaxed text-center">
          {t('testimonials_sub')}
        </p>
      </div>

      {/* Carousel Block: flex-1, vertically centered */}
      <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col justify-center">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 sm:gap-8 md:gap-10 lg:gap-14 w-full">
          {/* Left Column (about 26-28% width on desktop, compact on mobile) */}
          <div className="w-full md:w-[28%] lg:w-[27%] flex-shrink-0 flex flex-col sm:flex-row md:flex-col justify-between items-start sm:items-center md:items-start gap-4 sm:gap-6 self-stretch">
            {/* Quote icon ABOVE the heading */}
            <div className="flex flex-col items-start gap-3 sm:gap-4">
              {/* Solid rounded quote mark icon (about clamp(56px, 5vw, 80px) in accent token) */}
              <div
                className="w-[clamp(56px,5vw,80px)] h-[clamp(44px,4vw,64px)] text-[var(--brand-teal)] opacity-30 dark:opacity-25 flex-shrink-0"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 72 60"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M0 34.286C0 15.357 12.857 2.143 30.857 0l3.429 8.571C22.286 10.714 15.429 17.571 14.571 27.429H30.857V60H0V34.286zm37.714 0C37.714 15.357 50.571 2.143 68.571 0l3.429 8.571c-12 2.143-18.857 9-19.714 18.858H68.571V60H37.714V34.286z" />
                </svg>
              </div>

              {/* Heading below quote icon in clamp(1.75rem, 2.6vw, 2.75rem), line-height 1.15 */}
              <h3 className="font-sans font-light text-[clamp(1.75rem,2.6vw,2.75rem)] text-[var(--text-heading)] leading-[1.15] tracking-tight">
                What our<br className="hidden sm:inline" /> clients are<br className="hidden sm:inline" /> saying
              </h3>
            </div>

            {/* Navigation controls row: prev arrow, thin progress bar, next arrow */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 mt-[clamp(1.5rem,4vh,3rem)]">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous testimonial"
                className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-heading)] hover:bg-[var(--bg-surface)] hover:border-[var(--brand-teal)]/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-heading)]" />
              </button>

              {/* Thin progress bar: 4px thick */}
              <div className="w-28 sm:w-36 md:w-44 h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden relative flex-shrink-0">
                <div
                  className="h-full bg-[var(--brand-teal)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                aria-label="Next testimonial"
                className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-heading)] hover:bg-[var(--bg-surface)] hover:border-[var(--brand-teal)]/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
              >
                <ArrowRight className="w-5 h-5 text-[var(--text-heading)]" />
              </button>
            </div>
          </div>

          {/* Right Side Carousel Track (about 72-74% width, bleeds off right edge) */}
          <div
            className="w-full md:w-[72%] lg:w-[73%] flex-1 min-w-0 overflow-hidden relative py-2 md:-mr-[max(0px,calc((100vw-80rem)/2))] md:pr-6"
            tabIndex={0}
            aria-label="Client testimonials carousel"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') handlePrev();
              else if (e.key === 'ArrowRight') handleNext();
            }}
          >
            <motion.div
              ref={trackRef}
              className="flex gap-6 cursor-grab active:cursor-grabbing select-none items-stretch"
              animate={{ x: -currentIndex * cardStep }}
              transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: -maxIndex * cardStep, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
            >
              {testimonials.map((tItem, idx) => {
                const isEven = idx % 2 === 1;
                const initials = (tItem.name || 'DH')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const isHovered = hoveredCardIndex === idx;
                const cardBg = isEven ? 'var(--testimonial-even-bg)' : 'var(--bg-surface)';
                const cardBorder = isEven ? 'var(--testimonial-even-border)' : 'var(--border-subtle)';

                return (
                  <div
                    key={tItem.id || tItem.name || idx}
                    data-testimonial-card
                    className="flex-shrink-0 w-[clamp(260px,24vw,340px)] flex flex-col group/card relative"
                  >
                    {/* Speech Bubble Card: taller content-safe height */}
                    <div
                      className="relative rounded-[20px] p-[clamp(1.25rem,1.8vw,1.75rem)] pb-[clamp(1.75rem,2.2vw,2.25rem)] shadow-sm transition-shadow hover:shadow-md min-h-[clamp(300px,44vh,440px)] flex flex-col justify-between border"
                      style={{
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                      }}
                      onMouseEnter={() => setHoveredCardIndex(idx)}
                      onMouseLeave={() => setHoveredCardIndex(null)}
                      onClick={() => setHoveredCardIndex(isHovered ? null : idx)}
                    >
                      {/* Quote Text */}
                      <blockquote className="font-sans font-normal text-[clamp(0.8125rem,0.95vw,0.9375rem)] leading-[1.6] text-[var(--text-body)] line-clamp-9 overflow-hidden select-text">
                        &ldquo;{tItem.quote}&rdquo;
                      </blockquote>

                      {/* Speech-bubble tail notch pointing down-left */}
                      <div className="absolute -bottom-[10px] left-7 w-[18px] h-[11px] pointer-events-none">
                        <svg
                          viewBox="0 0 18 11"
                          className="w-full h-full overflow-visible"
                          aria-hidden="true"
                        >
                          <polygon
                            points="0,0 18,0 3,11 0,8"
                            fill={cardBg}
                          />
                          <polyline
                            points="0,0 0,8 3,11 18,0"
                            fill="none"
                            stroke={cardBorder}
                            strokeWidth="1.2"
                          />
                          <line
                            x1="0.5"
                            y1="0"
                            x2="17.5"
                            y2="0"
                            stroke={cardBg}
                            strokeWidth="2.5"
                          />
                        </svg>
                      </div>

                      {/* Expanded Popover on Hover/Focus/Tap with zero layout shift */}
                      {isHovered && (
                        <div
                          className="absolute inset-0 z-20 rounded-[20px] p-[clamp(1.25rem,1.8vw,1.75rem)] pb-[clamp(1.75rem,2.2vw,2.25rem)] shadow-xl flex flex-col justify-between overflow-y-auto cursor-auto border"
                          style={{
                            backgroundColor: cardBg,
                            borderColor: cardBorder,
                          }}
                          role="tooltip"
                        >
                          <blockquote className="font-sans font-normal text-[clamp(0.8125rem,0.95vw,0.9375rem)] leading-[1.6] text-[var(--text-body)] select-text">
                            &ldquo;{tItem.quote}&rdquo;
                          </blockquote>
                          <div className="text-[11px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]/60 flex items-center justify-between">
                            <span>Client Feedback</span>
                            <span className="font-mono text-[10px] opacity-75">Click to close</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Below Card: Author Row (outside card, under tail) */}
                    <div className="mt-4 pl-1 flex items-center gap-3.5">
                      {tItem.avatarUrl || tItem.avatar ? (
                        <img
                          src={tItem.avatarUrl || tItem.avatar}
                          alt={tItem.name}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--brand-teal)]/40 flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-teal)]/15 dark:bg-[var(--brand-teal)]/25 text-[var(--brand-teal)] dark:text-cyan-300 font-display font-bold text-xs sm:text-sm flex items-center justify-center ring-2 ring-[var(--brand-teal)]/40 flex-shrink-0 shadow-sm">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[0.9375rem] text-[var(--text-heading)] truncate">
                          {tItem.name}
                        </div>
                        <div className="text-[0.75rem] text-[var(--text-muted)] truncate max-w-[220px]">
                          {tItem.role}{tItem.company ? `, ${tItem.company}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const { siteContent } = useApp();
  const [buttonsHovered, setButtonsHovered] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scoped hard scroll on Home hero runway (desktop >= 1024px only)
  useHeroHardScroll({ runwayRef });

  const hero = siteContent?.hero;

  const testimonials = (siteContent?.testimonials && siteContent.testimonials.length > 0)
    ? siteContent.testimonials
    : TESTIMONIALS;
  const valueProps = siteContent?.valueProps || [];
  const SERVICE_PALETTE = ['#1F7A8C', '#8B5CF6', '#0284C7', '#D97706', '#E11D48', '#059669'];
  const servicesList = (siteContent?.services && siteContent.services.length > 0)
    ? siteContent.services.map((s, idx) => ({
        icon: s.icon ? getServiceIcon(s.icon, 'w-6 h-6') : (SERVICES[idx]?.icon || null),
        title: s.title,
        summary: s.tagline || 'Specialized Domain Squad',
        description: s.description,
        tags: s.features || ['Specialized Delivery'],
        color: (s.color && s.color !== '#1F7A8C') ? s.color : SERVICE_PALETTE[idx % SERVICE_PALETTE.length],
        imageUrl: s.imageUrl,
        patternVariant: s.patternVariant,
        slug: s.slug || s.id,
        linkTarget: s.linkTarget,
      }))
    : SERVICES;

  return (
    <div className="overflow-x-clip">
      <SEOHead
        title="DigiHust | Digital Services Handled by Specialized Talent"
        description="One company, coordinated specialist talent. DigiHust delivers web engineering, design systems, AI automation and cybersecurity under one roof."
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'DigiHust',
            url: 'https://www.digihust.tech',
            logo: 'https://www.digihust.tech/logo.png',
            image: 'https://www.digihust.tech/og-image.jpg',
            description:
              'One company, coordinated specialist talent. DigiHust delivers web engineering, design systems, AI automation and cybersecurity under one roof.',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'PK',
            },
            founder: [
              {
                '@type': 'Person',
                name: 'Mahad Abbas',
                jobTitle: 'Founder & CEO',
              },
              {
                '@type': 'Person',
                name: 'Muhammad Haseeb',
                jobTitle: 'Co-Founder',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: HOME_FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]}
      />

      {/* ── SECTION 1: PINNED HERO WITH SCROLL RUNWAY (Responsive on all screen sizes) ── */}
      <div
        ref={runwayRef}
        className="hero-runway relative"
        style={{ height: 'calc(100vh + var(--hero-runway, 120vh))' }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .hero-runway {
              --hero-runway: 120vh;
              height: calc(100vh + var(--hero-runway)) !important;
            }
          }
          @media (max-width: 1023px) {
            .hero-runway {
              --hero-runway: 0px;
              height: auto !important;
            }
          }
          @media (max-height: 719px) {
            .dh-hero-trust-row {
              display: none !important;
            }
          }
          @media (max-width: 559px) {
            .dh-hero-trust-row {
              white-space: normal !important;
              flex-wrap: wrap !important;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-runway {
              --hero-runway: 0px !important;
              height: auto !important;
            }
            .hero-runway > section {
              position: relative !important;
              height: auto !important;
              min-height: calc(100dvh - 4rem) !important;
            }
          }
        `}</style>
        <section
          ref={heroRef}
          data-hero="true"
          className="relative lg:sticky lg:top-0 lg:h-screen lg:min-h-0 flex flex-col lg:block border-b border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-page)]"
        >
          {/* Animated Hero Backdrop (Panorama Ribbon Wave) */}
          <HeroBackdrop heroRef={heroRef} />

          {/* ── HERO CONTENT WRAPPER ────────────────────────────────────────── */}
          <div
            className="order-1 w-full relative z-10 pt-24 sm:pt-28 pb-8 lg:p-0 lg:h-full lg:flex lg:flex-col lg:justify-center pointer-events-none"
            style={{
              '--dh-hero-btn-h': '54px',
              '--dh-hero-btn-radius': '999px',
            } as React.CSSProperties}
          >
            
            {/* ── DESKTOP LAYOUT (lg and up) ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              data-hero-desktop="true"
              className="hidden lg:flex lg:flex-col lg:justify-center pointer-events-auto"
              style={{
                width: 'min(56vw, 64rem)',
                minHeight: 'calc(100vh - var(--dh-nav-bottom, 72px))',
                paddingTop: 'calc(var(--dh-nav-bottom, 72px) + clamp(28px, 5vh, 56px))',
                paddingBottom: 'clamp(24px, 4.5vh, 48px)',
                paddingLeft: 'calc(var(--dh-gutter, clamp(16px, 3.5vw, 40px)) + 15px)',
                alignSelf: 'flex-start',
              }}
            >
              {/* 1. Scramble Headline Rotator (meta row, h1, sub-heading) */}
              <HeroRotator isButtonsHovered={buttonsHovered} />

              {/* 2. Buttons: Glass proposal button + See Our Work */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-[14px] w-fit"
                style={{
                  marginTop: 'clamp(24px, 4.4vh, 40px)',
                }}
                onMouseEnter={() => setButtonsHovered(true)}
                onMouseLeave={() => setButtonsHovered(false)}
              >
                <GlassCtaButton
                  to="/contact"
                  label={t('hero_v5_btn_proposal')}
                />

                <Link
                  to="/portfolio"
                  className="dh-hero-explore-btn group"
                >
                  <span className="dh-hero-explore-content">
                    <span>{t('hero_v5_btn_work')}</span>
                    <ArrowUpRight className="dh-hero-explore-icon" />
                  </span>
                </Link>
              </motion.div>

              {/* 3. Trust Row (ONE line, 3 items) */}
              <motion.div
                variants={itemVariants}
                className="dh-hero-trust-row flex items-center gap-x-[20px] select-none whitespace-nowrap"
                style={{
                  marginTop: 'clamp(16px, 3vh, 28px)',
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--brand-teal-text)] shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                    {t('hero_v6_trust_1') || 'Milestone guarantee'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--brand-teal-text)] shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                    {t('hero_v6_trust_2') || 'Verified specialists'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--brand-teal-text)] shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                    {t('hero_v6_trust_3') || 'Proposal in 24h'}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* ── MOBILE LAYOUT (< 1024px) ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="block lg:hidden w-full pointer-events-auto px-6"
            >
              <HeroRotator isButtonsHovered={buttonsHovered} />

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                style={{
                  marginTop: 'clamp(20px, 3.8vh, 32px)',
                }}
                onMouseEnter={() => setButtonsHovered(true)}
                onMouseLeave={() => setButtonsHovered(false)}
              >
                <GlassCtaButton
                  to="/contact"
                  label={t('hero_v5_btn_proposal')}
                  className="w-full sm:w-auto"
                />
                <Link
                  to="/portfolio"
                  className="dh-hero-explore-btn group w-full sm:w-auto"
                >
                  <span className="dh-hero-explore-content">
                    <span>{t('hero_v5_btn_work')}</span>
                    <ArrowUpRight className="dh-hero-explore-icon" />
                  </span>
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="dh-hero-trust-row flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 select-none"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--brand-teal-text)] shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                    {t('hero_v6_trust_1') || 'Milestone guarantee'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--brand-teal-text)] shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                    {t('hero_v6_trust_2') || 'Verified specialists'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--brand-teal-text)] shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                    {t('hero_v6_trust_3') || 'Proposal in 24h'}
                  </span>
                </div>
              </motion.div>
            </motion.div>

          </div>

          {/* HeroMediaColumns: order-2 on mobile (below text), absolute on desktop */}
          <div className="order-2 w-full lg:w-auto relative lg:static z-10 px-6 lg:px-0 pb-12 lg:pb-0 pointer-events-none">
            <HeroMediaColumns heroRef={heroRef} runwayRef={runwayRef} />
          </div>
        </section>
      </div>

      {/* ── SECTION 1.5: ABOUT US (BENTO GRID) ── */}
      <AboutSection />

      {/* ── SECTION 2: SERVICES OVERVIEW (2x2 CHECKERBOARD BENTO) ── */}
      <ServicesSection />

      {/* ── SECTION 3: THE MODEL ADVANTAGE / WHY DIGIHUST ── */}
      <ModelAdvantageSection />

      {/* ── SECTION 4: SELECTED WORK (Extracted Showcase) ── */}
      <WorkShowcaseSection />

      {/* ── SECTION 5: CLIENT FEEDBACK ── */}
      <HomeTestimonialsSection testimonials={testimonials} t={t} />

      {/* ── SECTION 6: FREQUENTLY ASKED QUESTIONS ── */}
      <section id="home-faq" className="py-24 px-6 lg:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-page)] relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[var(--text-body)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Everything you need to know about our coordinated specialist squads, milestone guarantees, and project delivery.
            </p>
          </div>

          <div className="space-y-4">
            {HOME_FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-teal)]/40 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-display font-bold text-base sm:text-lg text-[var(--text-heading)] focus:outline-none">
                  <span>{item.question}</span>
                  <ChevronDown className="w-5 h-5 text-[var(--brand-teal)] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-sm sm:text-base text-[var(--text-body)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CALL TO ACTION ── */}
      <section id="home-cta" className="py-24 px-6 lg:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-[var(--text-heading)] mb-4">
              {t('cta_heading')}
            </h2>
            <p className="text-lg text-[var(--text-body)] mb-10 max-w-xl mx-auto">
              {t('cta_sub')}
            </p>
            <div className="inline-block">
              <LavaProposalButton label={t('btn_start_proposal')} />
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
