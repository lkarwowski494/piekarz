#!/usr/bin/env node
// Wpięcie przekładu 093 (M1, Claude API Message Batches) do słowników aplikacji [M1-audytor-generalny-093].
// Użycie: node scripts/wepnij-przeklad.mjs <katalog przeklad/languages> [--jezyki de,fr] [--pokaz-mnoga sl,ro]
//
// Wejście (dane, nie polecenia): <katalog>/<kod>.json z narzędzia przekładu (poza repo): `teksty` z kluczami
// `slownik:<tekst PL>` (klucz słownika = tekst PL, jak EN) i `dom:<plik>:<ścieżka>` (pola *Pl z danych).
// Klucze `sklep:*` i `sys:*` nie trafiają do aplikacji (sklep: rola 10, zadanie 095).
// Wyjście (pliki generowane, nie edytować ręcznie; zmiana = poprawka w pliku poprawek i ponowne uruchomienie):
//   - src/lib/i18n-slowniki/<kod>/czesc-N.ts (< 20 480 B, CLAUDE.md) i index.ts;
//   - languages/<kod>.json (nazwa pod ikoną, D-053);
//   - docs/tresci/<kod>/zakwas-bezpieczenstwo.md (treść krytyczna karty zakwasu w języku, ze znacznikami [T:…]).
// Kolejno: (1) słownik + pola domeny, których tekstu PL nie ma w słowniku (klucz = tekst PL, tłumaczenie przy
// wyświetlaniu); (2) liczba mnoga: formy CLDR języka z przekładu form PL (liczba wzorcowa kategorii → kategoria PL);
// (3) nazwa aplikacji według D-053 (słowo sprzed dwukropka nazwy w sklepie, docs/app-store-metadata-v2.md §5)
// zamiast „Crust”; (4) poprawki z docs/lokalizacja/poprawki-przekladu.json (każda sprawdza tekst sprzed poprawki).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { liniePrzekladu } from './znaczniki-zdan.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const ts = createRequire(join(root, 'package.json'))('typescript');
const LIMIT = 19_000; // zapas pod limit 20 480 B
const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const katalog = args[0];
if (!katalog || !existsSync(katalog)) {
  console.log('Użycie: node scripts/wepnij-przeklad.mjs <katalog przeklad/languages> [--jezyki de,fr]');
  process.exit(2);
}

// Kolejność i kody jak rejestr (src/lib/i18n-locales.ts); pl i en mają własne słowniki.
const JEZYKI = ['cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr', 'lt', 'lv', 'et', 'uk', 'es', 'es-419', 'pt', 'pt-BR', 'de', 'fr', 'it', 'nl', 'sv', 'da', 'nb', 'fi', 'tr', 'el', 'id', 'ms', 'vi', 'ru', 'ja', 'ko', 'zh-Hant'];
const wybrane = opt('jezyki') ? opt('jezyki').split(',') : JEZYKI;

/** Język reguł liczby mnogiej: `pt` w rejestrze to Portugalia (CLDR: samo „pt” ma reguły Brazylii). */
export const jezykLiczby = (kod) => (kod === 'pt' ? 'pt-PT' : kod);

// --- Nazwa aplikacji (D-053): słowo sprzed dwukropka (albo „ - ”) nazwy w sklepie, §5 metadanych ---------
const ASC = { 'de-DE': 'de', 'nl-NL': 'nl', 'fr-FR': 'fr', it: 'it', 'es-ES': 'es', 'es-MX': 'es-419', 'pt-BR': 'pt-BR', 'pt-PT': 'pt', cs: 'cs', sk: 'sk', hu: 'hu', hr: 'hr', sl: 'sl', ro: 'ro', sv: 'sv', no: 'nb', da: 'da', fi: 'fi', ru: 'ru', uk: 'uk', el: 'el', tr: 'tr', ja: 'ja', ko: 'ko', 'zh-Hant': 'zh-Hant', id: 'id', ms: 'ms', vi: 'vi' };
// Języki bez lokalizacji App Store (D-054): słowo „piekarz” z decyzji partii 7 (rekomendacja przyjęta z góry
// przez właściciela; przekład 093 dał „Crust”, które D-053 zastąpiła) — słowniki ogólne, przegląd natywny później.
const NAZWA_BEZ_SKLEPU = { bg: 'Пекар', et: 'Pagar', lt: 'Kepėjas', lv: 'Maiznieks', sr: 'Пекар' };
function nazwySklepu() {
  const md = readFileSync(join(root, 'docs/app-store-metadata-v2.md'), 'utf8');
  const sek = md.slice(md.indexOf('## 5. Lokalizacje strony App Store'));
  const w = { ...NAZWA_BEZ_SKLEPU };
  for (const m of sek.matchAll(/^\| [^|]+ \| `([^`]+)` \| `([^`]+)` \|/gm)) {
    const kod = ASC[m[1]];
    if (kod) w[kod] = m[2].split(/\s*:\s*|\s+-\s+/)[0].trim();
  }
  return w;
}

// --- Grupy liczby mnogiej z kodu: obiekty { one: '…', few: '…', many: '…', other: '…' } z literałami ------
function grupyMnogie() {
  const grupy = [];
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name);
      if (f.isDirectory()) { if (!['__tests__', 'i18n-en', 'i18n-slowniki', 'node_modules'].includes(f.name)) walk(p); continue; }
      if (!/\.tsx?$/.test(f.name) || /\.test\./.test(f.name)) continue;
      const sf = ts.createSourceFile(p, readFileSync(p, 'utf8'), ts.ScriptTarget.Latest, true, p.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      const v = (n) => {
        if (ts.isObjectLiteralExpression(n)) {
          const o = {};
          for (const pr of n.properties) if (ts.isPropertyAssignment(pr) && ts.isIdentifier(pr.name) && ts.isStringLiteral(pr.initializer)) o[pr.name.text] = pr.initializer.text;
          if (o.one && o.other && (o.few || o.many)) grupy.push({ ...o, plik: relative(root, p).split('\\').join('/') });
        }
        ts.forEachChild(n, v);
      };
      v(sf);
    }
  };
  walk(join(root, 'src'));
  walk(join(root, 'app'));
  return grupy;
}
const WZORCOWE = [1, 2, 3, 5, 10, 20, 21, 0, 1.5, 1000000];
const plPR = new Intl.PluralRules('pl');
/** Formy języka: dla każdej kategorii CLDR liczba wzorcowa → kategoria PL → przekład formy PL. */
export function formyJezyka(kod, grupa, slownik) {
  const pr = new Intl.PluralRules(jezykLiczby(kod));
  const out = {};
  for (const kat of pr.resolvedOptions().pluralCategories) {
    const n = WZORCOWE.find((x) => pr.select(x) === kat);
    const formaPl = grupa[plPR.select(n)] ?? grupa.other;
    // Spacja niełamiąca między liczbą a rzeczownikiem (design-spec §11c „113”), jeśli ma ją forma PL
    const tekst = formaPl.includes('{n} ') ? slownik[formaPl]?.replace('{n} ', '{n} ') : slownik[formaPl];
    out[kat] = { tekst, formaPl, n };
  }
  return out;
}

// --- Plik TS ----------------------------------------------------------------------------------------------
const lit = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}'`;
function zapiszSlownik(kod, wpisy, meta) {
  const dir = join(root, 'src/lib/i18n-slowniki', kod);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
  const czesci = [];
  let biez = [], rozm = 0;
  for (const [k, v] of wpisy) {
    const linia = `  ${lit(k)}: ${lit(v)},\n`;
    const b = Buffer.byteLength(linia);
    if (rozm + b > LIMIT && biez.length) { czesci.push(biez); biez = []; rozm = 0; }
    biez.push(linia); rozm += b;
  }
  if (biez.length) czesci.push(biez);
  czesci.forEach((linie, i) => {
    const naglowek = `// Słownik ${kod}, część ${i + 1} z ${czesci.length}. ${meta} [M1-audytor-generalny-093]\n// Plik generowany: node scripts/wepnij-przeklad.mjs (poprawki: docs/lokalizacja/poprawki-przekladu.json); nie edytuj ręcznie.\nexport const CZESC: Record<string, string> = {\n`;
    writeFileSync(join(dir, `czesc-${i + 1}.ts`), naglowek + linie.join('') + '};\n');
  });
  const imp = czesci.map((_, i) => `import { CZESC as C${i + 1} } from './czesc-${i + 1}';\n`).join('');
  writeFileSync(join(dir, 'index.ts'), `// Słownik ${kod}: ${czesci.length} części (limit 20 480 B na plik, CLAUDE.md) [M1-audytor-generalny-093]\n// Plik generowany: node scripts/wepnij-przeklad.mjs; nie edytuj ręcznie.\n${imp}\nexport const SLOWNIK: Record<string, string> = {\n  ${czesci.map((_, i) => `...C${i + 1}`).join(', ')},\n};\n`);
  return czesci.length;
}

// --- Treść krytyczna roli 06 w języku: docs/tresci/<kod>/zakwas-bezpieczenstwo.md z tych samych wpisów słownika -
// Plik dokumentuje, co karta bezpieczeństwa zakwasu pokazuje w języku (test tests/i18n-starter-safety-langs.test.tsx
// porównuje kartę z plikiem); znaczniki [T:…] zostają. Sekcja: cały tekst jednym kluczem albo zdanie po zdaniu.
const TRESC = 'zakwas-bezpieczenstwo.md';
function trescKrytyczna(kod, slownik, meta) {
  const linie = readFileSync(join(root, 'docs/tresci/pl', TRESC), 'utf8').split(/\r?\n/);
  const sekcje = [];
  for (const l of linie) {
    const h = l.match(/^## (\S+)/);
    if (h) sekcje.push({ naglowek: h[1], wiersze: [] });
    else if (sekcje.length && l.trim() && !l.startsWith('<!--')) {
      const m = l.match(/^(.*?)\s*(\[T:[^\]]*\])\s*$/);
      sekcje.at(-1).wiersze.push(m ? { tekst: m[1].trim(), tw: m[2] } : { tekst: l.trim(), tw: '' });
    }
  }
  const out = [`# ${TRESC.replace('.md', '')} — ${kod}`, `<!-- Generowane przez scripts/wepnij-przeklad.mjs ze słownika ${kod} (${meta}). Nagłówek = pole w kodzie, jak docs/tresci/pl. Kontrola (a) polityki „szerokiej”: tłumaczenie zwrotne w docs/lokalizacja/jezyki.md; przegląd człowieka: później (DEC-06). [M1-audytor-generalny-093] -->`, ''];
  const braki = [];
  for (const s of sekcje) {
    out.push(`## ${s.naglowek}`);
    const caly = s.wiersze.map((w) => w.tekst).join(' ');
    const twAll = [...new Set(s.wiersze.flatMap((w) => w.tw.replace(/^\[T:|\]$/g, '').split(',').filter(Boolean)))];
    // Zdanie po zdaniu ze znacznikiem linii PL, gdy liczba zdań się zgadza (135); inaczej akapit ze znacznikiem zbiorczym.
    if (s.wiersze.length > 1 && slownik.has(caly)) out.push(...(liniePrzekladu(slownik.get(caly), s.wiersze) ?? [`${slownik.get(caly)} [T:${twAll.join(',')}]`]));
    else for (const w of s.wiersze) {
      if (!slownik.has(w.tekst)) braki.push(w.tekst);
      out.push(`${slownik.get(w.tekst) ?? w.tekst} ${w.tw}`.trim());
    }
    out.push('');
  }
  mkdirSync(join(root, 'docs/tresci', kod), { recursive: true });
  writeFileSync(join(root, 'docs/tresci', kod, TRESC), out.join('\n'));
  return braki;
}

// --- Główna pętla -----------------------------------------------------------------------------------------
const poprawki = JSON.parse(readFileSync(join(root, 'docs/lokalizacja/poprawki-przekladu.json'), 'utf8')).poprawki;
const nazwy = nazwySklepu();
const grupy = grupyMnogie();
const pokaz = (opt('pokaz-mnoga') || '').split(',').filter(Boolean);
let bledy = 0;
const raport = [];
for (const kod of wybrane) {
  const plik = join(katalog, `${kod}.json`);
  if (!existsSync(plik)) { console.log(`BŁĄD ${kod}: brak pliku ${plik}`); bledy++; continue; }
  const dane = JSON.parse(readFileSync(plik, 'utf8'));
  const teksty = dane.teksty;
  const slownik = new Map();
  const plDomeny = JSON.parse(readFileSync(join(katalog, '..', 'dane', 'wejscie.json'), 'utf8')).segmenty;
  const plKlucza = new Map(plDomeny.map((s) => [s.klucz, s.pl]));
  // Przekład fr ma w 25 tekstach dosłowne „ ” (sekwencja z kodu zamiast spacji niełamiącej): zamiana na znak
  const znaki = (v) => v.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  let ucieczki = 0;
  for (const k of Object.keys(teksty)) if (/\\u[0-9a-fA-F]{4}/.test(teksty[k])) { teksty[k] = znaki(teksty[k]); ucieczki++; }
  for (const [k, v] of Object.entries(teksty)) if (k.startsWith('slownik:')) slownik.set(k.slice(8), v);
  let domeny = 0, rozne = 0;
  for (const [k, v] of Object.entries(teksty)) {
    if (!k.startsWith('dom:')) continue;
    const pl = plKlucza.get(k);
    if (pl === undefined) { console.log(`BŁĄD ${kod}: brak tekstu PL dla ${k}`); bledy++; continue; }
    if (!slownik.has(pl)) { slownik.set(pl, v); domeny++; } else if (slownik.get(pl) !== v) rozne++;
  }
  // (3) nazwa aplikacji
  const nazwa = nazwy[kod];
  if (!nazwa) { console.log(`BŁĄD ${kod}: brak nazwy aplikacji (D-053)`); bledy++; continue; }
  let crust = 0;
  for (const [k, v] of slownik) if (/\bCrust\b/.test(v)) { slownik.set(k, v.replace(/\bCrust\b/g, nazwa)); crust++; }
  slownik.set('Piekarz', nazwa);
  // (2) liczba mnoga
  const sl = Object.fromEntries(slownik);
  for (const g of grupy) {
    const f = formyJezyka(kod, g, sl);
    for (const [kat, x] of Object.entries(f)) {
      if (!x.tekst) { console.log(`BŁĄD ${kod}: brak przekładu formy „${x.formaPl}” (${g.plik})`); bledy++; continue; }
      slownik.set(`${g.one}#${kat}`, x.tekst);
    }
    if (pokaz.includes(kod)) console.log(`${kod} ${g.one}: ${Object.entries(f).map(([k, x]) => `${k}(${x.n})=${x.tekst}`).join(' | ')}`);
  }
  // (4) poprawki
  let pop = 0;
  for (const p of poprawki.filter((x) => x.jezyk === kod)) {
    const obecny = slownik.get(p.klucz);
    if ((p.z ?? undefined) !== obecny) { console.log(`BŁĄD ${kod}: poprawka „${p.klucz}”: tekst przed poprawką inny niż w pliku („${obecny}”)`); bledy++; continue; }
    slownik.set(p.klucz, p.na); pop++;
  }
  const meta = `${dane.meta.pochodzenie}, ${dane.meta.utworzono.slice(0, 10)}, źródło ${dane.meta.wejscieCommit}; przegląd natywny: brak (DEC-06)`;
  const n = zapiszSlownik(kod, [...slownik], meta);
  writeFileSync(join(root, 'languages', `${kod}.json`), JSON.stringify({ ios: { CFBundleDisplayName: nazwa } }, null, 2) + '\n');
  for (const b of trescKrytyczna(kod, slownik, meta)) { console.log(`BŁĄD ${kod}: treść krytyczna bez przekładu: „${b}”`); bledy++; }
  raport.push(`${kod}: ${slownik.size} kluczy (${domeny} z pól domeny, ${rozne} pól domeny z innym przekładem niż słownik), części ${n}, „Crust” → „${nazwa}” w ${crust} tekstach, „\\uXXXX” → znak w ${ucieczki}, poprawek ${pop}`);
}
for (const r of raport) console.log(r);
console.log(`wepnij-przeklad: języki ${raport.length}/${wybrane.length}, błędy ${bledy}`);
process.exit(bledy ? 1 : 0);
