import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project, getProjectLiveUrl } from '../../data/workProjects';
import { useLanguage } from '../../context/LanguageContext';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';
import './ProjectCardV2.css';

interface ProjectCardV2Props {
  project: Project;
  className?: string;
}

export const ProjectCardV2: React.FC<ProjectCardV2Props> = ({ project, className = '' }) => {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const previewUrl = project.previewUrl || project.projectUrl || getProjectLiveUrl(project);
  const hasPreview = Boolean(previewUrl && previewUrl.trim().length > 0);
  const hasCaseStudy = Boolean(
    project.caseStudy &&
    project.caseStudy.summary &&
    project.caseStudy.summary.trim().length > 0
  );

  const imgSrc = formatImageUrl(
    project.cardImage?.src || project.img || '',
    project.category
  );
  const imgAlt = project.cardImage?.alt || project.title;
  const shortDesc = project.shortDescription || project.description || '';

  return (
    <article className={`dh-card-v2 ${className}`}>
      {/* ── 16:9 Image Tile Container ── */}
      <div className="dh-card-v2__tile">
        {/* Outlined Category Pill with 6px Accent Dot */}
        <div className="dh-card-v2__pill">
          <span className="dh-card-v2__pill-dot" aria-hidden="true" />
          <span>{project.category}</span>
        </div>

        {/* Media Image */}
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

        {/* ── Sliding Hover Panel (over image tile only) ── */}
        <div className="dh-card-v2__panel" aria-hidden="false">
          <span className="dh-card-v2__panel-cat">{project.category}</span>
          <h3 className="dh-card-v2__panel-title">{project.title}</h3>
          {shortDesc && <p className="dh-card-v2__panel-desc">{shortDesc}</p>}

          {(hasPreview || hasCaseStudy) && (
            <div className="dh-card-v2__panel-actions">
              {hasPreview && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dh-card-btn-primary"
                  aria-label={`${t('work_v2_preview_work') || 'Preview work'}: ${project.title}`}
                >
                  <span>{t('work_v2_preview_work') || 'Preview work'}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
              )}

              {hasCaseStudy && (
                <Link
                  to={`/work/${project.slug}`}
                  className="dh-card-btn-secondary"
                  aria-label={`${t('work_v2_read_case_study') || 'Read case study'}: ${project.title}`}
                >
                  <span>{t('work_v2_read_case_study') || 'Read case study'}</span>
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

        {/* Fallback buttons on Touch / Small Mobile screens */}
        {(hasPreview || hasCaseStudy) && (
          <div className="dh-card-v2__mobile-actions">
            {hasPreview && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dh-card-btn-primary text-xs"
              >
                <span>{t('work_v2_preview_work') || 'Preview work'}</span>
                <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
              </a>
            )}
            {hasCaseStudy && (
              <Link
                to={`/work/${project.slug}`}
                className="dh-card-btn-secondary text-xs"
              >
                <span>{t('work_v2_read_case_study') || 'Read case study'}</span>
                <ArrowRight className="w-3 h-3 shrink-0 rtl:rotate-180" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
