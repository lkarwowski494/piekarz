# Wejście weryfikacji G2-dane-migracje (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 05-architekt-002 · Runner migracji nie ma bezpiecznej drogi przebudowy tabeli: pierwsza taka migracja skasuje dziennik zakwasu bez błędu
- Pozycja listy kontrolnej: ARCH-08
- Poziom: P2
- Realność: teoretyczny (dziś brak migracji z przebudową; dotyczy danych)   · Pewność: wysoka
- Rodzaj: D
- Dowód: `dowody/sonda-przebudowa-runner.txt` (kod 0): hipotetyczna migracja v8 przebudowuje `starters` (kroki 4–7 procedury 12 kroków) w obecnym runnerze. Wariant z `PRAGMA foreign_keys = OFF` w `run` — przed: 1 zakwas, 5 wpisów; po: 1 zakwas, 0 wpisów, stan magazynu „ok”, bez błędu. Wariant z OFF w kroku `przed` — wpisy zostają (5), ale połączenie aplikacji zostaje z `foreign_keys = 0` do następnego startu.
- Mechanizm: runner włącza klucze (`src/data/sqlite-schema.ts:352`), otwiera transakcję (`:374`) i wykonuje `run` w niej; nie ma flagi przebudowy, wyłączenia kluczy przed `BEGIN` z włączeniem po `COMMIT`/`ROLLBACK` ani `PRAGMA foreign_key_check` przed `COMMIT`. Jedyne miejsce przed `BEGIN` (`przed`) nie ma pary „po”. `grep -n "foreign_key_check" src/data/sqlite-schema.ts` → 0 trafień. ADR-008 przewiduje przebudowę rodzica przy usuwaniu kolumn `starters` (`docs/adr/ADR-008_dziennik_wpisow_zakwasu_migracja_v5.md:27`).
- Powraca: nie (w tym repo); błąd jest w tabeli kalibracji roli („PRAGMA foreign_keys=OFF wewnątrz transakcji migracji”) → trwała kontrola: test runnera z migracją przebudowy.
- Kroki w aplikacji: dziś brak; pierwsza aktualizacja z migracją przebudowującą `starters` usunie dziennik zakwasu u każdego użytkownika po cichu (kopia `VACUUM INTO` sprzed migracji zostaje tylko w `Library/SQLite`).
- Test akceptacyjny: test runnera z migracją przebudowującą `starters` przy 5 wpisach w `starter_entries`: liczności przed = po, `foreign_key_check` pusty, `PRAGMA foreign_keys` = 1 na połączeniu aplikacji po migracji, wynik czerwony na 2ef8870a.

### 05-architekt-503 · Powrót aplikacji na pierwszy plan w trakcie kopii przed migracją kończy się ekranem błędu bazy mimo udanej migracji
- Pozycja listy kontrolnej: ARCH-08
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D
- Dowód: `app/_layout.tsx:89` „if (s === 'active') void resyncNotifications();” — nasłuch działa od chwili, gdy start nie jest awaryjny, także w trakcie `initDatabase`; uzgadnianie czyta bazę (`src/lib/notifications.ts:142` „const kopia = await collectBackupData();”) z pominięciem `StorageGate`. Odczyt kolumn `bakes.leaven` przed migracją v7 kończy się „no such column: leaven”, `odczytNieudany` ustawia stan „unavailable”, a `markStorageReady` go nie zmienia (`src/data/storage-status.ts:65` „if (state !== 'initializing') return;”). Odtworzenie na kopii bazy 1021 (`dowody/sonda-start2.txt`): odczyt w oknie kopii `VACUUM INTO` i kroku `przed` → „stan po initDatabase=unavailable (Error: no such column: leaven)”; później w startcie → „ok”.
- Mechanizm: odczyty spoza bramki w trakcie startu: `grep -rn "AppState.addEventListener" app src` → `app/_layout.tsx:88` (uzgadnianie, czyta bazę), `src/lib/platnosci/stan.ts:135` (rusza dopiero po `initDatabase`), pozostałe na ekranach za bramką.
- Powraca: tak — wcześniejsze znalezisko roli 05 o numerze 502 (komentarz `src/data/storage-status.ts:25`: „ekrany nie czytają bazy: StorageGate czeka”) zamknęło odczyty ekranów, nie nasłuchu w `_layout` → trwała kontrola w teście.
- Kroki w aplikacji: pierwsze uruchomienie po aktualizacji z bazą v6 (buildy 1017–1022), zgoda na powiadomienia; użytkownik przełącza się do innej aplikacji i wraca, zanim skończy się kopia przed migracją → ekran „Nie można otworzyć bazy danych”; „Spróbuj ponownie” naprawia. Dane nie giną. Czy iOS wysyła `change → active` także przy zimnym starcie, nie sprawdziłem [DO USTALENIA, test na telefonie].
- Test akceptacyjny: test na kopii bazy 1021: `resyncNotifications` (zgoda „granted”) wywołane w trakcie `initDatabase` na każdym kroku pętli zdarzeń → stan po starcie „ok”.

### 05-architekt-504 · „Usuń wszystkie dane” kasuje trwające i zaplanowane wypieki, których nie ma w obiecanej „kopii obecnych danych”
- Pozycja listy kontrolnej: ARCH-10
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P
- Dowód:
  - Okno: `src/components/settings/BackupAndDataSection.tsx:52` „Przed usunięciem zapiszę kopię obecnych danych.”
  - Kopia z `collectBackupData` nie ma sesji ani planów z decyzji D-102 (D1-2, „sesje i plany poza kopią”), podjętej dla formatu eksportu; czyszczenie kasuje `bake_sessions`: `src/data/usun-wszystko.ts:32`.
  - Odtworzenie na kopii bazy 1021 (`dowody/sonda-czyszczenie.txt`): przed `bake_sessions` 2 (`bake_live` active, `plan_sobota` planned) → po 0; plik `piekarz-przed-czyszczeniem-*.json` ma klucze bakes, starters, customRecipes, starterEntries, flourInventory, settings, lessonProgress, bez sesji.
- Mechanizm: jedna ścieżka (`usunWszystkieDane`); import nie kasuje `bake_sessions`, więc tam problemu nie ma.
- Powraca: nie
- Kroki w aplikacji: Ustawienia → „Usuń wszystkie dane” w trakcie wypieku albo z planem na sobotę → po imporcie kopii przed czyszczeniem wypiek i plan nie wracają.
- Test akceptacyjny: (a) liczności `bake_sessions` przed czyszczeniem = po imporcie kopii; (b) test tekstu okna i klucz w 35 słownikach.

### 12-niezawodnosc-004 · Kopie ratunkowe udostępniane bez `integrity_check`; awaryjna kopia surowych plików przy otwartym połączeniu
- Pozycja listy kontrolnej: NIE-01
- Poziom: P2
- Realność: brzegowy   · Pewność: wysoka
- Rodzaj: D
- Dowód: kopia przed migracją (`src/data/kopie-przed-migracja.ts:45`) i pakiet (`src/lib/kopia-plikow-bazy.ts:15`) nie są sprawdzane przed udostępnieniem; `grep integrity_check` w `app` i `src` poza testami → 0 trafień (`dowody/nie02-grep-naprawa.txt`). Po błędzie innym niż migracja surowe kopie powstają przed zamknięciem połączenia (`src/data/sqlite-schema.ts:485`, `src/data/sqlite-schema.ts:486`), a w `ErrorBoundary` pakiet jest zapasowym eksportem przy otwartej bazie (`src/components/RescueScreen.tsx:42`). Odtworzenie algorytmu kopii po awarii procesu: komplet trzech plików 8/8, `integrity_check` ok (`dowody/nie01-odtworzenie-kopii-plikow.txt`) — kopia jest kompletna, brakuje tylko sprawdzenia i informacji o wyniku.
- Mechanizm: żadna ścieżka ratunkowa nie sprawdza kopii; 3 miejsca: `kopiaPrzedMigracja`, `pakietPlikowBazy`, `copyRawDatabaseFiles` (`src/lib/backup.ts:305`).
- Powraca: nie
- Kroki w aplikacji: uszkodzona baza → ekran błędu → „Udostępnij kopię bazy” → użytkownik i deweloper nie wiedzą, czy kopia jest zdrowa, zanim zaczną odzyskiwanie.
- Test akceptacyjny: test sqlite na uszkodzonej i zdrowej kopii: wynik sprawdzenia zapisany i widoczny w skrypcie albo w aplikacji.

### 07-jakosc-007 · Przeżyły mutanty: brak ROLLBACK po nieudanej migracji i granica 1 oz w formacie USA
- Pozycja listy kontrolnej: JAK-04
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: M2 — usunięcie ROLLBACK w `src/data/sqlite-schema.ts:385`: 455/455 zestawów zielonych, kod 0; test błędu migracji czyta stan drugim połączeniem (`src/data/__tests__/starter-entries-v5-migration.sqlite.test.ts:134`), które i tak widzi tylko zatwierdzone dane. M8 — granica `oz2 >= 1` → `>= 2` w `src/lib/unit-converter.ts:192`: 111/111 zielonych, kod 0 (`dowody/mutacje.txt`). Pozostałe 8 mutantów zabite.
- Mechanizm: test sprawdza skutek po restarcie, nie stan połączenia aplikacji po błędzie; format 1–2 oz bez przypadku testowego.
- Powraca: nie
- Kroki w aplikacji: M2 — po nieudanej migracji aplikacja zostaje w tej samej sesji z otwartą transakcją (ekran błędu z kopią do udostępnienia); po restarcie dane są całe, więc skutek ogranicza się do tej sesji (brzegowy). M8 — składnik 30–56 g w jednostkach USA pokazany z inną liczbą miejsc po przecinku (szlif).
- Test akceptacyjny: oba mutanty z `dowody/mutacje.txt` dają czerwony wynik.
