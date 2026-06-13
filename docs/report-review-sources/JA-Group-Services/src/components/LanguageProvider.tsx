import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { detectAndSetLanguage, getCurrentLanguage, setUserLanguage, type SupportedLanguage, languageNames } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-detect language on mount
    detectAndSetLanguage().then((detectedLang) => {
      setLanguageState(detectedLang);
      setIsLoading(false);
    });
  }, []);

  const handleSetLanguage = (lang: SupportedLanguage) => {
    setUserLanguage(lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Language Switcher Component
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: SupportedLanguage[] = ['en', 'cy', 'pt', 'es', 'fr']; // UK languages first

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-white text-[#0A1F44] border-[#0A1F44]/20 hover:bg-[#0A1F44] hover:text-white">
          <Globe className="h-4 w-4" />
          <span>{languageNames[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[400px] overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? 'bg-accent' : ''}
          >
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
