# ADR-009: Dane użytkownika w SQLite na urządzeniu: jedno połączenie z kolejką zapisów, migracje z bezpieczną przebudową, kopie JSON formatu 2 (stan zastany)

**Status:** przyjęta (stan zastany, odtworzony z kodu 2026-11-09); zastępuje ADR-003  
**Data:** 2026-11-09  
**Decyduje:** właściciel (zakres: D-286 „wszystkie rekomendacje M1”, wybór (b) w 05-architekt-505) / hierarchia źródeł (fakty o SQLite)  
**Autor:** rola 05-architekt, tryb fix [M1-audytor-generalny-024; 05-architekt-505]

## Kontekst i problem

ADR-003 (18.10.2026) opisywał kolejkę `pending_ops` dla Apple Watch, zrzut bazy do JSON z rotacją 5 kopii i odtwarzanie z kopii przez baner. Zegarek, Live Activity i kolejka synchronizacji są wycięte (kontrakt zakresu, `docs/scope-contract.md`, KL-06, KL-07, KL-14), a kod ma inną ścieżkę zapisu i inne pule kopii. Ten ADR zapisuje to, co kod robi dziś (gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p1`, po partii 1 M2), żeby kolejne zmiany schematu i zapisu miały kontrakt zgodny z kodem. Przepływy, które tego wymagają: wypiek od receptury do bochenka (sesje i Dziennik), zakwas z dziennikiem, receptury, spiżarnia, kopia i import (BR-DANE-002, BR-DANE-003, BR-DANE-004).

## Czynniki decyzji

- Aplikacja działa w pełni offline, bez konta (CLAUDE.md, cel projektu); dane żyją tylko w telefonie i w kopiach w aplikacji Pliki.
- Zasada wspólna 10: zero utraty danych; kopia kompletna wobec tego, co operacja kasuje.
- sqlite.org, `foreign_keys`: „This pragma is a no-op within a transaction” (https://www.sqlite.org/pragma.html, odczyt 2026-11-09).
- sqlite.org, przy włączonych kluczach „the DROP TABLE command performs an implicit DELETE to remove all rows from the table before dropping it” (https://www.sqlite.org/foreignkeys.html, odczyt 2026-11-09).
- sqlite.org, ALTER TABLE §8: kolejność 12 kroków; odwrotna kolejność „might corrupt references to that table in triggers, views, and foreign key constraints” (https://www.sqlite.org/lang_altertable.html, odczyt 2026-11-09).
- expo-sqlite: `withTransactionAsync` nie jest wyłączna, zapis spoza transakcji wchodzi do niej (komentarz źródłowy `src/data/kolejka-zapisow.ts`, za docs.expo.dev, SQLite).

## Rozważane opcje

- **A. Jedno połączenie z `PRAGMA foreign_keys = ON` i jedną kolejką zapisów** (stan kodu).
- **B. Osobne połączenie tylko do zapisu** (`openDatabaseAsync(…, { useNewConnection: true })`), główne tylko czyta.
- **C. Bez relacyjnej bazy** (pliki JSON): odrzucona już w ADR-001; dziennik zakwasu z kluczem obcym (ADR-008) i lista sesji (D-102) korzystają z relacji, transakcji i CHECK.

## Decyzja

Stan zastany to **A**: jedno połączenie, wszystkie zapisy i transakcje w jednej kolejce, migracje przez runner z flagą `przebudowa`, kopie JSON formatu 2 w dwóch pulach. Zmiana któregokolwiek punktu niżej to nowy ADR „zastępuje ADR-009”.

### 1. Połączenie i pragmy

- Plik `piekarz.db` w `/Library/SQLite` (`src/lib/db-path.ts`, ADR-001), otwierany raz (`getDb` w `src/data/sqlite-schema.ts`).
- Przy otwarciu, poza transakcją, przed migracjami: `PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON`, `PRAGMA busy_timeout = 5000` (`PRZYGOTOWANIE_MIGRACJI`, `src/data/sqlite-schema.ts`). `busy_timeout` ustawia tylko czas czekania na zajętą bazę przy kilku połączeniach („Query or change the setting of the busy timeout”, pragma.html); przed zakończeniem aplikacji w tle nie chroni (ADR-010).
- Wersja bazy nowsza niż aplikacja: odmowa przed jakąkolwiek zmianą, także przed pragmą WAL (`NewerDatabaseError`, `src/data/runner-migracji.ts`).

### 2. Zapis

- Każdy `runAsync`, `execAsync` i `withTransactionAsync` idzie przez jedną kolejkę (`zKolejka`, `src/data/kolejka-zapisow.ts`, M1-audytor-generalny-001). W treści transakcji wolno używać tylko `tx` z argumentu (`tests/kolejka-zapisow-tx.test.ts`). Odczyty idą bez kolejki.
- Zapis rekordu nadrzędnego przez UPSERT `INSERT … ON CONFLICT(id) DO UPDATE` (zakwas `STARTER_UPSERT`, wpis Dziennika, sesja wypieku), nigdy `INSERT OR REPLACE` na tabeli z tabelami podrzędnymi. `INSERT OR REPLACE` zostaje tylko na tabelach, do których nic się nie odwołuje: `recipes`, `flour_inventory`, `lesson_progress`, `app_settings` (zapis zastępuje cały wiersz wszystkimi kolumnami).
- Zapisy powiązanych wierszy w jednej transakcji (koniec wypieku: wpis, mąka i usunięcie sesji; import; „Usuń wszystkie dane”).
- `withExclusiveTransactionAsync` nie jest używane (nowe połączenie bez kluczy obcych).

### 3. Schemat i migracje

- Jedyne źródło schematu: `SCHEMA_MIGRATIONS` w `src/data/sqlite-schema.ts` (wersje 1–6) i `MIGRACJA_V7` (`src/data/migracja-v7.ts`); wersja w `PRAGMA user_version` i w tabeli `schema_migrations`.
- Wydanych migracji się nie edytuje. Wyjątek nazwany D-300 pkt 4: parser sesji migracji v6 zamrożony jako kopia (`src/data/migracja-v6-parser.ts`) bez zmiany wyniku; kontrola: testy migracji na bazach 1014 i 1021.
- Przed migracjami kopia `VACUUM INTO` obok pliku bazy (`kopiaPrzedMigracja`, `src/data/kopie-przed-migracja.ts`); bez kopii migracja nie rusza.
- Każda migracja we własnej transakcji. **Dodanie kolumny, tabeli albo indeksu:** zwykła migracja. **Każda inna zmiana tabeli** (usunięcie kolumny, zmiana typu, nowe CHECK, NOT NULL, klucz obcy) to przebudowa według sqlite.org (lang_altertable.html §8) z flagą `przebudowa: true`; runner robi kroki 1, 2, 9, 10, 11, migracja kroki 3–8:
  1. `PRAGMA foreign_keys=OFF` przed `BEGIN` (runner);
  2. `BEGIN` (runner);
  3. zapamiętaj indeksy, wyzwalacze i widoki tabeli (`SELECT type, sql FROM sqlite_schema WHERE tbl_name='X'`);
  4. `CREATE TABLE new_X` w nowym kształcie;
  5. `INSERT INTO new_X SELECT … FROM X`;
  6. `DROP TABLE X`;
  7. `ALTER TABLE new_X RENAME TO X`;
  8. odtwórz indeksy, wyzwalacze i widoki;
  9. `PRAGMA foreign_key_check`: niepusty wynik wycofuje migrację (runner);
  10. `COMMIT` (runner);
  11. `PRAGMA foreign_keys = ON` po `COMMIT` albo `ROLLBACK` (runner, `finally`).
- Nigdy „najpierw RENAME starej tabeli” i nigdy `PRAGMA foreign_keys=OFF` wewnątrz transakcji: tam nic nie robi, a `DROP TABLE` rodzica kasuje dzieci kaskadą (dziennik zakwasu pod `starters`).
- **Test kaskady:** `src/data/__tests__/runner-przebudowa-019.sqlite.test.ts` (przebudowa `starters` zachowuje dziennik; przebudowa zostawiająca osierocone wpisy jest wycofana). Każda nowa migracja: test na kopii bazy każdej wydanej wersji schematu (liczności tabel, `integrity_check`, `foreign_key_check`, wersja, drugi start bez zmian). Fikstury: `tests/fixtures/baza-1014-f42c0d8.sql` (v5), `tests/fixtures/baza-1021-39f3890.sql` (v6); bazy v7 (build 1023) brak — do dodania z pierwszą migracją v8.

### 4. Kopie i import

- Format pliku: koperta `piekarz-backup`, `schemaVersion` 2 (`src/lib/backup.ts`); nowsza wersja odrzucona przed dotknięciem danych; każdy wiersz walidowany osobno (zły pominięty i policzony).
- Pola opcjonalne formatu 2: dziennik zakwasu, spiżarnia, ustawienia z listy dozwolonych, lekcje, pola v6/v7 wpisów i zakwasów, surowe uszkodzone wiersze, a w kopii przed czyszczeniem trwające i zaplanowane wypieki (`bakeSessions`, DEC-11 a, M1-audytor-generalny-023). Kopia bez pola nie zmienia tych danych w telefonie.
- Pule po 10 plików w `Documents/Backup/`: `piekarz-kopia-*` po zakończonym wypieku oraz `piekarz-przed-importem-*` / `piekarz-przed-czyszczeniem-*` przed operacjami niszczącymi; nieudana kopia bezpieczeństwa blokuje operację.
- Import w jednej transakcji, kopia przed importem z pełnego stanu bazy; sesje wypieków import tylko dopisuje (nie kasuje).
- Kopia działającej bazy tylko przez `VACUUM INTO`; surowe pliki bazy (po błędzie otwarcia) zawsze w komplecie `.db`, `-wal`, `-shm` (`copyRawDatabaseFiles`, `src/lib/backup.ts`).

### 5. Tabele bez użycia

`pending_ops` i `app_access` istnieją w schemacie v1 i nie są zapisywane (kolejka zegarka wycięta, KL-14; dostęp ze sklepu, ADR-007). Usunięcie to przebudowa schematu i osobna decyzja.

### Konsekwencje

- Dobre: kaskady i CHECK działają na każdym zapisie; nieudany zapis wycofuje całość; przebudowa tabeli nie kasuje dzieci; kopia przed czyszczeniem obejmuje wszystko, co czyszczenie kasuje.
- Złe: zapisy czekają na siebie; odczyt w trakcie transakcji widzi jej niezatwierdzone zmiany; kroki 3–8 przebudowy pisze autor migracji (runner ich nie sprawdza poza `foreign_key_check`).
- Od czego zależy: ADR-010 (zawieszenie w tle) — długie zapisy bez ochrony czasu wykonania w tle.

## Potwierdzenie

- ARCH-06 i ARCH-12: `src/data/__tests__/kolejka-zapisow-001.sqlite.test.ts`, `tests/kolejka-zapisow-tx.test.ts`.
- ARCH-07: `grep -rn "INSERT OR REPLACE\|REPLACE INTO" src` — trafienia tylko w `recipes`, `flour_inventory`, `lesson_progress`, `app_settings` (stan 2026-11-09: 5 wywołań), żadna nie ma tabel podrzędnych (`grep -n REFERENCES src/data/sqlite-schema.ts`: tylko `starter_entries` → `starters`).
- ARCH-08: `src/data/__tests__/runner-przebudowa-019.sqlite.test.ts`; przy przeglądzie migracji: flaga `przebudowa` przy każdym `DROP TABLE` tabeli z `REFERENCES` do niej.
- ARCH-09: `src/data/__tests__/migracja-d1-1014.sqlite.test.ts`, `src/data/__tests__/p9a-baza-1021.sqlite.test.ts`.
- ARCH-10 i ARCH-11: `src/lib/__tests__/backup.test.ts`, `src/data/__tests__/auto-backup.sqlite.test.ts`, `src/data/__tests__/czyszczenie-sesje-023.sqlite.test.ts`.
- Zgodność dokumentu: `tests/architektura-dokumenty-024.test.ts`.

## Opcje: zalety i wady

### A. Jedno połączenie z kolejką — zalety / wady
Zalety: klucze obce włączone na jedynym połączeniu, brak rywalizacji o blokadę, prosty test w Node (`node:sqlite`). Wady: zapisy szeregowo; odczyt widzi niezatwierdzone zmiany transakcji.

### B. Osobne połączenie do zapisu — zalety / wady
Zalety: odczyty nie widzą niezatwierdzonych zmian. Wady: dwa połączenia, pragma na każdym, więcej kodu; `busy_timeout` zaczyna mieć znaczenie.
