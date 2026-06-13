import { Home, Compass, Building2, Phone, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Building2, label: 'Services', path: '/recommended-services' },
  { icon: Phone, label: 'Contact', path: '/contactus' },
];

const menuItems = [
  { label: 'Activities & Tours', path: '/find-activities-tours' },
  { label: 'About Us', path: '/about-us' },
  { label: 'Our Divisions', path: '/about-our-divisions' },
  { label: 'Corporate', path: '/corporate' },

  { label: 'Sitemap', path: '/sitemap' },
];

export function AppBottomNav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl safe-area-inset-bottom"
      >
        <div className="grid grid-cols-4 h-24">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-50"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <Icon
                    className={`h-8 w-8 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  />
                  <span
                    className={`text-base font-bold transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
          
          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-2">
                <Menu className="h-8 w-8 text-gray-600" />
                <span className="text-base font-bold text-gray-600">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
              <div className="py-6">
                <h2 className="text-xl font-bold mb-6 px-4">More Options</h2>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-base font-medium text-gray-900">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>
      
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-32 md:h-28" />
    </>
  );
}