/**
 * Rada przy za zimnej wodzie (status requires_ice z RD-05, src/core/domain-rules.ts) na ekranie receptury: istniejący
 * komunikat „Obliczona temperatura wody jest bardzo niska. Zastąp część wody lodem.” w tym samym miejscu i wyglądzie
 * co ostrzeżenie o zbyt gorącej wodzie (alert w arkuszu „Temperatura wody”), bez nowego tekstu [M2 D-312; 08-p3-N1].
 * Bez masy lodu (F-53 NIE, brak-lodu.test.tsx).
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
jest.mock('expo-router', () => ({ useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []), useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const text = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(text).join('');
  if (n && typeof n === 'object' && 'children' in n) return text((n as { children: unknown }).children);
  return '';
};

const ZIMNA = 'Obliczona temperatura wody jest bardzo niska. Zastąp część wody lodem.';

/** Arkusz „Temperatura wody”: docelowe DDT obniżone o `minus` kroków po 0,5 °C (25 → 18 °C: 14), temperatura w kuchni `kuchnia` °C. */
async function arkusz(minus: number, kuchnia: number): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<CalculatorScreen />);
  });
  await act(async () => {
    tree!.root.findByProps({ testID: 'water-temp-btn' }).props.onPress();
  });
  for (let i = 0; i < minus; i++) {
    await act(async () => {
      tree!.root.findByProps({ testID: 'ddt-minus-btn' }).props.onPress();
    });
  }
  await act(async () => {
    tree!.root.findAll((n) => n.props?.testID === 'ddt-room-temp-input' && typeof n.props.onChangeNumber === 'function')[0].props.onChangeNumber(kuchnia);
  });
  return tree!;
}

// testID mówi, co sprawdza: alert za zimnej wody ma własny identyfikator, nie „too-hot” [07-przek-4; 08-p3b-N1]
const alertyId = (tree: renderer.ReactTestRenderer, id: string) =>
  tree.root.findAll((n) => typeof n.type === 'string' && n.props?.testID === id && n.props?.accessibilityRole === 'alert');
const alerty = (tree: renderer.ReactTestRenderer) => alertyId(tree, 'ddt-too-cold-warning');

describe('rada przy za zimnej wodzie (08-p3-N1)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });
  afterEach(() => setLang('pl'));

  it('reguła: DDT 18 °C w kuchni 30 °C (z zakwasem) daje wodę poniżej 4 °C i status requires_ice', () => {
    const r = calculateDDTWaterTemp({ targetDDT: 18, flourTemp: 21, roomTemp: 30, starterTemp: 21, frictionFactor: 2 });
    expect(r.status).toBe('requires_ice');
    expect(r.warningMessagePl).toBe(ZIMNA);
  });

  it('woda poniżej 4 °C: arkusz pokazuje istniejący komunikat w alercie, tam gdzie ostrzeżenie o gorącej wodzie', async () => {
    const tree = await arkusz(14, 30);
    const found = alerty(tree);
    expect(found).toHaveLength(1);
    expect(text(found[0])).toBe(ZIMNA);
    expect(alertyId(tree, 'ddt-too-hot-warning')).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('w EN komunikat jest po angielsku', async () => {
    setLang('en');
    const tree = await arkusz(14, 30);
    const found = alerty(tree);
    expect(found).toHaveLength(1);
    expect(text(found[0])).toMatch(/ice/i);
    expect(text(found[0])).not.toContain('Zastąp');
    act(() => tree.unmount());
  });

  it('kontrola: woda w zakresie (DDT 18 °C, kuchnia 22 °C) — bez komunikatu', async () => {
    const tree = await arkusz(14, 22);
    expect(alerty(tree)).toHaveLength(0);
    act(() => tree.unmount());
  });
});
