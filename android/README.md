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
- Assets embarqués : `index.html`, `styles.css`, `data/*`, `vendor/leaflet/*`, `vendor/fonts/*`
  (copie figée au moment du scaffold).
- Wrapper Gradle (`gradlew`, `gradlew.bat`, `gradle/wrapper/gradle-wrapper.jar`) : fichiers
  officiels récupérés depuis le tag `v8.7.0` du dépôt `gradle/gradle`.

## Vérifié (JDK 17, sans Android SDK)

```sh
./gradlew tasks           # BUILD SUCCESSFUL — toute la config Gradle/Kotlin DSL est valide
./gradlew assembleDebug   # échoue uniquement faute de SDK Android installé
```

## Ce qu'il manque avant de produire un APK

Le **SDK Android** (plateforme + build-tools) n'est pas installé dans cet environnement,
donc `assembleDebug`/`assembleRelease` n'ont pas pu être vérifiés jusqu'au bout. Deux
façons de compiler un APK :

1. **Android Studio** : ouvrir ce dossier (`android/`) comme projet — il propose
   d'installer le SDK manquant automatiquement.
2. **En ligne de commande**, avec le SDK déjà installé (`ANDROID_HOME` défini ou
   `android/local.properties` avec `sdk.dir=...`) :
   ```sh
   ./gradlew assembleDebug   # APK de debug, non signé
   ```

## Garder les assets à jour

`app/src/main/assets/` est une copie figée du site, pas un lien vers `index.html` à la
racine du repo. Après une modification du site, il faut la refaire :
```sh
cp ../index.html ../styles.css app/src/main/assets/
cp ../data/*.csv ../data/*.json app/src/main/assets/data/
cp -r ../vendor/leaflet ../vendor/fonts app/src/main/assets/vendor/
```
(à terme, un script ou une étape de build pourrait automatiser cette copie).

**Après cette copie, retirer à nouveau le bouton "Ajouter à l'écran d'accueil"** (absent
du site telle qu'écrite, il n'est retiré que dans cette copie Android — cp écrase donc
ce retrait à chaque rafraîchissement, il faut le refaire) :
- HTML : supprimer `<button id="installBtn">…</button>` et `<p id="installNote">…</p>`
  (dans `.actions`, juste avant le bouton `shareBtn`).
- JS : supprimer tout le bloc `const installBtn = $('installBtn'); … } else if (isIOS) { … }`
  juste avant `const shareBtn = $('shareBtn');` (déclarations `installBtn`/`installNote`/
  `isIOS`/`isStandalone`/`deferredPrompt`, les listeners `beforeinstallprompt`/`appinstalled`,
  et le bloc `if (isStandalone) { … }` de fin) — sans ça, `installBtn.addEventListener(...)`
  plante sur `null` puisque l'élément n'existe plus.
Ce bouton n'a pas de sens une fois l'appli installée nativement ; le reste du site (bouton
Partager notamment) n'est pas concerné.

À noter : `sw.js` (service worker) n'est pas exploité ici — inutile, puisque tous les
fichiers sont déjà embarqués dans l'APK au lieu d'être mis en cache après coup. Le code
du site appelle déjà `navigator.serviceWorker.register(...).catch(() => {})`, donc son
échec silencieux dans ce contexte ne casse rien.

## Pistes pour la suite

- Icônes adaptatives : celles générées ici sont un premier jet (recadrage automatique
  à 60 % du canevas) — à refaire proprement avec l'outil "Image Asset" d'Android Studio
  si le rendu ne convient pas.
- Fiche de build F-Droid (`fdroiddata`) : une fois le projet buildable de façon
  reproductible (`./gradlew assembleRelease` sans réseau au-delà de la résolution des
  dépendances Gradle), rédiger le recipe YAML pointant vers ce sous-dossier `android/`
  du repo.
