#!/usr/bin/env node
/**
 * Kontrola metadanych strony produktu App Store dla 34 lokalizacji (D-054) z jednego źródła roli 10:
 * docs/wydanie/metadane/<kod ASC>.json [M1-audytor-generalny-095].
 *
 * Użycie: node scripts/sprawdz-metadane.mjs [katalog=docs/wydanie/metadane] [--pomiar]
 * Wyjście: 0 bez błędów, 1 z błędami, 2 zły argument.
 *
 * Reguły (App Store Connect Help, odczyt 2026-10-19 w raportach roli 10; §5 docs/app-store-metadata-v2.md):
 * nazwa 2–30 znaków, podtytuł ≤ 30, tekst promocyjny ≤ 170, opis ≤ 4000; słowa kluczowe ≤ 100 B UTF-8,
 * każde > 2 znaki, bez powtórzeń i bez wyrazów z nazwy i podtytułu; bez „Crust” (D-053); bez funkcji
 * PÓŹNIEJ i NIE z kontraktu B (OG-05) w języku lokalizacji (scripts/og05-slowa.json); 7 ramek z nagłówkiem
 * i podtytułem (D-055); język lokalizacji ma status `released` w src/lib/i18n-locales.ts (reguła prawdy D-054);
 * opis kończy się zdaniem o 35 językach (liczba języków released).
 * Znaki liczone w punktach kodowych, jak w tests/teksty-sklepu.test.ts.
 * Dlaczego skrypt, a nie przegląd: 34 lokalizacje × 6 pól to za dużo na kontrolę okiem przed każdą zmianą.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const pomiar = args.includes('--pomiar');
const katalog = resolve(args.find((a) => !a.startsWith('--')) ?? join(ROOT, 'docs/wydanie/metadane'));

/** 34 lokalizacje strony (D-054, §5): kod ASC → kod języka aplikacji. bg, et, lt, lv, sr nie mają lokalizacji App Store. */
export const LOKALIZACJE = {
  'en-US': 'en', 'en-GB': 'en', 'en-AU': 'en', 'en-CA': 'en',
  'de-DE': 'de', 'nl-NL': 'nl', 'fr-FR': 'fr', 'fr-CA': 'fr', it: 'it', 'es-ES': 'es', 'es-MX': 'es-419',
  'pt-BR': 'pt-BR', 'pt-PT': 'pt', pl: 'pl', cs: 'cs', sk: 'sk', hu: 'hu', hr: 'hr', sl: 'sl', ro: 'ro',
  sv: 'sv', no: 'nb', da: 'da', fi: 'fi', ru: 'ru', uk: 'uk', el: 'el', tr: 'tr', ja: 'ja', ko: 'ko',
  'zh-Hant': 'zh-Hant', id: 'id', ms: 'ms', vi: 'vi',
};

const LIMITY = { nazwa: [2, 30], podtytul: [0, 30], tekstPromocyjny: [0, 170], opis: [0, 4000] };
const zn = (s) => [...s].length;
const bt = (s) => Buffer.byteLength(s, 'utf8');
const wyrazy = (s) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => zn(w) > 1);

const B = [];
const I = [];

function released() {
  const src = readFileSync(join(ROOT, 'src/lib/i18n-locales.ts'), 'utf8');
  const kody = new Set();
  for (const m of src.matchAll(/released\('([\w-]+)'/g)) kody.add(m[1]);
  for (const m of src.matchAll(/code: '([\w-]+)'[^}]*status: 'released'/g)) kody.add(m[1]);
  return kody;
}

function og05() {
  const d = JSON.parse(readFileSync(join(ROOT, 'scripts/og05-slowa.json'), 'utf8'));
  const out = {};
  for (const [j, { granica, slowa }] of Object.entries(d.jezyki)) {
    out[j] = [...d.wspolne, ...slowa].map((s) => new RegExp((granica ? '(?<![\\p{L}\\p{N}])' : '') + `(?:${s})`, 'iu'));
  }
  return out;
}

function sprawdz() {
  if (!existsSync(katalog) || !statSync(katalog).isDirectory()) throw new Error(`brak katalogu ${katalog}`);
  const pliki = readdirSync(katalog).filter((f) => f.endsWith('.json'));
  const kody = pliki.map((f) => f.replace(/\.json$/, ''));
  for (const k of Object.keys(LOKALIZACJE)) if (!kody.includes(k)) B.push(`${k}: brak pliku ${k}.json`);
  for (const k of kody) if (!(k in LOKALIZACJE)) B.push(`${k}: lokalizacja spoza listy 34 (D-054)`);
  const rel = released();
  const zakazane = og05();
  const pomiary = [];

  for (const kod of kody.filter((k) => k in LOKALIZACJE)) {
    let m;
    try {
      m = JSON.parse(readFileSync(join(katalog, `${kod}.json`), 'utf8'));
    } catch (e) {
      B.push(`${kod}: zły JSON (${e.message})`);
      continue;
    }
    const jezyk = LOKALIZACJE[kod];
    if (m.lokalizacja !== kod) B.push(`${kod}: pole lokalizacja = ${m.lokalizacja}`);
    if (m.jezyk !== jezyk) B.push(`${kod}: pole jezyk = ${m.jezyk}, oczekiwane ${jezyk}`);
    if (!rel.has(jezyk)) B.push(`${kod}: język ${jezyk} nie ma statusu released (reguła prawdy D-054)`);

    for (const pole of ['nazwa', 'podtytul', 'slowaKluczowe', 'tekstPromocyjny', 'opis']) {
      if (typeof m[pole] !== 'string') B.push(`${kod}.${pole}: brak pola`);
    }
    if (!Array.isArray(m.ramki) || m.ramki.length !== 7) B.push(`${kod}.ramki: ${m.ramki?.length ?? 0} ramek zamiast 7 (D-055)`);
    const ramki = Array.isArray(m.ramki) ? m.ramki : [];
    ramki.forEach((r, i) => {
      for (const p of ['naglowek', 'podtytul']) if (typeof r?.[p] !== 'string' || !r[p].trim()) B.push(`${kod}.ramki[${i + 1}].${p}: pusty`);
    });
    if (B.some((b) => b.startsWith(`${kod}.`) && /brak pola/.test(b))) continue;

    for (const [pole, [od, doL]] of Object.entries(LIMITY)) {
      const n = zn(m[pole]);
      if (n < od || n > doL) B.push(`${kod}.${pole}: ${n} znaków (dozwolone ${od}–${doL})`);
    }

    const sk = m.slowaKluczowe;
    if (bt(sk) > 100) B.push(`${kod}.slowaKluczowe: ${bt(sk)} B > 100 B`);
    const frazy = sk.split(',').map((s) => s.trim().toLowerCase());
    const zNazwy = new Set([...wyrazy(m.nazwa), ...wyrazy(m.podtytul)]);
    frazy.forEach((f, i) => {
      if (zn(f) <= 2) B.push(`${kod}.slowaKluczowe: „${f}” ma najwyżej 2 znaki`);
      if (frazy.indexOf(f) !== i) B.push(`${kod}.slowaKluczowe: powtórzone „${f}”`);
      for (const w of wyrazy(f)) if (zNazwy.has(w)) B.push(`${kod}.slowaKluczowe: „${w}” jest już w nazwie albo podtytule`);
    });

    const teksty = [
      ['nazwa', m.nazwa], ['podtytul', m.podtytul], ['slowaKluczowe', sk], ['tekstPromocyjny', m.tekstPromocyjny], ['opis', m.opis],
      ...ramki.flatMap((r, i) => [[`ramki[${i + 1}].naglowek`, r.naglowek], [`ramki[${i + 1}].podtytul`, r.podtytul]]),
    ];
    const lista = zakazane[jezyk] ?? zakazane[jezyk.split('-')[0]];
    if (!lista) B.push(`${kod}: brak listy słów OG-05 dla języka ${jezyk} (scripts/og05-slowa.json)`);
    for (const [pole, t] of teksty) {
      if (/\bCrust\b/.test(t)) B.push(`${kod}.${pole}: „Crust” (D-053: nazwa lokalna)`);
      for (const re of lista ?? []) {
        const hit = t.match(re);
        if (hit) B.push(`${kod}.${pole}: funkcja PÓŹNIEJ/NIE (OG-05) „${hit[0]}” (${re.source})`);
      }
      if (/[*_]{1,2}\S/.test(t) && pole.startsWith('ramki')) B.push(`${kod}.${pole}: znaczniki Markdown w podpisie`);
    }
    const ostatnie = m.opis.trim().split('\n').pop();
    if (!new RegExp(`(?<!\\d)${rel.size}(?!\\d)`).test(ostatnie)) B.push(`${kod}.opis: ostatnie zdanie bez liczby języków ${rel.size} („${ostatnie}”)`);

    pomiary.push({
      kod,
      suma: ramki.reduce((s, r) => s + zn(r.naglowek) + zn(r.podtytul), 0),
      maksNaglowek: Math.max(...ramki.map((r) => zn(r.naglowek))),
      maksPodtytul: Math.max(...ramki.map((r) => zn(r.podtytul))),
    });
  }

  if (pomiar) {
    pomiary.sort((a, b) => b.suma - a.suma);
    for (const p of pomiary) I.push(`podpisy ${p.kod}: suma ${p.suma} znaków, najdłuższy nagłówek ${p.maksNaglowek}, najdłuższy podtytuł ${p.maksPodtytul}`);
  }
  return kody.filter((k) => k in LOKALIZACJE).length;
}

let n = 0;
try {
  n = sprawdz();
} catch (e) {
  console.error(`BŁĄD ARGUMENTU: ${e.message}`);
  process.exit(2);
}
for (const x of I) console.log('INFO', x);
for (const x of B) console.log('BŁĄD', x);
console.log(B.length ? `BŁĘDY: ${B.length}` : `OK: ${n} lokalizacji bez błędów`);
process.exit(B.length ? 1 : 0);
