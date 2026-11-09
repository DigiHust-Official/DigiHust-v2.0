import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../lib/i18n';
import logoImg from '../../assets/logo.png';
import { PortalNavbar } from '../portal/PortalNavbar';
import './Navbar.css';

// Register fallback key for Contact Us if not present
if (!TRANSLATIONS.en['nav.contactUs']) {
  TRANSLATIONS.en['nav.contactUs'] = 'Contact Us';
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const isPortalLogin = location.pathname === '/portal/login';
  const isPortal = location.pathname.startsWith('/portal') || ['/dashboard', '/roster', '/admin'].some(p => location.pathname.startsWith(p));
  const isVerify = location.pathname.startsWith('/verify') || location.pathname.startsWith('/cert');

  // Measure the navbar's bottom edge at scrollY 0 on mount and on resize (debounced)
  useEffect(() => {
    const updateNavBottom = () => {
      if (headerRef.current) {
        const bottom = headerRef.current.getBoundingClientRect().bottom;
        if (bottom > 0) {
          document.documentElement.style.setProperty('--dh-nav-bottom', `${bottom}px`);
        }
      }
    };

    updateNavBottom();

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      updateNavBottom();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateNavBottom, 50);
    };

    window.addEventListener('resize', onResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      ro = new ResizeObserver(() => {
        updateNavBottom();
      });
      ro.observe(headerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, []);

  // Retain all 7 section links in exact order
  const navLinks = [
    { label: t('nav_services') || 'Services', href: '/services' },
    { label: t('nav_work') || 'Work', href: '/portfolio' },
    { label: t('nav_how_it_works') || 'How It Works', href: '/how-it-works' },
    { label: t('nav_about') || 'About', href: '/about' },
    { label: t('nav_team') || 'Team', href: '/team' },
    { label: t('nav_blog') || 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ];

  const isActive = (href: string) => location.pathname === href;

  if (isPortalLogin) {
    return null;
  }

  if (isPortal) {
    if (!isAuthenticated) {
      return null;
    }
    return <PortalNavbar />;
  }

  if (isVerify) {
    return null;
  }

  return (
    <header ref={headerRef} className="dh-nav-header">
      <nav className="dh-nav-bar" aria-label="Main Navigation">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group select-none">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
            <img src={logoImg} alt="DigiHust Logo" className="w-full h-full object-contain" />
          </div>
          <span className="dh-nav-logo-text font-display font-bold text-lg tracking-tight transition-colors">
            DigiHust
          </span>
        </Link>

        {/* Desktop Center Links */}
        <div className="hidden lg:flex dh-nav-links">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`dh-nav-link ${active ? 'dh-nav-link--active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right Cluster: ThemeSwitch, LanguageSelector, Contact */}
        <div className="hidden lg:flex dh-nav-right">
          <ThemeSwitch />
          <LanguageSelector dropdownAlign="right" />
          <Link to="/contact" className="dh-nav-contact-btn">
            {t('nav.contactUs')}
          </Link>
        </div>

        {/* Mobile Action Bar: ThemeSwitch + Menu Trigger */}
        <div className="flex items-center space-x-1.5 lg:hidden justify-self-end">
          <ThemeSwitch />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[var(--text-heading)] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--dh-focus-ring)]"
            aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="dh-nav-mobile-panel lg:hidden space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-[var(--brand-teal-text)] font-bold bg-[var(--brand-teal-subtle)]'
                    : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center justify-between pt-3 pb-1 px-1 border-t border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--text-muted)]">{t('preferences')}</span>
              <div className="flex items-center space-x-2">
                <ThemeSwitch />
                <LanguageSelector dropdownAlign="left" />
              </div>
            </div>

            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="dh-nav-contact-btn w-full mt-2 justify-center"
            >
              {t('nav.contactUs')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
