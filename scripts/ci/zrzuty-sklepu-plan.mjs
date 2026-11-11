// Plan przebiegu `zrzuty-sklepu.yml` (KO-025, 2026-11-10; sesja J): lokalizacje App Store Connect z `docs/wydanie/metadane/*.json`
// (lista z docs/wydanie/zrzuty/README.md: „Pozostałe … lokalizacje z docs/wydanie/metadane/”), dla każdej język i region symulatora,
// podział na części (jedno zadanie macOS = rozmiar × część). Filtr `tylko` (np. `pl` albo `pl,en-US`); pusty = wszystkie.
// Wyjście: JSON z `matrix` (include) dla strategii zadania `zrzuty`. W logu tylko kody lokalizacji (repo publiczne).
// Filtr `sceny` (KO-047, D-380): pełne nazwy albo numery (np. `04` albo `04-doktor,05-zakwasy`); pusty = wszystkie 7 (komplet).
// Niepełny zestaw dostaje `przyrostek` `-czesciowe` do nazw artefaktów, żeby asc-zrzuty.yml (artefakt `sklep-ramki`) go nie wysłał.
//   node scripts/ci/zrzuty-sklepu-plan.mjs [--tylko pl,en-US] [--rozmiary 6.9,6.3] [--sceny 04] [--na-zadanie 4]
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Klasy iPhone (README zrzutów: App Store Connect Help „Screenshot specifications”, odczyt 2026-10-20) → symulator na obrazie
 * macos-26 (actions/runner-images, images/macos/macos-26-arm64-Readme.md, „Installed Simulators”, odczyt 2026-11-10:
 * iOS 26.2/26.4/26.5 mają „iPhone 17 Pro Max” i „iPhone 17 Pro”). Wymiar pliku sprawdza zadanie `zbierz` (twardy błąd).
 */
export const ROZMIARY = {
  '6.9': { katalog: 'iphone-6.9', symulator: 'iPhone 17 Pro Max', px: '1320x2868' },
  '6.3': { katalog: 'iphone-6.3', symulator: 'iPhone 17 Pro', px: '1206x2622' },
};

/** Kod lokalizacji ASC (nazwa pliku metadanych) → AppleLanguages i AppleLocale symulatora (aplikacja bierze język systemu, src/lib/i18n.ts). */
export const JEZYK_SYMULATORA = {
  cs: ['cs', 'cs_CZ'], da: ['da', 'da_DK'], 'de-DE': ['de-DE', 'de_DE'], el: ['el', 'el_GR'], 'en-AU': ['en-AU', 'en_AU'],
  'en-CA': ['en-CA', 'en_CA'], 'en-GB': ['en-GB', 'en_GB'], 'en-US': ['en-US', 'en_US'], 'es-ES': ['es-ES', 'es_ES'],
  'es-MX': ['es-MX', 'es_MX'], fi: ['fi', 'fi_FI'], 'fr-CA': ['fr-CA', 'fr_CA'], 'fr-FR': ['fr-FR', 'fr_FR'], hr: ['hr', 'hr_HR'],
  hu: ['hu', 'hu_HU'], id: ['id', 'id_ID'], it: ['it', 'it_IT'], ja: ['ja', 'ja_JP'], ko: ['ko', 'ko_KR'], ms: ['ms', 'ms_MY'],
  'nl-NL': ['nl-NL', 'nl_NL'], no: ['nb', 'nb_NO'], pl: ['pl', 'pl_PL'], 'pt-BR': ['pt-BR', 'pt_BR'], 'pt-PT': ['pt-PT', 'pt_PT'],
  ro: ['ro', 'ro_RO'], ru: ['ru', 'ru_RU'], sk: ['sk', 'sk_SK'], sl: ['sl', 'sl_SI'], sv: ['sv', 'sv_SE'], tr: ['tr', 'tr_TR'],
  uk: ['uk', 'uk_UA'], vi: ['vi', 'vi_VN'], 'zh-Hant': ['zh-Hant', 'zh_TW'],
};

/** Lokalizacje sklepu z katalogu metadanych (posortowane). */
export function lokalizacjeSklepu(katalog = join(ROOT, 'docs', 'wydanie', 'metadane')) {
  return readdirSync(katalog).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
}

/** Sceny ramek w kolejności wykonania z `scripts/ci/zrzuty-sklepu.sh` (jedno źródło; 03 ostatnia, bo zostawia trwający wypiek). */
export function scenySkryptu(plik = join(ROOT, 'scripts', 'ci', 'zrzuty-sklepu.sh')) {
  const m = /^SCENY="([^"]+)"/m.exec(readFileSync(plik, 'utf8'));
  if (!m) throw new Error('brak SCENY="…" w scripts/ci/zrzuty-sklepu.sh');
  return m[1].split(' ');
}

/** Lista scen (pełna nazwa albo numer NN) → sceny w kolejności skryptu albo { blad }. Pusta = wszystkie. */
export function parsujSceny(tekst, kolejnosc = scenySkryptu()) {
  const wpisy = String(tekst ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (wpisy.some((x) => !/^[0-9a-z-]{1,30}$/.test(x))) return { blad: 'sceny: dozwolone małe litery, cyfry i myślnik, rozdzielone przecinkami' };
  const zle = wpisy.filter((x) => !kolejnosc.some((s) => s === x || s.slice(0, 2) === x));
  if (zle.length) return { blad: `sceny: nieznane ${zle.join(', ')} (dozwolone: ${kolejnosc.join(', ')} albo ich numery)` };
  return wpisy.length ? kolejnosc.filter((s) => wpisy.some((x) => s === x || s.slice(0, 2) === x)) : [...kolejnosc];
}

/** Lista kodów rozdzielona przecinkami → tablica albo { blad }. Pusta = wszystkie. */
export function parsujListe(tekst, dozwolone, nazwa) {
  const kody = String(tekst ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (kody.some((x) => !/^[A-Za-z0-9.-]{1,10}$/.test(x))) return { blad: `${nazwa}: dozwolone litery, cyfry, kropka i myślnik, rozdzielone przecinkami` };
  const zle = kody.filter((x) => !dozwolone.includes(x));
  if (zle.length) return { blad: `${nazwa}: nieznane ${zle.join(', ')} (dozwolone: ${dozwolone.join(', ')})` };
  return kody.length ? [...new Set(kody)] : [...dozwolone];
}

/**
 * Plan przebiegu: części po `naZadanie` lokalizacji dla każdego rozmiaru. Ekranu zakupu tu nie ma (D-365: E2E z atrapą ofert).
 * Zwraca { matrix, jezyki, rozmiary, sceny, komplet, przyrostek } albo { blad }.
 */
export function planuj({ tylko = '', rozmiary = '', sceny = '', naZadanie = 4, wszystkie = lokalizacjeSklepu() } = {}) {
  const bezMapy = wszystkie.filter((k) => !JEZYK_SYMULATORA[k]);
  if (bezMapy.length) return { blad: `lokalizacje bez języka symulatora (JEZYK_SYMULATORA): ${bezMapy.join(', ')}` };
  const jezyki = parsujListe(tylko, wszystkie, 'tylko');
  if ('blad' in jezyki) return jezyki;
  const rozm = parsujListe(rozmiary, Object.keys(ROZMIARY), 'rozmiary');
  if ('blad' in rozm) return rozm;
  const wybrane = parsujSceny(sceny);
  if ('blad' in wybrane) return wybrane;
  const komplet = wybrane.length === scenySkryptu().length;
  const n = Number(naZadanie);
  if (!Number.isInteger(n) || n < 1 || n > 34) return { blad: 'na-zadanie: liczba całkowita 1–34' };
  const include = [];
  for (const r of rozm) {
    for (let i = 0; i < jezyki.length; i += n) {
      const czesc = jezyki.slice(i, i + n);
      include.push({
        rozmiar: r,
        katalog: ROZMIARY[r].katalog,
        symulator: ROZMIARY[r].symulator,
        czesc: `${ROZMIARY[r].katalog}-${include.filter((x) => x.rozmiar === r).length + 1}`,
        jezyki: czesc.map((k) => `${k}:${JEZYK_SYMULATORA[k][0]}:${JEZYK_SYMULATORA[k][1]}`).join(' '),
      });
    }
  }
  return { matrix: { include }, jezyki, rozmiary: rozm, sceny: wybrane, komplet, przyrostek: komplet ? '' : '-czesciowe' };
}

function arg(nazwa) {
  const i = process.argv.indexOf(`--${nazwa}`);
  return i >= 0 ? process.argv[i + 1] ?? '' : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const wynik = planuj({ tylko: arg('tylko') ?? '', rozmiary: arg('rozmiary') ?? '', sceny: arg('sceny') ?? '', naZadanie: arg('na-zadanie') ?? 4 });
  if ('blad' in wynik) {
    console.error(`::error::${wynik.blad}`);
    process.exit(1);
  }
  process.stdout.write(`${JSON.stringify(wynik)}\n`);
}
