import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Hide footer on dashboard and admin routes
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  if (isDashboard || isAdmin) return null;

  const footerLinks = {
    Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Business Categories', href: '/categories' }],

    Company: [
    { label: 'About JA Group Services', href: 'https://jagroupservices.co.uk', external: true },
    { label: 'Contact Us', href: 'mailto:hello@jabooking.jagroupservices.co.uk', external: true }],

    Support: [
    { label: 'Help Centre', href: '#' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }]

  };

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/airo-assets/images/logo/horizontal"
                alt="JABooking"
                className="h-10 w-auto object-contain shrink-0 brightness-0 invert" />
              
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The booking platform built for every business. From barbers to personal trainers — get booked, get paid, grow.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) =>
          <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) =>
              <li key={link.label}>
                    {'external' in link && link.external ?
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors">
                  
                        {link.label}
                      </a> :

                <Link
                  to={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors">
                  
                        {link.label}
                      </Link>
                }
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            © {currentYear} JABooking · Part of{' '}
            <a
              href="https://jagroupservices.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors">JA Group Services Ltd


            </a>
          </p>
          <p className="text-xs text-slate-600">
            jabooking.jagroupservices.co.uk
          </p>
        </div>
      </div>
    </footer>);

}