// Service Worker for instant updates
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response(
                '<h1>Offline</h1><p>Titan IDE is offline. Please check your connection.</p>',
                {
                    headers: { 'Content-Type': 'text/html' }
                }
            );
        })
    );
});