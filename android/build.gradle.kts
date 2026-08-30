// Déclare les versions de plugins une seule fois ici ; app/build.gradle.kts les applique
// sans redéclarer de numéro de version (convention standard Gradle multi-module).
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
}
