# OuSuisJe — application Android

Enveloppe Android minimale : une `WebView` qui charge une copie locale du site
(`app/src/main/assets/`), sans dépendance à Google Play Services. Conçue pour être
publiable sur F-Droid.

## État actuel

- Structure Gradle (Kotlin DSL), module `app` unique.
- `MainActivity` : WebView + `WebViewAssetLoader` (sert les assets locaux depuis une
  origine `https://appassets.androidplatform.net`, nécessaire pour que la géolocalisation
  fonctionne de façon fiable) + relais des permissions de géolocalisation vers le système
  Android.
- Icônes de lancement générées à partir de `icons/icon-512.png` (legacy + adaptive icon).
- Assets embarqués : `index.html`, `styles.css`, `data/*` (copie figée au moment du scaffold).

## Ce qu'il manque avant de compiler

Le wrapper Gradle (`gradlew`, `gradlew.bat`, `gradle/wrapper/gradle-wrapper.jar`) n'est
**pas** inclus : je ne peux pas le générer ni le vérifier sans Gradle/JDK dans cet
environnement. Deux façons de le créer :

1. **Android Studio** : ouvrir ce dossier (`android/`) comme projet — Android Studio
   propose de créer/réparer le wrapper automatiquement à la synchronisation.
2. **En ligne de commande**, si Gradle est installé sur ta machine :
   ```sh
   cd android
   gradle wrapper --gradle-version 8.7
   ```
   Committer ensuite `gradlew`, `gradlew.bat` et `gradle/wrapper/gradle-wrapper.jar`
   (les deux premiers, le `.jar` se commit normalement aussi, contrairement au reste
   de `.gradle/`/`build/`).

Une fois le wrapper en place :
```sh
./gradlew assembleDebug   # APK de debug, non signé
```

## Garder les assets à jour

`app/src/main/assets/` est une copie figée du site, pas un lien vers `index.html` à la
racine du repo. Après une modification du site, il faut la refaire :
```sh
cp ../index.html ../styles.css app/src/main/assets/
cp ../data/*.csv ../data/*.json app/src/main/assets/data/
```
(à terme, un script ou une étape de build pourrait automatiser cette copie).

À noter : `sw.js` (service worker) n'est pas exploité ici — inutile, puisque tous les
fichiers sont déjà embarqués dans l'APK au lieu d'être mis en cache après coup. Le code
du site appelle déjà `navigator.serviceWorker.register(...).catch(() => {})`, donc son
échec silencieux dans ce contexte ne casse rien.

## Pistes pour la suite

- Icônes adaptatives : celles générées ici sont un premier jet (recadrage automatique
  à 60 % du canevas) — à refaire proprement avec l'outil "Image Asset" d'Android Studio
  si le rendu ne convient pas.
- Bundler Leaflet (JS/CSS) et les polices Google Fonts en local plutôt que de les charger
  depuis unpkg.com / fonts.googleapis.com au premier lancement (le reste de l'appli
  fonctionne déjà hors ligne une fois ces deux-là chargés une première fois).
- Fiche de build F-Droid (`fdroiddata`) : une fois le projet buildable de façon
  reproductible (`./gradlew assembleRelease` sans réseau au-delà de la résolution des
  dépendances Gradle), rédiger le recipe YAML pointant vers ce sous-dossier `android/`
  du repo.
