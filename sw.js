// ARP Service Worker // Cache Offline & Resiliência
const CACHE_NAME = 'arp-v4.2';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './articles.json',
  './css/landing.css',
  './css/article-sidebar.css',
  './js/landing.js',
  './js/article-sidebar.js',
  './arp-favicon.png',
  './arp-logo-branco-transparente.png',
  './arp-logo-azul-transparente.png',
  './articles/artigo-da-matematica-ao-objeto-real.html',
  './articles/artigo-superwood-celulose-densificada.html',
  './articles/artigo-biocompostos-fibras-eco-resinas.html',
  './articles/artigo-geopolimeros-solo-ceramica-a-frio.html',
  './articles/artigo-micromecanica-celulose-geometry-kernels.html',
  './articles/artigo-regeneracao-solo-biotecnologia-residuos.html',
  './downloads/ARP-01_gyroid_tpms_sdf_generator.py',
  './downloads/ARP-02_superwood_densification_kinetics.csv',
  './downloads/ARP-04_soil_geopolymer_alkaline_activation.csv',
  './downloads/ARP-05_micromechanics_picogk_anisotropy.py',
  './downloads/ARP-06_biochar_hugel_soil_regeneration.csv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('[ARP SW] Falha ao pré-cachear alguns assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Apenas intercepta requisições HTTP / HTTPS do mesmo domínio ou Google Fonts
  if (!url.protocol.startsWith('http')) return;

  // Estratégia Stale-While-Revalidate para artigos e dados
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      const fetchPromise = fetch(req)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
