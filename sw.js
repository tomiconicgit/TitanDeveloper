/*
File: /sw.js
*/

// Service Worker for a robust offline-first PWA.

const CACHE_NAME = 'titan-dev-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/code-engine.js',
    '/db.js',
    '/error.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Cache-first strategy for static assets
    const cacheFirst = async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return fetch(event.request);
    };

    // Network-first strategy for API calls (like Gemini) or other dynamic content
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

    // Determine strategy based on request type
    if (event.request.url.includes('gemini.google.com')) {
        event.respondWith(networkFirst());
    } else {
        event.respondWith(cacheFirst());
    }
});
