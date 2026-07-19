const CACHE_NAME = 'ja-plan-studio-shell-v3';
const PUBLIC_LAUNCH = '/?source=pwa&launch=public-v3';
const SHELL = ['/', PUBLIC_LAUNCH, '/manifest.webmanifest?v=3', '/pwa-icon.svg', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isProtectedNavigation(pathname) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
    pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/account' || pathname.startsWith('/account/') ||
    pathname === '/sign-in' || pathname.startsWith('/sign-in/');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authenticated APIs, identity callbacks, logout responses or protected portals.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/logout') ||
    url.pathname.includes('/callback') ||
    isProtectedNavigation(url.pathname)
  ) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(PUBLIC_LAUNCH)) || (await caches.match('/'))),
    );
    return;
  }

  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        });
        return cached || network;
      }),
    );
  }

  // Always revalidate the manifest so installed apps receive new launch metadata.
  if (request.destination === 'manifest') {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match('/manifest.webmanifest?v=3')));
  }
});
