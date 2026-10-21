// ============================================================================
// Piekarz — adapter StoreKit przez expo-iap (ADR-007) [M1-audytor-generalny-008; 02-monetyzacja-001]
// Jedyny plik, który importuje bibliotekę płatności. Zamienia zweryfikowane transakcje
// (Transaction.currentEntitlements: getAvailablePurchases z onlyIncludeActiveItemsIOS) na Uprawnienie[].
// Pusty wynik po błędzie połączenia to Odczyt „blad”, nie brak zakupu.
// ============================================================================

import * as Iap from 'expo-iap';
import type { Purchase, SubscriptionStatusIOS } from 'expo-iap';
import { PRODUKTY, SUBSKRYPCJE, ODBLOKOWUJA, Plan, planProduktu } from './konfiguracja';
import type { Odczyt, Uprawnienie } from './dostep';
import { Linking } from 'react-native';
import { APPLE_SUBSCRIPTIONS_URL } from '../links';

let polaczenie: Promise<unknown> | null = null;

/** initConnection raz na proces; nieudane połączenie można ponowić. */
export function polacz(): Promise<unknown> {
  if (!polaczenie) {
    polaczenie = Iap.initConnection().catch((e: unknown) => {
      polaczenie = null;
      throw e;
    });
  }
  return polaczenie;
}

function liczba(x: unknown): number | null {
  return typeof x === 'number' && Number.isFinite(x) ? x : null;
}

/** Transakcja sklepu → uprawnienie. Oczekująca (Ask to Buy) nie jest uprawnieniem. */
export function uprawnienieZTransakcji(p: Purchase): Uprawnienie | null {
  if (p.purchaseState === 'pending') return null;
  const wygasa = liczba(Reflect.get(p, 'expirationDateIOS'));
  // Subskrypcja bez daty końca to dane, których nie rozumiemy: nie dajemy z niej dostępu „na zawsze”.
  if (wygasa === null && SUBSKRYPCJE.includes(p.productId)) return null;
  const odebrane = liczba(Reflect.get(p, 'revocationDateIOS')) !== null;
  return { produkt: p.productId, wygasa, odebrane, ...ofertaIOdnawianie(p) };
}

/**
 * Okres próbny i odnawianie z transakcji (offerIOS, renewalInfoIOS w expo-iap; OP-M03: czy StoreKit je wypełnia,
 * potwierdzi sandbox). Pole bez danych zostaje pominięte, nie zgadnięte [M1-audytor-generalny-126].
 */
function ofertaIOdnawianie(p: Purchase): Pick<Uprawnienie, 'proba' | 'odnawia'> {
  const wynik: Pick<Uprawnienie, 'proba' | 'odnawia'> = {};
  const oferta: unknown = Reflect.get(p, 'offerIOS');
  const tryb = typeof oferta === 'object' && oferta !== null ? Reflect.get(oferta, 'paymentMode') : undefined;
  if (typeof tryb === 'string' && tryb) wynik.proba = /free.?trial/i.test(tryb);
  const odn: unknown = Reflect.get(p, 'renewalInfoIOS');
  const will = typeof odn === 'object' && odn !== null ? Reflect.get(odn, 'willAutoRenew') : undefined;
  if (typeof will === 'boolean') wynik.odnawia = will;
  return wynik;
}

/** Subskrypcja w okresie karencji (billing grace period) jest uprawnieniem do końca karencji. */
export function uprawnieniaKarencji(statusy: SubscriptionStatusIOS[]): Uprawnienie[] {
  const wynik: Uprawnienie[] = [];
  for (const s of statusy) {
    const koniec = liczba(s.renewalInfo?.gracePeriodExpirationDate);
    if (s.state !== 'inGracePeriod' || koniec === null) continue;
    const pref = s.renewalInfo?.autoRenewPreference;
    const produkt = pref && SUBSKRYPCJE.includes(pref) ? pref : SUBSKRYPCJE[0];
    wynik.push({ produkt, wygasa: koniec, odebrane: false });
  }
  return wynik;
}

async function karencja(): Promise<Uprawnienie[]> {
  try {
    return uprawnieniaKarencji(await Iap.subscriptionStatusIOS(PRODUKTY.monthly));
  } catch {
    return [];
  }
}

/** Bieżące uprawnienia ze sklepu; każdy błąd odczytu to „blad”. */
export async function odczytajSklep(): Promise<Odczyt> {
  try {
    await polacz();
    const zakupy = await Iap.getAvailablePurchases({ onlyIncludeActiveItemsIOS: true });
    const uprawnienia = zakupy.map(uprawnienieZTransakcji).filter((u): u is Uprawnienie => u !== null);
    if (!uprawnienia.some((u) => SUBSKRYPCJE.includes(u.produkt))) uprawnienia.push(...(await karencja()));
    return { zrodlo: 'sklep', uprawnienia };
  } catch {
    return { zrodlo: 'blad' };
  }
}

export interface Oferta {
  plan: Plan;
  /** Cena sformatowana przez App Store (waluta i region użytkownika). */
  cena: string;
  /** Dni bezpłatnej oferty wprowadzającej z App Store Connect; null = brak albo użytkownik nieuprawniony. */
  probaDni: number | null;
}

/**
 * Długość bezpłatnej oferty wprowadzającej produktu w dniach (StoreKit SubscriptionOffer).
 * Okresy liczone w miesiącach i latach nie mają stałej liczby dni: zwraca null [M1-audytor-generalny-009].
 */
export function dniOkresuProbnego(produkt: unknown): number | null {
  const oferty: unknown = typeof produkt === 'object' && produkt !== null ? Reflect.get(produkt, 'subscriptionOffers') : null;
  if (!Array.isArray(oferty)) return null;
  for (const o of oferty) {
    if (!o || o.type !== 'introductory' || o.paymentMode !== 'free-trial') continue;
    const wartosc = liczba(o.period?.value);
    const ile = liczba(o.periodCount) ?? 1;
    if (wartosc === null) return null;
    if (o.period.unit === 'day') return wartosc * ile;
    if (o.period.unit === 'week') return 7 * wartosc * ile;
    return null;
  }
  return null;
}

/** Uprawnienie do oferty wprowadzającej dotyczy całej grupy subskrypcji; błąd = nie pokazujemy oferty. */
async function uprawnionyDoProby(grupa: unknown): Promise<boolean> {
  if (typeof grupa !== 'string' || !grupa) return false;
  try {
    return await Iap.isEligibleForIntroOfferIOS(grupa);
  } catch {
    return false;
  }
}

/** Produkty z App Store Connect; ceny wyłącznie z displayPrice, okres próbny tylko dla uprawnionych. */
export async function pobierzOferte(): Promise<Oferta[]> {
  await polacz();
  const produkty = (await Iap.fetchProducts({ skus: [...ODBLOKOWUJA], type: 'all' })) ?? [];
  const sub = produkty.find((p) => SUBSKRYPCJE.includes(p.id));
  const uprawniony = sub ? await uprawnionyDoProby(Reflect.get(sub, 'subscriptionGroupIdIOS')) : false;
  const wynik: Oferta[] = [];
  for (const p of produkty) {
    const plan = planProduktu(p.id);
    const probaDni = uprawniony && SUBSKRYPCJE.includes(p.id) ? dniOkresuProbnego(p) : null;
    if (plan) wynik.push({ plan, cena: p.displayPrice, probaDni });
  }
  return wynik;
}

/** Zakup czeka na zatwierdzenie (Ask to Buy w Chmurze rodzinnej albo potwierdzenie płatności): błąd sklepu albo transakcja „pending”. */
function oczekuje(x: unknown): boolean {
  const lista = Array.isArray(x) ? x : [x];
  return lista.some((p) => {
    if (typeof p !== 'object' || p === null) return false;
    const kod = Reflect.get(p, 'code');
    return kod === 'deferred-payment' || kod === 'pending' || Reflect.get(p, 'purchaseState') === 'pending';
  });
}

/**
 * Arkusz zakupu App Store. Wynik przychodzi przez nasłuch transakcji (stan.ts), nie z tej funkcji; 'oczekuje' =
 * zakup czeka na zatwierdzenie (Ask to Buy), to nie błąd sieci [audyt-niezalezny C-4].
 */
export async function kup(plan: Plan): Promise<'oczekuje' | void> {
  await polacz();
  const sku = PRODUKTY[plan];
  try {
    const wynik: unknown =
      plan === 'lifetime'
        ? await Iap.requestPurchase({ type: 'in-app', request: { apple: { sku } } })
        : await Iap.requestPurchase({ type: 'subs', request: { apple: { sku } } });
    if (oczekuje(wynik)) return 'oczekuje';
  } catch (e: unknown) {
    if (Iap.isUserCancelledError(e)) return; // anulowanie to nie błąd i nie sukces
    if (oczekuje(e)) return 'oczekuje';
    throw e;
  }
}

/** Przywracanie na wyraźne żądanie użytkownika (AppStore.sync), potem bieżące uprawnienia. */
export async function przywroc(): Promise<Odczyt> {
  await polacz();
  await Iap.restorePurchases();
  return odczytajSklep();
}

/**
 * Systemowe zarządzanie subskrypcją (arkusz App Store przez expo-iap deepLinkToSubscriptions)
 * [M1-audytor-generalny-011; 02-monetyzacja-008]. Gdy arkusz się nie otworzy: strona subskrypcji konta Apple.
 */
export async function zarzadzajSubskrypcja(): Promise<void> {
  try {
    await Iap.deepLinkToSubscriptions();
  } catch {
    await Linking.openURL(APPLE_SUBSCRIPTIONS_URL);
  }
}

export function nasluchujZakupow(fn: (p: Purchase) => void): { remove: () => void } {
  return Iap.purchaseUpdatedListener(fn);
}

export async function zakonczTransakcje(p: Purchase): Promise<void> {
  await Iap.finishTransaction({ purchase: p, isConsumable: false });
}
