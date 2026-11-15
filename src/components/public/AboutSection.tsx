import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_USERS } from '../../services/mockData';
import logo96 from '../../assets/logo-96.webp';
import logo192 from '../../assets/logo-192.webp';
import { Avatar } from '../common/Avatar';
import { StarRating } from '../common/StarRating';
import './AboutSection.css';

// 1. Image placeholder configuration at top of file for easy swapping
export const ABOUT_IMAGE = {
  src: '/hero/business-sm.webp',
  alt: 'DigiHust managed digital business services',
};

// 2. Data-driven filter of verified non-intern team members
const ALLOWED_ROLE_PATTERN = /\b(specialist|freelancer|expert|management|manager|lead|head|director|founder|ceo|cto|coo|chief|principal)\b/i;
const EXCLUDED_ROLE_PATTERN = /\b(intern|trainee|apprentice)\b/i;

export const ALLOWED_MEMBERS = INITIAL_USERS.filter((user) => {
  const combined = `${user.role || ''} ${user.roleTier || ''} ${user.title || ''}`;
  if (EXCLUDED_ROLE_PATTERN.test(combined)) return false;
  return ALLOWED_ROLE_PATTERN.test(combined);
});

// Big number = count of ALLOWED members from data-driven filter
// TODO: When full team directory is populated in mockData, TEAM_COUNT will automatically reflect the total verified specialists
export const TEAM_COUNT = ALLOWED_MEMBERS.length;

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

  // Count-up stats: 20 (Card 1), ALLOWED team count (Card 2), 4.8 (Card 3)
  const countCard1 = useCountUp(20, 0, 1200, isInView, isDe);
  const countCard2 = useCountUp(TEAM_COUNT, 0, 1200, isInView, isDe);
  const countCard3 = useCountUp(4.8, 1, 1200, isInView, isDe);

  const displayAvatars = ALLOWED_MEMBERS.slice(0, 5);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
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
            <span>{t('about_eyebrow') || 'About us'}</span>
          </div>

          {/* Headline (Outfit 500, centered, 3 lines) */}
          <h2 id="dh-about-heading" className="dh-about-title">
            <span className="dh-about-title-line">
              {t('about_title_1') || 'One accountable partner'}
            </span>
            <span className="dh-about-title-line">
              {t('about_title_2') || 'that builds, grows and secures'}
            </span>
            <span className="dh-about-title-line dh-about-title-muted">
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
          {/* CARD 1: Rich Brand Image Card */}
          <motion.article
            className="dh-about-card dh-about-card-hero"
            variants={cardVariants}
            aria-label={t('about_card1_caption') || 'Projects delivered across web, AI, growth and security'}
          >
            <img
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              width={560}
              height={700}
              className="dh-about-hero-img"
              loading="lazy"
              decoding="async"
            />
            <div className="dh-about-hero-overlay" aria-hidden="true" />

            {/* Top-Left Brand Logo & Wordmark */}
            <div className="dh-about-hero-logo" aria-hidden="true">
              <img
                src={logo96}
                srcSet={`${logo96} 1x, ${logo192} 2x`}
                alt="DigiHust Logo"
                width={24}
                height={24}
                decoding="async"
                loading="lazy"
              />
              <span className="dh-about-hero-wordmark">DigiHust</span>
            </div>

            {/* Top-Right 36px rounded-square button (radius 11px) */}
            <Link
              to="/portfolio"
              className="dh-about-square-btn dh-about-card1-btn"
              aria-label={t('about_card1_link') || 'See our work'}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
            </Link>

            {/* Inset Translucent Bottom Glass Panel */}
            <div className="dh-about-card1-panel">
              <div className="dh-about-card1-stat">{countCard1}+</div>
              <p className="dh-about-card1-caption">
                {t('about_card1_caption') || 'Projects delivered across web, AI, growth and security'}
              </p>
            </div>
          </motion.article>

          {/* CARD 2: Domain Experts */}
          <motion.article
            className="dh-about-card dh-about-card-delivery"
            variants={cardVariants}
          >
            {/* TOP Cluster */}
            <div className="dh-about-card-top">
              <div className="dh-about-card-label">
                {t('about_card2_label') || 'Domain experts'}
              </div>
              <div className="dh-about-stat">
                {countCard2}
              </div>
            </div>

            {/* BOTTOM Cluster (pinned with margin-top: auto) */}
            <div className="dh-about-card-bottom">
              <div className="dh-about-avatars-row">
                <div className="dh-about-avatar-cluster" aria-hidden="true">
                  {displayAvatars.map((member) => (
                    <Avatar
                      key={member.id}
                      name={member.name}
                      src={member.avatarUrl}
                      size={44}
                      className="dh-about-avatar-item"
                    />
                  ))}
                </div>
              </div>
              <p className="dh-about-statement">
                {t('about_card2_text') || 'Verified specialists trained through Digiskill, each owning their craft end to end.'}
              </p>
            </div>
          </motion.article>

          {/* CARD 3: Our Approach (Orange Card) */}
          <motion.article
            className="dh-about-card dh-about-card-turnaround"
            variants={cardVariants}
          >
            {/* TOP Cluster */}
            <div className="dh-about-card-top dh-about-card-top-with-btn">
              <div className="dh-about-card-label">
                {t('about_card4_label') || 'Our approach'}
              </div>

              {/* Action Button at TOP-RIGHT, avoiding bottom-right floating CTA */}
              <Link
                to="/contact"
                className="dh-about-square-btn dh-about-card-turnaround-btn"
                aria-label={t('about_card4_link') || 'Start a project with DigiHust'}
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
              </Link>
            </div>

            {/* Statement directly under label */}
            <p className="dh-about-approach-text">
              {t('about_card4_heading') || 'We find the real business problems, then build the solution.'}
            </p>

            {/* BOTTOM Cluster: Caption */}
            <div className="dh-about-card-bottom">
              <p className="dh-about-approach-caption">
                {t('about_card4_caption') || 'Problem first, tools second.'}
              </p>
            </div>
          </motion.article>

          {/* CARD 4: Customer Satisfaction (White Card) */}
          <motion.article
            className="dh-about-card dh-about-card-contact"
            variants={cardVariants}
          >
            {/* TOP Cluster */}
            <div className="dh-about-card-top">
              <div className="dh-about-card-label">
                {t('about_card3_label') || 'Customer satisfaction'}
              </div>
              <div className="dh-about-stat flex items-baseline">
                <span>{countCard3}</span>
                <span className="dh-about-stat-unit">/5</span>
              </div>
            </div>

            {/* BOTTOM Cluster */}
            <div className="dh-about-card-bottom">
              <div className="dh-about-stars-row">
                <StarRating
                  value={4.8}
                  max={5}
                  size={18}
                  color="#1F7A8C"
                  emptyColor="rgba(10,31,43,0.25)"
                  ariaLabel={t('about_card3_stars_aria') || 'Rated 4.8 out of 5'}
                />
              </div>

              <p className="dh-about-caption">
                {t('about_card3_caption') || 'Based on 40+ client reviews'}
              </p>
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
