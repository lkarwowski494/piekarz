/**
 * Adresy publicznych stron aplikacji [M1-audytor-generalny-012]: jedno źródło dla paywalla, Ustawień
 * i metadanych App Store (docs/15-app-store.md). Strony leżą w `site/` i publikuje je workflow
 * `.github/workflows/pages.yml` (GitHub Pages, decyzja właściciela 2026-10-19).
 */
export const PRIVACY_URL = 'https://lkarwowski494.github.io/piekarz/privacy.html';
export const SUPPORT_URL = 'https://lkarwowski494.github.io/piekarz/support.html';
/**
 * Standardowa licencja użytkownika Apple (EULA): „Licensed Application End User License Agreement”
 * (odczyt strony 2026-10-19) [M1-audytor-generalny-011].
 */
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
/**
 * Strona subskrypcji konta Apple: rezerwa, gdy systemowy arkusz zarządzania się nie otworzy
 * (ten sam adres expo-iap 6.1.1 używa w deepLinkToSubscriptionsIOS bez arkusza StoreKit).
 */
export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
/**
 * Apple ID aplikacji (App Store Connect → App Information → Apple ID; krok właściciela) i stały link
 * do napisania opinii: parametr `action=write-review` (Apple, RequestReviewAction; format jak w Expo SDK 57).
 * Dopóki ID nie jest liczbą, wiersz „Oceń w App Store” się nie renderuje (BR-OPIN-002)
 * [M1-audytor-generalny-082; 11-wzrost-004].
 */
export const APP_STORE_ID = '[DO USTALENIA: Apple ID aplikacji z App Store Connect]';
export const APP_STORE_REVIEW_URL = `https://apps.apple.com/app/apple-store/id${APP_STORE_ID}?action=write-review`;
/**
 * Adres wsparcia dla „Napisz do nas” (BR-OPIN-003); ten sam trafia na stronę wsparcia (012).
 * Dopóki to znacznik, a nie adres e-mail, wiersz się nie renderuje [M1-audytor-generalny-083; 11-wzrost-005].
 */
export const SUPPORT_EMAIL = '[DO USTALENIA: adres wsparcia od właściciela]';
