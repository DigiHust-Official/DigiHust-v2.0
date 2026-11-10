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

export const ServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section
      id="capabilities"
      data-hard-stop="capabilities"
      ref={sectionRef}
      className="dh-services"
      aria-labelledby="dh-services-heading"
    >
      <div className="dh-services__container">
        <div className="dh-services__frame">
          {/* Content to be structured in next items */}
          <div className="dh-services__grid">
            {SERVICES.map((svc) => (
              <div key={svc.id} className="dh-services__card-placeholder">
                <span>{svc.number}</span>
                <h3>{t(svc.titleKey)}</h3>
                <p>{t(svc.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
