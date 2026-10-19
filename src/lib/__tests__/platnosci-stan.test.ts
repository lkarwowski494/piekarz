/**
 * Nasłuch transakcji od startu i kolejność zapis pamięci → finishTransaction (MON-04)
 * [M1-audytor-generalny-008; 02-monetyzacja-001].
 */
import * as Iap from 'expo-iap';
import { _resetMemStore, getAppSetting } from '../../data/sqlite-store';
import { _resetStanu, uruchomPlatnosci, obsluzTransakcje, pobierzStan, subskrybujStan, odswiezDostep, ustalDostep } from '../platnosci/stan';
import { kup, przywroc, pobierzOferte, odczytajSklep, polacz, nasluchujZakupow, zakonczTransakcje } from '../platnosci/sklep';
import { PRODUKTY } from '../platnosci/konfiguracja';

const mockIap = (Iap as unknown as { __mock: any }).__mock;
const flush = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
};
const purchase = (extra: Record<string, unknown> = {}) => ({
  id: 'tx1', transactionId: 'tx1', productId: PRODUKTY.lifetime, purchaseState: 'purchased', transactionDate: 1, platform: 'ios', ...extra,
});

describe('Transaction listener from app start (008)', () => {
  beforeEach(() => {
    _resetMemStore();
    _resetStanu();
    mockIap.reset();
  });

  it('registers the listener at start and reads current entitlements', async () => {
    const stop = uruchomPlatnosci();
    await flush();
    expect(mockIap.listeners.size).toBe(1);
    expect(mockIap.readOptions).toContainEqual({ onlyIncludeActiveItemsIOS: true });
    expect(pobierzStan().gotowe).toBe(true);
    stop();
    expect(mockIap.listeners.size).toBe(0);
  });

  it('a purchase from the listener grants access, saves memory, then finishes the transaction', async () => {
    const order: string[] = [];
    const off = subskrybujStan((s) => order.push(s.decyzja.dostep ? 'dostep' : 'brak'));
    (Iap.finishTransaction as jest.Mock).mockImplementationOnce(async () => {
      order.push(`finish:${(await getAppSetting('platnosci_pamiec')) ? 'pamiec' : 'brak'}`);
    });
    const stop = uruchomPlatnosci();
    await flush();
    mockIap.entitlements = [purchase()];
    mockIap.emit(purchase());
    await flush();
    expect(order.slice(-2)).toEqual(['dostep', 'finish:pamiec']);
    stop();
    off();
  });

  it('store read error: access not granted from the transaction alone and transaction stays unfinished', async () => {
    mockIap.failRead = true;
    await obsluzTransakcje(purchase() as never);
    expect(mockIap.finished).toEqual([]);
    expect(pobierzStan().decyzja.dostep).toBe(false);
  });

  it('pending (Ask to Buy) is neither granted nor finished', async () => {
    await obsluzTransakcje(purchase({ purchaseState: 'pending' }) as never);
    expect(mockIap.finished).toEqual([]);
    expect(pobierzStan().gotowe).toBe(false);
  });

  it('refund read from the store clears memory and access', async () => {
    mockIap.entitlements = [purchase()];
    await odswiezDostep();
    expect(pobierzStan().decyzja.dostep).toBe(true);
    mockIap.entitlements = [purchase({ revocationDateIOS: 5 })];
    await odswiezDostep();
    expect(pobierzStan().decyzja).toEqual({ dostep: false, powod: 'brak', pamiec: null });
    expect(await getAppSetting('platnosci_pamiec')).toBe('');
  });

  it('cancelled purchase is not an error and not a success', async () => {
    mockIap.purchaseError = { code: 'user-cancelled' };
    await expect(kup('monthly')).resolves.toBeUndefined();
    mockIap.purchaseError = { code: 'network-error' };
    await expect(kup('monthly')).rejects.toEqual({ code: 'network-error' });
    expect(pobierzStan().decyzja.dostep).toBe(false);
  });

  it('adapter API: offer prices only from displayPrice, restore syncs, explicit finish', async () => {
    mockIap.products = [
      { id: PRODUKTY.yearly, displayPrice: '29,99 zł', type: 'subs' },
      { id: PRODUKTY.monthly, displayPrice: '4,99 zł', type: 'subs' },
      { id: PRODUKTY.lifetime, displayPrice: '79,99 zł', type: 'in-app' },
    ];
    await polacz();
    expect(await pobierzOferte()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ plan: 'yearly', cena: '29,99 zł' }),
        expect.objectContaining({ plan: 'monthly', cena: '4,99 zł' }),
        expect.objectContaining({ plan: 'lifetime', cena: '79,99 zł' }),
      ])
    );
    expect(await przywroc()).toEqual({ zrodlo: 'sklep', uprawnienia: [] });
    expect(mockIap.restoreCalls).toBe(1);
    mockIap.failRead = true;
    expect(await odczytajSklep()).toEqual({ zrodlo: 'blad' });
    const sub = nasluchujZakupow(() => undefined);
    sub.remove();
    await zakonczTransakcje(purchase() as never);
    expect(mockIap.finished).toEqual(['tx1']);
    expect((await ustalDostep({ zrodlo: 'blad' })).powod).toBe('brak');
  });
});
