import { AlertCircle, Languages } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Translation Disclaimer Component
 * 
 * Displays a notice about automated translations provided by Google Translate.
 * Should be shown when users select a non-English language.
 */
export default function TranslationDisclaimer() {
  return (
    <Alert className="border-amber-200 bg-amber-50 mb-6">
      <div className="flex items-start gap-3">
        <Languages className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertDescription className="text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold">Translation Notice:</strong> This page has been automatically translated using Google Translate. 
            While we strive for accuracy, automated translations may contain errors or inaccuracies. 
            For legal or official matters, please refer to the original English version. 
            JA Group Services Ltd is not responsible for any translation errors or misinterpretations.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
