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
        versionCode = 11
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
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
