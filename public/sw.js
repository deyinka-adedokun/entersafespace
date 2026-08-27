const CACHE_NAME = 'safespace-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable.png'
];

// 1. Install Phase - Pre-cache Offline Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Phase - Clear Stale Caches & Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Update Detection & Skip Waiting Control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Strategy - Stale-While-Revalidate for Assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET and API calls from SW cache
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML navigation, serve cached offline shell
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 5. Push Notification Handler
self.addEventListener('push', (event) => {
  let data = { title: 'Safespace Notification', body: 'You have a new update from Safespace.', icon: '/pwa-192.png' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192.png',
    badge: '/pwa-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.actionUrl || '/'
    },
    actions: [
      { action: 'open', title: 'Open Safespace' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 6. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
