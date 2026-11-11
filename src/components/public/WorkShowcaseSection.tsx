import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { getValidProjects, normalizeProject, Project } from '../../data/workProjects';
import { formatImageUrl } from '../../lib/imageUrlHelper';
import { WorkGrid } from './WorkGrid';
import './WorkShowcaseSection.css';

export const WorkShowcaseSection: React.FC = () => {
  const { siteContent } = useApp();
  const { t } = useLanguage();

  const rawCaseStudies = siteContent?.caseStudies || [];
  const allProjects: Project[] = (rawCaseStudies && rawCaseStudies.length > 0)
    ? rawCaseStudies.map((cs, idx) => normalizeProject({
        id: cs.slug || cs.id,
        category: cs.category || 'Web Development',
        filterCat: cs.category?.includes('Design') || cs.category?.includes('Brand') ? 'Creative' : cs.category?.includes('AI') ? 'AI & Data' : 'Development',
        title: cs.title,
        client: cs.client,
        description: cs.summary,
        shortDescription: cs.summary,
        cardImage: {
          src: formatImageUrl(cs.imageUrl, cs.category),
          alt: cs.title,
        },
        challenge: cs.challenge || '',
        solution: cs.solution || '',
        results: cs.impactMetric ? [`${cs.impactMetric} ${cs.impactLabel || ''}`] : ['100% On-Time Delivery'],
        tags: cs.tags || ['React', 'Full Stack'],
        img: formatImageUrl(cs.imageUrl, cs.category),
        published: true,
        order: idx,
      }, idx))
    : getValidProjects(siteContent);

  // Filter published only and sort by order
  const publishedProjects = allProjects
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Up to 4 projects in CMS order. If odd count, take the largest even number <= 4
  const targetCount = publishedProjects.length >= 4 ? 4 : publishedProjects.length >= 2 ? 2 : 0;
  const displayProjects = publishedProjects.slice(0, targetCount);

  if (displayProjects.length === 0) {
    return null;
  }

  return (
    <section
      id="work"
      data-hard-stop="work"
      className="dh-work-showcase"
      aria-labelledby="dh-work-showcase-heading"
    >
      <div className="dh-work-showcase__container">
        {/* ── Section Header ── */}
        <div className="dh-work-showcase__header">
          <div className="dh-work-showcase__header-left">
            <div className="dh-work-showcase__eyebrow">
              <span className="dh-work-showcase__eyebrow-dot" aria-hidden="true" />
              <span>{t('work_v3_eyebrow') || 'Case studies'}</span>
            </div>

            <h2 id="dh-work-showcase-heading" className="dh-work-showcase__heading">
              <span className="dh-work-showcase__heading-main">
                {t('work_v3_heading_1') || 'Selected'}
              </span>{' '}
              <span className="dh-work-showcase__heading-accent">
                {t('work_v3_heading_2') || 'work.'}
              </span>
            </h2>

            <p className="dh-work-showcase__subtext">
              {t('work_v3_subtext') || 'A few recent projects. Open any card for the full story.'}
            </p>
          </div>

          <div className="dh-work-showcase__header-right">
            <Link
              to="/work"
              className="dh-work-showcase__view-all"
              aria-label={t('work_v3_view_all') || 'View all work'}
            >
              <span>{t('work_v3_view_all') || 'View all work'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ── Project Grid ── */}
        <div className="dh-work-showcase__grid">
          <WorkGrid projects={displayProjects} />
        </div>
      </div>
    </section>
  );
};
