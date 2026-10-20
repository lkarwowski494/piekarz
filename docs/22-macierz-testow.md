# Macierz Testów (AST Coverage Matrix) — PIEKARZ (CRUST)

Wygenerowano automatycznie przez `scripts/test-matrix.mjs` zgodnie z wymaganiami **BR-TEST-028..031**.
Zasada dowodu: wyłącznie wykonywalny kod testu (wycięte komentarze, importy i opisy `test`/`describe`).

## Podsumowanie Pokrycia

| Kategoria | Łącznie | Pokryte | Pokrycie % | Status |
| :--- | :---: | :---: | :---: | :---: |
| **EKRAN** | 9 | 9 | **100.0%** | ✅ POKRYTE |
| **UI** | 43 | 43 | **100.0%** | ✅ POKRYTE |
| **TEKST** | 596 | 596 | **100.0%** | ✅ POKRYTE |
| **LOGIKA** | 377 | 377 | **100.0%** | ✅ POKRYTE |
| **WYMIAR** | 158 | 158 | **100.0%** | ✅ POKRYTE |

Łącznie elementów: **1183** | Pokrytych: **1183** | Brakujących: **0**

## Szczegółowa Lista Elementów

| Kategoria | Nazwa elementu | Plik źródłowy | Status | Pliki testowe |
| :--- | :--- | :--- | :---: | :--- |
| `EKRAN` | `/(tabs)/(dzis)/index` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/(tabs)/dziennik/index` | `app/(tabs)/dziennik/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/(tabs)/receptury/harmonogram` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/interaction-guards.test.ts, tests/matrix-ui-text.test.tsx |
| `EKRAN` | `/(tabs)/receptury/index` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/(tabs)/receptury/receptura` | `app/(tabs)/receptury/receptura.tsx` | ✅ | tests/interaction-guards.test.ts, tests/nawigacja-d051.test.tsx |
| `EKRAN` | `/(tabs)/zakwasy/doktor-zakwasu` | `app/(tabs)/zakwasy/doktor-zakwasu.tsx` | ✅ | src/core/__tests__/starter-doctor.test.ts, src/core/__tests__/starter-setup.test.ts |
| `EKRAN` | `/(tabs)/zakwasy/index` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/audit-fixes.test.tsx |
| `EKRAN` | `/doktor` | `app/doktor.tsx` | ✅ | tests/interaction-guards.test.ts, tests/maestro-runner.ts |
| `EKRAN` | `/stolnica` | `app/stolnica.tsx` | ✅ | tests/interaction-guards.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Co dziś robisz?` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/maestro-runner.ts, src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Dziś` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ustawienia` | `app/(tabs)/(dzis)/index.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Co jeszcze dziś robisz?` | `app/(tabs)/(dzis)/index.tsx` | ✅ | src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Okres próbny się skończył` | `app/(tabs)/(dzis)/index.tsx` | ✅ | src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Twoje receptury, zakwasy i dziennik są do przeglądania, eksportu i usunięcia. Przypomnienia o dokarmianiu są wyłączone. Liczenie, plan i prowadzenie wymagają Piekarz Pro.` | `app/(tabs)/(dzis)/index.tsx` | ✅ | src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Zobacz plany` | `app/(tabs)/(dzis)/index.tsx` | ✅ | src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.` | `app/(tabs)/(dzis)/index.tsx` | ✅ | src/__tests__/start-co-dzis.test.tsx |
| `TEKST` | `Doktor Chleba` | `app/(tabs)/dziennik/index.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Jutro` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/schedule-formatter.test.ts |
| `TEKST` | `Pojutrze` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/i18n-en-main-flow.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wczoraj` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | src/lib/__tests__/schedule-formatter.test.ts, src/lib/__tests__/zakwas-widok.test.tsx |
| `TEKST` | `{dzien}, {d} {miesiac}` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Klasyczny chleb rzemieślniczy` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/__tests__/harmonogram-screen.test.tsx |
| `TEKST` | `Najpierw ustaw godzinę, na którą zdążysz.` | `app/(tabs)/receptury/harmonogram.tsx` | ✅ | src/__tests__/plan-za-pozno-107.test.tsx |
| `TEKST` | `Przelicznik objętości` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Skanuj QR` | `app/(tabs)/receptury/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dzień {n}` | `app/(tabs)/zakwasy/doktor-zakwasu.tsx` | ✅ | src/lib/__tests__/zakwas-widok.test.tsx |
| `TEKST` | `Co widzisz?` | `app/(tabs)/zakwasy/doktor-zakwasu.tsx` | ✅ | src/lib/__tests__/zakwas-widok.test.tsx |
| `TEKST` | `Mąka pszenna chlebowa t750` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/core/__tests__/flour-atlas.test.ts |
| `TEKST` | `przed chwilą` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{hours}h temu` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{days}d temu` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Dokarmiono zakwas` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/storage-write-failure-screen.test.tsx |
| `UI` | `Zarejestrowano dokarmienie zakwasu „{name}”.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Profil zakwasu` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Zapisano zaktualizowany profil` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mąka pszenna chlebowa` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/matrix-invariants.test.ts |
| `UI` | `Dodano zakwas` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Kultura „{name}” została utworzona.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie można usunąć` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Musisz posiadać co najmniej jeden profil zakwasu.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Kopiuj dokarmienie` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Skopiowano proporcje dokarmiania do schowka` | `app/(tabs)/zakwasy/index.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nie masz jeszcze zakwasu. Dodaj zakwas, który masz, albo załóż nowy.` | `app/(tabs)/zakwasy/index.tsx` | ✅ | src/__tests__/dane-przykladowe-087.test.tsx |
| `TEKST` | `Akademia Piekarza` | `app/doktor.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akademia` | `app/doktor.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szkoła Chleba, 12 technik rzemieślniczych i Trener procentu` | `app/doktor.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wypiek bez receptury` | `app/stolnica.tsx` | ✅ | tests/helpers/wypiek.ts, src/__tests__/bake-journal-no-guess.test.tsx |
| `TEKST` | `Wypiek w garnku zakończony. Wyjmij chleb na kratkę.` | `app/stolnica.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Plan wypieku` | `app/stolnica.tsx` | ✅ | tests/emoji-teksty-techniczne.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Doktor` | `app/stolnica.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.` | `app/stolnica.tsx` | ✅ | src/__tests__/prowadzenie-102.test.tsx |
| `TEKST` | `Zamknij Akademię` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szkoła Chleba` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Techniki` | `src/components/academy/AcademyHeader.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `POZIOM` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaliczona` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `hydratacji` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/br-kryteria-067.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `soli` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/recipe-sharing.test.ts |
| `TEKST` | `Fermentacja i prowadzenie:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kroki technologiczne:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Fizjologia i chemia:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Kryterium zaliczenia:` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Lekcja ukończona (stuknij, aby cofnąć)` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/bread-academy-modal.test.tsx |
| `TEKST` | `Oznacz lekcję jako zaliczoną` | `src/components/academy/BreadSchoolSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wszystkie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyrabianie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Składania` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Formowanie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/wstawki-angielskie-112.test.ts |
| `TEKST` | `Wypiek i studzenie` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Prawidłowe wykonanie:` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Czego unikać (typowe błędy):` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Złota rada rzemieślnika:` | `src/components/academy/TechniquesLibrarySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Odblokuj pełny dostęp` | `src/components/BlokadaFunkcji.tsx` | ✅ | src/components/__tests__/paywall-modal.test.tsx, src/__tests__/bramki-ekranow.test.tsx |
| `TEKST` | `wymaga Piekarz Pro` | `src/components/BlokadaFunkcji.tsx` | ✅ | tests/nazwa-d053.test.ts, tests/zrzuty-sklepu.test.ts |
| `TEKST` | `Strata wypiekowa i wilgotność miękiszu` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Strata Piecowa` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/ArtisanAccordionPro.test.tsx |
| `TEKST` | `Szacowany ubytek masy` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `upieczonego` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Strata piecowa` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/bake-loss.test.ts |
| `TEKST` | `Zmniejsz stratę piecową` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zwiększ stratę piecową` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Upieczony bochenek` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Odparowana woda` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szacowana wilgotność miękiszu` | `src/components/calculator/accordion/AccordionBakeLossSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/recipe-formatter-en.test.ts |
| `TEKST` | `Temperatura wody` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Docelowa temp. wody:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/receptura-akcje-057.test.tsx |
| `TEKST` | `Docelowe DDT` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Obniż docelową temperaturę ciasta` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Podnieś docelową temperaturę ciasta` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Chłonność mąk:` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `zalecana` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Białko` | `src/components/calculator/accordion/AccordionDdtSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mieszanka mąk` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/ArtisanAccordionPro.test.tsx |
| `TEKST` | `Spiżarnia mąk & Stan zapasów` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Słownik Odpowiedników Mąk` | `src/components/calculator/accordion/AccordionFlourBlendSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaczyny` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `TEKST` | `Bezpośrednie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Udział mąki w zaczynie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/domain-error-branches.test.ts |
| `TEKST` | `Zaczyn ({g} g)` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/lib/__tests__/miary-usa-096.test.ts |
| `TEKST` | `Mąka w zaczynie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Woda w zaczynie` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Do miski (Ciasto właściwe)` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Pozostała mąka: {g} g` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/lib/__tests__/miary-usa-096.test.ts |
| `TEKST` | `Pozostała woda: {g} g` | `src/components/calculator/accordion/AccordionPrefermentSection.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Parametry Rzemieślnicze & Mąki` | `src/components/calculator/ArtisanAccordionPro.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mieszanka mąk, zaczyny, strata piecowa` | `src/components/calculator/ArtisanAccordionPro.tsx` | ✅ | src/components/calculator/__tests__/ArtisanAccordionPro.test.tsx |
| `TEKST` | `Mieszanka mąk i zaczyny` | `src/components/calculator/ArtisanAccordionPro.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ułóż plan` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/maestro-runner.ts, tests/slownik-akcji.test.ts |
| `TEKST` | `Zapisz jako moją` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zmień składniki` | `src/components/calculator/CalculatorActionButtons.tsx` | ✅ | tests/maestro-runner.ts, tests/slownik-akcji.test.ts |
| `UI` | `Skaner QR` | `src/components/calculator/CalculatorModalsProvider.tsx` | ✅ | src/__tests__/skaner-qr-brak-modulu.test.tsx |
| `UI` | `Skaner QR jest niedostępny w tej wersji aplikacji.` | `src/components/calculator/CalculatorModalsProvider.tsx` | ✅ | src/__tests__/skaner-qr-brak-modulu.test.tsx |
| `TEKST` | `Hydratacja` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Masa` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mąka` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/audit-fixes.test.tsx, tests/br-kryteria-067.test.tsx |
| `TEKST` | `DDT` | `src/components/calculator/CalculatorSacredCard.tsx` | ✅ | tests/br-kryteria-067.test.tsx, tests/emoji-teksty-techniczne.test.ts |
| `TEKST` | `Bochenki` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/emoji-teksty-techniczne.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Masa mąki` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Masa mąki bazowej` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Mąka stanowi 100% bazy w procentach piekarskich` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Zmniejsz masę mąki o {g} g` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zwiększ masę mąki o {g} g` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Liczba bochenków i gramatura` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/core/__tests__/domain-error-branches.test.ts |
| `TEKST` | `{masa} / szt.` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `{n} szt.` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Mniej bochenków` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `TEKST` | `Więcej bochenków` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, tests/slownik-akcji.test.ts |
| `TEKST` | `Do miski na wagę` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/calculator/__tests__/DoMiskiScaleCard.test.tsx |
| `TEKST` | `Odhaczaj składniki w miarę wsypywania` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mąka dodana` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/starter-converter-modal.test.tsx |
| `TEKST` | `Woda` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Aktywny zakwas` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `W szczycie aktywności` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Sól kłodawska / morska` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drożdże` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | src/doctor/__tests__/diagnostics-exhaustive.test.ts, src/lib/__tests__/diagnosis-formatter.test.ts |
| `TEKST` | `Całkowita masa ciasta:` | `src/components/calculator/DoMiskiScaleCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Receptury mistrzowskie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/receptury-uklad-106.test.tsx |
| `TEKST` | `Na zakwasie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `Żytnie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Drożdżowe` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Pizza i słodkie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Żytni` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/audit-fixes.test.tsx, tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Drożdżowy` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/receptury-uklad-106.test.tsx |
| `TEKST` | `Pizza` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/core/__tests__/bake-statistics.test.ts |
| `TEKST` | `Słodkie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Łatwy` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/interaction-guards.test.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Średni` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/stolnica-screen.test.tsx |
| `TEKST` | `Wymagający` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Mistrzowski` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/stolnica-screen.test.tsx |
| `TEKST` | `Pieczenie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/lib/__tests__/pdf-sheet-generator.test.ts |
| `TEKST` | `para` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/app-locales-permissions.test.ts, tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `{n}m w {temp}` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Naczynie` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `garnek żeliwny` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `foremka keksówka` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, src/__tests__/calculator-screen.test.tsx |
| `TEKST` | `stal piekarska` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `blacha piekarnika` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Wskazówki` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Moje przepisy` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/receptury-uklad-106.test.tsx |
| `TEKST` | `Usuń recepturę: {nazwa}` | `src/components/calculator/FormulaPresetSelector.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zapisz przepis` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/components/__tests__/ui-components.test.tsx |
| `TEKST` | `Wprowadź unikalną nazwę dla tej proporcji składników` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts |
| `TEKST` | `Wpisz nazwę przepisu` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Anuluj` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/close-button-guard.test.tsx, tests/i18n-no-polish-in-en.test.tsx |
| `TEKST` | `Zapisz` | `src/components/calculator/SaveRecipeModal.tsx` | ✅ | tests/i18n-no-polish-in-en.test.tsx, tests/maestro-runner.ts |
| `TEKST` | `Zamknij` | `src/components/CloseButton.tsx` | ✅ | tests/interaction-guards.test.ts, tests/matrix-ui-text.test.tsx |
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
| `TEKST` | `Przejdź do Stolnicy` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Kopiuj diagnozę` | `src/components/doktor/DiagnosisResultCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Protokoły ratunkowe (Pogotowie ciasta)` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Szybkie interwencje w trakcie fermentacji` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zamknij protokół ratunkowy` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Akcja natychmiastowa:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
| `TEKST` | `Receptura awaryjna:` | `src/components/doktor/EmergencyRecoverySection.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/doktor-screen.test.tsx |
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
| `TEKST` | `Usuń` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-a11y.test.tsx, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj mąkę do spiżarni` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wybierz z Atlasu lub wpisz własną` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Nazwa mąki (np. Pszenna typ 750)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Początkowy stan zapasów (g)` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zapisz w spiżarni` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dodaj nową mąkę` | `src/components/FlourInventoryModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Ustaw tę godzinę` | `src/components/harmonogram/PlanZaPozno.tsx` | ✅ | src/__tests__/plan-za-pozno-107.test.tsx |
| `TEKST` | `Start {dzien} o {godzina}` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Całość trwa {czas}.` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Zacznij wypiek` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | tests/i18n-en-ui-texts.test.ts, tests/maestro-runner.ts |
| `TEKST` | `Kopiuj harmonogram` | `src/components/harmonogram/ScheduleSummaryCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `{krok} wypada o {godzina} w nocy` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Przesuń do lodówki` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | src/__tests__/harmonogram-screen.test.tsx, src/__tests__/teksty-116.test.tsx |
| `TEKST` | `Ochrona snu aktywna` | `src/components/harmonogram/SleepGuardBanner.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Godzina gotowości chleba do krojenia` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/maestro-runner.ts, tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wyznacz kroki wstecz, aby nie zarywać nocy` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Scenariusze wypieku` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Dzień gotowości:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Godzina podania na stół:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Godziny snu:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Temperatura w kuchni:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wpływa na tempo fermentacji burzliwej: 10 °C niżej to około 3 razy dłuższa fermentacja (przybliżenie z modelu badawczego, ważne w 20–26 °C).` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Czas w lodówce:` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Elastyczny bufor regulujący porę formowania i pieczenia` | `src/components/harmonogram/TargetReadyCard.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Oś czasu przygotowania` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Pasywne` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Wymaga obecności` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `W nocy` | `src/components/harmonogram/TimelineStagesList.tsx` | ✅ | src/__tests__/teksty-116.test.tsx |
| `UI` | `Błąd schowka` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie udało się odczytać zawartości schowka.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Zaimportowano recepturę` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Przepis „{name}” został pomyślnie dodany do Twojej bazy.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Błąd zapisu` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `UI` | `Nie zapisałem receptury. Spróbuj jeszcze raz.` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx |
| `TEKST` | `Importuj recepturę` | `src/components/ImportRecipeModal.tsx` | ✅ | tests/matrix-ui-text.test.tsx, src/__tests__/import-z-pliku-113.test.tsx |

*(... i 883 kolejnych elementów w pełnym wykazie)*
