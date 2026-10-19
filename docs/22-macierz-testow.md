# Macierz Testów (AST Coverage Matrix) — PIEKARZ (CRUST)

Wygenerowano automatycznie przez `scripts/test-matrix.mjs` zgodnie z wymaganiami **BR-TEST-028..031**.
Zasada dowodu: wyłącznie wykonywalny kod testu (wycięte komentarze, importy i opisy `test`/`describe`).

## Podsumowanie Pokrycia

| Kategoria | Łącznie | Pokryte | Pokrycie % | Status |
| :--- | :---: | :---: | :---: | :---: |
| **EKRAN** | 5 | 5 | **100.0%** | ✅ POKRYTE |
| **UI** | 36 | 36 | **100.0%** | ✅ POKRYTE |
| **TEKST** | 468 | 468 | **100.0%** | ✅ POKRYTE |
| **LOGIKA** | 239 | 239 | **100.0%** | ✅ POKRYTE |
| **WYMIAR** | 80 | 80 | **100.0%** | ✅ POKRYTE |

Łącznie elementów: **828** | Pokrytych: **828** | Brakujących: **0**

## Szczegółowa Lista Elementów

| Kategoria | Nazwa elementu | Plik źródłowy | Status | Pliki testowe |
| :--- | :--- | :--- | :---: | :--- |
| `EKRAN` | `/(tabs)/doktor` | `app/(tabs)/doktor.tsx` | ✅ | tests/interaction-guards.test.ts, tests/maestro-runner.ts |
| `EKRAN` | `/(tabs)/harmonogram` | `app/(tabs)/harmonogram.tsx` | ✅ | tests/interaction-guards.test.ts, tests/maestro-runner.ts |
| `EKRAN` | `/(tabs)/index` | `app/(tabs)/index.tsx` | ✅ | tests/audit-fixes.test.tsx, tests/brands.contract.test.ts |
| `EKRAN` | `/(tabs)/stolnica` | `app/(tabs)/stolnica.tsx` | ✅ | tests/interaction-guards.test.ts, tests/maestro-runner.ts |
| `EKRAN` | `/(tabs)/zakwas` | `app/(tabs)/zakwas.tsx` | ✅ | tests/interaction-guards.test.ts, tests/matrix-dimensions.test.tsx |
| `TEKST` | `Doktor Chleba` | `app/(tabs)/doktor.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/diagnosis-formatter.test.ts |
| `TEKST` | `Diagnostyka błędów wypieku i ratowanie bochenka` | `app/(tabs)/doktor.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akademia Piekarza` | `app/(tabs)/doktor.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akademia` | `app/(tabs)/doktor.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szkoła Chleba, 12 technik rzemieślniczych i Trener procentu` | `app/(tabs)/doktor.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Harmonogram` | `app/(tabs)/harmonogram.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Harmonogram wsteczny z ochroną snu (Sleep Guard)` | `app/(tabs)/harmonogram.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kalkulator` | `app/(tabs)/index.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts |
| `TEKST` | `True Baker’s % & DDT` | `app/(tabs)/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ustawienia` | `app/(tabs)/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/notifications.test.tsx |
| `TEKST` | `Wypiek bez receptury` | `app/(tabs)/stolnica.tsx` | ✅ | src/__tests__/bake-journal-no-guess.test.tsx |
| `TEKST` | `Załadowano recepturę` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Parametry bochenka „{name}” zostały załadowane do kalkulatora.` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wypiek w garnku zakończony! Wyjmij chleb na kratkę.` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Stolnica` | `app/(tabs)/stolnica.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Asystent wypieku na żywo (Hands-in-flour)` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Doktor` | `app/(tabs)/stolnica.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Stolnica nie prowadzi jeszcze chleba żytniego. Kroki dla ciasta żytniego są w przygotowaniu, więc ten wypiek nie został rozpoczęty.` | `app/(tabs)/stolnica.tsx` | ✅ | src/__tests__/stolnica-plan-steps.test.tsx |
| `TEKST` | `Zakończ wypiek` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/stolnica-screen.test.tsx |
| `TEKST` | `Następny krok` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/notifications-pending.test.tsx |
| `TEKST` | `Odrzuć wypiek` | `app/(tabs)/stolnica.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/confirm.test.ts |
| `TEKST` | `przed chwilą` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{hours}h temu` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{days}d temu` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Dokarmiono zakwas` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/storage-write-failure-screen.test.tsx |
| `UI` | `Zarejestrowano dokarmienie zakwasu „{name}”.` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Profil zakwasu` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Zapisano zaktualizowany profil` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Dodano zakwas` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Kultura „{name}” została utworzona.` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie można usunąć` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Musisz posiadać co najmniej jeden profil zakwasu.` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Kopiuj dokarmienie` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Skopiowano proporcje dokarmiania do schowka` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Etykieta zakwasu` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie udało się wygenerować etykiety PDF` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zakwas` | `app/(tabs)/zakwas.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts |
| `TEKST` | `Profil, cykl dokarmiania i szczyt aktywności (Peak Timer)` | `app/(tabs)/zakwas.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij Akademię` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `lekcji` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szkoła Chleba` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Techniki` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `POZIOM` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaliczona` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `hydratacji` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `soli` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/recipe-sharing.test.ts |
| `TEKST` | `Fermentacja i prowadzenie:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kroki technologiczne:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Fizjologia i chemia:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kryterium zaliczenia:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Lekcja ukończona (stuknij, aby cofnąć)` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Oznacz lekcję jako zaliczoną` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wszystkie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/flour-inventory-modal.test.tsx |
| `TEKST` | `Wyrabianie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Składania` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Formowanie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/schedule-formatter.test.ts |
| `TEKST` | `Wypiek i studzenie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Prawidłowe wykonanie:` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Czego unikać (typowe błędy):` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Złota rada rzemieślnika:` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Strata wypiekowa i wilgotność miękiszu` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Strata Piecowa` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/ArtisanAccordionPro.test.tsx |
| `TEKST` | `Szacowany ubytek masy` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `upieczonego` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Strata piecowa` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/bake-loss.test.ts |
| `TEKST` | `Upieczony bochenek` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Odparowana woda` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Szacowana wilgotność miękiszu` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Kalkulator 4-DDT i Temperatura Wody` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Docelowa temp. wody:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zastąp część wody lodem:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `lodu` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/ArtisanAccordionPro.test.tsx |
| `TEKST` | `Docelowe DDT` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Hydratacja bazy` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Chłonność mąk:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `zalecana` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Białko` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mieszanka mąk` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Edytuj blend` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Skomponuj własną mieszankę mąk` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Spiżarnia mąk & Stan zapasów` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Słownik Odpowiedników Mąk` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaczyny rzemieślnicze (Preferments)` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Bezpośrednie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Udział mąki w zaczynie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/domain-error-branches.test.ts |
| `TEKST` | `Mąka w zaczynie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Woda w zaczynie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Parametry Rzemieślnicze & Mąki` | `src/components/calculator/ArtisanAccordionPro.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `4-DDT, matematyka lodu, prefermenty, strata piecowa` | `src/components/calculator/ArtisanAccordionPro.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kopiuj recepturę` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Klonuj recepturę` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Eksportuj JSON` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Udostępnij kod QR` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drukuj kartę A4 (PDF)` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Importuj JSON` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zapisz jako mój przepis` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Rozpocznij wypiek na Stolnicy` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Hydratacja` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Masa` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/bake-loss.test.ts |
| `TEKST` | `Mąka` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/audit-fixes.test.tsx, tests/i18n-no-polish-in-en.test.tsx |
| `TEKST` | `DDT` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/matrix-invariants.test.ts, tests/matrix-logic.test.ts |
| `TEKST` | `Bochenki` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Masa mąki` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Co dzisiaj pieczemy?` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/DoMiskiScaleCard.test.tsx |
| `TEKST` | `Liczba bochenków` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/DoMiskiScaleCard.test.tsx |
| `TEKST` | `Mniej` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Więcej` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Do miski na wagę` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/DoMiskiScaleCard.test.tsx |
| `TEKST` | `Odhaczaj składniki w miarę wsypywania` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mąka dodana` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/starter-converter-modal.test.tsx |
| `TEKST` | `Woda` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Aktywny zakwas` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `W szczycie aktywności` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Sól kłodawska / morska` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Całkowita masa ciasta:` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Receptury mistrzowskie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Przelicznik objętości` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Skanuj QR` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drukuj PDF` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Na zakwasie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Żytnie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drożdżowe` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Pizza i słodkie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Żytni` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/audit-fixes.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drożdżowy` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Pizza` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/DoMiskiScaleCard.test.tsx |
| `TEKST` | `Słodkie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Łatwy` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/interaction-guards.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Średni` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/stolnica-screen.test.tsx |
| `TEKST` | `Wymagający` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mistrzowski` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/stolnica-screen.test.tsx |
| `TEKST` | `Pieczenie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/pdf-sheet-generator.test.ts |
| `TEKST` | `para` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/domain-property-based.test.ts |
| `TEKST` | `Naczynie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wskazówki` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Moje przepisy` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zapisz przepis` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ui-components.test.tsx |
| `TEKST` | `Wpisz nazwę przepisu` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Anuluj` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/close-button-guard.test.tsx, tests/i18n-no-polish-in-en.test.tsx |
| `TEKST` | `Zapisz` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts |
| `TEKST` | `Baza danych nie otworzyła się przy poprzednim uruchomieniu` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | src/lib/__tests__/corrupt-rescue.test.tsx |
| `TEKST` | `Kopia plików bazy z tej chwili jest w aplikacji Pliki: Piekarz › Backup › kopie-ratunkowe.` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | src/lib/__tests__/corrupt-rescue.test.tsx |
| `TEKST` | `Zapisano opis błędu w pliku: {file}. Kopii plików bazy nie udało się wykonać.` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | src/lib/__tests__/corrupt-rescue.test.tsx |
| `TEKST` | `Rozumiem, zamknij komunikat ratunkowy` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ukryj` | `src/components/CorruptStateRecoveryBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przepisy na Odrzut Zakwasu` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij przepisy na odrzut` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kuchnia zero-waste: krakersy, naleśniki, gofry i ciasteczka bez marnowania zakwasu` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Krakersy` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Naleśniki` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Gofry` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ciasteczka` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Podpłomyki` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `odrzutu` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Składniki:` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przygotowanie krok po kroku:` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wskazówka rzemieślnicza:` | `src/components/DiscardRecipesModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wybierz objawy bochenka` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Krytyczny błąd struktury` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Umiarkowana wada` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drobna niedoskonałość` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przyczyna biologiczno-chemiczna:` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Co zrobić przy następnym wypieku:` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Przejdź do Harmonogramu (Sleep Guard)` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Dostosuj hydratację w Kalkulatorze` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przejdź do Stolnicy` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Kopiuj diagnozę` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Protokoły ratunkowe (Pogotowie ciasta)` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szybkie interwencje w trakcie fermentacji` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akcja natychmiastowa:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Receptura awaryjna:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Załaduj do Kalkulatora` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kroki ratunkowe:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Fizjologia ciasta:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Kuchenne testy piekarskie` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Test palca (Poke Test)` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Jak sprawdzić, czy bochenek w koszyku jest gotowy do pieczenia` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szybko odskakuje:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Niedofermentowany. Pozostaw w cieple na kolejne 30–60 minut.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wraca powoli do połowy:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Optymalny moment! Rozgrzewaj piec i szykuj żyletkę.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zostaje wgłębienie i ciasto siada:` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Przerośnięty. Piecz bezzwłocznie, nacinaj bardzo płytko.` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Test okna glutenowego (Windowpane)` | `src/components/doktor/KitchenTestsGuideSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
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
| `TEKST` | `Rozerwanie boku przy spodzie (Blowout)` | `src/components/doktor/SymptomSelectorSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
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
| `TEKST` | `Dodaj mąkę z Atlasu` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zastosuj mieszankę` | `src/components/FlourBlendModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij słownik mąk` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Porównanie standardów przemiału: Polska, Francja, Włochy, Niemcy i USA/UK` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szukaj np. T65, Tipo 00, 550, Bread Flour...` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nie znaleziono odpowiednika dla podanej frazy.` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `wody` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/starter-converter-modal.test.tsx |
| `TEKST` | `Popiół:` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Białko:` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zastosowanie:` | `src/components/FlourEquivalentsModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Błąd` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/import-recipe-modal.test.tsx |
| `UI` | `Podaj nazwę mąki` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Pomyślnie odliczono` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Zasoby mąki w spiżarni zostały zaktualizowane.` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Spiżarnia mąk (Magazyn)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/flour-inventory-modal.test.tsx |
| `TEKST` | `Kontrola zapasów mąk i powiadomienia o brakach` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Etap 1.1` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wszystkie mąki są dostępne w spiżarni!` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/flour-inventory-modal.test.tsx |
| `TEKST` | `Odlicz zużycie z magazynu` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Twoje zapasy mąk` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Dodaj mąkę do spiżarni` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wybierz z Atlasu lub wpisz własną` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nazwa mąki (np. Pszenna typ 750)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Początkowy stan zapasów (g)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zapisz w spiżarni` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj nową mąkę` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/interaction-guards.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Rozpoczęcie dokarmiania` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Gotowy do krojenia` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kopiuj harmonogram` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Uwaga: Kolizja ze snem!` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/harmonogram-screen.test.tsx |
| `TEKST` | `Rozwiąż kolizję` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/harmonogram-screen.test.tsx |
| `TEKST` | `lodówka` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ochrona snu aktywna (Sleep Guard)` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Godzina gotowości chleba do krojenia` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/schedule-formatter.test.ts |
| `TEKST` | `Wyznacz kroki wstecz, aby nie zarywać nocy` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Scenariusze wypieku` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dzień gotowości:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dziś` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/schedule-formatter.test.ts |
| `TEKST` | `Jutro` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/schedule-formatter.test.ts |
| `TEKST` | `Pojutrze` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/schedule-formatter.test.ts |
| `TEKST` | `Godzina podania na stół:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Godziny snu (Sleep Guard):` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Temperatura w kuchni:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wpływa na tempo fermentacji burzliwej (Q10 = 2.0)` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Czas w lodówce (Cold Retard):` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Elastyczny bufor regulujący porę formowania i pieczenia` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Oś czasu przygotowania (Timeline)` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Pasywne` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wymaga obecności` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kolizja nocna!` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Błąd schowka` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie udało się odczytać zawartości schowka.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaimportowano recepturę` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przepis „{name}” został pomyślnie dodany do Twojej bazy.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Błąd zapisu` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Wystąpił błąd podczas zapisywania receptury do bazy SQLite.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Importuj recepturę` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Wklej kod JSON udostępniony przez innego piekarza` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wklej ze schowka` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyczyść` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-a11y.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wklej kod JSON receptury tutaj...` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Możesz zaimportować plik JSON wygenerowany z Piekarza lub ręcznie przygotowany szablon.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nieprawidłowy format` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/settings-modal.test.tsx |
| `TEKST` | `Poprawna formuła` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mieszanka mąk (100%):` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Sól` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts |
| `TEKST` | `Zaimportuj przepis` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Powiadomienia wyłączone` | `src/components/NotificationsOffBanner.tsx` | ✅ | src/lib/__tests__/notifications.test.tsx, src/__tests__/notifications-pending.test.tsx |
| `TEKST` | `Zegar działa w aplikacji, ale przy zablokowanym telefonie nie przypomni o końcu kroku ani o karmieniu.` | `src/components/NotificationsOffBanner.tsx` | ✅ | src/lib/__tests__/notifications.test.tsx |
| `TEKST` | `Otwórz Ustawienia` | `src/components/NotificationsOffBanner.tsx` | ✅ | src/lib/__tests__/notifications.test.tsx |
| `TEKST` | `APPS4CRAFT STUDIO · 100% OFFLINE` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Witaj w Piekarzu` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Spersonalizuj swój rytuał. Aplikacja dostosuje interfejs i kalkulatory do Twojej filozofii wypieku.` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Jaki jest Twój styl wypieku?` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Klasyczny Zakwasowiec` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dziki zakwas, 100% naturalna fermentacja, długi rozrost w chłodzie (4°C) i garnek żeliwny. Zero drożdży komercyjnych.` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nowoczesny Rzemieślnik` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zakwas, prefermenty (biga, poolish), ciabatty, bagietki, focaccia i chleby mieszane. Pełna swoboda technik.` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Początkujący Piekarz` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przewidywalne receptury z bezpieczną hydratacją (65–68%), proste prowadzenie za rękę i brak skomplikowanych wzorów.` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `100% Offline. Twoje receptury i notatki są zapisywane wyłącznie w lokalnej bazie na Twoim urządzeniu.` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Rozpocznij rytuał wypieku` | `src/components/OnboardingModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |

*(... i 528 kolejnych elementów w pełnym wykazie)*
