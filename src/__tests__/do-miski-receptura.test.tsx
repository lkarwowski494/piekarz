/**
 * Karta „Do miski na wagę” opisuje składniki danymi receptury, nie stałymi: procent soli z receptury,
 * wiersz zakwasu tylko przy zakwasie > 0 g [M1-audytor-generalny-059; 04-studio-projektowe-013].
 * Pizza Napoletana: sól 2,8%, zakwas 0%, drożdże 0,08% (src/recipes/presets.ts).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import { MASTER_RECIPES } from '../recipes/presets';
import { setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';

jest.setTimeout(20000);
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));
jest.mock('expo-router', () => ({ /* M3 D10: ekran z pasem ustawia pasek stanu przy focusie */ useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []), useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const text = (n: any): string =>
  typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(text).join('') : n?.props?.children ? text(n.props.children) : '';

const row = (tree: renderer.ReactTestRenderer, id: string) =>
  tree.root.findAll((n) => typeof n.type === 'string' && n.props?.testID === id);

async function renderWith(presetId: string) {
  const preset = MASTER_RECIPES.find((p) => p.id === presetId)!;
  setPendingRecipeToLoad({ id: preset.id, name: preset.namePl, formula: preset.formula, targetDDT: preset.targetDDT });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<CalculatorScreen />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

describe('karta Do miski a dane receptury', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });

  it('pizza: procent soli z receptury (2.8%), bez wiersza zakwasu przy 0 g', async () => {
    const tree = await renderWith('pizza_napoletana_48h');
    const [salt] = row(tree, 'scale-item-salt');
    expect(text(salt)).toContain('2,8%'); // PL: przecinek dziesiętny [M1-audytor-generalny-070]
    expect(text(salt)).not.toContain('2,0%');
    expect(row(tree, 'scale-item-starter')).toHaveLength(0);
    act(() => tree.unmount());
  });

  // [M1-audytor-generalny-092] drożdże z receptury trafiają do obliczeń i do listy ważenia
  // 217: pizza 0,4% drożdży świeżych ze źródła (DRO-PIZ-002), wcześniej 0,08% bez źródła
  it('pizza: wiersz drożdży z masą z kalkulatora (0.4% → 2.4 g)', async () => {
    const tree = await renderWith('pizza_napoletana_48h');
    const yeast = row(tree, 'scale-item-yeast');
    expect(yeast).toHaveLength(1);
    expect(text(yeast[0])).toMatch(/2[.,]4 g/);
    act(() => tree.unmount());
  });

  it('receptura bez drożdży nie ma wiersza drożdży', async () => {
    const preset = MASTER_RECIPES.find((p) => !p.formula.extraYeastPercentage)!;
    const tree = await renderWith(preset.id);
    expect(row(tree, 'scale-item-yeast')).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('receptura na zakwasie pokazuje wiersz zakwasu i swój procent soli', async () => {
    const preset = MASTER_RECIPES.find((p) => p.formula.starterPercentage > 0)!;
    const tree = await renderWith(preset.id);
    expect(row(tree, 'scale-item-starter')).toHaveLength(1);
    expect(text(row(tree, 'scale-item-salt')[0])).toContain(`${preset.formula.saltPercentage.toFixed(1).replace('.', ',')}%`);
    act(() => tree.unmount());
  });
});
