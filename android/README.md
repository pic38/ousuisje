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
- Assets embarqués : `index.html`, `about.html`, `confidentialite.html`, `mentions-legales.html`,
  `manifest.json`, `styles.css`, `data/*`, `vendor/leaflet/*`, `vendor/fonts/*`, `icons/*`,
  `i18n/*` (copie figée, resynchronisée manuellement — voir « Garder les assets à jour »).
- Capture de crash masquée : un appui long (~2 s) sur le titre de la page « À propos »
  ouvre un journal du dernier crash (log/copier/signaler sur GitHub) — voir
  « Fonctionnalité de capture de crash » plus bas.
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
cp ../index.html ../about.html ../confidentialite.html ../mentions-legales.html ../styles.css ../manifest.json app/src/main/assets/
cp ../data/*.csv ../data/*.json app/src/main/assets/data/
rm -rf app/src/main/assets/vendor app/src/main/assets/icons app/src/main/assets/i18n
cp -r ../vendor app/src/main/assets/
cp -r ../icons app/src/main/assets/
cp -r ../i18n app/src/main/assets/
```
(à terme, un script ou une étape de build pourrait automatiser cette copie). **Les trois
pages `about.html`/`confidentialite.html`/`mentions-legales.html` doivent être copiées elles
aussi** — sans ça, les liens du pied de page renvoient vers un chemin que
`WebViewAssetLoader` ne peut pas résoudre (fichier absent des assets), et la WebView tente
un vrai accès réseau vers `appassets.androidplatform.net` qui échoue en `ERR_INVALID_RESPONSE`
(même famille de bug que le path-prefix mismatch décrit plus bas). Le dossier **`i18n/`
doit être entièrement retiré puis recopié** (pas juste écrasé) : contrairement aux autres
dossiers, son contenu peut évoluer par ajout/suppression de fichiers (nouvelles langues,
fragments renommés), et un `cp -r` seul laisserait d'anciens fichiers orphelins dans les
assets.

**Après cette copie, retirer à nouveau le bouton "Ajouter à l'écran d'accueil"** (absent
du site telle qu'écrite, il n'est retiré que dans cette copie Android — cp écrase donc
ce retrait à chaque rafraîchissement, il faut le refaire) :
- HTML : supprimer `<button id="installBtn">…</button>` et `<p id="installNote">…</p>`
  (dans `.actions`, juste avant le bouton `shareBtn`), ainsi que la phrase "Ajoutez le site
  à l'écran d'accueil…" dans le `<footer>` (sans objet une fois l'app installée nativement).
  (Le lien croisé vers l'ancien site anglais séparé n'existe plus depuis la fusion
  OuSuisJe/WhereAmI en une seule app multilingue — rien à retirer sur ce point désormais ;
  le sélecteur de langue en haut de chaque page fonctionne normalement dans la WebView.)
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

## Fonctionnalité de capture de crash

- `OuSuisJeApplication.kt` installe un `Thread.setDefaultUncaughtExceptionHandler` qui
  écrit le dernier crash (horodatage, version de l'app, version Android, modèle
  d'appareil, trace complète) dans `filesDir/crash_log.txt`, puis délègue au handler
  précédent (l'app continue de crasher normalement, rien n'est avalé en silence).
- `MainActivity.kt` expose `window.CrashBridge.showCrashLog()` à la WebView via
  `addJavascriptInterface`. `about.html` déclenche cet appel sur un appui long (~2 s)
  sur le titre de la page — l'écoute est déléguée sur `#pageContent`, donc ça fonctionne
  quelle que soit la langue actuellement chargée (le titre `<h1>` change, le conteneur
  reste le même).
- La boîte de dialogue native affiche le log (ou "No crash recorded." s'il n'y en a
  aucun), avec trois boutons : copier dans le presse-papiers, ouvrir une nouvelle issue
  GitHub pré-remplie avec le log (`github.com/pic38/ousuisje/issues/new`, tronqué à
  3000 caractères pour rester dans les limites d'URL), ou fermer.
- `./gradlew assembleDebug` a été testé avec succès (SDK Android + build-tools 34
  installés localement, `BUILD SUCCESSFUL`) — l'appui long sur le titre de la page
  "À propos" et la boîte de dialogue de log n'ont en revanche pas encore été testés
  manuellement sur un appareil réel, à faire avant publication.

## F-Droid

- Recette prête : `android/fdroid/com.ousuisje.app.yml`, à copier dans
  `metadata/com.ousuisje.app.yml` du dépôt `fdroiddata` lors de la soumission.
- Fiche magasin (titre/résumé/description/changelog) dans les 26 langues :
  `android/fastlane/metadata/android/<locale>/`, lue automatiquement par
  `fdroidserver` depuis ce dépôt — pas besoin de la dupliquer dans `fdroiddata`.
- Tag git `10` créé (correspond à `versionCode`), référencé par la recette
  (`UpdateCheckMode: Tags`) — à créer un nouveau tag à chaque future release.
- Icône : icône adaptative (Android 8+) + fallback PNG classique à toutes les
  densités, nécessaire pour un affichage fiable sur la fiche F-Droid.

## Pistes pour la suite

- Icônes adaptatives : celles générées ici sont un premier jet (recadrage automatique
  à 60 % du canevas) — à refaire proprement avec l'outil "Image Asset" d'Android Studio
  si le rendu ne convient pas.
- Tester `./gradlew assembleRelease` (build signé) avant la soumission F-Droid
  définitive — seul `assembleDebug` a été vérifié jusqu'ici.
