/**
 * Po imporcie kopii przełącznik „Przypomnienia o karmieniu” czyta się z bazy na nowo: wybór z pliku działa od razu,
 * a nie dopiero po ponownym uruchomieniu (wcześniej zostawała wartość z pamięci) [audyt-niezalezny B-6].
 */
const mockUstawienia = new Map<string, string>();
jest.mock('../../data/sqlite-store', () => ({
  getAppSetting: jest.fn(async (k: string) => mockUstawienia.get(k)),
  setAppSetting: jest.fn(async (k: string, v: string) => void mockUstawienia.set(k, v)),
}));

import {
  _resetPrzypomnieniaKarmienia,
  czyPrzypomnieniaKarmienia,
  wczytajPonowniePrzypomnieniaKarmienia,
  KLUCZ_PRZYPOMNIEN_KARMIENIA,
} from '../przypomnienia-karmienia';

describe('wczytajPonowniePrzypomnieniaKarmienia (B-6)', () => {
  beforeEach(() => {
    mockUstawienia.clear();
    _resetPrzypomnieniaKarmienia();
  });

  it('wartość z bazy po imporcie zastępuje wartość z pamięci', async () => {
    expect(await czyPrzypomnieniaKarmienia()).toBe(true);
    mockUstawienia.set(KLUCZ_PRZYPOMNIEN_KARMIENIA, '0');
    expect(await czyPrzypomnieniaKarmienia()).toBe(true);
    await wczytajPonowniePrzypomnieniaKarmienia();
    expect(await czyPrzypomnieniaKarmienia()).toBe(false);
  });
});
