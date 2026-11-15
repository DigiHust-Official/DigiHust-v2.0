import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SEOHead } from '../seo/SEOHead';
import { useApp } from '../../context/AppContext';
import { formatImageUrl, handleImageError } from '../../lib/imageUrlHelper';

export interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
}

export const BLOG_POSTS: BlogPostItem[] = [
  {
    slug: 'how-to-architect-nextjs-for-ai-crawlers',
    title: 'Architecting Modern Web Apps for AI Search Engines & LLM Crawlers',
    excerpt: 'Why traditional client-side SPAs fail against non-JS AI search engines (GPTBot, ClaudeBot, Perplexity), and how static pre-rendering bridges the semantic discovery gap.',
    category: 'Engineering',
    readTime: '6 min read',
    date: 'August 24, 2026',
    author: 'Haris Asad',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'demystifying-ai-automations-n8n-vs-custom-python',
    title: 'Automating Business Workflows: n8n vs. Custom Python LLM Microservices',
    excerpt: 'A pragmatic framework for deciding when to use visual workflow tools versus specialized Python function-calling pipelines for enterprise operations.',
    category: 'AI & Automations',
    readTime: '8 min read',
    date: 'August 18, 2026',
    author: 'AI Engineering Lead',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'owasp-top-10-web-security-checklist-for-startups',
    title: 'The Essential OWASP Web Application Security & Hardening Checklist',
    excerpt: 'Protecting your digital infrastructure against injection, broken access controls, and data exposure before production deployment.',
    category: 'Cybersecurity',
    readTime: '7 min read',
    date: 'August 10, 2026',
    author: 'Cybersecurity Lead',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  },
];

export const formatAuthor = (rawAuthor?: string): string => {
  if (!rawAuthor || rawAuthor.trim() === '') return 'DigiHust Editorial';
  const trimmed = rawAuthor.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('lead') ||
    lower.includes('specialist') ||
    lower.includes('architect') ||
    lower.includes('engineer') ||
    lower.includes('director') ||
    lower.includes('editorial')
  ) {
    return 'DigiHust Editorial';
  }
  return `by ${trimmed}`;
};

export const Blog: React.FC = () => {
  const { siteContent } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState('All');

  // Merge CMS dynamic blog posts with defaults
  const dynamicPosts: BlogPostItem[] = (siteContent?.blogPosts || []).map((bp) => ({
    slug: bp.slug,
    title: bp.title,
    excerpt: bp.excerpt,
    category: bp.category,
    readTime: bp.readTime,
    date: bp.publishedAt ? new Date(bp.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'August 2026',
    author: bp.author,
    image: formatImageUrl(bp.imageUrl, bp.category),
  }));

  const allPosts = dynamicPosts.length > 0 ? dynamicPosts : BLOG_POSTS;

  const categories = ['All', ...Array.from(new Set(allPosts.map((p) => p.category)))];

  const filteredPosts =
    activeCategory === 'All'
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-[var(--bg-page)] text-[var(--text-body)]">
      <SEOHead
        title="Knowledge Hub & Technical Insights | DigiHust"
        description="Explore technical architecture guides, AI automation workflows, and cybersecurity benchmarks written by DigiHust domain specialists."
      />

      {/* ── 1. CENTER-ALIGNED HEADER BANNER ── */}
      <section
        data-hero="true"
        className="bg-[var(--bg-subtle)] py-16 sm:py-20 px-6 lg:px-8 border-b border-[var(--border-subtle)] text-center"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[40rem] mx-auto text-center"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-heading)] mb-5 text-center tracking-tight">
              Insights & Knowledge Hub.
            </h1>
            <p className="text-lg text-[var(--text-body)] max-w-[40rem] mx-auto leading-relaxed text-center">
              Technical guides, architectural blueprints, and digital growth strategies authored directly by our domain leads.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CENTER-ALIGNED CATEGORY TABS ── */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center space-x-2 py-4 overflow-x-auto scrollbar-none mx-auto w-fit max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[var(--brand-teal)] text-white shadow-md'
                    : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. COMPACT IMAGE-OVERLAY BLOG POST CARDS ── */}
      <section className="bg-[var(--bg-page)] py-12 sm:py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-muted)] text-base">
              No articles found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredPosts.map((post, index) => {
                const writerName = (post.author || 'DigiHust').replace(/^by\s+/i, '');

                return (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                      delay: shouldReduceMotion ? 0 : index * 0.07,
                    }}
                    className="h-full flex flex-col"
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block relative w-full aspect-[4/5] min-h-[clamp(300px,38vh,380px)] rounded-[24px] overflow-hidden shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] dark:ring-1 dark:ring-white/[0.08] dark:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.65)] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.45)] dark:hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)] flex flex-col justify-end"
                    >
                      {/* Full-bleed Absolutely Positioned Cover Image */}
                      {post.image ? (
                        <img
                          src={formatImageUrl(post.image, post.category)}
                          alt={post.title}
                          width={800}
                          height={1000}
                          loading={index < 3 ? 'eager' : 'lazy'}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, undefined, post.category)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.06]"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--bg-surface)] to-[#080e14] flex items-center justify-center">
                          <span className="text-4xl font-display font-bold text-[var(--brand-teal)]/40">
                            {post.category ? post.category.charAt(0).toUpperCase() : 'D'}
                          </span>
                        </div>
                      )}

                      {/* Smooth Bottom-Weighted Dark Gradient Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(8,14,20,0.55) 60%, rgba(8,14,20,0.92) 100%)',
                        }}
                      />

                      {/* Card Content (Bottom of card: Category -> Title -> Writer -> Read More) */}
                      <div className="relative z-10 p-4 sm:p-[1.125rem] flex flex-col gap-2.5 w-full">
                        {/* 1. Category: Small uppercase plain text, 0.6875rem-0.75rem, white at ~70% opacity, 0.08em tracking */}
                        {post.category && (
                          <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-white/70 leading-none">
                            {post.category}
                          </p>
                        )}

                        {/* 2. Title: White, semibold, clamp(1rem, 1.3vw, 1.25rem), max 2 lines */}
                        <h3 className="text-white font-semibold text-[clamp(1rem,1.3vw,1.25rem)] leading-snug line-clamp-2 drop-shadow-sm">
                          {post.title}
                        </h3>

                        {/* 3. Writer: One plain line, "By {writer name}", 0.8125rem (13px), white at ~75% opacity, truncated */}
                        <p className="text-[13px] text-white/75 truncate leading-none">
                          By {writerName}
                        </p>

                        {/* 4. "Read more" Button: Compact (height 40px, text 0.875rem), white rounded-full pill, dark token text */}
                        <div className="w-full h-[40px] rounded-full bg-white text-[#01161E] font-semibold text-sm flex items-center justify-center space-x-2 transition-transform duration-300 ease-out group-hover:scale-[1.02] shadow-sm select-none mt-1">
                          <span>Read more</span>
                          <ArrowRight className="w-4 h-4 text-[#01161E] transition-transform duration-200 ease-out group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── MORE COMING SOON / EDITORIAL PIPELINE SECTION ── */}
      <section className="pb-24 px-6 lg:px-8 bg-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 sm:p-12 relative overflow-hidden shadow-lg text-center flex flex-col items-center justify-center"
          >
            {/* Ambient Background Glow */}
            <div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--brand-teal)]/10 rounded-full blur-3xl pointer-events-none" 
              aria-hidden="true" 
            />

            {/* Heading */}
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-heading)] mb-3 relative z-10 tracking-tight">
              More Insights & Technical Teardowns Coming Soon
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[var(--text-body)] max-w-xl mx-auto leading-relaxed mb-6 relative z-10">
              Our engineering squads and solutions architects are actively drafting new deep-dives on real-world system architecture, autonomous AI agents, and production benchmarks.
            </p>

            {/* Upcoming Topics Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 relative z-10 max-w-2xl">
              {[
                'Autonomous LLM Agent RAG Systems',
                'Micro-Frontend State Hydration',
                'Zero-Trust Cloud IAM Policies',
                'High-Conversion Design Token Systems',
                'PostgreSQL Spatial Indexing at Scale',
              ].map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[11px] sm:text-xs font-semibold text-[var(--text-muted)]"
                >
                  ⏳ {topic}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
