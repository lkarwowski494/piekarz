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
import { StoredRecipe, StoredBakeLog } from '../db';

describe('Exhaustive SQLite Persistence & Data Resilience (BR-DATA-RESILIENCE)', () => {
  beforeEach(async () => {
    setActiveBake(null);
    await initDatabase();
  });

  // --------------------------------------------------------------------------
  // 1. SQL Injection & Quoting Attacks
  // --------------------------------------------------------------------------
  describe('SQL Injection & Quoting Resilience', () => {
    it('safely stores and retrieves recipe with classic SQL injection payload in name', async () => {
      const maliciousRecipe: StoredRecipe = {
        id: 'sql_inj_1',
        name: "Robert'); DROP TABLE recipes; --",
        formula: {
          flours: [{ name: 'Pszenna', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
          targetDoughWeightGrams: 1000,
        },
        targetDDT: 24,
        notes: "'; DELETE FROM bakes; --",
        isBuiltIn: false,
        createdAt: Date.now(),
      };

      await saveRecipe(maliciousRecipe);

      const recipes = await getRecipes();
      expect(recipes.length).toBeGreaterThanOrEqual(1);

      const found = recipes.find((r) => r.id === 'sql_inj_1');
      expect(found).toBeDefined();
      expect(found?.name).toBe("Robert'); DROP TABLE recipes; --");
      expect(found?.notes).toBe("'; DELETE FROM bakes; --");
    });

    it('safely handles OR 1=1 injection strings in IDs and notes', async () => {
      const recipe: StoredRecipe = {
        id: "id' OR '1'='1",
        name: 'Boolean SQL Inject Test',
        formula: {
          flours: [{ name: 'Test', percentage: 100 }],
          waterPercentage: 72,
          saltPercentage: 2,
          starterPercentage: 20,
          targetDoughWeightGrams: 800,
        },
        targetDDT: 25,
        isBuiltIn: false,
        createdAt: Date.now(),
      };

      await saveRecipe(recipe);

      const recipes = await getRecipes();
      const found = recipes.find((r) => r.id === "id' OR '1'='1");
      expect(found).toBeDefined();
      expect(found?.name).toBe('Boolean SQL Inject Test');

      // Cleaning up
      await deleteRecipe("id' OR '1'='1'");
      const afterDelete = await getRecipes();
      expect(afterDelete.find((r) => r.id === "id' OR '1'='1'")).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Unicode, Polish Diacritics, and Emojis
  // --------------------------------------------------------------------------
  describe('Unicode & Emoji Fidelity', () => {
    it('preserves Polish diacritics and emojis in recipe names and notes', async () => {
      const unicodeRecipe: StoredRecipe = {
        id: 'recipe_unicode_pl',
        name: '🌾 Chleb Żytni Razowy „Tradycyjny” 100% (Typ 2000) 🥖✨',
        formula: {
          flours: [{ name: 'Mąka żytnia razowa typ 2000', percentage: 100 }],
          waterPercentage: 80,
          saltPercentage: 2.2,
          starterPercentage: 25,
          targetDoughWeightGrams: 1200,
        },
        targetDDT: 26,
        notes: 'Wypiek w garnku:\n• 20 min w 240°C\n• 25 min w 210°C\nZażółć gęślą jaźń! ⭐⭐⭐⭐⭐',
        isBuiltIn: false,
        createdAt: Date.now(),
      };

      await saveRecipe(unicodeRecipe);

      const recipes = await getRecipes();
      const found = recipes.find((r) => r.id === 'recipe_unicode_pl');

      expect(found).toBeDefined();
      expect(found?.name).toBe('🌾 Chleb Żytni Razowy „Tradycyjny” 100% (Typ 2000) 🥖✨');
      expect(found?.notes).toContain('Zażółć gęślą jaźń!');
      expect(found?.notes).toContain('⭐⭐⭐⭐⭐');
    });

    it('preserves Polish diacritics in starter names and flour types', async () => {
      await saveStarter({
        id: 'starter_unicode',
        name: 'Zakwas Bolesław II Śmiały 🥣',
        flourType: 'Żytnia pełnoziarnista typ 2000 (Młyn Szczepanki)',
        hydration: 100.0,
        birthDate: 1600000000000,
        storageState: 'FRIDGE',
        lastFedAt: 1700000000000,
      });

      const starters = await getStarters();
      const found = starters.find((s) => s.id === 'starter_unicode');

      expect(found).toBeDefined();
      expect(found?.name).toBe('Zakwas Bolesław II Śmiały 🥣');
      expect(found?.flourType).toBe('Żytnia pełnoziarnista typ 2000 (Młyn Szczepanki)');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Database Idempotency
  // --------------------------------------------------------------------------
  describe('Database Initialization Idempotency', () => {
    it('calling initDatabase multiple times does not duplicate master recipes', async () => {
      const initialRecipes = await getRecipes();
      const initialCount = initialRecipes.length;

      // Re-initialize 3 times
      await initDatabase();
      await initDatabase();
      await initDatabase();

      const afterRecipes = await getRecipes();
      expect(afterRecipes.length).toBe(initialCount);
    });

    it('calling initDatabase preserves previously saved custom recipes', async () => {
      await saveRecipe({
        id: 'persistent_custom_1',
        name: 'Moja Receptura Niezmienna',
        formula: {
          flours: [{ name: 'Mąka', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
          targetDoughWeightGrams: 800,
        },
        targetDDT: 24,
        isBuiltIn: false,
        createdAt: Date.now(),
      });

      await initDatabase();

      const recipes = await getRecipes();
      const found = recipes.find((r) => r.id === 'persistent_custom_1');
      expect(found).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 4. Deletion Robustness
  // --------------------------------------------------------------------------
  describe('Recipe Deletion Robustness', () => {
    it('deleting non-existent ID does not error or delete other recipes', async () => {
      const before = await getRecipes();
      await expect(deleteRecipe('non_existent_recipe_xyz_999')).resolves.not.toThrow();
      const after = await getRecipes();
      expect(after.length).toBe(before.length);
    });

    it('deletes only targeted recipe and leaves others untouched', async () => {
      await saveRecipe({
        id: 'target_delete_me',
        name: 'Do usunięcia',
        formula: {
          flours: [{ name: 'A', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
          targetDoughWeightGrams: 500,
        },
        targetDDT: 24,
        isBuiltIn: false,
        createdAt: Date.now(),
      });

      await saveRecipe({
        id: 'target_keep_me',
        name: 'Zostaw mnie',
        formula: {
          flours: [{ name: 'B', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
          targetDoughWeightGrams: 500,
        },
        targetDDT: 24,
        isBuiltIn: false,
        createdAt: Date.now(),
      });

      await deleteRecipe('target_delete_me');

      const recipes = await getRecipes();
      expect(recipes.find((r) => r.id === 'target_delete_me')).toBeUndefined();
      expect(recipes.find((r) => r.id === 'target_keep_me')).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Bake Log History Ordering & Volume
  // --------------------------------------------------------------------------
  describe('Bake Log History Ordering & Volume', () => {
    it('stores multiple bakes and retrieves them in descending chronological order', async () => {
      const now = Date.now();

      const bakes: StoredBakeLog[] = [
        {
          id: 'bake_hist_1',
          recipeName: 'Bake 1 (Oldest)',
          startedAt: now - 3600 * 1000 * 24 * 3,
          finishedAt: now - 3600 * 1000 * 24 * 3 + 7200000,
          ratingStars: 4,
          notes: 'Dobre ucho',
        },
        {
          id: 'bake_hist_2',
          recipeName: 'Bake 2 (Middle)',
          startedAt: now - 3600 * 1000 * 24 * 2,
          finishedAt: now - 3600 * 1000 * 24 * 2 + 7200000,
          ratingStars: 5,
          notes: 'Perfekcyjny miękisz',
        },
        {
          id: 'bake_hist_3',
          recipeName: 'Bake 3 (Newest)',
          startedAt: now - 3600 * 1000 * 24 * 1,
          finishedAt: now - 3600 * 1000 * 24 * 1 + 7200000,
          ratingStars: 5,
          notes: 'Mistrzostwo',
        },
      ];

      for (const b of bakes) {
        await saveBakeLog(b);
      }

      const logs = await getBakeLogs();
      expect(logs.length).toBeGreaterThanOrEqual(3);

      const find1 = logs.find((l) => l.id === 'bake_hist_1');
      const find2 = logs.find((l) => l.id === 'bake_hist_2');
      const find3 = logs.find((l) => l.id === 'bake_hist_3');

      expect(find1).toBeDefined();
      expect(find2).toBeDefined();
      expect(find3).toBeDefined();

      const idx1 = logs.indexOf(find1!);
      const idx2 = logs.indexOf(find2!);
      const idx3 = logs.indexOf(find3!);

      // Newest must appear before oldest in list
      expect(idx3).toBeLessThan(idx2);
      expect(idx2).toBeLessThan(idx1);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Active Bake State Invariants
  // --------------------------------------------------------------------------
  describe('Active Bake State Invariants', () => {
    it('sets and retrieves active bake state without data loss', () => {
      const activeState = {
        id: 'active_123',
        recipeName: 'Aktywny Chleb Wiejski',
        startedAt: 1700000000000,
        currentStageId: 'step_2',
        ambientTempC: 23.5,
        actualDdtC: 25.0,
      };

      setActiveBake(activeState);
      const retrieved = getActiveBake();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('active_123');
      expect(retrieved?.ambientTempC).toBe(23.5);
      expect(retrieved?.currentStageId).toBe('step_2');
    });

    it('clears active bake when set to null and handles repeated null sets', () => {
      setActiveBake({
        id: 'active_temp',
        recipeName: 'Temp',
        startedAt: 123,
        currentStageId: 'step_1',
        ambientTempC: 20,
        actualDdtC: 24,
      });

      expect(getActiveBake()).not.toBeNull();

      setActiveBake(null);
      expect(getActiveBake()).toBeNull();

      setActiveBake(null);
      expect(getActiveBake()).toBeNull();
    });
  });
});
