// Internationalization (i18n) configuration
// Manual translation system with automatic location detection

export type SupportedLanguage = 
  | 'en' // English (default)
  | 'pt' // Portuguese
  | 'es' // Spanish
  | 'fr' // French
  | 'cy'; // Welsh (Cymraeg)

// Map country codes to languages (only for languages you've translated)
export const countryToLanguage: Record<string, SupportedLanguage> = {
  // Portuguese-speaking countries
  PT: 'pt', // Portugal
  BR: 'pt', // Brazil
  AO: 'pt', // Angola
  MZ: 'pt', // Mozambique
  
  // Spanish-speaking countries
  ES: 'es', // Spain
  MX: 'es', // Mexico
  AR: 'es', // Argentina
  CO: 'es', // Colombia
  
  // French-speaking countries
  FR: 'fr', // France
  BE: 'fr', // Belgium
  CA: 'fr', // Canada
  CH: 'fr', // Switzerland
  
  // Welsh (UK - Wales)
  GB: 'en', // United Kingdom (default English, can be changed to Welsh)
  
  // Default to English for all other countries
  US: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
};

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  cy: 'Cymraeg',
};

// Get user's country from IP geolocation API
export async function detectUserCountry(): Promise<string | null> {
  try {
    // Using ipapi.co for free IP geolocation
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('Failed to detect country:', error);
    return null;
  }
}

// Get language based on country
export function getLanguageFromCountry(countryCode: string): SupportedLanguage {
  return countryToLanguage[countryCode] || 'en';
}

// Detect and set user's language automatically
export async function detectAndSetLanguage(): Promise<SupportedLanguage> {
  // Check if user has manually selected a language
  const savedLanguage = localStorage.getItem('user-language');
  if (savedLanguage && isValidLanguage(savedLanguage)) {
    return savedLanguage as SupportedLanguage;
  }
  
  // Detect country from IP
  const countryCode = await detectUserCountry();
  if (countryCode) {
    const language = getLanguageFromCountry(countryCode);
    localStorage.setItem('detected-language', language);
    return language;
  }
  
  // Fallback to browser language
  const browserLang = navigator.language.split('-')[0];
  if (isValidLanguage(browserLang)) {
    return browserLang as SupportedLanguage;
  }
  
  // Default to English
  return 'en';
}

function isValidLanguage(lang: string): boolean {
  return ['en', 'pt', 'es', 'fr', 'cy'].includes(lang);
}

// Save user's manual language selection
export function setUserLanguage(language: SupportedLanguage): void {
  localStorage.setItem('user-language', language);
}

// Get current language
export function getCurrentLanguage(): SupportedLanguage {
  const userLang = localStorage.getItem('user-language');
  if (userLang && isValidLanguage(userLang)) {
    return userLang as SupportedLanguage;
  }
  
  const detectedLang = localStorage.getItem('detected-language');
  if (detectedLang && isValidLanguage(detectedLang)) {
    return detectedLang as SupportedLanguage;
  }
  
  return 'en';
}
