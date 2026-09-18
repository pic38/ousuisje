package com.ousuisje.app

import android.app.Application
import android.os.Build
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// Capture le dernier crash non intercepté dans un fichier local (filesDir/crash_log.txt),
// lu par MainActivity.WebAppInterface.showCrashLog() via le pont JS caché sur la page
// "À propos". Ne remplace pas le comportement de crash par défaut : on délègue toujours
// au handler précédent une fois le log écrit, pour ne pas avaler l'exception en silence.
class OuSuisJeApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        val previousHandler = Thread.getDefaultUncaughtExceptionHandler()

        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            try {
                writeCrashLog(throwable)
            } catch (e: Exception) {
                Log.e("OuSuisJeApplication", "Failed to write crash log", e)
            }
            previousHandler?.uncaughtException(thread, throwable)
        }
    }

    private fun writeCrashLog(throwable: Throwable) {
        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())
        val versionInfo = try {
            val pInfo = packageManager.getPackageInfo(packageName, 0)
            "${pInfo.versionName} (${pInfo.longVersionCode})"
        } catch (e: Exception) {
            "unknown"
        }

        val report = buildString {
            append("Crash — ").append(timestamp).append('\n')
            append("App version: ").append(versionInfo).append('\n')
            append("Android: ").append(Build.VERSION.RELEASE).append(" (API ").append(Build.VERSION.SDK_INT).append(")\n")
            append("Device: ").append(Build.MANUFACTURER).append(' ').append(Build.MODEL).append('\n')
            append('\n')
            append(Log.getStackTraceString(throwable))
        }

        File(filesDir, "crash_log.txt").writeText(report)
    }
}
