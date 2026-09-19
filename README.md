# OuSuisJe / WhereAmI

*[Version française ci-dessous](#français)*

## English

Installable web app (PWA) and Android app that show your live position, address, altitude and nearby points of interest — via your device's GPS or by simply clicking on a map. Available in **26 languages** (the 24 official languages of the European Union, Mandarin Chinese and Arabic).

🔗 [ousuisje.fun](https://ousuisje.fun) · [whereami.fun](https://whereami.fun) — same site and codebase, deployed on both domains; the default language follows the domain (French / English) but is switchable to any of the 26 languages from Settings.

### Features

- **Live position**: coordinates (decimal, DMS, DDM, plus a plain `lat, lon` copy format), horizontal accuracy, altitude, speed, heading, all refreshed continuously via `watchPosition`.
- **"GPS settings and details" panel** (collapsed by default): fix status, fix age, number of fixes received, raw unrounded accuracy, GPS time, manual altitude offset, auto-locate-on-open and auto-stop toggles.
- **Address** by reverse geocoding ([Nominatim](https://nominatim.org)/OpenStreetMap): street, locality, postcode, town, department/region, country. One-click copy, dedicated share button.
- **Interactive map** ([Leaflet](https://leafletjs.com)/OpenStreetMap): GPS marker with accuracy circle, separate marker for a manually clicked point, direct links to OpenStreetMap and Google Maps.
- **Nearby points of interest** ([Overpass API](https://overpass-api.de)): drinking water, toilets, food, plus any custom keyword the user adds from Settings.
- **Altitude comparison**: GPS altitude vs. Open-Elevation (SRTM, worldwide) or IGN RGE ALTI (more precise, France only).
- **Precipitation radar** ([RainViewer](https://www.rainviewer.com)).
- **France-only features**, gated by detected location rather than by build: 2G/3G/4G/5G cell-tower search (offline, [ANFR](https://data.anfr.fr) dataset), department/commune identification (offline, IGN Admin Express). These sections stay hidden until your position is detected in France, then appear automatically.
- **Offline-capable**: once installed, most features keep working without a connection using locally downloaded datasets; only the features that query a live third-party service (address, altitude comparison, other points of interest, radar) need an active connection.
- **No application server of its own**: no location data is collected, stored, or transmitted anywhere by this project — every feature that leaves the device talks directly to the relevant third-party service.
- **Installable** as a PWA (manifest + service worker) or as a native Android app (WebView wrapper, no Google Play Services dependency).

### How it works

- **Fully static, no build step**: plain HTML/CSS/JS, servable as-is by any host.
- **Internationalization**: a small custom `i18n/i18n.js` helper (`data-i18n` attributes + a `t()` function) drives all 26 language dictionaries (`i18n/<lang>.json`) and the long-form page fragments (`i18n/pages/{about,privacy,legal}/<lang>.html`). Language resolves from a stored choice, else the hostname (ousuisje.fun → French, whereami.fun → English), else the browser's language, else English. Translations beyond French and English are machine-generated first drafts — a banner on non-French/English pages links to report a translation issue.
- **Geolocation** via the browser's `navigator.geolocation` API.
- **Address**: [Nominatim](https://nominatim.org).
- **Altitude**: [IGN Géoplateforme](https://www.ign.fr) (RGE ALTI) and [Open-Elevation](https://www.open-elevation.com) (SRTM).
- **Points of interest**: OpenStreetMap [Overpass API](https://overpass-api.de).
- All third-party services are called directly from the user's browser or device, never relayed through a server of ours.

### Project structure

```
ousuisje/
├── index.html                        # Main page
├── about.html / confidentialite.html / mentions-legales.html   # Shell pages (fragment-injected per language)
├── styles.css
├── manifest.json + manifest.<lang>.json   # PWA manifest, one per language
├── sw.js                             # Service worker (offline cache, versioned)
├── data/                             # Offline datasets (France-only: ANFR, communes, départements)
├── i18n/
│   ├── i18n.js                       # Language resolution, t(), data-i18n binding
│   ├── <lang>.json                   # UI strings, one file per language (26)
│   └── pages/{about,privacy,legal}/<lang>.html   # Long-form page fragments
├── vendor/                           # Leaflet + Inter/Space Mono fonts, embedded locally
├── icons/
├── LICENSE                           # GNU GPL v3
└── android/                          # Native Android app (WebView wrapper)
    ├── app/                          # Gradle module (bundles a copy of the web assets)
    ├── fastlane/metadata/android/    # F-Droid/store listing, one folder per language
    └── fdroid/com.ousuisje.app.yml   # Draft F-Droid build recipe
```

### Deployment

Deployed on [Vercel](https://vercel.com), framework preset **Other** (no build command). Every push to the main branch triggers an automatic redeploy to both `ousuisje.fun` and `whereami.fun` (same Vercel project, two custom domains, both registered at OVH).

### Android app

Native WebView wrapper (`android/`) bundling a copy of the web assets — no Google Play Services dependency, no proprietary code. Includes a hidden crash-log feature (long-press the "About" page title) that offers to copy the last crash log or open a pre-filled GitHub issue.

Submitted to F-Droid: see merge request [fdroid/fdroiddata#49345](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/49345) (awaiting maintainer review).

### Technical requirements

- **HTTPS required**: geolocation and service workers only work on a secure origin (or `localhost` in development).
- On iOS, installation is manual via Safari: Share → "Add to Home Screen".
- GPS accuracy depends heavily on the device, browser, and granted location permission.

### Licenses and attribution

- **This project's source code**: [GNU GPL v3](LICENSE).
- Map, address and points-of-interest data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL license.
- Altitude data: [IGN](https://www.ign.fr) (RGE ALTI, Admin Express) and [Open-Elevation](https://www.open-elevation.com) (SRTM).
- Cell-tower data: [ANFR](https://data.anfr.fr), open license.
- Precipitation radar: [RainViewer](https://www.rainviewer.com).
- [Leaflet](https://leafletjs.com) (BSD-2-Clause) and the [Inter](https://rsms.me/inter/)/[Space Mono](https://fonts.google.com/specimen/Space+Mono) fonts (SIL Open Font License 1.1) are bundled locally in `vendor/` rather than loaded from a CDN, as required for F-Droid publication (no unreviewed code loaded at runtime).

---

## Français

Application web installable (PWA) et application Android qui affichent votre position en direct, l'adresse, l'altitude et les points d'intérêt à proximité — via le GPS de votre appareil ou en cliquant simplement sur une carte. Disponible en **26 langues** (les 24 langues officielles de l'Union européenne, le chinois mandarin et l'arabe).

🔗 [ousuisje.fun](https://ousuisje.fun) · [whereami.fun](https://whereami.fun) — même site et même code, déployé sur les deux domaines ; la langue par défaut suit le domaine (français / anglais) mais reste modifiable vers l'une des 26 langues depuis les réglages.

### Fonctionnalités

- **Position en direct** : coordonnées (décimales, DMS, DDM, plus un format de copie `lat, lon` brut), précision horizontale, altitude, vitesse, cap, tous rafraîchis en continu via `watchPosition`.
- **Panneau « Réglages et détails GPS »** (masqué par défaut) : état du fix, âge du relevé, nombre de relevés reçus, précision brute non arrondie, heure GPS, décalage d'altitude manuel, activation automatique et arrêt automatique.
- **Adresse** par géocodage inversé ([Nominatim](https://nominatim.org)/OpenStreetMap) : rue, lieu-dit, code postal, commune, département/région, pays. Copie en un clic, bouton de partage dédié.
- **Carte interactive** ([Leaflet](https://leafletjs.com)/OpenStreetMap) : marqueur GPS avec cercle de précision, marqueur séparé pour un point cliqué manuellement, liens directs vers OpenStreetMap et Google Maps.
- **Points d'intérêt à proximité** ([API Overpass](https://overpass-api.de)) : eau potable, toilettes, restauration, ainsi que tout mot-clé personnalisé ajouté depuis les réglages.
- **Comparaison d'altitude** : altitude GPS comparée à Open-Elevation (SRTM, mondial) ou à l'IGN RGE ALTI (plus précis, France uniquement).
- **Radar de précipitations** ([RainViewer](https://www.rainviewer.com)).
- **Fonctionnalités France uniquement**, affichées selon la position détectée plutôt que selon la version installée : recherche d'antennes relais 2G/3G/4G/5G (hors ligne, données [ANFR](https://data.anfr.fr)), identification du département et de la commune (hors ligne, IGN Admin Express). Ces sections restent masquées jusqu'à ce qu'une position en France soit détectée, puis apparaissent automatiquement.
- **Fonctionne hors ligne** : une fois installée, la plupart des fonctions continuent de marcher sans connexion grâce aux jeux de données téléchargés localement ; seules les fonctions interrogeant un service tiers en direct (adresse, comparaison d'altitude, autres points d'intérêt, radar) nécessitent une connexion active.
- **Aucun serveur applicatif propre** : aucune donnée de localisation n'est collectée, stockée ou transmise où que ce soit par ce projet — chaque fonction qui quitte l'appareil contacte directement le service tiers concerné.
- **Installable** comme PWA (manifeste + service worker) ou comme application Android native (WebView, sans dépendance à Google Play Services).

### Fonctionnement

- **100 % statique, sans étape de build** : HTML/CSS/JS bruts, servables tels quels par n'importe quel hébergeur.
- **Internationalisation** : un petit utilitaire maison `i18n/i18n.js` (attributs `data-i18n` + fonction `t()`) pilote les 26 dictionnaires de langue (`i18n/<lang>.json`) et les fragments de pages longues (`i18n/pages/{about,privacy,legal}/<lang>.html`). La langue est résolue depuis un choix mémorisé, sinon le nom de domaine (ousuisje.fun → français, whereami.fun → anglais), sinon la langue du navigateur, sinon l'anglais. Les traductions autres que français/anglais sont des premiers jets générés automatiquement — une bannière sur les pages non FR/EN permet de signaler une erreur de traduction.
- **Géolocalisation** via l'API `navigator.geolocation` du navigateur.
- **Adresse** : [Nominatim](https://nominatim.org).
- **Altitude** : [IGN Géoplateforme](https://www.ign.fr) (RGE ALTI) et [Open-Elevation](https://www.open-elevation.com) (SRTM).
- **Points d'intérêt** : [API Overpass](https://overpass-api.de) d'OpenStreetMap.
- Tous ces services sont appelés directement depuis le navigateur ou l'appareil de l'utilisateur, jamais relayés par un serveur qui nous appartiendrait.

### Structure du projet

```
ousuisje/
├── index.html                        # Page principale
├── about.html / confidentialite.html / mentions-legales.html   # Pages-coquilles (contenu injecté par langue)
├── styles.css
├── manifest.json + manifest.<lang>.json   # Manifeste PWA, un par langue
├── sw.js                             # Service worker (cache hors ligne, versionné)
├── data/                             # Jeux de données hors ligne (France uniquement : ANFR, communes, départements)
├── i18n/
│   ├── i18n.js                       # Résolution de langue, t(), liaison data-i18n
│   ├── <lang>.json                   # Textes d'interface, un fichier par langue (26)
│   └── pages/{about,privacy,legal}/<lang>.html   # Fragments des pages longues
├── vendor/                           # Leaflet et polices Inter/Space Mono, embarquées localement
├── icons/
├── LICENSE                           # GNU GPL v3
└── android/                          # Application Android native (WebView)
    ├── app/                          # Module Gradle (embarque une copie des assets web)
    ├── fastlane/metadata/android/    # Fiche F-Droid/magasin, un dossier par langue
    └── fdroid/com.ousuisje.app.yml   # Brouillon de recette de build F-Droid
```

### Déploiement

Déployé sur [Vercel](https://vercel.com), préréglage de framework **Other** (aucune commande de build). Chaque push sur la branche principale déclenche un redéploiement automatique vers `ousuisje.fun` et `whereami.fun` (même projet Vercel, deux domaines personnalisés, tous deux enregistrés chez OVH).

### Application Android

Wrapper WebView natif (`android/`) embarquant une copie des assets web — sans dépendance à Google Play Services, sans code propriétaire. Inclut une fonctionnalité cachée de capture de crash (appui long sur le titre de la page « À propos ») qui propose de copier le dernier log de crash ou d'ouvrir une issue GitHub pré-remplie.

Soumise à F-Droid : voir la merge request [fdroid/fdroiddata#49345](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/49345) (en attente de revue par les mainteneurs).

### Prérequis techniques

- **HTTPS obligatoire** : la géolocalisation et les service workers ne fonctionnent que sur une origine sécurisée (ou `localhost` en développement).
- Sur iOS, l'installation se fait manuellement via Safari : Partager → « Sur l'écran d'accueil ».
- La précision GPS dépend fortement de l'appareil, du navigateur et de l'autorisation de localisation accordée.

### Licences et attribution

- **Code source de ce projet** : [GNU GPL v3](LICENSE).
- Données cartographiques, d'adresse et de points d'intérêt : © contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright), licence ODbL.
- Données d'altitude : [IGN](https://www.ign.fr) (RGE ALTI, Admin Express) et [Open-Elevation](https://www.open-elevation.com) (SRTM).
- Données d'antennes relais : [ANFR](https://data.anfr.fr), licence ouverte.
- Radar de précipitations : [RainViewer](https://www.rainviewer.com).
- [Leaflet](https://leafletjs.com) (licence BSD-2-Clause) et les polices [Inter](https://rsms.me/inter/)/[Space Mono](https://fonts.google.com/specimen/Space+Mono) (licence SIL Open Font License 1.1) sont embarquées localement dans `vendor/` plutôt que chargées depuis un CDN, condition requise pour la publication F-Droid (aucun code non revu chargé à l'exécution).
