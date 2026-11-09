/**
 * Koniec wypieku odlicza mąkę także z zapasu zapisanego pod nazwą sprzed kanonu D-307 i odwrotnie
 * [M1-audytor-generalny-041; 06-tresci-006; przegląd ścieżki danych M2 2026-11-09, P2]. Bez migracji: zapisane nazwy zostają.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());
import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import { znajdzZapasMaki } from '../../core/inventory';
import { FLOUR_PROFILES, toTenProfil } from '../../core/flour-atlas';

const DAWNA = 'Mąka pszenna chlebowa typ 750';
const NOWA = 'Mąka pszenna typ 750 (chlebowa)';
const log = { id: 'bake_041', recipeName: 'X', startedAt: 1, finishedAt: 2, ratingStars: 5 };

describe('041: zapas mąki pod dawną nazwą', () => {
  it.each([
    [DAWNA, NOWA],
    [NOWA, DAWNA],
  ])('zapas „%s”, receptura „%s” → koniec wypieku odlicza 400 g', async (zapas, wRecepturze) => {
    useTempDbDir();
    const app = restartApp();
    await app.schema.initDatabase();
    const flourStore = require('../flour-store');
    const db = await app.schema.getDb();
    await flourStore.writeFlourRow(db, { id: 'f1', name: zapas, stockGrams: 2000, updatedAt: 1 });
    expect(await app.store.finishBake(log, [{ name: wRecepturze, weightGrams: 400 }], {})).toBe('zapisano');
    const po = (await flourStore.getFlourInventory()).find((f: { id: string }) => f.id === 'f1');
    expect(po.stockGrams).toBe(1600);
    expect(po.name).toBe(zapas); // nazwa zapisana przez użytkownika się nie zmienia
  });

  it('znajdzZapasMaki: dokładna nazwa, dawna nazwa kanonu; inna mąka nie pasuje (bez dopasowania rozmytego)', () => {
    const zapasy = [
      { id: 'a', name: DAWNA, stockGrams: 1, updatedAt: 1 },
      { id: 'b', name: 'Mąka kukurydziana', stockGrams: 1, updatedAt: 1 },
    ];
    expect(znajdzZapasMaki(zapasy, NOWA)?.id).toBe('a');
    expect(znajdzZapasMaki(zapasy, ' mąka kukurydziana ')?.id).toBe('b');
    expect(znajdzZapasMaki(zapasy, 'Mąka orkiszowa typ 630')).toBeUndefined();
    expect(znajdzZapasMaki([zapasy[1]], NOWA)).toBeUndefined();
  });

  it('toTenProfil: mąka pod dawną nazwą to już ten profil — edytor nie proponuje jej drugi raz', () => {
    const p750 = FLOUR_PROFILES.find((p) => p.id === 'wheat_750')!;
    expect(toTenProfil({ name: DAWNA, type: 'pszenna_750' }, p750)).toBe(true);
    expect(toTenProfil({ name: NOWA }, p750)).toBe(true);
    expect(toTenProfil({ name: 'x', type: 'wheat_750' }, p750)).toBe(true);
    expect(toTenProfil({ name: 'Mąka kukurydziana' }, p750)).toBe(false);
  });
});
