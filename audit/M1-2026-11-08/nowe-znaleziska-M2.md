# Nowe znaleziska M2 (bez naprawy; M1 włącza w reaudycie)

### M2-koordynator-napraw-001 · Komunikat adaptacji czasu fermentacji do temperatury (RD-08) nie jest nigdzie pokazywany
- Pozycja listy kontrolnej: DEV-05 (rola 08; martwy kod domeny)
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: P (czy pokazywać komunikat w Harmonogramie/Stolnicy — rola 03/04)
- Dowód: przed 259f0880 `calculateFermentationAdaptation(...).messagePl` używane tylko w testach (`grep -rn "messagePl\|calculateFermentationAdaptation" src app` poza `__tests__` → tylko `src/core/domain-rules.ts`); po 020 domena zwraca `komunikat: { rodzaj, temperaturaC, minuty }`.
- Mechanizm: funkcja domeny z tekstem w i18n (3 klucze w 35 słownikach) bez ekranu, który ją wywołuje.
- Opcje: (a) pokazać komunikat przy temperaturze w Harmonogramie — praca 04/08, teksty już przetłumaczone; (b) usunąć funkcję i 3 klucze — mniej kodu. Rekomendacja: decyzja roli 03 (zakres).
- Test akceptacyjny: (a) test ekranu z komunikatem; (b) brak funkcji i kluczy, check:i18n kod 0.
- Status: otwarte

### M2-koordynator-napraw-002 · Niespójności w istniejących słownikach zauważone przy drugim przeglądzie przekładu 026
- Pozycja listy kontrolnej: LOC (rola 09; jakość przekładu)
- Poziom: P2
- Realność: realny   · Pewność: średnia (przegląd modelu, nie rodzimego użytkownika)
- Rodzaj: D
- Dowód: drugi przegląd AI 2026-11-09 (`docs/lokalizacja/przeklad-m2-026-2026-11-09.json`, pole `drugi_przeglad`): bg i sr mieszają „g” i „г” (np. 'Woda: {amount} g' → „г”, 'Mąka: {amount} g' → „g”); ro komunikaty zakresu „între 0–150%” zamiast „între 0 și 150%”; sl/hr zakwas „kvas” obok drożdży „kvasovke”/„kvasac” (w sl „kvas” potocznie = drożdże).
- Opcje: (a) poprawki w `docs/lokalizacja/poprawki-przekladu.json` z drugim przeglądem; (b) bez zmian do przeglądu natywnego. Rekomendacja: (a) dla g/г, reszta do przeglądu natywnego.
- Test akceptacyjny: kontrola jednostki g/г w bg/sr (jedna forma) w check:i18n albo teście.
- Status: otwarte

### M2-koordynator-napraw-003 · Drobne skutki uboczne podglądu pakietu awaryjnego (przegląd ścieżki wrażliwej 003)
- Pozycja listy kontrolnej: NIE (rola 12, ratowanie danych)
- Poziom: P2
- Realność: brzegowy   · Pewność: średnia
- Rodzaj: D
- Dowód: przegląd ścieżki wrażliwej diff e3c23559..26f6a87f (subagent, 2026-11-09): `src/data/recipes-store.ts:44` uszkodzone wiersze z pakietu trafiają na listę uszkodzonych wierszy aplikacji do końca uruchomienia (wejdą do kolejnych kopii, nie do przywróconych danych); `src/data/migracja-v6.ts:32` podgląd pakietu sprzed v6 dopisuje plik `sesja-przed-migracja-*.json` do katalogu ratunkowego aplikacji; zabicie aplikacji w trakcie odczytu zostawia katalog kopii w Caches (system czyści sam).
- Opcje: (a) osobna lista uszkodzonych dla pakietu i sprzątanie `import-pakietu-*` przy starcie; (b) bez zmian (dane nie giną). Rekomendacja: (a) w 1.0.1.
- Test akceptacyjny: po podglądzie pakietu z uszkodzonym wierszem lista uszkodzonych aplikacji bez zmian; katalog `import-pakietu-*` usunięty przy następnym starcie.
- Status: otwarte

### M2-koordynator-napraw-004 · Drobne uwagi przeglądu ścieżki wrażliwej zmian danych M2 (001, 002, 019, 021, 022)
- Pozycja listy kontrolnej: ARCH (rola 05)
- Poziom: P2
- Realność: teoretyczny   · Pewność: średnia
- Rodzaj: D
- Dowód: przegląd subagenta 2026-11-09 (diff 7 commitów): `src/data/storage-status.ts:113` `poStarcieBazy` dodaje słuchacza przy każdym powrocie z tła w trakcie startu; przy starcie, który nigdy nie opuści „initializing”, obietnica się nie spełni (pominięte uzgodnienie, bez danych); `src/data/runner-migracji.ts:64` błąd `PRAGMA foreign_keys = ON` w `finally` przykryłby MigrationError (ekran „inny błąd” zamiast błędu migracji z kopią); nieudany ROLLBACK połykany — wtedy klucze mogą zostać wyłączone na połączeniu (baza i tak idzie na ekran błędu).
- Opcje: (a) jeden słuchacz w poStarcieBazy i `finally` bez przykrywania błędu; (b) bez zmian. Rekomendacja: (a) przy najbliższej zmianie tych plików.
- Test akceptacyjny: test runnera z wymuszonym błędem pragmy po ROLLBACK daje MigrationError; wiele wywołań poStarcieBazy = jeden słuchacz.
- Status: otwarte

### M2-koordynator-napraw-005 · „Zaimportuj przepis” bez blokady w trakcie zapisu (podwójne stuknięcie = dwa zapisy)
- Pozycja listy kontrolnej: DEV (rola 08; jak 08-programista-006 / M1-audytor-generalny-028)
- Poziom: P2
- Realność: brzegowy   · Pewność: średnia
- Rodzaj: D
- Dowód: przegląd ścieżki wrażliwej 007 (2026-11-09): `src/components/ImportRecipeModal.tsx:84` przycisk bez blokady w trakcie zapisu; szybkie podwójne stuknięcie może wywołać `saveRecipe` dwa razy (istniało przed 007).
- Opcje: (a) blokada jak w 028; (b) bez zmian. Rekomendacja: (a).
- Test akceptacyjny: dwa stuknięcia bez czekania → jeden zapis.
- Status: otwarte (wg D-288 nowe P2 → P3 backlog 1.0.1)

## M2-006 (P3, klasa: dokumentacja) — błędne odwołanie „D-280 pkt 5”
Źródło: rola 09 (049). D-302 i dopisek M2 powołują się na „D-280 pkt 5”, a D-280 ma pkt 1–2; zasada „bez prac nad 1.1” to D-276 pkt 5. Poprawka: przy najbliższym wpisie do `docs/decyzje.md` (sprostowanie D-302, bez zmiany treści decyzji).

## Znaleziska roli 08 (przekazanie 06→08, 2026-11-09) — bez naprawy, do rozstrzygnięcia
- 08-p2-N1 (P1): plan brioszki nadal ma kroki bochenka w koszyku (PIE-BRI-900); pokrywa się z P1 roli 06 „brioche plan uses loaf steps”.
- 08-p2-N2 (P2→P3 wg D-288, klasa: treść): „Wymaga 3–4 standardowych składań.” bez twierdzenia; na liście wyjątków testu 010.
- 08-p2-N3 (P2→P3, klasa: treść/i18n): 2 klucze z kilkoma mąkami („… albo typ …”) sprzeczne z regułą 2 sprawdz-maki.mjs; rekomendacja roli: zostawić.
- 08-p2-N4 (P2→P3, klasa: treść): lekcja z 240 °C w bread-school-lessons.ts; zdanie o nacięciu przy brioszce.
- 08-p2-N5 (P2→P3, klasa: proces): generator słowników wymaga wejścia spoza repo; poprawki D-307 naniesione ręcznie w plikach generowanych.
- Kroki właściciela: zrzuty przed/po (brak Xcode w środowisku); przegląd człowieka: streszczenie polityki prywatności i zdanie o zdejmowaniu pokrywki w 33 językach.

## Przeglądy przekazania 06→08 (2026-11-09)
- Ścieżka danych: brak P0/P1. P2 regresja 041 (odliczanie mąki ze spiżarni pod dawną nazwą) i P3 (edytor dubluje mąkę) — naprawione ef9dd782 (test spizarnia-dawna-nazwa-041).
- M2-007 (P3, klasa: dane-brzegowe): wypiek trwający w chwili aktualizacji pokazuje w zapisanym kroku starą instrukcję 240/210 °C, a zegar garnka 232 °C; czasy bez zmian. Dotyczy tylko sesji w toku podczas aktualizacji (etap: tylko właściciel na danych testowych).
- Drugi przegląd AI przekładu: brak P0/P1; 4 P2 naprawione 8f90a72e. P3 (bez naprawy, do 1.0.1 / przeglądu natywnego): ro „vas”→„tuci”, sk „pokrievka”→„poklop” i myślnik ze spacjami, ms „tutup”, ja „ふた”/styl, niejednoznaczne „obróć formę” (sv, da, nb, hu, tr, ro, fi), uk rodzaj „бріош”, bg „квас”/„стартер”, fi „juuri”, Biga (lt, el, bg), it 010[18], hu 009[0]/010[22], grill vi/zh, 040[5–6] bez objaśnienia tytułu produktu; informacyjnie 3 nazwy mąk tylko EN (F-45/F-47).

## Przegląd 006 (2026-11-09)
- P2-1 naprawione (pasek znika przy nowym zegarze). P3 do decyzji/1.0.1: M2-008 jeden poziom „Przywróć” przy dwóch skokach z rzędu (świadomy wybór); M2-009 „Przywróć” po upływie zegara sprzed skoku bez sygnału dźwiękowego (stan poprawny, „Termin minął”).
