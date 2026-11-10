import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ServicesSection.css';

export interface ServiceItem {
  id: string;
  number: string;
  titleKey: string;
  descKey: string;
  route: string;
  image: string;
}

// TODO: swap service images when dedicated assets are available
export const SERVICE_IMAGES: Record<string, string> = {
  's-web': '/hero/fullstack-poster.webp',
  's-creative': '/hero/branding.webp',
  's-ai': '/hero/ai.webp',
  's-marketing': '/hero/growth.webp',
  's-cybersecurity': '/hero/cyber.webp',
  's-data-intelligence': '/hero/bi-poster.webp',
  's-strategy': '/hero/business.webp',
  's-cloud-devops': '/hero/fullstack-poster.webp',
};

// 8 Services: 6 existing from Step 0b + 2 candidate new services
export const SERVICES: ServiceItem[] = [
  {
    id: 's-web',
    number: '01',
    titleKey: 'service_feat_web_title',
    descKey: 'service_feat_web_desc',
    route: '/services/saas-mvp-development',
    image: SERVICE_IMAGES['s-web'],
  },
  {
    id: 's-creative',
    number: '02',
    titleKey: 'service_feat_creative_title',
    descKey: 'service_feat_creative_desc',
    route: '/services/brand-identity-design-system',
    image: SERVICE_IMAGES['s-creative'],
  },
  {
    id: 's-ai',
    number: '03',
    titleKey: 'service_feat_ai_title',
    descKey: 'service_feat_ai_desc',
    route: '/services/ai-workflow-automation',
    image: SERVICE_IMAGES['s-ai'],
  },
  {
    id: 's-marketing',
    number: '04',
    titleKey: 'service_feat_marketing_title',
    descKey: 'service_feat_marketing_desc',
    route: '/services/digital-marketing-seo',
    image: SERVICE_IMAGES['s-marketing'],
  },
  {
    id: 's-cybersecurity',
    number: '05',
    titleKey: 'service_feat_cyber_title',
    descKey: 'service_feat_cyber_desc',
    route: '/services/cybersecurity-audit',
    image: SERVICE_IMAGES['s-cybersecurity'],
  },
  {
    id: 's-data-intelligence',
    number: '06',
    titleKey: 'service_feat_data_title',
    descKey: 'service_feat_data_desc',
    route: '/services/data-intelligence-analytics',
    image: SERVICE_IMAGES['s-data-intelligence'],
  },
  {
    id: 's-strategy',
    number: '07',
    titleKey: 'service_feat_strategy_title',
    descKey: 'service_feat_strategy_desc',
    route: '/services#s-strategy',
    image: SERVICE_IMAGES['s-strategy'],
  },
  {
    id: 's-cloud-devops',
    number: '08',
    titleKey: 'service_feat_cloud_title',
    descKey: 'service_feat_cloud_desc',
    route: '/services#s-cloud-devops',
    image: SERVICE_IMAGES['s-cloud-devops'],
  },
];

// Motion variants (Item 5)
const cardMotionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (customIndex: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: (customIndex % 4) * 0.07,
    },
  }),
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

  // Heading split: "One Company." in Outfit 300, "Every Digital Need." in Fraunces italic 400
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
        {/* Big Rounded Frame */}
        <div className="dh-services__frame">
          {/* Centered Heading */}
          <div className="dh-services__header">
            <h2 id="dh-services-heading" className="dh-services__title">
              <span className="dh-services__title-primary">{firstPart}</span>{' '}
              {secondPart && (
                <span className="dh-services__title-accent">{secondPart}</span>
              )}
            </h2>
            {t('services_sub') && (
              <p className="dh-services__subtext">{t('services_sub')}</p>
            )}
          </div>

          {/* 4 Cards per row, 2 rows (desktop >= 1024px) */}
          <div className="dh-services__grid">
            {SERVICES.map((svc, idx) => (
              <motion.div
                key={svc.id}
                custom={idx}
                variants={prefersReducedMotion ? undefined : cardMotionVariants}
                initial={prefersReducedMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="dh-services-card-wrap"
              >
                <Link
                  to={svc.route}
                  className="dh-services-card"
                  data-service={svc.id}
                  aria-label={`${t(svc.titleKey)} - ${t('services_explore') || 'Explore Service'}`}
                >
                  {/* TOP ROW */}
                  <div className="dh-services-card__top">
                    <span className="dh-services-card__number" aria-hidden="true">
                      {svc.number}
                    </span>
                    <span className="dh-services-card__pill">
                      <span className="dh-services-card__pill-label">
                        {t('services_more_info') || 'More info'}
                      </span>
                      <span className="dh-services-card__pill-arrow-wrap">
                        <ArrowRight className="dh-services-card__pill-arrow" />
                      </span>
                    </span>
                  </div>

                  {/* FLEXIBLE SPACER */}
                  <div className="dh-services-card__spacer" />

                  {/* TITLE BLOCK (reserved 2 lines height, flex-end alignment) */}
                  <div className="dh-services-card__title-wrap">
                    <h3 className="dh-services-card__title">
                      {t(svc.titleKey)}
                    </h3>
                  </div>

                  {/* DESCRIPTION BLOCK (reserved 3 lines height) */}
                  <p className="dh-services-card__desc">
                    {t(svc.descKey)}
                  </p>

                  {/* IMAGE AT BOTTOM */}
                  <div className="dh-services-card__media">
                    <img
                      src={svc.image}
                      alt={t(svc.titleKey)}
                      loading="lazy"
                      className="dh-services-card__img"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Centered View All Pill */}
          <div className="dh-services__footer">
            <Link to="/services" className="dh-services__view-all-pill">
              <span className="dh-services__view-all-label">
                {t('services_view_all') || 'View all services in detail'}
              </span>
              <span className="dh-services__view-all-arrow-wrap">
                <ArrowRight className="dh-services__view-all-arrow" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
