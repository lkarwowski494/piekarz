# Macierz Testów (AST Coverage Matrix) — PIEKARZ (CRUST)

Wygenerowano automatycznie przez `scripts/test-matrix.mjs` zgodnie z wymaganiami **BR-TEST-028..031**.
Zasada dowodu: wyłącznie wykonywalny kod testu (wycięte komentarze, importy i opisy `test`/`describe`).

## Podsumowanie Pokrycia

| Kategoria | Łącznie | Pokryte | Pokrycie % | Status |
| :--- | :---: | :---: | :---: | :---: |
| **EKRAN** | 9 | 9 | **100.0%** | ✅ POKRYTE |
| **UI** | 60 | 60 | **100.0%** | ✅ POKRYTE |
| **TEKST** | 604 | 604 | **100.0%** | ✅ POKRYTE |
| **LOGIKA** | 595 | 595 | **100.0%** | ✅ POKRYTE |
| **WYMIAR** | 218 | 218 | **100.0%** | ✅ POKRYTE |

Łącznie elementów: **1486** | Pokrytych: **1486** | Brakujących: **0**

## Szczegółowa Lista Elementów

| Kategoria | Nazwa elementu | Plik źródłowy | Status | Pliki testowe |
| :--- | :--- | :--- | :---: | :--- |
| `EKRAN` | `/(tabs)/(dzis)/index` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/(tabs)/dziennik/index` | `app/(tabs)/dziennik/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/(tabs)/receptury/harmonogram` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/duzy-tekst-kroj.test.ts, tests/emoji-teksty-techniczne.test.ts |
| `EKRAN` | `/(tabs)/receptury/index` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/(tabs)/receptury/receptura` | `app/(tabs)/receptury/receptura.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/instrukcja-ustawien.test.ts |
| `EKRAN` | `/(tabs)/zakwasy/doktor-zakwasu` | `app/(tabs)/zakwasy/doktor-zakwasu.tsx` | ✅ | tests/nawigacja-d051.test.tsx, src/core/__tests__/starter-doctor.test.ts |
| `EKRAN` | `/(tabs)/zakwasy/index` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/doktor` | `app/doktor.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/instrukcja-ustawien.test.ts |
| `EKRAN` | `/stolnica` | `app/stolnica.tsx` | ✅ | tests/duzy-tekst-kroj.test.ts, tests/interaction-guards.test.ts |
| `TEKST` | `Co dziś robisz?` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/maestro-runner.ts, src/__tests__/dzis-d4b.test.tsx |
| `TEKST` | `Dziś` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/check-i18n-gate.test.ts, tests/czeka-na-przeklad-093.test.ts |
| `TEKST` | `Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.` | `app/(tabs)/(dzis)/index.tsx` | ✅ | src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Dziennik` | `app/(tabs)/dziennik/index.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Doktor Chleba` | `app/(tabs)/dziennik/index.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Jutro` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/helpers/plan-godzina.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Pojutrze` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/helpers/plan-godzina.ts, tests/i18n-en-main-flow.test.tsx |
| `TEKST` | `Wczoraj` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | src/lib/__tests__/schedule-formatter.test.ts, src/lib/__tests__/zakwas-widok.test.tsx |
| `TEKST` | `Notatka z poprzedniego wypieku: {notatka}` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | src/__tests__/piecz-ponownie-recp003-146.test.tsx |
| `TEKST` | `Receptura bazowa zmieniła się od tamtego wypieku: ma teraz więcej drożdży.` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/piecz-ponownie-id-d3a.test.tsx |
| `TEKST` | `Plan nie sprawdza godzin snu. Możesz je ustawić w Ustawieniach.` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | src/__tests__/godziny-snu-130.test.tsx |
| `TEKST` | `Klasyczny chleb rzemieślniczy` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/__tests__/harmonogram-piekarnik-d6.test.tsx |
| `TEKST` | `Najpierw ustaw godzinę, na którą zdążysz.` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | src/__tests__/plan-za-pozno-107.test.tsx |
| `TEKST` | `Receptury` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/helpers/wypiek.ts |
| `TEKST` | `Rodzaj receptur` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przelicznik objętości` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/metadane-sklepu.test.ts |
| `TEKST` | `Skanuj QR` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Usunięto recepturę` | `app/(tabs)/receptury/index.tsx` | ✅ | src/__tests__/usun-recepture-cofnij-161.test.tsx |
| `TEKST` | `Więcej działań: receptura` | `app/(tabs)/receptury/receptura.tsx` | ✅ | src/lib/__tests__/menu-receptury.test.ts, src/__tests__/pas-zakladek-d10.test.tsx |
| `TEKST` | `Więcej` | `app/(tabs)/receptury/receptura.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dzień {n}` | `app/(tabs)/zakwasy/doktor-zakwasu.tsx` | ✅ | src/lib/__tests__/zakwas-widok.test.tsx |
| `TEKST` | `Co widzisz?` | `app/(tabs)/zakwasy/doktor-zakwasu.tsx` | ✅ | src/lib/__tests__/zakwas-widok.test.tsx |
| `TEKST` | `Mąka pszenna chlebowa t750` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/core/__tests__/flour-atlas.test.ts |
| `TEKST` | `przed chwilą` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Dokarmiono zakwas` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/storage-write-failure-screen.test.tsx |
| `UI` | `Zarejestrowano dokarmienie zakwasu „{name}”.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Profil zakwasu` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Zapisano zaktualizowany profil` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mąka pszenna chlebowa` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/matrix-invariants.test.ts |
| `UI` | `Dodano zakwas` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Kultura „{name}” została utworzona.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Kopiuj jako tekst` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `UI` | `Skopiowano proporcje dokarmiania do schowka` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nie masz jeszcze zakwasu. Dodaj zakwas, który masz, albo załóż nowy.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | src/__tests__/dane-przykladowe-087.test.tsx |
| `TEKST` | `Akademia Piekarza` | `app/doktor.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akademia` | `app/doktor.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szkoła Chleba, 12 technik rzemieślniczych i Trener procentu` | `app/doktor.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij Akademię` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szkoła Chleba` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Techniki` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `POZIOM` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaliczona` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `hydratacji` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/zaczyny-131.test.ts |
| `TEKST` | `soli` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/zaczyny-131.test.ts |
| `TEKST` | `Fermentacja i prowadzenie:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kroki technologiczne:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Fizjologia i chemia:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kryterium zaliczenia:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Lekcja ukończona (stuknij, aby cofnąć)` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/bread-academy-modal.test.tsx |
| `TEKST` | `Oznacz lekcję jako zaliczoną` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wszystkie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/martwe-klucze-oferty-203.test.ts |
| `TEKST` | `Wyrabianie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Składania` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Formowanie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/wstawki-angielskie-112.test.ts |
| `TEKST` | `Wypiek i studzenie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Prawidłowe wykonanie:` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Czego unikać (typowe błędy):` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Złota rada rzemieślnika:` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `wymaga Piekarz Pro` | `src/components/BlokadaFunkcji.tsx` | ✅ | tests/nazwa-d053.test.ts, tests/store-metadata.test.ts |
| `TEKST` | `Temperatura wody` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Uzupełnij pole „{pole}”, żeby policzyć temperaturę wody.` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | src/__tests__/temperatura-wody-kalk004-146.test.tsx |
| `TEKST` | `Docelowa temp. wody:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/receptura-akcje-057.test.tsx |
| `TEKST` | `Docelowe DDT` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Obniż docelową temperaturę ciasta` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Podnieś docelową temperaturę ciasta` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Chłonność mąk:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/bialko-ukryte-e7.test.tsx |
| `TEKST` | `zalecana` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ułóż plan` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Zapisz jako moją` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zmień składniki` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/maestro-runner.ts, tests/slownik-akcji.test.ts |
| `UI` | `Skaner QR` | `src/components/calculator/CalculatorModalsProvider.tsx` | ✅ | tests/metadane-sklepu.test.ts, src/__tests__/skaner-qr-brak-modulu.test.tsx |
| `UI` | `Skaner QR jest niedostępny w tej wersji aplikacji.` | `src/components/calculator/CalculatorModalsProvider.tsx` | ✅ | src/__tests__/skaner-qr-brak-modulu.test.tsx |
| `TEKST` | `Wprowadź unikalną nazwę dla tej proporcji składników` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Wpisz nazwę przepisu` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Anuluj` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/close-button-guard.test.tsx, tests/i18n-no-polish-in-en.test.tsx |
| `TEKST` | `Zapisz` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/i18n-no-polish-in-en.test.tsx |
| `TEKST` | `Zamknij` | `src/components/CloseButton.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/interaction-guards.test.ts |
| `TEKST` | `Baza danych nie otworzyła się przy poprzednim uruchomieniu` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | src/lib/__tests__/corrupt-rescue.test.tsx |
| `TEKST` | `Kopia plików bazy z tej chwili jest w aplikacji Pliki: Piekarz › Backup › kopie-ratunkowe.` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | src/lib/__tests__/corrupt-rescue.test.tsx |
| `TEKST` | `Zapisano opis błędu w pliku: {file}. Kopii plików bazy nie udało się wykonać.` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | src/lib/__tests__/corrupt-rescue.test.tsx |
| `TEKST` | `Rozumiem, zamknij komunikat ratunkowy` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ukryj` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/pasek-cofnij-czytnik-b9.test.tsx |
| `TEKST` | `Przepisy na Odrzut Zakwasu` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij przepisy na odrzut` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kuchnia zero-waste: krakersy, naleśniki, gofry i ciasteczka bez marnowania zakwasu` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Krakersy` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Naleśniki` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Gofry` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ciasteczka` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Podpłomyki` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `odrzutu` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{n} min` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/lib/__tests__/i18n.test.ts |
| `TEKST` | `Składniki:` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przygotowanie krok po kroku:` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wskazówka rzemieślnicza:` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wybierz objawy bochenka` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Krytyczny błąd struktury` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/diagnosis-formatter.test.ts |
| `TEKST` | `Umiarkowana wada` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/diagnosis-formatter.test.ts |
| `TEKST` | `Drobna niedoskonałość` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/diagnosis-formatter.test.ts |
| `TEKST` | `Przyczyna biologiczno-chemiczna:` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Co zrobić przy następnym wypieku:` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Otwórz recepturę` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wróć do wypieku` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kopiuj jako tekst` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `TEKST` | `Protokoły ratunkowe (Pogotowie ciasta)` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szybkie interwencje w trakcie fermentacji` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij protokół ratunkowy` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akcja natychmiastowa:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Kroki ratunkowe:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Fizjologia ciasta:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Kuchenne testy piekarskie` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Test palca` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Jak sprawdzić, czy bochenek w koszyku jest gotowy do pieczenia` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/stolnica-plan-steps.test.tsx |
| `TEKST` | `Szybko odskakuje:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Niedofermentowany. Pozostaw w cieple na kolejne 30–60 minut.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wraca powoli do połowy:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Optymalny moment. Rozgrzewaj piec i szykuj żyletkę.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Zostaje wgłębienie i ciasto siada:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Przerośnięty. Piecz bezzwłocznie, nacinaj bardzo płytko.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Test okna glutenowego` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/wstawki-wzorzec-112.test.ts |
| `TEKST` | `Ocena rozwoju siatki glutenowej po autolizie i składaniach` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ciasto rwie się przy rozciąganiu:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Słaby gluten. Wykonaj dodatkową serię składań coil fold.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Cienka, przezroczysta membrana:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Gluten perfekcyjnie rozwinięty. Gotowe do formowania wstępnego.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szybkie szablony typowych problemów` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Miękisz (Wnętrze bochenka)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wielkie dziury pod skórką i zbity dół (Jaskinie)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drobne, jednolite pęcherzyki jak gąbka/pianka` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mokry, lepki miękisz, brudzi nóż` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Jednolicie gęsty i ciężki miękisz (brak napowietrzenia)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Skórka i Kształt bochenka` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Chleb płaski jak dysk (rozlał się na boki)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Opadł / zapadł się natychmiast po nacięciu żyletką` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Rozerwanie boku przy spodzie` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Blada skórka, brak złocisto-karmelowego rumienia` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Brak otwartego ucha (nacięcie się zasklepiło)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Krojony gorący, prosto po wyjęciu z piekarnika` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Smak i Aromat` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zbyt kwaśny, octowy smak` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Płaski smak bez głębi (jałowy)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyczyść zaznaczone objawy` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `UI` | `Odrzucić zmiany?` | `src/components/DraftHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Odrzuć zmiany` | `src/components/DraftHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kreator mieszanki mąk` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dostosuj udział mąk. Suma musi wynosić dokładnie 100%.` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Proporcje poprawne (100%)` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyrównaj do 100%` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zmniejsz udział mąki {nazwa} o {n}%` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zwiększ udział mąki {nazwa} o {n}%` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Usuń mąkę: {nazwa}` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj mąkę z Atlasu` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Typy mąki pszennej i żytniej określają Polskie Normy PN-A-74022:2003 i PN-A-74032:2002 według zawartości popiołu.` | `src/components/FlourBlendModal.tsx` | ✅ | src/core/__tests__/flour-atlas-typy.test.ts, src/__tests__/maki-opis-ogolny-094.test.tsx |
| `TEKST` | `Zastosuj mieszankę` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Słownik Odpowiedników Mąk` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij słownik mąk` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Porównanie standardów przemiału: Polska, Francja, Włochy, Niemcy i USA/UK` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szukaj np. T65, Tipo 00, 550, Bread Flour...` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nie znaleziono odpowiednika dla podanej frazy.` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `wody` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Popiół:` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Białko:` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zastosowanie:` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Błąd` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/check-i18n-gate.test.ts, tests/matrix-ui-text.test.tsx |
| `UI` | `Podaj nazwę mąki` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Pomyślnie odliczono` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Zasoby mąki w spiżarni zostały zaktualizowane.` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Spiżarnia mąk (Magazyn)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/flour-inventory-modal.test.tsx |
| `TEKST` | `Kontrola zapasów mąk i powiadomienia o brakach` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wszystkie mąki z tej receptury są w spiżarni.` | `src/components/FlourInventoryModal.tsx` | ✅ | src/components/__tests__/flour-inventory-modal.test.tsx |
| `TEKST` | `Odlicz zużycie z magazynu` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Twoje zapasy mąk` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Odejmij {g} g mąki {nazwa}` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj {g} g mąki {nazwa}` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Usuń` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj mąkę do spiżarni` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wybierz z Atlasu lub wpisz własną` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nazwa mąki (np. Pszenna typ 750)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Początkowy stan zapasów (g)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zapisz w spiżarni` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj nową mąkę` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wydarzenie w kalendarzu telefonu się nie zmieniło. Godziny zmienisz tam sam albo dodasz plan jeszcze raz.` | `src/components/harmonogram/DodajDoKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts |
| `UI` | `Dodaj do kalendarza` | `src/components/harmonogram/DodajDoKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Dodaj do kalendarza` | `src/components/harmonogram/DodajDoKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Plan trafi do kalendarza telefonu jako plik z wydarzeniem. Piekarz nie dostaje dostępu do Twojego kalendarza.` | `src/components/harmonogram/DodajDoKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts |
| `TEKST` | `Zaplanuj` | `src/components/harmonogram/PasekStartu.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/core/__tests__/plany-d5.test.ts |
| `TEKST` | `Zacznij wypiek` | `src/components/harmonogram/PasekStartu.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Ustaw tę godzinę` | `src/components/harmonogram/PlanZaPozno.tsx` | ✅ | src/__tests__/plan-za-pozno-107.test.tsx |
| `TEKST` | `Start {dzien} o {godzina}` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Całość trwa {czas}.` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `{krok} wypada o {godzina} w nocy` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Przesuń do lodówki` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/store-metadata.test.ts, src/__tests__/harmonogram-screen.test.tsx |
| `TEKST` | `Ochrona snu aktywna` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu ({od} – {do}).` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | src/__tests__/godziny-snu-130.test.tsx |
| `UI` | `{n} min` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/lib/__tests__/i18n.test.ts |
| `TEKST` | `Kiedy chleb ma być gotowy?` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | src/__tests__/harmonogram-screen.test.tsx, src/__tests__/plan-uklad-128.test.tsx |
| `TEKST` | `W tym dniu zmienia się czas, a wybranej godziny nie ma. Chleb będzie gotowy o {godzina}.` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts |
| `TEKST` | `Temperatura w kuchni:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/dziennik-recp003-146.test.tsx |
| `TEKST` | `Wpływa na tempo fermentacji burzliwej: 10 °C niżej to około 3 razy dłuższa fermentacja (przybliżenie z modelu badawczego, ważne w 20–26 °C).` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Oś czasu przygotowania` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ręce tylko na starcie` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | src/__tests__/reka-na-starcie-d6.test.tsx |
| `TEKST` | `Pasywne` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wymaga obecności` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `W nocy` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Godziny snu:` | `src/components/harmonogram/UstawieniaPlanu.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/harmonogram-screen.test.tsx |
| `TEKST` | `Bez godzin snu` | `src/components/harmonogram/UstawieniaPlanu.tsx` | ✅ | src/__tests__/godziny-snu-130.test.tsx, src/__tests__/plan-bez-nocy-129.test.tsx |
| `TEKST` | `Czas w lodówce:` | `src/components/harmonogram/UstawieniaPlanu.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/harmonogram-screen.test.tsx |
| `TEKST` | `Elastyczny bufor regulujący porę formowania i pieczenia` | `src/components/harmonogram/UstawieniaPlanu.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/zyto-bez-lodowki-d7.test.tsx |
| `UI` | `Błąd schowka` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie udało się odczytać zawartości schowka.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaimportowano recepturę` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przepis „{name}” został pomyślnie dodany do Twojej bazy.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Błąd zapisu` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie zapisałem receptury. Spróbuj jeszcze raz.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Importuj recepturę` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/import-z-pliku-113.test.tsx |
| `TEKST` | `Wklej kod JSON udostępniony przez innego piekarza` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wklej ze schowka` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyczyść wklejony tekst` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyczyść` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/sieroty-slownikow-p13a.test.ts |
| `TEKST` | `Wklej kod JSON receptury tutaj...` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Możesz zaimportować plik JSON wygenerowany z Piekarza lub ręcznie przygotowany szablon.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nieprawidłowy format` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/settings-modal.test.tsx |
| `TEKST` | `Poprawna formuła` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mieszanka mąk (100%):` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Woda` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Sól` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts |
| `TEKST` | `Zakwas\|składnik` | `src/components/ImportRecipeModal.tsx` | ✅ | src/lib/__tests__/en-kontrola-074.test.ts, src/lib/__tests__/i18n-kontekst.test.ts |
| `TEKST` | `Zaimportuj przepis` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{h} {co}` | `src/components/kalendarz/ArkuszDnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/lib/__tests__/kalendarz-teksty-d4a.test.ts |
| `UI` | `Zaplanuj wypiek na ten dzień` | `src/components/kalendarz/ArkuszDnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-plany-d5.test.tsx |
| `TEKST` | `Zaplanuj wypiek na ten dzień` | `src/components/kalendarz/ArkuszDnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-plany-d5.test.tsx |
| `TEKST` | `Tego dnia nic nie zaplanowano.` | `src/components/kalendarz/ArkuszDnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-d4b.test.tsx |
| `TEKST` | `Najbliższe dni` | `src/components/kalendarz/ArkuszDnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-d4b.test.tsx |
| `TEKST` | `{dzien}: piekarnik zajęty o {h}` | `src/components/kalendarz/LiniaPiekarnika.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts |
| `TEKST` | `Nic w planach` | `src/components/kalendarz/MiesiacKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/lib/__tests__/kalendarz-pasek-d4b.test.ts |
| `TEKST` | `Tydzień` | `src/components/kalendarz/NawigacjaKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-kalendarz-d7.test.tsx |
| `TEKST` | `Miesiąc` | `src/components/kalendarz/NawigacjaKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/lib/__tests__/nazwy-pro-pb.test.ts |
| `UI` | `Poprzedni tydzień` | `src/components/kalendarz/NawigacjaKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-kalendarz-d7.test.tsx |
| `UI` | `Poprzedni miesiąc` | `src/components/kalendarz/NawigacjaKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-kalendarz-d7.test.tsx |
| `UI` | `Następny tydzień` | `src/components/kalendarz/NawigacjaKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-kalendarz-d7.test.tsx |
| `UI` | `Następny miesiąc` | `src/components/kalendarz/NawigacjaKalendarza.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-kalendarz-d7.test.tsx |
| `TEKST` | `Ten tydzień` | `src/components/kalendarz/PasekTygodnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-d4b.test.tsx |
| `TEKST` | `Pokaż cały tydzień` | `src/components/kalendarz/PasekTygodnia.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/dzis-d4b.test.tsx |
| `TEKST` | `Powiadomienia wyłączone` | `src/components/NotificationsOffBanner.tsx` | ✅ | src/lib/__tests__/notifications.test.tsx, src/__tests__/notifications-pending.test.tsx |
| `TEKST` | `Zegar działa w aplikacji, ale przy zablokowanym telefonie nie przypomni o końcu kroku ani o karmieniu.` | `src/components/NotificationsOffBanner.tsx` | ✅ | src/lib/__tests__/notifications.test.tsx |
| `TEKST` | `Otwórz Ustawienia` | `src/components/NotificationsOffBanner.tsx` | ✅ | src/lib/__tests__/notifications.test.tsx |
| `TEKST` | `Oferta chwilowo niedostępna. Spróbuj ponownie za chwilę.` | `src/components/oferta/KomunikatBezSieci.tsx` | ✅ | src/components/__tests__/oferta-audyt-a3-c4-c5.test.tsx |
| `TEKST` | `Nie ma połączenia z App Store, więc zakup i przywrócenie zakupów teraz się nie udadzą. Reszta aplikacji działa jak dotąd. Sprawdź internet i spróbuj ponownie.` | `src/components/oferta/KomunikatBezSieci.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/oferta-piekarz-pro-127.test.tsx |
| `TEKST` | `Roczny` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Miesięczny` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Dożywotni` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/martwe-klucze-oferty-203.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `{cena} rocznie` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ekran-zakupu-ujawnienia.test.tsx |
| `TEKST` | `{cena} miesięcznie` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ekran-zakupu-ujawnienia.test.tsx |
| `TEKST` | `{cena} jednorazowo` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ekran-zakupu-ujawnienia.test.tsx |
| `TEKST` | `Kup dostęp dożywotni` | `src/components/oferta/stan-oferty.ts` | ✅ | src/components/__tests__/oferta-piekarz-pro-127.test.tsx, src/components/__tests__/paywall-modal.test.tsx |
| `TEKST` | `Kup plan roczny` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, tests/store-metadata.test.ts |
| `TEKST` | `Kup plan miesięczny` | `src/components/oferta/stan-oferty.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ekran-zakupu-ujawnienia.test.tsx |
| `TEKST` | `Pro` | `src/components/OznaczeniePro.tsx` | ✅ | tests/asc-ustawienia.test.ts, tests/asc-zgloszenie.test.ts |
| `TEKST` | `Przywróć` | `src/components/PasekCofnij.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `TEKST` | `Co daje Pro` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Planowanie: plan wstecz od godziny „gotowe” z ochroną snu i czasem fermentacji z temperatury, wypieki na kolejne dni, dwa wypieki naraz, widok miesiąca i plan w kalendarzu telefonu.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Zakwas: przypomnienia o dokarmianiu, proporcje dokarmiania, gotowość zakwasu do ciasta, stały dzień karmienia w lodówce i kolejne zakwasy.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Liczenie: zaczyn poolish, biga, stare ciasto albo levain w recepturze.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/ekran-pro-pb.test.tsx |
| `TEKST` | `Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, src/__tests__/ekran-pro-pb.test.tsx |
| `UI` | `Zakup czeka na zatwierdzenie` | `src/components/PaywallModal.tsx` | ✅ | src/components/__tests__/oferta-audyt-a3-c4-c5.test.tsx |
| `UI` | `Gdy zakup zostanie zatwierdzony, Piekarz Pro włączy się sam. Nie trzeba kupować ponownie.` | `src/components/PaywallModal.tsx` | ✅ | src/components/__tests__/oferta-audyt-a3-c4-c5.test.tsx |
| `UI` | `Zakup` | `src/components/PaywallModal.tsx` | ✅ | tests/asc-zgloszenie.test.ts, tests/matrix-ui-text.test.tsx |
| `UI` | `Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.` | `src/components/PaywallModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/oferta-piekarz-pro-127.test.tsx |
| `TEKST` | `Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.` | `src/components/PaywallModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ekran-zakupu-ujawnienia.test.tsx |
| `TEKST` | `Zakup wymaga połączenia z App Store.` | `src/components/PaywallModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/oferta-piekarz-pro-127.test.tsx |
| `TEKST` | `Przywróć zakupy` | `src/components/PaywallModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `TEKST` | `Warunki użytkowania` | `src/components/PaywallModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Polityka prywatności` | `src/components/PaywallModal.tsx` | ✅ | tests/emoji-teksty-techniczne.test.ts, tests/kontakt-przeklad-f1.test.ts |
| `TEKST` | `Piekarz Pro` | `src/components/PaywallModal.tsx` | ✅ | tests/asc-ustawienia.test.ts, tests/atrapa-asc-zgloszenie.ts |
| `TEKST` | `Piekarz Pro jest aktywny.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zarządzaj subskrypcją` | `src/components/PaywallModal.tsx` | ✅ | tests/martwe-klucze-oferty-203.test.ts, tests/slownik-akcji.test.ts |
| `TEKST` | `Basic zostaje bezpłatny na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Jedna opłata, bez odnawiania.` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Spróbuj ponownie` | `src/components/PaywallModal.tsx` | ✅ | tests/czeka-na-przeklad-093.test.ts, tests/martwe-klucze-oferty-203.test.ts |
| `UI` | `Przywróć zakupy` | `src/components/przywroc-zakupy.ts` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `UI` | `Zakupy zostały pomyślnie przywrócone` | `src/components/przywroc-zakupy.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/przywracanie-zakupow.test.tsx |
| `UI` | `Nie znaleziono aktywnych zakupów` | `src/components/przywroc-zakupy.ts` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/przywracanie-zakupow.test.tsx |
| `UI` | `Nie udało się połączyć z App Store. Spróbuj ponownie.` | `src/components/przywroc-zakupy.ts` | ✅ | src/__tests__/przywracanie-zakupow.test.tsx |
| `TEKST` | `Skanuj Kod QR` | `src/components/QrScannerModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dostęp do Aparatu` | `src/components/QrScannerModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Aparat jest potrzebny, aby natychmiast zeskanować kod QR receptury od innego piekarza w 100% offline.` | `src/components/QrScannerModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/en-kontrola-074.test.ts |
| `TEKST` | `Zezwól na dostęp do aparatu` | `src/components/QrScannerModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Skieruj obiektyw na kod QR receptury` | `src/components/QrScannerModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zakwas ({n}% wody)` | `src/components/receptury/DoMiski.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Bochenki` | `src/components/receptury/DoMiski.tsx` | ✅ | tests/emoji-teksty-techniczne.test.ts, tests/matrix-ui-text.test.tsx |
| `UI` | `Mniej bochenków` | `src/components/receptury/DoMiski.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |

*(... i 1186 kolejnych elementów w pełnym wykazie)*
