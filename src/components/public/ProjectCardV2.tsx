import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project } from '../../data/workProjects';
import { useLanguage } from '../../context/LanguageContext';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';
import './ProjectCardV2.css';

interface ProjectCardV2Props {
  project: Project;
  span?: '7' | '5' | '3';
  className?: string;
}

// Card silhouette with the top-start "pocket" notch (objectBoundingBox, 0–1 units).
const NOTCH_PATH_LTR =
  'M0,0.23 Q0,0.17 0.04,0.17 L0.34,0.17 Q0.385,0.17 0.41,0.115 L0.445,0.038 Q0.465,0 0.505,0 L0.94,0 Q1,0 1,0.09 L1,0.91 Q1,1 0.94,1 L0.06,1 Q0,1 0,0.91 Z';
const NOTCH_PATH_RTL =
  'M1,0.23 Q1,0.17 0.96,0.17 L0.66,0.17 Q0.615,0.17 0.59,0.115 L0.555,0.038 Q0.535,0 0.495,0 L0.06,0 Q0,0 0,0.09 L0,0.91 Q0,1 0.06,1 L0.94,1 Q1,1 1,0.91 Z';

const isTouchOnly = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none)').matches;

export const ProjectCardV2: React.FC<ProjectCardV2Props> = ({
  project,
  span = '7',
  className = '',
}) => {
  const { t, dir } = useLanguage();
  const clipId = `dh-card-clip-${useId().replace(/:/g, '')}`;
  const cardRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  const previewLabel = t('work_v2_preview_work') || t('work_v2_preview') || 'Preview work';
  const caseStudyLabel = t('work_v2_read_case_study') || t('work_v2_read_case') || 'Read case study';
  // Only the URL saved in the CMS (normalizeProject merges previewUrl/projectUrl).
  const previewUrl = (project.previewUrl || project.projectUrl || '').trim();
  const hasPreview = previewUrl.length > 0;
  const caseStudySlug = project.slug || project.id;

  const imgSrc = formatImageUrl(project.cardImage?.src || project.img || '', project.category);
  const imgAlt = project.cardImage?.alt || project.title;
  const shortDesc = (project.shortDescription || project.description || '').trim();
  const clientName = (project.client || '').trim();
  const hasClient = clientName.length > 0;

  // Touch: close when tapping anywhere outside this card (incl. another card).
  useEffect(() => {
    if (!revealed) return;
    const onPointerDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setRevealed(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [revealed]);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isTouchOnly()) return;
    if ((e.target as HTMLElement).closest('a')) return;
    setRevealed((prev) => !prev);
  };

  const clipStyle: React.CSSProperties = {
    clipPath: `url(#${clipId})`,
    WebkitClipPath: `url(#${clipId})`,
  };

  return (
    <article
      ref={cardRef}
      onClick={handleCardClick}
      className={`dh-card-v2 dh-card-v2--span-${span} ${revealed ? 'is-revealed' : ''} ${className}`}
    >
      {/* Notch silhouette shared by the front and back layers */}
      <svg className="dh-card-v2__clip-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={dir === 'rtl' ? NOTCH_PATH_RTL : NOTCH_PATH_LTR} />
          </clipPath>
        </defs>
      </svg>

      {/* Paper strip with the category, tucked behind the notch edge */}
      <div className="dh-card-v2__strip" title={project.category}>
        <span className="dh-card-v2__strip-text">{project.category}</span>
      </div>

      {/* Front */}
      <div className="dh-card-v2__front" style={clipStyle}>
        <img
          src={imgSrc}
          alt={imgAlt}
          loading="lazy"
          decoding="async"
          onError={(e) => handleImageError(e, undefined, project.category)}
          className="dh-card-v2__img"
        />
        <div className="dh-card-v2__front-gradient" aria-hidden="true" />

        {hasPreview && (
          <span className="dh-card-v2__badge" aria-hidden="true">
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        )}

        <div className="dh-card-v2__front-info" aria-hidden="true">
          {hasClient && (
            <div className="dh-card-v2__client">
              <span className="dh-card-v2__client-bar" />
              <span className="dh-card-v2__client-name dh-card-v2__client-name--front">{clientName}</span>
            </div>
          )}
          <p className="dh-card-v2__front-title">{project.title}</p>
        </div>
      </div>

      {/* Back: flips up from the bottom */}
      <div className="dh-card-v2__back" style={clipStyle}>
        <div className="dh-card-v2__back-glow" aria-hidden="true" />

        <div className="dh-card-v2__back-body">
          {hasClient && (
            <div className="dh-card-v2__client">
              <span className="dh-card-v2__client-bar" aria-hidden="true" />
              <span className="dh-card-v2__client-name dh-card-v2__client-name--back">{clientName}</span>
            </div>
          )}
          <h3 className="dh-card-v2__back-title">{project.title}</h3>
          {shortDesc && <p className="dh-card-v2__back-desc">{shortDesc}</p>}
        </div>

        <div className="dh-card-v2__actions">
          {hasPreview && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dh-card-v2__btn dh-card-v2__btn--primary"
              aria-label={`${previewLabel}: ${project.title}`}
            >
              <span>{previewLabel}</span>
              <ExternalLink className="dh-card-v2__btn-icon" aria-hidden="true" />
            </a>
          )}
          <Link
            to={`/work/${caseStudySlug}`}
            className="dh-card-v2__btn dh-card-v2__btn--outline"
            aria-label={`${caseStudyLabel}: ${project.title}`}
          >
            <span>{caseStudyLabel}</span>
            <ArrowRight className="dh-card-v2__btn-icon dh-card-v2__btn-icon--arrow" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectCardV2;
