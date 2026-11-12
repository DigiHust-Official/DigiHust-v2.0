import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { getValidProjects, normalizeProject, Project } from '../../data/workProjects';
import { formatImageUrl } from '../../lib/imageUrlHelper';
import { SectionHeading } from '../common/SectionHeading';
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
        {/* ── Centered Shared Section Heading ── */}
        <div className="dh-work-showcase__header">
          <SectionHeading
            id="dh-work-showcase-heading"
            title={t('work_v3_heading_1') || 'Selected'}
            accent={t('work_v3_heading_2') || 'work.'}
            subtitle={t('work_v3_subtext') || 'A few recent projects. Open any card for the full story.'}
            align="center"
          />
        </div>

        {/* ── Project Grid ── */}
        <div className="dh-work-showcase__grid">
          <WorkGrid projects={displayProjects} />
        </div>

        {/* ── Centered Bottom View-All Pill Button (Matches Services Style) ── */}
        <div className="dh-work-showcase__footer">
          <Link
            to="/portfolio"
            className="dh-work-showcase__view-all-pill"
            aria-label={t('work_v3_view_all') || 'View all work'}
          >
            <span className="dh-work-showcase__view-all-label">
              {t('work_v3_view_all') || 'View all work'}
            </span>
            <span className="dh-work-showcase__view-all-arrow-wrap">
              <ArrowRight className="dh-work-showcase__view-all-arrow" size={14} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
