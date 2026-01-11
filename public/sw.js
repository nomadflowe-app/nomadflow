const CACHE_NAME = 'nomadflow-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/logo.png',
  '/pwa-icon.png',
  '/hero-phones.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de Fetch: Stale-While-Revalidate para API e Cache-First para Assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Lógica para chamadas do Supabase (API) - Stale-While-Revalidate
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse); // Fallback para o cache se falhar a rede

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Lógica para Assets Estáticos e Fontes - Cache-First
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(networkResponse => {
        // Não faz cache de chamadas externas de analytics ou similares se necessário
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            cache.put(request, responseToCache);
          }
        });

        return networkResponse;
      }).catch(err => {
        console.error('[SW] Fetch failed:', err);
        // Opcional: retornar uma página offline customizada aqui
      });
    })
  );
});
