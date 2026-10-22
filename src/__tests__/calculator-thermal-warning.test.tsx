/**
 * Kalkulator ostrzega, gdy wyliczona temperatura wody przekracza 45 °C (status too_hot_danger z RD-05)
 * [M1-audytor-generalny-039; 07-jakosc-003]. Próg z reguły domenowej (BR-KALK-004); źródło progu: OP-08 [DO USTALENIA].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import { calculateDDTWaterTemp } from '../core/domain-rules';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { setLang } from '../lib/i18n';

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
  typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(text).join('') : n?.props?.children ? text(n.props.children) : n?.children ? text(n.children) : '';

async function renderWithDdt(steps: number) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<CalculatorScreen />);
  });
  // Temperatura wody: akcja receptury „Temperatura wody” i jej arkusz (057) [M1-audytor-generalny-057]
  await act(async () => {
    tree!.root.findByProps({ testID: 'water-temp-btn' }).props.onPress();
  });
  for (let i = 0; i < steps; i++) {
    await act(async () => {
      tree!.root.findByProps({ testID: 'ddt-plus-btn' }).props.onPress();
    });
  }
  return tree!;
}

const alerts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll(
    (n) => typeof n.type === 'string' && n.props?.testID === 'ddt-too-hot-warning' && n.props?.accessibilityRole === 'alert',
  );

describe('ostrzeżenie o zbyt gorącej wodzie', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });
  afterEach(() => setLang('pl'));

  it('reguła: woda > 45 °C daje status too_hot_danger', () => {
    expect(calculateDDTWaterTemp({ targetDDT: 32, flourTemp: 21, roomTemp: 22, starterTemp: 21, frictionFactor: 2 }).status).toBe('too_hot_danger');
  });

  it('przy wartościach domyślnych (woda poniżej 45 °C) nie ma ostrzeżenia', async () => {
    const tree = await renderWithDdt(0);
    expect(alerts(tree)).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('po podniesieniu DDT do 32 °C ekran pokazuje alert z ostrzeżeniem', async () => {
    const tree = await renderWithDdt(14);
    const found = alerts(tree);
    expect(found).toHaveLength(1);
    expect(text(found[0])).toContain('przekracza 45°C');
    act(() => tree.unmount());
  });

  it('w EN ostrzeżenie jest po angielsku', async () => {
    setLang('en');
    const tree = await renderWithDdt(14);
    const found = alerts(tree);
    expect(found).toHaveLength(1);
    expect(text(found[0])).toMatch(/exceeds 45/);
    act(() => tree.unmount());
  });
});
