/**
 * Polyfill Intl.PluralRules (i wymaganego przez niego Intl.Locale) dla Hermes na iOS
 * [M1-audytor-generalny-071]. Dokumentacja Hermes (doc/IntlAPIs.md, odczyt 2026-10-20) nie wymienia
 * PluralRules ani Locale wśród API iOS; FormatJS zaleca dla React Native wersję „force”.
 * Dane tylko dla aktywnych języków (ACTIVE_LANGS w i18n.ts); kolejny język = kolejny plik locale-data.
 * Importowany jako pierwszy w app/_layout.tsx.
 */
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill-force.js';
import '@formatjs/intl-pluralrules/locale-data/pl.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
