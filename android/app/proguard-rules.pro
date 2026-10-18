# Methods exposed to the WebView via addJavascriptInterface() are called by name through
# JS, so R8 must not rename or strip them even though no Kotlin code calls them directly.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
