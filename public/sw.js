const CACHE_NAME = 'lilo-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Clone the response
            const responseClone = fetchResponse.clone();
            
            // Cache successful responses
            if (fetchResponse.status === 200) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            
            return fetchResponse;
          })
          .catch(() => {
            // Fallback for offline scenarios
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            
            // Return a basic offline response
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message || 'You have a new notification',
      icon: '/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png',
      badge: '/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Lilo Notification', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background tasks here
      console.log('Service Worker: Performing background sync')
    );
  }
});