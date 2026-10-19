/**
 * Stan sklepu w testach ekranów [M1-audytor-generalny-009, -027]: dostęp tylko z uprawnienia App Store
 * (atrapa expo-iap w jest.setup.js). Zastępuje dawny lokalny okres próbny, który w testach był aktywny
 * „sam z siebie” po _resetMemStore.
 */
import * as Iap from 'expo-iap';
import { _resetStanu } from '../../src/lib/platnosci/stan';
import { PRODUKTY } from '../../src/lib/platnosci/konfiguracja';

export const mockIap = (Iap as unknown as { __mock: any }).__mock;

/** Aktywna oferta wprowadzająca subskrypcji rocznej (okres próbny App Store) albo zakup: pełny dostęp. */
export function zUprawnieniem(): void {
  mockIap.reset();
  mockIap.entitlements = [
    { id: 'tx_test', transactionId: 'tx_test', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: Date.now() + 14 * 86400000 },
  ];
  _resetStanu();
}

/** Brak subskrypcji, oferty wprowadzającej i zakupu dożywotniego. */
export function bezUprawnienia(): void {
  mockIap.reset();
  _resetStanu();
}
