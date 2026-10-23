/**
 * Audyt niezależny, start płatności:
 * - C-3: płacący nie czeka na pierwszy odczyt sklepu — najpierw pamięć ostatniego udanego odczytu, a odczyt sklepu
 *   ma limit czasu (zawieszony StoreKit = błąd odczytu, nie wieczne ładowanie);
 * - C-6: nasłuch transakcji istnieje, zanim aplikacja połączy się ze sklepem (także gdy ekran pyta o dostęp przed
 *   startem płatności w app/_layout.tsx), więc transakcja z kolejki StoreKit nie przepada;
 * - C-7: dawniej nagłówek „Okres próbny się skończył” tylko po samej próbie; po D-112 (bez próby) komunikat końca Pro
 *   tylko po rzeczywistym końcu Pro [audyt-niezalezny C-3; audyt-niezalezny C-6; audyt-niezalezny C-7; M3 P-a].
 */
import * as Iap from 'expo-iap';
import { _resetMemStore, getAppSetting, setAppSetting } from '../../data/sqlite-store';
import { _resetStanu, odswiezDostep, pobierzStan, uruchomPlatnosci } from '../platnosci/stan';
import { LIMIT_ODCZYTU_SKLEPU_MS, ustawPrzedPolaczeniem, _resetSklepu, polacz } from '../platnosci/sklep';
import { KLUCZ_PAMIECI, PRODUKTY } from '../platnosci/konfiguracja';
import { KLUCZ_KONCA_PRO } from '../platnosci/uprzedzenie';

const mockIap = (Iap as unknown as { __mock: any }).__mock;
const flush = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
};
const DZIEN = 86_400_000;

describe('C-3, C-6, C-7: start płatności', () => {
  beforeEach(() => {
    _resetMemStore();
    _resetStanu();
    mockIap.reset();
  });
  afterEach(() => {
    jest.useRealTimers();
    (Iap.getAvailablePurchases as jest.Mock).mockClear();
  });

  it('C-6: a screen asking for access before the app start registers the listener before connecting', async () => {
    const kolejnosc: string[] = [];
    (Iap.initConnection as jest.Mock).mockImplementationOnce(async () => {
      kolejnosc.push(`polaczenie, nasluchy: ${mockIap.listeners.size}`);
      return true;
    });
    await odswiezDostep();
    expect(kolejnosc).toEqual(['polaczenie, nasluchy: 1']);
    // Start aplikacji nie dokłada drugiego nasłuchu; zatrzymanie go zdejmuje
    const stop = uruchomPlatnosci();
    await flush();
    expect(mockIap.listeners.size).toBe(1);
    stop();
    expect(mockIap.listeners.size).toBe(0);
  });

  it('C-3: memory of a paid plan gives access before the store answers; a hanging store read ends after the limit', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    await setAppSetting(KLUCZ_PAMIECI, JSON.stringify({ produkty: [PRODUKTY.yearly], wygasa: Date.now() + 30 * DZIEN }));
    (Iap.getAvailablePurchases as jest.Mock).mockImplementationOnce(() => new Promise(() => undefined));
    const odczyt = odswiezDostep();
    await flush();
    expect(pobierzStan().decyzja).toMatchObject({ dostep: true, powod: 'pamiec' });
    expect(pobierzStan().gotowe).toBe(true);
    jest.advanceTimersByTime(LIMIT_ODCZYTU_SKLEPU_MS);
    await odczyt;
    expect(pobierzStan().decyzja).toMatchObject({ dostep: true, powod: 'pamiec' });
  });

  it('C-3: without memory, a hanging store ends in "no access" after the limit instead of loading forever', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    (Iap.getAvailablePurchases as jest.Mock).mockImplementationOnce(() => new Promise(() => undefined));
    const odczyt = odswiezDostep();
    await flush();
    expect(pobierzStan().gotowe).toBe(false);
    jest.advanceTimersByTime(LIMIT_ODCZYTU_SKLEPU_MS);
    await odczyt;
    expect(pobierzStan()).toMatchObject({ gotowe: true, decyzja: { dostep: false } });
  });

  // Przepisane z kontraktu D-038 (C-7: rodzaj dostępu próba/płatny do nagłówka „Okres próbny się skończył”) [M3 P-a]:
  // próby nie ma (D-112); zostaje komunikat końca Pro, raz, tylko po udanym odczycie sklepu bez Pro po pamięci z Pro
  it('C-7 (Basic/Pro): end-of-Pro marker only after a store read without Pro following memory with Pro; a read error does not set it', async () => {
    mockIap.entitlements = [
      { id: 't2', transactionId: 't2', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 2, expirationDateIOS: Date.now() + DZIEN },
    ];
    await odswiezDostep();
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).not.toBe('1');
    mockIap.failRead = true;
    await odswiezDostep();
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).not.toBe('1');
    mockIap.failRead = false;
    mockIap.entitlements = [];
    await odswiezDostep();
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).toBe('1');
    await setAppSetting(KLUCZ_KONCA_PRO, '');
    await odswiezDostep();
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).toBe('');
  });

  // Ostatni w pliku: podmienia funkcję wołaną przed połączeniem (stan.ts ustawia ją przy załadowaniu modułu)
  it('C-6: ustawPrzedPolaczeniem runs before every connection attempt; _resetSklepu forgets the connection', async () => {
    const przed = jest.fn();
    ustawPrzedPolaczeniem(przed);
    _resetSklepu();
    (Iap.initConnection as jest.Mock).mockClear();
    await polacz();
    await polacz();
    expect(przed).toHaveBeenCalledTimes(2);
    expect(Iap.initConnection).toHaveBeenCalledTimes(1);
    _resetSklepu();
    await polacz();
    expect(Iap.initConnection).toHaveBeenCalledTimes(2);
    ustawPrzedPolaczeniem(null);
  });
});
