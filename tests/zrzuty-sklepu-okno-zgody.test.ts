// ============================================================================
// Piekarz — straż scen zrzutów sklepu po przebiegu #8 (run 43238947035; docs/dowody-07-zrzuty8/diagnoza.md, D-394).
// A) Okno zgody iOS na powiadomienia ma przyciski w języku systemu, a clearState kasuje decyzję (część 8: pl zezwoliło,
//    pt-BR po clearState dostało okno ponownie). sub/okno-systemu.yaml musi więc stuknąć „zezwól” w KAŻDEJ lokalizacji
//    z docs/wydanie/metadane i nigdy „nie zezwalaj”. Wzorzec jest zakotwiczony (^…$), bo „Permitir” zawiera się w „Não Permitir”:
//    wynik nie zależy od tego, czy Maestro dopasowuje cały tekst, czy fragment.
// B) Maestro liczy widoczność bez zasłonięcia: po scrollUntilVisible środek „Podwoił objętość” leżał w pasie kart
//    (6,9″ de-DE y 885–933, pasek od 873) i stuknięcie trafiło w kartę „Zakwasy” (7 lokalizacji; klasa D-391).
//    Każdy tapOn po id poprzedzony przewinięciem ma przed sobą przewinięcie z centerElement (przenosi element nad pasek),
//    chyba że id jest na liście BEZ_SRODKA z uzasadnieniem.
// ============================================================================

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- jak tests/zrzuty-sklepu-przewijanie.test.ts
const yaml = require('js-yaml') as { loadAll: (t: string) => unknown[] };

const korzen = join(__dirname, '..');
const scenyDir = join(korzen, '.maestro', 'zrzuty-sklepu');
const pliki = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pliki(join(d, e.name)) : e.name.endsWith('.yaml') ? [join(d, e.name)] : []));

type Komenda = Record<string, unknown>;
const obiekt = (v: unknown): v is Komenda => typeof v === 'object' && v !== null && !Array.isArray(v);

interface Przyciski { zezwol: string; odmow: string; zrodlo: string }
const dane = JSON.parse(readFileSync(join(korzen, 'tests', 'dane', 'okno-zgody-ios.json'), 'utf8')) as { przyciski: Record<string, Przyciski> };
const lokalizacje = readdirSync(join(korzen, 'docs', 'wydanie', 'metadane')).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

/** Wszystkie wartości `text` w okno-systemu.yaml (warunek, czekanie, stuknięcie). */
export function wzorceOkna(tekst: string): string[] {
  const wynik: string[] = [];
  const szukaj = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(szukaj);
    else if (obiekt(v)) for (const [k, w] of Object.entries(v)) (k === 'text' && typeof w === 'string' ? wynik.push(w) : szukaj(w));
  };
  szukaj(yaml.loadAll(tekst));
  return wynik;
}

/** Czy wzorzec trafia w etykietę przy obu semantykach (cały tekst albo fragment); bez rozróżniania wielkości liter jak Maestro 2.11 (Filters.textMatches, IGNORE_CASE). */
const trafia = (wzorzec: string, etykieta: string): boolean =>
  new RegExp(`^(?:${wzorzec})$`, 'iu').test(etykieta) || new RegExp(wzorzec, 'iu').test(etykieta);

/** id stukane po przewinięciu, którego przewinięcie bezpośrednio przed tapOn nie ma centerElement: true. */
export function tapyBezSrodka(tekst: string): string[] {
  const docs = yaml.loadAll(tekst);
  const kroki = Array.isArray(docs[1]) ? (docs[1] as unknown[]) : [];
  const wynik: string[] = [];
  const lista = (l: unknown[]) =>
    l.forEach((c, i) => {
      if (!obiekt(c)) return;
      const tap = c.tapOn;
      const p = l[i - 1];
      const sv = obiekt(p) && obiekt(p.scrollUntilVisible) ? p.scrollUntilVisible : null;
      if (obiekt(tap) && typeof tap.id === 'string' && sv && obiekt(sv.element) && sv.element.id === tap.id && sv.centerElement !== true) wynik.push(tap.id);
      for (const v of Object.values(c)) if (obiekt(v) && Array.isArray(v.commands)) lista(v.commands);
    });
  lista(kroki);
  return wynik;
}

/**
 * id, które wolno stuknąć po przewinięciu bez wyśrodkowania. Pasek kart zasłania tylko ekrany zakładek; plan i receptura
 * go ukrywają (app/(tabs)/_layout.tsx, BEZ_PASKA), prowadzenie i Doktor otwierają się nad zakładkami (app/_layout.tsx).
 * centerElement na elemencie, którego nie da się wyśrodkować (stopka, koniec listy), to 5 prób po ~4–5 s (D-377).
 */
export const BEZ_SRODKA: Record<string, string> = {
  'dziennik-doktor-btn': 'ostatni element treści Dziennika: `scroll` do końca kładzie go nad paskiem (D-391, 04-doktor.yaml)',
  'plan-start-bake-btn': 'stopka planu (PasekStartu) na ekranie bez paska kart (BEZ_PASKA: harmonogram); wyśrodkować się nie da',
  'plan-krok-ostatni': 'lista kroków w prowadzeniu, nad zakładkami, bez paska kart',
  'objaw-crumbHasHugeTopHolesWithDenseBottom': 'Doktor Chleba nad zakładkami, bez paska kart; ramka 04 bez centerElement (KO-046, D-377)',
};

/** Przewinięcia z centerElement przed tapOn (także w `commands` zagnieżdżonych komend), z limitem krótszym niż 30 s (5 prób wyśrodkowania, D-377). */
export function srodkowaniaZKrotkimLimitem(tekst: string): string[] {
  const docs = yaml.loadAll(tekst);
  const kroki = Array.isArray(docs[1]) ? (docs[1] as unknown[]) : [];
  const wynik: string[] = [];
  const lista = (l: unknown[]) =>
    l.forEach((c, i) => {
      if (!obiekt(c)) return;
      const n = l[i + 1];
      const sv = c.scrollUntilVisible;
      if (obiekt(sv) && obiekt(n) && obiekt(n.tapOn) && sv.centerElement === true && !(typeof sv.timeout === 'number' && sv.timeout >= 30000))
        wynik.push(String(obiekt(sv.element) ? sv.element.id : undefined));
      for (const v of Object.values(c)) if (obiekt(v) && Array.isArray(v.commands)) lista(v.commands);
    });
  lista(kroki);
  return wynik;
}

describe('sceny zrzutów sklepu po przebiegu #8 (D-394)', () => {
  const okno = readFileSync(join(scenyDir, 'sub', 'okno-systemu.yaml'), 'utf8');
  const wzorce = wzorceOkna(okno);

  it('okno-systemu.yaml ma jeden wzorzec w każdym kroku (czekanie, warunek, stuknięcie)', () => {
    expect(wzorce.length).toBe(3);
    expect(new Set(wzorce).size).toBe(1);
  });

  it('każda lokalizacja z docs/wydanie/metadane ma wpis przycisków okna zgody', () => {
    expect(lokalizacje.length).toBe(34);
    expect(lokalizacje.filter((k) => !dane.przyciski[k])).toEqual([]);
  });

  it.each(lokalizacje)('%s: wzorzec stuka „zezwól” i nigdy „nie zezwalaj”', (kod) => {
    const p = dane.przyciski[kod];
    expect({ kod, zezwol: trafia(wzorce[0], p.zezwol), odmow: trafia(wzorce[0], p.odmow) }).toEqual({ kod, zezwol: true, odmow: false });
  });

  it('etykiety z przebiegu #8 są w danych (12 lokalizacji z hierarchii okna i pl ze stuknięcia)', () => {
    const z8 = Object.entries(dane.przyciski).filter(([, p]) => p.zrodlo.startsWith('przebieg 43238947035')).map(([k]) => k);
    expect(z8.sort()).toEqual(['cs', 'da', 'es-ES', 'es-MX', 'fi', 'id', 'it', 'ja', 'ko', 'no', 'pl', 'pt-BR', 'zh-Hant']);
  });

  // Przebieg #9 (run 43284925139, docs/dowody-07-zrzuty-hr/diagnoza.md): hr padło na „Dopusti” z pamięci modelu
  // (iOS: „Dozvoli” / „Nemoj dozvoliti”); 16 etykiet „zezwól” potwierdziło stuknięcie wzorcem (D-400).
  it('etykiety z przebiegu #9 są w danych (hr z hierarchii okna, 16 lokalizacji ze stuknięcia)', () => {
    const z9 = Object.entries(dane.przyciski).filter(([, p]) => p.zrodlo.startsWith('przebieg 43284925139')).map(([k]) => k);
    expect(z9.sort()).toEqual(['de-DE', 'el', 'fr-FR', 'hr', 'hu', 'ms', 'nl-NL', 'pt-PT', 'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'vi']);
    expect(dane.przyciski.hr).toMatchObject({ zezwol: 'Dozvoli', odmow: 'Nemoj dozvoliti' });
  });

  // Trwała kontrola (D-400): wpis z pamięci modelu wolno dodać tylko jawnie, przez tę listę; każdy inny ma źródło z przebiegu.
  it('wpisy niezweryfikowane to tylko jawna lista (reszta ze źródłem z przebiegu)', () => {
    const niezw = Object.entries(dane.przyciski).filter(([, p]) => !/^przebieg \d+/.test(p.zrodlo)).map(([k]) => k);
    expect(niezw.sort()).toEqual(['en-AU', 'en-CA', 'en-GB', 'en-US', 'fr-CA']);
  });

  const sceny = pliki(scenyDir).map((p) => [relative(scenyDir, p), readFileSync(p, 'utf8')] as const);

  it.each(sceny)('%s: stuknięcie po przewinięciu poprzedza przewinięcie z centerElement (poza BEZ_SRODKA)', (_n, tekst) => {
    expect(tapyBezSrodka(tekst).filter((id) => !(id in BEZ_SRODKA))).toEqual([]);
  });

  it.each(sceny)('%s: wyśrodkowanie przed stuknięciem ma limit co najmniej 30 s (D-377)', (_n, tekst) => {
    expect(srodkowaniaZKrotkimLimitem(tekst)).toEqual([]);
  });

  it('lista BEZ_SRODKA nie ma martwych wpisów', () => {
    const uzyte = new Set(sceny.flatMap(([, t]) => tapyBezSrodka(t)));
    expect(Object.keys(BEZ_SRODKA).filter((id) => !uzyte.has(id))).toEqual([]);
  });

  // Stan z przebiegu #8 (00-przygotuj-podwojenie.yaml @ 69edd0fb): kontrola musi go odrzucić.
  it('łapie wyśrodkowanie z domyślnym limitem 20 s także w zagnieżdżonych commands', () => {
    const zle = ['appId: com.apps4brew.baker', '---', '- runFlow:', '    when:', '      visible:', '        id: "x"', '    commands:', '      - scrollUntilVisible:', '          element:', '            id: "x"', '          centerElement: true', '      - tapOn:', '          id: "x"'].join('\n');
    expect(srodkowaniaZKrotkimLimitem(zle)).toEqual(['x']);
  });

  it('łapie przewinięcie do „Podwoił objętość” bez wyśrodkowania (przebieg #8)', () => {
    const przed = ['appId: com.apps4brew.baker', '---', '- scrollUntilVisible:', '    element:', '      id: "zakwas-podwoil-btn"', '- tapOn:', '    id: "zakwas-podwoil-btn"'].join('\n');
    expect(tapyBezSrodka(przed)).toEqual(['zakwas-podwoil-btn']);
  });
});
