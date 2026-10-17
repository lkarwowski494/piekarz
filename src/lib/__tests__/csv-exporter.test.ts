import {
  escapeCsvValue,
  exportBakeLogsCsv,
  exportFlourInventoryCsv,
  exportAndShareCsv,
} from '../csv-exporter';
import { StoredBakeLog, StoredFlourInventoryItem } from '../../data/db';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

describe('csv-exporter', () => {
  describe('escapeCsvValue', () => {
    it('returns empty string for null or undefined', () => {
      expect(escapeCsvValue(null)).toBe('');
      expect(escapeCsvValue(undefined)).toBe('');
    });

    it('returns unquoted string when no special characters present', () => {
      expect(escapeCsvValue('Chleb żytni')).toBe('Chleb żytni');
      expect(escapeCsvValue(450)).toBe('450');
    });

    it('wraps and escapes values with commas, quotes, or newlines', () => {
      expect(escapeCsvValue('Chleb, bułka')).toBe('"Chleb, bułka"');
      expect(escapeCsvValue('Opis "mistrzowski"')).toBe('"Opis ""mistrzowski"""');
      expect(escapeCsvValue("Linia 1\nLinia 2")).toBe('"Linia 1\nLinia 2"');
    });

    it('satisfies RD-ENG-10 Formula Injection prevention vectors', () => {
      expect(escapeCsvValue('=SUM(A1:A5)')).toBe("\"'=SUM(A1:A5)\"");
      expect(escapeCsvValue("+cmd|' /C calc'!A0")).toBe("\"'+cmd|' /C calc'!A0\"");
      expect(escapeCsvValue('-12.5')).toBe('-12.5');
      expect(escapeCsvValue('Notatka z "cudzysłowem", przecinkiem')).toBe('"Notatka z ""cudzysłowem"", przecinkiem"');
    });
  });

  describe('exportBakeLogsCsv', () => {
    it('generates valid CSV headers and rows for bake logs', () => {
      const logs: StoredBakeLog[] = [
        {
          id: 'bake_1',
          recipeName: 'Chleb Wiejski',
          startedAt: 1718000000000,
          finishedAt: 1718010000000,
          actualDDT: 24.8,
          ambientTemp: 22.0,
          ratingStars: 5,
          crumbScore: 4,
          crustScore: 5,
          tasteProfile: 'balanced',
          sensoryProfile: {
            crustCrispness: 5,
            crumbElasticity: 4,
            acidity: 3,
            openCrumb: 4,
            caramelization: 5,
          },
          notes: 'Świetny wypiek z parą',
        },
      ];

      const csv = exportBakeLogsCsv(logs);
      const lines = csv.split('\n');

      expect(lines.length).toBe(2);
      expect(lines[0]).toBe(
        'id,started_at,finished_at,recipe_name,actual_ddt,ambient_temp,rating_stars,crumb_score,crust_score,taste_profile,crust_crispness,crumb_elasticity,acidity,open_crumb,caramelization,notes'
      );
      expect(lines[1]).toContain('bake_1');
      expect(lines[1]).toContain('Chleb Wiejski');
      expect(lines[1]).toContain('24.8');
      expect(lines[1]).toContain('Świetny wypiek z parą');
    });

    it('handles empty logs array', () => {
      const csv = exportBakeLogsCsv([]);
      const lines = csv.split('\n');
      expect(lines.length).toBe(1);
      expect(lines[0]).toContain('recipe_name');
    });
  });

  describe('exportFlourInventoryCsv', () => {
    it('generates valid CSV headers and rows for flour inventory', () => {
      const items: StoredFlourInventoryItem[] = [
        {
          id: 'flour_1',
          name: 'Mąka Manitoba Typ 0',
          stockGrams: 2500,
          brand: 'Caputo',
          proteinPct: 14.5,
          updatedAt: 1718000000000,
        },
      ];

      const csv = exportFlourInventoryCsv(items);
      const lines = csv.split('\n');

      expect(lines.length).toBe(2);
      expect(lines[0]).toBe('id,name,stock_grams,brand,protein_pct,updated_at');
      expect(lines[1]).toContain('flour_1');
      expect(lines[1]).toContain('Mąka Manitoba Typ 0');
      expect(lines[1]).toContain('2500');
      expect(lines[1]).toContain('Caputo');
      expect(lines[1]).toContain('14.5');
    });
  });

  describe('exportAndShareCsv', () => {
    it('writes to cache directory, shares, and deletes temporary file', async () => {
      const writeSpy = jest.spyOn(FileSystem, 'writeAsStringAsync').mockResolvedValue(undefined as any);
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined as any);
      const deleteSpy = jest.spyOn(FileSystem, 'deleteAsync').mockResolvedValue(undefined as any);

      const success = await exportAndShareCsv('test.csv', 'col1,col2\nval1,val2', 'Tytuł');

      expect(success).toBe(true);
      expect(writeSpy).toHaveBeenCalled();
      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});
