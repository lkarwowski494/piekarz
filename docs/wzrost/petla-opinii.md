# Pętla opinii — specyfikacja dla roli 08 (F-69)

Rola 11 (Wzrost), tryb fix, 2026-10-20. Decyzja: **DEC-13 (a)** planu napraw M1 („Prośba o ocenę po udanym bochenku, kontakt w Ustawieniach, KPI zapisane jako hipotezy z progami”), **D-042** (udany wypiek = ocena co najmniej 4★). Wymagania: BR-OPIN-001…003 (`docs/brd/wymagania-dziennik.md` na gałęzi roli 03), F-69 w kontrakcie zakresu (D-043). Kod wdraża rola 08 pod ID zadania z nagłówka sekcji; ten plik daje zachowanie, wartości i wektory.

*Dlaczego osobny plik:* specyfikacja ma jedno miejsce, z którego 08 pisze test, a 07 sprawdza wydanie; teksty interfejsu daje rola 04.

## 1. Systemowa prośba o ocenę i link „Oceń w App Store” (M1-audytor-generalny-082; 11-wzrost-004)

### 1.1 Źródła (odczyt 2026-10-20, surowy tekst przez `curl`, kopie w raporcie roli 11)

| Fakt | Źródło | Cytat |
|---|---|---|
| limit systemu | developer.apple.com/documentation/storekit/requestreviewaction (JSON dokumentacji) | „StoreKit displays the ratings and review request a maximum of three times within a 365-day period.” |
| nie z przycisku | tamże | „Because this API may not present an alert, don’t call it in response to a button tap or other user action.” |
| TestFlight | tamże | „this method has no effect in apps that you distribute for beta testing using TestFlight.” |
| stały link | tamże | „Append the query parameter `action=write-review` to your product page URL” |
| moment | developer.apple.com/documentation/storekit/requesting-app-store-reviews | „at the end of a sequence of events that they successfully complete.”; „Avoid showing a request for a review immediately when a user launches your app” |
| API Expo (SDK 57, projekt `expo ~57.0.26`) | docs.expo.dev/versions/v57.0.0/sdk/storereview/ | `isAvailableAsync()`: „On iOS, it will resolve to true unless the app is distributed through TestFlight.”; `storeUrl()` czyta `Constants.expoConfig.ios.appStoreUrl`; „Don't ask the user any questions before or while presenting the rating button or card.” |
| wersja paczki | `npm view expo-store-review dist-tags` | `"sdk-57": "57.0.3"` |
| przestarzałe API | developer.apple.com/documentation/storekit/skstorereviewcontroller (metadane) | `"deprecatedAt":"18.0"`, „Use AppStore.requestReview(in:).” Strona Expo opisuje moduł jako opakowanie `SKStoreReviewController`; czy wersja 57.0.3 używa już `AppStore.requestReview(in:)`, sprawdza 08 w źródle paczki `[DO USTALENIA]`. Przestarzałe nie znaczy usunięte: ryzyko niskie, do obserwacji przy SDK 58 |
| własne okno zakazane | wytyczna 5.6.1 (S-62 w `docs/brd/zrodla.md` roli 01) | „we will disallow custom review prompts” |

### 1.2 Czysta funkcja warunku

Plik: `src/lib/prosba-o-ocene.ts` (nowy, bez importów z React Native, DEV-01). Stałe w tym samym pliku albo w module konfiguracji (ARCH-05):

```ts
export const PROSBA_O_OCENE = {
  minOcenaGwiazdki: 4,   // D-042
  maksProsbWOknie: 3,    // S-63: „a maximum of three times within a 365-day period”
  oknoDni: 365,          // S-63
} as const;

export interface WarunekProsby {
  ocenaWypieku: number | null;            // gwiazdki wybrane przez użytkownika; null, gdy ich nie dotknął
  datyPoprzednichProsb: readonly number[]; // ms od epoki, każde wywołanie requestReview()
  teraz: number;                           // ms od epoki
}
export function czyProsicOOcene(we: WarunekProsby): boolean;
```

Zachowanie (kolejno):
1. `ocenaWypieku` nie jest liczbą całkowitą 1–5 → `false`.
2. `ocenaWypieku < 4` → `false` (D-042; przy ≤ 2 działa propozycja Doktora, `src/lib/doctor-suggestion.ts`).
3. Policz daty z `datyPoprzednichProsb`, które są `> teraz − 365 × 86 400 000` albo nie są liczbą skończoną (data w przyszłości i uszkodzony zapis liczą się do limitu: przy wątpliwości nie prosimy). Wynik `≥ 3` → `false`.
4. W przeciwnym razie `true`.

Granica okna: data dokładnie 365 dni temu już się nie liczy (wektor W11), o 1 ms młodsza liczy się (W12).

Wektory: `docs/wzrost/wektory-prosba-o-ocene.json` (W01–W15 dla funkcji, M01–M06 dla miejsca wywołania). Test 08: `src/lib/__tests__/prosba-o-ocene.test.ts` czyta ten plik i sprawdza każdy wektor; czerwony przed dodaniem funkcji (brak modułu). Wektory sprawdzono na implementacji referencyjnej roli 11 (15/15 zgodnych; wariant bez limitu 3/365 daje 4 niezgodności, czyli wektory rozróżniają błąd).

*Dlaczego własny limit, skoro system też ogranicza:* bez niego aplikacja wołałaby API po każdym udanym bochenku, a test akceptacyjny wymaga sprawdzalnego warunku „najwyżej 3 razy w roku” bez urządzenia.

### 1.3 Miejsce wywołania

- Plik: `app/(tabs)/stolnica.tsx`, w `handleSaveFinishBake`, **po** udanym `finishBake(...)`, zamknięciu okna (`setIsFinishModalOpen(false)`), `loadHistory()` i obok `suggestDoctorAfterRating(...)` (dziś linia 324). Zakresy ocen są rozłączne (Doktor ≤ 2, prośba ≥ 4), więc oba okna nie pojawią się razem.
- Opakowanie z efektami: `src/lib/prosba-o-ocene-wywolanie.ts` (`poprosOOceneJesliWarto(ocena: number | null)`):
  1. `await StoreReview.isAvailableAsync()` i `await StoreReview.hasAction()`; którekolwiek `false` → koniec (M01, M02);
  2. odczyt dat z `getAppSetting('prosba_o_ocene_daty')` (`src/data/settings-store.ts`, JSON tablicy liczb; błąd parsowania → traktuj jak `[NaN]`, nie jak pustą listę);
  3. `czyProsicOOcene({ ocenaWypieku, datyPoprzednichProsb, teraz: Date.now() })`; `false` → koniec;
  4. wywołanie po zakończeniu animacji zamknięcia okna (`InteractionManager.runAfterInteractions` albo `onDismiss` modala), nie w obsłudze dotknięcia „Zapisz”: prośba jest skutkiem ukończonej sekwencji, nie działaniem przycisku [OCENA: odczyt zdania Apple o „button tap” jako zakazu przycisku, który sam prosi o ocenę];
  5. `await StoreReview.requestReview()`; sukces → dopisz `Date.now()` i zapisz (`setAppSetting`); błąd → połknięty, bez komunikatu i bez zapisu daty (M05).
- **Ocena „wybrana przez użytkownika”:** formularz startuje z 5★ (`useState<number>(5)`, `app/(tabs)/stolnica.tsx:88`). Do warunku idzie `finishRating` tylko wtedy, gdy użytkownik dotknął gwiazdki w tym oknie (flaga ustawiana w `onRatingChange`); inaczej `null` (W06). *Dlaczego:* D-042 mówi o wypieku „ocenionym przez użytkownika”; domyślne 5★ nie jest oceną. Domyślna wartość gwiazdek to osobne znalezisko dla 04 (raport roli 11, fix p4).
- Bez pytania „czy podoba ci się aplikacja” przed prośbą i bez nagrody (5.6.1, sekcja 3 wytycznych, BR-OPIN-001 „Bez własnego okna”).
- Daty próśb nie wchodzą do eksportu ani kopii zapasowej (to nie są dane użytkownika o wypiekach); nie opuszczają urządzenia. Czy zapis mieści się w wyjątku art. 399 ust. 3 Prawa komunikacji elektronicznej, `[DO USTALENIA]` (rola 05, inwentarz prywatności).

### 1.4 Link „Oceń w App Store” (BR-OPIN-002)

- Stała w `src/lib/links.ts`:
  ```ts
  export const APP_STORE_ID = '[DO USTALENIA: Apple ID aplikacji z App Store Connect]';
  export const APP_STORE_REVIEW_URL = `https://apps.apple.com/app/apple-store/id${APP_STORE_ID}?action=write-review`;
  ```
  Format adresu jak w przykładzie Expo SDK 57 (`https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`). Apple ID (liczba) właściciel odczytuje w App Store Connect → aplikacja → App Information → Apple ID (krok właściciela). Ten sam adres bez parametru wpisać jako `expo.ios.appStoreUrl` w `app.json`, żeby `StoreReview.storeUrl()` zwracał właściwą stronę.
- Wiersz w Ustawieniach (`src/components/settings/StudioEcosystemSection.tsx`, karta obok „Polityka prywatności”, ten sam styl `linkRow` z `minHeight: 44`): `Linking.openURL(APP_STORE_REVIEW_URL)`, `accessibilityRole="link"`, `testID="settings-rate-link"`. Nigdy `requestReview()` z tego wiersza (M04).
- Dopóki `APP_STORE_ID` jest znacznikiem `[DO USTALENIA…]` (nie same cyfry), wiersz się nie renderuje; test 08 sprawdza, że adres ze znacznikiem nie trafia do `openURL`.
- Brak sieci: `Linking.openURL` otwiera aplikację App Store systemu; aplikacja sama nie łączy się z siecią (CLAUDE.md, zakaz `fetch`). Gdy `openURL` odrzuci obietnicę, komunikat 04 „Ocena wymaga połączenia z App Store” (BR-OPIN-002, „Brak sieci”), aplikacja działa dalej.
- Teksty („Oceń w App Store”, komunikat braku sieci) projektuje rola 04 i przechodzą przez `npm run check:i18n` (PL i EN).

### 1.5 Zależność i wydanie

- `npx expo install expo-store-review` (dla SDK 57 tag `sdk-57` = 57.0.3); po instalacji `npm run check:licenses`, `npm run verify:native` (moduł natywny, nowy build).
- 07: W TestFlight prośba się nie pokaże („no effect”), więc dowód działania to test Jest wektorów i miejsca wywołania; ręczny test na urządzeniu z buildem deweloperskim (ta sama strona Apple: „When your app calls this method while it’s in development mode, StoreKit always displays the rating and review request view”).
