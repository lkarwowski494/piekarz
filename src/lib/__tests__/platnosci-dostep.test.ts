/**
 * Wektory logiki dostępu (moduł storekit-expo roli 02) na funkcjach z kodu aplikacji
 * [M1-audytor-generalny-008; 02-monetyzacja-001].
 */
import { decyzja, odczytajPamiec, zapisPamieci, Uprawnienie, Pamiec, Odczyt, Powod, Decyzja } from '../platnosci/dostep';
import { uprawnienieZTransakcji, uprawnieniaKarencji, dniOkresuProbnego } from '../platnosci/sklep';
import { PRODUKTY, PLANY, SUBSKRYPCJE, ODBLOKOWUJA, KLUCZ_PAMIECI, planProduktu, Plan } from '../platnosci/konfiguracja';
import type { Purchase } from 'expo-iap';

const T = 1_800_000_000_000;
const ODB = ['pelna', 'rok'] as const;
const u = (produkt: string, wygasa: number | null, odebrane = false): Uprawnienie => ({ produkt, wygasa, odebrane });
const sklep = (...uprawnienia: Uprawnienie[]): Odczyt => ({ zrodlo: 'sklep', uprawnienia });
const blad: Odczyt = { zrodlo: 'blad' };

describe('decyzja: vectors of the storekit-expo module', () => {
  const cases: Array<[string, Odczyt, Pamiec, boolean, Powod, Pamiec]> = [
    ['one-time purchase', sklep(u('pelna', null)), null, true, 'sklep', { produkty: ['pelna'], wygasa: null }],
    ['reinstall (empty memory)', sklep(u('pelna', null)), null, true, 'sklep', { produkty: ['pelna'], wygasa: null }],
    ['no network after purchase', blad, { produkty: ['pelna'], wygasa: null }, true, 'pamiec', { produkty: ['pelna'], wygasa: null }],
    ['no network, never bought', blad, null, false, 'brak', null],
    ['refund', sklep(u('pelna', null, true)), { produkty: ['pelna'], wygasa: null }, false, 'brak', null],
    ['subscription expired, no network', blad, { produkty: ['rok'], wygasa: T - 1 }, false, 'brak', { produkty: ['rok'], wygasa: T - 1 }],
    ['subscription active', sklep(u('rok', T + 1)), null, true, 'sklep', { produkty: ['rok'], wygasa: T + 1 }],
    ['subscription expired in store', sklep(u('rok', T - 1)), { produkty: ['rok'], wygasa: T + 9 }, false, 'brak', null],
    ['tip (does not unlock)', sklep(u('napiwek', null)), null, false, 'brak', null],
    ['restore without purchase', sklep(), null, false, 'brak', null],
  ];
  it.each(cases)('%s', (_n, odczyt, pamiec, dostep, powod, nowa) => {
    const d: Decyzja = decyzja(odczyt, pamiec, T, ODB);
    expect(d).toEqual({ dostep, powod, pamiec: nowa });
  });

  it('lifetime plus subscription keeps access without end', () => {
    expect(decyzja(sklep(u('rok', T + 5), u('pelna', null)), null, T, ODB).pamiec).toEqual({ produkty: ['rok', 'pelna'], wygasa: null });
  });
});

describe('memory round trip', () => {
  it('reads what it writes and rejects malformed input', () => {
    const p: Pamiec = { produkty: ['rok'], wygasa: T };
    expect(odczytajPamiec(zapisPamieci(p))).toEqual(p);
    expect(zapisPamieci(null)).toBe('');
    expect(odczytajPamiec('')).toBeNull();
    expect(odczytajPamiec(undefined)).toBeNull();
    expect(odczytajPamiec('{"produkty":[1],"wygasa":null}')).toBeNull();
    expect(odczytajPamiec('{"produkty":["rok"],"wygasa":"jutro"}')).toBeNull();
    expect(odczytajPamiec('null')).toBeNull();
  });
});

describe('adapter: StoreKit transaction → entitlement', () => {
  const base = { id: 'x', transactionId: 'x', transactionDate: 1, platform: 'ios', purchaseState: 'purchased' };
  const tx = (extra: Record<string, unknown>) => ({ ...base, ...extra } as unknown as Purchase);

  it('lifetime has no end, subscription ends at expirationDateIOS, refund is revoked', () => {
    expect(uprawnienieZTransakcji(tx({ productId: PRODUKTY.lifetime }))).toEqual(u(PRODUKTY.lifetime, null));
    expect(uprawnienieZTransakcji(tx({ productId: PRODUKTY.yearly, expirationDateIOS: T }))).toEqual(u(PRODUKTY.yearly, T));
    expect(uprawnienieZTransakcji(tx({ productId: PRODUKTY.lifetime, revocationDateIOS: T }))).toEqual(u(PRODUKTY.lifetime, null, true));
  });

  it('pending (Ask to Buy) and a subscription without an end date give nothing', () => {
    expect(uprawnienieZTransakcji(tx({ productId: PRODUKTY.lifetime, purchaseState: 'pending' }))).toBeNull();
    expect(uprawnienieZTransakcji(tx({ productId: PRODUKTY.monthly }))).toBeNull();
  });

  it('billing grace period is an entitlement until the grace period ends', () => {
    const statusy = [
      { state: 'inGracePeriod', renewalInfo: { gracePeriodExpirationDate: T + 3, autoRenewPreference: PRODUKTY.yearly } },
      { state: 'expired', renewalInfo: { gracePeriodExpirationDate: T + 3 } },
      { state: 'inGracePeriod', renewalInfo: null },
    ];
    expect(uprawnieniaKarencji(statusy as never)).toEqual([u(PRODUKTY.yearly, T + 3)]);
    const d = decyzja(sklep(...uprawnieniaKarencji(statusy as never)), null, T, ODBLOKOWUJA);
    expect(d.dostep).toBe(true);
    expect(decyzja(sklep(...uprawnieniaKarencji(statusy as never)), null, T + 4, ODBLOKOWUJA).dostep).toBe(false);
  });
});

describe('introductory offer length comes from the StoreKit product (009)', () => {
  const offer = (o: Record<string, unknown>) => ({ subscriptionOffers: [{ type: 'introductory', paymentMode: 'free-trial', periodCount: 1, ...o }] });
  it('days and weeks give days; months, paid intro and missing offer give null', () => {
    expect(dniOkresuProbnego(offer({ period: { unit: 'day', value: 14 } }))).toBe(14);
    expect(dniOkresuProbnego(offer({ period: { unit: 'week', value: 2 } }))).toBe(14);
    expect(dniOkresuProbnego(offer({ period: { unit: 'week', value: 1 }, periodCount: 2 }))).toBe(14);
    expect(dniOkresuProbnego(offer({ period: { unit: 'month', value: 1 } }))).toBeNull();
    expect(dniOkresuProbnego(offer({ period: { unit: 'day', value: 14 }, paymentMode: 'pay-as-you-go' }))).toBeNull();
    expect(dniOkresuProbnego({ subscriptionOffers: null })).toBeNull();
    expect(dniOkresuProbnego(null)).toBeNull();
  });
});

describe('offer configuration (one source, MON-12)', () => {
  it('three products, two subscriptions in one group, lifetime unlocks', () => {
    const plany: Plan[] = [...PLANY];
    expect(plany.sort()).toEqual(['lifetime', 'monthly', 'yearly']);
    expect(SUBSKRYPCJE).toEqual([PRODUKTY.monthly, PRODUKTY.yearly]);
    expect(ODBLOKOWUJA).toContain(PRODUKTY.lifetime);
    expect(planProduktu(PRODUKTY.yearly)).toBe('yearly');
    expect(planProduktu('com.example.other')).toBeNull();
    expect(KLUCZ_PAMIECI).toBe('platnosci_pamiec');
  });
});
