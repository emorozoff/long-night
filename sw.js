// Long Night — service worker. Документ грузим network-first (свежая игра),
// ассеты (музыка/иконки) cache-first (быстро + офлайн).
// ВАЖНО: при каждом деплое менять номер версии кэша, иначе старые ассеты залипнут.
const CACHE = 'longnight-0.60';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './art/menubg.jpg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png',
  './music/track1.mp3', './music/track2.mp3', './music/track3.mp3',
  './music/track4.mp3', './music/track5.mp3'
];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isDoc = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isDoc) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const c = resp.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c).catch(() => {})); return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
        const c = resp.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c).catch(() => {})); return resp;
      }).catch(() => r))
    );
  }
});
