/**
 * „Przywróć zakupy” na ekranie zakupu i w Ustawieniach (MON-03) [M1-audytor-generalny-010; 02-monetyzacja-003].
 * Synchronizacja ze sklepem (AppStore.sync przez restorePurchases adaptera) tylko na wyraźne żądanie,
 * potem bieżące uprawnienia. Atrapa: restorePurchases w expo-iap „przynosi” transakcję ze sklepu.
 * Scenariusz po ponownej instalacji na urządzeniu (sandbox) to krok właściciela.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import * as Iap from 'expo-iap';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { SettingsModal } from '../components/SettingsModal';
import { PaywallModal } from '../components/PaywallModal';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { pobierzStan } from '../lib/platnosci/stan';
import { przywrocZakupy } from '../lib/app-access';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { t } from '../lib/i18n';
import { bezUprawnienia, mockIap } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const dozywotni = { id: 'tx_life', transactionId: 'tx_life', productId: PRODUKTY.lifetime, purchaseState: 'purchased', transactionDate: 1, platform: 'ios' };
const restoreMock = Iap.restorePurchases as jest.Mock;
const oryginal = restoreMock.getMockImplementation();
// Co przyniesie synchronizacja ze sklepem w danym teście.
let poSynchronizacji: 'brak' | 'dozywotni' | 'blad' = 'brak';
const sklepPrzywraca = () => {
  poSynchronizacji = 'dozywotni';
};

async function mount(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}

async function press(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect({ testID, count: all.length }).toEqual({ testID, count: 1 });
  await act(async () => {
    await all[0].props.onPress();
  });
  await flush();
}

describe('Restore purchases only on request, from the purchase screen and from Settings (010)', () => {
  let alert: jest.SpyInstance;
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    poSynchronizacji = 'brak';
    restoreMock.mockImplementation(async () => {
      mockIap.restoreCalls += 1;
      if (poSynchronizacji === 'blad') throw new Error('network-error');
      if (poSynchronizacji === 'dozywotni') mockIap.entitlements = [{ ...dozywotni }];
    });
  });
  afterEach(() => {
    alert.mockRestore();
    restoreMock.mockImplementation(oryginal);
  });

  it('Settings: empty database and an entitlement in the store gives access after restore', async () => {
    const tree = await mount(<SettingsModal visible={true} onClose={() => undefined} />);
    expect(mockIap.restoreCalls).toBe(0); // bez synchronizacji przy starcie
    expect(pobierzStan().decyzja.dostep).toBe(false);
    sklepPrzywraca();
    await press(tree, 'settings-restore-purchases-btn');
    expect(mockIap.restoreCalls).toBe(1);
    expect(pobierzStan().decyzja.dostep).toBe(true);
    expect(alert).toHaveBeenCalledWith(t('Przywróć zakupy'), t('Zakupy zostały pomyślnie przywrócone'));
    act(() => tree.unmount());
  });

  it('Settings: no transaction in the store shows a message and gives no access', async () => {
    const tree = await mount(<SettingsModal visible={true} onClose={() => undefined} />);
    await press(tree, 'settings-restore-purchases-btn');
    expect(mockIap.restoreCalls).toBe(1);
    expect(pobierzStan().decyzja.dostep).toBe(false);
    expect(alert).toHaveBeenCalledWith(t('Przywróć zakupy'), t('Nie znaleziono aktywnych zakupów'));
    act(() => tree.unmount());
  });

  it('purchase screen: restore with an entitlement in the store gives access and closes the screen', async () => {
    const tree = await mount(<></>);
    await act(async () => {
      ustawEkranZakupu(true);
    });
    sklepPrzywraca();
    await press(tree, 'restore-purchases-btn');
    expect(pobierzStan().decyzja.dostep).toBe(true);
    expect(tree.root.findByType(PaywallModal).props.visible).toBe(false);
    act(() => tree.unmount());
  });

  it('purchase screen: restore without a transaction keeps the screen open and gives no access', async () => {
    const tree = await mount(<></>);
    await act(async () => {
      ustawEkranZakupu(true);
    });
    await press(tree, 'restore-purchases-btn');
    expect(pobierzStan().decyzja.dostep).toBe(false);
    expect(alert).toHaveBeenCalledWith(t('Przywróć zakupy'), t('Nie znaleziono aktywnych zakupów'));
    expect(tree.root.findByType(PaywallModal).props.visible).toBe(true);
    act(() => tree.unmount());
  });

  it('przywrocZakupy syncs with the store once and returns access only for a store entitlement', async () => {
    expect(await przywrocZakupy()).toBe(false);
    sklepPrzywraca();
    expect(await przywrocZakupy()).toBe(true);
    expect(mockIap.restoreCalls).toBe(2);
  });

  it('a store error during restore is not a missing purchase: no access is granted and the user is told', async () => {
    const tree = await mount(<SettingsModal visible={true} onClose={() => undefined} />);
    poSynchronizacji = 'blad';
    await press(tree, 'settings-restore-purchases-btn');
    expect(pobierzStan().decyzja.dostep).toBe(false);
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(t('Przywróć zakupy'), t('Nie udało się połączyć z App Store. Spróbuj ponownie.'));
    act(() => tree.unmount());
  });
});
