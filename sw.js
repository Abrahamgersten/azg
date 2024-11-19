const CACHE_NAME = 'gratitude-app-v6'; // עדכון גרסת המטמון
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './icon-192x192.png',
    './icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap'
];

// התקנה של ה-Service Worker והוספת הקבצים למטמון
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// הפעלת ה-Service Worker והסרת מטמונים ישנים
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

// התערבות בבקשות הרשת וניסיון להחזיר מהמטמון תחילה
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // אם נמצא בקאש, נחזיר אותו
                if (response) {
                    return response;
                }
                // אחרת, נטען מהאינטרנט ונוסיף לקאש
                return fetch(event.request).then(
                    fetchResponse => {
                        // בדיקה אם הבקשה הייתה מוצלחת
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return fetchResponse;
                    }
                );
            })
            .catch(() => {
                // דף fallback במקרה של כשל בטעינה
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});
