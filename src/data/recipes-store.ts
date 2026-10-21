import { StoredRecipe } from './db';
import { getDb, memStore } from './sqlite-schema';
import { writeOrThrow } from './storage-status';
import { isRecipeInput } from './row-parsers';
import { odczytNieudany } from './odczyt';
import { zachowajUszkodzony } from './uszkodzone-wiersze';

// ==========================================
// Recipes (Kalkulator)
// ==========================================

export async function getRecipes(): Promise<StoredRecipe[]> {
  const db = await getDb();
  if (!db) return [...memStore.recipes];

  try {
    const rows = await db.getAllAsync<{
      id: string;
      name: string;
      formula_json: string;
      target_ddt: number;
      notes: string | null;
      is_built_in: number;
      created_at: number;
    }>('SELECT * FROM recipes ORDER BY created_at ASC;');

    if (rows.length === 0) return [...memStore.recipes];

    // Wiersz z uszkodzonym formula_json jest pomijany, nie ukrywa pozostałych [M1-audytor-generalny-022],
    // a jego surowa treść trafia do pliku ratunkowego i kopii [M1-audytor-generalny-121]
    const out: StoredRecipe[] = [];
    for (const r of rows) {
      let formula: unknown;
      try {
        formula = JSON.parse(r.formula_json);
      } catch {
        zachowajUszkodzony({ tabela: 'recipes', id: r.id, surowe: r.formula_json });
        continue;
      }
      if (!isRecipeInput(formula)) {
        zachowajUszkodzony({ tabela: 'recipes', id: r.id, surowe: r.formula_json });
        continue;
      }
      out.push({
        id: r.id,
        name: r.name,
        formula,
        targetDDT: r.target_ddt,
        notes: r.notes ?? undefined,
        isBuiltIn: r.is_built_in === 1,
        createdAt: r.created_at,
      });
    }
    return out;
  } catch (e) {
    return odczytNieudany(e);
  }
}

export async function saveRecipe(recipe: StoredRecipe): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.runAsync(
        `INSERT OR REPLACE INTO recipes (id, name, formula_json, target_ddt, notes, is_built_in, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        recipe.id,
        recipe.name,
        JSON.stringify(recipe.formula),
        recipe.targetDDT,
        recipe.notes ?? null,
        recipe.isBuiltIn ? 1 : 0,
        recipe.createdAt
      )
    );
  }

  const idx = memStore.recipes.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    memStore.recipes[idx] = recipe;
  } else {
    memStore.recipes.push(recipe);
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM recipes WHERE id = ?;', id));
  memStore.recipes = memStore.recipes.filter((r) => r.id !== id);
}
