function isStandaloneApp(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function installPwaSupport() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (import.meta.env.MODE === 'development') return;

  if (isStandaloneApp()) {
    document.documentElement.dataset.displayMode = 'standalone';
    document.cookie = 'ja_pwa_mode=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=6', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        void registration.update();
      })
      .catch((error) => {
        console.warn('JA Plan Studio service worker registration failed.', error);
      });
  }, { once: true });
}
