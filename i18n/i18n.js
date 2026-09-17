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
  // Native name + BCP47 locale tag (for toLocaleTimeString/toLocaleString) per supported
  // language. This is also what drives the <select id="languageSelect"> options — see
  // populateLanguageSelect() — so there is exactly one place to add a new language.
  var LANG_INFO = {
    fr: { name: 'Français', locale: 'fr-FR' },
    en: { name: 'English', locale: 'en-GB' },
    bg: { name: 'Български', locale: 'bg-BG' },
    hr: { name: 'Hrvatski', locale: 'hr-HR' },
    cs: { name: 'Čeština', locale: 'cs-CZ' },
    da: { name: 'Dansk', locale: 'da-DK' },
    nl: { name: 'Nederlands', locale: 'nl-NL' },
    et: { name: 'Eesti', locale: 'et-EE' },
    fi: { name: 'Suomi', locale: 'fi-FI' },
    de: { name: 'Deutsch', locale: 'de-DE' },
    el: { name: 'Ελληνικά', locale: 'el-GR' },
    hu: { name: 'Magyar', locale: 'hu-HU' },
    ga: { name: 'Gaeilge', locale: 'ga-IE' },
    it: { name: 'Italiano', locale: 'it-IT' },
    lv: { name: 'Latviešu', locale: 'lv-LV' },
    lt: { name: 'Lietuvių', locale: 'lt-LT' },
    mt: { name: 'Malti', locale: 'mt-MT' },
    pl: { name: 'Polski', locale: 'pl-PL' },
    pt: { name: 'Português', locale: 'pt-PT' },
    ro: { name: 'Română', locale: 'ro-RO' },
    sk: { name: 'Slovenčina', locale: 'sk-SK' },
    sl: { name: 'Slovenščina', locale: 'sl-SI' },
    es: { name: 'Español', locale: 'es-ES' },
    sv: { name: 'Svenska', locale: 'sv-SE' },
    zh: { name: '中文', locale: 'zh-CN' },
    ar: { name: 'العربية', locale: 'ar-SA' }
  };
  var SUPPORTED_LANGS = Object.keys(LANG_INFO);
  var STORAGE_KEY = 'ousuisje_lang';
  var DEFAULT_LANG = 'fr';
  var FALLBACK_LANG = 'en';

  var dictionaries = {}; // lang -> loaded JSON (only fetched dictionaries are populated)
  var activeLang = DEFAULT_LANG;
  var readyResolve;
  var ready = new Promise(function (resolve) { readyResolve = resolve; });

  // Domains that pre-date the i18n merge each imply a default language for a first-time
  // visitor (whereami.fun readers expect English regardless of their browser/OS locale) —
  // this only sets the DEFAULT, an explicit localStorage choice always wins.
  var HOSTNAME_DEFAULT_LANG = {
    'whereami.fun': 'en',
    'www.whereami.fun': 'en',
    'ousuisje.fun': 'fr',
    'www.ousuisje.fun': 'fr'
  };

  function resolveLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var hostLang = HOSTNAME_DEFAULT_LANG[location.hostname];
    if (hostLang && SUPPORTED_LANGS.indexOf(hostLang) !== -1) return hostLang;
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

  // Populates every <select id="languageSelect"> found in `root` from LANG_INFO, so no page
  // needs to hardcode <option> tags per language. Safe to call repeatedly (e.g. on every
  // applyTranslations pass) — it no-ops once options already match.
  function populateLanguageSelect(root) {
    root = root || document;
    var selects = root.querySelectorAll('#languageSelect');
    for (var s = 0; s < selects.length; s++) {
      var select = selects[s];
      if (select.options.length === SUPPORTED_LANGS.length) continue;
      select.innerHTML = '';
      for (var i = 0; i < SUPPORTED_LANGS.length; i++) {
        var code = SUPPORTED_LANGS[i];
        var opt = document.createElement('option');
        opt.value = code;
        opt.textContent = LANG_INFO[code].name;
        select.appendChild(opt);
      }
      select.value = activeLang;
    }
  }

  function applyTranslations(root) {
    root = root || document;
    populateLanguageSelect(root);
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
    var info = LANG_INFO[lang];
    return info ? info.locale : 'en-GB';
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
