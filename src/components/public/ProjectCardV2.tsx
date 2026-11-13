import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project, getProjectLiveUrl } from '../../data/workProjects';
import { useLanguage } from '../../context/LanguageContext';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';
import { StarRating } from '../common/StarRating';
import './ProjectCardV2.css';

interface ProjectCardV2Props {
  project: Project;
  span?: '7' | '5' | '3';
  className?: string;
}

export const ProjectCardV2: React.FC<ProjectCardV2Props> = ({
  project,
  span = '7',
  className = '',
}) => {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const previewLabel = t('work_v2_preview_work') || t('work_v2_preview') || 'Preview work';
  const caseStudyLabel = t('work_v2_read_case_study') || t('work_v2_read_case') || 'Read case study';
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
  const clientName = (project.client || '').trim();
  const hasClient = clientName.length > 0;

  return (
    <article className={`dh-card-v2 dh-card-v2--span-${span} ${className}`}>
      {/* ── Image Tile Container ── */}
      <div className="dh-card-v2__tile">
        {/* ── Top-Start Folder Tab notched into image corner (No dot, no outline) ── */}
        <div className="dh-card-v2__tab" aria-label={`Category: ${project.category}`}>
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

        {/* ── Top-End Round Preview Icon (34px, neutral chip) ── */}
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

        {/* ── Soft Bottom Gradient Overlay for Visual Consistency ── */}
        <div className="dh-card-v2__tile-gradient" aria-hidden="true" />

        {/* ── Media Image (No filters) ── */}
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
          {/* 1. Client Name with 28px Accent Bar (Hidden if empty) */}
          {hasClient && (
            <div className="dh-card-v2__panel-client">
              <span className="dh-card-v2__panel-client-bar" aria-hidden="true" />
              <span className="dh-card-v2__panel-client-name">{clientName}</span>
            </div>
          )}

          {/* 2. Project Title */}
          <h4 className="dh-card-v2__panel-title">{project.title}</h4>

          {/* 3. Star Rating (Shared StarRating component with #2EC4D6 stars) */}
          {project.clientRating !== undefined && project.clientRating !== null && (
            <div className="dh-card-v2__panel-rating-wrap">
              <StarRating
                value={project.clientRating}
                max={5}
                size={15}
                color="#2EC4D6"
                emptyColor="rgba(255, 255, 255, 0.25)"
                ariaLabel={ratingAria}
              />
            </div>
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

      {/* ── Card Body (Below Image Tile) ── */}
      <div className="dh-card-v2__body">
        <h3 className="dh-card-v2__title" title={project.title}>
          {project.title}
        </h3>
        <p className="dh-card-v2__desc" title={shortDesc}>
          {shortDesc}
        </p>

        {/* Compact client / rating row on mobile / touch */}
        {(hasClient || project.clientRating !== undefined) && (
          <div className="dh-card-v2__mobile-meta">
            {hasClient && (
              <span className="dh-card-v2__mobile-client">{clientName}</span>
            )}
            {hasClient && project.clientRating !== undefined && (
              <span className="dh-card-v2__mobile-meta-dot" aria-hidden="true">•</span>
            )}
            {project.clientRating !== undefined && (
              <StarRating
                value={project.clientRating}
                max={5}
                size={14}
                color="var(--brand-teal)"
                emptyColor="rgba(10, 31, 43, 0.22)"
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

export default ProjectCardV2;
