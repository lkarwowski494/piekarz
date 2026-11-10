/**
 * Brak danych zostaje brakiem [M1-audytor-generalny-026; 08-programista-003; zasada roli 08 nr 9]: karta zakwasu bez
 * dokarmienia nie mówi „przed chwilą”, średnia ocena liczy tylko ocenione wpisy, import receptury ze złą masą,
 * drożdżami poza zakresem albo bez udziału zakwasu daje błąd z nazwą pola zamiast zgadniętej wartości.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { initDatabase, saveStarter, _resetMemStore, deleteStarter, getStarters } from '../data/sqlite-store';
import { calculateBakeStatistics } from '../core/bake-statistics';
import { BakeStatsCard } from '../components/stolnica/BakeStatsCard';
import { decodeRecipeFromShareUrl, exportRecipeToJson } from '../lib/recipe-sharing';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { StoredBakeLog } from '../data/db';

jest.setTimeout(20000);
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return { SafeAreaView: ({ children, style }: { children: unknown; style: unknown }) => R.createElement('View', { style }, children), useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }) };
});
jest.mock('../lib/pdf-sheet-generator', () => ({ exportStarterLabelAsPdf: jest.fn(), printStarterLabelDirectly: jest.fn() }));

function tekst(n: unknown): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n) return '';
  if (Array.isArray(n)) return n.map(tekst).join(' ');
  const o = n as { children?: unknown };
  return o.children ? tekst(o.children) : '';
}

describe('M1-audytor-generalny-026: brak zostaje brakiem', () => {
  it('karta zakwasu bez wpisu dokarmienia nie pokazuje „przed chwilą”', async () => {
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    await saveStarter({ id: 'z1', name: 'Bez karmienia', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP' });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ZakwasScreen />);
    });
    const t = tekst(tree.toJSON());
    expect(t).toContain('Ostatnie dokarmienie');
    expect(t).not.toContain('przed chwilą');
    expect(t).toContain('Ostatnie dokarmienie Brak danych o karmieniu');
    act(() => tree.unmount());
  });

  it('średnia ocena tylko z ocenionych wpisów; same wpisy bez oceny → brak', () => {
    const wpis = (id: string, ratingStars?: number): StoredBakeLog => ({ id, recipeName: 'Chleb', startedAt: 1, ...(ratingStars ? { ratingStars } : {}) });
    expect(calculateBakeStatistics([wpis('a', 1), wpis('b')]).averageRating).toBe(1);
    expect(calculateBakeStatistics([wpis('a'), wpis('b')]).averageRating).toBeNull();
    let karta!: renderer.ReactTestRenderer;
    act(() => {
      karta = renderer.create(<BakeStatsCard stats={calculateBakeStatistics([wpis('a'), wpis('b')])} />);
    });
    expect(tekst(karta.toJSON())).toContain('Średnia ocena Brak ocen');
    act(() => karta.unmount());
  });

  it('import receptury: masa jako tekst, drożdże 12% i brak udziału zakwasu → błąd z nazwą pola', () => {
    const baza = JSON.parse(exportRecipeToJson({ id: 'r1', name: 'Test', isBuiltIn: false, createdAt: 1, targetDDT: 25, formula: { flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 } }));
    const plik = (formula: Record<string, unknown>) => JSON.stringify({ ...baza, recipe: { ...baza.recipe, formula: { ...baza.recipe.formula, ...formula } } });
    expect(decodeRecipeFromShareUrl(plik({}))).toEqual(expect.objectContaining({ success: true }));
    const masa = decodeRecipeFromShareUrl(plik({ targetDoughWeightGrams: '900' }));
    expect(masa).toEqual({ success: false, error: expect.stringContaining('Masa ciasta') });
    const drozdze = decodeRecipeFromShareUrl(plik({ extraYeastPercentage: 12 }));
    expect(drozdze).toEqual({ success: false, error: expect.stringContaining('Udział drożdży') });
    const zakwas = decodeRecipeFromShareUrl(plik({ starterPercentage: undefined }));
    expect(zakwas).toEqual({ success: false, error: expect.stringContaining('Udział zakwasu') });
  });
});
