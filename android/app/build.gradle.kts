plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.ousuisje.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.ousuisje.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 12
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    // AGP embeds a "dependency metadata" signing block by default (for Play Store analytics)
    // — F-Droid's CI scanner flags that block as an "extra signing block" and fails the build
    // check for it, since it's irrelevant/undesired outside Play Store distribution.
    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = false
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    // WebViewAssetLoader : sert les fichiers embarqués dans assets/ depuis une origine
    // https:// virtuelle plutôt que file://, nécessaire pour que la géolocalisation
    // (contexte sécurisé requis) et les appels fetch() vers les API externes se comportent
    // comme sur le vrai site.
    implementation("androidx.webkit:webkit:1.11.0")
}
