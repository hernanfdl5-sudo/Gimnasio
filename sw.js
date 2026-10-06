// Service worker: guarda la app en caché para que funcione sin internet.
// Al cambiar el número de versión se actualiza la caché en el próximo arranque.
const CACHE = 'gimnasio-v1.5';
const ARCHIVOS = ['./', './index.html', './styles.css', './data.js', './store.js', './animaciones.js', './app.js', './manifest.json', './icon.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Red primero y si falla, caché. Así siempre que haya internet se ve la última versión.
// cache: 'no-cache' obliga a preguntarle al servidor si cambió, en vez de confiar en la memoria del navegador.
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET' || !ev.request.url.startsWith(self.location.origin)) return;
  ev.respondWith(
    fetch(ev.request, { cache: 'no-cache' }).then(resp => {
      const copia = resp.clone();
      caches.open(CACHE).then(c => c.put(ev.request, copia));
      return resp;
    }).catch(() => caches.match(ev.request))
  );
});
