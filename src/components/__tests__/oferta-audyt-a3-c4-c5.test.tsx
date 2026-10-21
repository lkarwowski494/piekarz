/**
 * Audyt niezależny, ekran zakupu:
 * - A-3 (b): pusta lista produktów (sklep odpowiedział, ale bez produktów — np. przed zatwierdzeniem w App Store
 *   Connect) to nie brak sieci: „Oferta chwilowo niedostępna”, bez prośby o sprawdzenie internetu;
 * - C-5: podwójne stuknięcie „Kup” albo „Przywróć zakupy” wywołuje sklep raz (blokada przed ponownym renderem);
 * - C-4: Ask to Buy (zakup czeka na zgodę, deferred/pending) to nie błąd sieci: komunikat o oczekiwaniu na zgodę
 *   [audyt-niezalezny A-3; audyt-niezalezny C-4; audyt-niezalezny C-5].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../PaywallModal';
import { setLang, t } from '../../lib/i18n';
import { kup } from '../../lib/platnosci/sklep';

const mockIap = (Iap as unknown as { __mock: any }).__mock;

function produkty() {
  mockIap.products = [
    { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '79,99 zł', type: 'in-app' },
  ];
}
function tekst(node: unknown): string {
  const walk = (n: unknown): string => {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (!n || typeof n !== 'object') return '';
    if (Array.isArray(n)) return n.map(walk).join(' ');
    return walk(Reflect.get(n, 'children'));
  };
  return walk(node).replace(/\s+/g, ' ').trim();
}
async function zamontuj(onSubscribe: () => unknown = () => undefined, onRestore: () => unknown = () => false) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<PaywallModal visible onClose={() => undefined} onSubscribe={onSubscribe as never} onRestore={onRestore as never} />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('ekran zakupu: A-3, C-4, C-5', () => {
  beforeEach(() => {
    mockIap.reset();
    setLang('pl');
  });

  it('A-3: the store answers with no products → "Offer temporarily unavailable", not "check the internet"; retry reads again', async () => {
    mockIap.products = [];
    const tree = await zamontuj();
    const txt = tekst(tree.toJSON());
    expect(txt).toContain(t('Oferta chwilowo niedostępna. Spróbuj ponownie za chwilę.'));
    expect(txt).not.toContain('Sprawdź internet');
    expect(tree.root.findAllByProps({ testID: 'offer-no-connection' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'offer-unavailable' }).length).toBeGreaterThan(0);
    produkty();
    await act(async () => {
      tree.root.findByProps({ testID: 'offer-retry-btn' }).props.onPress();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(tekst(tree.toJSON())).toContain('29,99 zł');
    act(() => tree.unmount());
  });

  it('A-3: a failed product read is still "no connection"', async () => {
    mockIap.failProducts = true;
    const tree = await zamontuj();
    expect(tree.root.findAllByProps({ testID: 'offer-no-connection' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('C-5: two taps on "Buy" before re-render call the store once', async () => {
    produkty();
    let wywolania = 0;
    let zwolnij: () => void = () => undefined;
    const tree = await zamontuj(() => {
      wywolania += 1;
      return new Promise<void>((r) => (zwolnij = r));
    });
    const przycisk = tree.root.findByProps({ testID: 'subscribe-submit-btn' });
    await act(async () => {
      void przycisk.props.onPress();
      void przycisk.props.onPress();
    });
    expect(wywolania).toBe(1);
    await act(async () => {
      zwolnij();
    });
    act(() => tree.unmount());
  });

  it('C-5: two taps on "Restore Purchases" call restore once', async () => {
    produkty();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    let wywolania = 0;
    let zwolnij: (v: boolean) => void = () => undefined;
    const tree = await zamontuj(undefined, () => {
      wywolania += 1;
      return new Promise<boolean>((r) => (zwolnij = r));
    });
    const przycisk = tree.root.findByProps({ testID: 'restore-purchases-btn' });
    await act(async () => {
      void przycisk.props.onPress();
      void przycisk.props.onPress();
    });
    expect(wywolania).toBe(1);
    await act(async () => {
      zwolnij(false);
    });
    act(() => tree.unmount());
    jest.restoreAllMocks();
  });

  it('C-4: Ask to Buy (deferred payment) → "waiting for approval", not a network error', async () => {
    produkty();
    mockIap.purchaseError = Object.assign(new Error('deferred'), { code: 'deferred-payment' });
    await expect(kup('yearly')).resolves.toBe('oczekuje');
    mockIap.purchaseError = Object.assign(new Error('pending'), { code: 'pending' });
    await expect(kup('monthly')).resolves.toBe('oczekuje');
    mockIap.purchaseError = null;
    await expect(kup('monthly')).resolves.toBeUndefined();

    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const tree = await zamontuj(() => Promise.resolve('oczekuje'));
    await act(async () => {
      await tree.root.findByProps({ testID: 'subscribe-submit-btn' }).props.onPress();
    });
    expect(alert).toHaveBeenCalledWith(
      t('Zakup czeka na zatwierdzenie'),
      t('Gdy zakup zostanie zatwierdzony, Piekarz Pro włączy się sam. Nie trzeba kupować ponownie.'),
    );
    expect(JSON.stringify(alert.mock.calls)).not.toContain('sprawdź internet');
    alert.mockRestore();
    act(() => tree.unmount());
  });
});
