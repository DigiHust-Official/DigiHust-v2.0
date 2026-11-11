import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, X, CheckCircle2, Layers, ExternalLink } from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { useApp } from '../../context/AppContext';
import { handleCardSpotlightMove, handleCardSpotlightLeave } from '../../lib/cardSpotlight';
import { ProjectCardV2 } from './ProjectCardV2';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';
import { Project, getProjectLiveUrl, PROJECTS, getValidProjects, normalizeProject } from '../../data/workProjects';

export type { Project };
export { getProjectLiveUrl, PROJECTS, getValidProjects, normalizeProject };

const FILTER_CATS = ['All', 'Development', 'Creative', 'AI & Data'];

export const Work: React.FC = () => {
  const { siteContent } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const rawCaseStudies = siteContent?.caseStudies || [];

  const projectsList: Project[] = (rawCaseStudies && rawCaseStudies.length > 0)
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
        challenge: cs.challenge || 'Client required modernized architecture and streamlined conversion funnels.',
        solution: cs.solution || 'Engineered customized full-stack solution with enterprise performance guarantees.',
        results: [cs.impactMetric ? `${cs.impactMetric} ${cs.impactLabel}` : '100% On-Time Delivery'],
        tags: cs.tags || ['React', 'Full Stack'],
        img: formatImageUrl(cs.imageUrl, cs.category),
        projectUrl: getProjectLiveUrl(cs),
        published: true,
        order: idx,
      }, idx))
    : getValidProjects(siteContent);

  const filtered = activeFilter === 'All'
    ? projectsList
    : projectsList.filter((p) => p.filterCat === activeFilter || p.category === activeFilter);

  return (
    <div className="pt-16 overflow-x-hidden">
      <SEOHead
        title="Our Work & Case Studies | DigiHust"
        description="Explore DigiHust's portfolio of delivered projects across full-stack development, brand identity systems, AI automation, and business intelligence."
      />

      {/* Header */}
      <section data-hero="true" className="bg-[var(--bg-page)] py-20 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-extrabold text-[var(--brand-teal)] uppercase tracking-widest mb-3">
              Proven Delivery
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-heading)] mb-5">
              Selected Work & Case Studies.
            </h1>
            <p className="text-lg text-[var(--text-body)] max-w-2xl leading-relaxed">
              Explore real solutions engineered by our specialized squads | from enterprise web portals to autonomous AI assistants.
            </p>
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
            <motion.div layout className="dh-projects-grid">
              <AnimatePresence>
                {filtered.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ProjectCardV2 project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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

      {/* Case Study Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedProject(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-[var(--text-body)] relative shadow-2xl my-8"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-[var(--brand-teal)] text-[var(--text-body)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
                aria-label="Close Case Study Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12 mb-6">
                <span className="text-xs font-bold text-[var(--brand-teal)] uppercase tracking-wider">
                  {selectedProject.category} · {selectedProject.client}
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-heading)] mt-1">
                  {selectedProject.title}
                </h3>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-[var(--border-subtle)] bg-slate-100 dark:bg-slate-800">
                <img
                  src={formatImageUrl(selectedProject.img, selectedProject.category)}
                  alt={selectedProject.title}
                  width={800}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, undefined, selectedProject.category)}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] mb-2 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4" />
                    <span>The Challenge</span>
                  </h4>
                  <p className="text-[var(--text-body)] leading-relaxed bg-[var(--bg-page)] p-4 rounded-xl border border-[var(--border-subtle)]">
                    {selectedProject.challenge}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-teal)] mb-2 flex items-center space-x-1.5">
                    <span>The DigiHust Solution</span>
                  </h4>
                  <p className="text-[var(--text-body)] leading-relaxed bg-[var(--bg-page)] p-4 rounded-xl border border-[var(--border-subtle)]">
                    {selectedProject.solution}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                    Key Outcomes & Metrics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedProject.results.map((res) => (
                      <div
                        key={res}
                        className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-emerald-500/30 text-xs font-semibold text-[var(--text-body)] flex items-start space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-[var(--bg-page)] text-[var(--text-body)] border border-[var(--border-subtle)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <a
                    href={getProjectLiveUrl(selectedProject)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1F7A8C] hover:bg-[#1A6877] dark:bg-[var(--brand-teal)] dark:hover:bg-[#198090] text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                  <Link
                    to={`/contact?project=${encodeURIComponent(selectedProject.title)}&service=${encodeURIComponent(selectedProject.category)}`}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] text-white font-bold text-xs shadow transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Build a Similar Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
