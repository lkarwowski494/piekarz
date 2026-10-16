import * as fc from 'fast-check';
import { checkFlourInventory, deductFlourStocks } from '../inventory';
import { StoredFlourInventoryItem } from '../../data/db';

describe('Flour Inventory & Stock Depletion Engine (src/core/inventory.ts)', () => {
  const sampleInventory: StoredFlourInventoryItem[] = [
    {
      id: 'inv_1',
      name: 'Mąka pszenna chlebowa typ 750',
      stockGrams: 1000,
      updatedAt: 1000,
    },
    {
      id: 'inv_2',
      name: 'Mąka żytnia razowa typ 2000',
      stockGrams: 500,
      updatedAt: 1000,
    },
    {
      id: 'inv_3',
      name: 'Mąka pszenna typ 650',
      stockGrams: 2000,
      updatedAt: 1000,
    },
  ];

  it('reports allSufficient when all recipe flours have enough stock', () => {
    const recipeFlours = [
      { name: 'Mąka pszenna chlebowa typ 750', weightGrams: 500 },
      { name: 'Mąka żytnia razowa typ 2000', weightGrams: 100 },
    ];

    const result = checkFlourInventory(recipeFlours, sampleInventory);

    expect(result.allSufficient).toBe(true);
    expect(result.totalDeficitGrams).toBe(0);
    expect(result.totalRequiredGrams).toBe(600);
    expect(result.warningMessagePl).toBeUndefined();

    expect(result.items[0].status).toBe('sufficient');
    expect(result.items[1].status).toBe('sufficient');
  });

  it('detects low_stock and missing stock with deficit grams', () => {
    const recipeFlours = [
      { name: 'Mąka pszenna chlebowa typ 750', weightGrams: 1200 }, // has 1000g -> deficit 200g
      { name: 'Mąka orkiszowa jasna typ 630', weightGrams: 300 },   // has 0g -> deficit 300g
    ];

    const result = checkFlourInventory(recipeFlours, sampleInventory);

    expect(result.allSufficient).toBe(false);
    expect(result.totalDeficitGrams).toBe(500);
    expect(result.warningMessagePl).toContain('brakuje 500g mąki');

    // Item 1: low stock
    expect(result.items[0].status).toBe('low_stock');
    expect(result.items[0].availableGrams).toBe(1000);
    expect(result.items[0].deficitGrams).toBe(200);
    // User has Mąka pszenna typ 650 with 2000g in pantry -> suggested substitute!
    expect(result.items[0].substituteSuggestionPl).toContain('Mąka pszenna typ 650');

    // Item 2: missing
    expect(result.items[1].status).toBe('missing');
    expect(result.items[1].availableGrams).toBe(0);
    expect(result.items[1].deficitGrams).toBe(300);
  });

  it('matches flours using FlourProfile when names have slight variations', () => {
    const recipeFlours = [
      { name: 'Mąka pszenna t750', weightGrams: 400 },
    ];

    const result = checkFlourInventory(recipeFlours, sampleInventory);

    expect(result.allSufficient).toBe(true);
    expect(result.items[0].matchedInventoryId).toBe('inv_1');
    expect(result.items[0].availableGrams).toBe(1000);
  });

  it('deducts used flour amounts and clamps stock to 0', () => {
    const recipeFlours = [
      { name: 'Mąka pszenna chlebowa typ 750', weightGrams: 400 },
      { name: 'Mąka żytnia razowa typ 2000', weightGrams: 700 }, // exceeds 500g stock
    ];

    const updated = deductFlourStocks(recipeFlours, sampleInventory);

    const flour750 = updated.find((i) => i.id === 'inv_1')!;
    const flour2000 = updated.find((i) => i.id === 'inv_2')!;
    const flour650 = updated.find((i) => i.id === 'inv_3')!;

    expect(flour750.stockGrams).toBe(600);
    expect(flour2000.stockGrams).toBe(0); // clamped to 0
    expect(flour650.stockGrams).toBe(2000); // unchanged
  });

  // Property-based test
  it('preserves mathematical invariants across arbitrary recipes and inventory states (property-based)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.constantFrom('Mąka pszenna typ 750', 'Mąka żytnia 2000', 'Mąka Manitoba'),
            weightGrams: fc.integer({ min: 10, max: 2000 }),
          }),
          { minLength: 1, maxLength: 4 }
        ),
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.constantFrom('Mąka pszenna typ 750', 'Mąka żytnia 2000', 'Mąka Manitoba'),
            stockGrams: fc.integer({ min: 0, max: 3000 }),
            updatedAt: fc.constant(1000),
          }),
          { minLength: 1, maxLength: 4 }
        ),
        (recipeFlours, inventory) => {
          const result = checkFlourInventory(recipeFlours, inventory);

          expect(result.totalDeficitGrams).toBeLessThanOrEqual(result.totalRequiredGrams);
          expect(result.allSufficient).toBe(result.totalDeficitGrams === 0);

          const deducted = deductFlourStocks(recipeFlours, inventory);
          for (const item of deducted) {
            expect(item.stockGrams).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
