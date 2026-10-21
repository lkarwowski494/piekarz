/**
 * Ekran zakupu przy dużym tekście (AX5, fontScale ≥ 2): przypięty zostaje tylko przycisk główny, a „Przywróć zakupy”
 * i linki prawne są na końcu przewijanej treści, więc pasek nie zajmuje połowy ekranu; przy zwykłym tekście
 * jak w makiecie (wszystko w pasku) [M1-audytor-generalny-200; 04-studio-projektowe-608].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ScrollView } from 'react-native';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../PaywallModal';
import { setLang } from '../../lib/i18n';

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 320, height: 568, scale: 2, fontScale: mockFontScale }),
}));

const mockIap = (Iap as unknown as { __mock: any }).__mock;

async function zamontuj(): Promise<renderer.ReactTestRenderer> {
  mockIap.products = [
    { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '79,99 zł', type: 'in-app' },
  ];
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<PaywallModal visible={true} onClose={() => undefined} onSubscribe={(() => undefined) as never} onRestore={() => false} />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

function wScrollView(n: renderer.ReactTestInstance): boolean {
  for (let p: renderer.ReactTestInstance | null = n.parent; p; p = p.parent) if (p.type === ScrollView) return true;
  return false;
}
const LINKI = ['restore-purchases-btn', 'terms-of-use-btn', 'privacy-policy-btn'];

describe('200: pasek ekranu zakupu przy AX5', () => {
  beforeEach(() => {
    mockIap.reset();
    setLang('pl');
  });
  afterEach(() => {
    mockFontScale = 1;
  });

  it('AX5 (fontScale 3,1): przycisk główny przypięty, linki w przewijanej treści', async () => {
    mockFontScale = 3.1;
    const tree = await zamontuj();
    expect(wScrollView(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe(false);
    for (const id of LINKI) expect([id, wScrollView(tree.root.findByProps({ testID: id }))]).toEqual([id, true]);
    act(() => tree.unmount());
  });

  it('tekst domyślny: przycisk i linki w pasku, jak w makiecie', async () => {
    mockFontScale = 1;
    const tree = await zamontuj();
    expect(wScrollView(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe(false);
    for (const id of LINKI) expect([id, wScrollView(tree.root.findByProps({ testID: id }))]).toEqual([id, false]);
    act(() => tree.unmount());
  });
});
