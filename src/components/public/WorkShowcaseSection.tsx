import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { getShowcaseProjects, Project } from '../../data/workProjects';
import { SectionHeading } from '../common/SectionHeading';
import { WorkGrid } from './WorkGrid';
import './WorkShowcaseSection.css';

export const WorkShowcaseSection: React.FC = () => {
  const { siteContent } = useApp();
  const { t } = useLanguage();

  // Shared with CaseStudyPage so every card's link resolves to a page
  const allProjects: Project[] = getShowcaseProjects(siteContent);

  // Filter published only and sort by order
  const publishedProjects = allProjects
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Up to 6 published projects in CMS order (3 rows of 2 with alternating spans)
  const displayProjects = publishedProjects.slice(0, 6);

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
            lead={t('work_v3_heading_1') || 'Work that grows'}
            accent={t('work_v3_heading_2') || 'your business'}
            subtitle={t('work_v3_subtext') || 'Websites and digital products built for real brands — open any card for the full story.'}
            align="center"
          />
        </div>

        {/* ── Project Grid (3 Columns on Desktop) ── */}
        <div className="dh-work-showcase__grid">
          <WorkGrid projects={displayProjects} columns={3} />
        </div>

        {/* ── Centered Bottom View-All Pill Button (Matches Services Style) ── */}
        <div className="dh-work-showcase__footer">
          <Link
            to="/work"
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
