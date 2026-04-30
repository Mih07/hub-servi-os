self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativado');
});

self.addEventListener('fetch', (event) => {
  // Isso permite que o app funcione online normalmente
  event.respondWith(fetch(event.request));
});