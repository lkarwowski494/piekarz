import {
  initDatabase,
  getRecipes,
  saveRecipe,
  deleteRecipe,
  getStarters,
  saveStarter,
  getBakeLogs,
  saveBakeLog,
  setActiveBake,
  getActiveBake,
} from '../sqlite-store';

describe('Apps4Brew SQLite Store & Persistence (data/sqlite-store)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('initializes default master recipes', async () => {
    const recipes = await getRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(6);
    expect(recipes.some((r) => r.name.includes('Tartine'))).toBe(true);
    expect(recipes.some((r) => r.id === 'country_loaf_72' || r.name.includes('Wiejski chleb'))).toBe(true);
  });

  it('saves and retrieves custom recipe', async () => {
    const newRecipe = {
      id: 'custom_baguette_1',
      name: 'Bagietka Paryska 75%',
      formula: {
        flours: [{ name: 'Mąka T65', percentage: 100.0 }],
        waterPercentage: 75.0,
        saltPercentage: 2.0,
        starterPercentage: 15.0,
        targetDoughWeightGrams: 900,
      },
      targetDDT: 24.0,
      notes: 'Zimna fermentacja 24h',
      isBuiltIn: false,
      createdAt: Date.now(),
    };

    await saveRecipe(newRecipe);
    const recipes = await getRecipes();
    const found = recipes.find((r) => r.id === 'custom_baguette_1');
    expect(found).toBeDefined();
    expect(found?.formula.waterPercentage).toBe(75.0);
  });

  it('initializes and saves sourdough starter', async () => {
    const starters = await getStarters();
    expect(starters.length).toBeGreaterThanOrEqual(1);
    expect(starters[0].name).toContain('Bolesław');

    const newStarter = {
      id: 'starter_wheat_san_francisco',
      name: 'San Francisco White',
      flourType: 'Mąka pszenna chlebowa t750',
      hydration: 100.0,
      birthDate: Date.now() - 1000 * 60 * 60 * 24 * 30,
      storageState: 'ROOM_TEMP' as const,
      lastFedAt: Date.now(),
    };

    await saveStarter(newStarter);
    const updatedStarters = await getStarters();
    const found = updatedStarters.find((s) => s.id === 'starter_wheat_san_francisco');
    expect(found).toBeDefined();
    expect(found?.storageState).toBe('ROOM_TEMP');
  });

  it('records bake log and completes bake session', async () => {
    const bakeLog = {
      id: 'bake_test_1',
      recipeName: 'Country Loaf 72%',
      startedAt: Date.now() - 1000 * 60 * 60 * 18,
      finishedAt: Date.now(),
      ambientTemp: 23.5,
      actualDDT: 26.0,
      ratingStars: 5,
      notes: 'Idealne ucho i chrupiąca skórka',
    };

    await saveBakeLog(bakeLog);
    const logs = await getBakeLogs();
    const found = logs.find((l) => l.id === 'bake_test_1');
    expect(found).toBeDefined();
    expect(found?.ratingStars).toBe(5);
  });

  it('deletes custom recipe from store', async () => {
    const toDelete = {
      id: 'recipe_to_delete',
      name: 'Chleb do usunięcia',
      formula: {
        flours: [{ name: 'Mąka', percentage: 100.0 }],
        waterPercentage: 70.0,
        saltPercentage: 2.0,
        starterPercentage: 20.0,
        targetDoughWeightGrams: 900,
      },
      targetDDT: 25.0,
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    await saveRecipe(toDelete);
    let recipes = await getRecipes();
    expect(recipes.some((r) => r.id === 'recipe_to_delete')).toBe(true);

    await deleteRecipe('recipe_to_delete');
    recipes = await getRecipes();
    expect(recipes.some((r) => r.id === 'recipe_to_delete')).toBe(false);
  });

  it('sets and retrieves active kitchen bake state', () => {
    setActiveBake({
      id: 'active_session_1',
      recipeName: 'Country Loaf 72%',
      startedAt: Date.now(),
      currentStageId: 'autolyse',
      ambientTempC: 22.5,
      actualDdtC: 25.0,
    });

    const active = getActiveBake();
    expect(active).not.toBeNull();
    expect(active?.recipeName).toBe('Country Loaf 72%');

    setActiveBake(null);
    expect(getActiveBake()).toBeNull();
  });
});

