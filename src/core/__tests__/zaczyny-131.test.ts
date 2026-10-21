/**
 * Liczby z PREFERMENT_DEFINITIONS pokazane użytkownikowi (wskazówka zaczynu w arkuszu Składniki i w kalkulatorze,
 * gramy w „Do miski”) mają twierdzenie w rejestrze roli 06 albo nie są pokazywane; teksty równe docs/tresci/pl|en/zaczyny.md;
 * bez twierdzeń zdrowotnych (wzór lesson-no-health-claims + indeks glikemiczny)
 * [M1-audytor-generalny-131; 01-odkrywanie-502, 06-tresci-503].
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { PREFERMENT_DEFINITIONS, calculatePrefermentBreakdown, type PrefermentType } from '../preferments';
import { ZACZYNY_W_MENU } from '../../components/receptury/nazwy-receptur';
import { setLang, t } from '../../lib/i18n';
import { formatTextUnits } from '../../lib/unit-converter';
import { linie } from './helpers/tresci';

const ROOT = join(__dirname, '..', '..', '..');
type Wpis = { id: string; status: string; twierdzenie: string; wartosc?: number };
const rejestr: Wpis[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));
const wg = (id: string) => rejestr.find((x) => x.id === id);

const POLA_TEKSTU = ['namePl', 'fermentationTimeHours', 'flavorProfilePl'] as const;
const POKAZANE = ZACZYNY_W_MENU.filter((x) => x !== 'direct');
const PLIK_PL = readFileSync(join(ROOT, 'docs/tresci/pl/zaczyny.md'), 'utf8').replace(/\r\n/g, '\n');
const SEKCJE = [...PLIK_PL.matchAll(/^## PREFERMENT_DEFINITIONS\.(\w+)\.(\w+)$/gm)].map((m) => [m[1], m[2]] as [PrefermentType, string]);

const znaczniki = (typ: string, pole: string) => {
  const s = PLIK_PL.split(/^## /m).find((c) => c.startsWith(`PREFERMENT_DEFINITIONS.${typ}.${pole}\n`));
  return s ? [...s.matchAll(/\[T:([^\]]+)\]/g)].flatMap((m) => m[1].split(',')) : [];
};
const tekst = (typ: PrefermentType, pole: string) => (PREFERMENT_DEFINITIONS[typ] as unknown as Record<string, string>)[pole];

/** Parametry obliczeń pokazywane jako gramy (Do miski, akordeon): wartość ≠ 0 → twierdzenie z tą liczbą. */
const PARAMETRY: [PrefermentType, 'defaultHydration' | 'yeastPctOfPrefermentFlour' | 'saltPctOfPrefermentFlour', string, string, number][] = [
  ['poolish', 'defaultHydration', 'ZAC-POO-001', 'hydratacji 100%', 100],
  ['poolish', 'yeastPctOfPrefermentFlour', 'ZAC-POO-002', '0,10% drożdży', 0.1],
  ['biga', 'defaultHydration', 'ZAC-BIG-001', 'hydratacji 50%', 50],
  ['biga', 'yeastPctOfPrefermentFlour', 'ZAC-BIG-001', '1% drożdży', 1],
  // Wybór właściciela 2026-10-21: przykład BBGA zamiast wartości bez źródła (ZAC-PAT-900 wycofane)
  ['pate_fermentee', 'defaultHydration', 'ZAC-PAT-002', '75% wody', 75],
  ['pate_fermentee', 'yeastPctOfPrefermentFlour', 'ZAC-PAT-002', '1% drożdży', 1],
  ['pate_fermentee', 'saltPctOfPrefermentFlour', 'ZAC-PAT-002', '2% soli', 2],
];
const OTWARTE: [PrefermentType, string][] = [];

const HEALTH_PL = /lekkostrawn|ciężkoś|trawien|wzdęci|żołąd|glikem/i;
const HEALTH_EN = /digestib|digestab|predigest|bloat|stomach|\bgut\b|glycaem|glycem/i;
const allStrings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allStrings) : v && typeof v === 'object' ? Object.values(v).flatMap(allStrings) : [];

describe('131: liczby zaczynów pokazane użytkownikowi mają twierdzenie (docs/tresci/zaczyny.md)', () => {
  afterEach(() => setLang('pl'));

  // Akordeon kalkulatora usunięty jako nieosiągalny z app/ (M1-audytor-generalny-149, 7d9a9e8): jedyne menu zaczynów
  // to arkusz Składniki; żaden inny plik produkcyjny nie buduje własnej listy typów zaczynu.
  it('menu zaczynów w arkuszu Składniki = ZACZYNY_W_MENU (tangzhong i yudane nie są pokazywane)', () => {
    const src = readFileSync(join(ROOT, 'src/components/receptury/SkladnikiSheet.tsx'), 'utf8');
    expect(src).toContain('ZACZYNY_W_MENU.map(nazwaZaczynu)');
    expect(src).toContain('onPrefermentTypeChange(ZACZYNY_W_MENU[i])');
    const inneListy: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) { if (f !== '__tests__') walk(p); continue; }
        if (/\.tsx?$/.test(f) && /\] as PrefermentType\[\]/.test(readFileSync(p, 'utf8'))) inneListy.push(p);
      }
    };
    walk(join(ROOT, 'src'));
    walk(join(ROOT, 'app'));
    expect(inneListy).toEqual([]);
    expect(ZACZYNY_W_MENU).not.toContain('tangzhong');
    expect(ZACZYNY_W_MENU).not.toContain('yudane');
  });

  it.each(POKAZANE.flatMap((typ) => POLA_TEKSTU.map((pole) => [typ, pole] as const)))(
    '%s.%s: tekst z liczbą = zdanie z docs/tresci/pl z potwierdzonym twierdzeniem',
    (typ, pole) => {
      const v = tekst(typ, pole);
      if (!/\d/.test(v)) return;
      expect(linie('pl/zaczyny.md', `PREFERMENT_DEFINITIONS.${typ}.${pole}`).join(' ')).toBe(v);
      const ids = znaczniki(typ, pole);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        expect(id).not.toBe('-');
        expect(wg(id)?.status).toBe('potwierdzone');
      }
    },
  );

  it.each(SEKCJE)('%s.%s: sekcja docs/tresci = tekst w kodzie, PL i EN', (typ, pole) => {
    const v = tekst(typ, pole);
    expect(v).toBe(linie('pl/zaczyny.md', `PREFERMENT_DEFINITIONS.${typ}.${pole}`).join(' '));
    setLang('en');
    expect(t(v)).toBe(linie('en/zaczyny.md', `PREFERMENT_DEFINITIONS.${typ}.${pole}`).join(' '));
  });

  it.each(PARAMETRY)('%s.%s: wartość z twierdzenia %s („%s”)', (typ, pole, id, fraza, wartosc) => {
    const w = wg(id);
    expect(w?.status).toBe('potwierdzone');
    expect(w?.twierdzenie).toContain(fraza);
    expect(PREFERMENT_DEFINITIONS[typ][pole]).toBe(wartosc);
  });

  it('każdy niezerowy parametr obliczeń zaczynów z menu ma twierdzenie (ZAC-PAT-900 wycofane)', () => {
    const POLA_LICZB = ['defaultHydration', 'yeastPctOfPrefermentFlour', 'saltPctOfPrefermentFlour'] as const;
    const znane = new Set([...PARAMETRY.map(([a, b]) => `${a}.${b}`), ...OTWARTE.map(([a, b]) => `${a}.${b}`), 'levain.defaultHydration']);
    const nieopisane = POKAZANE.flatMap((typ) => POLA_LICZB.filter((p) => PREFERMENT_DEFINITIONS[typ][p] !== 0).map((p) => `${typ}.${p}`)).filter((k) => !znane.has(k));
    expect(nieopisane).toEqual([]);
    expect(wg('ZAC-PAT-900')?.status).toBe('wycofane');
  });

  it('levain: hydratacja zaczynu z ustawienia zakwasu, nie stałe 100% (defaultHydration nie jest pokazywane)', () => {
    const b = calculatePrefermentBreakdown({ prefermentType: 'levain', prefermentFlourPercentage: 20, totalFlourGrams: 500, totalTargetHydration: 70, saltPercentage: 2, customPrefermentHydration: 80 });
    expect(b.prefermentHydration).toBe(80);
    const hook = readFileSync(join(ROOT, 'src/hooks/useRecipeCalculations.ts'), 'utf8');
    expect(hook).toMatch(/customPrefermentHydration: prefermentType === 'levain' \? starterHydration : undefined/);
  });

  it('defaultPrefermentFlourPct nie jest używane poza src/core/preferments.ts', () => {
    const pliki = (d: string): string[] =>
      readdirSync(d).flatMap((f) => {
        const p = join(d, f);
        if (statSync(p).isDirectory()) return f === 'node_modules' || f === '__tests__' ? [] : pliki(p);
        return /\.(ts|tsx)$/.test(f) ? [p] : [];
      });
    const uzycia = [...pliki(join(ROOT, 'src')), ...pliki(join(ROOT, 'app'))]
      .filter((p) => !p.endsWith(join('core', 'preferments.ts')))
      .filter((p) => readFileSync(p, 'utf8').includes('defaultPrefermentFlourPct'));
    expect(uzycia).toEqual([]);
  });

  it('biga: tekst tylko w °C, w trybie imperialnym przeliczony na 60 °F jak w źródle (ZAC-BIG-001)', () => {
    const v = PREFERMENT_DEFINITIONS.biga.fermentationTimeHours;
    expect(v).not.toMatch(/°F/);
    expect(formatTextUnits(v, 'imperial')).toMatch(/60\s?°F/);
  });

  it('PL: brak twierdzeń zdrowotnych w PREFERMENT_DEFINITIONS', () => {
    expect(allStrings(PREFERMENT_DEFINITIONS).filter((s) => HEALTH_PL.test(s))).toEqual([]);
  });

  it('EN: brak twierdzeń zdrowotnych w przekładzie PREFERMENT_DEFINITIONS', () => {
    setLang('en');
    expect(allStrings(PREFERMENT_DEFINITIONS).map((s) => t(s)).filter((s) => HEALTH_EN.test(s))).toEqual([]);
  });
});
