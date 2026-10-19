import { parseBakeRow, parseStarterRow, parseRecipeRow, parseRows } from '../row-parsers';

// [M1-audytor-generalny-022] wiersze kopii: wymagane pole złe → pominięty; opcjonalne złe → puste
describe('row parsers for backup and database rows (022)', () => {
  it('parseBakeRow keeps valid fields, drops invalid optional ones and rejects rows without required ones', () => {
    expect(parseBakeRow({ id: 'b', recipeName: 'Chleb', startedAt: 1, ratingStars: 4, tasteProfile: 'sour' })).toEqual(
      expect.objectContaining({ id: 'b', ratingStars: 4, tasteProfile: 'sour' })
    );
    const loose = parseBakeRow({ id: 'b', recipeName: 'Chleb', startedAt: 1, ambientTemp: '22', tasteProfile: 'słony', sensoryProfile: { acidity: 1 } });
    expect(loose?.ambientTemp).toBeUndefined();
    expect(loose?.tasteProfile).toBeUndefined();
    expect(loose?.sensoryProfile).toBeUndefined();
    expect(parseBakeRow({ id: 'b', startedAt: 1 })).toBeNull();
    expect(parseBakeRow('wiersz')).toBeNull();
  });

  it('parseStarterRow requires the storage state from the allowed set', () => {
    const s = { id: 's', name: 'Zakwas', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' };
    expect(parseStarterRow(s)).toEqual(expect.objectContaining({ id: 's', storageState: 'FRIDGE' }));
    expect(parseStarterRow({ ...s, storageState: 'FREEZER' })).toBeNull();
    expect(parseStarterRow({ ...s, hydration: null })).toBeNull();
  });

  it('parseRecipeRow requires a valid formula; parseRows counts skipped rows', () => {
    const formula = { flours: [{ name: 'M', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };
    const ok = { id: 'r', name: 'R', formula, targetDDT: 25, createdAt: 1, isBuiltIn: true };
    expect(parseRecipeRow(ok)).toEqual(expect.objectContaining({ id: 'r', isBuiltIn: true }));
    expect(parseRecipeRow({ ...ok, formula: 'zepsute' })).toBeNull();
    expect(parseRows([ok, { ...ok, formula: {} }, ok], parseRecipeRow)).toEqual({ rows: [expect.objectContaining({ id: 'r' }), expect.objectContaining({ id: 'r' })], skipped: 1 });
  });
});
