/**
 * Service Worker — FalaFácil Balcão
 * Versão: 2.1.2-auto-update
 * Estratégia: Network-First total para HTML. Atualização 100% autônoma sem necessidade de Ctrl+F5.
 */

const CACHE_NAME = 'falafacil-v2.1.2-auto-update';
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  // Ativação forçada imediata
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Limpando cache antigo para atualização automática:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
      .then(() => {
        // Notifica e recarrega todas as abas abertas sem exigir Ctrl+F5 do usuário
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            if (client.url && 'navigate' in client) {
              client.navigate(client.url);
            }
          });
        });
      })
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

  // 1. Navegação e páginas HTML: SEMPRE NETWORK-FIRST com bypass de cache do navegador
  const isHtmlRequest = event.request.mode === 'navigate' || 
                        event.request.headers.get('accept')?.includes('text/html') ||
                        url.pathname.endsWith('.html') ||
                        url.pathname === '/' ||
                        url.pathname.startsWith('/qr');

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
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
          // Se estiver 100% offline, tenta a cópia local
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 2. Arquivos Estáticos com Hash (/assets/index-*.js, .css)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return networkResponse;
      });
    })
  );
});
