# ADR-007: Zakupy w aplikacji przez StoreKit (expo-iap)

**Data:** 2026-10-19 · **Status:** przyjęta · **Zadania:** M1-audytor-generalny-008, -009, -027 (02-monetyzacja-001, -002, 08-programista-016) · **Decyzja produktowa:** DEC-01 (d) właściciela z 2026-10-19

## Kontekst
Przycisk zakupu zapisywał poziom dostępu w SQLite bez transakcji (symulacja), przywracanie czytało tylko bazę, okres próbny liczyła aplikacja od pierwszego uruchomienia, a rekord dostępu chronił podpis HMAC z kluczem w publicznym repo. Wytyczne App Store (odczyt 2026-10-19, „Last Updated: October 16, 2026”) 3.1.1: „If you want to unlock features or functionality within your app, (…) you must use in-app purchase.”

Model (DEC-01 d): subskrypcja miesięczna i roczna w jednej grupie oraz zakup dożywotni (Non-Consumable). Okres próbny wyłącznie jako oferta wprowadzająca App Store na obu subskrypcjach; długość ustawia właściciel w App Store Connect (decyzja z 2026-10-19: 14 dni), kod nie ma stałej długości.

## Opcje
| Opcja | Bez sieci | Przywracanie | Nasłuch od startu | Koszt / limit (odczyt npm 2026-10-19) | Etykieta prywatności |
|---|---|---|---|---|---|
| **expo-iap 6.1.1 (MIT)** — moduł Expo zgodny z OpenIAP | pamięć ostatniego odczytu w app_settings | `restorePurchases` (AppStore.sync) | `purchaseUpdatedListener` | 0 zł, bez usługi | bez zmian: dane o zakupach nie wychodzą poza StoreKit |
| react-native-purchases 10.14.0 (RevenueCat) | cache SDK | tak | tak | bezpłatnie do 2 500 USD MTR, potem 1% | wymaga wpisu „Purchases” w App Privacy — sprzeczne z zasadą zero telemetrii |
| własny moduł Swift (StoreKit 2) | jak wyżej | tak | tak | 0 zł, koszt utrzymania kodu natywnego | bez zmian |

Odrzucone: RevenueCat (dane o zakupach do usługi zewnętrznej, wpis w etykiecie), własny moduł Swift (koszt utrzymania kodu natywnego bez Maca w środowisku agenta; expo-iap daje te same API StoreKit 2).

## Decyzja
- Biblioteka `expo-iap` 6.1.1, wtyczka `expo-iap` w `app.json`. Jedyny import biblioteki: `src/lib/platnosci/sklep.ts` (adapter).
- Źródło prawdy: `getAvailablePurchases({ onlyIncludeActiveItemsIOS: true })`, które w openiap-apple iteruje `Transaction.currentEntitlements` i odrzuca transakcje niezweryfikowane (źródło: `packages/apple/Sources/OpenIapStoreKitModule.swift`, funkcja `getAvailablePurchases`, odczyt 2026-10-19). Ta funkcja pomija transakcje z minioną datą końca, więc okres karencji (billing grace period) adapter czyta osobno z `subscriptionStatusIOS` (`state == "inGracePeriod"`, `gracePeriodExpirationDate`).
- Czysta logika `src/lib/platnosci/dostep.ts` (wzorzec modułu storekit-expo roli 02) z wektorami w `src/lib/__tests__/platnosci-dostep.test.ts`.
- Pamięć: JSON `{ produkty, wygasa }` w `app_settings` pod kluczem `platnosci_pamiec`, bez nowej migracji. Kopia zapasowa nie zawiera `app_settings`, więc import kopii nie nadaje dostępu. Błąd odczytu sklepu daje dostęp z pamięci najwyżej do końca opłaconego okresu; udany odczyt nadpisuje pamięć (zwrot czyści).
- Stare kolumny `app_access` (trial_started_at, trial_days, completed_bakes_count, signature, subscription_tier, subscription_expires_at) zostają w bazie bez migracji i nie są czytane. Klucz HMAC i `src/lib/app-access-crypto.ts` usunięte.
- Nasłuch transakcji od startu (`app/_layout.tsx` → `uruchomPlatnosci`); kolejność: odczyt uprawnień → zapis pamięci → `finishTransaction`. Przy błędzie odczytu transakcja zostaje niezakończona (StoreKit poda ją ponownie).

## Skutki
- Expo Go nie obsługuje kodu natywnego: potrzebny development build.
- Android poza planem 1.0: adapter używa tylko pól iOS.
- Testy w Node: atrapa `expo-iap` w `jest.setup.js` (tylko Jest). Testy na urządzeniu (sandbox/TestFlight) to krok właściciela.

## Potwierdzenie
- Node: `platnosci-dostep`, `platnosci-stan`, `platnosci-hook`, `platnosci-pamiec.sqlite` (bazy z buildów 70fd81a, adfe1fa, b21c194).
- Urządzenie (krok właściciela, wynik z datą i buildem): zakup każdego planu, ponowna instalacja, tryb samolotowy, przywrócenie na drugim urządzeniu, zwrot.
- [DO USTALENIA] czy `Transaction.currentEntitlements` zwraca transakcję jeszcze niezakończoną — adapter dokłada transakcję z nasłuchu, więc dostęp nie zależy od odpowiedzi; potwierdzić w sandboksie.
- [DO USTALENIA] czy ustawienie pliku `.storekit` w schemacie Xcode przetrwa `expo prebuild` (projekt generuje `ios/`).
