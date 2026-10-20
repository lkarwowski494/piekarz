/**
 * Tekst receptury w języku i jednostkach użytkownika [M1-audytor-generalny-072; 09-lokalizacja-007]:
 * EN + imperial — etykiety po angielsku, temperatury °F, masy w lb/oz z unit-converter; PL + metric bez zmian
 * (poza masą soli z przecinkiem, 070). Plik danych (kopia JSON i JSON receptury) nie zależy od języka.
 */
import { formatRecipeText } from '../recipe-formatter';
import { calculateDoughRecipe, calculateBakeLossMetrics } from '../../core/domain-rules';
import { setLang, t } from '../i18n';
import { celsiusToFahrenheit, formatDoseWeight, formatWeight } from '../unit-converter';
import { buildBackup } from '../backup';
import { encodeRecipeToShareUrl } from '../recipe-sharing';

const calc = calculateDoughRecipe({
  targetDoughWeightGrams: 1700,
  flours: [
    { name: 'Bread flour T65', percentage: 80.0 },
    { name: 'Whole rye', percentage: 20.0 },
  ],
  waterPercentage: 68.0,
  saltPercentage: 2.0,
  starterPercentage: 20.0,
  starterHydration: 100.0,
});
const loss1 = calculateBakeLossMetrics(1700, 14.0, calc.totalWaterGrams, 1);
const loss2 = calculateBakeLossMetrics(1700, 14.0, calc.totalWaterGrams, 2);
const text = (loavesCount: number, unitSystem?: 'metric' | 'imperial') =>
  formatRecipeText({
    recipeName: 'Country loaf',
    calc,
    bakeLoss: loavesCount === 2 ? loss2 : loss1,
    targetDdt: 25.5,
    waterTempTarget: 3.5,
    iceGrams: 85,
    tapWaterTemp: 22,
    loavesCount,
    unitSystem,
  });

afterEach(() => setLang('pl'));

describe('EN + imperial', () => {
  beforeEach(() => setLang('en'));

  it.each([1, 2])('%i loaves: no Polish text, temperatures in °F, masses in lb/oz', (loaves) => {
    const s = text(loaves, 'imperial');
    expect(s).not.toMatch(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/);
    for (const pl of ['pary', 'mąki', 'wody', 'kranu', 'po upieczeniu', 'Woda', 'Zakwas', 'Sól', 'Masa', 'Hydratacja', 'Strata']) {
      expect({ pl, found: s.includes(pl) }).toEqual({ pl, found: false });
    }
    expect(s).not.toContain('°C');
    expect(s).toContain(`${celsiusToFahrenheit(25.5)}°F`);
    expect(s).toContain(`${celsiusToFahrenheit(3.5)}°F`);
    expect(s).toContain(`${celsiusToFahrenheit(22)}°F`);
    expect(s).not.toMatch(/\d g\b/);
    expect(s).toContain(formatWeight(1700, 'imperial'));
    for (const f of calc.flours) expect(s).toContain(formatWeight(f.weightGrams, 'imperial'));
    expect(s).toContain(formatDoseWeight(calc.saltGrams, 'imperial'));
    expect(s).toContain(t(loss1.categoryLabelPl));
    expect(s).toContain(t(loss1.coolingAdvicePl));
    expect(s).toContain('Total hydration: 70.9%');
  });

  it('EN + metric: English labels with grams and °C', () => {
    const s = text(1, 'metric');
    expect(s).not.toMatch(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/);
    expect(s).toContain('1700 g');
    expect(s).toContain('25.5°C');
    expect(s).toContain('tap water (22°C)');
  });
});

describe('PL + metric unchanged', () => {
  it('1 loaf', () => {
    setLang('pl');
    expect(text(1, 'metric')).toBe(
      [
        'Country loaf',
        '================',
        'Masa ciasta: 1700 g (po upieczeniu: ~1462 g)',
        'Hydratacja całkowita: 70,9%',
        'Strata piecowa: 14,0% (-238 g pary)',
        'Szacowana wilgotność miękiszu: 31,5% (Suchy / chrupki (Crisp Dry))',
        '',
        'Do miski na wagę:',
        '  • Bread flour T65 (80,0%): 716 g',
        '  • Whole rye (20,0%): 179 g',
        '  • Woda (67,9%): 608 g [temp. 3,5°C]',
        '    ↳ w tym lód: 85 g + woda z kranu (22°C): 523 g',
        '  • Zakwas (20,0%): 179 g (89 g mąki + 89 g wody)',
        '  • Sól (2,0%): 17,9 g',
        '',
        'Docelowa temperatura ciasta (DDT): 25,5°C',
        '',
        'Zalecenie studzenia na kratce:',
        '  Niska wilgotność miękiszu (styl bagietkowy). Skórka bardzo krucha, krótszy czas zachowania świeżości.',
        '',
        '— Apps4Craft Studio • Piekarz',
      ].join('\n')
    );
  });

  it('2 loaves', () => {
    setLang('pl');
    expect(text(2, 'metric').split('\n')[2]).toBe('Masa ciasta: 1700 g (2x ~731 g upieczony bochenek)');
  });
});

describe('data file does not depend on the language (keys and values for import)', () => {
  it('backup JSON and recipe JSON are the same in PL and EN', () => {
    const recipe = { id: 'r1', name: 'Country loaf', formula: { flours: [{ name: 'Bread flour T65', percentage: 100 }], waterPercentage: 70.5, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 }, targetDDT: 25, isBuiltIn: false, createdAt: 1 };
    const state = { bakes: [{ id: 'b1', recipeName: 'Country loaf', startedAt: 1 }], starters: [], customRecipes: [recipe] };
    const strip = (s: string) => s.replace(/"exportedAt":("[^"]*"|\d+)/g, '"exportedAt":0');
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
    setLang('pl');
    const plBackup = strip(JSON.stringify(buildBackup(state)));
    const plRecipe = encodeRecipeToShareUrl(recipe);
    setLang('en');
    expect(strip(JSON.stringify(buildBackup(state)))).toBe(plBackup);
    expect(plBackup).toContain('"waterPercentage":70.5');
    expect(encodeRecipeToShareUrl(recipe)).toBe(plRecipe);
    now.mockRestore();
  });
});
