import { Link } from 'react-router-dom';

function CMYKMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-hidden="true">
      <div className="w-3 h-3 rounded-full bg-[#00AEEF] opacity-80" />
      <div className="w-3 h-3 rounded-full bg-[#EC008C] opacity-80 -ml-1.5" />
      <div className="w-3 h-3 rounded-full bg-[#FFF200] opacity-80 -ml-1.5" />
      <div className="w-3 h-3 rounded-full bg-[#231F20] opacity-80 -ml-1.5" />
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/airo-assets/images/logo/horizontal?variant=solid"
                alt="JA Print Studio"
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-background/60 leading-relaxed mb-6">
              Premium custom print services. Submit your request and we'll get back to you with a tailored quote.
            </p>
            <CMYKMark />
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-background/40 mb-5">Services</h4>
            <ul className="space-y-3">
              {['Business Cards', 'Flyers & Leaflets', 'Posters & Banners', 'Stickers & Labels', 'Menus', 'Document Printing', 'Custom Print'].map((item) => (
                <li key={item}>
                  <Link to="/what-we-print" className="text-sm text-background/70 hover:text-background transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-background/40 mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'Portfolio', href: '/portfolio' },
                { label: 'Get a Quote', href: '/quote' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-background/40 mb-5">Get in Touch</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:Hello@jagroupservices.co.uk" className="text-sm text-background/70 hover:text-background transition-colors">
                  Hello@jagroupservices.co.uk
                </a>
              </li>
              <li>
                <Link to="/quote" className="text-sm text-background/70 hover:text-background transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-background/70 hover:text-background transition-colors">
                  Send an Enquiry
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="text-xs text-background/40">
            JA Print Studio is a trading brand/service operated by JA Group Services Ltd. &copy; {currentYear}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-xs text-background/40 hover:text-background/70 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-background/40 hover:text-background/70 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
