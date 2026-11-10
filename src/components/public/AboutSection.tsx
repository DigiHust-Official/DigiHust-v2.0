import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Lightbulb, ArrowUpRight, Headset } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AboutSection.css';

// Image placeholder configuration at top of file for easy swapping
export const ABOUT_IMAGE = {
  src: '/hero/business.webp',
  alt: 'DigiHust managed digital business services',
};

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

  // Count-up stats (100, 99.4, 24, 1 over 1.2s)
  const countCard1 = useCountUp(100, 0, 1200, isInView, isDe);
  const countCard2 = useCountUp(99.4, 1, 1200, isInView, isDe);
  const countCard3 = useCountUp(24, 0, 1200, isInView, isDe);
  const countCard4 = useCountUp(1, 0, 1200, isInView, isDe);

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
            <span>{t('about_eyebrow') || 'ABOUT US'}</span>
          </div>

          {/* Headline */}
          <h2 id="dh-about-heading" className="dh-about-title">
            <span className="dh-about-title-line">
              {t('about_title_1') || 'One accountable partner'}
            </span>
            <span className="dh-about-title-line">
              {t('about_title_2') || 'that builds, grows and secures'}{' '}
              <span className="dh-about-chip dh-about-chip-teal" aria-hidden="true">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
              </span>
            </span>
            <span className="dh-about-title-line dh-about-title-muted">
              {t('about_title_3_prefix') || 'your'}{' '}
              <span className="dh-about-chip dh-about-chip-amber" aria-hidden="true">
                <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.2} />
              </span>{' '}
              {t('about_title_3_suffix') || 'digital business'}
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
          {/* CARD 1: Large Image Frame (spans 2 columns and 2 rows on desktop) */}
          <motion.article
            className="dh-about-card dh-about-card-hero"
            variants={cardVariants}
            aria-label={t('about_card1_link') || 'Learn more about DigiHust'}
          >
            <img
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              className="dh-about-hero-img"
              loading="lazy"
            />
            <div className="dh-about-hero-overlay" aria-hidden="true" />

            {/* Top-Right Action Link */}
            <Link
              to="/about"
              className="dh-about-link-btn"
              aria-label={t('about_card1_link') || 'Learn more about DigiHust'}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
            </Link>

            {/* Inset Translucent Bottom Panel */}
            <div className="dh-about-card1-panel">
              <span className="dh-about-card1-stat">{countCard1}%</span>
              <div className="dh-about-card1-label">
                {t('metric_talent') || 'Verified domain specialists'}
              </div>
            </div>
          </motion.article>

          {/* CARD 2: Milestone Delivery (Surface Card) */}
          <motion.article
            className="dh-about-card dh-about-card-delivery"
            variants={cardVariants}
          >
            <div>
              <div className="dh-about-card-label">
                {t('metric_delivery') || 'On-time milestone delivery'}
              </div>
              <div className="dh-about-stat mt-1">
                {countCard2}%
              </div>
              <div className="dh-about-avatars-row">
                <div className="dh-about-avatar-cluster" aria-hidden="true">
                  <div className="dh-about-avatar dh-about-avatar-1">MA</div>
                  <div className="dh-about-avatar dh-about-avatar-2">MH</div>
                  <div className="dh-about-avatar dh-about-avatar-3">SK</div>
                  <div className="dh-about-avatar dh-about-avatar-4">QA</div>
                </div>
                <span className="dh-about-avatar-counter">
                  {t('about_card2_counter') || '+12 specialists'}
                </span>
              </div>
            </div>

            <p className="dh-about-statement">
              {t('about_card2_statement') || 'Fixed milestones, clear scope, delivery you can measure.'}
            </p>
          </motion.article>

          {/* CARD 3: Proposal Turnaround (Accent Card) */}
          <motion.article
            className="dh-about-card dh-about-card-turnaround"
            variants={cardVariants}
          >
            <div>
              <div className="dh-about-card-label">
                {t('metric_turnaround') || 'Quote proposal turnaround'}
              </div>
              <div className="dh-about-stat mt-1">
                {countCard3}h
              </div>
            </div>
            <p className="dh-about-caption">
              {t('metric_turnaround_sub') || 'Rapid scope assessment'}
            </p>
          </motion.article>

          {/* CARD 4: Point of Contact (Dark Card) */}
          <motion.article
            className="dh-about-card dh-about-card-contact"
            variants={cardVariants}
          >
            <div>
              <div className="dh-about-card-label">
                {t('metric_contact') || 'Point of contact per project'}
              </div>
              <div className="dh-about-stat mt-1">
                {countCard4}
              </div>
            </div>

            <div>
              <p className="dh-about-caption">
                {t('metric_contact_sub') || 'No freelancer juggling'}
              </p>
            </div>

            {/* Decorative Headset Icon */}
            <div className="dh-about-contact-btn" aria-hidden="true">
              <Headset className="w-4 h-4" strokeWidth={2.2} />
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
