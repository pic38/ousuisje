# OuSuisJe

Application web installable (PWA) qui retrouve l'adresse, l'altitude et les points d'intérêt autour de votre position — via le GPS de votre appareil ou en cliquant simplement sur une carte.

🔗 [ousuisje.fun](https://ousuisje.fun)

## Fonctionnalités

- **Position en direct** : coordonnées, précision horizontale, altitude, vitesse (moyennée sur ~1 s, avec repli calculé si l'appareil ne la fournit pas), cap, tous rafraîchis en continu via `watchPosition`.
- **Panneau « Détails techniques GPS »** (masqué par défaut) : état du fix, âge du relevé, nombre de relevés reçus, source de la vitesse, précision brute non arrondie, heure GPS.
- **Adresse** par géocodage inversé (Nominatim/OpenStreetMap) : rue, lieu-dit, code postal, commune, département (avec son numéro), région, pays. Copie au format postal en un clic.
- **Carte interactive** (Leaflet/OpenStreetMap) : marqueur GPS ambre avec cercle de précision, marqueur turquoise pour un point cliqué manuellement — les deux peuvent coexister. Recentrage automatique sur la position GPS à l'activation, bouton de recentrage dédié, liens directs vers OpenStreetMap et Google Maps.
- **Points d'intérêt à proximité** (API Overpass) : les 10 POI nommés les plus proches du point actif, avec distance et direction cardinale.
- **Comparaison d'altitude** : altitude GPS (capteur) comparée à l'altitude calculée par l'IGN (RGE ALTI, plus précis, France uniquement) ou par Open-Elevation (SRTM, mondial).
- **Badge de source** : indique clairement si les résultats affichés proviennent de la position GPS (ambre) ou d'un point sélectionné sur la carte (turquoise) — cette couleur se retrouve sur les champs concernés, le marqueur carte, et les lignes du tableau de POI.
- **Économie de batterie** : arrêt automatique du GPS après 100 s (compte à rebours discret), désactivable via une case « Garder le GPS actif ».
- **Partage** : bouton de partage natif (Web Share API), avec repli sur copie du lien si non disponible.
- **Installable** comme application (PWA), avec mise en cache pour un fonctionnement hors-ligne partiel (la localisation GPS fonctionne hors-ligne, pas les services tiers d'adresse/altitude/POI qui nécessitent une connexion).
- **Compteur de visites** et page **À propos** / **Mentions légales** dédiées.

## Fonctionnement

- **Aucun serveur applicatif.** Site 100 % statique (HTML/CSS/JS), aucune donnée de position n'est stockée ni transmise à un serveur propre à OuSuisJe.
- **Géolocalisation** via l'API `navigator.geolocation` du navigateur (`watchPosition`, avec une relance périodique du watch sur Firefox mobile pour contourner un blocage occasionnel sur la première position obtenue).
- **Adresse** : [Nominatim](https://nominatim.org/) d'OpenStreetMap.
- **Altitude** : [IGN Géoplateforme](https://www.ign.fr) (RGE ALTI) et [Open-Elevation](https://www.open-elevation.com) (SRTM).
- **Points d'intérêt** : [API Overpass](https://overpass-api.de) d'OpenStreetMap.
- **Carte** : [Leaflet](https://leafletjs.com) + tuiles OpenStreetMap.
- Tous ces services sont appelés directement depuis le navigateur de l'utilisateur, jamais relayés par un serveur OuSuisJe.
- **Installable** sur mobile et desktop (manifeste + service worker), avec mise en cache des fichiers pour un chargement hors-ligne.

## Structure du projet

```
ousuisje/
├── index.html             # Page principale (position, adresse, carte, POI, altitude)
├── about.html              # À propos
├── mentions-legales.html   # Mentions légales / responsabilité
├── styles.css              # Feuille de style partagée
├── manifest.json           # Manifeste PWA (nom, icônes, mode standalone)
├── sw.js                   # Service worker (cache hors-ligne, versionné)
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png
```

Site statique, sans dépendance ni étape de build : ces fichiers peuvent être servis tels quels par n'importe quel hébergeur.

## Déploiement

Déployé sur [Vercel](https://vercel.com), avec le préréglage de framework **Other** (aucune commande de build, aucun dossier de sortie particulier). Chaque push sur la branche principale déclenche un redéploiement automatique.

Nom de domaine `ousuisje.fun` enregistré chez OVH et pointé vers Vercel.

## Prérequis techniques

- **HTTPS obligatoire** : l'API de géolocalisation et les service workers ne fonctionnent que sur une origine sécurisée (ou `localhost` en développement).
- Sur iOS, l'installation se fait manuellement via Safari : Partager → « Sur l'écran d'accueil » (le bouton d'installation automatique n'existe pas sur iOS).
- La précision GPS dépend fortement de l'appareil, du navigateur et de l'autorisation de localisation accordée (certains navigateurs proposent un mode « position approximative » qui plafonne volontairement la précision).

## Licences et attribution

- Données cartographiques, d'adresse et de points d'intérêt : © contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright), sous licence ODbL.
- Données d'altitude : [IGN](https://www.ign.fr) (RGE ALTI) et [Open-Elevation](https://www.open-elevation.com) (SRTM).
