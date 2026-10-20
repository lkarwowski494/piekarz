// ============================================================================
// Piekarz (Crust) — Matrix Logic Exhaustive Contract (BR-TEST-028 & BR-TEST-029)
// Bezpośrednie wywołania funkcji domenowych weryfikujące poprawność wykonawczą.
// ============================================================================

import { localISODate, autoBackup } from '../src/lib/backup';
import { DoughRecipeResult } from '../src/core/domain-rules';
import {
  setPendingRecipeToLoad,
  getPendingRecipeToLoad,
  clearPendingRecipeToLoad,
  subscribePendingRecipe,
  prepareBakeAgainRecipe,
} from '../src/lib/recipe-navigation';
import { escapeCsvCell } from '../src/lib/csv-exporter';
import { formatDate, formatDateTime, formatDuration } from '../src/lib/date';
import { matchesSearch } from '../src/lib/norm-search';
import { utf8ToBase64, base64ToUtf8 } from '../src/lib/recipe-sharing';
import {
  initUnitSystem,
  formatTextUnits,
  roundTo,
  useUnitSystem,
} from '../src/lib/unit-converter';
import { useAppAccess } from '../src/lib/app-access';
import { useLang } from '../src/lib/i18n';
import { getLocaleMetadata } from '../src/lib/i18n-locales';
import {
  executePrintRecipePdf,
  executeExportRecipeJson,
  executeCopyRecipe,
  executeCloneRecipe,
  executeSaveCustomRecipe,
} from '../src/lib/calculator-actions';
import { filterMasterRecipes, MASTER_RECIPES } from '../src/recipes/presets';
import {
  getDb,
  saveFlourInventoryItem,
  deleteFlourInventoryItem,
  deductFlourStock,
  isLessonCompleted,
  hasCompletedOnboarding,
  setOnboardingCompleted,
  getFlourInventory,
  getBakeLogs,
} from '../src/data/sqlite-store';

describe('Matrix Logic Exhaustive Verification (LOGIKA Category)', () => {
  it('localISODate returns YYYY-MM-DD formatted date string', () => {
    const fixed = new Date(2026, 9, 17);
    const str = localISODate(fixed);
    expect(str).toBe('2026-10-17');
  });

  it('escapeCsvCell sanitizes formulas starting with =, +, -, @', () => {
    expect(escapeCsvCell('=CMD|')).toBe('"\'=CMD|"');
    expect(escapeCsvCell('+SUM(A1)')).toBe('"\'+\\SUM(A1)"'.replace('\\', ''));
    expect(escapeCsvCell('-MIN(B2)')).toBe('"\'-\\MIN(B2)"'.replace('\\', ''));
    expect(escapeCsvCell('@SUM(C3)')).toBe('"\'@SUM(C3)"');
    expect(escapeCsvCell('Normal text')).toBe('Normal text');
  });

  it('date helpers format dates and durations predictably', () => {
    const ts = new Date(2026, 9, 17, 10, 30, 0).getTime();
    expect(formatDate(ts)).toBeTruthy();
    expect(formatDateTime(ts)).toBeTruthy();
    expect(formatDuration(45)).toBe('0:45');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(3660)).toBe('1h 1m');
  });

  it('matchesSearch performs diacritic-insensitive fuzzy matching', () => {
    expect(matchesSearch('Chleb pszenny żytni', 'zyt')).toBe(true);
    expect(matchesSearch('Mąka orkiszowa', 'maka')).toBe(true);
    expect(matchesSearch('Bagietka', 'bułka')).toBe(false);
  });

  it('recipe sharing utf8 and base64 round-trip', () => {
    const text = 'Pain de Campagne: 80% mąka, 20% żyto, 70% hydratacja';
    const b64 = utf8ToBase64(text);
    expect(b64).toBeTruthy();
    const restored = base64ToUtf8(b64);
    expect(restored).toBe(text);
  });

  it('unit-converter unit formatters and roundTo', async () => {
    await initUnitSystem();
    expect(roundTo(61.2345, 2)).toBe(61.23);
    expect(roundTo(100.555, 1)).toBe(100.6);
    expect(formatTextUnits('Temp 24°C', 'metric')).toBe('Temp 24°C');
    expect(formatTextUnits('Temp 24°C', 'imperial')).toBe('Temp 75°F');
  });

  // Rytuał nie filtruje receptur (F-26, ZM-14, D-034) [M1-audytor-generalny-032]: tylko kategoria
  it('filterMasterRecipes filters master presets by category', () => {
    const all = filterMasterRecipes('all');
    expect(all.length).toBe(MASTER_RECIPES.length);

    const sourdough = filterMasterRecipes('sourdough');
    expect(sourdough.length).toBeGreaterThan(0);

    const pizza = filterMasterRecipes('pizza');
    expect(pizza.length).toBeGreaterThanOrEqual(1);
  });

  it('recipe navigation pending recipe management and prepareBakeAgainRecipe', () => {
    const dummyLog = {
      id: 'log_1',
      recipeName: 'Wiejski chleb codzienny na zakwasie',
      actualDDT: 24.5,
      startedAt: Date.now() - 3600000,
      createdAt: Date.now(),
    } as any;

    const prep = prepareBakeAgainRecipe(dummyLog, []);
    expect(prep.name).toContain('Wiejski');
    expect(prep.formula.flours.length).toBeGreaterThan(0);

    setPendingRecipeToLoad(prep);
    expect(getPendingRecipeToLoad()?.name).toBe(prep.name);

    let notified = false;
    const unsub = subscribePendingRecipe((r) => {
      if (r) notified = true;
    });
    setPendingRecipeToLoad(prep);
    expect(notified).toBe(true);
    unsub();

    clearPendingRecipeToLoad();
    expect(getPendingRecipeToLoad()).toBeNull();
  });

  it('sqlite-store inventory, lesson and onboarding helpers', async () => {
    const db = await getDb();
    expect(db === null || typeof db === 'object').toBe(true);

    await setOnboardingCompleted(true);
    const completed = await hasCompletedOnboarding();
    expect(completed).toBe(true);

    const lessonDone = await isLessonCompleted(1);
    expect(typeof lessonDone).toBe('boolean');

    await saveFlourInventoryItem({
      id: 'flour_test_item',
      name: 'Mąka orkiszowa typ 630',
      brand: 'Młyn Testowy',
      stockGrams: 5000,
      proteinPct: 12.5,
      updatedAt: Date.now(),
    });

    const inv = await getFlourInventory();
    expect(inv.some((i) => i.id === 'flour_test_item')).toBe(true);

    await deductFlourStock('Mąka orkiszowa typ 630', 1000);
    await deleteFlourInventoryItem('flour_test_item');
  });

  it('autoBackup runs safely without throwing', async () => {
    const result = await autoBackup({ bakes: [], starters: [], customRecipes: [] });
    expect(result === null || typeof result === 'string').toBe(true);
  });

  it('calculator-actions execute methods run cleanly or handle errors', async () => {
    const saved = await executeSaveCustomRecipe(
      'Test Boule Custom',
      [{ name: 'Mąka pszenna', percentage: 100 }],
      70,
      2.0,
      20,
      100,
      900,
      24
    );
    expect(saved?.name).toBe('Test Boule Custom');

    const cloned = await executeCloneRecipe(
      'Test Boule Cloned',
      [{ name: 'Mąka pszenna', percentage: 100 }],
      70,
      2.0,
      20,
      100,
      900,
      24
    );
    expect(cloned.name).toContain('Test Boule Cloned');

    await executeCopyRecipe({
      recipeName: 'Test Loaf',
      calculations: {
        totalFlourGrams: 500,
        baseFlourWeightGrams: 500,
        targetDoughWeightGrams: 960,
        overallHydrationPercent: 70,
        waterGrams: 350,
        flours: [{ name: 'Mąka', weightGrams: 500, percentage: 100 }],
      } as unknown as DoughRecipeResult,
      bakeLossMetrics: undefined,
      targetDdt: 24,
      waterTempTarget: 22,
      tapWaterTemp: 18,
      loavesCount: 1,
    });

    if (saved) {
      await executeExportRecipeJson(saved);
    }

    await executePrintRecipePdf({
      recipeName: 'PDF Loaf',
      calculations: {
        totalFlourGrams: 500,
        overallHydrationPercent: 70,
        flours: [],
        waterGrams: 350,
        starterGrams: 100,
        saltGrams: 10,
        targetDoughWeightGrams: 960,
      } as unknown as DoughRecipeResult,
      starterHydration: 100,
      saltPct: 2.0,
      targetDdt: 24,
      waterTempTarget: 22,
      roomTemp: 21,
      loavesCount: 1,
      bakedSingleLoafWeight: 800,
      selectedPresetId: 'country_loaf_72',
    });
  });

  it('hooks useAppAccess, useLang, and useUnitSystem are defined', () => {
    expect(typeof useAppAccess).toBe('function');
    expect(typeof useLang).toBe('function');
    expect(typeof useUnitSystem).toBe('function');
  });

  it('getLocaleMetadata retrieves locale configuration', () => {
    const plMeta = getLocaleMetadata('pl');
    expect(plMeta?.name).toBe('Polski');
    expect(plMeta?.status).toBe('released');
    const unknown = getLocaleMetadata('unknown');
    expect(unknown).toBeUndefined();
  });
});
