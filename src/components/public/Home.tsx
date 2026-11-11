import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useReducedMotion, type Variants } from 'framer-motion';
import {
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
  },
  {
    quote: 'The 3D promotional trailers and brand system produced by DigiHust established our electric vehicle startup as an immediate serious contender in Europe.',
    name: 'Markus Vogel',
    role: 'Chief Brand Officer',
    company: 'Veloce Motors DE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rating: 5,
  },
  {
    quote: 'Their AI squad built an automated tracking bot that resolved 78% of our customer tickets within seconds. Our support team can finally focus on VIP accounts.',
    name: 'Sarah Chen',
    role: 'Head of Operations',
    company: 'LogiXpress Global',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
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
      <section id="feedback" data-hard-stop="feedback" className="py-24 px-6 lg:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <p className="text-xs font-extrabold text-[var(--brand-teal-text)] uppercase tracking-widest mb-3">
              {t('testimonials_tag')}
            </p>
            <div className="inline-block relative">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] mb-3">
                {t('testimonials_heading')}
              </h2>
              <div className="w-16 h-[2px] bg-[var(--brand-teal)] mx-auto mb-4" />
            </div>
            <p className="text-[var(--text-body)] text-sm">
              {t('testimonials_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-4 items-stretch">
            {testimonials.slice(0, 3).map((tItem: any, idx: number) => {
              const isMiddle = idx === 1;
              const initials = (tItem.name || 'DH')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <figure
                  key={tItem.id || tItem.name || idx}
                  className={`relative rounded-[20px] shadow-md p-7 pt-12 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl select-none ${
                    isMiddle
                      ? 'bg-[#E3EFF3] dark:bg-[#0c4458] text-[var(--text-body)] dark:text-white border border-[#1F7A8C]/35 dark:border-[#22A0B4]/40 shadow-lg'
                      : 'bg-[var(--bg-surface)] text-[var(--text-body)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {/* Overlapping 72px Circular Avatar (-top-9) with 4px surface-colored ring */}
                  <div className="absolute -top-9 left-7">
                    {tItem.avatarUrl || tItem.avatar ? (
                      <img
                        src={tItem.avatarUrl || tItem.avatar}
                        alt={tItem.name}
                        width={72}
                        height={72}
                        loading="lazy"
                        decoding="async"
                        className={`w-[72px] h-[72px] rounded-full object-cover ring-4 ${
                          isMiddle ? 'ring-[#E3EFF3] dark:ring-[#0c4458]' : 'ring-[var(--bg-surface)]'
                        } shadow-md`}
                      />
                    ) : (
                      <div
                        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center font-display font-bold text-lg ring-4 ${
                          isMiddle
                            ? 'bg-[#1F7A8C] text-white ring-[#E3EFF3] dark:ring-[#0c4458]'
                            : 'bg-[#1F7A8C]/15 dark:bg-cyan-400/20 text-[#1F7A8C] dark:text-cyan-300 ring-[var(--bg-surface)]'
                        } shadow-md`}
                      >
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Body with Accent Quote Glyph */}
                  <div>
                    {/* Brand Accent Quote Glyph in Outfit */}
                    <div
                      className={`font-display font-extrabold leading-none mb-3 select-none ${
                        isMiddle
                          ? 'text-[#1F7A8C] dark:text-cyan-300 text-5xl sm:text-6xl'
                          : 'text-[var(--brand-teal-text)] text-4xl sm:text-5xl'
                      }`}
                      aria-hidden="true"
                    >
                      &ldquo;
                    </div>

                    <blockquote
                      className={`font-sans text-[15px] sm:text-[16px] leading-[1.6] mb-6 ${
                        isMiddle ? 'text-[var(--text-body)] dark:text-white/90' : 'text-[var(--text-body)]'
                      }`}
                    >
                      &ldquo;{tItem.quote}&rdquo;
                    </blockquote>
                  </div>

                  {/* Figcaption with semibold name and muted role */}
                  <figcaption
                    className={`pt-4 border-t ${
                      isMiddle ? 'border-[#1F7A8C]/20 dark:border-white/15' : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className={`font-semibold text-sm ${isMiddle ? 'text-[var(--text-heading)] dark:text-white' : 'text-[var(--text-heading)]'}`}>
                      {tItem.name}
                    </div>
                    <div className={`text-xs ${isMiddle ? 'text-[var(--text-muted)] dark:text-white/70' : 'text-[var(--text-muted)]'}`}>
                      {tItem.role}{tItem.company ? `, ${tItem.company}` : ''}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FREQUENTLY ASKED QUESTIONS ── */}
      <section className="py-24 px-6 lg:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-page)] relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-extrabold text-[var(--brand-teal-text)] uppercase tracking-widest mb-3">
              Clear Answers
            </p>
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
      <section className="py-24 px-6 lg:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-center relative overflow-hidden">
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
