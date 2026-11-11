// ============================================================================
// Piekarz — kadry scen zrzutów sklepu (KO-048 P2 c; rozszerzenie straży D-379 o kadry).
// Przegląd zrzutów #4 (run 43085791241, `koordynacja:docs/koordynacja/przeglad-zrzuty4-pl.md`):
// 01 na 6,3″ bez karty „Ochrona snu aktywna” (a na 6,9″ sam nagłówek, treść pod paskiem przycisków),
// 02 na 6,3″ jeden pełny składnik. Kontrola: scena kończy się kadrem, który pokazuje element z nagłówka ramki.
// 05: centerElement na „Gotowy do ciasta.” wypychał pas ze spiralą z kadru — KO-052 (D-382): przewinięcie najmniejsze,
// „Gotowy do ciasta.” nadal w kadrze (KO-043; kształt kroków pilnuje też tests/zrzuty-sklepu-workflow.test.ts).
// Granica: Maestro liczy widoczność względem ekranu, nie pasków aplikacji — kadr potwierdza dopiero przebieg zrzutów.
// ============================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- jak tests/zrzuty-sklepu-przewijanie.test.ts
const yaml = require('js-yaml') as { loadAll: (t: string) => unknown[] };

type Komenda = Record<string, unknown>;
const obiekt = (v: unknown): v is Komenda => typeof v === 'object' && v !== null && !Array.isArray(v);
const kroki = (scena: string): Komenda[] => {
  const docs = yaml.loadAll(readFileSync(join(__dirname, '..', '.maestro', 'zrzuty-sklepu', `${scena}.yaml`), 'utf8'));
  return (Array.isArray(docs[1]) ? docs[1] : []).filter(obiekt);
};
const przewiniecie = (k: Komenda | undefined): Komenda | null =>
  k && obiekt(k.scrollUntilVisible) ? k.scrollUntilVisible : null;
const idElementu = (sv: Komenda | null): unknown => (sv && obiekt(sv.element) ? sv.element.id : undefined);

describe('kadry scen zrzutów sklepu (KO-048 P2 c)', () => {
  it.each([
    ['01-plan', 'sleep-guard-banner', 'treść karty „Ochrona snu aktywna” na środku ekranu, nad paskiem przycisków'],
    ['02-receptura', 'scale-item-water', 'wiersz „Woda” na środku: nad nim pełne wiersze mąki, pod nim kolejne składniki'],
  ])('%s kończy się przewinięciem do %s z centerElement (%s)', (scena, id) => {
    const ostatni = przewiniecie(kroki(scena).at(-1));
    expect(idElementu(ostatni)).toBe(id);
    expect(ostatni?.centerElement).toBe(true);
  });

  it('02-receptura sprawdza liczbę bochenków przed przewinięciem (po przewinięciu karta „Ile pieczesz” może wyjść z kadru)', () => {
    const k = kroki('02-receptura');
    const assert = k.findIndex((c) => obiekt(c.assertVisible) && c.assertVisible.id === 'loaves-count-display');
    const scroll = k.findIndex((c) => idElementu(przewiniecie(c)) === 'scale-item-water');
    expect(assert).toBeGreaterThan(-1);
    expect(assert).toBeLessThan(scroll);
  });

  it('05-zakwasy: najmniejsze przewinięcie do „Gotowy do ciasta.” (bez centerElement), pas zakwasu przed nim, „Gotowy do ciasta.” widoczny na końcu (KO-052)', () => {
    const k = kroki('05-zakwasy');
    const przewiniecia = k.map(przewiniecie).filter((x): x is Komenda => x !== null);
    expect(przewiniecia.map(idElementu)).toEqual(['zakwas-gotowy']);
    expect(przewiniecia[0].centerElement).toBeUndefined();
    const ostatni = k.at(-1);
    expect(obiekt(ostatni?.assertVisible) && ostatni.assertVisible.id).toBe('zakwas-gotowy');
  });

  it('07-offline: „Dziś” z trwającym wypiekiem, nie pusty stan; bez wypieku z 03 (wybór sceny 07) scena sama go zaczyna (KO-051)', () => {
    const k = kroki('07-offline');
    const tekst = JSON.stringify(k);
    expect(tekst).not.toContain('start-zakladam-zakwas');
    const warunek = k.find((c) => obiekt(c.runFlow) && obiekt(c.runFlow.when) && obiekt(c.runFlow.when.notVisible));
    expect(warunek && obiekt(warunek.runFlow) && obiekt(warunek.runFlow.when) && obiekt(warunek.runFlow.when.notVisible)
      ? warunek.runFlow.when.notVisible.id : undefined).toBe('start-trwa-wypiek');
    expect(JSON.stringify(warunek)).toContain('plan-start-bake-btn');
    const ostatni = k.at(-1);
    expect(obiekt(ostatni?.extendedWaitUntil) && obiekt(ostatni.extendedWaitUntil.visible) && ostatni.extendedWaitUntil.visible.id)
      .toBe('start-trwa-wypiek');
  });

  // KO-050 (D-384): ramka 03 pokazuje krok prowadzenia z czasem, nie ekran blokady — nagłówek PL nie obiecuje „gdy telefon śpi”,
  // mówi o kroku; rdzeń „powiadomieni” (KO-039, D-367) zostaje. Inne języki: otwarte dla roli 09.
  it('ramka 03 (pl): nagłówek zgodny z ekranem prowadzenia, ten sam we wszystkich źródłach podpisów (KO-050)', () => {
    const czytaj = (p: string) => readFileSync(join(__dirname, '..', p), 'utf8');
    const meta = JSON.parse(czytaj('docs/wydanie/metadane/pl.json')) as { ramki: Array<{ naglowek: string }> };
    const n = meta.ramki[2].naglowek;
    expect(n).not.toMatch(/śpi/);
    expect(n).toMatch(/^Krok po kroku/);
    for (const plik of ['docs/wydanie/zrzuty/pl/podpisy.json', 'docs/wydanie/ustawienia/pl.md', 'docs/app-store-metadata-v2.md']) {
      expect([plik, czytaj(plik).includes('Powiadomienie, gdy telefon śpi')]).toEqual([plik, false]);
      expect([plik, czytaj(plik).includes(n)]).toEqual([plik, true]);
    }
  });
});
