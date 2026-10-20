/**
 * Polyfill Intl.PluralRules (i wymaganego przez niego Intl.Locale) dla Hermes na iOS
 * [M1-audytor-generalny-071]. Dokumentacja Hermes (doc/IntlAPIs.md, odczyt 2026-10-20) nie wymienia
 * PluralRules ani Locale wśród API iOS; FormatJS zaleca dla React Native wersję „force”.
 * Dane dla wszystkich 35 języków ACTIVE_LANGS (i18n.ts) [M1-audytor-generalny-093]: warianty regionalne
 * (es-419, pt-BR, zh-Hant) dziedziczą reguły po języku (es, pt, zh); `pt` (Portugalia) liczy z danymi pt-PT
 * (`jezykLiczbyMnogiej`). Kontrola: src/lib/__tests__/plural-intl.test.ts (polyfill zna każdy język). Importowany jako pierwszy w app/_layout.tsx.
 */
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill-force.js';
import '@formatjs/intl-pluralrules/locale-data/pl.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/cs.js';
import '@formatjs/intl-pluralrules/locale-data/sk.js';
import '@formatjs/intl-pluralrules/locale-data/hu.js';
import '@formatjs/intl-pluralrules/locale-data/ro.js';
import '@formatjs/intl-pluralrules/locale-data/bg.js';
import '@formatjs/intl-pluralrules/locale-data/hr.js';
import '@formatjs/intl-pluralrules/locale-data/sl.js';
import '@formatjs/intl-pluralrules/locale-data/sr.js';
import '@formatjs/intl-pluralrules/locale-data/lt.js';
import '@formatjs/intl-pluralrules/locale-data/lv.js';
import '@formatjs/intl-pluralrules/locale-data/et.js';
import '@formatjs/intl-pluralrules/locale-data/uk.js';
import '@formatjs/intl-pluralrules/locale-data/es.js';
import '@formatjs/intl-pluralrules/locale-data/pt.js';
import '@formatjs/intl-pluralrules/locale-data/pt-PT.js';
import '@formatjs/intl-pluralrules/locale-data/de.js';
import '@formatjs/intl-pluralrules/locale-data/fr.js';
import '@formatjs/intl-pluralrules/locale-data/it.js';
import '@formatjs/intl-pluralrules/locale-data/nl.js';
import '@formatjs/intl-pluralrules/locale-data/sv.js';
import '@formatjs/intl-pluralrules/locale-data/da.js';
import '@formatjs/intl-pluralrules/locale-data/nb.js';
import '@formatjs/intl-pluralrules/locale-data/fi.js';
import '@formatjs/intl-pluralrules/locale-data/tr.js';
import '@formatjs/intl-pluralrules/locale-data/el.js';
import '@formatjs/intl-pluralrules/locale-data/id.js';
import '@formatjs/intl-pluralrules/locale-data/ms.js';
import '@formatjs/intl-pluralrules/locale-data/vi.js';
import '@formatjs/intl-pluralrules/locale-data/ru.js';
import '@formatjs/intl-pluralrules/locale-data/ja.js';
import '@formatjs/intl-pluralrules/locale-data/ko.js';
import '@formatjs/intl-pluralrules/locale-data/zh.js';
