const CACHE_NAME = "ousuisje-cache-v71";
const ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./beta.html",
  "./confidentialite.html",
  "./mentions-legales.html",
  "./styles.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./data/departements.min.json",
  "./data/communes.min.csv",
  "./data/drinking-water.min.csv"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ne jamais intercepter les appels d'API, les tuiles de carte ou les libs tierces
  const url = event.request.url;
  if (
    url.includes("nominatim.openstreetmap.org") ||
    url.includes("tile.openstreetmap.org") ||
    url.includes("unpkg.com") ||
    url.includes("countapi.mileshilliard.com") ||
    url.includes("data.geopf.fr") ||
    url.includes("overpass-api.de") ||
    url.includes("api.open-elevation.com") ||
    url.includes("api.rainviewer.com") ||
    url.includes("tilecache.rainviewer.com")
  ) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
