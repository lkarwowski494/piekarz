/**
 * Klucze słowników bez miejsca w kodzie (sieroty) po usunięciu komponentów i tekstów.
 * Słownik ma odpowiadać tekstom w kodzie: martwy wpis to koszt przekładu w 33 językach i fałszywy sygnał
 * pokrycia. Sprawdza słownik EN, 33 słowniki przekładu i kontekst przekładu (pl.kontekst.json).
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const plikiSlownikow = (): string[] => {
  const en = join(ROOT, 'src/lib/i18n-en');
  const out = readdirSync(en).filter((f) => f.endsWith('.ts')).map((f) => join(en, f));
  const sl = join(ROOT, 'src/lib/i18n-slowniki');
  for (const d of readdirSync(sl, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    for (const f of readdirSync(join(sl, d.name))) if (/^czesc-\d+\.ts$/.test(f)) out.push(join(sl, d.name, f));
  }
  return out;
};
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const wystapienia = (klucz: string): string[] => {
  const hit: string[] = [];
  for (const p of plikiSlownikow()) {
    if (readFileSync(p, 'utf8').includes(`  '${esc(klucz)}': `)) hit.push(p.slice(ROOT.length + 1));
  }
  const kontekst = JSON.parse(readFileSync(join(ROOT, 'docs/lokalizacja/pl.kontekst.json'), 'utf8'));
  if (klucz in kontekst) hit.push('docs/lokalizacja/pl.kontekst.json');
  return hit;
};

const wKodzie = (klucz: string): boolean => {
  const szukaj = (dir: string): boolean => {
    for (const d of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, d.name);
      if (d.isDirectory()) {
        if (['__tests__', 'i18n-en', 'i18n-slowniki', 'node_modules'].includes(d.name)) continue;
        if (szukaj(p)) return true;
      } else if (/\.(ts|tsx)$/.test(d.name) && readFileSync(p, 'utf8').includes(klucz)) return true;
    }
    return false;
  };
  return szukaj(join(ROOT, 'src')) || szukaj(join(ROOT, 'app'));
};

const SIEROTY: Array<[string, string]> = [
  // [M2-koordynator-napraw-401 (p12b3)]: po p12b3 bez miejsca użycia
  ['Zmień język na {nazwa}', '401 (p12b3)'],
  ['Upieczony bochenek', '401 (p12b3)'],
  // [M2-koordynator-napraw-633 (p12c)]: teksty usuniętego src/components/ui.tsx (5665342)
  ['Nie znaleziono rekordu', '633 (p12c)'],
  ['Wybrany element nie istnieje lub został wcześniej usunięty.', '633 (p12c)'],
  ['Wróć', '633 (p12c)'],
  ['Wyczyść wyszukiwanie', '633 (p12c)'],
  // [M2-koordynator-napraw-402 (p12d)]: po 179 zakwas w lodówce ma jedno przypomnienie (D-068)
  ['Zakwas „{name}” czeka na karmienie od 6 dni.', '402 (p12d)'],
  // [M2-koordynator-napraw-634 (p12c)]: model telefonu nie jest zbierany (D-066 5a), wiersz „Telefon” usunięty
  ['Telefon: {model}', '634 (p12c)'],
];

describe('słowniki bez osieroconych kluczy (p13a)', () => {
  it.each(SIEROTY)('„%s” (%s): brak w kodzie, więc brak w słownikach', (klucz) => {
    expect(wKodzie(`'${klucz}'`)).toBe(false);
    expect(wystapienia(klucz)).toEqual([]);
  });
});
