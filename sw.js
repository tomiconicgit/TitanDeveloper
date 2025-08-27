/*
File: /sw.js
*/

const CACHE_NAME = 'titan-dev-cache-v2'; // Updated cache name
const urlsToCache = ['/', '/index.html', '/styles.css', '/app.js', '/code-engine.js', '/db.js', '/error.js', '/manifest.json', '/icon.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    console.log('Deleting old cache:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const cacheFirst = async () => {
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || fetch(event.request);
    };

    const networkFirst = async () => {
        try {
            const response = await fetch(event.request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
            return response;
        } catch (error) {
            const cachedResponse = await caches.match(event.request);
            return cachedResponse || new Response('<h1>Offline</h1><p>Titan Developer is offline. Please check your connection.</p>', {
                headers: { 'Content-Type': 'text/html' }
            });
        }
    };

    event.respondWith(event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com') ? networkFirst() : cacheFirst());
});