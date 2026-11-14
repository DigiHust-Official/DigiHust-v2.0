import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Star,
  Search,
  User,
  Lightbulb,
  PenTool,
  Code2,
  CheckCircle2,
  Rocket,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { NotFoundPage } from '../utility/NotFoundPage';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { findProjectBySlug, getProjectLiveUrl, ProcessIconKey } from '../../data/workProjects';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';
import './CaseStudyPage.css';

const PROCESS_ICONS: Record<ProcessIconKey, LucideIcon> = {
  search: Search,
  user: User,
  lightbulb: Lightbulb,
  pen: PenTool,
  code: Code2,
  check: CheckCircle2,
  rocket: Rocket,
  layers: Layers,
};

/** Splits multi-line CMS text into bullet lines ("- " / "• " prefixes stripped). */
const toLines = (text?: string): string[] =>
  (text || '')
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-•*]\s+)/, '').trim())
    .filter((l) => l.length > 0);

/** Renders text as a bullet list when it has several lines, else as a paragraph. */
const RichText: React.FC<{ text: string }> = ({ text }) => {
  const lines = toLines(text);
  if (lines.length > 1) {
    return (
      <ul className="dh-cs-bullets">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    );
  }
  return <p className="dh-cs-body">{text.trim()}</p>;
};

const SectionTitle: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} className="dh-cs-h2">
    {children}
  </h2>
);

export const CaseStudyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { siteContent } = useApp();
  const { t } = useLanguage();

  const project = findProjectBySlug(siteContent, slug);

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const caseStudy = project?.caseStudy;
  const gallery = caseStudy?.gallery || [];

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  const closeLightbox = useCallback(() => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
    setActiveImageIndex(null);
  }, []);

  const showPrevImage = useCallback(() => {
    if (activeImageIndex === null || gallery.length === 0) return;
    setActiveImageIndex((prev) => ((prev ?? 0) - 1 + gallery.length) % gallery.length);
  }, [activeImageIndex, gallery.length]);

  const showNextImage = useCallback(() => {
    if (activeImageIndex === null || gallery.length === 0) return;
    setActiveImageIndex((prev) => ((prev ?? 0) + 1) % gallery.length);
  }, [activeImageIndex, gallery.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, closeLightbox, showPrevImage, showNextImage]);

  // Unknown slug or unpublished -> 404. Missing case study data renders a minimal page.
  if (!project || !project.published) {
    return <NotFoundPage />;
  }

  const liveUrl = project.previewUrl || project.projectUrl || getProjectLiveUrl(project);
  const lead = (caseStudy?.summary || '').trim() || project.shortDescription || project.description || '';
  const coverSrc = project.cardImage?.src || project.img || '';
  const tags = (project.tags || []).filter((tag) => tag && tag.trim().length > 0);

  const challenge = (caseStudy?.challenge || '').trim();
  const solution = (caseStudy?.solution || '').trim();
  const results = (caseStudy?.results || '').trim();
  const roles = caseStudy?.roles || [];
  const stats = caseStudy?.stats || [];
  const tools = caseStudy?.tools || [];
  const process = caseStudy?.process || [];

  const metaLeft = caseStudy?.eyebrow || project.category;
  const hasMetaBar = Boolean(metaLeft || caseStudy?.credit || caseStudy?.date);

  const canonical =
    typeof window !== 'undefined' ? `${window.location.origin}/work/${project.slug}` : undefined;

  return (
    <div className="dh-case-study-page">
      <SEOHead
        title={`${project.title} | Case Study | DigiHust`}
        description={lead || project.title}
        canonical={canonical}
        ogType="article"
        ogImage={coverSrc || undefined}
      />

      {/* ── Hero ── */}
      <header className="dh-cs-hero">
        <div className="dh-cs-container">
          <Link to="/portfolio" className="dh-cs-back-link">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('work_v2_all_work')}</span>
          </Link>

          {hasMetaBar && (
            <div className="dh-cs-meta">
              <span className="dh-cs-meta__item dh-cs-meta__item--start">{metaLeft}</span>
              <span className="dh-cs-meta__item dh-cs-meta__item--center">{caseStudy?.credit}</span>
              <span className="dh-cs-meta__item dh-cs-meta__item--end">{caseStudy?.date}</span>
            </div>
          )}

          <div className="dh-cs-hero__inner">
            {caseStudy?.logo?.src && (
              <img
                src={caseStudy.logo.src}
                alt={caseStudy.logo.alt || `${project.client || project.title} logo`}
                className="dh-cs-hero__logo"
                loading="eager"
                decoding="async"
              />
            )}

            {caseStudy?.subtitle && <p className="dh-cs-hero__subtitle">{caseStudy.subtitle}</p>}

            <h1 className="dh-cs-hero__title">{project.title}</h1>

            {lead && <p className="dh-cs-hero__lead">{lead}</p>}

            {(project.client || project.clientRating !== undefined) && (
              <div className="dh-cs-hero__client">
                {project.client && (
                  <span>
                    Client: <strong>{project.client}</strong>
                  </span>
                )}
                {project.clientRating !== undefined && project.clientRating !== null && (
                  <span
                    className="dh-cs-hero__rating"
                    role="img"
                    aria-label={`Rated ${project.clientRating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => {
                      const rating = project.clientRating ?? 0;
                      const filled = rating >= s - 0.5;
                      return (
                        <Star
                          key={s}
                          size={13}
                          aria-hidden="true"
                          className={filled ? 'dh-cs-star dh-cs-star--on' : 'dh-cs-star'}
                        />
                      );
                    })}
                    <strong>{project.clientRating.toFixed(1)}</strong>
                  </span>
                )}
              </div>
            )}

            {tags.length > 0 && (
              <ul className="dh-cs-tags" aria-label="Tags">
                {tags.map((tag) => (
                  <li key={tag} className="dh-cs-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            {liveUrl && liveUrl.trim().length > 0 && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dh-cs-hero__cta"
                aria-label={`${t('work_v2_preview_work')}: ${project.title}`}
              >
                <span>{t('work_v2_preview_work')}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="dh-cs-container">
        {/* ── Cover ── */}
        {coverSrc && (
          <figure className="dh-cs-cover">
            <img
              src={formatImageUrl(coverSrc, project.category)}
              alt={project.cardImage?.alt || project.title}
              decoding="async"
              onError={(e) => handleImageError(e, undefined, project.category)}
            />
          </figure>
        )}

        {/* ── Problem Statement ── */}
        {challenge && (
          <section className="dh-cs-section" aria-labelledby="dh-cs-problem">
            <SectionTitle id="dh-cs-problem">Problem Statement</SectionTitle>
            <RichText text={challenge} />
          </section>
        )}

        {/* ── The Solution ── */}
        {solution && (
          <section className="dh-cs-section" aria-labelledby="dh-cs-solution">
            <SectionTitle id="dh-cs-solution">The Solution</SectionTitle>
            <RichText text={solution} />
          </section>
        )}

        {/* ── Our Role ── */}
        {roles.length > 0 && (
          <section className="dh-cs-section" aria-labelledby="dh-cs-role">
            <SectionTitle id="dh-cs-role">Our Role</SectionTitle>
            <ul className="dh-cs-roles">
              {roles.map((role, i) => (
                <li key={`${role}-${i}`}>{role}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Project Duration + Tools Used ── */}
        {(stats.length > 0 || tools.length > 0) && (
          <div className={`dh-cs-split ${stats.length > 0 && tools.length > 0 ? 'dh-cs-split--two' : ''}`}>
            {stats.length > 0 && (
              <section className="dh-cs-section" aria-labelledby="dh-cs-duration">
                <SectionTitle id="dh-cs-duration">Project Duration</SectionTitle>
                <dl className="dh-cs-stats">
                  {stats.map((stat, i) => (
                    <div key={i} className="dh-cs-stat">
                      <dt className="dh-cs-stat__label">{stat.label}</dt>
                      <dd className="dh-cs-stat__value">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {tools.length > 0 && (
              <section className="dh-cs-section" aria-labelledby="dh-cs-tools">
                <SectionTitle id="dh-cs-tools">Tools Used</SectionTitle>
                <ul className="dh-cs-tools">
                  {tools.map((tool, i) => (
                    <li key={`${tool.name}-${i}`} className="dh-cs-tool">
                      <span className="dh-cs-tool__icon" aria-hidden="true">
                        {tool.iconUrl ? (
                          <img src={tool.iconUrl} alt="" loading="lazy" decoding="async" />
                        ) : (
                          <span className="dh-cs-tool__initial">{tool.name.charAt(0).toUpperCase()}</span>
                        )}
                      </span>
                      <span className="dh-cs-tool__name">{tool.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* ── Design Process ── */}
        {process.length > 0 && (
          <section className="dh-cs-section" aria-labelledby="dh-cs-process">
            <SectionTitle id="dh-cs-process">Design Process</SectionTitle>
            <ol className="dh-cs-process">
              {process.map((step, i) => {
                const Icon = PROCESS_ICONS[step.icon || 'layers'];
                return (
                  <li key={`${step.title}-${i}`} className="dh-cs-step">
                    <span
                      className={`dh-cs-step__icon ${i % 2 === 1 ? 'dh-cs-step__icon--alt' : ''}`}
                      aria-hidden="true"
                    >
                      <Icon className="w-6 h-6" />
                    </span>
                    <h3 className="dh-cs-step__title">{step.title}</h3>
                    {step.items.length > 0 && (
                      <ul className="dh-cs-step__items">
                        {step.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {i < process.length - 1 && (
                      <ChevronsRight className="dh-cs-step__sep rtl:rotate-180" aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* ── Results (not in reference; kept so existing CMS data still renders) ── */}
        {results && (
          <section className="dh-cs-section" aria-labelledby="dh-cs-results">
            <SectionTitle id="dh-cs-results">{t('work_v2_results')}</SectionTitle>
            <RichText text={results} />
          </section>
        )}

        {/* ── Gallery ── */}
        {gallery.length > 0 && (
          <section className="dh-cs-section" aria-labelledby="dh-cs-gallery-heading">
            <SectionTitle id="dh-cs-gallery-heading">{t('work_v2_gallery')}</SectionTitle>

            <div className="dh-cs-gallery-grid">
              {gallery.map((item, idx) => (
                <button
                  key={`${item.src}-${idx}`}
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className="dh-cs-gallery-btn"
                  aria-label={`${t('work_v2_open_image')} ${idx + 1}: ${item.alt}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="dh-cs-gallery-img"
                  />
                  {item.caption && (
                    <span className="dh-cs-gallery-caption">{item.caption}</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Native Accessible Dialog Lightbox ── */}
      <dialog
        ref={dialogRef}
        className="dh-cs-dialog"
        onCancel={closeLightbox}
        aria-modal="true"
        aria-label={t('work_v2_gallery')}
      >
        {activeImageIndex !== null && gallery[activeImageIndex] && (
          <div className="dh-cs-dialog-content">
            <div className="dh-cs-dialog-header">
              <span className="dh-cs-dialog-counter">
                {activeImageIndex + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="dh-cs-dialog-close"
                aria-label={t('work_v2_close')}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="dh-cs-dialog-media-wrap">
              {gallery.length > 1 && (
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="dh-cs-dialog-nav-btn prev"
                  aria-label={t('work_v2_previous')}
                >
                  <ChevronLeft className="w-6 h-6 rtl:rotate-180" aria-hidden="true" />
                </button>
              )}

              <img
                src={gallery[activeImageIndex].src}
                alt={gallery[activeImageIndex].alt}
                className="dh-cs-dialog-img"
              />

              {gallery.length > 1 && (
                <button
                  type="button"
                  onClick={showNextImage}
                  className="dh-cs-dialog-nav-btn next"
                  aria-label={t('work_v2_next')}
                >
                  <ChevronRight className="w-6 h-6 rtl:rotate-180" aria-hidden="true" />
                </button>
              )}
            </div>

            {gallery[activeImageIndex].caption && (
              <p className="dh-cs-dialog-caption">
                {gallery[activeImageIndex].caption}
              </p>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
};
