import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Layers,
  ShieldCheck,
  Code2,
  Rocket,
} from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { useApp } from '../../context/AppContext';
import { ServiceFeatureRow } from '../ui/ServiceFeatureRow';
import { LavaProposalButton } from '../ui/LavaProposalButton';
import { DEFAULT_SITE_CONTENT } from '../../services/mockData';
import { SiteServiceItem } from '../../types';

// Import Slideshow Images
import slide1 from '../../assets/slideshow 1.avif';
import slide2 from '../../assets/slideshow 2.jpg';
import slide3 from '../../assets/slideshow 3.jpg';
import slide4 from '../../assets/slideshow 4.jpg';
import slide5 from '../../assets/slideshow 5.jpg';
import slide6 from '../../assets/slideshow 6.jpg';

// Import Delivery Model Step Images
import modelStep1 from '../../assets/model_step_1.png';
import modelStep2 from '../../assets/model_step_2.png';
import modelStep3 from '../../assets/model_step_3.png';
import modelStep4 from '../../assets/model_step_4.png';

const AUTOPLAY_MS = 3000;

const SLIDESHOW_ITEMS = [
  {
    id: 'development',
    image: slide1,
    badge: 'Engineering & Development',
    title: 'Full-Stack Web & Scalable App Architecture',
    tagline: 'High-performance Next.js & React platforms, custom APIs, and cloud infrastructure.',
    serviceTargetId: 'development',
  },
  {
    id: 'creative',
    image: slide2,
    badge: 'UI/UX & Brand Design',
    title: 'Visual Identity Systems & Product Experiences',
    tagline: 'Distinctive brand systems, Figma prototypes, and high-conversion UX designs.',
    serviceTargetId: 'creative',
  },
  {
    id: 'ai-automation',
    image: slide3,
    badge: 'AI & Workflow Automation',
    title: 'Custom LLM Agents & Operational Automations',
    tagline: 'Eliminating manual bottlenecks with custom AI chatbots, ETL pipelines, and API integrations.',
    serviceTargetId: 'ai-automation',
  },
  {
    id: 'marketing',
    image: slide4,
    badge: 'Search Engine Optimization',
    title: 'Data-Driven Growth & Targeted Outreach',
    tagline: 'Technical SEO audits, high-intent Google/Meta PPC, and targeted B2B lead pipelines.',
    serviceTargetId: 'marketing',
  },
  {
    id: 'cybersecurity',
    image: slide5,
    badge: 'Cybersecurity & Auditing',
    title: 'Penetration Testing & System Hardening',
    tagline: 'Systematic vulnerability assessments, OWASP hardening, and infrastructure protection.',
    serviceTargetId: 'cybersecurity',
  },
  {
    id: 'data-solutions',
    image: slide6,
    badge: 'Data Intelligence & BI',
    title: 'Executive Dashboards & Automated Analytics',
    tagline: 'PowerBI dashboards, SQL optimization, and automated executive intelligence suites.',
    serviceTargetId: 'data-solutions',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Capabilities' },
  { id: 'tech', label: 'Engineering & Apps' },
  { id: 'creative', label: 'Design & 3D' },
  { id: 'data', label: 'AI & Automations' },
  { id: 'growth', label: 'Growth & SEO' },
];

/**
 * Splits a title string into standard heading words and 2-3 accent words.
 */
function splitTitleTwoTone(title: string): { first: string; accent: string } {
  const words = title.trim().split(/\s+/);
  if (words.length <= 3) {
    return {
      first: words.slice(0, 1).join(' '),
      accent: words.slice(1).join(' '),
    };
  }
  const accentCount = words.length > 5 ? 3 : 2;
  return {
    first: words.slice(0, words.length - accentCount).join(' '),
    accent: words.slice(words.length - accentCount).join(' '),
  };
}

export const Services: React.FC = () => {
  const { siteContent } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const [, setActiveTileId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const rawServices: SiteServiceItem[] =
    siteContent?.services && siteContent.services.length >= 6
      ? siteContent.services
      : DEFAULT_SITE_CONTENT.services;

  const sortedServices = [...rawServices].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );

  // ── 3D COVER-FLOW HERO STATE ──
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideTimerKey, setSlideTimerKey] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isOffScreen, setIsOffScreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const heroSectionRef = useRef<HTMLElement>(null);
  const carouselBoxRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  // Measure carousel container width for responsive 3D card layout
  useEffect(() => {
    if (!carouselBoxRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(carouselBoxRef.current);
    return () => observer.disconnect();
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVis = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  // IntersectionObserver to pause autoplay when hero is off-screen
  useEffect(() => {
    if (!heroSectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOffScreen(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(heroSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Pause conditions: reduced motion, active drag, keyboard focus, tab hidden, or off-screen.
  // Hovering over cards NEVER pauses, resets, or touches the timer!
  const isAutoplayPaused =
    shouldReduceMotion ||
    isFocused ||
    isDragging ||
    isTabHidden ||
    isOffScreen;

  const resetAutoplayTimer = useCallback(() => {
    setSlideTimerKey((k) => k + 1);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlideIndex(index);
      resetAutoplayTimer();
    },
    [resetAutoplayTimer]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDESHOW_ITEMS.length);
    resetAutoplayTimer();
  }, [resetAutoplayTimer]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex(
      (prev) => (prev - 1 + SLIDESHOW_ITEMS.length) % SLIDESHOW_ITEMS.length
    );
    resetAutoplayTimer();
  }, [resetAutoplayTimer]);

  // Robust Autoslide loop every 3000ms (steady, immune to hover/re-renders)
  useEffect(() => {
    if (isAutoplayPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDESHOW_ITEMS.length);
      setSlideTimerKey((k) => k + 1);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isAutoplayPaused, slideTimerKey]);

  // Keyboard navigation for carousel region
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // Pointer / Drag gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current !== null) {
      const deltaX = e.clientX - dragStartX.current;
      if (deltaX > 45) {
        prevSlide();
      } else if (deltaX < -45) {
        nextSlide();
      }
      dragStartX.current = null;
    }
    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    dragStartX.current = null;
    setIsDragging(false);
  };

  const handleSelectServiceFromSlide = (targetId: string) => {
    const matched = sortedServices.find(
      (s) => s.id === targetId || s.slug === targetId || s.groupId === targetId
    );
    if (matched) {
      setActiveTileId(matched.id || matched.slug || null);
    }
    if (servicesSectionRef.current) {
      servicesSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const currentSlide = SLIDESHOW_ITEMS[currentSlideIndex];
  const { first: titleFirst, accent: titleAccent } = splitTitleTwoTone(
    currentSlide.title
  );

  // Responsive card dimensions (clamp(130px, 12vw, 220px) to comfortably fit arc on wide screens)
  const maxVisibleDistance =
    containerWidth >= 1100 ? 3 : containerWidth >= 768 ? 2 : 1;
  const cardWidth = Math.min(220, Math.max(130, containerWidth * 0.12));

  // Horizontal spacing: x = d * cardWidth * 0.85 for |d| = 1, then smaller steps further out
  const getXOffset = (d: number, w: number) => {
    if (d === 0) return 0;
    const sign = d > 0 ? 1 : -1;
    const absD = Math.abs(d);
    if (absD === 1) return sign * w * 0.85;
    if (absD === 2) return sign * (w * 0.85 + w * 0.70);
    return sign * (w * 0.85 + w * 0.70 + w * 0.55);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-body)]">
      <SEOHead
        title="Digital Services & Capabilities | DigiHust"
        description="Explore DigiHust's full range of services: Web Development, UI/UX Design, AI & Automations, Digital Marketing, Cybersecurity, and Data Intelligence."
      />

      {/* ── 1. FULL-PAGE HERO (NO ROUNDED CONTAINER, FULL-BLEED EDGE-TO-EDGE) ── */}
      <section
        ref={heroSectionRef}
        data-hero="true"
        className="w-full h-[100svh] min-h-[100svh] relative overflow-hidden flex flex-col justify-between items-center pt-[calc(var(--dh-nav-bottom,64px)+1.5rem)] pb-4 sm:pb-6 select-none"
      >
        {/* ── AMBIENT SKY / CLOUDY BACKGROUND (Edge to Edge, Light & Dark Matching Atmosphere) ── */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-0"
          aria-hidden="true"
        >
          {/* Vertical Sky Gradient Base: Pale accent-tinted blue at top, lighter mid, fading to page bg at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-teal)_14%,var(--bg-page))] via-[color-mix(in_srgb,var(--brand-teal)_5%,var(--bg-page))] to-[var(--bg-page)] dark:from-[var(--bg-surface)] dark:via-[#021c27] dark:to-[#01141c]" />

          {/* Cloud Ellipse 1 (White 75%, Upper-Left) */}
          <div
            className="absolute -top-12 -left-20 w-[520px] h-[260px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.45)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.16)_0%,rgba(31,122,140,0.06)_45%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftA 48s ease-in-out infinite alternate',
            }}
          />

          {/* Cloud Ellipse 2 (White 70%, Upper-Right) */}
          <div
            className="absolute top-[10%] -right-24 w-[560px] h-[280px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.70)_0%,rgba(255,255,255,0.40)_50%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.14)_0%,rgba(31,122,140,0.05)_50%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftB 56s ease-in-out 3s infinite alternate-reverse',
            }}
          />

          {/* Cloud Ellipse 3 (Accent Tinted 14%, Center-Left) */}
          <div
            className="absolute top-[28%] left-[6%] w-[460px] h-[220px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--brand-teal)_14%,transparent)_0%,color-mix(in_srgb,var(--brand-teal)_6%,transparent)_50%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.12)_0%,rgba(31,122,140,0.04)_50%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftC 44s ease-in-out 1s infinite alternate',
            }}
          />

          {/* Cloud Ellipse 4 (White 80%, Center-Right) */}
          <div
            className="absolute top-[38%] right-[8%] w-[500px] h-[250px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.45)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.12)_0%,rgba(31,122,140,0.04)_45%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftA 52s ease-in-out 6s infinite alternate-reverse',
            }}
          />

          {/* Cloud Ellipse 5 (White 65%, Lower-Left) */}
          <div
            className="absolute bottom-[16%] left-[14%] w-[480px] h-[240px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0.35)_50%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.10)_0%,rgba(31,122,140,0.03)_50%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftB 46s ease-in-out 2s infinite alternate',
            }}
          />

          {/* Cloud Ellipse 6 (Accent Tinted 12%, Lower-Right) */}
          <div
            className="absolute bottom-[10%] right-[16%] w-[420px] h-[210px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--brand-teal)_12%,transparent)_0%,color-mix(in_srgb,var(--brand-teal)_5%,transparent)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.10)_0%,rgba(31,122,140,0.03)_45%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftC 50s ease-in-out 4s infinite alternate-reverse',
            }}
          />

          {/* Cloud Ellipse 7 (White 85%, Mid-Center Layer) */}
          <div
            className="absolute top-[20%] left-[26%] w-[580px] h-[270px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.40)_50%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(31,122,140,0.14)_0%,rgba(31,122,140,0.04)_50%,transparent_75%)]"
            style={{
              animation: shouldReduceMotion
                ? 'none'
                : 'cloudDriftA 60s ease-in-out 8s infinite alternate',
            }}
          />

          {/* Soft Accent Glow Behind Active Card (Both Themes) */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[460px] h-48 bg-[color-mix(in_srgb,var(--brand-teal)_15%,transparent)] blur-3xl rounded-full" />

          {/* Bottom Gradient Fade Into Page Background (Eliminating hard lines) */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-page)] dark:from-[var(--bg-page)] via-[var(--bg-page)]/70 dark:via-[var(--bg-page)]/70 to-transparent pointer-events-none" />
        </div>

        {/* ── HERO CONTENT WRAPPER (Single flex column with paced gaps) ── */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-between z-10 min-h-0">
          {/* ── TOP BLOCK (Title, Subtitle, Buttons - Tag Removed) ── */}
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center flex-none">
            {/* Cross-fade title & subtitle with zero layout shift */}
            <div className="w-full min-h-[110px] sm:min-h-[125px] md:min-h-[140px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: 'easeOut' }
                  }
                  className="flex flex-col items-center text-center px-2"
                >
                  {/* Two-Tone Title (First element, tag removed) */}
                  <h2 className="font-display font-black text-[clamp(1.45rem,3.4vw,3.125rem)] text-[var(--text-heading)] tracking-tight leading-[1.12] max-w-3xl line-clamp-2">
                    <span>{titleFirst} </span>
                    <span className="text-[var(--brand-teal)] dark:text-cyan-400">
                      {titleAccent}
                    </span>
                  </h2>

                  {/* Subtitle */}
                  <p className="mt-[clamp(0.5rem,1.2vh,1rem)] text-[clamp(0.85rem,1.15vw,1.0625rem)] text-[var(--text-body)] max-w-[40rem] mx-auto line-clamp-2 leading-relaxed font-normal">
                    {currentSlide.tagline}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-[clamp(1.25rem,2.8vh,2rem)]">
              {/* Ghost Pill: Explore Deliverables */}
              <button
                type="button"
                onClick={() =>
                  handleSelectServiceFromSlide(currentSlide.serviceTargetId)
                }
                className="inline-flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-heading)] border border-[var(--border-subtle)] hover:border-[var(--brand-teal)]/50 text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>Explore Deliverables</span>
                <ChevronDown className="w-4 h-4 text-[var(--brand-teal)]" />
              </button>

              {/* Primary Pill: Start Project with contrasting arrow circle */}
              <Link
                to="/contact"
                className="group inline-flex items-center space-x-3 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[var(--brand-teal)]/25 transition-all hover:scale-102 active:scale-98"
              >
                <span>Start Project</span>
                <span className="w-7 h-7 rounded-full bg-slate-900/80 dark:bg-black/60 flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* ── CAROUSEL AREA (Fixed-ratio relative box, height clamp(210px, 32vh, 360px), cards inside) ── */}
          <div
            ref={carouselBoxRef}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Services 3D showcase carousel"
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="relative w-full h-[clamp(210px,32vh,360px)] flex-none mt-[clamp(1.5rem,3.8vh,3rem)] flex items-center justify-center overflow-visible focus:outline-none select-none z-10"
            style={{
              perspective: '1400px',
              transformStyle: 'preserve-3d',
            }}
          >
            {SLIDESHOW_ITEMS.map((slide, idx) => {
              const N = SLIDESHOW_ITEMS.length;
              let d = ((idx - currentSlideIndex) % N + N) % N;
              if (d > N / 2) d -= N;

              const isHidden = Math.abs(d) > maxVisibleDistance;
              const x = getXOffset(d, cardWidth);
              const y = d * d * 6;
              const z = -Math.abs(d) * 110;
              // About 20deg rotateY per step
              const rotateY = Math.max(-55, Math.min(55, -d * 20));
              // Center card is 12% larger than the sides (1.12 vs 1.0)
              const scale = d === 0 ? 1.12 : Math.max(0.72, 1.0 - 0.1 * Math.abs(d));
              const opacity = isHidden ? 0 : 1 - 0.2 * Math.abs(d);
              const zIndex = 10 - Math.abs(d);

              return (
                <div
                  key={slide.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    zIndex,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Slide ${idx + 1} of ${SLIDESHOW_ITEMS.length}: ${slide.title}`}
                    aria-current={idx === currentSlideIndex ? 'true' : undefined}
                    tabIndex={isHidden ? -1 : 0}
                    aria-hidden={isHidden ? 'true' : undefined}
                    initial={false}
                    animate={{
                      x,
                      y,
                      z,
                      rotateY,
                      scale,
                      opacity,
                    }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 160, damping: 22 }
                    }
                    style={{
                      transformStyle: 'preserve-3d',
                      willChange: 'transform',
                    }}
                    className={`pointer-events-auto w-[clamp(130px,12vw,220px)] aspect-[4/5] rounded-[18px] overflow-hidden cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-teal)] transition-shadow duration-300 relative select-none ${
                      d === 0
                        ? 'ring-2 ring-[var(--brand-teal)]/70 shadow-2xl shadow-black/40 border border-[var(--brand-teal)]/50 dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
                        : 'border border-[var(--border-subtle)] shadow-md hover:border-[var(--brand-teal)]/40'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading={idx === currentSlideIndex ? 'eager' : 'lazy'}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                    {/* Slide title shows only on center card and 2 nearest side cards (|d| <= 1). Tag removed. */}
                    {Math.abs(d) <= 1 && (
                      <div className="absolute inset-0 p-3 flex flex-col justify-end pointer-events-none">
                        <h3 className="font-display font-bold text-xs sm:text-sm text-white leading-snug line-clamp-2 drop-shadow text-left">
                          {slide.title}
                        </h3>
                      </div>
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* ── PAGINATION DOTS (Centered row below the carousel box, pause button removed) ── */}
          <div className="flex items-center justify-center space-x-2.5 mt-4 sm:mt-5 mb-1 z-20">
            {SLIDESHOW_ITEMS.map((item, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-10 sm:w-12 bg-slate-300 dark:bg-white/20'
                      : 'w-2 bg-slate-300 dark:bg-white/25 hover:bg-slate-400 dark:hover:bg-white/40'
                  }`}
                >
                  {/* Thin progress indicator filling over 3000ms */}
                  {isActive && (
                    <div
                      key={slideTimerKey}
                      className="absolute inset-0 bg-[var(--brand-teal)] origin-left rounded-full"
                      style={{
                        animation: isAutoplayPaused
                          ? 'none'
                          : 'dotProgress 3000ms linear forwards',
                        transform: isAutoplayPaused ? 'scaleX(1)' : undefined,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CHANGE 2: CENTERED HEADER AFTER THE HERO ── */}
      <section
        ref={servicesSectionRef}
        className="bg-[var(--bg-page)] pt-14 sm:pt-18 pb-6 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[var(--text-heading)] mb-4 text-center">
              Services Built for Execution.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-body)] max-w-2xl leading-relaxed mb-4 text-center mx-auto">
              Specialized domain squads delivered as one cohesive digital engine. Select any capability domain or expand specs to inspect dedicated rosters.
            </p>

            {/* Capability Filter Tabs (Hidden per reference design; retained for CMS/future use) */}
            <div
              className="hidden flex-wrap items-center justify-center gap-2 pt-2 pb-1"
              aria-hidden="true"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl font-sans font-semibold text-sm tracking-normal transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[var(--brand-teal)] text-white shadow-md border border-cyan-400/50'
                        : 'bg-[var(--bg-surface)] text-[var(--text-body)] hover:text-[var(--text-heading)] border border-[var(--border-subtle)] hover:border-[var(--brand-teal)]/50'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTIGUOUS CHECKERBOARD SERVICE LISTING ── */}
      <section className="bg-[var(--bg-page)] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto border border-[var(--border-subtle)] bg-[var(--bg-page)] shadow-xs overflow-hidden">
          {sortedServices.map((svc, index) => (
            <ServiceFeatureRow
              key={svc.id || svc.slug || index}
              service={svc}
              index={index}
              isFirst={index === 0}
            />
          ))}
        </div>
      </section>

      {/* ── SECTION: SQUAD ORCHESTRATION ARCHITECTURE ── */}
      <section className="bg-[var(--bg-page)] py-18 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)] relative overflow-hidden">
        {/* Soft Ambient Corner Glows */}
        <div
          className="absolute top-0 left-0 w-[450px] h-[450px] bg-gradient-to-br from-[#1F7A8C]/10 via-[#1F7A8C]/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-gradient-to-tl from-[#1F7A8C]/10 via-[#1F7A8C]/5 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-[var(--text-heading)] mb-4">
              How One Managed Contract Powers<br className="hidden sm:inline" />{' '}
              <span className="text-[var(--brand-teal)]">
                Multiple Specialized Squads
              </span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-[var(--text-body)] max-w-2xl mx-auto leading-relaxed">
              No freelancer chaos. No disconnected contractors. DigiHust delivers cross-functional squads under one accountable technical director.
            </p>
          </div>

          {/* 2x2 Grid of Illustrated Spec Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7 max-w-6xl mx-auto">
            {[
              {
                num: '01',
                icon: (
                  <Code2 className="w-5 h-5 text-[var(--brand-teal)] stroke-[2.2]" />
                ),
                title: 'Technical Scoping & Squad Assembly',
                desc: 'We align on goals, define the scope, and build the right squad for your project.',
                img: modelStep1,
              },
              {
                num: '02',
                icon: (
                  <Layers className="w-5 h-5 text-[var(--brand-teal)] stroke-[2.2]" />
                ),
                title: 'Parallel Sprint Execution',
                desc: 'Multiple squads work in sync, delivering faster and more efficiently.',
                img: modelStep2,
              },
              {
                num: '03',
                icon: (
                  <ShieldCheck className="w-5 h-5 text-[var(--brand-teal)] stroke-[2.2]" />
                ),
                title: 'Security Hardening & QA Audit',
                desc: 'We run continuous security scans and automated tests to ensure quality and stability.',
                img: modelStep3,
              },
              {
                num: '04',
                icon: (
                  <Rocket className="w-5 h-5 text-[var(--brand-teal)] stroke-[2.2]" />
                ),
                title: 'Clean Handover & SLA Assurance',
                desc: 'We deliver complete code, documentation, and support  backed by our 30-day warranty.',
                img: modelStep4,
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#073547] border border-slate-150/80 dark:border-white/10 shadow-[0_4px_24px_rgba(2,43,58,0.04)] dark:shadow-none hover:shadow-xl hover:border-[var(--brand-teal)]/40 transition-all duration-300 p-6 sm:p-7 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 overflow-hidden group select-none"
              >
                {/* Left Column: Specs & Copy */}
                <div className="w-full sm:w-[50%] flex flex-col justify-between shrink-0">
                  <div>
                    {/* Number Badge */}
                    <div className="w-fit px-3 py-0.5 rounded-full bg-[#E0F2F1] dark:bg-[#0b4156] text-[#00796B] dark:text-cyan-300 font-display font-extrabold text-xs tracking-wider mb-3.5">
                      {step.num}
                    </div>

                    {/* Step Icon */}
                    <div className="w-9 h-9 rounded-lg border border-[#1F7A8C]/35 dark:border-cyan-400/35 flex items-center justify-center text-[var(--brand-teal)] mb-3 bg-[#1F7A8C]/5 dark:bg-cyan-400/5">
                      {step.icon}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-lg sm:text-[19px] lg:text-xl text-[var(--text-heading)] leading-snug mb-2 group-hover:text-[var(--brand-teal)] transition-colors">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-xs sm:text-[13px] lg:text-sm text-[var(--text-body)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Right Column: Organic Illustrated Graphic */}
                <div className="w-full sm:w-[50%] flex items-center justify-center shrink-0">
                  <img
                    src={step.img}
                    alt={step.title}
                    width={220}
                    height={220}
                    loading="lazy"
                    decoding="async"
                    className="w-full max-w-[220px] sm:max-w-none h-auto object-contain transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHANGE 3: BOTTOM CTA BANNER WITH LAVA-STYLE "START A COMBINED SCOPE" BUTTON ── */}
      <section className="bg-[var(--bg-page)] py-20 px-6 lg:px-8 border-t border-[var(--border-subtle)] text-center">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] mb-4">
            Need a Multi-Disciplinary Squad?
          </h2>
          <p className="text-[var(--text-body)] mb-8 leading-relaxed max-w-xl mx-auto">
            Most projects require a combination of engineering, branding, and automation. We combine these disciplines seamlessly into one scope.
          </p>
          <div className="inline-block">
            <LavaProposalButton to="/contact" label="Start a Combined Scope" />
          </div>
        </div>
      </section>

      {/* ── INLINE CSS FOR KEYFRAME DRIFTS & PROGRESS BAR ── */}
      <style>{`
        @keyframes cloudDriftA {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(45px, 0, 0); }
          100% { transform: translate3d(-35px, 0, 0); }
        }
        @keyframes cloudDriftB {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-50px, 0, 0); }
          100% { transform: translate3d(40px, 0, 0); }
        }
        @keyframes cloudDriftC {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(35px, 0, 0); }
          100% { transform: translate3d(-40px, 0, 0); }
        }
        @keyframes dotProgress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};
