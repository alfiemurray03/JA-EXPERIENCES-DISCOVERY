import { useEffect, useRef } from 'react';

/**
 * Trustpilot TrustBox Widget Component
 * 
 * @param businessUnitId - Your Trustpilot Business Unit ID
 * @param templateId - TrustBox template ID (default: mini carousel)
 * @param height - Widget height (default: 140px)
 * @param theme - light or dark (default: light)
 */

interface TrustpilotWidgetProps {
  businessUnitId: string;
  templateId?: string;
  height?: string;
  width?: string;
  theme?: 'light' | 'dark';
  stars?: string;
}

export function TrustpilotWidget({
  businessUnitId,
  templateId = '53aa8912dec7e10d38f59f36', // Mini carousel
  height = '140px',
  width = '100%',
  theme = 'light',
  stars = '4,5'
}: TrustpilotWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for Trustpilot script to load
    const loadWidget = () => {
      if (window.Trustpilot) {
        window.Trustpilot.loadFromElement(ref.current, true);
      } else {
        // Retry after a short delay if script hasn't loaded yet
        setTimeout(loadWidget, 100);
      }
    };

    loadWidget();
  }, [businessUnitId, templateId, height, width, theme, stars]);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-GB"
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-style-height={height}
      data-style-width={width}
      data-theme={theme}
      data-stars={stars}
      style={{ minHeight: height }}
    >
      <a
        href="https://uk.trustpilot.com/review/jagroupservices.co.uk"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors"
      >
        View our Trustpilot reviews
      </a>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, force: boolean) => void;
    };
  }
}
