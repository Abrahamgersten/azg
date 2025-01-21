// Service Worker: אחסון אופליין לחלוטין
const CACHE_NAME = 'gratitude-app-offline-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './background.jpg',
  './favicon.ico'
  // הסרנו גישה לאינטרנט, אין Hebcal או Google Fonts
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache offline');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        if (response) {
          return response;
        }
        // ננסה להביא מהקאש בלבד (לא ניגשים לרשת בכלל)
        return fetch(event.request).catch(() => {
          // Fallback
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
})
