/**
 * Tekst receptury do udostępnienia: zdanie w nawiasie i skrót „temp.” jako klucze słownika, bez sklejania
 * i bez zmiany wielkości liter przekładu (niemieckie rzeczowniki wielką literą) [M1-audytor-generalny-172; 09-lokalizacja-509].
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatRecipeText } from '../recipe-formatter';
import { calculateDoughRecipe, calculateBakeLossMetrics } from '../../core/domain-rules';
import { setLang, t, type Lang } from '../i18n';
import { formatFixed } from '../format';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), NotificationFeedbackType: { Success: 'success' } }));

const calc = calculateDoughRecipe({
  targetDoughWeightGrams: 1700,
  flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
  waterPercentage: 68,
  saltPercentage: 2,
  starterPercentage: 20,
  starterHydration: 100,
});
const bakeLoss = calculateBakeLossMetrics(1700, 14, calc.totalWaterGrams, 2);
const tekst = () => formatRecipeText({ recipeName: 'Chleb', calc, bakeLoss, waterTempTarget: 22, loavesCount: 2, unitSystem: 'metric' });

describe('tekst receptury: bez sklejania (172)', () => {
  afterEach(() => setLang('pl'));

  it('źródło: „temp.” tylko przez t(), bez toLowerCase na przekładzie', () => {
    const src = readFileSync(join(__dirname, '..', 'recipe-formatter.ts'), 'utf8');
    expect(src).not.toMatch(/\[temp\./);
    expect(src).not.toMatch(/\)\.toLowerCase\(\)/);
  });

  it('pl: wynik bez zmian', () => {
    const s = tekst();
    expect(s).toContain(`(2x ~${bakeLoss.singleLoafBakedGrams} g upieczony bochenek)`);
    expect(s).toContain('[temp. 22,0°C]');
  });

  it.each<Lang>(['de', 'ja'])('%s: nawias i temperatura wody z kluczy słownika', (l) => {
    setLang(l);
    const s = tekst();
    expect(s).toContain(`(${t('{n}x ~{masa} upieczony bochenek', { n: 2, masa: `${bakeLoss.singleLoafBakedGrams} g` })})`);
    expect(s).toContain(`[${t('temp. {temp}', { temp: `${formatFixed(22, 1)}°C` })}]`);
    if (l === 'de') expect(s).not.toContain('gebackener laib');
  });
});
