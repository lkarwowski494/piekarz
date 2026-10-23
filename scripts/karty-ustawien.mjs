#!/usr/bin/env node
/**
 * Karty ustawień App Store Connect na lokalizację strony produktu [M1-audytor-generalny-119]:
 * docs/wydanie/ustawienia/<kod ASC>.md dla każdego pliku docs/wydanie/metadane/<kod ASC>.json oraz indeks README.md.
 * Wejścia: metadane (095), mapa storefrontów docs/wydanie/storefronty.json (tabela Apple), ceny docs/wydanie/ceny.json
 * (D-038), adresy z src/lib/links.ts. Krok po kroku dla całej aplikacji: docs/wydanie/instrukcja-ustawien.md.
 *
 * Użycie: node scripts/karty-ustawien.mjs [--sprawdz]
 *   bez flagi: zapisuje karty; --sprawdz: nic nie zapisuje, kod 1, gdy któraś karta różni się od wygenerowanej.
 * Wyjście: 0 OK, 1 karty nieaktualne, 2 błąd wejścia.
 * Liczniki: znaki w punktach kodowych (jak scripts/sprawdz-metadane.mjs), słowa kluczowe w bajtach UTF-8.
 * Dlaczego generator: 34 karty × 6 pól ręcznie rozjechałyby się z metadanymi przy pierwszej poprawce tekstu.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const META = join(ROOT, 'docs/wydanie/metadane');
const WYJ = join(ROOT, 'docs/wydanie/ustawienia');
const sprawdz = process.argv.includes('--sprawdz');

const zn = (s) => [...s].length;
const bt = (s) => Buffer.byteLength(s, 'utf8');
const txt = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const kwota = (s) => s.replace('.', ',');

/** Limity: App Store Connect Help „App information” i „Platform version information”, odczyt 2026-10-21. */
const POLA = [
  { klucz: 'nazwa', etykieta: 'Nazwa (Name)', limit: 30, gdzie: 'App Information' },
  { klucz: 'podtytul', etykieta: 'Podtytuł (Subtitle)', limit: 30, gdzie: 'App Information' },
  { klucz: 'slowaKluczowe', etykieta: 'Słowa kluczowe (Keywords)', limit: 100, bajty: true, gdzie: 'wersja 1.0' },
  { klucz: 'tekstPromocyjny', etykieta: 'Tekst promocyjny (Promotional Text)', limit: 170, gdzie: 'wersja 1.0' },
  { klucz: 'opis', etykieta: 'Opis (Description)', limit: 4000, gdzie: 'wersja 1.0' },
];
/** Kolejność ramek D-055 (docs/app-store-metadata-v2.md §5.2), nazwy plików z docs/wydanie/zrzuty/README.md. */
const ZRZUTY = ['01-plan.png', '02-receptura.png', '03-prowadzenie-ciemny.png', '04-doktor.png', '05-zakwasy.png', '06-dziennik.png', '07-offline.png'];
const KLASY = [['iphone-6.9', 'iPhone 6,9″ (1320 × 2868)'], ['iphone-6.3', 'iPhone 6,3″ (1206 × 2622), wymagana']];
/** Lokalizacje ze zrzutami w repo; pozostałe leżą lokalnie u właściciela (docs/wydanie/zrzuty/README.md). */
const W_REPO = new Set(['pl', 'en-US', 'nl-NL']);
const POZA_REPO = 'audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu';
/** Nazwy do sprawdzenia przez osobę mówiącą językiem (D-053, widocznosc.md §6 p. 5). */
const WERYFIKACJA = new Set(['sl', 'ms', 'el', 'ru']);
/** Dostępność (D-057, warunkowa): wszystkie storefronty bez Chin kontynentalnych do rozstrzygnięcia ICP. */
const NIEDOSTEPNE = new Set(['CHN']);
const STATUS = {
  zmierzone: 'frazy z wyników wyszukiwarki i podpowiedzi tego kraju',
  'częściowo': 'podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji',
  hipoteza: 'brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics',
};

function linki() {
  const src = txt('src/lib/links.ts');
  const wez = (n) => {
    const m = src.match(new RegExp(`export const ${n} = '([^']+)'`));
    if (!m) throw new Error(`brak ${n} w src/lib/links.ts`);
    return m[1];
  };
  return { privacy: wez('PRIVACY_URL'), support: wez('SUPPORT_URL') };
}

function produkty() {
  const src = txt('src/lib/platnosci/konfiguracja.ts');
  const out = {};
  for (const p of ['monthly', 'yearly', 'lifetime']) {
    const m = src.match(new RegExp(`\\b${p}: '([^']+)'`));
    if (!m) throw new Error(`brak produktu ${p} w konfiguracja.ts`);
    out[p] = m[1];
  }
  return out;
}

function lista(iso, sf) {
  if (!iso.length) return '—';
  return iso.map((k) => `${k} (${sf.get(k)?.kraj ?? '?'})${NIEDOSTEPNE.has(k) ? ' — niedostępny (D-057)' : ''}`).join(', ');
}

function karta(kod, m, mapa, sf, ceny, url, prod) {
  const l = mapa.lokalizacje[kod];
  if (!l) throw new Error(`${kod}: brak w docs/wydanie/storefronty.json`);
  const wszystkie = [...l.domyslny, ...l.dodatkowy];
  const L = [];
  L.push(`# Karta ustawień App Store: ${l.jezykAsc} (\`${kod}\`)`);
  L.push('');
  L.push('> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/' + kod + '.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].');
  L.push('');
  L.push('## Gdzie to wpisać');
  L.push('');
  L.push(`- Lokalizacja App Store Connect: **${l.jezykAsc}**, kod ASC \`${kod}\`; język aplikacji \`${m.jezyk}\` (status released w \`src/lib/i18n-locales.ts\`, reguła prawdy D-054).`);
  L.push(`- Apps → Piekarz → menu języka w prawym górnym rogu → ${l.jezykAsc} (jeśli go nie ma: „Not Localized” → ${l.jezykAsc} → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).`);
  L.push(`- Status pomiaru: **${m.status}** — ${STATUS[m.status] ?? '[DO USTALENIA]'} (docs/wydanie/widocznosc.md §1).`);
  if (WERYFIKACJA.has(kod)) L.push('- **Weryfikacja natywna:** nazwę i podtytuł przed wysyłką sprawdza osoba mówiąca tym językiem (D-053; docs/wydanie/widocznosc.md §6 p. 5).');
  if (kod === 'en-GB') L.push('- **Weryfikacja natywna (nazwa pod ikoną, rola 09):** języki aplikacji bez lokalizacji strony App Store — bułgarski, estoński, litewski, łotewski, serbski. Ich storefronty (m.in. BGR, EST, LTU, LVA, SRB) pokazują tę kartę albo kartę języka dodatkowego; nazwę pod ikoną w tych językach sprawdza osoba mówiąca językiem.');
  L.push('');
  L.push('## Storefronty, które pokazują tę lokalizację');
  L.push('');
  L.push(`Mapa: tabela Apple „App Store localizations” (odczyt ${mapa.odczyt}), \`docs/wydanie/storefronty.json\`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią \`[DO USTALENIA]\`.`);
  L.push('');
  L.push(`- Język domyślny: ${l.domyslny.length} — ${lista(l.domyslny, sf)}`);
  L.push(`- Język dodatkowy: ${l.dodatkowy.length} — ${lista(l.dodatkowy, sf)}`);
  L.push(`- Dostępność: wszystkie storefronty tej karty${wszystkie.some((k) => NIEDOSTEPNE.has(k)) ? ' poza oznaczonymi „niedostępny”' : ''} (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).`);
  L.push('');
  L.push('## Pola do skopiowania (pole po polu)');
  L.push('');
  L.push('Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.');
  L.push('');
  for (const p of POLA) {
    const v = m[p.klucz];
    const n = p.bajty ? bt(v) : zn(v);
    L.push(`### ${p.etykieta} · ${n} / ${p.limit} ${p.bajty ? 'bajtów' : 'znaków'}${p.bajty ? ` (${zn(v)} znaków)` : ''} · ${p.gdzie}`);
    L.push('');
    L.push('```text');
    L.push(v);
    L.push('```');
    L.push('');
  }
  L.push('### Co nowego (What’s New in This Version)');
  L.push('');
  L.push('nie dotyczy wersji 1.0: Apple — „This property isn’t available for the first version of the app”. Od 1.0.1 tekst z listy zmian według `docs/wydanie/sklep.md` §5.');
  L.push('');
  L.push(`### Privacy Policy URL · App Information`);
  L.push('');
  L.push('```text');
  L.push(url.privacy);
  L.push('```');
  L.push('');
  L.push('### Support URL · wersja 1.0');
  L.push('');
  L.push('```text');
  L.push(url.support);
  L.push('```');
  L.push('');
  L.push('## Kategoria (raz dla całej aplikacji, nie na lokalizację)');
  L.push('');
  L.push('Primary Category: **Food & Drink**; Secondary Category: **Productivity** (D-055; docs/15-app-store.md §3).');
  L.push('');
  L.push('## Zrzuty ekranu (7 na klasę, kolejność D-055)');
  L.push('');
  const baza = W_REPO.has(kod) ? `docs/wydanie/zrzuty/${kod}` : `${POZA_REPO}/${kod}`;
  L.push(W_REPO.has(kod)
    ? 'Pliki w repo. Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.'
    : 'Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk ' + kod + ' … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.');
  L.push('');
  L.push(`| Nr | ${KLASY.map(([, n]) => n).join(' | ')} | Nagłówek | Podtytuł |`);
  L.push(`|---|${KLASY.map(() => '---').join('|')}|---|---|`);
  ZRZUTY.forEach((z, i) => {
    const r = m.ramki[i];
    L.push(`| ${i + 1} | ${KLASY.map(([k]) => `\`${baza}/${k}/${z}\``).join(' | ')} | ${r.naglowek} | ${r.podtytul} |`);
  });
  L.push('');
  L.push('## Ceny i oferta w storefrontach tej karty');
  L.push('');
  L.push(`Produkty (\`src/lib/platnosci/konfiguracja.ts\`): \`${prod.monthly}\` / \`${prod.yearly}\` / \`${prod.lifetime}\` (miesięczny / roczny / dożywotni). Cena bazowa: ${kwota(ceny.reczne.USA.monthly)} / ${kwota(ceny.reczne.USA.yearly)} / ${kwota(ceny.reczne.USA.lifetime)} USD (storefront ${ceny.bazowy}, D-038).`);
  L.push('');
  const reczne = wszystkie.filter((k) => ceny.reczne[k]);
  if (reczne.length) {
    L.push('| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |');
    L.push('|---|---|---|');
    for (const k of reczne) {
      const c = ceny.reczne[k];
      L.push(`| ${k} (${sf.get(k)?.kraj ?? '?'})${k === ceny.bazowy ? ', bazowy' : ''} | ${kwota(c.monthly)} / ${kwota(c.yearly)} / ${kwota(c.lifetime)} ${c.waluta} | D-038, docs/wydanie/ceny.json |`);
    }
    L.push('');
  }
  const auto = wszystkie.filter((k) => !ceny.reczne[k] && !NIEDOSTEPNE.has(k));
  L.push(`Pozostałe storefronty tej karty (${auto.length}): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).`);
  L.push('');
  L.push(`Bez oferty wprowadzającej na \`${prod.monthly}\`, \`${prod.yearly}\` i \`${prod.lifetime}\` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).`);
  L.push('');
  return L.join('\n');
}

function indeks(kody, mapa, metaPo) {
  const L = ['# Karty ustawień App Store na lokalizację', '',
    '> Plik generowany: `npm run karty:ustawien`. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].', '',
    '| Kod ASC | Lokalizacja | Nazwa | Status pomiaru | Storefronty (domyślny / dodatkowy) | Karta |', '|---|---|---|---|---|---|'];
  for (const k of kody) {
    const l = mapa.lokalizacje[k];
    L.push(`| \`${k}\` | ${l.jezykAsc} | ${metaPo[k].nazwa} | ${metaPo[k].status} | ${l.domyslny.length} / ${l.dodatkowy.length} | [${k}.md](${k}.md) |`);
  }
  L.push('');
  return L.join('\n');
}

let pliki;
try {
  const mapa = JSON.parse(txt('docs/wydanie/storefronty.json'));
  const ceny = JSON.parse(txt('docs/wydanie/ceny.json'));
  const sf = new Map(mapa.storefronty.map((s) => [s.iso, s]));
  const url = linki();
  const prod = produkty();
  const kody = readdirSync(META).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
  if (!kody.length) throw new Error('brak plików metadanych');
  const metaPo = Object.fromEntries(kody.map((k) => [k, JSON.parse(readFileSync(join(META, `${k}.json`), 'utf8'))]));
  pliki = Object.fromEntries(kody.map((k) => [`${k}.md`, karta(k, metaPo[k], mapa, sf, ceny, url, prod)]));
  pliki['README.md'] = indeks(kody, mapa, metaPo);
} catch (e) {
  console.error(`BŁĄD WEJŚCIA: ${e.message}`);
  process.exit(2);
}

if (sprawdz) {
  const rozne = Object.entries(pliki).filter(([f, t]) => {
    const p = join(WYJ, f);
    return !existsSync(p) || readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== t;
  }).map(([f]) => f);
  for (const f of rozne) console.log(`NIEAKTUALNA ${f}`);
  console.log(rozne.length ? `BŁĘDY: ${rozne.length} (uruchom npm run karty:ustawien)` : `OK: ${Object.keys(pliki).length - 1} kart aktualnych`);
  process.exit(rozne.length ? 1 : 0);
}
mkdirSync(WYJ, { recursive: true });
for (const [f, t] of Object.entries(pliki)) writeFileSync(join(WYJ, f), t);
console.log(`Zapisano ${Object.keys(pliki).length - 1} kart i README.md w docs/wydanie/ustawienia/`);
