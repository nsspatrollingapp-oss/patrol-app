const CACHE = "patrol-v1";
const FILES = [
  "/",
  "/index.html",
  "/form.html",
  "/css/style.css",
  "/js/app.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
