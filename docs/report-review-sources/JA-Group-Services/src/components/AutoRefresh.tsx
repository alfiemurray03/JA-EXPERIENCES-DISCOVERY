import { useEffect, useRef } from 'react';

/**
 * Auto-refresh component that checks for site updates
 * and automatically reloads the page when changes are detected
 */
export function AutoRefresh() {
  const lastModifiedRef = useRef<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for updates every 3 seconds
    const checkForUpdates = async () => {
      try {
        // Use HEAD request to check Last-Modified header without downloading content
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-cache',
        });

        const lastModified = response.headers.get('Last-Modified');
        
        if (lastModified) {
          // First time - just store the value
          if (lastModifiedRef.current === null) {
            lastModifiedRef.current = lastModified;
          } 
          // Site has been updated - reload
          else if (lastModifiedRef.current !== lastModified) {
            console.log('Site updated detected - reloading...');
            window.location.reload();
          }
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.debug('Auto-refresh check failed:', error);
      }
    };

    // Start checking for updates
    checkIntervalRef.current = setInterval(checkForUpdates, 3000);

    // Cleanup on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
