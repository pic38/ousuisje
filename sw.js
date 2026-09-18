const CACHE_NAME = "ousuisje-cache-v101";
const ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./confidentialite.html",
  "./mentions-legales.html",
  "./styles.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  // departements.min.json / communes.min.csv retirés du précache : ces données ne concernent
  // que la France (section "Département et commune") et ne sont désormais chargées qu'à la
  // demande — soit automatiquement une fois l'utilisateur détecté en France (voir
  // markInFrance() dans index.html), soit au premier clic sur la section pour les autres.
  // Elles restent mises en cache au moment où elles sont effectivement récupérées, via le
  // gestionnaire fetch générique ci-dessous.
  "./data/drinking-water.min.csv",
  "./data/toilets.min.csv",
  "./vendor/leaflet/leaflet.js",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/images/marker-icon.png",
  "./vendor/leaflet/images/marker-icon-2x.png",
  "./vendor/leaflet/images/marker-shadow.png",
  "./vendor/leaflet/images/layers.png",
  "./vendor/leaflet/images/layers-2x.png",
  "./vendor/fonts/fonts.css",
  "./vendor/fonts/inter-latin.woff2",
  "./vendor/fonts/inter-latin-ext.woff2",
  "./vendor/fonts/space-mono-latin.woff2",
  "./vendor/fonts/space-mono-latin-ext.woff2",
  "./vendor/fonts/space-mono-700-latin.woff2",
  "./vendor/fonts/space-mono-700-latin-ext.woff2"
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
