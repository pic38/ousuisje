package com.ousuisje.app

import android.Manifest
import android.app.AlertDialog
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import java.io.File
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {

    // Exposed to the WebView as `window.CrashBridge` — triggered by a long-press on the
    // "About" page's title (see about.html). @JavascriptInterface methods run on a
    // background thread, hence the runOnUiThread hop before touching any view.
    private class WebAppInterface(private val activity: MainActivity) {
        @JavascriptInterface
        fun showCrashLog() {
            activity.runOnUiThread { activity.showCrashLogDialog() }
        }
    }

    private fun showCrashLogDialog() {
        val logFile = File(filesDir, "crash_log.txt")
        val logText = if (logFile.exists()) logFile.readText() else "No crash recorded."

        AlertDialog.Builder(this)
            .setTitle("Crash log")
            .setMessage(logText)
            .setPositiveButton("Copy") { _, _ ->
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("Crash log", logText))
                Toast.makeText(this, "Copied", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Report on GitHub") { _, _ ->
                // GitHub's issue-form URL has practical length limits; truncate the body so
                // the link always works even for a very long stack trace.
                val truncated = logText.take(3000)
                val body = "```\n$truncated\n```"
                val url = "https://github.com/pic38/ousuisje/issues/new" +
                    "?title=" + URLEncoder.encode("Crash report (Android)", "UTF-8") +
                    "&body=" + URLEncoder.encode(body, "UTF-8")
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            }
            .setNeutralButton("Close", null)
            .show()
    }

    private lateinit var webView: WebView
    private var pendingGeoOrigin: String? = null
    private var pendingGeoCallback: GeolocationPermissions.Callback? = null

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        pendingGeoCallback?.invoke(pendingGeoOrigin, granted, false)
        pendingGeoOrigin = null
        pendingGeoCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Sert les fichiers de assets/ (copie du site : index.html, styles.css, sw.js,
        // data/…) depuis https://appassets.androidplatform.net plutôt que file:// — la
        // géolocalisation exige un contexte sécurisé, que file:// ne garantit pas de façon
        // fiable selon les versions de WebView.
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView = findViewById(R.id.webview)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.setGeolocationEnabled(true)
        webView.addJavascriptInterface(WebAppInterface(this), "CrashBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)
        }

        // Relaie la demande de géolocalisation de la WebView vers le système de
        // permissions Android : sans ça, navigator.geolocation reste bloqué en silence.
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                val hasPermission = ContextCompat.checkSelfPermission(
                    this@MainActivity, Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED

                if (hasPermission) {
                    callback?.invoke(origin, true, false)
                } else {
                    pendingGeoOrigin = origin
                    pendingGeoCallback = callback
                    locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                }
            }
        }

        if (savedInstanceState == null) {
            webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
