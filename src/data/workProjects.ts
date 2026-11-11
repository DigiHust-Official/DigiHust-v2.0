export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface CaseStudyData {
  summary: string;
  challenge?: string;
  solution?: string;
  results?: string;
  gallery?: GalleryItem[];
}

export interface Project {
  id: string;
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  cardImage: {
    src: string;
    alt: string;
  };
  previewUrl?: string;
  published: boolean;
  order: number;
  caseStudy?: CaseStudyData;

  // Compatibility fields for existing views & modal inspectors
  client: string;
  description: string;
  filterCat: string;
  challenge: string;
  solution: string;
  results: string[];
  tags: string[];
  img: string;
  projectUrl?: string;
}

export type WorkProject = Project;

export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getProjectLiveUrl = (project: { previewUrl?: string; projectUrl?: string; title?: string }): string => {
  if (project.previewUrl && project.previewUrl.trim() !== '') {
    return project.previewUrl;
  }
  if (project.projectUrl && project.projectUrl.trim() !== '') {
    return project.projectUrl;
  }
  const t = (project.title || '').toLowerCase();
  if (t.includes('mashaallah')) return 'https://mashaallahbangles.com';
  if (t.includes('nawaz')) return 'https://alnawazindustries.com';
  if (t.includes('spoon')) return 'https://therusticspoon.com';
  if (t.includes('real-estate') || t.includes('estate')) return 'https://estatesdirect.demo';
  if (t.includes('automotive') || t.includes('veloce')) return 'https://veloce-motors.demo';
  if (t.includes('hospital') || t.includes('titan') || t.includes('bi')) return 'https://titan-bi.demo';
  if (t.includes('fintech') || t.includes('apex')) return 'https://apex-trading.demo';
  if (t.includes('logistics') || t.includes('logixpress')) return 'https://logixpress-ai.demo';
  if (t.includes('ecommerce') || t.includes('nexus')) return 'https://nexus-goods.demo';
  return '';
};

export const normalizeProject = (raw: any, index: number = 0): Project => {
  const title = raw.title || 'Untitled Project';
  const slug = raw.slug || toSlug(title) || `project-${raw.id || index}`;
  const category = raw.category || 'Web Development';
  const shortDescription = raw.shortDescription || raw.description || raw.summary || '';
  const imgUrl = raw.cardImage?.src || raw.img || raw.heroImage || '';
  const altText = raw.cardImage?.alt || raw.title || 'Project preview';
  const previewUrl = raw.previewUrl || raw.projectUrl || '';
  const published = raw.published !== false;
  const order = typeof raw.order === 'number' ? raw.order : index;

  let caseStudy: CaseStudyData | undefined = raw.caseStudy;
  if (!caseStudy && (raw.summary || raw.challenge || raw.solution || raw.results)) {
    caseStudy = {
      summary: raw.summary || shortDescription,
      challenge: raw.challenge,
      solution: raw.solution,
      results: Array.isArray(raw.results) ? raw.results.join('\n') : (raw.results || ''),
      gallery: raw.gallery || [],
    };
  }

  const resultsArr = Array.isArray(raw.results)
    ? raw.results
    : raw.results
      ? [String(raw.results)]
      : caseStudy?.results
        ? [caseStudy.results]
        : [];

  return {
    id: String(raw.id || slug),
    slug,
    category,
    filterCat: raw.filterCat || (category.includes('Design') || category.includes('Brand') ? 'Creative' : category.includes('AI') ? 'AI & Data' : 'Development'),
    title,
    client: raw.client || 'Enterprise Client',
    shortDescription,
    description: raw.description || shortDescription,
    cardImage: {
      src: imgUrl,
      alt: altText,
    },
    img: imgUrl,
    previewUrl,
    projectUrl: previewUrl,
    published,
    order,
    caseStudy,
    challenge: raw.challenge || caseStudy?.challenge || '',
    solution: raw.solution || caseStudy?.solution || '',
    results: resultsArr,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
};

export const PROJECTS: Project[] = [
  {
    id: 'real-estate-portal',
    slug: 'real-estate-marketplace-portal',
    category: 'Web Development',
    filterCat: 'Development',
    title: 'Real-Estate Marketplace Portal',
    client: 'Estates Direct UK',
    shortDescription: 'High-performance property listing and agent management platform with interactive geospatial search and instant inquiry routing.',
    description: 'High-performance property listing and agent management platform with interactive geospatial search and instant inquiry routing.',
    cardImage: {
      src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      alt: 'Real Estate Marketplace Portal Dashboard',
    },
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    previewUrl: 'https://estatesdirect.demo',
    projectUrl: 'https://estatesdirect.demo',
    published: true,
    order: 0,
    tags: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'PostGIS', 'AWS'],
    challenge: 'Legacy WordPress backend suffering from 5+ second load times and unscalable database indexing across 40,000+ UK property listings. Heavy traffic during listing drop hours caused checkout drop-offs and listing sync failures.',
    solution: 'Re-engineered from scratch with Next.js, Node.js, and PostgreSQL with PostGIS for sub-second spatial queries. Added real-time WebSocket agent lead dispatching and automated cache invalidation on CDN edge nodes.',
    results: [
      'Sub-800ms page load speeds across all search filters',
      '+140% organic inbound lead conversion rate in 90 days',
      'Zero downtime migration of 40,000+ active listings',
    ],
    caseStudy: {
      summary: 'Replacing an antiquated WordPress architecture with a high-performance React and Node.js application, resulting in a 140% conversion surge and sub-second page loads.',
      challenge: 'Legacy WordPress backend suffering from 5+ second load times and unscalable database indexing across 40,000+ UK property listings. Heavy traffic during listing drop hours caused checkout drop-offs and listing sync failures.',
      solution: 'Re-engineered from scratch with Next.js, Node.js, and PostgreSQL with PostGIS for sub-second spatial queries. Added real-time WebSocket agent lead dispatching and automated cache invalidation on CDN edge nodes.',
      results: 'Sub-800ms page load speeds across all search filters. 140% organic inbound lead conversion boost in 90 days. Zero downtime migration of 40,000+ active property listings.',
      gallery: [
        {
          src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
          alt: 'Estates Direct Search Interface',
          caption: 'Interactive map and filtering architecture delivering sub-second query times.',
        },
        {
          src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
          alt: 'Agent Management Console',
          caption: 'Agent management portal with real-time lead routing and analytics.',
        },
        {
          src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          alt: 'Property Performance Analytics',
          caption: 'Real-time performance metrics and listing visibility monitoring.',
        },
      ],
    },
  },
  {
    id: 'automotive-brand',
    slug: 'automotive-brand-identity-motion',
    category: 'Creative & Branding',
    filterCat: 'Creative',
    title: 'Automotive Brand Identity & 3D Motion Ads',
    client: 'Veloce Motors DE',
    shortDescription: 'Complete brand redesign, comprehensive design system, and a suite of 3D motion advertisement teasers for digital launch.',
    description: 'Complete brand redesign, comprehensive design system, and a suite of 3D motion advertisement teasers for digital launch.',
    cardImage: {
      src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
      alt: 'Veloce Motors 3D Motion Graphics & Brand Concept',
    },
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    previewUrl: 'https://veloce-motors.demo',
    projectUrl: 'https://veloce-motors.demo',
    published: true,
    order: 1,
    tags: ['Brand Identity', 'Figma', 'After Effects', '3D Animation', 'Motion Design'],
    challenge: 'A modern electric performance startup needed a visual identity that felt aggressive, premium, and distinct from legacy automotive competitors.',
    solution: 'Engineered a modern typographic identity system, comprehensive Figma design tokens, and three 30-second 4K 3D motion trailers in Cinema 4D and After Effects.',
    results: [
      'Generated 2.4M organic impressions across initial social launch',
      'Complete 120-page brand guidelines and vector assets delivered',
      'Adopted across digital, print, and in-vehicle UI touchpoints',
    ],
    caseStudy: {
      summary: 'Delivered an aggressive, high-contrast visual design system and photorealistic 3D motion assets for an electric performance vehicle rollout.',
      challenge: 'A modern electric performance startup needed a visual identity that felt aggressive, premium, and distinct from legacy automotive competitors.',
      solution: 'Engineered a modern typographic identity system, comprehensive Figma design tokens, and three 30-second 4K 3D motion trailers in Cinema 4D and After Effects.',
      results: 'Generated 2.4M organic impressions across initial social launch. Complete 120-page brand guidelines and vector assets delivered. Adopted across digital, print, and in-vehicle UI touchpoints.',
      gallery: [
        {
          src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
          alt: 'Veloce Motors Visual Identity',
          caption: 'High-contrast typography and digital brand design system.',
        },
        {
          src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          alt: '3D Motion Reel Still',
          caption: 'Photorealistic vehicle motion teaser and lighting study.',
        },
      ],
    },
  },
  {
    id: 'hospital-bi-dashboard',
    slug: 'executive-sales-bi-analytics-suite',
    category: 'AI & Data Solutions',
    filterCat: 'AI & Data',
    title: 'Executive Sales BI & Analytics Suite',
    client: 'Titan Healthcare Systems',
    shortDescription: 'Integrated fragmented hospital SQL data stores into a unified executive PowerBI dashboard with automated weekly KPI reports.',
    description: 'Integrated fragmented hospital SQL data stores into a unified executive PowerBI dashboard with automated weekly KPI reports.',
    cardImage: {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      alt: 'Titan Healthcare Business Intelligence Dashboard',
    },
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    previewUrl: 'https://titan-bi.demo',
    projectUrl: 'https://titan-bi.demo',
    published: true,
    order: 2,
    tags: ['PowerBI', 'SQL', 'Python', 'ETL Pipelines', 'Data Automation'],
    challenge: 'Executive leadership spent 12+ manual hours weekly compiling disparate spreadsheets with inconsistent financial figures and delayed admissions tracking.',
    solution: 'Engineered automated Python ETL pipelines syncing multiple regional SQL databases directly into an interactive PowerBI executive console with role-based access.',
    results: [
      'Saved 12+ administrative hours every single week',
      'Real-time automated alerting for revenue metric anomalies',
      'Adopted by 35+ regional hospital department heads',
    ],
    caseStudy: {
      summary: 'Integrated fragmented operational data stores into a unified executive BI suite with anomaly alerting and automated reporting.',
      challenge: 'Executive leadership spent 12+ manual hours weekly compiling disparate spreadsheets with inconsistent financial figures and delayed admissions tracking.',
      solution: 'Engineered automated Python ETL pipelines syncing multiple regional SQL databases directly into an interactive PowerBI executive console with role-based access.',
      results: 'Saved 12+ administrative hours every single week. Real-time automated alerting for revenue metric anomalies. Adopted by 35+ regional hospital department heads.',
      gallery: [
        {
          src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          alt: 'Executive BI Dashboard Console',
          caption: 'Consolidated view of revenue cycle, bed capacity, and department margins.',
        },
      ],
    },
  },
  {
    id: 'saas-fintech-redesign',
    slug: 'enterprise-fintech-trading-console',
    category: 'Web Development',
    filterCat: 'Development',
    title: 'Enterprise FinTech Trading Console',
    client: 'Apex FinTech US',
    shortDescription: 'Complete architectural redesign of a high-throughput financial trading console for enterprise institutional traders.',
    description: 'Complete architectural redesign of a high-throughput financial trading console for enterprise institutional traders.',
    cardImage: {
      src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      alt: 'Enterprise Trading Console Interface',
    },
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    previewUrl: 'https://apex-trading.demo',
    projectUrl: 'https://apex-trading.demo',
    published: true,
    order: 3,
    tags: ['React', 'TypeScript', 'WebSockets', 'Tailwind', 'High Throughput'],
    challenge: 'Dense financial data tables causing heavy browser lag and frame drops during live market volatility spikes.',
    solution: 'Rebuilt using virtualized React tables, WebSocket state managers, and dark-mode high-contrast UI components.',
    results: [
      'Maintained steady 60 FPS even under 1,000+ live tick events/sec',
      '40% reduction in user operational execution errors',
      'Successfully deployed across 200+ enterprise broker accounts',
    ],
    caseStudy: {
      summary: 'High-throughput institutional trading console re-engineered with virtualized rendering and WebSocket feeds for zero frame drops.',
      challenge: 'Dense financial data tables causing heavy browser lag and frame drops during live market volatility spikes.',
      solution: 'Rebuilt using virtualized React tables, WebSocket state managers, and dark-mode high-contrast UI components.',
      results: 'Maintained steady 60 FPS even under 1,000+ live tick events/sec. 40% reduction in user operational execution errors. Successfully deployed across 200+ enterprise broker accounts.',
      gallery: [
        {
          src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
          alt: 'Apex Trading Terminal',
          caption: 'Real-time order book and live streaming execution terminal.',
        },
      ],
    },
  },
  {
    id: 'ai-logistics-bot',
    slug: 'autonomous-logistics-customer-support-ai',
    category: 'AI Solutions & Automation',
    filterCat: 'AI & Data',
    title: 'Autonomous Logistics Customer Support AI',
    client: 'LogiXpress Logistics',
    shortDescription: 'Custom OpenAI & Python automation system resolving tracking inquiries over WhatsApp and email without human staff.',
    description: 'Custom OpenAI & Python automation system resolving tracking inquiries over WhatsApp and email without human staff.',
    cardImage: {
      src: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
      alt: 'Logistics AI Automation System',
    },
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
    previewUrl: 'https://logixpress-ai.demo',
    projectUrl: 'https://logixpress-ai.demo',
    published: true,
    order: 4,
    tags: ['OpenAI', 'Python', 'WhatsApp API', 'Automation', 'FastAPI'],
    challenge: 'Customer service department overwhelmed with 800+ repetitive tracking status inquiries every day.',
    solution: 'Deployed an autonomous OpenAI agent integrated with WhatsApp Business API and the central ERP database.',
    results: [
      '78% of incoming inquiries resolved instantly without human intervention',
      'Average response time dropped from 4 hours to under 6 seconds',
      'Customer satisfaction rating increased to 4.8 / 5.0',
    ],
    caseStudy: {
      summary: 'Automated 78% of incoming logistics inquiries with a custom fine-tuned OpenAI agent connected to ERP shipping records.',
      challenge: 'Customer service department overwhelmed with 800+ repetitive tracking status inquiries every day.',
      solution: 'Deployed an autonomous OpenAI agent integrated with WhatsApp Business API and the central ERP database.',
      results: '78% of incoming inquiries resolved instantly without human intervention. Average response time dropped from 4 hours to under 6 seconds. Customer satisfaction rating increased to 4.8 / 5.0.',
      gallery: [
        {
          src: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
          alt: 'LogiXpress Support Dashboard',
          caption: 'Automated shipment query triage and escalation queue.',
        },
      ],
    },
  },
  {
    id: 'ecommerce-brand-kit',
    slug: 'ecommerce-brand-mobile-ui-kit',
    category: 'Creative & UI/UX',
    filterCat: 'Creative',
    title: 'E-Commerce Brand & Mobile UI Kit',
    client: 'Nexus Global Goods',
    shortDescription: 'Comprehensive branding system, responsive Shopify theme design, and iOS application UI mockups.',
    description: 'Comprehensive branding system, responsive Shopify theme design, and iOS application UI mockups.',
    cardImage: {
      src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      alt: 'E-Commerce Brand System & Packaging',
    },
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    previewUrl: 'https://nexus-goods.demo',
    projectUrl: 'https://nexus-goods.demo',
    published: true,
    order: 5,
    tags: ['UI/UX', 'Figma', 'Brand Identity', 'Shopify', 'Mobile Design'],
    challenge: 'Expanding brand needed a coherent, luxury identity across mobile, packaging, and web storefront.',
    solution: 'Designed comprehensive visual design system, custom Shopify liquid templates, and Figma mobile app prototype.',
    results: [
      'Shopify storefront launch generated $280K in first 30 days',
      'Mobile checkout drop-off decreased by 28%',
      'Complete vector asset and packaging design package delivered',
    ],
    caseStudy: {
      summary: 'Unified mobile and web e-commerce design system that generated $280K in initial monthly sales with a 28% drop in checkout friction.',
      challenge: 'Expanding brand needed a coherent, luxury identity across mobile, packaging, and web storefront.',
      solution: 'Designed comprehensive visual design system, custom Shopify liquid templates, and Figma mobile app prototype.',
      results: 'Shopify storefront launch generated $280K in first 30 days. Mobile checkout drop-off decreased by 28%. Complete vector asset and packaging design package delivered.',
      gallery: [
        {
          src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
          alt: 'Nexus Brand Packaging',
          caption: 'Custom unboxing experience and packaging guidelines.',
        },
      ],
    },
  },
];

export const getValidProjects = (siteContent?: any): Project[] => {
  if (siteContent?.workProjects && Array.isArray(siteContent.workProjects) && siteContent.workProjects.length > 0) {
    return siteContent.workProjects
      .map((p: any, idx: number) => normalizeProject(p, idx))
      .sort((a: Project, b: Project) => (a.order ?? 0) - (b.order ?? 0));
  }
  return PROJECTS.map((p, idx) => normalizeProject(p, idx));
};
