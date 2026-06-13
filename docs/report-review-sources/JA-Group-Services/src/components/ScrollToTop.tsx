import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically scrolls to the top of the page when navigating to a new route
 * Uses multiple methods to ensure reliable scroll-to-top behavior
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Method 1: Immediate scroll
    window.scrollTo(0, 0);
    
    // Method 2: Force scroll after a tiny delay (catches late renders)
    const timer1 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    // Method 3: Force scroll after component mount (catches async content)
    const timer2 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    
    // Method 4: Scroll document element directly
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    
    // Method 5: Scroll body element directly
    if (document.body) {
      document.body.scrollTop = 0;
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  return null;
}
