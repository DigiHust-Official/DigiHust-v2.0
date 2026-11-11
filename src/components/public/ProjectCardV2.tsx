import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Star } from 'lucide-react';
import { Project, getProjectLiveUrl } from '../../data/workProjects';
import { useLanguage } from '../../context/LanguageContext';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';
import './ProjectCardV2.css';

interface ProjectCardV2Props {
  project: Project;
  span?: '7' | '5';
  className?: string;
}

const StarRating: React.FC<{ rating: number; ariaLabel?: string; className?: string }> = ({
  rating,
  ariaLabel,
  className = '',
}) => {
  const clamped = Math.max(0.5, Math.min(5, Math.round(rating * 2) / 2));
  return (
    <div
      className={`dh-card-v2__stars ${className}`}
      role="img"
      aria-label={ariaLabel || `Rated ${clamped} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starIdx) => {
        const isFull = clamped >= starIdx;
        const isHalf = !isFull && clamped >= starIdx - 0.5;
        return (
          <span key={starIdx} className="dh-star-wrap">
            {isHalf ? (
              <span className="dh-star-half-container">
                <Star size={16} className="dh-star-empty" />
                <span className="dh-star-half-clip">
                  <Star size={16} className="dh-star-filled" />
                </span>
              </span>
            ) : isFull ? (
              <Star size={16} className="dh-star-filled" />
            ) : (
              <Star size={16} className="dh-star-empty" />
            )}
          </span>
        );
      })}
      <span className="dh-card-v2__stars-val">{clamped.toFixed(1)}</span>
    </div>
  );
};

export const ProjectCardV2: React.FC<ProjectCardV2Props> = ({
  project,
  span = '7',
  className = '',
}) => {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const previewLabel = t('work_v2_preview_work') || t('work_v2_preview') || 'Preview work';
  const caseStudyLabel = t('work_v2_read_case_study') || t('work_v2_read_case') || 'Case study';
  const previewUrl = project.previewUrl || project.projectUrl || getProjectLiveUrl(project);
  const hasPreview = Boolean(previewUrl && previewUrl.trim().length > 0);
  const caseStudySlug = project.slug || project.id;
  const hasCaseStudy = Boolean(caseStudySlug && caseStudySlug.trim().length > 0);

  const rawRatingAriaTemplate = t('work_v3_rated_out_of') || 'Rated {rating} out of 5 stars';
  const ratingAria = project.clientRating !== undefined
    ? rawRatingAriaTemplate.replace('{rating}', String(project.clientRating))
    : undefined;

  const imgSrc = formatImageUrl(
    project.cardImage?.src || project.img || '',
    project.category
  );
  const imgAlt = project.cardImage?.alt || project.title;
  const shortDesc = project.shortDescription || project.description || '';

  return (
    <article className={`dh-card-v2 dh-card-v2--span-${span} ${className}`}>
      {/* ── Image Tile Container ── */}
      <div className="dh-card-v2__tile">
        {/* ── Top-Start Folder Tab notched into image corner ── */}
        <div className="dh-card-v2__tab" aria-label={`Category: ${project.category}`}>
          <span className="dh-card-v2__tab-dot" aria-hidden="true" />
          <span className="dh-card-v2__tab-text">{project.category}</span>

          {/* Smooth Concave Fillet Curve (Top Edge) */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="dh-card-v2__tab-fillet-top"
            aria-hidden="true"
          >
            <path d="M0 0 L18 0 A 18 18 0 0 0 0 18 Z" fill="currentColor" />
          </svg>
        </div>

        {/* ── Top-End Round Preview Icon (34px) ── */}
        {hasPreview && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dh-card-v2__preview-icon"
            aria-label={`${previewLabel}: ${project.title}`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        )}

        {/* ── Media Image ── */}
        <img
          src={imgSrc}
          alt={imgAlt}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            handleImageError(e, undefined, project.category);
            setImageLoaded(true);
          }}
          className={`dh-card-v2__img transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-80'
          }`}
        />

        {/* ── Sliding Hover Panel (over image tile only, premium 5 items) ── */}
        <div className="dh-card-v2__panel" aria-hidden="false">
          {/* 1. Client Name with 28px Accent Bar */}
          {project.client && (
            <div className="dh-card-v2__panel-client">
              <span className="dh-card-v2__panel-client-bar" aria-hidden="true" />
              <span className="dh-card-v2__panel-client-name">{project.client}</span>
            </div>
          )}

          {/* 2. Project Title */}
          <h3 className="dh-card-v2__panel-title">{project.title}</h3>

          {/* 3. Star Rating */}
          {project.clientRating !== undefined && project.clientRating !== null && (
            <StarRating
              rating={project.clientRating}
              ariaLabel={ratingAria}
              className="dh-card-v2__panel-rating"
            />
          )}

          {/* 4 & 5. Minimal Text-Link Actions */}
          {(hasPreview || hasCaseStudy) && (
            <div className="dh-card-v2__panel-actions">
              {hasPreview && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dh-card-v2__btn-minimal"
                  aria-label={`${previewLabel}: ${project.title}`}
                >
                  <span>{previewLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
              )}

              {hasCaseStudy && (
                <Link
                  to={`/work/${caseStudySlug}`}
                  className="dh-card-v2__btn-minimal"
                  aria-label={`${caseStudyLabel}: ${project.title}`}
                >
                  <span>{caseStudyLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Card Body (below image tile) ── */}
      <div className="dh-card-v2__body">
        <h2 className="dh-card-v2__title" title={project.title}>
          {project.title}
        </h2>
        <p className="dh-card-v2__desc" title={shortDesc}>
          {shortDesc}
        </p>

        {/* Compact client / rating row on mobile / touch */}
        {(project.client || project.clientRating !== undefined) && (
          <div className="dh-card-v2__mobile-meta">
            {project.client && (
              <span className="dh-card-v2__mobile-client">{project.client}</span>
            )}
            {project.client && project.clientRating !== undefined && (
              <span className="dh-card-v2__mobile-meta-dot" aria-hidden="true">•</span>
            )}
            {project.clientRating !== undefined && (
              <StarRating
                rating={project.clientRating}
                ariaLabel={ratingAria}
                className="dh-card-v2__mobile-rating"
              />
            )}
          </div>
        )}

        {/* Minimal Buttons on Touch / Small Mobile Screens */}
        {(hasPreview || hasCaseStudy) && (
          <div className="dh-card-v2__mobile-actions">
            {hasPreview && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dh-card-v2__btn-minimal"
              >
                <span>{previewLabel}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
            )}
            {hasCaseStudy && (
              <Link
                to={`/work/${caseStudySlug}`}
                className="dh-card-v2__btn-minimal"
              >
                <span>{caseStudyLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
