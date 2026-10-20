# ADR-008: Dziennik wpisów zakwasu (tabela `starter_entries`, migracja v5) i format kopii w wersji 2

**Data:** 2026-10-20 · **Status:** przyjęta (projekt danych; wdrożenie: M2 / rola 08) · **Zadanie:** M1-audytor-generalny-104 (F-60, F-61, F-62, F-64; BR-ZAKW-005, BR-ZAKW-006, BR-ZAKW-007, BR-DIAG-002) · **Decyduje:** architekt (sprawy techniczne); kształt planu z lodówki: właściciel, D-052

## Kontekst i problem
Zakwas ma dziś jeden wiersz `starters` z ostatnim dokarmieniem (`last_fed_at`, `last_feed_ratio`) i miejscem (`storage_state`); każde dokarmienie nadpisuje poprzednie (`app/(tabs)/zakwas.tsx:171`, zapis przez UPSERT `src/data/sqlite-store.ts:165`). Nie ma historii wpisów, dnia zakładania ani obserwacji. Przepływy PR-05 i PR-11 z kontraktu zakresu (F-60, F-61, F-62, F-64; `docs/scope-contract.md`) wymagają:
- BR-ZAKW-005: „dzień N” zakładania i obserwacje („nic się nie dzieje”, „podwoił objętość w 8 h”, plamy);
- BR-ZAKW-006: plan wypieku z zakwasem z lodówki zaczyna się dokarmieniem 12 h przed mieszaniem (D-052) i ścieżką „niegotowy”;
- BR-ZAKW-007: poprawa godziny jednego wpisu, po której przypomnienie i stan liczą się od poprawionej godziny, a pozostałe wpisy się nie zmieniają; usunięcie jednego wpisu (z „Cofnij”, D-051 1a);
- BR-DIAG-002: Doktor dla zakwasu w dniu 5 bez podwojenia.

## Czynniki decyzji
- Zero utraty danych (zasada 10): istniejące `last_fed_at` każdego zakwasu musi przeżyć migrację jako wpis, a przypomnienia (`src/core/notification-plan.ts:76`) liczyć się od tej samej chwili.
- Jedna prawda o „ostatnim dokarmieniu” (ARCH-02): dziś `last_fed_at`; po zmianie nie może być dwóch rozjeżdżających się źródeł.
- Pierwszy klucz obcy w schemacie (dotąd żadna tabela nie ma `REFERENCES`): `PRAGMA foreign_keys = ON` musi obowiązywać na połączeniu zapisu (ARCH-06, ARCH-12), a zapis zakwasu zostaje UPSERT-em (ARCH-07).
- Platforma: SQLite w expo-sqlite 57.0.4 to 3.50.3 (`node_modules/expo-sqlite/vendor/sqlite3/sqlite3.h`), bez `SQLITE_DEFAULT_FOREIGN_KEYS` w `ExpoSQLite.podspec`, więc klucze obce są domyślnie wyłączone; JSON wbudowany od 3.38, UPSERT od 3.24 (sqlite.org/lang_upsert.html). W testach `node:sqlite` 3.53.4 domyślnie włącza klucze obce (`enableForeignKeyConstraints`, nodejs.org/api/sqlite.html; odtworzenie w raporcie roli 05 z 2026-10-20).
- Eksport i import F-33 muszą przenosić nowe dane; kopia z nowej wersji w starej aplikacji ma dać czytelny komunikat.

## Rozważane opcje
Dziennik: (A) tabela wpisów z poprawą w miejscu · (B) tabela wpisów z wersjonowaniem (nowy wiersz z `poprawiony_z`) · (C) bez tabeli: lista wpisów jako JSON w kolumnie `starters`.
„Ostatnie dokarmienie”: (1) wyliczane z wpisów przy odczycie · (2) `starters.last_fed_at` jako pamięć podręczna aktualizowana w tej samej transakcji.
Format kopii: (a) `schemaVersion` 2 · (b) `schemaVersion` 1 z nowym, opcjonalnym polem.

## Decyzja
Wybrano **A + 1 + a**.
- **A:** BR-ZAKW-007 wymaga, żeby poprawa nie zmieniała *innych* wpisów i nie resetowała danych, a nie żeby przechowywać poprzednią wersję poprawianego wpisu. Poprawa to `UPDATE` jednego wiersza po `id` (`updated_at` zmienia się, `created_at` nie). B dubluje wiersze i komplikuje każde zapytanie („weź najnowszą wersję”) bez wymagania; C łamie walidację wiersz po wierszu i każdy zapis przepisuje całą historię.
- **1:** `lastFedAt` i `feedingRatio` w `StoredStarter` stają się polami wyliczanymi z najnowszego wpisu `feeding` (podzapytanie w `STARTERS_SELECT`, indeks `idx_starter_entries_starter_kind_at`; plan zapytania: `SEARCH … USING COVERING INDEX`). Kolumn `starters.last_fed_at` i `last_feed_ratio` aplikacja od v5 nie zapisuje ani nie czyta; zostają w pliku (jak stare kolumny `app_access`, ADR-007), bo usunięcie wymagałoby przebudowy tabeli rodzica w 12 krokach bez zysku dla użytkownika. Opcja 2 wymaga, żeby każdy zapis profilu zakwasu (UPSERT) nie nadpisał pamięci starszą wartością z formularza — dwa źródła i warunek do pilnowania w każdym nowym zapisie.
- **a:** stara aplikacja (`SCHEMA_VERSION = 1`, `src/lib/backup.ts:8`) odrzuca plik w wersji 2 przed dotknięciem danych komunikatem „Kopia pochodzi z nowszej wersji aplikacji (v2). Zaktualizuj aplikację.” (`src/lib/backup.ts:214-215`). Przy (b) stara aplikacja po cichu pominęłaby dziennik i zaimportowała zakwasy bez historii — warunek „czytelny komunikat” z polecenia planu niespełniony. To decyzja techniczna wynikająca z wymagania; nie ma kompromisu produktowego do rozstrzygnięcia przez właściciela.

### Model danych v5
```sql
CREATE TABLE IF NOT EXISTS starter_entries (
  id TEXT PRIMARY KEY NOT NULL,                       -- nadaje aplikacja
  starter_id TEXT NOT NULL REFERENCES starters(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('feeding', 'observation')),
  occurred_at INTEGER NOT NULL CHECK (occurred_at > 0), -- ms UTC; godzina zdarzenia, poprawialna (F-62)
  feed_ratio TEXT,                                     -- np. '1:1:1'; NULL = nieznana (tylko feeding)
  flour_grams REAL CHECK (flour_grams IS NULL OR flour_grams > 0),
  water_grams REAL CHECK (water_grams IS NULL OR water_grams > 0),
  signs TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(signs) AND json_type(signs) = 'array'),
  created_at INTEGER NOT NULL,                         -- ms UTC, nadaje aplikacja
  updated_at INTEGER NOT NULL,                         -- ms UTC; = created_at do pierwszej poprawy
  CHECK (kind = 'feeding' OR (feed_ratio IS NULL AND flour_grams IS NULL AND water_grams IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_starter_entries_starter_kind_at ON starter_entries(starter_id, kind, occurred_at DESC);
ALTER TABLE starters ADD COLUMN setup_started_at INTEGER;   -- początek zakładania (dzień 1); NULL = zakwas dojrzały
ALTER TABLE starters ADD COLUMN setup_completed_at INTEGER; -- chwila „gotowy”; NULL przy trwającym zakładaniu
```
- `signs`: tablica kodów z jednej listy w TypeScript (`STARTER_SIGNS`: `bubbles`, `rose`, `doubled`, `no_activity`, `mold_signs`); CHECK pilnuje tylko kształtu (tablica JSON), lista kodów żyje w kodzie, parser wiersza odrzuca nieznany kod (*dlaczego:* nowa obserwacja nie wymaga przebudowy tabeli).
- Stan zakładania: w trakcie ⇔ `setup_started_at IS NOT NULL AND setup_completed_at IS NULL`. Dzień N = różnica dni kalendarzowych (czas lokalny) między `setup_started_at` a teraz + 1 — czysta funkcja domeny, nie kolumna.
- „Gotowy” (RD-24-W2, ZAK-ZAL-007, ZAK-LOD-002): wpis `observation` z `doubled` najwyżej 8 h po ostatnim `feeding` (granica włączna; stała z modułu konfiguracji z ID twierdzenia) — wynik obliczenia, nie kolumna. `setup_completed_at` zapisuje się w tej samej transakcji co wpis, który spełnił warunek; późniejsza poprawa wpisów go nie cofa.
- **Plan z lodówki (BR-ZAKW-006, D-052) to wynik obliczenia, nie tabela:** czysta funkcja planu dokłada krok `starter_feed` na `mieszanie − 12 h`, gdy wybrany zakwas ma `storage_state = 'FRIDGE'`; krok trafia do migawki kroków sesji (JSON w `app_settings`, `src/data/bake-session-store.ts`), z nowym opcjonalnym polem `ActiveBakeState.starterId` (bez migracji SQL; parser dopuszcza brak). Wykonanie kroku zapisuje zwykły wpis `feeding` (i `storage_state = 'ROOM_TEMP'` w tej samej transakcji). „Niegotowy” = brak `doubled` w ≤ 8 h od tego dokarmienia — obliczenie.
- **Doktor zakwasu (BR-DIAG-002) nie zapisuje niczego:** wejściem są dzień N, wpisy i zaznaczone objawy; wynik to treść roli 06. Zaznaczone w Doktorze plamy dają polecenie wyrzucenia (RD-21-W1) bez zapisu. Obserwacja zapisuje się tylko z ekranu dnia („Zapisz dzień N”, „Zostaw zapis i wróć”). *Dlaczego:* żadne BR nie wymaga historii diagnoz; to, czego nie zapisujemy, nie wymaga migracji ani eksportu.

### Ścieżki zapisu
- Zapis zakwasu dalej UPSERT; od v5 bez `last_fed_at` i `last_feed_ratio` w liście kolumn. `INSERT OR REPLACE` na `starters` jest zakazany: przy włączonych kluczach kaskada kasuje dziennik (odtworzenie: 1 → 0 wpisów).
- Nowy zakwas, dokarmienie z „gotowy”, start zakładania: rodzic i dzieci w jednej `withTransactionAsync` na głównym połączeniu, rodzic pierwszy.
- Poprawa wpisu: `UPDATE starter_entries SET occurred_at = ?, feed_ratio = ?, flour_grams = ?, water_grams = ?, signs = ?, updated_at = ? WHERE id = ?`; potem `resyncNotifications`.
- Usunięcie wpisu (D-051 1a): `DELETE … WHERE id = ?`; „Cofnij” wstawia zapamiętany wiersz z tym samym `id` (`ON CONFLICT(id) DO NOTHING`). Bez kolumny „usunięto”: zamknięcie aplikacji w oknie „Cofnij” utrwala usunięcie, o które użytkownik prosił.
- Usunięcie zakwasu (potwierdzenie przy historii, D-051): w jednej transakcji jawnie `DELETE FROM starter_entries WHERE starter_id = ?`, potem `DELETE FROM starters WHERE id = ?`. Kaskada jest zabezpieczeniem, nie jedyną drogą (*dlaczego:* usunięcie nie zależy od tego, czy pragma obowiązuje na danym połączeniu).
- Import: w jednej transakcji `DELETE FROM starter_entries`, `DELETE FROM starters`, zakwasy, potem wpisy. Wpis z `starterId` spoza pliku jest pomijany przy walidacji i liczony w `skippedRows`, zamiast przerywać import naruszeniem klucza.

### Migracja v5
Jedna migracja w istniejącym runnerze (`applySchemaMigrations`, `src/data/sqlite-schema.ts:224`): kopia `VACUUM INTO` przed migracją (`src/data/sqlite-schema.ts:249-250`), transakcja, wiersz w `schema_migrations`, `user_version = 5`. Bez przebudowy tabeli (CREATE TABLE, CREATE INDEX, ADD COLUMN), więc bez procedury 12 kroków. Kolumny dodawane z kontrolą `PRAGMA table_info` jak w v4. Wypełnienie: jeden wpis `feeding` na zakwas z `last_fed_at > 0`:
```sql
INSERT INTO starter_entries (id, starter_id, kind, occurred_at, feed_ratio, created_at, updated_at)
  SELECT 'v5-' || id, id, 'feeding', last_fed_at, last_feed_ratio, last_fed_at, last_fed_at
  FROM starters WHERE last_fed_at IS NOT NULL AND last_fed_at > 0
  ON CONFLICT (id) DO NOTHING;
```
Zakwasy bez `last_fed_at` nie dostają wpisu (dziś też nie mają przypomnienia). `setup_started_at` zostaje NULL dla istniejących zakwasów (nie wiemy, że są w trakcie zakładania).

### Format kopii w wersji 2
`SCHEMA_VERSION = 2`; `state.starterEntries: StoredStarterEntry[]`; zakwasy z `setupStartedAt?`, `setupCompletedAt?` (oraz `lastFedAt`, `feedingRatio` wyliczonymi, tylko do czytania pliku przez człowieka; import je pomija, gdy są wpisy).
- Kopia v1 w nowej aplikacji: przyjęta; dla każdego zakwasu z `lastFedAt > 0` import tworzy wpis `feeding` według tej samej reguły co migracja (id `v5-<starterId>`), więc przypomnienia działają jak przed importem.
- Kopia v2 w starej aplikacji: odrzucona przed zapisem komunikatem z `src/lib/backup.ts:215` (stare buildy pokazują go po polsku niezależnie od języka; tego w wydanych buildach nie zmienimy).
- Kopie automatyczne i kopia bezpieczeństwa przed importem muszą zawierać dziennik: obie biorą stan z `collectBackupData` (dziś ekran importu składa migawkę ręcznie, `src/components/settings/BackupAndDataSection.tsx:96-106` — przekazanie do 08).

### Konsekwencje
- Dobre: historia wpisów bez utraty istniejącego `last_fed_at`; jedna prawda o ostatnim dokarmieniu; plan z lodówki i Doktor bez nowych tabel; migracja bez przebudowy tabel.
- Złe: starszy build otwierający bazę v5 (cofnięcie wersji w TestFlight) przejdzie w tryb tylko do odczytu (`NewerDatabaseError`) i pokaże `last_fed_at` sprzed v5 — nieaktualne, ale bez utraty danych. Kopia v2 nie wczyta się w starszym buildzie.
- Od czego zależy: (1) jedno połączenie z `PRAGMA foreign_keys = ON` dla wszystkich zapisów — dziś `getDb` może otworzyć bazę dwa razy przy starcie (znalezisko 05-architekt-fix-p5-001 w raporcie roli 05 z 2026-10-20); (2) treści i liczby (8 h, 12 h, 7–10 dni) z rejestru roli 06 z ID twierdzeń.

### Potwierdzenie
- Test migracji na kopii bazy każdej wydanej wersji (fikstury `src/data/__tests__/fixtures/schema-70fd81a.sql`, `schema-adfe1fa.sql`, `schema-b21c194.sql`, `schema-ebd8471.sql`) oraz bazy v4 z migracji 1–4: liczności wszystkich tabel bez zmian, `starter_entries` = liczba zakwasów z `last_fed_at > 0`, `integrity_check = ok`, `foreign_key_check` pusty, `user_version = 5`, drugie uruchomienie bez zmian, przypadek negatywny (błąd w v5 → wersja 4 i dane bez zmian). Prototyp tego testu przeszedł 2026-10-20 (raport roli 05, `dowody/proto-v5.txt`).
- `PRAGMA foreign_keys` odczytane wewnątrz transakcji zapisu = 1 (ARCH-06, ARCH-12); test adaptera z bazą otwartą z `enableForeignKeyConstraints: false`.
- ARCH-07: `grep -rn "INSERT OR REPLACE INTO starters"` pusty; test: UPSERT zakwasu zostawia wpisy.
- BR-ZAKW-007: test poprawy godziny (18:00 → 08:00) — `lastFedAt` i termin przypomnienia od 08:00, pozostałe wpisy bajt w bajt bez zmian; test usunięcia jednego wpisu i „Cofnij”.
- F-33: eksport → import z dziennikiem (liczności i wartości), import kopii v1 (wpis z `lastFedAt`), kopia v2 w parserze z `SCHEMA_VERSION = 1` (komunikat, dane bez zmian).

## Opcje: zalety i wady
- **A, poprawa w miejscu** — zalety: najmniej wierszy i najprostsze zapytania; spełnia BR. Wady: nie widać, jaka była godzina przed poprawą (BR tego nie wymaga).
- **B, wersjonowanie** — zalety: pełny ślad poprawek. Wady: każde zapytanie filtruje wersje, eksport większy, usunięcie wymaga decyzji, którą wersję kasować.
- **C, JSON w `starters`** — zalety: bez nowej tabeli. Wady: brak walidacji wiersza i indeksu, każdy zapis przepisuje historię, ryzyko utraty całej historii przy uszkodzonym JSON.
- **1, wyliczanie** — zalety: jedna prawda. Wady: podzapytanie przy odczycie listy (z indeksem pokrywającym).
- **2, pamięć podręczna** — zalety: odczyt jak dziś. Wady: dwa źródła; zapis profilu może przywrócić starą wartość.
- **a, wersja 2 formatu** — zalety: czytelna odmowa w starej aplikacji. Wady: kopia v2 nie wczyta się w buildach sprzed v5.
- **b, wersja 1 z nowym polem** — zalety: stara aplikacja wczyta zakwasy. Wady: cicha utrata dziennika przy imporcie w starej aplikacji.
