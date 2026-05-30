const CACHE_NAME = 'gadgetflex-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/placeholder.svg'
];

// Install Event: Cache App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
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
        return fetch(request).then(response => {
          cache.put(request, response.clone());
          return response;
        }).catch(() => cache.match(request));
      })
    );
    return;
  }

  // Static Assets: Cache-First
  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
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
