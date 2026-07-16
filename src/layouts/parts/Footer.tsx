import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useBranding } from '@/lib/branding';
import { openInstallModal } from '@/components/InstallAppModal';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Builders',    href: '/#features' },
      { label: 'Pricing',     href: '/#pricing' },
      { label: 'FAQ',         href: '/#faq' },
      { label: 'Help Centre', href: '/support' },
      { label: 'Install App', href: '__install__' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact Support',  href: '/support' },
      { label: 'Report an Issue',  href: '/support' },
      { label: 'Service Status',   href: '/status' },
      { label: 'Help Centre',      href: '/support' },
      { label: 'JA Group Services Ltd', href: 'https://jagroupservices.co.uk', external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service',    href: '/terms' },
      { label: 'Privacy Policy',      href: '/privacy' },
      { label: 'Cookie Policy',       href: '/cookies' },
      { label: 'Acceptable Use',      href: '/acceptable-use' },
      { label: 'Refund Information',  href: '/pricing' },
      { label: 'Complaints',          href: '/contact' },
      { label: 'Report an Issue',     href: '/support' },
      { label: 'Security & Privacy',  href: '/privacy-settings' },
      { label: 'Accessibility',       href: '/accessibility-support' },
      { label: 'Eligibility',         href: '/terms' },
      { label: 'Data Retention',      href: '/privacy' },
      { label: 'Data Subject Rights', href: '/privacy' },
    ],
  },
];

function InstallAppLink({ label }: { label: string }) {
  return (
    <button
      onClick={openInstallModal}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
    >
      {label}
    </button>
  );
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.href === '__install__') {
    return <InstallAppLink label={link.label} />;
  }
  if (link.external || link.href.startsWith('http')) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        {link.label} <ExternalLink className="w-3 h-3 shrink-0" />
      </a>
    );
  }
  return (
    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {link.label}
    </Link>
  );
}

export default function Footer() {
  const branding = useBranding();
  const year = new Date().getFullYear();

  // Parse footer_links from branding; fall back to defaults
  let columns: FooterColumn[] = DEFAULT_FOOTER_COLUMNS;
  if (branding.footer_links) {
    try {
      const parsed = JSON.parse(branding.footer_links);
      if (Array.isArray(parsed) && parsed.length > 0) columns = parsed;
    } catch { /* use defaults */ }
  }

  return (
    <footer className="border-t border-border bg-card" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-10"
          style={{ gridTemplateColumns: `1fr repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {/* Brand column */}
          <div className="sm:col-span-1">
            <Link to="/" className="inline-block mb-4">
              {branding.platform_logo_url ? (
                <img
                  src={branding.platform_logo_url}
                  alt={branding.platform_name || 'JA Plan Studio'}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span className="font-extrabold text-lg text-foreground">
                  JA <span className="text-primary">Plan Studio</span>
                </span>
              )}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {branding.platform_description || 'Create letters, contracts, invoices, policies, forms, reports and more from one secure JA Plan Studio account.'}
            </p>
            {branding.support_email && (
              <a
                href={`mailto:${branding.support_email}`}
                className="text-sm text-primary hover:underline transition-colors font-medium break-all leading-relaxed inline-block max-w-full"
                style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
              >
                {branding.support_email}
              </a>
            )}
          </div>

          {/* Dynamic columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            © {year} {branding.platform_name || 'JA Plan Studio'}. All rights reserved.
            {branding.footer_tagline ? ` ${branding.footer_tagline}.` : ''}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            JA Plan Studio is a service brand operated by JA Group Services Ltd, a company registered in England and Wales. The service provides professional document-building tools for individuals and organisations.
          </p>
          <p className="text-xs text-muted-foreground">
            Separate terms may apply to electronic-signing, payment or other connected services where used.
          </p>
        </div>
      </div>
    </footer>
  );
}
