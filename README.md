# OuSuisJe

Application web installable (PWA) qui affiche en direct la position de l'appareil : coordonnées GPS, altitude, vitesse, cap, précision, ainsi que l'adresse correspondante (rue, code postal, commune, département, région, pays).

🔗 [ousuisje.fun](https://ousuisje.fun)

## Fonctionnement

- **Aucun serveur applicatif.** Site 100 % statique (HTML/CSS/JS), aucune donnée de position n'est stockée ni transmise à un serveur propre à OuSuisJe.
- **Géolocalisation** via l'API `navigator.geolocation` du navigateur (`watchPosition`).
- **Adresse** obtenue par géocodage inversé auprès du service gratuit [Nominatim](https://nominatim.org/) d'OpenStreetMap, appelé directement depuis le navigateur de l'utilisateur.
- **Installable** sur mobile et desktop (manifeste + service worker), avec mise en cache des fichiers pour un chargement hors-ligne.

## Structure du projet

```
ousuisje/
├── index.html            # Page principale (position, adresse, actions)
├── about.html             # À propos
├── mentions-legales.html  # Mentions légales / responsabilité
├── styles.css             # Feuille de style partagée
├── manifest.json          # Manifeste PWA (nom, icônes, mode standalone)
├── sw.js                  # Service worker (cache hors-ligne)
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

## Licences et attribution

- Données cartographiques et d'adresse : © contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright), sous licence ODbL.
