// i18n core helper — no build step, classic script (loaded before the main inline script).
// Key convention: nested JSON objects (i18n/<lang>.json), accessed via dotted paths,
// e.g. t('settings.title') reads dict.settings.title. Pick this over flat dotted keys
// so the JSON files stay readable/diffable by section.
//
// Ordering: dictionaries load async (fetch). The main app script does not run inline — it
// waits on `I18N.ready` before executing (see index.html) because it computes several
// translated strings once into config objects/closures, not just DOM textContent, so it
// can't safely start before dictionaries are actually loaded. `I18N.t` is still safe to call
// before that (e.g. from other scripts), it just falls back to the raw key until then.
(function () {
  var SUPPORTED_LANGS = ['fr', 'en'];
  var STORAGE_KEY = 'ousuisje_lang';
  var DEFAULT_LANG = 'fr';
  var FALLBACK_LANG = 'en';

  var dictionaries = {}; // lang -> loaded JSON (only fetched dictionaries are populated)
  var activeLang = DEFAULT_LANG;
  var readyResolve;
  var ready = new Promise(function (resolve) { readyResolve = resolve; });

  function resolveLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var candidates = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
    for (var i = 0; i < candidates.length; i++) {
      var code = (candidates[i] || '').toLowerCase().split('-')[0];
      if (SUPPORTED_LANGS.indexOf(code) !== -1) return code;
    }
    return FALLBACK_LANG;
  }

  function getByPath(obj, path) {
    if (!obj) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function interpolate(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
    });
  }

  function t(key, vars) {
    var val = getByPath(dictionaries[activeLang], key);
    if (val === undefined) val = getByPath(dictionaries[FALLBACK_LANG], key);
    if (val === undefined) {
      console.warn('[i18n] missing key:', key);
      val = key;
    }
    return interpolate(val, vars);
  }

  // Returns the raw (non-interpolated) value at `key` for the active language — used for
  // structured data like the keywords map, not just single strings.
  function raw(key) {
    var val = getByPath(dictionaries[activeLang], key);
    if (val === undefined) val = getByPath(dictionaries[FALLBACK_LANG], key);
    return val;
  }

  function applyTranslations(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var htmlNodes = root.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      htmlNodes[j].innerHTML = t(htmlNodes[j].getAttribute('data-i18n-html'));
    }
    var attrNodes = root.querySelectorAll('[data-i18n-attr]');
    for (var k = 0; k < attrNodes.length; k++) {
      var el = attrNodes[k];
      var pairs = el.getAttribute('data-i18n-attr').split(',');
      for (var p = 0; p < pairs.length; p++) {
        var pair = pairs[p].split(':');
        var attrName = pair[0].trim();
        var attrKey = pair[1].trim();
        el.setAttribute(attrName, t(attrKey));
      }
    }
  }

  function localeTag(lang) {
    // Matches the date/number formatting convention already used per-site before the
    // merge (fr-FR / en-GB) so timestamps keep the same look once dynamic.
    return lang === 'fr' ? 'fr-FR' : 'en-GB';
  }

  function loadDict(lang) {
    if (dictionaries[lang]) return Promise.resolve(dictionaries[lang]);
    return fetch('i18n/' + lang + '.json')
      .then(function (res) { return res.json(); })
      .then(function (json) { dictionaries[lang] = json; return json; })
      .catch(function (err) {
        console.warn('[i18n] failed to load', lang, err);
        dictionaries[lang] = dictionaries[lang] || {};
        return dictionaries[lang];
      });
  }

  function applyDocumentLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  }

  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    loadDict(lang).then(function () {
      activeLang = lang;
      applyDocumentLang(lang);
      applyTranslations(document);
      window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
    });
  }

  function init() {
    activeLang = resolveLang();
    applyDocumentLang(activeLang);
    var loads = [loadDict(activeLang)];
    if (activeLang !== FALLBACK_LANG) loads.push(loadDict(FALLBACK_LANG));
    Promise.all(loads).then(function () {
      applyTranslations(document);
      readyResolve();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.I18N = {
    SUPPORTED_LANGS: SUPPORTED_LANGS,
    t: t,
    get: t,
    raw: raw,
    applyTranslations: applyTranslations,
    setLang: setLang,
    localeTag: function () { return localeTag(activeLang); },
    lang: function () { return activeLang; },
    ready: ready
  };
})();
