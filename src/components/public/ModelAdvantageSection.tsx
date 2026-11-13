import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MessageSquareX,
  Clock,
  ArrowLeftRight,
  TrendingDown,
  UserCheck,
  Layers,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ModelAdvantageSection.css';

// Ease tuple typed explicitly to satisfy framer-motion Variant typing (audit ISS-09)
const EASE_TUPLE: readonly [number, number, number, number] = [0.2, 0.8, 0.2, 1];

interface PainItem {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
}

interface BenefitItem {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
}

const PAINS: PainItem[] = [
  {
    icon: MessageSquareX,
    titleKey: 'model_v2_pain_1_title',
    descKey: 'model_v2_pain_1_desc',
  },
  {
    icon: Clock,
    titleKey: 'model_v2_pain_2_title',
    descKey: 'model_v2_pain_2_desc',
  },
  {
    icon: ArrowLeftRight,
    titleKey: 'model_v2_pain_3_title',
    descKey: 'model_v2_pain_3_desc',
  },
  {
    icon: TrendingDown,
    titleKey: 'model_v2_pain_4_title',
    descKey: 'model_v2_pain_4_desc',
  },
];

const BENEFITS: BenefitItem[] = [
  {
    icon: UserCheck,
    titleKey: 'model_v2_benefit_1_title',
    descKey: 'model_v2_benefit_1_desc',
  },
  {
    icon: Layers,
    titleKey: 'model_v2_benefit_2_title',
    descKey: 'model_v2_benefit_2_desc',
  },
  {
    icon: ShieldCheck,
    titleKey: 'model_v2_benefit_3_title',
    descKey: 'model_v2_benefit_3_desc',
  },
  {
    icon: Award,
    titleKey: 'model_v2_benefit_4_title',
    descKey: 'model_v2_benefit_4_desc',
  },
];

const ROLES = [
  { key: 'model_v2_role_designer', fallback: 'Designer', classModifier: 'c1', hasWarn: false },
  { key: 'model_v2_role_developer', fallback: 'Developer', classModifier: 'c2', hasWarn: true },
  { key: 'model_v2_role_copywriter', fallback: 'Copywriter', classModifier: 'c3', hasWarn: false },
  { key: 'model_v2_role_seo', fallback: 'SEO', classModifier: 'c4', hasWarn: true },
  { key: 'model_v2_role_qa', fallback: 'QA', classModifier: 'c5', hasWarn: false },
];

export function ModelAdvantageSection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Entrance variants
  const containerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: EASE_TUPLE as unknown as [number, number, number, number],
      },
    },
  };

  // Ordered chip sequential entrance
  const orderChipVariants: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 8,
    },
    visible: (idx: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: shouldReduceMotion ? 0 : 0.18 + idx * 0.05,
        ease: EASE_TUPLE as unknown as [number, number, number, number],
      },
    }),
  };

  const headingA = t('model_v2_heading_a') || 'Not five freelancers.';
  const headingB = t('model_v2_heading_b') || 'One accountable team.';
  const subtext = t('model_v2_subtext') || 'One contract, one invoice, one team that answers for the result.';

  return (
    <section
      id="why-digihust"
      data-hard-stop="why-digihust"
      className="dh-model-v2"
      aria-labelledby="dh-model-v2-heading"
    >
      {/* Visually hidden paragraph for SEO and Screen Readers preserving original model copy */}
      <p className="sr-only">
        {t('model_p1')} {t('model_p2')}
      </p>

      <div className="dh-model-v2__container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {/* ── HEADER (Centered) ── */}
          <motion.div className="dh-model-v2__header" variants={itemVariants}>
            <h2 id="dh-model-v2-heading" className="dh-model-v2__title">
              <span className="dh-model-v2__title-primary">{headingA}</span>{' '}
              <span className="dh-model-v2__title-accent">{headingB}</span>
            </h2>
            <p className="dh-model-v2__subtext">{subtext}</p>
          </motion.div>

          {/* ── COMPARISON ROW ── */}
          <div className="dh-model-v2__comparison">
            {/* LEFT PANEL: Hiring Freelancers Yourself (Muted, Chaotic) */}
            <motion.div
              className="dh-model-v2__panel dh-model-v2__panel--left"
              variants={itemVariants}
            >
              <div className="dh-model-v2__panel-header">
                <h3 className="dh-model-v2__panel-title">
                  {t('model_v2_left_title') || 'Hiring freelancers yourself'}
                </h3>
                <span className="dh-model-v2__panel-badge">Fragmented</span>
              </div>

              {/* 5 equal-size role chips on a thin dashed line */}
              <div className="dh-model-v2__infographic dh-model-v2__infographic--left" aria-hidden="true">
                {/* Thin dashed horizontal line across the center of chips */}
                <div className="dh-model-v2__dashed-track" />

                <div className="dh-model-v2__chips-grid">
                  {ROLES.map((role, idx) => (
                    <motion.div
                      key={role.key}
                      custom={idx}
                      variants={orderChipVariants}
                      className="dh-model-v2__chip dh-model-v2__chip--left"
                    >
                      {role.hasWarn && (
                        <AlertTriangle className="dh-model-v2__chip-warn" />
                      )}
                      <span className="truncate">{t(role.key) || role.fallback}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 4 Pain Points (2x2 Grid) */}
              <div className="dh-model-v2__grid">
                {PAINS.map((pain) => {
                  const Icon = pain.icon;
                  return (
                    <div key={pain.titleKey} className="dh-model-v2__item">
                      <div className="dh-model-v2__item-icon-wrap dh-model-v2__item-icon-wrap--muted">
                        <Icon className="dh-model-v2__item-icon" />
                      </div>
                      <div className="dh-model-v2__item-content">
                        <h4 className="dh-model-v2__item-title dh-model-v2__item-title--muted">
                          {t(pain.titleKey)}
                        </h4>
                        <p className="dh-model-v2__item-desc">
                          {t(pain.descKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CENTER DIVIDER (Desktop & Tablet) */}
            <div className="dh-model-v2__divider" aria-hidden="true">
              <div className="dh-model-v2__divider-line" />
              <div className="dh-model-v2__divider-circle">
                <ArrowRight className="dh-model-v2__divider-arrow" />
              </div>
            </div>

            {/* RIGHT PANEL: Working with DigiHust (Ordered, Accented) */}
            <motion.div
              className="dh-model-v2__panel dh-model-v2__panel--right"
              variants={itemVariants}
            >
              <div className="dh-model-v2__panel-header">
                <h3 className="dh-model-v2__panel-title">
                  {t('model_v2_right_title') || 'Working with DigiHust'}
                </h3>
                <span className="dh-model-v2__panel-badge">Managed Squad</span>
              </div>

              {/* Ordered Visual: Hub Node connected down to 5 aligned chips with straight connector lines */}
              <div className="dh-model-v2__infographic dh-model-v2__infographic--right" aria-hidden="true">
                {/* Central DigiHust Node */}
                <div className="dh-model-v2__hub-node">
                  <span className="dh-model-v2__hub-node-dot" />
                  <span>DigiHust Lead</span>
                </div>

                {/* Straight tree connector lines meeting chip centers at 10%, 30%, 50%, 70%, 90% */}
                <svg
                  className="dh-model-v2__order-svg"
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                >
                  {/* Vertical drop from hub */}
                  <line x1="50" y1="0" x2="50" y2="12" className="dh-model-v2__order-line" />
                  {/* Horizontal distribution bus */}
                  <line x1="10" y1="12" x2="90" y2="12" className="dh-model-v2__order-line" />
                  {/* Vertical branches meeting each chip's center */}
                  <line x1="10" y1="12" x2="10" y2="24" className="dh-model-v2__order-line" />
                  <line x1="30" y1="12" x2="30" y2="24" className="dh-model-v2__order-line" />
                  <line x1="50" y1="12" x2="50" y2="24" className="dh-model-v2__order-line" />
                  <line x1="70" y1="12" x2="70" y2="24" className="dh-model-v2__order-line" />
                  <line x1="90" y1="12" x2="90" y2="24" className="dh-model-v2__order-line" />
                </svg>

                {/* Straight aligned row of 5 chips on CSS grid */}
                <div className="dh-model-v2__chips-grid">
                  {ROLES.map((role, idx) => (
                    <motion.div
                      key={role.key}
                      custom={idx}
                      variants={orderChipVariants}
                      className="dh-model-v2__chip dh-model-v2__chip--right"
                    >
                      <span className="truncate">{t(role.key) || role.fallback}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 4 Benefits (2x2 Grid) */}
              <div className="dh-model-v2__grid">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.titleKey} className="dh-model-v2__item">
                      <div className="dh-model-v2__item-icon-wrap dh-model-v2__item-icon-wrap--accent">
                        <Icon className="dh-model-v2__item-icon" />
                      </div>
                      <div className="dh-model-v2__item-content">
                        <h4 className="dh-model-v2__item-title dh-model-v2__item-title--primary">
                          {t(benefit.titleKey)}
                        </h4>
                        <p className="dh-model-v2__item-desc">
                          {t(benefit.descKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM STRIP ── */}
          <motion.div className="dh-model-v2__strip" variants={itemVariants}>
            <div className="dh-model-v2__strip-info">
              <ShieldCheck className="dh-model-v2__strip-icon" />
              <p className="dh-model-v2__strip-text">
                {t('model_v2_strip_text') || 'Every milestone is covered by one service-level agreement.'}
              </p>
            </div>

            <Link to="/how-it-works" className="dh-model-v2-cta">
              <span>{t('model_v2_strip_cta') || 'See how it works'}</span>
              <ArrowRight className="dh-model-v2-cta-icon" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
