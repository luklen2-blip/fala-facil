/**
 * Service Worker — FalaFácil Balcão
 * Versão: 2.1.0-definitivo
 * Estratégia: Network-First para HTML e navegação (evita o problema de cache preso em dispositivos móveis)
 * com fallback offline automático.
 */

const CACHE_NAME = 'falafacil-v2.1.0-definitivo';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purgando cache antigo e atualizando definitivamente:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'PURGE_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // APIs do backend nunca são cacheadas
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navegação e páginas HTML: SEMPRE NETWORK-FIRST
  // Garante que o usuário sempre receba a versão mais recente do site
  const isHtmlRequest = event.request.mode === 'navigate' || 
                        event.request.headers.get('accept')?.includes('text/html') ||
                        url.pathname.endsWith('.html') ||
                        url.pathname === '/';

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline se a rede falhar
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/index.html') || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Arquivos Estáticos com Hash (CSS, JS, Imagens, Fontes)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => null);

      return cached || fetchPromise;
    })
  );
});
