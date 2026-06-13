import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';

// Updated: 2026-02-25 - Clean production header
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-24 md:h-28 lg:h-32 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/airo-assets/images/pages/unknown/ja-group-services-ltd"
              alt="JA Group Services Ltd"
              className="h-20 md:h-24 lg:h-28 w-auto" />

          </Link>

          {/* Phone Number - Desktop Only */}
          <a
            href="tel:02038342790"
            className="hidden md:flex items-center gap-2 text-[#0A1F44] hover:text-primary transition-colors font-medium">

            <Phone className="h-5 w-5" />
            <span className="text-sm lg:text-base">020 3834 2790</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors px-4 py-2 text-sm font-medium">
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="text-foreground hover:text-primary transition-colors px-4 py-2 text-sm font-medium bg-transparent border-none outline-none">
                {t('header.divisions', language)}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[250px] bg-white/95 backdrop-blur-md border-white/20">
                <DropdownMenuItem asChild>
                  <a
                    href="https://jadomainhub.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer">
                    <div>
                      <div className="font-medium">JA Domain Hub</div>
                      <div className="text-xs text-muted-foreground">Domain, Email & Hosting Services</div>
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about-our-divisions" className="cursor-pointer">
                    <div>
                      <div className="font-medium">{t('header.divisions.about', language)}</div>
                      <div className="text-xs text-muted-foreground">Learn more about our services</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/contactus"
              className="text-foreground hover:text-primary transition-colors px-4 py-2 text-sm font-medium">
              {t('header.contact', language)}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="text-foreground hover:text-primary transition-colors px-4 py-2 text-sm font-medium bg-transparent border-none outline-none">
                {t('header.company', language)}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] bg-white/95 backdrop-blur-md border-white/20">
                <DropdownMenuItem asChild>
                  <Link to="/about-us" className="cursor-pointer">
                    {t('header.company.about', language)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/our-group-structure" className="cursor-pointer">
                    {t('header.company.structure', language)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/jsds-group" className="cursor-pointer">
                    <div>
                      <div className="font-medium">JSDS Group Ltd</div>
                      <div className="text-xs text-muted-foreground">{t('footer.company.parent', language)}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/corporate" className="cursor-pointer">
                    {t('header.company.corporate', language)}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu">

            {mobileMenuOpen ?
            <X className="h-6 w-6" /> :

            <Menu className="h-6 w-6" />
            }
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen &&
        <div className="lg:hidden py-4 border-t border-border">
            {/* Phone Number - Mobile */}
            <a
            href="tel:02038342790"
            className="flex items-center gap-2 text-[#0A1F44] hover:text-primary transition-colors font-medium py-3 border-b border-border mb-4">

              <Phone className="h-5 w-5" />
              <span className="text-base">020 3834 2790</span>
            </a>

            <nav className="flex flex-col space-y-4">
              <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}>

                Home
              </Link>

              <div className="space-y-2">
                <div className="text-foreground text-sm font-medium py-2">
                  {t('header.divisions', language)}
                </div>
                <div className="pl-4 space-y-2">
                  <a
                  href="https://jadomainhub.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}>

                    JA Domain Hub
                  </a>
                  <Link
                  to="/about-our-divisions"
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}>

                    {t('header.divisions.about', language)}
                  </Link>
                </div>
              </div>

              <Link
              to="/contactus"
              className="text-foreground hover:text-primary transition-colors py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}>

                {t('header.contact', language)}
              </Link>

              <div className="space-y-2">
                <div className="text-foreground text-sm font-medium py-2">
                  {t('header.company', language)}
                </div>
                <div className="pl-4 space-y-2">
                  <Link
                  to="/about-us"
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}>

                    {t('header.company.about', language)}
                  </Link>
                  <Link
                  to="/our-group-structure"
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}>

                    {t('header.company.structure', language)}
                  </Link>
                  <Link
                  to="/jsds-group"
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}>

                    JSDS Group Ltd
                  </Link>
                  <Link
                  to="/corporate"
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}>

                    {t('header.company.corporate', language)}
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        }
      </div>
    </header>);

}