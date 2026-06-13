import { useLanguage } from '@/components/LanguageProvider';
import TranslationDisclaimer from './TranslationDisclaimer';

interface PageWithTranslationNoticeProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that shows translation disclaimer when non-English language is selected
 */
export default function PageWithTranslationNotice({ children }: PageWithTranslationNoticeProps) {
  const { language } = useLanguage();
  const showDisclaimer = language !== 'en';

  return (
    <>
      {showDisclaimer && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-4">
            <TranslationDisclaimer />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
