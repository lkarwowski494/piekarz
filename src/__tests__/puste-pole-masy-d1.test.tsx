/**
 * Audyt niezależny D-1: wyczyszczenie pola „Masa bochenka” (albo „Masa mąki”) i wyjście z pola wywracało
 * ekran receptury (NumInput wysyłał 0 przed sprawdzeniem `min`, rachunek rzucał wyjątek w useMemo).
 * (a) puste pole przy wyjściu wraca do poprzedniej wartości; (b) `obliczRecepture` przy masie ≤ 0 zwraca
 * błąd walidacji zamiast wyjątku [audyt-niezalezny D-1].
 */
import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { clearPendingRecipeToLoad } from '../lib/recipe-navigation';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { NumInput } from '../components/NumInput';
import { obliczRecepture } from '../core/domain-rules';

jest.setTimeout(20000);

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), setParams: jest.fn() }),
    useLocalSearchParams: () => ({}),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const el = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
  if (!el) throw new Error(`brak ${id}`);
  await act(async () => {
    el.props.onPress();
  });
};
const wyczysc = async (root: renderer.ReactTestInstance, id: string) => {
  const pole = host(root, id)[0];
  if (!pole) throw new Error(`brak pola ${id}`);
  await act(async () => {
    pole.props.onFocus?.();
    pole.props.onChangeText('');
  });
  await act(async () => {
    host(root, id)[0].props.onBlur?.({});
  });
};

describe('D-1: puste pole masy nie wywraca ekranu receptury', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    clearPendingRecipeToLoad();
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('cleared "Loaf Weight" goes back to the previous value, the screen keeps the total', async () => {
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    const przed = tekst(host(tree!.root, 'recipe-total')[0]);
    const wartoscPrzed = host(tree!.root, 'loaf-weight-input')[0].props.value;
    await wyczysc(tree!.root, 'loaf-weight-input');
    expect(host(tree!.root, 'recipe-total')).toHaveLength(1);
    expect(tekst(host(tree!.root, 'recipe-total')[0])).toBe(przed);
    expect(host(tree!.root, 'loaf-weight-input')[0].props.value).toBe(wartoscPrzed);
  });

  it('cleared "Flour Weight" goes back to the previous value', async () => {
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await nacisnij(tree!.root, 'edit-ingredients-btn');
    await nacisnij(tree!.root, 'calc-mode-flour');
    const przed = tekst(host(tree!.root, 'recipe-total')[0]);
    await wyczysc(tree!.root, 'flour-weight-input');
    expect(tekst(host(tree!.root, 'recipe-total')[0])).toBe(przed);
  });

  it('NumInput with min > 0: empty field on blur restores the previous value and sends nothing', () => {
    const onChangeNumber = jest.fn();
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<NumInput value={800} min={50} onChangeNumber={onChangeNumber} />);
    });
    const pole = t.root.findByType(TextInput);
    act(() => pole.props.onFocus?.());
    act(() => pole.props.onChangeText('  '));
    act(() => t.root.findByType(TextInput).props.onBlur({}));
    expect(onChangeNumber).not.toHaveBeenCalled();
    expect(t.root.findByType(TextInput).props.value).toBe('800');
  });

  it('NumInput without min: empty field still means 0 (hour, minute)', () => {
    const onChangeNumber = jest.fn();
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<NumInput value={7} onChangeNumber={onChangeNumber} />);
    });
    act(() => t.root.findByType(TextInput).props.onChangeText(''));
    act(() => t.root.findByType(TextInput).props.onBlur({}));
    expect(onChangeNumber).toHaveBeenCalledWith(0);
  });

  it('obliczRecepture: dough weight 0 or NaN is a validation error, not an exception', () => {
    const wejscie = { flours: [{ name: 'Mąka', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20 };
    for (const masa of [0, -5, Number.NaN]) {
      const r = obliczRecepture({ ...wejscie, targetDoughWeightGrams: masa });
      expect(r.bladMasy).toBe(true);
      expect(r.wynik.targetDoughWeightGrams).toBe(0);
      expect(r.wynik.flours).toEqual([{ name: 'Mąka', percentage: 100, weightGrams: 0 }]);
    }
    expect(obliczRecepture({ ...wejscie, targetDoughWeightGrams: 1000 }).bladMasy).toBe(false);
  });
});
