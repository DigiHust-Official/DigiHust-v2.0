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
  shortLabel?: string;
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
    shortLabel: 'Branding',
    alt: 'Branding identity stationery and logo design showcase on desk',
    src: '/hero/branding-sm.webp',
  },
  {
    id: 'fullstack',
    serviceNumber: '02',
    column: 'up',
    // TODO: replace with 1080x1350 MP4 once ffmpeg is available locally
    type: 'image',
    label: 'Full Stack Development',
    labelKey: 'orbit_service_2_name',
    shortLabel: 'Full Stack',
    alt: 'Full stack development code on developer workstation screen',
    src: '/hero/fullstack-poster-sm.webp',
    poster: '/hero/fullstack-poster-sm.webp',
  },
  {
    id: 'seo',
    serviceNumber: '05',
    column: 'up',
    type: 'image',
    label: 'SEO',
    labelKey: 'orbit_service_5_name',
    shortLabel: 'SEO',
    alt: 'Search engine optimization and organic analytics research on laptop',
    src: '/hero/seo-sm.webp',
  },
  {
    id: 'growth',
    serviceNumber: '04',
    column: 'up',
    type: 'image',
    label: 'Growth & Marketing',
    labelKey: 'orbit_service_4_name',
    shortLabel: 'Growth',
    alt: 'Growth marketing metrics and performance analytics charts',
    src: '/hero/growth-sm.webp',
  },

  // ── Column "down" (moves downward) ─────────────────────────────────────────
  {
    id: 'ai',
    serviceNumber: '03',
    column: 'down',
    type: 'image',
    label: 'AI Automations',
    labelKey: 'orbit_service_3_name',
    shortLabel: 'AI Automation',
    alt: 'Abstract artificial intelligence neural network connectivity nodes',
    src: '/hero/ai-sm.webp',
  },
  {
    id: 'cyber',
    serviceNumber: '06',
    column: 'down',
    type: 'image',
    label: 'Cyber Security',
    labelKey: 'orbit_service_6_name',
    shortLabel: 'Cyber Security',
    alt: 'Cyber security digital encryption lock protection concept',
    src: '/hero/cyber-sm.webp',
  },
  {
    id: 'bi',
    serviceNumber: '07',
    column: 'down',
    // TODO: replace with 1080x1350 MP4 once ffmpeg is available locally
    type: 'image',
    label: 'BI Dashboards',
    labelKey: 'orbit_service_7_name',
    shortLabel: 'BI Dashboards',
    alt: 'Business intelligence interactive dashboard analytics visualizations',
    src: '/hero/bi-poster-sm.webp',
    poster: '/hero/bi-poster-sm.webp',
  },
  {
    id: 'business',
    serviceNumber: '08',
    column: 'down',
    type: 'image',
    label: 'Business Solutions',
    labelKey: 'orbit_service_8_name',
    shortLabel: 'Business',
    alt: 'Enterprise business planning and squad strategy session on desk',
    src: '/hero/business-sm.webp',
  },
];

