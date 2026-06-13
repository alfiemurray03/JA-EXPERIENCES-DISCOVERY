/**
 * FeatureConfigContext
 * Loads public feature toggles + accessibility settings from /api/system-config/public.
 * Provides useFeatureConfig() hook throughout the app.
 *
 * Defaults: all features enabled, maintenance off — so the app works even
 * if the API call fails (e.g. DB not ready yet).
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface FeatureConfig {
  registration:    boolean;
  pdf_export:      boolean;
  word_export:     boolean;
  new_templates:   boolean;
  usage_analytics: boolean;
  maintenance:     boolean;
  payments:        boolean;

  // Accessibility bubble
  a11y_enabled:        boolean;
  a11y_position:       'bottom-right' | 'bottom-left';
  a11y_feat_font_size: boolean;
  a11y_feat_contrast:  boolean;
  a11y_feat_motion:    boolean;
  a11y_feat_dyslexia:  boolean;
  a11y_feat_links:     boolean;
  a11y_feat_grayscale: boolean;
}

const DEFAULTS: FeatureConfig = {
  registration:    true,
  pdf_export:      true,
  word_export:     true,
  new_templates:   true,
  usage_analytics: true,
  maintenance:     false,
  payments:        false, // OFF by default — admin must explicitly enable

  a11y_enabled:        true,
  a11y_position:       'bottom-right',
  a11y_feat_font_size: true,
  a11y_feat_contrast:  true,
  a11y_feat_motion:    true,
  a11y_feat_dyslexia:  true,
  a11y_feat_links:     true,
  a11y_feat_grayscale: true,
};

interface FeatureConfigContextType {
  config: FeatureConfig;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const FeatureConfigContext = createContext<FeatureConfigContextType>({
  config: DEFAULTS,
  isLoading: true,
  refresh: async () => {},
});

export function FeatureConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FeatureConfig>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/system-config/public');
      if (!res.ok) return;
      const data = await res.json() as { success: boolean; config?: Partial<FeatureConfig> };
      if (data.success && data.config) {
        setConfig({ ...DEFAULTS, ...data.config });
      }
    } catch {
      // Fail silently — defaults remain active
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <FeatureConfigContext.Provider value={{ config, isLoading, refresh }}>
      {children}
    </FeatureConfigContext.Provider>
  );
}

export function useFeatureConfig(): FeatureConfigContextType {
  return useContext(FeatureConfigContext);
}
