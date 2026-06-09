const CACHE_NAME = 'gadgetflex-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/placeholder.svg'
];

// Install Event: Cache App Shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate for API, Cache-First for Assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass cache for non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // API Requests: Stale-While-Revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(request)
          .then(response => {
            // Only cache successful responses
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network failed — try cache, otherwise return a 503 response
            console.error('SW fetch failed for', request.url, err);
            return cache.match(request).then(cached => cached || new Response('Service Unavailable', { status: 503, statusText: 'Service Unavailable' }));
          });
      })
    );
    return;
  }

  // Static Assets: Cache-First
  event.respondWith(
    caches.match(request).then(response => {
      if (response) return response;
      return fetch(request).catch(err => {
        console.error('SW asset fetch failed for', request.url, err);
        return new Response('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Notification', body: 'New update from GadgetFlex' };
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
