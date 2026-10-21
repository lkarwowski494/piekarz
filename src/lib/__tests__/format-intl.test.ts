/**
 * M1-audytor-generalny-070 (09-lokalizacja-005): liczby, daty i godziny na ekranie przez Intl według
 * języka aplikacji (PL: 1,5 i 25.10.2026, 24 h; EN: 1.5 i format EN). Eksport JSON i CSV bez zmian (kropka).
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { setLang } from '../i18n';
import { appLocale, formatDate, formatFixed, formatNumber, formatTime } from '../format';
import { formatDoseWeight, formatTemperature, formatWeight } from '../unit-converter';
import { buildBackup } from '../backup';
import { exportFlourInventoryCsv } from '../csv-exporter';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { t } from '../i18n';
import { formatRecipeText } from '../recipe-formatter';
import { calculateDoughRecipe, calculateBakeLossMetrics, calculateFermentationAdaptation } from '../../core/domain-rules';
import { validateFlourBlend } from '../../core/flour-atlas';
import { calculateRecipeStarterSubstitution } from '../../core/starter-converter';
import { DoMiski } from '../../components/receptury/DoMiski';
import { AccordionDdtSection } from '../../components/calculator/accordion/AccordionDdtSection';
import { FlourEquivalentsModal } from '../../components/FlourEquivalentsModal';

const D = new Date(2026, 9, 25, 21, 5); // 25.10.2026 21:05 czasu lokalnego

afterEach(() => setLang('pl'));

describe('src/lib/format.ts', () => {
  it('formatNumber: PL przecinek, EN kropka, liczba miejsc z opcji', () => {
    expect(formatNumber(1.5, 'pl')).toBe('1,5');
    expect(formatNumber(1.5, 'en')).toBe('1.5');
    expect(formatNumber(65, 'pl', { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('65,0');
    expect(formatNumber(0.354, 'en', { maximumFractionDigits: 2 })).toBe('0.35');
    expect(formatNumber(1250, 'en')).toBe('1250'); // bez separatora tysięcy, jak na wadze kuchennej
  });

  it('formatFixed: stała liczba miejsc jak toFixed, separator według języka aplikacji', () => {
    setLang('pl');
    expect(formatFixed(65, 1)).toBe('65,0');
    expect(formatFixed(2.25, 2)).toBe('2,25');
    setLang('en');
    expect(formatFixed(65, 1)).toBe('65.0');
  });

  it('formatDate: PL 25.10.2026, EN-GB 25/10/2026, EN-US 10/25/2026', () => {
    expect(formatDate(D, 'pl')).toBe('25.10.2026');
    expect(formatDate(D, 'en-GB')).toBe('25/10/2026');
    expect(formatDate(D, 'en-US')).toBe('10/25/2026');
  });

  it('formatTime: PL 24 h, EN 12 h', () => {
    expect(formatTime(D, 'pl')).toBe('21:05');
    expect(formatTime(D, 'en-US')).toMatch(/^09:05\s?PM$/);
  });

  it('appLocale: język aplikacji z regionem urządzenia, gdy język się zgadza', () => {
    setLang('pl');
    expect(appLocale()).toBe('pl-PL'); // urządzenie w jest.setup.js: pl-PL
    setLang('en');
    expect(appLocale()).toBe('en');
  });
});

describe('miejsca wyświetlania według języka aplikacji', () => {
  it('temperatura i masa: PL 26,5°C i 2,5 g; EN 26.5°C i 2.5 g', () => {
    setLang('pl');
    expect(formatTemperature(26.5, 'metric')).toBe('26,5°C');
    expect(formatDoseWeight(2.5, 'metric')).toBe('2,5 g');
    expect(formatDoseWeight(10, 'imperial')).toBe('0,35 oz');
    expect(formatWeight(500, 'metric')).toBe('500 g');
    setLang('en');
    expect(formatTemperature(26.5, 'metric')).toBe('26.5°C');
    expect(formatDoseWeight(2.5, 'metric')).toBe('2.5 g');
    expect(formatDoseWeight(10, 'imperial')).toBe('0.35 oz');
  });

  // Fasada src/lib/date.ts (martwa, usunięta) dawała to samo co formatDate z językiem aplikacji [M1-audytor-generalny-211]
  it('formatDate z appLocale() formatuje według języka aplikacji', () => {
    setLang('pl');
    expect(formatDate(D, appLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' })).toBe('25.10.2026');
    setLang('en');
    expect(formatDate(D, appLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' })).toBe('10/25/2026');
  });

  it('harmonogram: godzina kolizji ze snem według języka aplikacji', () => {
    // Cel o 03:00: aktywne etapy wypadają w nocy (sen 23:00–06:30), więc są kolizje
    const target = new Date(2026, 9, 26, 3, 0);
    setLang('pl');
    const pl = calculateReverseSchedule(target).sleepCollisions.map((c) => c.time);
    expect(pl.length).toBeGreaterThan(0);
    for (const s of pl) expect(s).toMatch(/^\d{2}:\d{2}$/);
    setLang('en');
    const en = calculateReverseSchedule(target).sleepCollisions.map((c) => c.time);
    expect(en.length).toBe(pl.length);
    for (const s of en) expect(s).toMatch(/^\d{2}:\d{2}\s?[AP]M$/);
  });

  it("w src/ i app/ nie ma 'pl-PL' ani 'en-US' na sztywno (poza testami)", () => {
    const root = join(__dirname, '..', '..', '..');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) {
          if (n !== '__tests__') walk(p);
        } else if (/\.(ts|tsx)$/.test(n) && /'(pl-PL|en-US)'/.test(readFileSync(p, 'utf8'))) hits.push(p.slice(root.length + 1));
      }
    };
    walk(join(root, 'src'));
    walk(join(root, 'app'));
    expect(hits).toEqual([]);
  });
});

// Resztki 070 (partia 4): wartości wstawiane wprost do JSX i parametry t() przez String() [M1-audytor-generalny-070]
describe('resztki: procenty na ekranie, parametry t() i komunikat Q10', () => {
  const textOf = (n: unknown): string => {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (Array.isArray(n)) return n.map(textOf).join('');
    if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
    return '';
  };
  const render = (el: React.ReactElement): string => {
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(el);
    });
    const s = textOf(tree?.toJSON()).replace(/\s+/g, ' ');
    act(() => tree?.unmount());
    return s;
  };
  const calc = calculateDoughRecipe({
    flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    targetDoughWeightGrams: 960,
  });

  it('t(): liczba w parametrze PL z przecinkiem, EN z kropką; całkowita bez zmian', () => {
    setLang('pl');
    expect(t('Mąka: {amount} g', { amount: 2.5 })).toBe('Mąka: 2,5 g');
    expect(t('Mąka: {amount} g', { amount: 1250 })).toBe('Mąka: 1250 g');
    setLang('en');
    expect(t('Mąka: {amount} g', { amount: 2.5 })).toBe('Flour: 2.5 g');
  });

  // „Do miski” ekranu receptury (§11c 106) zamiast dawnej karty DoMiskiScaleCard [M1-audytor-generalny-149]
  it('Do miski: hydratacja 70,9% i sól 2,0% w PL, 70.9% i 2.0% w EN', () => {
    const el = React.createElement(DoMiski, {
      calculations: { ...calc, overallHydrationPercent: 70.91 },
      waterPct: 70,
      starterPct: 20,
      starterHydration: 100,
      saltPct: 2,
      yeastPct: 0,
      calcMode: 'loaves',
      loavesCount: 1,
      onLoavesChange: () => {},
      loafWeightGrams: 960,
      onLoafWeightChange: () => {},
      flourGrams: 500,
      onFlourGramsChange: () => {},
      prefermentType: 'direct',
      prefermentBreakdown: null,
    });
    setLang('pl');
    const pl = render(el);
    expect(pl).toContain('Hydratacja całkowita 70,9%');
    expect(pl).toContain('2,0%');
    expect(pl).not.toMatch(/\d\.\d/);
    setLang('en');
    const en = render(el);
    expect(en).toContain('Total hydration 70.9%');
    expect(en).toContain('2.0%');
  });

  it('chłonność i białko mieszanki: PL 68,4% i ~11,5%, EN 68.4% i ~11.5%', () => {
    const el = React.createElement(AccordionDdtSection, {
      targetDdt: 25,
      onTargetDdtChange: () => {},
      waterTempTarget: 20,
      blendAbsorption: {
        weightedAbsorptionPercent: 68.4,
        recommendedHydrationRange: [66.5, 72.5],
        estimatedProteinPercent: 11.5,
        ryePercentage: 0,
        wholeGrainPercentage: 0,
        doughFeelAdvicePl: 'Idealny balans chłonności i hydratacji dla tej kompozycji mąk.',
      },
    });
    setLang('pl');
    const pl = render(el);
    expect(pl).toContain('68,4%');
    expect(pl).toContain('66,5–72,5%');
    expect(pl).toContain('~11,5%');
    setLang('en');
    const en = render(el);
    expect(en).toContain('68.4%');
    expect(en).toContain('66.5–72.5%');
    expect(en).toContain('~11.5%');
  });

  // Sekcja straty piecowej na ekranie (F-48 PÓŹNIEJ) nie ma wejścia w 1.0; wartość zostaje w tekście receptury
  // [M1-audytor-generalny-149]
  it('wilgotność miękiszu w tekście receptury: PL 28,1%, EN 28.1%', () => {
    const metrics = { ...calculateBakeLossMetrics(960, 14, 400), retainedMoisturePercent: 28.1 };
    setLang('pl');
    expect(formatRecipeText({ recipeName: 'X', calc, bakeLoss: metrics })).toContain('28,1%');
    setLang('en');
    expect(formatRecipeText({ recipeName: 'X', calc, bakeLoss: metrics })).toContain('28.1%');
  });

  it('atlas zamienników: białko i popiół PL z przecinkiem, EN z kropką', () => {
    const el = React.createElement(FlourEquivalentsModal, { visible: true, onClose: () => {} });
    setLang('pl');
    const pl = render(el);
    expect(pl).toContain('~10,5%');
    expect(pl).toContain('0,5–0,59%');
    expect(pl).not.toMatch(/\d\.\d/);
    setLang('en');
    const en = render(el);
    expect(en).toContain('~10.5%');
    expect(en).toContain('0.5–0.59%');
  });

  it('komunikaty rdzenia z parametrami (mieszanka, zakwas, spiżarnia) przez t() według języka', () => {
    const v = validateFlourBlend([{ name: 'A', percentage: 60.5 } as Parameters<typeof validateFlourBlend>[0][number]]);
    setLang('pl');
    expect(t(v.errorTemplatePl ?? '', v.errorParams)).toBe('Suma procentów wynosi 60,5% — brakuje jeszcze 39,5%.');
    setLang('en');
    expect(t(v.errorTemplatePl ?? '', v.errorParams)).toBe('The percentages add up to 60.5% — 39.5% still missing.');
    const s = calculateRecipeStarterSubstitution({ recipeStarterGrams: 100, recipeStarterHydration: 100, userStarterHydration: 62.5 });
    setLang('pl');
    expect(t(s.adviceTemplatePl, s.adviceParams)).toContain('(62,5%)');
    setLang('en');
    expect(t(s.adviceTemplatePl, s.adviceParams)).toContain('(62.5%)');
  });

  it('komunikat adaptacji Q10 (RD-08): PL „21,5°C”, EN po angielsku „21.5°C”', () => {
    setLang('pl');
    const pl = calculateFermentationAdaptation(4, 21.5).messagePl;
    expect(pl).toContain('21,5°C');
    expect(pl).toContain('wydłużony');
    expect(calculateFermentationAdaptation(4, 24).messagePl).toContain('24,0°C');
    setLang('en');
    const en = calculateFermentationAdaptation(4, 21.5).messagePl;
    expect(en).toContain('21.5°C');
    expect(en).not.toMatch(/[ąćęłńóśźż]|Chłodno|wydłużony/i);
    expect(calculateFermentationAdaptation(4, 27).messagePl).toContain('27.0°C');
    expect(calculateFermentationAdaptation(4, 24).messagePl).toContain('24.0°C');
  });
});

describe('eksport bez zmian formatu (kropka niezależnie od języka)', () => {
  it('kopia JSON i CSV spiżarni mają kropkę dziesiętną w PL', () => {
    setLang('pl');
    const json = JSON.stringify(buildBackup({ bakes: [], starters: [], customRecipes: [], settings: { hydration: 72.5 } }));
    expect(json).toContain('"hydration":72.5');
    const csv = exportFlourInventoryCsv([
      { id: 'f1', name: 'Typ 750', stockGrams: 1234.5, proteinPct: 12.5, updatedAt: 0 } as Parameters<typeof exportFlourInventoryCsv>[0][number],
    ]);
    expect(csv).toContain('1234.5');
    expect(csv).toContain('12.5');
  });
});
