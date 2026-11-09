# Przegląd ścieżki „sesja wypieku / plan” — p4 (089: 3e05396e, 088: d04c94ca)

Recenzent tylko do odczytu, 2026-11-09. Zakres: `src/lib/plan-receptury.ts`, `src/core/pieczenie-receptury.ts`,
`src/lib/pieczenie-planu.ts`, `src/core/po-co-ten-krok.ts`, wszystkie wejścia do planu i sesji, testy obu commitów.
Uruchomione: `npx jest` na 8 zestawach (089, 088, 008, 061, M2-012 ×3, po-co-ten-krok-100): 133/133 zielone.

## Werdykt

**Brak P0/P1.** Blokada 089 działa w obu miejscach, które tworzą nowy plan z receptury (ekran receptury i plan
wypieku), a zapisane plany i trwające wypieki brioszki działają dalej. Zmiana 088 nie zmienia id kroków, czasów,
migawek, powiadomień ani kopii. Są 3 × P2 (dwie luki w blokadzie, obie wcześniejsze niż 089, ale przez 089 ważniejsze)
i 3 × P3 (testy).

| Priorytet | Liczba |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 3 |
| P3 | 3 |

## Co sprawdziłem i jest w porządku

1. **Wejścia do nowego planu (089).**
   - `powodBezPlanu` ma dwóch wywołujących: `app/(tabs)/receptury/receptura.tsx:253` (przycisk „Ułóż plan”, `disabled`,
     `CalculatorActionButtons.tsx:37`) i `app/(tabs)/receptury/harmonogram.tsx:112-115` (`zablokowany` w `useStartPlanu`).
     W planie wypieku `zacznij` i `zaplanuj` wracają przy `zablokowany`, a `PasekStartu` chowa „Zaplanuj”.
   - „Piecz ponownie” (`src/hooks/useBakeHistory.ts:65`): `prepareBakeAgainRecipe` (`src/lib/recipe-navigation.ts:90`)
     zwraca id katalogu także dla starego wpisu bez `recipe_id`, czyli dopasowanego po nazwie. Dlatego plan jest
     zablokowany. Wyjątek: własna receptura o tej samej nazwie (P2-3).
   - Tryb maszyny: brioszki nie ma w `DODATKI_MASZYNY` (`src/recipes/maszyna-receptur.ts:16`), więc nie ma segmentu
     maszyny.
   - Ekran „Dziś” nie wywołuje `ustawRecepturePlanu`. Uruchamia tylko zapisane plany (`usePlanyDzis.ts:43` → `zacznijPlan`).
   - `app/doktor.tsx:146` i deep link `piekarz://receptury/harmonogram` otwierają plan z ostatnią `recepturaPlanu()`.
     Przy brioszce plan jest zablokowany, bo wpis brioszki może dać tylko „Piecz ponownie”. Bez receptury plan jest
     ogólny, jak przed 089.
2. **Zapisane plany i trwające wypieki brioszki.**
   - `sesjaZPlanu` (`src/lib/plany-akcje.ts:17`) → `nowaSesja` → `stepsForBake` bierze migawkę `steps` i nie sprawdza
     `powodBezPlanu`, więc plan zapisany przed 089 startuje z „Dziś” bez zmian.
   - Wznowienie po restarcie: `brioszka-wznowienie-m2-012.sqlite.test.ts` jest zielony.
   - Zapis bez migawki (v1) nadal dostaje kroki brioszki, bo `pieczenieDlaId` ustawia `szablon` niezależnie od 089.
   - Import pakietu (bb162ddf) przenosi migawki bez przeliczania.
3. **088: id, czasy, migawki, powiadomienia, kopie.**
   - Gałąź „bez liczb” (`src/core/pieczenie-receptury.ts:69-77`) zostawia id `preheat_oven`/`bake_forma`/`bake_stal`,
     nazwy (`Nagrzewanie piekarnika`, `Pieczenie`), `NAGRZEWANIE_MIN` = 45 i `czas` = para + rumienienie.
   - Kategorie szablonu się nie zmieniły.
   - `src/lib/notifications.ts` nie czyta `instructions`, więc Sleep Guard i powiadomienia się nie zmieniają.
   - Migawki w `bake_sessions` i w kopiach niosą stary tekst (klucz PL), który nadal jest w słownikach. Schemat bazy
     się nie zmienił.
   - `NAGRZEWANIE_KEKSOWKI` (z `tekstZrodla: true`) jest równe tekstowi sprzed 088, więc stare migawki rye_100_pan
     i borodinsky przy życie ≤ 50% (z tekstem brioszki) nadal nie dostają zdania o garnku.
   - `TEKST_PIECZENIA_ZE_ZRODLA` jest zadeklarowane pod `pieczenieDlaId`. Nie ma ryzyka TDZ, bo nikt nie wywołuje
     funkcji przy ładowaniu modułu.
   - Nowe klucze PL są w EN i w 33 słownikach. „O recepturze” to rzeczywisty tytuł karty
     (`src/components/receptury/ORecepturze.tsx:34`), a karta pokazuje temperatury i czasy z danych receptury.
4. **Filtr po-co-ten-krok (`src/core/po-co-ten-krok.ts:81`).**
   - `NAGRZEWANIE_BEZ_LICZB` pasuje tylko do nowej gałęzi (keksówka i stal mają ten sam tekst). Nie usuwa zdania
     o garnku przy garnku, bo garnek ma inny tekst.
   - Łotewska na stali nie dostaje już zdania o garnku. To poprawa.
   - Durum na stali: bez zmian względem 06-tresci-603 (nie gorzej).
   - `bake_forma` nadal idzie przez `PO_CO_BRIOSZKI` (null).

## Znaleziska

### P2-1 — Plan brioszki z „Piecz ponownie” nadal pokazuje harmonogram, a „Dodaj do kalendarza” i „Kopiuj plan” go eksportują
- **Gdzie:** `app/(tabs)/receptury/harmonogram.tsx:94` (pieczenie i szablon brioszki), `:305` (`onCopySchedule`),
  `:309-311` (`DodajDoKalendarza`, `plan` zależy tylko od `startPlanu`/`zaPozno`, a nie od `bezZakwasu`).
- **Scenariusz:**
  1. Dziennik ma wpis brioszki sprzed 089. Użytkownik wybiera „Piecz ponownie”.
  2. Plan wypieku pokazuje pełną oś czasu brioszki z czasami rośnięcia bez źródła (PIE-BRI-900), z godziną „gotowe”
     i Spiralą.
  3. „Zacznij wypiek” jest nieaktywny, ale „Dodaj do kalendarza” (Pro) zapisuje te godziny jako .ics, a „Kopiuj plan”
     kopiuje je do schowka.
  4. Użytkownik piecze według kalendarza, czyli według planu, który 089 miało wstrzymać („harmonogram byłby za
     krótki”, wynik-p4, odrzucona opcja c).
- **Uwaga:** tak samo zachowuje się plan receptury bez zakwasu (D-3), ale tam oś czasu nie ma konkretnych błędnych
  liczb receptury.
- **Poprawka:** przy `bezZakwasu` (powód z `powodBezPlanu`) przekazać `plan={null}` do `DodajDoKalendarza` i ukryć
  albo wyłączyć „Kopiuj plan”. Najlepiej przy powodzie 089 nie liczyć osi czasu i pokazać tylko powód. Test UI: wejście
  z `ustawRecepturePlanu(brioszka)` daje brak `plan-kalendarz-btn` i brak `plan-start-bake-btn` aktywnego.

### P2-2 — Zastarzały ekran planu przy „Piecz ponownie” (obejście blokady) [do weryfikacji na urządzeniu; błąd sprzed 089]
- **Gdzie:** `src/hooks/useBakeHistory.ts:65-75` (`ustawRecepturePlanu` + `router.navigate('/receptury/harmonogram')`).
  Stan ekranu jest liczony raz w `useState` w `harmonogram.tsx:94-115`. `useStartPlanu.ts:53` przy starcie czyta
  `recepturaPlanu()` na nowo.
- **Mechanizm:** `StackRouter` expo-router (`node_modules/expo-router/build/react-navigation/routers/StackRouter.js:188-193`)
  przy `NAVIGATE` do trasy równej bieżącej na szczycie stosu używa istniejącej trasy, czyli tej samej instancji ekranu
  bez ponownego montowania.
- **Scenariusz:**
  1. Plan tartine, potem „Zacznij wypiek”, wtedy Stolnica jest nad zakładkami.
  2. Koniec wypieku: `app/stolnica.tsx:63` robi `router.replace('/')` i otwiera „Dziś”. Stos „Receptury” nadal ma plan
     tartine na szczycie.
  3. Dziennik, potem „Piecz ponownie” na wpisie brioszki. Wraca ten sam ekran: `bezZakwasu` = null (tartine),
     `steps` z tartine.
  4. „Zacznij wypiek” tworzy wypiek z `recipeName`/`recipeId`/`recipeFormula` brioszki i krokami garnka tartine.
  5. Skutek: blokada 089 obejściona, a wypiek ma niespójne dane. Ilości i wpis w Dzienniku są brioszki, kroki są
     bochenka.
- **Poprawka:** w `harmonogram.tsx` wyliczać stan z receptury per wejście, np. `key` z identyfikatora „wejścia”
  ustawianego w `ustawRecepturePlanu` (licznik) i ponowne zamontowanie. Albo w `useBakeHistory` użyć
  `router.dismissTo`/`push` z unikalnym parametrem. Dodatkowo w `useStartPlanu.zacznij` porównać
  `recepturaPlanu()` z recepturą, z którą ekran się zamontował, i przy różnicy nie startować.
- **Zastrzeżenie:** wynika z czytania kodu nawigacji, bez uruchomienia na symulatorze. Trzeba to potwierdzić w Maestro E2E.

### P2-3 — 06-tresci-604 potwierdzone: „Zapisz jako moją” odblokowuje plan brioszki w dwóch dotknięciach, a plan jest planem bochenka w garnku
- **Gdzie:** `src/lib/calculator-actions.ts:141-148` (nowa receptura dostaje `recipe_${Date.now()}`; `StoredRecipe`,
  `src/data/db.ts:9-17`, nie ma pola z id receptury bazowej) oraz `app/(tabs)/receptury/receptura.tsx:197`
  (`setSelectedPresetId(saved.id)` na tym samym ekranie).
- **Scenariusz:**
  1. Brioszka, „Zapisz jako moją”, Zapisz. „Ułóż plan” jest od razu aktywny, bo `powodBezPlanu` nie zna id.
  2. Plan dostaje `pieczenieDlaId(custom)` = undefined, więc profil garnka: koszyk, nacięcie, garnek 260 °C,
     garowanie w lodówce. To gorzej niż szablon brioszki sprzed 089.
  3. „Piecz ponownie” wpisu brioszki, gdy istnieje własna receptura o tej samej nazwie, też trafia w kopię, bo
     `prepareBakeAgainRecipe` sprawdza najpierw `wlasne`. Dotyczy to jednak tylko wpisów bez `recipe_id`.
- **Uwaga:** tak samo działa każda własna receptura (plan ogólny), więc to nie regresja. Ale po 089 jest to jedyna,
  łatwo dostępna droga do planu brioszki.
- **Poprawka (do decyzji 06/03):** zapisać przy kopii `bazowaId` (nowe opcjonalne pole, zgodne wstecz) i sprawdzać je
  w `powodBezPlanu`/`pieczenieDlaId`. Prostsza wersja na 1.0: blokować plan dla własnej receptury, której formuła
  odpowiada brioszce. Gorsza, bo heurystyczna.

### P3-1 — Test 088 dla receptur wektora jest prawie tautologią
- **Gdzie:** `tests/pieczenie-bez-cudzych-liczb-088.test.ts` (`TRESC` z wszystkich sekcji pliku, także nowych sekcji
  „poza wektorem D-304”; asercja `expect(TRESC).toContain(k.instructions)`).
- **Problem:** gdyby brioszka albo durum straciły `tekstZrodla` i dostały tekst bez liczb, ten przypadek nadal
  przejdzie, bo tekst bez liczb też jest w `TRESC`. Regresję łapie dziś tylko test 008 (`:112`, durum) i M2-012
  (brioszka), a nie test akceptacyjny 088.
- **Poprawka:** dla receptur wektora wykluczyć z `TRESC` sekcje „poza wektorem D-304” albo porównać z konkretną
  sekcją receptury.

### P3-2 — Brak testu, że zapisany plan brioszki sprzed 089 startuje z „Dziś”, i brak testu UI blokady
- **Gdzie:** `tests/brioszka-bez-planu-089.test.ts`. Opis testu mówi o „Piecz ponownie” i „Zaplanuj”, ale test
  sprawdza tylko czystą funkcję `powodBezPlanu`.
- **Problem:**
  - Nic nie sprawdza `sesjaZPlanu`/`zacznijPlan` dla `PlannedBake` brioszki (zasada 10: zapisane plany działają).
  - Nic nie sprawdza, że `harmonogram.tsx` po `ustawRecepturePlanu(brioszka)` ma `plan-start-bake-btn` nieaktywny
    i nie ma „Zaplanuj”.
  - Przyszła zmiana `harmonogram.tsx`, np. liczenie `zablokowany` bez `bezZakwasu`, przejdzie przez test 089.
- **Poprawka:**
  - test `sesjaZPlanu(planBrioszki)` → kroki = migawka;
  - render `HarmonogramScreen` z recepturą brioszki i asercje na przyciskach (wzorzec z istniejących testów D-3).

### P3-3 — Stare migawki łotewskiej na stali nadal dostają zdanie o garnku
- **Gdzie:** `src/core/po-co-ten-krok.ts:81`.
- **Problem:** wypiek łotewskiej (żyto ≤ 50%) zaczęty przed 088 ma w migawce „Nagrzej piekarnik ze stalą do 250 °C.”.
  Ten tekst nie równa się żadnej stałej filtra, więc nadal pokazuje KRO-POC-011. To ta sama klasa co 06-tresci-603.
  Dotyczy tylko trwających wypieków, nie jest gorzej niż przed 088.
- **Poprawka:** przy naprawie 603 filtrować nagrzewanie stali po tekście stali, a nie tylko po nowych stałych.
