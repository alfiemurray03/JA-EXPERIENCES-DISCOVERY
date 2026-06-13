import { motion } from 'motion/react';
import { Search } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  showSearch?: boolean;
}

export function AppHeader({ title, showSearch = false }: AppHeaderProps) {

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-gradient-to-r from-[#0A1F44] to-[#2563EB] text-white shadow-lg safe-area-inset-top"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1.5 shadow-lg">
              <img
                src="/images/367f316379e78929865b1677b6370686.jpg"
                alt="JA Group"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              <p className="text-xs text-white/80">JA Group Services</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}