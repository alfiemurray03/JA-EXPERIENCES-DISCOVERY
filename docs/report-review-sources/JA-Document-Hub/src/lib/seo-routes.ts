/**
 * Agent-editable registry of publicly-crawlable routes. Consumed by the
 * /sitemap.xml handler in src/server/entry.ts.
 *
 * Guidelines for maintaining this file:
 * - Add a new entry whenever you add a new publicly-crawlable page.
 * - Do not include dynamic-param routes like "/products/:id" directly.
 *   Instead, enumerate real values (e.g. "/products/desk-pro") or skip.
 * - `path` MUST start with "/".
 * - Priorities are between 0.0 and 1.0. Home = 1.0, main sections = 0.8,
 *   deep pages = 0.5.
 * - Dev-only or auth-required routes MUST NOT be listed.
 */

export interface SeoRoute {
	path: string;
	changefreq?:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	priority?: number;
	lastmod?: string;
}

export const seoRoutes: SeoRoute[] = [
	{ path: "/",                      changefreq: "weekly",  priority: 1.0 },
	{ path: "/pricing",               changefreq: "monthly", priority: 0.8 },
	{ path: "/templates",             changefreq: "weekly",  priority: 0.8 },
	{ path: "/contact",               changefreq: "yearly",  priority: 0.5 },
	{ path: "/affiliate",             changefreq: "monthly", priority: 0.5 },
	{ path: "/partners",              changefreq: "monthly", priority: 0.6 },
	{ path: "/reseller/apply",        changefreq: "monthly", priority: 0.5 },
	{ path: "/plans/personal",        changefreq: "monthly", priority: 0.6 },
	{ path: "/plans/standard",        changefreq: "monthly", priority: 0.6 },
	{ path: "/plans/professional",    changefreq: "monthly", priority: 0.6 },
	{ path: "/plans/org-starter",     changefreq: "monthly", priority: 0.6 },
	{ path: "/plans/org-growth",      changefreq: "monthly", priority: 0.6 },
	{ path: "/plans/org-professional",changefreq: "monthly", priority: 0.6 },
	{ path: "/terms",                 changefreq: "yearly",  priority: 0.3 },
	{ path: "/privacy",               changefreq: "yearly",  priority: 0.3 },
	{ path: "/cookies",               changefreq: "yearly",  priority: 0.3 },
];
