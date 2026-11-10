import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../lib/i18n';
import logoImg from '../../assets/logo.png';
import { PortalNavbar } from '../portal/PortalNavbar';
import './Navbar.css';

export const NAV_AVAILABLE = true;

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
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [glideStyle, setGlideStyle] = useState<{
    transform: string;
    width: string;
    opacity: number;
  }>({
    transform: 'translate3d(0, -50%, 0)',
    width: '0px',
    opacity: 0,
  });

  const isPortalLogin = location.pathname === '/portal/login';
  const isPortal =
    location.pathname.startsWith('/portal') ||
    ['/dashboard', '/roster', '/admin'].some((p) => location.pathname.startsWith(p));
  const isVerify =
    location.pathname.startsWith('/verify') || location.pathname.startsWith('/cert');

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

  const activeIdx = navLinks.findIndex((l) => location.pathname === l.href);
  const targetIdx =
    hoveredIdx !== null
      ? hoveredIdx
      : focusedIdx !== null
      ? focusedIdx
      : activeIdx !== -1
      ? activeIdx
      : null;

  // Auto-hide navbar state
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isHiddenRef = useRef(false);

  // Computed visibility: always visible when top of page, hovering, focused, near top, mobile open, or language dropdown open
  const isLanguageOpen = Boolean(
    headerRef.current?.querySelector('[role="listbox"]')
  );
  const isHidden =
    isScrolledDown &&
    !mobileOpen &&
    !isHovered &&
    !isFocused &&
    !isNearTop &&
    !isLanguageOpen;

  isHiddenRef.current = isHidden;

  // Auto-hide scroll & desktop pointer tracking (passive listeners + rAF)
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          if (currentScrollY < 80) {
            setIsScrolledDown(false);
          } else if (Math.abs(delta) >= 6) {
            if (delta > 0) {
              // Scrolling down
              setIsScrolledDown(true);
            } else {
              // Scrolling up
              setIsScrolledDown(false);
            }
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Reveal navbar when pointer moves within top 60px of viewport (desktop only)
    const onPointerMove = (e: PointerEvent) => {
      if (window.innerWidth >= 1024) {
        if (e.clientY <= 60) {
          setIsNearTop(true);
        } else {
          setIsNearTop(false);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const header = headerRef.current;
    const onFocusIn = () => setIsFocused(true);
    const onFocusOut = (e: FocusEvent) => {
      if (header && !header.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
      }
    };

    if (header) {
      header.addEventListener('focusin', onFocusIn);
      header.addEventListener('focusout', onFocusOut);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      if (header) {
        header.removeEventListener('focusin', onFocusIn);
        header.removeEventListener('focusout', onFocusOut);
      }
    };
  }, []);

  // Measure the navbar's bottom edge at scrollY 0 on mount and on resize (debounced)
  // IMPORTANT: Do NOT re-measure while hidden, and ignore a bottom <= 0.
  useEffect(() => {
    const updateNavBottom = () => {
      if (headerRef.current && !isHiddenRef.current) {
        const bottom = headerRef.current.getBoundingClientRect().bottom;
        if (bottom > 0) {
          document.documentElement.style.setProperty('--dh-nav-bottom', `${bottom}px`);
        }
      }
    };

    updateNavBottom();

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      if (!isHiddenRef.current) {
        updateNavBottom();
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateNavBottom, 50);
      }
    };

    window.addEventListener('resize', onResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      ro = new ResizeObserver(() => {
        if (!isHiddenRef.current) {
          updateNavBottom();
        }
      });
      ro.observe(headerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, []);

  // Update Gliding Indicator position
  useEffect(() => {
    const updateGlide = () => {
      if (
        targetIdx !== null &&
        linkRefs.current[targetIdx] &&
        linksContainerRef.current
      ) {
        const linkEl = linkRefs.current[targetIdx]!;
        const contRect = linksContainerRef.current.getBoundingClientRect();
        const linkRect = linkEl.getBoundingClientRect();
        const x = linkRect.left - contRect.left;
        setGlideStyle({
          transform: `translate3d(${Math.round(x)}px, -50%, 0)`,
          width: `${Math.round(linkRect.width)}px`,
          opacity: 1,
        });
      } else {
        setGlideStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateGlide();
    window.addEventListener('resize', updateGlide);
    return () => window.removeEventListener('resize', updateGlide);
  }, [targetIdx, location.pathname]);

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
    <header
      ref={headerRef}
      className={`dh-nav-header ${isHidden ? 'dh-nav-header--hidden' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
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

        {/* Desktop Center Links with Gliding Pill Indicator */}
        <div
          ref={linksContainerRef}
          className="hidden lg:flex dh-nav-links"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Gliding Pill Indicator */}
          <div
            className="dh-nav-glide"
            style={{
              transform: glideStyle.transform,
              width: glideStyle.width,
              opacity: glideStyle.opacity,
            }}
            aria-hidden="true"
          />

          {navLinks.map((link, idx) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                ref={(el) => {
                  linkRefs.current[idx] = el;
                }}
                to={link.href}
                className={`dh-nav-link ${active ? 'dh-nav-link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => setHoveredIdx(idx)}
                onFocus={() => setFocusedIdx(idx)}
                onBlur={() => setFocusedIdx(null)}
              >
                <span className="dh-nav-link-label">{link.label}</span>
                {active && <span className="dh-nav-active-dot" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right Cluster: ThemeSwitch, LanguageSelector, Divider, Contact */}
        <div className="hidden lg:flex dh-nav-right">
          <ThemeSwitch />
          <LanguageSelector dropdownAlign="right" />

          {/* 1px x 22px Divider */}
          <span className="dh-nav-divider" aria-hidden="true" />

          {/* Contact Button with Headset, Tooltip */}
          <div className="dh-nav-contact-wrap">
            <Link
              to="/contact"
              className="dh-nav-contact-btn"
              aria-describedby={NAV_AVAILABLE ? 'nav-contact-tip' : undefined}
            >
              <span>{t('nav.contactUs')}</span>
              <Headset className="dh-nav-contact-arrow" size={16} strokeWidth={2} aria-hidden="true" />
            </Link>

            {NAV_AVAILABLE && (
              <div
                id="nav-contact-tip"
                role="tooltip"
                className="dh-nav-tooltip"
              >
                {t('nav_contact_tooltip') || 'Proposal within 24 hours'}
              </div>
            )}
          </div>
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
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {t('preferences')}
              </span>
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
