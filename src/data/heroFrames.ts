/**
 * ============================================================================
 * Hero Media Frames Configuration
 * ============================================================================
 * Asset placement and specifications:
 * 1. Place assets inside the `public/hero/` directory.
 * 2. Reference them using absolute root-relative paths like `"/hero/branding.webp"`.
 * 3. Aspect ratio: 4:5 vertical frames.
 *    - Images: 1200x1500px, WebP or high-efficiency format.
 *    - Videos: 1080x1350px, muted MP4 (H.264 / AAC or silent) 4-6s loop,
 *      accompanied by a matching poster image (e.g., `"/hero/fullstack-poster.webp"`).
 * 4. Leaving `src: ""` displays the clean architectural placeholder automatically.
 * ============================================================================
 */

export type HeroFrame = {
  id: string;
  serviceNumber: string;
  column: 'up' | 'down';
  type: 'image' | 'video';
  label: string;
  labelKey?: string;
  alt: string;
  src: string;
  poster?: string;
};

export const HERO_FRAMES: HeroFrame[] = [
  // ── Column "up" (moves upward) ─────────────────────────────────────────────
  {
    id: 'branding',
    serviceNumber: '01',
    column: 'up',
    type: 'image',
    label: 'Graphic Design & Branding',
    labelKey: 'orbit_service_1_name',
    alt: 'Graphic Design & Brand Systems showcase',
    src: '',
  },
  {
    id: 'fullstack',
    serviceNumber: '02',
    column: 'up',
    type: 'video',
    label: 'Full Stack Development',
    labelKey: 'orbit_service_2_name',
    alt: 'Full Stack Web & Mobile Product demo',
    src: '',
    poster: '',
  },
  {
    id: 'seo',
    serviceNumber: '05',
    column: 'up',
    type: 'image',
    label: 'SEO',
    labelKey: 'orbit_service_5_name',
    alt: 'Search Engine Optimization & Organic Growth analytics',
    src: '',
  },
  {
    id: 'growth',
    serviceNumber: '04',
    column: 'up',
    type: 'image',
    label: 'Growth & Marketing',
    labelKey: 'orbit_service_4_name',
    alt: 'Growth Marketing campaigns & conversion funnels',
    src: '',
  },

  // ── Column "down" (moves downward) ─────────────────────────────────────────
  {
    id: 'ai',
    serviceNumber: '03',
    column: 'down',
    type: 'image',
    label: 'AI Automations',
    labelKey: 'orbit_service_3_name',
    alt: 'AI Workflow Automations & Intelligent Bots',
    src: '',
  },
  {
    id: 'cyber',
    serviceNumber: '06',
    column: 'down',
    type: 'image',
    label: 'Cyber Security',
    labelKey: 'orbit_service_6_name',
    alt: 'Cyber Security Audits & Infrastructure Hardening',
    src: '',
  },
  {
    id: 'bi',
    serviceNumber: '07',
    column: 'down',
    type: 'video',
    label: 'BI Dashboards',
    labelKey: 'orbit_service_7_name',
    alt: 'Business Intelligence Dashboards & Data Pipelines',
    src: '',
    poster: '',
  },
  {
    id: 'business',
    serviceNumber: '08',
    column: 'down',
    type: 'image',
    label: 'Business Solutions',
    labelKey: 'orbit_service_8_name',
    alt: 'Custom Enterprise Business Solutions & ERP Systems',
    src: '',
  },
];

