/**
 * Receptura z sumą mąk ≠ 100% (np. 33,3 + 33,3 + 33,3 = 99,9% z kopii) nie wywraca ekranu receptury
 * [M1-audytor-generalny-150; 08-programista-502]: rachunek z walidacją zwraca błąd zamiast wyjątku, import kopii
 * normalizuje sumę jak import JSON (95–105%) albo zostawia proporcje bez zmian (N-8), a ekran pokazuje komunikat.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import { setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { obliczRecepture, normalizujMaki, TOLERANCJA_SUMY_MAK } from '../core/domain-rules';
import { parseRecipeRow } from '../data/row-parsers';

jest.setTimeout(20000);
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));
jest.mock('expo-router', () => ({ /* M3 D10: ekran z pasem ustawia pasek stanu przy focusie */ useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []), useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const TRZY = [
  { name: 'Pszenna 750', percentage: 33.3 },
  { name: 'Żytnia 2000', percentage: 33.3 },
  { name: 'Orkiszowa', percentage: 33.3 },
];
const formula = (flours: typeof TRZY) => ({ flours, waterPercentage: 70, starterPercentage: 20, saltPercentage: 2, starterHydration: 100, targetDoughWeightGrams: 900 });
const suma = (f: Array<{ percentage: number }>) => f.reduce((s, x) => s + x.percentage, 0);

describe('150: suma mąk różna od 100%', () => {
  it('obliczRecepture: 99,9% liczy się jak 100% bez błędu; 80% daje błąd walidacji zamiast wyjątku', () => {
    const ok = obliczRecepture(formula(TRZY));
    expect(ok.blad).toBeNull();
    expect(Math.abs(suma(ok.wynik.flours) - 100)).toBeLessThan(0.01);
    const zle = obliczRecepture(formula([{ name: 'A', percentage: 50 }, { name: 'B', percentage: 30 }]));
    expect(zle.blad).toEqual({ sumaMak: 80 });
    expect(zle.wynik.targetDoughWeightGrams).toBe(900);
  });

  it('normalizujMaki: 95–105% do równych 100%, poza zakresem null (jak import JSON)', () => {
    const n = normalizujMaki(TRZY);
    expect(n).not.toBeNull();
    expect(Math.abs(suma(n ?? []) - 100)).toBeLessThan(1e-9);
    expect(normalizujMaki([{ name: 'A', percentage: 80 }])).toBeNull();
    // Ta sama tolerancja co import JSON receptury (recipe-sharing.ts)
    expect(TOLERANCJA_SUMY_MAK).toEqual([95, 105]);
    expect(normalizujMaki([{ name: 'A', percentage: 95 }])).not.toBeNull();
    expect(normalizujMaki([{ name: 'A', percentage: 105.1 }])).toBeNull();
  });

  // Do N-8 wiersz z sumą 80% był pomijany (utrata receptury przy imporcie kopii); teraz zostaje bez zmian
  // proporcji, a ekran pokazuje komunikat o sumie mąk [reaudit-noc N-8]
  it('import kopii: receptura z sumą 99,9% ma po wczytaniu sumę 100%; z sumą 80% zostaje z proporcjami bez zmian', () => {
    const wiersz = (flours: typeof TRZY) => ({ id: 'r1', name: 'Trzy mąki', formula: formula(flours), targetDDT: 25, createdAt: 1 });
    const r = parseRecipeRow(wiersz(TRZY));
    expect(r).not.toBeNull();
    expect(Math.abs(suma(r?.formula.flours ?? []) - 100)).toBeLessThan(0.01);
    const zla = parseRecipeRow(wiersz([{ name: 'A', percentage: 50 }, { name: 'B', percentage: 30 }]));
    expect(zla?.formula.flours).toEqual([{ name: 'A', percentage: 50 }, { name: 'B', percentage: 30 }]);
  });

  describe('ekran receptury', () => {
    beforeEach(async () => {
      zUprawnieniem();
      _resetMemStore();
      setActiveBake(null);
      await initDatabase();
    });

    async function otworz(flours: typeof TRZY) {
      setPendingRecipeToLoad({ id: 'r1', name: 'Trzy mąki', formula: formula(flours), targetDDT: 25 });
      let tree: renderer.ReactTestRenderer | null = null;
      await act(async () => {
        tree = renderer.create(<CalculatorScreen />);
      });
      await act(async () => {
        await Promise.resolve();
      });
      return tree as unknown as renderer.ReactTestRenderer;
    }

    it('receptura 33,3 × 3 otwiera się bez wywrotki i bez komunikatu', async () => {
      const tree = await otworz(TRZY);
      expect(tree.root.findAll((n) => n.props?.testID === 'receptura-blad-mak')).toHaveLength(0);
      act(() => tree.unmount());
    });

    it('receptura z sumą 80% otwiera się z komunikatem o sumie mąk zamiast wywrotki', async () => {
      const tree = await otworz([{ name: 'A', percentage: 50 }, { name: 'B', percentage: 30 }]);
      const blad = tree.root.findAll((n) => typeof n.type === 'string' && n.props?.testID === 'receptura-blad-mak');
      expect(blad.length).toBe(1);
      expect(JSON.stringify(blad[0].props.children)).toContain('80');
      act(() => tree.unmount());
    });
  });
});
