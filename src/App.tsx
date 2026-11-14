import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { CookieConsent } from './components/ui/CookieConsent';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import { FloatingCTA } from './components/ui/FloatingCTA';
import { GlobalLoaderOverlay } from './components/ui/GlobalLoaderOverlay';
import { ProtectedRoute } from './components/portal/ProtectedRoute';

// Home kept static for instant landing load
import { Home } from './components/public/Home';

// Lazy-loaded Public pages (named-export safe)
const Services = React.lazy(() => import('./components/public/Services').then(m => ({ default: m.Services })));
const Work = React.lazy(() => import('./components/public/Work').then(m => ({ default: m.Work })));
const CaseStudyPage = React.lazy(() => import('./components/public/CaseStudyPage').then(m => ({ default: m.CaseStudyPage })));
const HowItWorks = React.lazy(() => import('./components/public/HowItWorks').then(m => ({ default: m.HowItWorks })));
const About = React.lazy(() => import('./components/public/About').then(m => ({ default: m.About })));
const Blog = React.lazy(() => import('./components/public/Blog').then(m => ({ default: m.Blog })));
const BlogPost = React.lazy(() => import('./components/public/BlogPost').then(m => ({ default: m.BlogPost })));
const Contact = React.lazy(() => import('./components/public/Contact').then(m => ({ default: m.Contact })));
const Apply = React.lazy(() => import('./components/public/Apply').then(m => ({ default: m.Apply })));
const Careers = React.lazy(() => import('./components/public/Careers').then(m => ({ default: m.Careers })));
const PrivacyPolicy = React.lazy(() => import('./components/public/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/public/TermsOfService').then(m => ({ default: m.TermsOfService })));
const EditorialPolicy = React.lazy(() => import('./components/public/EditorialPolicy').then(m => ({ default: m.EditorialPolicy })));
const CertificateVerification = React.lazy(() => import('./components/public/CertificateVerification').then(m => ({ default: m.CertificateVerification })));
const SaasDevelopmentLanding = React.lazy(() => import('./components/public/LandingPages/SaasDevelopmentLanding').then(m => ({ default: m.SaasDevelopmentLanding })));
const AiAutomationLanding = React.lazy(() => import('./components/public/LandingPages/AiAutomationLanding').then(m => ({ default: m.AiAutomationLanding })));
const DesignSystemLanding = React.lazy(() => import('./components/public/LandingPages/DesignSystemLanding').then(m => ({ default: m.DesignSystemLanding })));
const DigitalMarketingLanding = React.lazy(() => import('./components/public/LandingPages/DigitalMarketingLanding').then(m => ({ default: m.DigitalMarketingLanding })));
const CybersecurityLanding = React.lazy(() => import('./components/public/LandingPages/CybersecurityLanding').then(m => ({ default: m.CybersecurityLanding })));
const DataIntelligenceLanding = React.lazy(() => import('./components/public/LandingPages/DataIntelligenceLanding').then(m => ({ default: m.DataIntelligenceLanding })));
const ClientProjectTracker = React.lazy(() => import('./components/public/ClientProjectTracker').then(m => ({ default: m.ClientProjectTracker })));
const ResetPasswordPage = React.lazy(() => import('./components/public/ResetPassword').then(m => ({ default: m.ResetPasswordPage })));

// Lazy-loaded Portal & Tiered Management System
const PortalLogin = React.lazy(() => import('./components/portal/PortalLogin').then(m => ({ default: m.PortalLogin })));
const PortalDashboard = React.lazy(() => import('./components/portal/PortalDashboard').then(m => ({ default: m.PortalDashboard })));
const AssignmentWorkspace = React.lazy(() => import('./components/portal/AssignmentWorkspace').then(m => ({ default: m.AssignmentWorkspace })));
const PeopleDirectoryView = React.lazy(() => import('./components/portal/PeopleDirectoryView').then(m => ({ default: m.PeopleDirectoryView })));
const AnnouncementsFeed = React.lazy(() => import('./components/portal/AnnouncementsFeed').then(m => ({ default: m.AnnouncementsFeed })));
const CertificateManager = React.lazy(() => import('./components/portal/CertificateManager').then(m => ({ default: m.CertificateManager })));
const SiteContentManager = React.lazy(() => import('./components/portal/SiteContentManager').then(m => ({ default: m.SiteContentManager })));

// Lazy-loaded Utility & Error pages
const NotFoundPage = React.lazy(() => import('./components/utility/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ServerErrorPage = React.lazy(() => import('./components/utility/ServerErrorPage').then(m => ({ default: m.ServerErrorPage })));
const AccessDeniedPage = React.lazy(() => import('./components/utility/AccessDeniedPage').then(m => ({ default: m.AccessDeniedPage })));
const UnauthorizedPage = React.lazy(() => import('./components/utility/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
const MaintenancePage = React.lazy(() => import('./components/utility/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
const OfflinePage = React.lazy(() => import('./components/utility/OfflinePage').then(m => ({ default: m.OfflinePage })));

// Helper to scroll to top on route navigation
// If the URL has a #hash, scroll to that element instead (polls briefly because pages are lazy-loaded)
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const start = performance.now();
    let raf = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
      if (performance.now() - start < 3000) raf = requestAnimationFrame(tryScroll);
    };
    tryScroll();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
};

// Route wrapper to hide public footer on portal and verification pages
const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/portal') || 
    location.pathname.startsWith('/verify') || 
    location.pathname.startsWith('/cert') || 
    ['/dashboard', '/ledger', '/roster', '/admin'].some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-body)] selection:bg-[var(--brand-teal)] selection:text-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:rounded-lg focus:bg-[#022B3A] focus:px-4 focus:py-2 focus:text-white">Skip to main content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none min-h-[calc(100vh-160px)]">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <GlobalLoaderOverlay />
            <OfflineBanner />
            <CookieConsent />
            <PWAInstallPrompt />
            <FloatingCTA />
            <PageContainer>
              <Suspense fallback={null}>
                <Routes>
                  {/* ── Public Core Routes ── */}
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/portfolio" element={<Work />} />
                  <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
                  <Route path="/work" element={<Navigate to="/portfolio" replace />} />
                  <Route path="/work/:slug" element={<CaseStudyPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/team" element={<Navigate to="/about#team" replace />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/apply" element={<Apply />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/editorial-policy" element={<EditorialPolicy />} />

                  {/* ── High-Intent Dedicated Service & Capability Landing Pages ── */}
                  <Route path="/services/saas-mvp-development" element={<SaasDevelopmentLanding />} />
                  <Route path="/services/web-development" element={<Navigate to="/services/saas-mvp-development" replace />} />
                  <Route path="/services/ai-workflow-automation" element={<AiAutomationLanding />} />
                  <Route path="/services/brand-identity-design-system" element={<DesignSystemLanding />} />
                  <Route path="/services/creative-design" element={<Navigate to="/services/brand-identity-design-system" replace />} />
                  <Route path="/services/digital-marketing-seo" element={<DigitalMarketingLanding />} />
                  <Route path="/services/digital-marketing" element={<Navigate to="/services/digital-marketing-seo" replace />} />
                  <Route path="/services/cybersecurity-audit" element={<CybersecurityLanding />} />
                  <Route path="/services/cybersecurity" element={<Navigate to="/services/cybersecurity-audit" replace />} />
                  <Route path="/services/data-intelligence-analytics" element={<DataIntelligenceLanding />} />
                  <Route path="/services/data-intelligence" element={<Navigate to="/services/data-intelligence-analytics" replace />} />

                  {/* ── Private Client Live Project Tracker ── */}
                  <Route path="/project/track/:trackingToken" element={<ClientProjectTracker />} />
                  <Route path="/project/track" element={<ClientProjectTracker />} />
                  <Route path="/project/view" element={<ClientProjectTracker />} />

                  {/* ── Public Unauthenticated Certificate Verification ── */}
                  <Route path="/verify/:certId" element={<CertificateVerification />} />
                  <Route path="/cert/:certId" element={<CertificateVerification />} />
                  <Route path="/verify/cert/:certId" element={<CertificateVerification />} />

                  {/* ── Security Account Recovery / Password Reset ── */}
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* ── Staff Portal System (4-Tier Architecture) ── */}
                  <Route path="/portal/login" element={<PortalLogin />} />
                  <Route path="/portal" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
                  <Route path="/portal/dashboard" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
                  <Route path="/portal/assignments" element={<ProtectedRoute><AssignmentWorkspace /></ProtectedRoute>} />
                  <Route path="/portal/roster" element={<ProtectedRoute><PeopleDirectoryView /></ProtectedRoute>} />
                  <Route path="/portal/people" element={<ProtectedRoute><PeopleDirectoryView /></ProtectedRoute>} />
                  <Route path="/portal/directory" element={<ProtectedRoute><PeopleDirectoryView /></ProtectedRoute>} />
                  <Route path="/portal/announcements" element={<ProtectedRoute><AnnouncementsFeed /></ProtectedRoute>} />
                  <Route path="/portal/certificates" element={<ProtectedRoute><CertificateManager /></ProtectedRoute>} />
                  <Route path="/portal/cms" element={<ProtectedRoute><SiteContentManager /></ProtectedRoute>} />
                  <Route path="/portal/migration" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
                  <Route path="/portal/ledger" element={<Navigate to="/portal/dashboard" replace />} />
                  <Route path="/portal/settings" element={<Navigate to="/portal/dashboard" replace />} />

                  {/* ── Legacy routes redirect to portal login (security hardening) ── */}
                  <Route path="/dashboard" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/ledger" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/roster" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/admin" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/admin/people" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/admin/applicants" element={<Navigate to="/portal/login" replace />} />
                  <Route path="/admin/squads" element={<Navigate to="/portal/login" replace />} />

                  {/* ── Utility & Error Routes ── */}
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="/500" element={<ServerErrorPage />} />
                  <Route path="/403" element={<AccessDeniedPage />} />
                  <Route path="/401" element={<UnauthorizedPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/offline" element={<OfflinePage />} />

                  {/* ── Wildcard Fallback Route (404) ── */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </PageContainer>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </AppProvider>
  );
};
