// Słowniki 33 języków z przekładu 093 (MT claude-opus-5-5, Message Batches, 2026-10-20; rejestr: docs/lokalizacja/jezyki.md)
// [M1-audytor-generalny-093]. Ładowanie leniwe: moduł języka wykonuje się dopiero przy pierwszym użyciu (Metro
// i Jest wiążą `require` statycznie, ale nie wykonują go przy imporcie), więc start aplikacji i testy nie
// czytają 33 słowników naraz. Pliki języków generuje `node scripts/wepnij-przeklad.mjs` (nie edytuj ręcznie).
/* eslint-disable @typescript-eslint/no-require-imports -- celowo leniwe require, jedno na język */
type Slownik = Record<string, string>;

export const LADOWANIE_SLOWNIKOW: Readonly<Record<string, () => Slownik>> = {
  cs: () => require('./cs').SLOWNIK,
  sk: () => require('./sk').SLOWNIK,
  hu: () => require('./hu').SLOWNIK,
  ro: () => require('./ro').SLOWNIK,
  bg: () => require('./bg').SLOWNIK,
  hr: () => require('./hr').SLOWNIK,
  sl: () => require('./sl').SLOWNIK,
  sr: () => require('./sr').SLOWNIK,
  lt: () => require('./lt').SLOWNIK,
  lv: () => require('./lv').SLOWNIK,
  et: () => require('./et').SLOWNIK,
  uk: () => require('./uk').SLOWNIK,
  es: () => require('./es').SLOWNIK,
  'es-419': () => require('./es-419').SLOWNIK,
  pt: () => require('./pt').SLOWNIK,
  'pt-BR': () => require('./pt-BR').SLOWNIK,
  de: () => require('./de').SLOWNIK,
  fr: () => require('./fr').SLOWNIK,
  it: () => require('./it').SLOWNIK,
  nl: () => require('./nl').SLOWNIK,
  sv: () => require('./sv').SLOWNIK,
  da: () => require('./da').SLOWNIK,
  nb: () => require('./nb').SLOWNIK,
  fi: () => require('./fi').SLOWNIK,
  tr: () => require('./tr').SLOWNIK,
  el: () => require('./el').SLOWNIK,
  id: () => require('./id').SLOWNIK,
  ms: () => require('./ms').SLOWNIK,
  vi: () => require('./vi').SLOWNIK,
  ru: () => require('./ru').SLOWNIK,
  ja: () => require('./ja').SLOWNIK,
  ko: () => require('./ko').SLOWNIK,
  'zh-Hant': () => require('./zh-Hant').SLOWNIK,
};
