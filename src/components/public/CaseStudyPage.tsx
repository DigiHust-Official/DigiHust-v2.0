import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { NotFoundPage } from '../utility/NotFoundPage';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { getValidProjects, getProjectLiveUrl } from '../../data/workProjects';
import './CaseStudyPage.css';

export const CaseStudyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { siteContent } = useApp();
  const { t } = useLanguage();

  const allProjects = getValidProjects(siteContent);
  const project = allProjects.find(
    (p) => p.slug === slug || p.id === slug
  );

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

  // Unknown slug, unpublished, or missing case study -> 404
  if (
    !project ||
    !project.published ||
    !caseStudy ||
    !caseStudy.summary ||
    caseStudy.summary.trim() === ''
  ) {
    return <NotFoundPage />;
  }

  const liveUrl = project.previewUrl || project.projectUrl || getProjectLiveUrl(project);

  return (
    <div className="dh-case-study-page">
      <SEOHead
        title={`${project.title} | Case Study | DigiHust`}
        description={caseStudy.summary}
        ogImage={project.cardImage?.src}
      />

      <div className="dh-about-container">
        {/* ── Back Navigation Link ── */}
        <Link to="/portfolio" className="dh-cs-back-link">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          <span>{t('work_v2_all_work') || 'All work'}</span>
        </Link>

        {/* ── Header Section ── */}
        <header className="dh-cs-header">
          {/* Eyebrow Pill */}
          <div className="dh-cs-pill">
            <span className="dh-cs-pill-dot" aria-hidden="true" />
            <span>{project.category}</span>
          </div>

          {/* Heading */}
          <h1 className="dh-cs-title">{project.title}</h1>

          {/* Summary */}
          <p className="dh-cs-summary">{caseStudy.summary}</p>

          {/* Preview Work Button */}
          {liveUrl && liveUrl.trim().length > 0 && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dh-card-btn-primary"
              aria-label={`${t('work_v2_preview_work') || 'Preview work'}: ${project.title}`}
            >
              <span>{t('work_v2_preview_work') || 'Preview work'}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </a>
          )}
        </header>

        {/* ── Narrative Sections (Plain Text Only) ── */}
        <div className="dh-cs-narrative">
          {caseStudy.challenge && caseStudy.challenge.trim().length > 0 && (
            <article className="dh-cs-narrative-card">
              <h2 className="dh-cs-section-label">
                {t('work_v2_challenge') || 'Challenge'}
              </h2>
              <p className="dh-cs-section-body">{caseStudy.challenge}</p>
            </article>
          )}

          {caseStudy.solution && caseStudy.solution.trim().length > 0 && (
            <article className="dh-cs-narrative-card">
              <h2 className="dh-cs-section-label">
                {t('work_v2_solution') || 'Solution'}
              </h2>
              <p className="dh-cs-section-body">{caseStudy.solution}</p>
            </article>
          )}

          {caseStudy.results && caseStudy.results.trim().length > 0 && (
            <article className="dh-cs-narrative-card">
              <h2 className="dh-cs-section-label">
                {t('work_v2_results') || 'Results'}
              </h2>
              <p className="dh-cs-section-body">{caseStudy.results}</p>
            </article>
          )}
        </div>

        {/* ── Accessible Gallery Section ── */}
        {gallery.length > 0 && (
          <section className="dh-cs-gallery-section" aria-labelledby="dh-cs-gallery-heading">
            <h2 id="dh-cs-gallery-heading" className="dh-cs-gallery-heading">
              {t('work_v2_gallery') || 'Gallery'}
            </h2>

            <div className="dh-cs-gallery-grid">
              {gallery.map((item, idx) => (
                <button
                  key={`${item.src}-${idx}`}
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className="dh-cs-gallery-btn"
                  aria-label={`${t('work_v2_open_image') || 'Open image'} ${idx + 1}: ${item.alt}`}
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
        aria-label={t('work_v2_gallery') || 'Gallery'}
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
                aria-label={t('work_v2_close') || 'Close'}
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
                  aria-label={t('work_v2_previous') || 'Previous image'}
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
                  aria-label={t('work_v2_next') || 'Next image'}
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
