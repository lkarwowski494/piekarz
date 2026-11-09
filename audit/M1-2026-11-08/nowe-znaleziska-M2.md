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
