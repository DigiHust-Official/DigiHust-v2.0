/**
 * Route prefetch helper map
 * Triggers dynamic import on hover or focus intent so route transitions feel instantaneous.
 */
const prefetched = new Set<string>();

const routePrefetchMap: Record<string, () => Promise<unknown>> = {
  '/services': () => import('../components/public/Services'),
  '/portfolio': () => import('../components/public/Work'),
  '/how-it-works': () => import('../components/public/HowItWorks'),
  '/about': () => import('../components/public/About'),
  '/blog': () => import('../components/public/Blog'),
  '/careers': () => import('../components/public/Careers'),
  '/contact': () => import('../components/public/Contact'),
  '/portal/login': () => import('../components/portal/PortalLogin'),
  '/portal': () => import('../components/portal/PortalDashboard'),
  '/portal/dashboard': () => import('../components/portal/PortalDashboard'),
};

export const prefetchRoute = (path: string): void => {
  if (prefetched.has(path)) return;
  prefetched.add(path);
  const importer = routePrefetchMap[path];
  if (importer) {
    importer().catch(() => {
      // In case of network glitch, remove from set so it can retry
      prefetched.delete(path);
    });
  }
};
