#!/usr/bin/env node
// Znaczniki zdań treści krytycznej w językach przekładu [M1-audytor-generalny-135; 06-tresci-501].
// Sekcja PL ma jedno zdanie na linię, każde z własnym znacznikiem [T:…]; przekład całej sekcji przychodzi jednym
// tekstem. Gdy przekład dzieli się na tyle zdań, ile linii ma sekcja PL (granica: . ! ? i spacja), każde zdanie
// dostaje znacznik linii PL o tym samym numerze; inaczej sekcja zostaje jednym akapitem ze znacznikiem zbiorczym
// (kontrola mechaniczna roli 06 pokaże ją jako błąd do ręcznego rozstrzygnięcia). Złączenie linii spacją daje
// dokładnie tekst słownika, więc karta i plik pozostają równe (tests/i18n-starter-safety-langs.test.tsx).
// Użycie: node scripts/znaczniki-zdan.mjs [--zapisz] [--jezyki de,fr] — przelicza istniejące pliki
// docs/tresci/<kod>/zakwas-bezpieczenstwo.md bez wejścia przekładu (te same zdania, inne łamanie linii).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TRESC = 'zakwas-bezpieczenstwo.md';

/** Zdania tekstu: granica po . ! ? (także z cudzysłowem zamykającym) i jednej spacji. */
export function zdania(tekst) {
  return tekst.split(/(?<=[.!?…][»”"')]?) (?=\S)/).map((s) => s.trim()).filter(Boolean);
}

/** Linie wyjścia sekcji: zdanie + znacznik linii PL, gdy liczby się zgadzają; inaczej null. */
export function liniePrzekladu(przeklad, wierszePl) {
  const z = zdania(przeklad);
  if (z.length !== wierszePl.length || z.join(' ') !== przeklad.trim()) return null;
  return z.map((s, i) => `${s} ${wierszePl[i].tw}`.trim());
}

/** Sekcje pliku treści: nagłówek (pierwsze słowo) → linie { tekst, tw }. */
export function sekcjeTresci(tekst) {
  const sekcje = [];
  for (const l of tekst.split(/\r?\n/)) {
    const h = l.match(/^## (\S+)/);
    if (h) sekcje.push({ naglowek: h[1], wiersze: [] });
    else if (sekcje.length && l.trim() && !l.startsWith('<!--')) {
      const m = l.match(/^(.*?)\s*(\[T:[^\]]*\])\s*$/);
      sekcje.at(-1).wiersze.push(m ? { tekst: m[1].trim(), tw: m[2] } : { tekst: l.trim(), tw: '' });
    }
  }
  return sekcje;
}

/** Przelicza plik języka według sekcji PL; zwraca nowy tekst i listę sekcji bez dopasowania. */
export function przeliczPlik(tekstJezyka, tekstPl) {
  const pl = new Map(sekcjeTresci(tekstPl).map((s) => [s.naglowek, s.wiersze]));
  const bezDopasowania = [];
  // Bloki: nagłówek sekcji i jego linie; sekcja języka z jedną linią treści przy kilku liniach PL = akapit do podziału.
  const bloki = [];
  for (const l of tekstJezyka.split(/\r?\n/)) {
    const h = l.match(/^## (\S+)/);
    if (h || !bloki.length) bloki.push({ sekcja: h ? h[1] : null, linie: [l] });
    else bloki.at(-1).linie.push(l);
  }
  const out = [];
  for (const b of bloki) {
    const wPl = b.sekcja ? pl.get(b.sekcja) : undefined;
    const tresc = b.linie.slice(1).filter((l) => l.trim() && !l.startsWith('<!--'));
    const m = tresc.length === 1 ? tresc[0].match(/^(.*?)\s*(\[T:[^\]]*\])\s*$/) : null;
    if (wPl && wPl.length > 1 && m) {
      const nowe = liniePrzekladu(m[1].trim(), wPl);
      if (nowe) {
        out.push(...b.linie.map((l) => (l === tresc[0] ? nowe.join('\n') : l)));
        continue;
      }
      bezDopasowania.push(b.sekcja);
    }
    out.push(...b.linie);
  }
  return { tekst: out.join('\n'), bezDopasowania };
}

const glowny = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (glowny) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const args = process.argv.slice(2);
  const zapisz = args.includes('--zapisz');
  const jezyki = args.includes('--jezyki') ? args[args.indexOf('--jezyki') + 1].split(',') : null;
  const tekstPl = readFileSync(join(root, 'docs/tresci/pl', TRESC), 'utf8');
  let zmienione = 0;
  for (const kod of readdirSync(join(root, 'docs/tresci')).filter((k) => !['pl', 'en', 'przeglad'].includes(k))) {
    if (jezyki && !jezyki.includes(kod)) continue;
    const p = join(root, 'docs/tresci', kod, TRESC);
    if (!existsSync(p)) continue;
    const stary = readFileSync(p, 'utf8');
    const { tekst, bezDopasowania } = przeliczPlik(stary, tekstPl);
    if (tekst !== stary) { zmienione++; if (zapisz) writeFileSync(p, tekst); }
    console.log(`${kod}: ${tekst !== stary ? 'zmiana' : 'bez zmian'}${bezDopasowania.length ? `; bez dopasowania liczby zdań: ${bezDopasowania.join(', ')}` : ''}`);
  }
  console.log(`${zapisz ? 'zapisano' : 'do zapisu (--zapisz)'}: ${zmienione}`);
}
