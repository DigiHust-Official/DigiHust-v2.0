import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

export const ServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

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
        <div className="dh-services__grid">
          {FEATURED_SERVICES.map((svc, idx) => (
            <Link
              key={svc.id}
              to={svc.route}
              className={`dh-services__card dh-services__card--slot-${idx + 1}`}
              aria-label={`${t(svc.titleKey)} - ${t(svc.descKey)}`}
            >
              {/* Card content will be fully styled in Item 3 */}
              <div className="dh-services__card-inner">
                <span className="dh-services__card-title">{t(svc.titleKey)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
