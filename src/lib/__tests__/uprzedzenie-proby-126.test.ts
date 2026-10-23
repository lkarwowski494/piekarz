/**
 * Uprzedzenie o końcu Piekarz Pro (D-113 pkt 3, kontrakt docs/monetyzacja.md „Wygaśnięcie Pro”, D-116). Przepisane
 * z kontraktu D-038 (uprzedzenie przed końcem bezpłatnej próby, 126): próby nie ma (D-112), więc uprzedzenie dotyczy
 * subskrypcji, która się nie odnowi — 3 dni przed końcem, raz — i chwili wygaśnięcia, raz; bez odliczania i bez ceny.
 * Zegar w kilku porach doby (SYS-06) [M1-audytor-generalny-126; M3 P-a].
 */
import { uprzedzenieKoncaPro, wygaslPro, KLUCZ_UPRZEDZENIA, KLUCZ_KONCA_PRO, OKNO_UPRZEDZENIA_MS } from '../platnosci/uprzedzenie';
import { uprawnienieZTransakcji } from '../platnosci/sklep';
import type { Uprawnienie } from '../platnosci/dostep';
import { PRODUKTY } from '../platnosci/konfiguracja';

const H = 3600_000;
const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('uprzedzenieKoncaPro, zegar %s', (_pora, teraz) => {
  const sub = (o: Partial<Uprawnienie> = {}): Uprawnienie => ({ produkt: PRODUKTY.yearly, wygasa: teraz + 30 * H, odebrane: false, odnawia: false, ...o });
  const dozywotni: Uprawnienie = { produkt: PRODUKTY.lifetime, wygasa: null, odebrane: false };
  const w = (u: Uprawnienie[] | null, pokazanoDla: number | null = null) => uprzedzenieKoncaPro({ uprawnienia: u, pokazanoDla, teraz });

  it('subskrypcja bez odnowienia kończy się w oknie 72 h → jedno uprzedzenie z datą końca; po zapisie daty drugi raz nie', () => {
    expect(w([sub()])).toEqual({ koniec: teraz + 30 * H });
    expect(w([sub()], teraz + 30 * H)).toBeNull();
    // Nowa data końca (np. kolejny opłacony okres bez odnowienia) to nowe uprzedzenie
    expect(w([sub()], teraz - 1000)).not.toBeNull();
    expect(KLUCZ_UPRZEDZENIA).toBe('uprzedzenie_konca_pro');
    expect(KLUCZ_KONCA_PRO).toBe('koniec_pro_do_pokazania');
  });

  it('granice okna: 72 h − 1 min tak, 72 h + 1 min nie, po końcu nie', () => {
    expect(OKNO_UPRZEDZENIA_MS).toBe(72 * H);
    expect(w([sub({ wygasa: teraz + 72 * H - 60_000 })])).not.toBeNull();
    expect(w([sub({ wygasa: teraz + 72 * H + 60_000 })])).toBeNull();
    expect(w([sub({ wygasa: teraz - 60_000 })])).toBeNull();
  });

  it('subskrypcja, która się odnowi, albo stan odnawiania nieznany (OP-M03): bez uprzedzenia', () => {
    expect(w([sub({ odnawia: true })])).toBeNull();
    expect(w([sub({ odnawia: undefined })])).toBeNull();
    // Miesięczna bez odnowienia: też uprzedzenie
    expect(w([sub({ produkt: PRODUKTY.monthly })])).toEqual({ koniec: teraz + 30 * H });
  });

  it('dożywotni albo druga subskrypcja dająca Pro dłużej: Pro się nie kończy w oknie → bez uprzedzenia', () => {
    expect(w([sub(), dozywotni])).toBeNull();
    expect(w([sub(), sub({ produkt: PRODUKTY.monthly, wygasa: teraz + 200 * H, odnawia: false })])).toBeNull();
    expect(w([sub(), sub({ produkt: PRODUKTY.monthly, odnawia: true })])).toBeNull();
  });

  it('bez uprawnień, po odebraniu albo produkt spoza Pro: brak komunikatu', () => {
    expect(w([sub({ odebrane: true })])).toBeNull();
    expect(w([sub({ produkt: 'inny.produkt' })])).toBeNull();
    expect(w([])).toBeNull();
    expect(w(null)).toBeNull();
  });
});

describe('wygaslPro: komunikat w chwili wygaśnięcia, raz', () => {
  const pamiec = { produkty: [PRODUKTY.monthly], wygasa: 1000 };
  it('udany odczyt sklepu bez dostępu po pamięci z dostępem → tak; bez pamięci, z dostępem albo przy błędzie odczytu → nie', () => {
    expect(wygaslPro(pamiec, { dostep: false, powod: 'brak', pamiec: null }, 'sklep')).toBe(true);
    expect(wygaslPro(null, { dostep: false, powod: 'brak', pamiec: null }, 'sklep')).toBe(false);
    expect(wygaslPro(pamiec, { dostep: true, powod: 'sklep', pamiec }, 'sklep')).toBe(false);
    expect(wygaslPro(pamiec, { dostep: false, powod: 'brak', pamiec }, 'blad')).toBe(false);
  });
});

describe('uprawnienieZTransakcji: odnawianie z transakcji StoreKit, bez pola próby (OP-M03 po stronie kodu)', () => {
  const tx = { id: 't', transactionId: 't', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: 5, platform: 'ios' };
  it('willAutoRenew: false → odnawia false; oferta w transakcji nie tworzy pola próby (D-112: bez próby)', () => {
    const u = uprawnienieZTransakcji({ ...tx, offerIOS: { id: 'o', type: 'introductory', paymentMode: 'free-trial' }, renewalInfoIOS: { willAutoRenew: false } } as never);
    expect(u).toEqual({ produkt: PRODUKTY.yearly, wygasa: 5, odebrane: false, odnawia: false });
  });
  it('bez pól odnawiania: pole pominięte (nieznane)', () => {
    expect(uprawnienieZTransakcji(tx as never)).toEqual({ produkt: PRODUKTY.yearly, wygasa: 5, odebrane: false });
  });
});
