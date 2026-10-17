// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// SQLite Repositories & Outbox Queue Unit Tests (Clean Architecture Verification)
// ============================================================================

import {
  SQLiteBakeRepository,
  SQLiteStarterRepository,
  SQLiteRecipeRepository,
  SQLiteFlourInventoryRepository,
  SQLitePendingOpsQueue,
} from '../repositories/sqlite-repositories';
import { _resetMemStore } from '../sqlite-schema';

describe('SQLite Clean Architecture Repositories (Port & Adapter Pattern)', () => {
  beforeEach(() => {
    _resetMemStore();
  });

  describe('SQLiteBakeRepository', () => {
    const repo = new SQLiteBakeRepository();

    it('saves, retrieves by ID, and lists bake logs', async () => {
      const log = {
        id: 'test_bake_1',
        recipeName: 'Chleb Wiejski 75%',
        startedAt: 1700000000000,
        ratingStars: 5,
        crumbScore: 4,
        crustScore: 5,
        tasteProfile: 'balanced' as const,
      };

      await repo.saveBakeLog(log);
      const found = await repo.getBakeLogById('test_bake_1');
      expect(found).not.toBeNull();
      expect(found?.recipeName).toBe('Chleb Wiejski 75%');

      const all = await repo.getBakeLogs();
      expect(all.length).toBeGreaterThan(0);

      await repo.deleteBakeLog('test_bake_1');
      const deleted = await repo.getBakeLogById('test_bake_1');
      expect(deleted).toBeNull();
    });
  });

  describe('SQLiteStarterRepository', () => {
    const repo = new SQLiteStarterRepository();

    it('saves and logs feeding timestamp', async () => {
      const starter = {
        id: 'starter_sourdough_1',
        name: 'Stefan Żytni',
        flourType: 'Żytnia 2000',
        hydration: 100,
        birthDate: 1690000000000,
        storageState: 'ROOM_TEMP' as const,
        feedingRatio: '1:2:2' as const,
      };

      await repo.saveStarter(starter);
      const retrieved = await repo.getStarterById('starter_sourdough_1');
      expect(retrieved?.name).toBe('Stefan Żytni');

      const feedTime = Date.now();
      await repo.logFeeding('starter_sourdough_1', feedTime);

      const afterFeeding = await repo.getStarterById('starter_sourdough_1');
      expect(afterFeeding?.lastFedAt).toBe(feedTime);
    });
  });

  describe('SQLiteRecipeRepository', () => {
    const repo = new SQLiteRecipeRepository();

    it('saves and retrieves custom recipe', async () => {
      const recipe = {
        id: 'custom_rec_1',
        name: 'Bagietka z Poolish',
        formula: {
          flours: [{ name: 'Pszenna 650', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 15,
          targetDoughWeightGrams: 500,
        },
        targetDDT: 24,
        createdAt: Date.now(),
      };

      await repo.saveRecipe(recipe);
      const found = await repo.getRecipeById('custom_rec_1');
      expect(found?.name).toBe('Bagietka z Poolish');

      await repo.deleteRecipe('custom_rec_1');
      const afterDelete = await repo.getRecipeById('custom_rec_1');
      expect(afterDelete).toBeNull();
    });
  });

  describe('SQLiteFlourInventoryRepository', () => {
    const repo = new SQLiteFlourInventoryRepository();

    it('saves flour item and deducts stock', async () => {
      const item = {
        id: 'flour_inv_1',
        name: 'Mąka pszenna chlebowa typ 750',
        stockGrams: 2000,
        proteinPct: 12.5,
        updatedAt: Date.now(),
      };

      await repo.saveInventoryItem(item);
      const initial = await repo.getInventory();
      expect(initial.find((i) => i.id === 'flour_inv_1')?.stockGrams).toBe(2000);

      await repo.deductStock('Mąka pszenna chlebowa typ 750', 500);
      const afterDeduct = await repo.getInventory();
      expect(afterDeduct.find((i) => i.id === 'flour_inv_1')?.stockGrams).toBe(1500);
    });
  });

  describe('SQLitePendingOpsQueue (ADR-003 Outbox Pattern)', () => {
    const queue = new SQLitePendingOpsQueue();

    it('enqueues pending operations, updates status, and purges synced records', async () => {
      const op1 = await queue.enqueue('DOUBLE_TAP_FOLD', { foldIndex: 1, bakeId: 'b_123' });
      const op2 = await queue.enqueue('FEEDING_LOGGED', { starterId: 'st_1', timestamp: Date.now() });

      expect(op1.id).toBeDefined();
      expect(op1.status).toBe('PENDING');

      const pending = await queue.getPending();
      expect(pending.length).toBeGreaterThanOrEqual(2);

      await queue.updateStatus(op1.id, 'SYNCED');
      await queue.purgeSynced();

      const remainingPending = await queue.getPending();
      expect(remainingPending.find((o) => o.id === op1.id)).toBeUndefined();
      expect(remainingPending.find((o) => o.id === op2.id)).toBeDefined();
    });
  });
});
