# Zrzut ekranu zakupu dla App Review (krok właściciela)

Decyzja właściciela KO-033 (2026-11-10): „Jak w treningu” (D-365). Trening zrobił to tak (Z-24): plik z E2E ze sztucznym sklepem, który właściciel wgrał ręcznie przy każdym z 3 produktów.

## Skąd plik

- Workflow **iOS E2E** (`.github/workflows/e2e-ios.yml`). Po scenariuszach Basic idzie trzeci build: Basic z atrapą ofert (`EXPO_PUBLIC_STORE_FAKE=1`). Atrapa daje trzy plany z cenami bazowymi USD z `docs/wydanie/ceny.json`: $6.99 rocznie, $0.99 miesięcznie i $14.99 jednorazowo. Kod: `src/lib/platnosci/sklep.ts`.
- Scena `.maestro/e2e-zakup/01-ekran-zakupu.yaml`, symulator po angielsku (en_US). Ekran Pro otwiera się z widoku miesiąca, a zrzut powstaje po pojawieniu się planów.
- Plik leży w artefakcie `maestro-e2e` przebiegu (retencja 7 dni), pod ścieżką `.maestro/e2e-zakup/zrzuty-e2e/review-zakup.png`.
- Build TestFlight odrzuca tę flagę (`testflight.yml`, krok „Guard against test/mock flags”). Pilnuje tego test `src/lib/__tests__/atrapa-ofert-e2e.test.ts`.

## Kroki (ok. 10 min, raz przed zgłoszeniem 1.0)

1. W GitHub Actions otwórz przebieg **iOS E2E** na kodzie kandydata do wydania i pobierz artefakt `maestro-e2e`.
2. Rozpakuj go i otwórz `review-zakup.png`. Sprawdź, że widać trzy plany z cenami i że nie ma stanu „Offer temporarily unavailable”.
3. W App Store Connect dla każdego z 3 produktów (miesięczny, roczny, dożywotni; ID w `src/lib/platnosci/konfiguracja.ts`, `PRODUKTY`) otwórz sekcję Review Information. W polu **App Review Screenshot** wgraj ten sam plik.
4. Zapisz w `docs/wydanie/dziennik.md`: datę, ID przebiegu E2E i „wgrane ręcznie przy 3 produktach”.

Apple o tym polu (In-App Purchase information, odczyt 2026-11-10, developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information/): „A screenshot of the In-App Purchase that clearly shows the item or service being offered. This screenshot is used for review only and isn't displayed on the App Store.” oraz „Once you’ve uploaded a screenshot, you can update it but not remove it.”

## Ograniczenia

- Ceny na zrzucie to ceny bazowe USD z `ceny.json`, a nie odczyt sklepu. Zmiana cen wymaga zmiany atrapy, a test pilnuje, żeby obie wartości były równe.
- `scripts/asc-zgloszenie.mjs` nadal wgrałby plik przez API, gdyby leżał w `docs/wydanie/zrzuty/review/zakup.png` (`zrzutZakupu`). Ta droga zostaje jako zapasowa. Domyślna jest ręczna, jak w Treningu.
- Przebiegu E2E z trzecim buildem jeszcze nie było (stan 2026-11-10). Pierwszy przebieg na macOS zleca koordynator.
