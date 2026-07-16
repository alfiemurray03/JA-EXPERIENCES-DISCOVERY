export interface PortalNavItem {
  id: string;
  label: string;
  href: string;
  defaultVisible: boolean;
}

export interface PortalNavSection {
  id: string;
  label: string;
  items: PortalNavItem[];
  defaultVisible: boolean;
}

export interface PortalNavOverrides {
  visibility: Record<string, boolean>;
}

/** Customer navigation is intentionally limited to experience planning. */
export const DEFAULT_PORTAL_NAV: PortalNavSection[] = [
  {
    id: 'overview', label: 'OVERVIEW', defaultVisible: true,
    items: [{ id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard', defaultVisible: true }],
  },
  {
    id: 'planning', label: 'EXPERIENCE PLANNING', defaultVisible: true,
    items: [{ id: 'nav-builders', label: 'Experience Builders', href: '/builders', defaultVisible: true }],
  },
  {
    id: 'account', label: 'ACCOUNT', defaultVisible: true,
    items: [
      { id: 'nav-billing', label: 'Subscription & Billing', href: '/settings#billing', defaultVisible: true },
      { id: 'nav-settings', label: 'Settings', href: '/settings', defaultVisible: true },
      { id: 'nav-support', label: 'Support', href: '/support', defaultVisible: true },
    ],
  },
];

export function applyPortalNavOverrides(sections: PortalNavSection[], overrides: PortalNavOverrides): PortalNavSection[] {
  return sections
    .filter(section => overrides.visibility[section.id] ?? section.defaultVisible)
    .map(section => ({
      ...section,
      items: section.items.filter(item => overrides.visibility[item.id] ?? item.defaultVisible),
    }))
    .filter(section => section.items.length > 0);
}
