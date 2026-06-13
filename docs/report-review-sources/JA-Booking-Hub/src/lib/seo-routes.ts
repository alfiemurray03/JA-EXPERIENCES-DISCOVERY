/**
 * SEO Routes Registry
 * Used to generate /sitemap.xml
 * Only include public-facing, indexable routes here.
 */
export interface SeoRoute {
  path: string;
  priority: number;
  changefreq: string;
  lastmod?: string;
}

export const seoRoutes: SeoRoute[] = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly',
  },
  {
    path: '/pricing',
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/categories',
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/login',
    priority: 0.3,
    changefreq: 'yearly',
  },
  {
    path: '/register',
    priority: 0.7,
    changefreq: 'monthly',
  },
];
