/**
 * 46 tekstów 1.0 z listy 229 bez klucza w żadnym słowniku (reaudit 09, pętla 1): każdy ma klucz EN (i przekład
 * albo wpis „czeka na przekład”) albo wpis „niewidoczny” z powodem w docs/lokalizacja/niewidoczne-teksty.json
 * [M1-audytor-generalny-147; 09-lokalizacja-505].
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { EN } from '../i18n.en';
import { setLang, t } from '../i18n';
import { LEGACY_STEPS_V1 } from '../../core/legacy-steps-v1';

const ROOT = join(__dirname, '..', '..', '..');
const czytaj = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const REJESTR = 'docs/lokalizacja/niewidoczne-teksty.json';
const rejestr = (existsSync(join(ROOT, REJESTR)) ? JSON.parse(czytaj(REJESTR)) : { teksty: [] }) as { teksty: { tekst: string; plik: string; powod: string }[] };

/** Widoczne: kroki starego zapisu sesji (Stolnica, t()) i błąd kopii przed importem (Alert importu). */
const WIDOCZNE = [...LEGACY_STEPS_V1.flatMap((s) => [s.name, s.instructions]), 'Brak katalogu dokumentów aplikacji'];
/** Z listy 46 (początki tekstów jak w liście reaudytu), wszystkie poza widocznymi powyżej. */
const NIEWIDOCZNE = [
  'Masa ciasta musi być większa od zera', 'Strata piecowa musi mieścić się w przedziale 1% - 49%',
  'Docelowa waga upieczonego chleba musi być większa od zera', 'Docelowa waga ciasta musi być większa od zera',
  'Suma procentów mąk musi wynosić 100% (aktualnie: ', 'Czas bazowy i temperatura muszą być większe od zera',
  'Masa drożdży nie może być ujemna', 'Waga mąki musi być większa od zera', 'Liczba bochenków i gramatura muszą być większe od zera',
  'Całkowita masa mąki musi być większa od 0', 'Udział mąki w zaczynie musi mieścić się w przedziale 0–100%',
  'Parametry dokarmiania muszą być większe od zera', 'niskowyciągowa', 'wysokowyciągowa',
  'Typ 500 / 550 (Poznańska / Luksusowa)', 'Typ 650 (Bułkowa)', 'Typ 2000 (Razowa pełnoziarnista)',
  'Zakwas żytni (Bolesław)', 'Żytnia typ 2000', 'Plik kopii musi być obiektem JSON', 'Nieprawidłowa wersja schematu kopii',
  'Kopia pochodzi z nowszej wersji aplikacji (v', 'Nieprawidłowa struktura wypieków ("bakes" musi być tablicą)',
  'Nieprawidłowa struktura zakwasów ("starters" musi być tablicą)', 'Nieprawidłowa struktura przepisów ("customRecipes" musi być tablicą)',
  '{n} zakwasów', '{n} wpisów w Dzienniku',
];

describe('teksty 1.0 bez klucza (147)', () => {
  afterEach(() => setLang('pl'));

  it('zakres: 8 kroków starego zapisu (nazwa i opis), błąd kopii, porada żytnia z kluczem (134), 27 tekstów niewidocznych', () => {
    expect(WIDOCZNE).toHaveLength(17);
    expect(NIEWIDOCZNE).toHaveLength(27);
    expect(EN['Wysoki udział żyta — ciasto będzie kleiste, unikaj agresywnego wyrabiania.']).toBeDefined();
  });

  it('widoczne teksty mają klucz EN i w języku angielskim nie są po polsku', () => {
    setLang('en');
    const brak = WIDOCZNE.filter((x) => !EN[x] || t(x) === x);
    expect(brak).toEqual([]);
  });

  it('widoczne teksty bez przekładu 33 języków są na liście „czeka na przekład”', () => {
    const czeka = new Set((JSON.parse(czytaj('docs/lokalizacja/czeka-na-przeklad.json')).klucze as { klucz: string }[]).map((k) => k.klucz));
    const dir = 'src/lib/i18n-slowniki/de';
    const de = readdirSync(join(ROOT, dir)).map((f) => czytaj(`${dir}/${f}`)).join('\n');
    const brak = WIDOCZNE.filter((x) => !de.includes(`'${x.replace(/'/g, "\\'")}':`) && !czeka.has(x));
    expect(brak).toEqual([]);
  });

  it('niewidoczne mają wpis z plikiem i powodem w rejestrze', () => {
    const wpisy = new Map(rejestr.teksty.map((w) => [w.tekst, w]));
    const brak = NIEWIDOCZNE.filter((x) => !wpisy.get(x)?.powod?.trim() || !wpisy.get(x)?.plik);
    expect(brak).toEqual([]);
    for (const w of rejestr.teksty) {
      const zrodlo = czytaj(w.plik);
      if (/nie ma już w kodzie/.test(w.powod)) expect(zrodlo).not.toContain(w.tekst);
      else expect(zrodlo).toContain(w.tekst.replace(/\\"/g, '"'));
    }
  });

  it('Alert importu tłumaczy komunikat błędu kopii przez t()', () => {
    expect(czytaj('src/components/settings/ImportZPlikuArkusz.tsx')).toMatch(/err instanceof Error \? t\(err\.message\)/);
  });
});
