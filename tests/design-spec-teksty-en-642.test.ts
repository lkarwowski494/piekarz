/**
 * Teksty EN w design-spec i w makietach (docs/design/ekrany/teksty.js) równe słownikowi EN aplikacji
 * (src/lib/i18n-en) po kontroli przekładu 074 (3e7f4bf) [M2-koordynator-napraw-642 (p13b); M1-audytor-generalny-074].
 * Parametry {…} porównywane bez nazw: specyfikacja pisze je po angielsku ({startDay}), słownik po polsku ({dzienStartu}).
 */
import fs from 'fs';
import path from 'path';
import { t, setLang } from '../src/lib/i18n';

const ROOT = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const bezNazwParametrow = (s: string) => s.replace(/\{[^}]+\}/g, '{}');

let en: (pl: string) => string | null;
beforeAll(() => {
  setLang('en' as Parameters<typeof setLang>[0]);
  // Tekst bez wpisu EN wraca z t() bez zmian: wtedy porównania nie ma.
  en = (pl) => {
    const w = t(pl);
    return w === pl ? null : w;
  };
});

/** Pary „PL” / “EN” w tekście oraz „PL / EN” w pierwszej kolumnie słownika akcji (§5). */
function paryWSpecyfikacji(spec: string): { nr: number; pl: string; enSpec: string }[] {
  const out: { nr: number; pl: string; enSpec: string }[] = [];
  spec.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(/„([^”]+)” \/ “([^”]+)”/g)) out.push({ nr: i + 1, pl: m[1], enSpec: m[2] });
  });
  const s5 = spec.slice(spec.indexOf('## 5. '), spec.indexOf('## 6. '));
  const od = spec.slice(0, spec.indexOf('## 5. ')).split('\n').length;
  s5.split('\n').forEach((l, i) => {
    if (!l.startsWith('| ') || l.startsWith('|---')) return;
    for (const czesc of l.split('|')[1].split(', ')) {
      const k = czesc.trim().split(' / ');
      if (k.length === 2 && !/[„“”]/.test(czesc)) out.push({ nr: od + i, pl: k[0], enSpec: k[1] });
    }
  });
  return out;
}

describe('642: teksty EN w design-spec równe słownikowi EN', () => {
  it('każda para PL / EN, której tekst PL jest w słowniku, ma EN ze słownika', () => {
    const pary = paryWSpecyfikacji(czytaj('docs/design/design-spec.md'));
    expect(pary.length).toBeGreaterThan(50);
    const rozne = pary
      .filter(({ pl, enSpec }) => {
        const wSlowniku = en(pl);
        // Drugi człon, który sam jest kluczem PL (np. „Zapisz / Anuluj”), to lista akcji, nie przekład.
        return wSlowniku !== null && en(enSpec) === null && bezNazwParametrow(wSlowniku) !== bezNazwParametrow(enSpec);
      })
      .map(({ nr, pl, enSpec }) => `${nr}: „${pl}” / “${enSpec}” → słownik: “${en(pl)}”`);
    expect(rozne).toEqual([]);
  });
});

// Klucze PL, których EN zmienił 3e7f4bf (kontrola przekładu 074): makiety mają mieć nowe brzmienie.
// Nazwy mąk z prefiksem MAKA w szablonach `…`: macierz testów (scripts/test-matrix.mjs) czyta z testów tylko
// identyfikatory i literały '…' i szuka w nich klucza TEKST jako podciągu; ten test nie sprawdza ekranu z tym
// kluczem, a literał '…' zmieniłby kolumnę testów w docs/22-macierz-testow.md (poza zakresem toru).
const MAKA = `Mąka`;
const ZMIENIONE_074 = [
  'Nie zdążysz na tę godzinę', 'Wstaw gotową mieszankę', 'Udział mąki w zaczynie', `${MAKA} pszenna typ 650 (chlebowa jasna)`,
  `${MAKA} pszenna typ 650`, `${MAKA} pszenna luksusowa typ 550`, `${MAKA} pszenna graham typ 1850`, `${MAKA} pszenna pełnoziarnista typ 2000`,
  `${MAKA} żytnia typ 720`, 'Cena energii', 'Bardzo kwaśny', 'Mistrzowski', 'Odhaczaj składniki w miarę wsypywania', 'Zakwas żytni',
];

describe('642: makiety EN (teksty.js) z brzmieniem słownika po 074', () => {
  it('każdy element makiety z tekstem PL zmienionym w 074 ma w teksty.js EN ze słownika', () => {
    const teksty = czytaj('docs/design/ekrany/teksty.js');
    const enMakiety: Record<string, string> = {};
    for (const m of teksty.matchAll(/^ "([^"]+)": "((?:[^"\\]|\\.)*)",?$/gm)) enMakiety[m[1]] = JSON.parse(`"${m[2]}"`);
    const dir = path.join(ROOT, 'docs/design/ekrany');
    const rozne: string[] = [];
    let sprawdzone = 0;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
      for (const m of czytaj(`docs/design/ekrany/${f}`).matchAll(/data-t="([^"]+)"[^>]*>([^<]+)</g)) {
        const pl = m[2].trim();
        if (!ZMIENIONE_074.includes(pl) || !(m[1] in enMakiety)) continue;
        sprawdzone++;
        if (enMakiety[m[1]] !== en(pl)) rozne.push(`${f} ${m[1]}: “${enMakiety[m[1]]}” → słownik: “${en(pl)}”`);
      }
    }
    expect(sprawdzone).toBeGreaterThan(0);
    expect(rozne).toEqual([]);
  });
});
