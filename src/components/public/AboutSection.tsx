import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AboutSection.css';

// 1. Image placeholder configuration at top of file for easy swapping
export const ABOUT_IMAGE = {
  src: '/hero/business.webp',
  alt: 'DigiHust managed digital business services',
};

// 2. Verified team member count (25 members in INITIAL_USERS from mockData.ts)
export const TEAM_COUNT = 25;

// 3. Real team member profile picture avatars from mockData / local assets
export const AVATARS = [
  {
    src: 'https://ptvchzbzokyumeizsuge.supabase.co/storage/v1/object/public/avatars/usr-ceo-1.png?t=1788198288702',
    alt: 'Mahad Abbas - Founder & CEO',
    initials: 'MA',
  },
  {
    src: 'https://ptvchzbzokyumeizsuge.supabase.co/storage/v1/object/public/avatars/usr-1788019490206.jpeg?t=1788310223059',
    alt: 'Muhammad Haseeb - Co-founder',
    initials: 'MH',
  },
  {
    src: 'https://ptvchzbzokyumeizsuge.supabase.co/storage/v1/object/public/avatars/usr-1788119130873.png?t=1788253088287',
    alt: 'Waliha Idrees - Creative Designer',
    initials: 'WI',
  },
  {
    src: 'https://ptvchzbzokyumeizsuge.supabase.co/storage/v1/object/public/avatars/usr-1788091129048.jpg?t=1788202106880',
    alt: 'Fiza Shoaib - AI & UI/UX Specialist',
    initials: 'FS',
  },
  {
    src: 'https://ptvchzbzokyumeizsuge.supabase.co/storage/v1/object/public/avatars/usr-1788086854546.jpg?t=1788285469759',
    alt: 'Muhammad Ammar - Full-Stack Developer',
    initials: 'MA',
  },
];

function useCountUp(target: number, decimals: number, duration: number, inView: boolean, isDe: boolean) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    const formatted = (0).toFixed(decimals);
    return isDe ? formatted.replace('.', ',') : formatted;
  });

  useEffect(() => {
    if (!inView) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const formatted = target.toFixed(decimals);
      setDisplayValue(isDe ? formatted.replace('.', ',') : formatted);
      return;
    }

    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;
      const formatted = current.toFixed(decimals);
      setDisplayValue(isDe ? formatted.replace('.', ',') : formatted);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        const finalFormatted = target.toFixed(decimals);
        setDisplayValue(isDe ? finalFormatted.replace('.', ',') : finalFormatted);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, decimals, duration, inView, isDe]);

  return displayValue;
}

export const AboutSection: React.FC = () => {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });
  const isDe = language === 'de';

  // Count-up stats: 20 (Card 1), 25 (Card 2), 4.8 (Card 3)
  const countCard1 = useCountUp(20, 0, 1200, isInView, isDe);
  const countCard2 = useCountUp(TEAM_COUNT, 0, 1200, isInView, isDe);
  const countCard3 = useCountUp(4.8, 1, 1200, isInView, isDe);

  const containerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      data-hard-stop="about"
      aria-labelledby="dh-about-heading"
      className="dh-about-section"
    >
      <div className="dh-about-container">
        {/* Header Block */}
        <motion.div
          className="dh-about-header"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Eyebrow */}
          <div className="dh-about-eyebrow">
            <span className="dh-about-eyebrow-dot" aria-hidden="true" />
            <span>{t('about_eyebrow') || 'About us'}</span>
          </div>

          {/* Headline (Outfit 500, centered, 3 lines) */}
          <h2 id="dh-about-heading" className="dh-about-title">
            <span className="dh-about-title-line">
              {t('about_title_1') || 'One accountable partner'}
            </span>
            <span className="dh-about-title-line">
              {t('about_title_2') || 'that builds, grows and secures'}{' '}
              <span className="dh-about-chip dh-about-chip-teal" aria-hidden="true" />
            </span>
            <span className="dh-about-title-line dh-about-title-muted">
              <span className="dh-about-chip dh-about-chip-coral" aria-hidden="true" />{' '}
              {t('about_title_3') || 'your digital business'}
            </span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="dh-about-bento"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* CARD 1: Rich Brand Image Card (Spans 2 columns and 2 rows on desktop) */}
          <motion.article
            className="dh-about-card dh-about-card-hero"
            variants={cardVariants}
            aria-label={t('about_card1_caption') || 'Projects delivered across web, AI, growth and security'}
          >
            <img
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              className="dh-about-hero-img"
              loading="lazy"
            />
            <div className="dh-about-hero-overlay" aria-hidden="true" />

            {/* Top-Left Brand Logo & Wordmark */}
            <div className="dh-about-hero-logo" aria-hidden="true">
              <img src="/logo.png" alt="DigiHust Logo" />
              <span className="dh-about-hero-wordmark">DigiHust</span>
            </div>

            {/* Top-Right Action Link */}
            <Link
              to="/portfolio"
              className="dh-about-link-btn"
              aria-label={t('about_card1_link') || 'See our work'}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
            </Link>

            {/* Inset Translucent Bottom Glass Panel */}
            <div className="dh-about-card1-panel">
              <div className="dh-about-card1-stat">{countCard1}+</div>
              <p className="dh-about-card1-caption">
                {t('about_card1_caption') || 'Projects delivered across web, AI, growth and security'}
              </p>
              <Link to="/portfolio" className="dh-about-card1-sublink">
                <span>{t('about_card1_link') || 'See our work'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.4} />
              </Link>
            </div>
          </motion.article>

          {/* CARD 2: Domain Experts (Surface Card with 5 Real Team Member Avatars) */}
          <motion.article
            className="dh-about-card dh-about-card-delivery"
            variants={cardVariants}
          >
            <div>
              <div className="dh-about-card-label">
                {t('about_card2_label') || 'Domain experts'}
              </div>
              <div className="dh-about-stat mt-1">
                {countCard2}
              </div>
              <div className="dh-about-avatars-row">
                <div className="dh-about-avatar-cluster" aria-hidden="true">
                  {AVATARS.map((avatar, idx) => (
                    <img
                      key={idx}
                      src={avatar.src}
                      alt={avatar.alt}
                      className="dh-about-avatar-img"
                      loading="lazy"
                      onError={(e) => {
                        // Safe fallback to initials avatar SVG if external image fails
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="dh-about-statement">
              {t('about_card2_text') || 'Verified specialists trained through Digiskill, each owning their craft end to end.'}
            </p>
          </motion.article>

          {/* CARD 3: Customer Satisfaction (Warm Aura Accent Card) */}
          <motion.article
            className="dh-about-card dh-about-card-turnaround"
            variants={cardVariants}
          >
            <div>
              <div className="dh-about-card-label">
                {t('about_card3_label') || 'Customer satisfaction'}
              </div>
              <div className="dh-about-stat mt-1 flex items-baseline">
                <span>{countCard3}</span>
                <span className="dh-about-stat-unit">/5</span>
              </div>
              <div className="dh-about-stars-row" aria-label="Rating 4.8 out of 5 stars">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                ))}
                <Star className="w-3.5 h-3.5 fill-current opacity-60" strokeWidth={1.5} />
              </div>
            </div>

            <p className="dh-about-caption">
              {t('about_card3_caption') || 'Overall rating from our clients'}
            </p>
          </motion.article>

          {/* CARD 4: Our Approach (High-Contrast Monochrome Card, Button Top-Right) */}
          <motion.article
            className="dh-about-card dh-about-card-contact"
            variants={cardVariants}
          >
            <div>
              <div className="dh-about-card-label">
                {t('about_card4_label') || 'Our approach'}
              </div>

              {/* Action Button at TOP-RIGHT, avoiding bottom-right floating CTA */}
              <Link
                to="/contact"
                className="dh-about-card4-btn"
                aria-label={t('about_card4_link') || 'Start a project with DigiHust'}
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
              </Link>
            </div>

            <div>
              <p className="dh-about-approach-text">
                {t('about_card4_heading') || 'We find the real business problems, then build the solution.'}
              </p>
              <p className="dh-about-approach-caption">
                {t('about_card4_caption') || 'Problem first, tools second.'}
              </p>
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
