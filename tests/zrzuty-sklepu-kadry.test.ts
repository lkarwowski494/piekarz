// ============================================================================
// Piekarz — kadry scen zrzutów sklepu (KO-048 P2 c; rozszerzenie straży D-379 o kadry).
// Przegląd zrzutów #4 (run 43085791241, `koordynacja:docs/koordynacja/przeglad-zrzuty4-pl.md`):
// 01 na 6,3″ bez karty „Ochrona snu aktywna” (a na 6,9″ sam nagłówek, treść pod paskiem przycisków),
// 02 na 6,3″ jeden pełny składnik. Kontrola: scena kończy się kadrem, który pokazuje element z nagłówka ramki.
// 05: centerElement na „Gotowy do ciasta.” wypychał pas ze spiralą z kadru (KO-052, D-382), a na 6,3″ pas i „Gotowy do
// ciasta.” nie mieściły się razem (zrzuty #6) — KO-055 (D-393): karta cyklu nad profilem, scena bez przewijania.
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

  // D-393 (KO-055, właściciel: „B: karta wyżej”): karta cyklu nad profilem, więc ramka 05 bez przewijania. Rachunek kadru
  // z surowych zrzutów #6 (run 43176824676, pt od góry ekranu): na 6,9″ pas 0–436, góra spirali 182; karta cyklu od góry
  // do dołu „Gotowy do ciasta.” 169 pt na obu rozmiarach (6,3″: 227–396, 6,9″: 742–911); odstęp między kartami 12 (+ 2 × 1 pt
  // obwódki); pasek kart od 791 (6,3″, 402×874) i 873 (6,9″, 440×956). Pas na 6,3″ nie jest zmierzony — zapas pokazuje,
  // o ile może być wyższy niż na 6,9″, zanim „Gotowy do ciasta.” zejdzie pod pasek kart.
  it('05-zakwasy: bez przewijania; „Gotowy do ciasta.” widoczny na końcu (KO-043, KO-055, D-393)', () => {
    const k = kroki('05-zakwasy');
    expect(k.map(przewiniecie).filter((x) => x !== null)).toEqual([]);
    expect(k.some((c) => 'scroll' in c || 'swipe' in c)).toBe(false);
    const ostatni = k.at(-1);
    expect(obiekt(ostatni?.assertVisible) && ostatni.assertVisible.id).toBe('zakwas-gotowy');
  });

  it.each([['6,3″', 791], ['6,9″', 873]])('05-zakwasy na %s: pas i „Gotowy do ciasta.” mieszczą się nad paskiem kart z zapasem (D-393)', (_r, pasekKart) => {
    const PAS_6_9 = 436, ODSTEP = 12 + 2, KARTA_DO_GOTOWY = 169, ZAPAS_MIN = 100;
    const dolGotowy = PAS_6_9 + ODSTEP + KARTA_DO_GOTOWY;
    expect(pasekKart - dolGotowy).toBeGreaterThanOrEqual(ZAPAS_MIN);
    // Kolejność w kodzie ekranu: karta cyklu (ZakwasDziennik) przed profilem — bez niej rachunek nie obowiązuje
    const ekran = readFileSync(join(__dirname, '..', 'app', '(tabs)', 'zakwasy', 'index.tsx'), 'utf8');
    expect(ekran.indexOf('<ZakwasDziennik')).toBeGreaterThan(-1);
    expect(ekran.indexOf('<ZakwasDziennik')).toBeLessThan(ekran.indexOf('<StarterProfileCard'));
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

  // KO-050 w pozostałych 33 lokalizacjach sklepu (sesja S, rola 09; D-390; 34 z PL — bg, et, lt, lv, sr nie mają lokalizacji App Store): nagłówek 03 = przekład „Krok po kroku, z powiadomieniem”,
  // bez obietnicy snu lub blokady telefonu; te same źródła podpisów co w PL (gdzie lokalizacja je ma). Rdzeń powiadomienia: KO-039.
  const SEN = /sleep|spí|sover|gesperrt|κοιμ|reposo|lukit|veille|spava|alszik|terkunci|standby|スリープ|잠겨|tidur|slaapt|dormindo|repouso|doarme|спит|miruje|låst|uyku|заблок|khóa|休眠/iu;
  const czytajRepo = (p: string) => readFileSync(join(__dirname, '..', p), 'utf8');
  const lokalizacje = (require('node:fs') as typeof import('node:fs')).readdirSync(join(__dirname, '..', 'docs/wydanie/metadane'))
    .filter((f: string) => f.endsWith('.json') && f !== 'pl.json').map((f: string) => f.slice(0, -5));
  it('ramka 03: 33 lokalizacje sklepu poza PL', () => expect(lokalizacje).toHaveLength(33));
  it.each(lokalizacje)('ramka 03 (%s): nagłówek o kroku, bez snu i blokady, ten sam w źródłach podpisów (KO-050, D-390)', (kod) => {
    const n = (JSON.parse(czytajRepo(`docs/wydanie/metadane/${kod}.json`)) as { ramki: Array<{ naglowek: string }> }).ramki[2].naglowek;
    expect({ kod, n, sen: SEN.test(n) }).toEqual({ kod, n, sen: false });
    const zrodla = [`docs/wydanie/ustawienia/${kod}.md`, `docs/wydanie/zrzuty/${kod}/podpisy.json`].concat(kod === 'en-US' ? ['docs/app-store-metadata-v2.md'] : []);
    for (const plik of zrodla) {
      let tekst: string;
      try { tekst = czytajRepo(plik); } catch { continue; } // podpisy.json mają tylko en-US i nl-NL
      expect({ plik, n, jest: tekst.includes(n) }).toEqual({ plik, n, jest: true });
    }
  });
});
