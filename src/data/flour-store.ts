import { StoredFlourInventoryItem } from './db';
import { getDb, memStore } from './sqlite-schema';
import { writeOrThrow } from './storage-status';

// ==========================================
// Flour Inventory (Magazyn Mąk)
// ==========================================

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function getFlourInventory(): Promise<StoredFlourInventoryItem[]> {
  const db = await getDb();
  if (!db) return [...memStore.flourInventory];

  try {
    const rows = await db.getAllAsync<StoredFlourInventoryItem>(
      'SELECT id, name, stock_grams as stockGrams, brand, protein_pct as proteinPct, updated_at as updatedAt FROM flour_inventory ORDER BY name ASC;'
    );
    return rows;
  } catch {
    return [...memStore.flourInventory];
  }
}

export async function writeFlourRow(db: Db, item: StoredFlourInventoryItem): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO flour_inventory (id, name, stock_grams, brand, protein_pct, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
    item.id,
    item.name,
    item.stockGrams,
    item.brand ?? null,
    item.proteinPct ?? null,
    item.updatedAt
  );
}

export function rememberFlour(item: StoredFlourInventoryItem): void {
  const existingIdx = memStore.flourInventory.findIndex((f) => f.id === item.id);
  if (existingIdx >= 0) {
    memStore.flourInventory[existingIdx] = item;
  } else {
    memStore.flourInventory.push(item);
  }
}

export async function saveFlourInventoryItem(item: StoredFlourInventoryItem): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => writeFlourRow(db, item));
  rememberFlour(item);
}

export async function deleteFlourInventoryItem(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM flour_inventory WHERE id = ?;', id));
  memStore.flourInventory = memStore.flourInventory.filter((f) => f.id !== id);
}

export async function deductFlourStock(flourName: string, amountGrams: number): Promise<void> {
  const inventory = await getFlourInventory();
  const matched = inventory.find(
    (inv) => inv.name.trim().toLowerCase() === flourName.trim().toLowerCase()
  );
  if (matched) {
    const updated = {
      ...matched,
      stockGrams: Math.max(0, Math.round(matched.stockGrams - amountGrams)),
      updatedAt: Date.now(),
    };
    await saveFlourInventoryItem(updated);
  }
}
