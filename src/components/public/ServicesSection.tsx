import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ServicesSection.css';

export interface FeaturedServiceItem {
  id: string;
  titleKey: string;
  descKey: string;
  route: string;
  illustrationKey: string;
}

// 4 Featured Services: 3 shown today + next in data order (Marketing & SEO)
export const FEATURED_SERVICES: FeaturedServiceItem[] = [
  {
    id: 's-web',
    titleKey: 'service_feat_web_title',
    descKey: 'service_feat_web_desc',
    route: '/services/saas-mvp-development',
    illustrationKey: 'code',
  },
  {
    id: 's-creative',
    titleKey: 'service_feat_creative_title',
    descKey: 'service_feat_creative_desc',
    route: '/services/brand-identity-design-system',
    illustrationKey: 'layers',
  },
  {
    id: 's-ai',
    titleKey: 'service_feat_ai_title',
    descKey: 'service_feat_ai_desc',
    route: '/services/ai-workflow-automation',
    illustrationKey: 'cpu',
  },
  {
    id: 's-marketing',
    titleKey: 'service_feat_marketing_title',
    descKey: 'service_feat_marketing_desc',
    route: '/services/digital-marketing-seo',
    illustrationKey: 'chart',
  },
];

// TODO: placeholder illustrations, replace with brand artwork
interface ServiceIllustrationProps {
  id: string;
  className?: string;
}

export const ServiceIllustration: React.FC<ServiceIllustrationProps> = ({ id, className = '' }) => {
  switch (id) {
    case 's-web':
      return (
        <svg
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Browser window */}
          <rect x="8" y="10" width="84" height="60" rx="8" />
          <line x1="8" y1="24" x2="92" y2="24" />
          {/* Header dots with aura coral accent */}
          <circle cx="18" cy="17" r="2.5" fill="rgb(var(--dh-wave-1))" stroke="none" />
          <circle cx="26" cy="17" r="2" fill="currentColor" stroke="none" />
          <circle cx="34" cy="17" r="2" fill="currentColor" stroke="none" />
          {/* Code brackets < / > */}
          <polyline points="32,36 22,46 32,56" />
          <line x1="51" y1="34" x2="43" y2="58" />
          <polyline points="62,36 72,46 62,56" />
          {/* Subtle button pill & cursor */}
          <rect x="56" y="46" width="26" height="16" rx="4" />
          <polygon points="74,56 82,64 79,65 83,71 80,72 76,66 72,68" fill="currentColor" />
        </svg>
      );

    case 's-creative':
      return (
        <svg
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Stacked perspective layers */}
          <path d="M16,36 L50,18 L84,36 L50,54 Z" />
          <path d="M16,48 L50,30 L84,48 L50,66 Z" />
          {/* Top layer artboard */}
          <rect x="28" y="14" width="48" height="36" rx="6" />
          {/* Bezier vector line */}
          <path d="M34,36 C42,22 62,42 70,26" />
          <circle cx="34" cy="36" r="2" fill="currentColor" stroke="none" />
          <circle cx="70" cy="26" r="2" fill="currentColor" stroke="none" />
          {/* Aura coral accent vector node */}
          <circle cx="52" cy="32" r="3.2" fill="rgb(var(--dh-wave-1))" stroke="none" />
        </svg>
      );

    case 's-ai':
      return (
        <svg
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Central processor core */}
          <rect x="30" y="20" width="40" height="38" rx="6" />
          {/* Connection buses */}
          <line x1="14" y1="30" x2="30" y2="30" />
          <line x1="14" y1="46" x2="30" y2="46" />
          <line x1="70" y1="30" x2="86" y2="30" />
          <line x1="70" y1="46" x2="86" y2="46" />
          <line x1="42" y1="8" x2="42" y2="20" />
          <line x1="58" y1="8" x2="58" y2="20" />
          <line x1="42" y1="58" x2="42" y2="70" />
          <line x1="58" y1="58" x2="58" y2="70" />
          {/* External terminal dots */}
          <circle cx="14" cy="30" r="2" fill="currentColor" stroke="none" />
          <circle cx="86" cy="46" r="2" fill="currentColor" stroke="none" />
          {/* Internal neural nodes */}
          <line x1="38" y1="32" x2="50" y2="44" />
          <line x1="50" y1="44" x2="62" y2="32" />
          <circle cx="38" cy="32" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="62" cy="32" r="2.5" fill="currentColor" stroke="none" />
          {/* Central aura coral accent node */}
          <circle cx="50" cy="44" r="3.5" fill="rgb(var(--dh-wave-1))" stroke="none" />
        </svg>
      );

    case 's-marketing':
      return (
        <svg
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Ground axis */}
          <line x1="14" y1="68" x2="86" y2="68" />
          {/* Growth bars */}
          <rect x="22" y="48" width="10" height="20" rx="3" />
          <rect x="38" y="38" width="10" height="30" rx="3" />
          <rect x="54" y="26" width="10" height="42" rx="3" />
          {/* Trend arrow */}
          <path d="M18,52 Q38,40 64,18" />
          <polyline points="56,16 66,16 66,26" />
          {/* Magnifier over high peak */}
          <circle cx="72" cy="30" r="10" />
          <line x1="80" y1="38" x2="90" y2="48" strokeWidth="2.2" />
          {/* Aura coral accent peak node */}
          <circle cx="64" cy="18" r="3" fill="rgb(var(--dh-wave-1))" stroke="none" />
        </svg>
      );

    default:
      return null;
  }
};

// Framer Motion entrance variants (Item 5)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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

export const ServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Headline highlighter split: "One Company. Every Digital Need."
  const headingText = t('services_heading') || 'One Company. Every Digital Need.';
  const dotIndex = headingText.indexOf('.');
  const firstPart = dotIndex !== -1 ? headingText.slice(0, dotIndex + 1) : headingText;
  const secondPart = dotIndex !== -1 ? headingText.slice(dotIndex + 1).trim() : '';

  return (
    <section
      id="capabilities"
      data-hard-stop="capabilities"
      ref={sectionRef}
      className="dh-services"
      aria-labelledby="dh-services-heading"
    >
      <div className="dh-services__container">
        {/* Header Block */}
        <div className="dh-services__header">
          <p className="dh-services__eyebrow">
            {t('services_tag') || 'Core Capabilities'}
          </p>
          <div className="dh-services__header-row">
            <div className="dh-services__heading-wrap">
              <h2 id="dh-services-heading" className="dh-services__title">
                <span>{firstPart}</span>{' '}
                {secondPart && (
                  <span
                    className={`dh-mark dh-services__mark ${
                      isInView ? 'dh-services__mark--in-view' : ''
                    }`}
                  >
                    {secondPart}
                  </span>
                )}
              </h2>
            </div>

            <div className="dh-services__meta-wrap">
              <p className="dh-services__subtext">
                {t('services_sub')}
              </p>
              <Link to="/services" className="dh-services__link">
                <span>{t('services_view_all') || 'View all services in detail'}</span>
                <ArrowRight className="dh-services__link-arrow" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2x2 Checkerboard Grid */}
        <motion.div
          className="dh-services__grid"
          variants={containerVariants}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {FEATURED_SERVICES.map((svc, idx) => (
            <motion.div
              key={svc.id}
              className="dh-services__card-wrap"
              variants={prefersReducedMotion ? undefined : cardVariants}
            >
              <Link
                to={svc.route}
                className={`dh-services__card dh-services__card--slot-${idx + 1}`}
                aria-label={`${t(svc.titleKey)} - ${t('services_learn_more') || 'Learn more'}`}
              >
                {/* TOP Cluster */}
                <div className="dh-services__card-top">
                  <h3 className="dh-services__card-title">
                    <span className="dh-services__card-title-box">
                      {t(svc.titleKey)}
                    </span>
                  </h3>
                </div>

                {/* BOTTOM Cluster */}
                <div className="dh-services__card-bottom">
                  <div className="dh-services__learn-more">
                    <span className="dh-services__learn-btn">
                      <ArrowUpRight className="dh-services__arrow" strokeWidth={2} />
                    </span>
                    <span className="dh-services__learn-label">
                      {t('services_learn_more') || 'Learn more'}
                    </span>
                  </div>
                </div>

                {/* Illustration (Right side, vertically centered) */}
                <div className="dh-services__illustration">
                  <ServiceIllustration id={svc.id} />
                </div>

                {/* Screen reader only description for SEO */}
                <span className="sr-only">{t(svc.descKey)}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
