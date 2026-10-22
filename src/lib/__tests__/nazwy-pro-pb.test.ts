/**
 * Logika partii M3 P-b (D-117): etykieta „{funkcja}, Pro” i nazwy obszarów blokady (P2-4), gratulacje po pierwszym
 * zakwasie raz (BR-ZAKW-005, W-10), „Zrealizuj kod” przez StoreKit (kontrakt „Zarządzanie i anulowanie”).
 */
import * as Iap from 'expo-iap';
import { etykietaPro, nazwaBlokady } from '../platnosci/nazwy-pro';
import { zrealizujKod, _resetSklepu } from '../platnosci/sklep';
import { KLUCZ_GRATULACJI, pierwszeGratulacje } from '../gratulacje-zakwasu';
import { getAppSetting } from '../../data/settings-store';
import { initDatabase, _resetMemStore } from '../../data/sqlite-store';
import { setLang, t } from '../i18n';

describe('etykietaPro i nazwaBlokady (P2-4)', () => {
  afterEach(() => setLang('pl'));

  it('bez dostępu „{funkcja}, Pro”, z dostępem sama nazwa; EN tak samo', () => {
    expect(etykietaPro('Miesiąc', false)).toBe('Miesiąc, Pro');
    expect(etykietaPro('Miesiąc', true)).toBe('Miesiąc');
    setLang('en');
    expect(etykietaPro(t('Miesiąc'), false)).toBe('Month, Pro');
  });

  it('obszary blokady mają własne nazwy; funkcja bez obszaru: nazwa produktu', () => {
    expect(nazwaBlokady('plan-wstecz')).toBe('Plan wstecz od godziny „gotowe”');
    expect(nazwaBlokady('gotowosc-zakwasu')).toBe('Gotowość i szczyt zakwasu');
    expect(nazwaBlokady('staly-dzien')).toBe('Stały dzień karmienia');
    expect(nazwaBlokady('proporcje-zakwasu')).toBe('Proporcje dokarmiania');
    expect(nazwaBlokady('porownanie')).toBe('Porównanie i statystyki');
    expect(nazwaBlokady('druk')).toBe(t('Piekarz Pro'));
  });
});

describe('pierwszeGratulacje: raz (W-10)', () => {
  beforeEach(async () => {
    _resetMemStore();
    await initDatabase();
  });

  it('pierwsze wywołanie: tak i zapis znacznika; drugie: nie', async () => {
    expect(await pierwszeGratulacje()).toBe(true);
    expect(await getAppSetting(KLUCZ_GRATULACJI)).toBe('1');
    expect(await pierwszeGratulacje()).toBe(false);
  });
});

describe('zrealizujKod', () => {
  it('łączy ze sklepem i otwiera arkusz realizacji kodu; błąd sklepu idzie dalej (komunikat daje ekran)', async () => {
    _resetSklepu();
    await zrealizujKod();
    expect(Iap.initConnection).toHaveBeenCalled();
    expect(Iap.openRedeemOfferCode).toHaveBeenCalledTimes(1);
    (Iap.openRedeemOfferCode as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    await expect(zrealizujKod()).rejects.toThrow('offline');
  });
});
