// ============================================================================
// Piekarz — migracja v7: wersja wypieku w Dzienniku, bakes.leaven (D-242 Z3 a, D-154, OP-62) [M3 p9b]
// Samo ADD COLUMN w transakcji runnera (bez przebudowy tabeli, bez kaskady); stare wpisy NULL = brak (sprzed p9).
// Lista w CHECK = typ Leaven w db.ts (test p9b-wersja-wypieku). Wydanej migracji się nie edytuje.
// p9b-2 (D-260): w tej samej migracji bakes.bake_method (metoda „piekarnik / maszyna”, NULL dla starych wpisów); v7 nie
// wyszła w żadnym buildzie (1021, 1022 = v6), więc to nie edycja wydanej migracji. Lista w CHECK = BakeMethod (db.ts).
// ============================================================================

import type { SchemaMigration } from './sqlite-schema';

export const MIGRACJA_V7: SchemaMigration = {
  version: 7,
  description: 'Bake leaven (sourdough or yeast) and bake method (oven or bread machine) in bake log',
  run: async (db) => {
    const kol = await db.getAllAsync<{ name: string }>('PRAGMA table_info(bakes);');
    if (!kol.some((c) => c.name === 'leaven')) {
      await db.execAsync("ALTER TABLE bakes ADD COLUMN leaven TEXT CHECK (leaven IS NULL OR leaven IN ('sourdough', 'yeast'));");
    }
    if (!kol.some((c) => c.name === 'bake_method')) {
      await db.execAsync("ALTER TABLE bakes ADD COLUMN bake_method TEXT CHECK (bake_method IS NULL OR bake_method IN ('piekarnik', 'maszyna'));");
    }
  },
};
