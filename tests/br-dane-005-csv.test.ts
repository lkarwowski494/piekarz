/**
 * BR-DANE-005: eksport historii wypieków do CSV [M1-audytor-generalny-035; 01-odkrywanie-006].
 */
import * as FileSystem from 'expo-file-system/legacy';
import { exportAndShareCsv, exportBakeLogsCsv } from '../src/lib/csv-exporter';
import type { StoredBakeLog } from '../src/data/db';
import { BASIC } from '../src/lib/platnosci/konfiguracja';

const KOLUMNY = 'id,started_at,finished_at,recipe_name,actual_ddt,ambient_temp,rating_stars,crumb_score,crust_score,taste_profile,crust_crispness,crumb_elasticity,acidity,open_crumb,caramelization,notes';
const wpis = (o: Partial<StoredBakeLog>): StoredBakeLog => ({ id: 'b1', recipeName: 'Mój chleb', startedAt: Date.UTC(2026, 10, 9, 8), finishedAt: Date.UTC(2026, 10, 9, 14), ratingStars: 4, ...o }) as StoredBakeLog;

describe('BR-DANE-005: eksport historii wypieków do CSV', () => {
  it('Plik CSV z dziennika: nagłówek kolumn, przecinek, daty ISO 8601, wiersz na wpis', () => {
    const csv = exportBakeLogsCsv([wpis({}), wpis({ id: 'b2' })]).split('\n');
    expect(csv[0]).toBe(KOLUMNY);
    expect(csv).toHaveLength(3);
    expect(csv[1].startsWith('b1,2026-11-09T08:00:00.000Z,2026-11-09T14:00:00.000Z,')).toBe(true);
  });
  it('Pusty dziennik: tylko nagłówek', () => {
    expect(exportBakeLogsCsv([])).toBe(KOLUMNY);
  });
  it('Tekst użytkownika w komórce: cudzysłów RFC 4180 i apostrof przed znakiem formuły', () => {
    const csv = exportBakeLogsCsv([wpis({ notes: '=HYPERLINK("x"), a' })]);
    expect(csv).toContain('"\'=HYPERLINK(""x""), a"');
  });
  it('plik w UTF-8 z BOM (polskie znaki w arkuszu)', async () => {
    const zapis = jest.spyOn(FileSystem, 'writeAsStringAsync').mockResolvedValue(undefined as never);
    await exportAndShareCsv('piekarz-historia-wypiekow-2026-11-09.csv', KOLUMNY);
    expect(zapis.mock.calls[0][1]).toBe(`﻿${KOLUMNY}`);
    zapis.mockRestore();
  });
  it('Bez Pro: eksport danych jest w Basic (D-112)', () => {
    expect(BASIC).toContain('dane');
  });
});
