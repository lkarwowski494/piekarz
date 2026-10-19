/**
 * Dostęp płatny wyłącznie z transakcji StoreKit [M1-audytor-generalny-008; 02-monetyzacja-001,
 * 01-odkrywanie-001, 03-zakres-005, 05-architekt-004, 08-programista-007, 07-jakosc-009, 10-wydanie-002].
 * Zastępuje testy, które utrwalały symulację (zakup = zapis poziomu w SQLite).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import { useAppAccess } from '../app-access';
import { _resetStanu } from '../platnosci/stan';
import { _resetMemStore, resetAppAccess, setAppSetting } from '../../data/sqlite-store';

const mockIap = (Iap as unknown as { __mock: any }).__mock;
const DAY = 24 * 60 * 60 * 1000;
const LIFETIME = 'com.apps4brew.baker.pro.lifetime';
const YEARLY = 'com.apps4brew.baker.pro.yearly';

type Api = ReturnType<typeof useAppAccess>;
let api: Api | null = null;
function Harness() {
  api = useAppAccess();
  return null;
}

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function mount(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<Harness />);
  });
  await flush();
  return tree!;
}

function canRun(): boolean {
  const fn = jest.fn();
  let result = false;
  act(() => {
    result = api!.requireActionAccess(fn);
  });
  return result && fn.mock.calls.length === 1;
}

describe('Access comes only from StoreKit transactions (008)', () => {
  beforeEach(async () => {
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    // Lokalny okres próbny już minął: dostęp może dać tylko sklep.
    await resetAppAccess({ trialStartedAt: Date.now() - 60 * DAY, trialDays: 14 });
  });

  it('subscribe without a store transaction does not grant access', async () => {
    const tree = await mount();
    await act(async () => {
      await api!.subscribe('lifetime');
    });
    await flush();
    expect(canRun()).toBe(false);
    act(() => tree.unmount());
  });

  it('subscribe opens the App Store purchase sheet for the chosen product', async () => {
    const tree = await mount();
    await act(async () => {
      await api!.subscribe('lifetime');
      await api!.subscribe('yearly');
    });
    expect(mockIap.requests).toEqual([
      { type: 'in-app', request: { apple: { sku: LIFETIME } } },
      { type: 'subs', request: { apple: { sku: YEARLY } } },
    ]);
    act(() => tree.unmount());
  });

  it('a database tier written by the old simulation does not grant access', async () => {
    await resetAppAccess({ trialStartedAt: Date.now() - 60 * DAY, trialDays: 14, subscriptionTier: 'lifetime' });
    const tree = await mount();
    expect(canRun()).toBe(false);
    act(() => tree.unmount());
  });

  it('reinstall: empty database and a lifetime entitlement in the store gives access', async () => {
    mockIap.entitlements = [
      { id: 't1', transactionId: 't1', productId: LIFETIME, purchaseState: 'purchased', transactionDate: 1, platform: 'ios' },
    ];
    const tree = await mount();
    expect(canRun()).toBe(true);
    expect(mockIap.readOptions).toContainEqual({ onlyIncludeActiveItemsIOS: true });
    act(() => tree.unmount());
  });

  it('restore without any purchase gives no access and asks the store to sync', async () => {
    const tree = await mount();
    let restored: boolean | void = true;
    await act(async () => {
      restored = await api!.restorePurchases();
    });
    expect(restored).toBe(false);
    expect(mockIap.restoreCalls).toBe(1);
    expect(canRun()).toBe(false);
    act(() => tree.unmount());
  });

  it('store read error uses the last store read, but not after the paid period ends', async () => {
    mockIap.failRead = true;
    await setAppSetting('platnosci_pamiec', JSON.stringify({ produkty: [YEARLY], wygasa: Date.now() + 5 * DAY }));
    let tree = await mount();
    expect(canRun()).toBe(true);
    act(() => tree.unmount());

    _resetStanu();
    await setAppSetting('platnosci_pamiec', JSON.stringify({ produkty: [YEARLY], wygasa: Date.now() - 1 }));
    tree = await mount();
    expect(canRun()).toBe(false);
    act(() => tree.unmount());
  });
});
