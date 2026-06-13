const CACHE_NAME = 'music-radio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;900&family=Roboto+Mono:wght@300;400&display=swap'
];

// Установка: кэшируем базовые файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Запросы: сеть + кэш (для стримов — только сеть)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Аудиопотоки НЕ кэшируем
  if (url.pathname.includes('.mp3') || url.pathname.includes('.aac') || 
      url.hostname.includes('stream') || url.hostname.includes('ice')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});