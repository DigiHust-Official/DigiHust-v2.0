import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { WorkGrid } from './WorkGrid';
import { SectionHeading } from '../common/SectionHeading';
import { Project, getProjectLiveUrl, PROJECTS, getValidProjects, normalizeProject, getShowcaseProjects } from '../../data/workProjects';

export type { Project };
export { getProjectLiveUrl, PROJECTS, getValidProjects, normalizeProject };

const FILTER_CATS = ['All', 'Development', 'Creative', 'AI & Data'];

export const Work: React.FC = () => {
  const { siteContent } = useApp();
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Same source as the home page (legacy list until imported into the Work tab)
  const projectsList: Project[] = getShowcaseProjects(siteContent).filter((p) => p.published !== false);

  const filtered = activeFilter === 'All'
    ? projectsList
    : projectsList.filter((p) => p.filterCat === activeFilter || p.category === activeFilter);

  return (
    <div className="dh-work-page pt-16 overflow-x-hidden">
      <SEOHead
        title="Our Work & Case Studies | DigiHust"
        description="Explore DigiHust's portfolio of delivered projects across full-stack development, brand identity systems, AI automation, and business intelligence."
      />

      {/* Header */}
      <section className="bg-[var(--bg-page)] py-20 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <SectionHeading
              title={t('work_v3_heading_1') || 'Selected'}
              accent={t('work_v3_heading_2') || 'work.'}
              subtitle={t('work_v3_subtext') || 'A few recent projects. Open any card for the full story.'}
              align="center"
            />
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs with Framer Motion layoutId */}
      <section className="bg-[var(--bg-page)] border-b border-[var(--border-subtle)] relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 overflow-x-auto">
            {FILTER_CATS.map((cat) => {
              const active = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                    active ? 'text-white' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="workCategoryPill"
                      className="absolute inset-0 bg-[var(--brand-teal)] rounded-xl shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="bg-[var(--bg-page)] py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filtered.length > 0 ? (
            <WorkGrid projects={filtered} />
          ) : (
            <div className="p-12 sm:p-16 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-4 shadow-sm max-w-2xl mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--brand-teal-subtle)] text-[var(--brand-teal)] flex items-center justify-center mx-auto border border-[var(--brand-teal)]/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-[var(--text-heading)]">
                Custom Client Solutions & NDA Deliverables
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-body)] leading-relaxed">
                DigiHust delivers web engineering, brand identity systems, and AI automation for international clients under strict confidentiality agreements. Add case studies directly via the Live CMS Studio or request our confidential portfolio PDF.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] text-white font-bold text-xs shadow-lg transition-all"
                >
                  <span>Request Custom Proposal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[var(--bg-page)] py-20 px-6 lg:px-8 border-t border-[var(--border-subtle)] text-center">
        <h2 className="font-display font-extrabold text-3xl text-[var(--text-heading)] mb-4">
          Ready to Build Your Digital Solution?
        </h2>
        <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
          Contact our team with your specifications to receive a scoped estimate and timeline.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] text-white font-bold shadow-lg transition-all"
        >
          <span>Start a Project</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
