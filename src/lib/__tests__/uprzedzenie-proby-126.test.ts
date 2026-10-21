/**
 * Uprzedzenie przed końcem bezpłatnej próby: kiedy i który wariant (D-039 pkt 2, design-spec §11d 126)
 * [M1-audytor-generalny-126; 02-monetyzacja-502]. Wektor „uprzedzenie” z docs/monetyzacja.md (próba wygasa za 3 dni →
 * jeden komunikat; drugi raz nie) i tabela wariantów roli 04; zegar w kilku porach doby (SYS-06).
 */
import { wariantUprzedzenia, KLUCZ_UPRZEDZENIA, OKNO_UPRZEDZENIA_MS } from '../platnosci/uprzedzenie';
import { uprawnienieZTransakcji } from '../platnosci/sklep';
import type { Uprawnienie } from '../platnosci/dostep';
import { PRODUKTY } from '../platnosci/konfiguracja';

const H = 3600_000;
const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('wariantUprzedzenia, zegar %s (126)', (_pora, teraz) => {
  const proba = (o: Partial<Uprawnienie> = {}): Uprawnienie => ({ produkt: PRODUKTY.yearly, wygasa: teraz + 30 * H, odebrane: false, proba: true, odnawia: true, ...o });
  const dozywotni: Uprawnienie = { produkt: PRODUKTY.lifetime, wygasa: null, odebrane: false };
  const ceny = { yearly: '29,99 zł', monthly: '4,99 zł' };

  it('wektor „uprzedzenie”: próba wygasa w oknie 72 h → jeden komunikat; po zapisie daty pokazania drugi raz nie', () => {
    const w = wariantUprzedzenia({ uprawnienia: [proba()], pokazanoDla: null, teraz, ceny });
    expect(w).toEqual({ koniec: teraz + 30 * H, zdanie: 'rok', cena: '29,99 zł', bezZakupu: true });
    expect(wariantUprzedzenia({ uprawnienia: [proba()], pokazanoDla: teraz + 30 * H, teraz, ceny })).toBeNull();
    // Nowa data końca (np. inna próba) to nowe uprzedzenie
    expect(wariantUprzedzenia({ uprawnienia: [proba()], pokazanoDla: teraz - 1000, teraz, ceny })).not.toBeNull();
    expect(KLUCZ_UPRZEDZENIA).toBe('uprzedzenie_proby_pokazane');
  });

  it('granice okna: 72 h − 1 min tak, 72 h + 1 min nie, po końcu nie', () => {
    expect(OKNO_UPRZEDZENIA_MS).toBe(72 * H);
    expect(wariantUprzedzenia({ uprawnienia: [proba({ wygasa: teraz + 72 * H - 60_000 })], pokazanoDla: null, teraz, ceny })).not.toBeNull();
    expect(wariantUprzedzenia({ uprawnienia: [proba({ wygasa: teraz + 72 * H + 60_000 })], pokazanoDla: null, teraz, ceny })).toBeNull();
    expect(wariantUprzedzenia({ uprawnienia: [proba({ wygasa: teraz - 60_000 })], pokazanoDla: null, teraz, ceny })).toBeNull();
  });

  it('tabela wariantów: miesięczny, odnawianie wyłączone, nieznane, dożywotni', () => {
    const w = (u: Uprawnienie[], c: typeof ceny | null = ceny) => wariantUprzedzenia({ uprawnienia: u, pokazanoDla: null, teraz, ceny: c });
    expect(w([proba({ produkt: PRODUKTY.monthly })])).toMatchObject({ zdanie: 'miesiac', cena: '4,99 zł', bezZakupu: true });
    expect(w([proba({ odnawia: false })])).toMatchObject({ zdanie: 'nie-odnowi', bezZakupu: true });
    expect(w([proba({ odnawia: undefined })])).toMatchObject({ zdanie: 'nieznane', bezZakupu: true });
    expect(w([proba()], null)).toMatchObject({ zdanie: 'nieznane', bezZakupu: true }); // brak ceny (sieć)
    expect(w([proba(), dozywotni])).toMatchObject({ zdanie: 'rok', bezZakupu: false });
    expect(w([proba({ odnawia: undefined }), dozywotni])).toMatchObject({ zdanie: 'nieznane', bezZakupu: false });
    expect(w([proba({ odnawia: false }), dozywotni])).toBeNull();
  });

  it('bez informacji o okresie próbnym, bez daty końca albo po odebraniu: brak komunikatu', () => {
    const w = (u: Uprawnienie[]) => wariantUprzedzenia({ uprawnienia: u, pokazanoDla: null, teraz, ceny });
    expect(w([proba({ proba: undefined })])).toBeNull();
    expect(w([proba({ proba: false })])).toBeNull();
    expect(w([proba({ wygasa: null })])).toBeNull();
    expect(w([proba({ odebrane: true })])).toBeNull();
    expect(w([])).toBeNull();
    expect(wariantUprzedzenia({ uprawnienia: null, pokazanoDla: null, teraz, ceny })).toBeNull();
  });
});

describe('uprawnienieZTransakcji: okres próbny i odnawianie z transakcji StoreKit (OP-M03 po stronie kodu)', () => {
  const tx = { id: 't', transactionId: 't', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: 5, platform: 'ios' };
  it('oferta wprowadzająca free trial i willAutoRenew', () => {
    const u = uprawnienieZTransakcji({ ...tx, offerIOS: { id: 'o', type: 'introductory', paymentMode: 'free-trial' }, renewalInfoIOS: { willAutoRenew: false } } as never);
    expect(u).toEqual({ produkt: PRODUKTY.yearly, wygasa: 5, odebrane: false, proba: true, odnawia: false });
  });
  it('bez pól oferty i odnawiania: pola pominięte (nieznane), nie „nie próba”', () => {
    expect(uprawnienieZTransakcji(tx as never)).toEqual({ produkt: PRODUKTY.yearly, wygasa: 5, odebrane: false });
  });
  it('oferta płatna (pay-as-you-go) to nie okres próbny', () => {
    expect(uprawnienieZTransakcji({ ...tx, offerIOS: { id: 'o', type: 'introductory', paymentMode: 'pay-as-you-go' } } as never)?.proba).toBe(false);
  });
});
