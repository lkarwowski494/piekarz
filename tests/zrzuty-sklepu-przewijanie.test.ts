// ============================================================================
// Piekarz — straż scen zrzutów sklepu: `tapOn` po id bez przewinięcia (KO-047, D-379).
// Zrzuty #3 (run 43072716967): na 6,3″ (402×874 pt) przycisk „Doktor Chleba” leżał pod krawędzią ekranu
// (maestro.log: dziennik-doktor-btn bounds=[16,854][386,906]); `tapOn` nie przewija, więc scena 04 padła dopiero po ~50 min
// przebiegu (D-378). Ta kontrola łapie tę klasę w Jest: każdy `tapOn` po id w .maestro/zrzuty-sklepu/** ma bezpośrednio przed sobą
// `scrollUntilVisible` tego samego id, chyba że id jest na liście DOZWOLONE z uzasadnieniem (stały element albo zmierzone położenie).
// Dlaczego lista, a nie zakaz: pasek kart i nagłówki są zawsze na ekranie, a przewijanie do nich wydłuża sceny bez zysku.
// ============================================================================

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- jak tests/asc-zrzuty.test.ts (js-yaml z drzewa zależności)
const yaml = require('js-yaml') as { loadAll: (t: string) => unknown[] };

const scenyDir = join(__dirname, '..', '.maestro', 'zrzuty-sklepu');
const pliki = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pliki(join(d, e.name)) : e.name.endsWith('.yaml') ? [join(d, e.name)] : []));

/**
 * id, w które wolno stuknąć bez przewinięcia. Położenia (pt, y od–do) z maestro.log przebiegu #3 (artefakty
 * zrzuty-dzienniki-iphone-6.3-1 / -6.9-1, „Tapping on element … bounds”); ekran 6,3″ = 874 pt, 6,9″ = 956 pt,
 * pasek kart od ok. 783 / 865 pt. Nowe id na tej liście wymaga takiego pomiaru na mniejszym rozmiarze (6,3″).
 */
export const DOZWOLONE: Record<string, string> = {
  'tab-zakwasy': 'pasek kart, stały element (6,3″: y 791–840)',
  'tab-receptury': 'pasek kart, stały element (6,3″: y 791–840)',
  'tab-dziennik': 'pasek kart, stały element (6,3″: y 791–840)',
  'recipe-row-country_loaf_72': 'pierwszy wiersz listy receptur (6,3″: y 283–367)',
  'start-bake-btn': 'ekran receptury po wejściu, nad paskiem (6,3″: y 644–708)',
  'bake-plan-btn': 'nagłówek ekranu (6,3″: y 66–110)',
  'next-or-finish-step-btn': 'stopka prowadzenia (6,3″: y 706–770)',
  'finish-rating-star-4': 'górna część arkusza oceny (6,3″: y 236–284)',
  'finish-save-btn': 'nagłówek arkusza oceny (6,3″: y 66–110)',
  'zgoda-dalej-btn': 'stuknięcie pod warunkiem `when: visible` (6,3″: y 273–337)',
};

type Komenda = Record<string, unknown>;
const obiekt = (v: unknown): v is Komenda => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Stuknięcia po id bez bezpośrednio poprzedzającego `scrollUntilVisible` tego id (także w `commands` zagnieżdżonych komend). */
export function tapyBezPrzewiniecia(tekst: string): string[] {
  const docs = yaml.loadAll(tekst);
  const kroki = Array.isArray(docs[1]) ? (docs[1] as unknown[]) : [];
  const wynik: string[] = [];
  const lista = (l: unknown[]) =>
    l.forEach((c, i) => {
      if (!obiekt(c)) return;
      const tap = c.tapOn;
      if (obiekt(tap) && typeof tap.id === 'string') {
        const p = l[i - 1];
        const sv = obiekt(p) && obiekt(p.scrollUntilVisible) ? p.scrollUntilVisible : null;
        const el = sv && obiekt(sv.element) ? sv.element : null;
        if (!(el && el.id === tap.id)) wynik.push(tap.id);
      }
      for (const v of Object.values(c)) if (obiekt(v) && Array.isArray(v.commands)) lista(v.commands);
    });
  lista(kroki);
  return wynik;
}

describe('sceny zrzutów sklepu: tapOn po id poprzedza scrollUntilVisible (KO-047, D-379)', () => {
  const sceny = pliki(scenyDir).map((p) => [relative(scenyDir, p), readFileSync(p, 'utf8')] as const);

  it.each(sceny)('%s: każde stuknięcie po id spoza listy DOZWOLONE ma przed sobą przewinięcie do tego id', (_n, tekst) => {
    expect(tapyBezPrzewiniecia(tekst).filter((id) => !(id in DOZWOLONE))).toEqual([]);
  });

  it('lista DOZWOLONE nie ma martwych wpisów: każde id jest stukane bez przewinięcia w którejś scenie', () => {
    const uzyte = new Set(sceny.flatMap(([, t]) => tapyBezPrzewiniecia(t)));
    expect(Object.keys(DOZWOLONE).filter((id) => !uzyte.has(id))).toEqual([]);
  });

  // Stan sprzed D-378 (04-doktor.yaml @ b27fcd3e, kroki bez komentarzy): kontrola musi go odrzucić.
  it('łapie scenę 04 sprzed D-378 (stuknięcie w „Doktor Chleba” bez przewinięcia)', () => {
    const przed = [
      'appId: com.apps4brew.baker',
      '---',
      '- runFlow: sub/start.yaml',
      '- tapOn:',
      '    id: "tab-dziennik"',
      '- tapOn:',
      '    id: "dziennik-doktor-btn"',
      '- scrollUntilVisible:',
      '    element:',
      '      id: "objaw-crumbHasHugeTopHolesWithDenseBottom"',
      '- tapOn:',
      '    id: "objaw-crumbHasHugeTopHolesWithDenseBottom"',
      '',
    ].join('\n');
    expect(tapyBezPrzewiniecia(przed).filter((id) => !(id in DOZWOLONE))).toEqual(['dziennik-doktor-btn']);
  });

  it('przewinięcie do innego id albo z odstępem nie liczy się; stuknięcie w zagnieżdżonym runFlow też jest sprawdzane', () => {
    const t = [
      'appId: x', '---',
      '- scrollUntilVisible:', '    element:', '      id: "a"', '- tapOn:', '    id: "b"',
      '- scrollUntilVisible:', '    element:', '      id: "c"', '- waitForAnimationToEnd', '- tapOn:', '    id: "c"',
      '- runFlow:', '    when:', '      visible:', '        id: "d"', '    commands:', '      - tapOn:', '          id: "d"',
      '- scrollUntilVisible:', '    element:', '      id: "e"', '- tapOn:', '    id: "e"', '',
    ].join('\n');
    expect(tapyBezPrzewiniecia(t)).toEqual(['b', 'c', 'd']);
  });
});
