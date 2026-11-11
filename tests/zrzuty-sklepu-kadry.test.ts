// ============================================================================
// Piekarz — kadry scen zrzutów sklepu (KO-048 P2 c; rozszerzenie straży D-379 o kadry).
// Przegląd zrzutów #4 (run 43085791241, `koordynacja:docs/koordynacja/przeglad-zrzuty4-pl.md`):
// 01 na 6,3″ bez karty „Ochrona snu aktywna” (a na 6,9″ sam nagłówek, treść pod paskiem przycisków),
// 02 na 6,3″ jeden pełny składnik. Kontrola: scena kończy się kadrem, który pokazuje element z nagłówka ramki.
// Ramka 05 (pas ze spiralą wypchnięty przez centerElement na „Gotowy do ciasta.”) czeka na decyzję: kadr z D-372 (KO-043)
// pilnuje tests/zrzuty-sklepu-workflow.test.ts.
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
});
