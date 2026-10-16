// ============================================================================
// Piekarz (Crust) — Local Database Repository (BR-DANE-001)
// Clean architecture repository for recipes, starters, and logs.
// ============================================================================

import { MASTER_RECIPES, RecipePreset } from '../recipes/presets';
import { DoughRecipeInput } from '../core/domain-rules';

export interface StoredRecipe {
  id: string;
  name: string;
  formula: DoughRecipeInput;
  targetDDT: number;
  notes?: string;
  isBuiltIn: boolean;
  createdAt: number;
}

export interface StoredStarter {
  id: string;
  name: string;
  flourType: string;
  hydration: number;
  birthDate: number;
  storageState: 'ROOM_TEMP' | 'FRIDGE';
  lastFedAt?: number;
}

export interface StoredBakeLog {
  id: string;
  recipeName: string;
  startedAt: number;
  finishedAt?: number;
  ambientTemp?: number;
  actualDDT?: number;
  ratingStars?: number;
  notes?: string;
  crumbScore?: number; // 1-5 (1: gęsty/zbity, 5: dzika otwarta struktura / open crumb)
  crustScore?: number; // 1-5 (1: blada/miękka, 5: chrupiąca, pęcherzykowata)
  tasteProfile?: 'mild' | 'balanced' | 'sour' | 'tangy';
}

export interface StoredFlourInventoryItem {
  id: string;
  name: string;
  stockGrams: number;
  brand?: string;
  proteinPct?: number;
  updatedAt: number;
}

/**
 * In-memory repository with local persistence layer.
 * Implements full CRUD without external cloud dependencies.
 */
class LocalDatabaseStore {
  private recipes: StoredRecipe[] = [];
  private starters: StoredStarter[] = [];
  private logs: StoredBakeLog[] = [];
  private flourInventory: StoredFlourInventoryItem[] = [];
  private initialized = false;

  public init(): void {
    if (this.initialized) return;

    // Load master recipes as defaults
    this.recipes = MASTER_RECIPES.map((preset) => ({
      id: preset.id,
      name: preset.namePl,
      formula: preset.formula,
      targetDDT: preset.targetDDT,
      notes: preset.notesPl,
      isBuiltIn: true,
      createdAt: Date.now(),
    }));

    // Default starter
    this.starters = [
      {
        id: 'starter_default',
        name: 'Zakwas żytni (Bolesław)',
        flourType: 'Żytnia razowa typ 2000',
        hydration: 100.0,
        birthDate: Date.now() - 1000 * 60 * 60 * 24 * 120, // 120 days ago
        storageState: 'FRIDGE',
        lastFedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,  // 3 days ago
      },
    ];

    // Default pantry flour inventory
    this.flourInventory = [
      {
        id: 'flour_inv_wheat_750',
        name: 'Mąka pszenna chlebowa typ 750',
        stockGrams: 2000,
        proteinPct: 12.0,
        updatedAt: Date.now(),
      },
      {
        id: 'flour_inv_rye_2000',
        name: 'Mąka żytnia razowa typ 2000',
        stockGrams: 1500,
        proteinPct: 10.0,
        updatedAt: Date.now(),
      },
      {
        id: 'flour_inv_manitoba',
        name: 'Mąka Manitoba / Forte (W > 350)',
        stockGrams: 1000,
        proteinPct: 14.5,
        updatedAt: Date.now(),
      },
    ];

    this.initialized = true;
  }

  public getRecipes(): StoredRecipe[] {
    this.init();
    return [...this.recipes];
  }

  public getRecipeById(id: string): StoredRecipe | undefined {
    this.init();
    return this.recipes.find((r) => r.id === id);
  }

  public saveRecipe(recipe: StoredRecipe): void {
    this.init();
    const index = this.recipes.findIndex((r) => r.id === recipe.id);
    if (index >= 0) {
      this.recipes[index] = recipe;
    } else {
      this.recipes.push(recipe);
    }
  }

  public getStarters(): StoredStarter[] {
    this.init();
    return [...this.starters];
  }

  public saveStarter(starter: StoredStarter): void {
    this.init();
    const index = this.starters.findIndex((s) => s.id === starter.id);
    if (index >= 0) {
      this.starters[index] = starter;
    } else {
      this.starters.push(starter);
    }
  }

  public recordFeeding(starterId: string): void {
    this.init();
    const s = this.starters.find((item) => item.id === starterId);
    if (s) {
      s.lastFedAt = Date.now();
    }
  }

  public getBakeLogs(): StoredBakeLog[] {
    this.init();
    return [...this.logs];
  }

  public addBakeLog(log: StoredBakeLog): void {
    this.init();
    this.logs.unshift(log);
  }

  public getFlourInventory(): StoredFlourInventoryItem[] {
    this.init();
    return [...this.flourInventory];
  }

  public saveFlourInventoryItem(item: StoredFlourInventoryItem): void {
    this.init();
    const index = this.flourInventory.findIndex((f) => f.id === item.id);
    if (index >= 0) {
      this.flourInventory[index] = item;
    } else {
      this.flourInventory.push(item);
    }
  }

  public deleteFlourInventoryItem(id: string): void {
    this.init();
    this.flourInventory = this.flourInventory.filter((f) => f.id !== id);
  }

  public exportBackupJson(): string {
    this.init();
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        recipes: this.recipes,
        starters: this.starters,
        logs: this.logs,
      },
      null,
      2
    );
  }
}

export const dbStore = new LocalDatabaseStore();
