# Architektura Techniczna Systemu (System Architecture v2.0)
## Aplikacja Piekarz (Crust) — Apps4Craft Studio
**Wersja:** 2.0-craft  
**Data wydania:** 18.10.2026  
**Rola:** Principal System Architect, Lead Software Engineer & Data Modeling Strategist  
**Status:** WIĄŻĄCY I ZATWIERDZONY; sekcje 1, 2, 4, 5 i 7 uzgodnione z kodem 2026-11-09 (rola 05, M1-audytor-generalny-024; stan zastany w ADR-009 i ADR-010)  
**Dokumenty nadrzędne:** `docs/brd/00_START.md`, `docs/scope-contract.md`, `docs/monetyzacja-audyt.md`, `docs/adr/ADR-001..010` (ADR-003 zastąpiony przez ADR-009, ADR-005 przez ADR-010)  

---

## 1. Zasady Architektoniczne i Paradygmaty

System inżynieryjny aplikacji **Piekarz (Crust)** opiera się na 4 filarach architektonicznych studia Apps4Craft:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   WARSTWY ARCHITEKTURY CZYSTEJ                         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
     ┌───────────────────────────────┼──────────────────────────────┐
     ▼                               ▼                              ▼
【WARSTWA PREZENTACJI (UI)】  【WARSTWA CZYSTEJ DOMENY】     【WARSTWA TRWAŁOŚCI (DATA)】
• 5 Zakładek (Expo Router 57) • Reguły matematyczne RD-nn    • Relacyjny SQLite WAL
• @apps4craft/ui Design System• True Baker's % + 4-DDT       • Chroniony katalog /Library/SQLite
• 1-Tap Quick Start           • reverse-scheduler (Q10=3,0)  • Indeksy B-Tree (plan zapytań)
• Akordeon Rzemieślniczy Pro  • Maszyna Stanów Wypieku FSM   • Jedna kolejka zapisów
• AppAccessContext (Pub/Sub)  • Doktor Chleba (Triage)       • Kopie JSON (2 pule po 10)
```

1. **Izolacja Domeny od Frameworka (Clean Architecture):**  
   Cała logika fizyki piekarskiej (`src/core/domain-rules.ts`, `src/core/domain/types.ts`) jest w 100% czystym TypeScriptem bez importów z bibliotek Reacta, React Native czy Expo.
2. **100% Offline-First i Zero Telemetrii:**  
   Brak zależności od sieci, brak zewnętrznych serwerów i SDK śledzących (*Data Not Collected*).
3. **Determinizm Danych i Transakcyjność ACID:**  
   Wszystkie mutacje wielotabelowe są wykonywane w transakcjach SQLite, a każdy zapis idzie przez jedną kolejkę na jednym połączeniu z włączonymi kluczami obcymi (ADR-009).
4. **Ergonomia Kuchenna („Flour Hands”):**  
   Wielkie cele dotykowe (64pt), blokada wygaszania (Keep-Awake) i powiadomienia lokalne kroków (ADR-006). Live Activity i aplikacja na Apple Watch są wycięte (`docs/scope-contract.md`, KL-06, KL-07).

---

## 2. Model Danych Relacyjnych (SQLite DDL)

Jedynym źródłem schematu jest lista `SCHEMA_MIGRATIONS` w `src/data/sqlite-schema.ts`, wykonywana przez `applySchemaMigrations` (sekcja 5). Innych plików schematu nie ma (M1-audytor-generalny-062).

> **Uzgodnione 2026-11-09 (rola 05, M1-audytor-generalny-024):** uwaga z 20.10.2026 o niewykonywanym projekcie pragm i CHECK zamknięta; 2.1 i 2.2 opisują stan kodu (schemat v7).

### 2.1 Konfiguracja Pragmatyki SQLite
Pragmy ustawiane przy otwarciu bazy, poza transakcją, przed migracjami (`PRZYGOTOWANIE_MIGRACJI` w `src/data/sqlite-schema.ts`):
```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```
`synchronous`, `temp_store` i `cache_size` nie są ustawiane (wartości domyślne SQLite). `busy_timeout` dotyczy tylko czekania na bazę zajętą przez inne połączenie; aplikacja ma jedno połączenie z jedną kolejką zapisów (ADR-009).

**Zawieszenie w tle (`0xdead10cc`).** Apple: „The operating system terminated the app because it held on to a file lock or SQLite database lock during suspension” (https://developer.apple.com/documentation/xcode/sigkill, odczyt 2026-11-09). Ochroną jest zwolnienie blokady przed zawieszeniem (krótkie transakcje, które nie czekają na zdarzenia, albo dodatkowy czas wykonania w tle), a nie tryb dziennika ani czas czekania na blokadę. Zasady i sposób sprawdzenia (przegląd ARCH-13, raporty awarii TestFlight z `0xdead10cc`, pomiar na urządzeniu): ADR-010.

### 2.2 Zestawienie Tabel Relacyjnych

| Nazwa Tabeli | Klucz Główny | Zastosowanie / Opis | CHECK w schemacie (stan kodu, v7) |
|---|---|---|---|
| `schema_migrations` | `version INT` | Wykonane migracje (wersja, czas, opis) | brak |
| `bakes` | `id TEXT` | Dziennik wypieków i oceny sensoryczne | `leaven` i `bake_method` z zamkniętej listy albo NULL (v7) |
| `starters` | `id TEXT` | Kultury zakwasu | `fridge_feed_weekday` 1–7, `fridge_feed_minute` 0–1439 tylko z dniem (v6) |
| `recipes` | `id TEXT` | Receptury wbudowane i własne | brak |
| `flour_inventory` | `id TEXT` | Spiżarnia mąk | brak |
| `lesson_progress` | `level_id INT`| Zaliczone lekcje Szkoły chleba | brak |
| `app_access` | `id TEXT` | Tabela z v1, bez zapisu (dostęp ze sklepu, ADR-007) | brak |
| `app_settings` | `key TEXT` | Ustawienia klucz-wartość | brak |
| `pending_ops` | `id TEXT` | Tabela z v1, bez zapisu (kolejka zegarka wycięta, KL-14) | brak |
| `starter_entries` (v5, ADR-008) | `id TEXT` | Dziennik zakwasu: dokarmienia i obserwacje; `starter_id` → `starters(id) ON DELETE CASCADE` — jedyny klucz obcy w schemacie | `kind IN ('feeding','observation')`, `occurred_at > 0`, gramy > 0, `signs` jako tablica JSON, ilości tylko przy `feeding` |
| `bake_sessions` (v6, D-102) | `id TEXT` | Trwające i zaplanowane wypieki, wiersz na wypiek (`session_json`: sesja v2 albo plan v1); zapis UPSERT, limity 2 i 5 z `src/core/limity-wypiekow.ts`; bez kluczy obcych; w kopii tylko przed czyszczeniem (`bakeSessions`, DEC-11 a) | `status IN ('active','planned')` |

Od v6 `bakes.recipe_id` (receptura wpisu, NULL dla wpisów sprzed v6) i stały dzień karmienia w `starters` (`fridge_feed_weekday` 1–7 ISO, `fridge_feed_minute` 0–1439, CHECK); trwająca sesja nie leży już w `app_settings.active_bake_session` (D-102).

Od v5 `starters` dostaje `setup_started_at` i `setup_completed_at` (zakładanie zakwasu, dzień N), a „ostatnie dokarmienie” (`lastFedAt`, `feedingRatio`) aplikacja wylicza z najnowszego wpisu `feeding`; kolumn `last_fed_at` i `last_feed_ratio` od v5 nie zapisuje ani nie czyta (ADR-008).

### 2.3 Indeksy B-Tree (plan zapytań w sekcji 7)
```sql
CREATE INDEX IF NOT EXISTS idx_bakes_started_at ON bakes(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_starters_last_fed_at ON starters(last_fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_built_in ON recipes(is_built_in, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flour_inventory_name ON flour_inventory(name);
CREATE INDEX IF NOT EXISTS idx_pending_ops_status ON pending_ops(status, created_at ASC);
-- v5 (ADR-008): ostatnie dokarmienie zakwasu, plan zapytania SEARCH … USING COVERING INDEX
CREATE INDEX IF NOT EXISTS idx_starter_entries_starter_kind_at ON starter_entries(starter_id, kind, occurred_at DESC);
-- v6 (D-102): lista trwających i zaplanowanych wypieków
CREATE INDEX IF NOT EXISTS idx_bake_sessions_status ON bake_sessions(status, created_at);
```

---

## 3. Architektura Stanu, Reaktywność i Likwidacja Wady M8

> **Zastąpione 2026-10-19 (ADR-007):** krok 2 poniżej („Zapis w SQLite: setSubscriptionTier”) nie istnieje. Dostęp pochodzi z `Transaction.currentEntitlements` (adapter `src/lib/platnosci/sklep.ts`), pamięć ostatniego odczytu jest w `app_settings`, stan wspólny w `src/lib/platnosci/stan.ts`, nasłuch transakcji od startu w `app/_layout.tsx`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRZEPŁYW REAKTYWNYCH UPRAWNIEŃ                       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                    1. Zakup w PaywallModal (StoreKit 2)
                                     ▼
                2. Zapis w SQLite: setSubscriptionTier(...)
                                     ▼
             3. AppAccessProvider rozgłasza stan (Pub/Sub)
                                     ▼
     ┌───────────────────────────────┼──────────────────────────────┐
     ▼                               ▼                              ▼
【Kalkulator】                  【Stolnica】                   【Zakwas】
access.isSubscribed = true      access.isSubscribed = true     access.isSubscribed = true
Paywall znika                   Odblokowany nowy wypiek        Odblokowane dokarmienia
```

- **Luka M8 rozwiązana:** Wprowadzenie centralnego serwisu uprawnień z subskrypcją stanu (`IAppAccessService.addListener`) oraz React Contextu w `_layout.tsx` eliminuje wymóg restartu aplikacji po zakupie planu rocznego lub Lifetime.
- **Odporność usuwania danych (DEC-48):** Operacje `deleteRecipe` i `deleteStarter` są wyjęte spod strażnika `requireActionAccess`, gwarantując prawo do usunięcia danych w trybie Read-Only.

---

## 4. Praca w Tle (ADR-010, ADR-006)

> **Zastąpione 2026-11-09 (ADR-010):** dawny opis samodzielnej aplikacji watchOS, gestu Double Tap i kolejki Outbox (ADR-005) nie istnieje w kodzie; zegarek i kolejka są wycięte (`docs/scope-contract.md`, KL-06, KL-14).

1. **Bez trybów tła:** `app.json` nie ma `UIBackgroundModes`; `audio` i `remote-notification` zabronione w `scripts/verify-native.mjs` (App Review 2.5.4).
2. **Zawieszenie bez blokady bazy:** transakcje krótkie, bez czekania na sieć, timer, okno ani zdarzenie; kod nie prosi o dodatkowy czas wykonania w tle (opcje i sposób sprawdzenia w ADR-010).
3. **Powiadomienia lokalne kroków i karmienia (ADR-006):** `expo-notifications ~57.0.23`, powiadomienie na bezwzględną datę z zapisanej sesji wypieku i terminy karmienia z dziennika zakwasu. Czysta funkcja `planNotifications` (`src/core/notification-plan.ts`) wylicza listę, adapter `resyncNotifications` (`src/lib/notifications.ts`) uzgadnia ją z oczekującymi po każdej zmianie zegara, zakwasu, importu i przy powrocie z tła. Bez Live Activity w 1.0 (KL-07).

---

## 5. Strategia Bezpiecznej Migracji (Aksjomat Zerowej Utraty Danych)

Źródłem prawdy o schemacie jest lista `SCHEMA_MIGRATIONS` w `src/data/sqlite-schema.ts` (wersje 1–6) z `MIGRACJA_V7` (`src/data/migracja-v7.ts`); runner: `uruchomMigracje` w `src/data/runner-migracji.ts`. Stan 2026-11-09: `PRAGMA user_version` = 7. Pełny kontrakt: ADR-009 §3.

**Zasady:**
- Wersja bazy nowsza niż aplikacja: odmowa przed jakąkolwiek zmianą (`NewerDatabaseError`).
- Przed migracjami kopia `VACUUM INTO` obok pliku bazy (`backup_pre_migration-v<wersja>-<czas>.db`, `src/data/kopie-przed-migracja.ts`); bez kopii migracja nie rusza.
- Każda migracja we własnej transakcji; zapisuje wiersz w `schema_migrations` i `user_version`. Wydanych migracji się nie zmienia, poprawka to nowa migracja. Wyjątek nazwany D-300 pkt 4: parser sesji migracji v6 zamrożony jako kopia (`src/data/migracja-v6-parser.ts`) bez zmiany wyniku.
- Zapis rekordu nadrzędnego UPSERT-em (`ON CONFLICT(id) DO UPDATE`), nie `INSERT OR REPLACE`.

**Dodanie kolumny, tabeli albo indeksu:** zwykła migracja w transakcji (tak powstały v2–v7).

**Każda inna zmiana tabeli** (usunięcie kolumny, zmiana typu, nowe CHECK, NOT NULL, klucz obcy): przebudowa według sqlite.org (https://www.sqlite.org/lang_altertable.html §8, odczyt 2026-11-09) z flagą `przebudowa: true` w migracji. Kolejność 12 kroków (runner: 1, 2, 9, 10, 11; migracja: 3–8):
1. `PRAGMA foreign_keys=OFF` przed `BEGIN` (w transakcji pragma nic nie robi: „This pragma is a no-op within a transaction”, pragma.html);
2. `BEGIN`;
3. zapamiętaj indeksy, wyzwalacze i widoki tabeli;
4. `CREATE TABLE new_X` w nowym kształcie;
5. `INSERT INTO new_X SELECT … FROM X`;
6. `DROP TABLE X`;
7. `ALTER TABLE new_X RENAME TO X`;
8. odtwórz indeksy, wyzwalacze i widoki;
9. `PRAGMA foreign_key_check`: niepusty wynik wycofuje migrację;
10. `COMMIT`;
11. `PRAGMA foreign_keys = ON` (także po `ROLLBACK`).

Nigdy „najpierw RENAME starej tabeli” (sqlite.org: „might corrupt references to that table in triggers, views, and foreign key constraints”). Bez kroku 1 `DROP TABLE starters` „performs an implicit DELETE” (foreignkeys.html) i kaskadą kasuje dziennik zakwasu.

**Test kaskady:** `src/data/__tests__/runner-przebudowa-019.sqlite.test.ts` — przebudowa `starters` zachowuje wszystkie wpisy dziennika, a przebudowa zostawiająca osierocone wpisy jest wycofana.

**Test na kopii bazy każdej wydanej wersji** (zasada wspólna 10; liczności tabel, `integrity_check`, `foreign_key_check`, wersja, drugi start bez zmian):
- `user_version = 0` (1006, 1007, 1012) i 3 (1013): `testflight-migration.sqlite.test.ts`, `starter-feeding-ratio.sqlite.test.ts` (fikstury `fixtures/schema-<commit>.sql`);
- 5 (1014–1016): `migracja-d1-1014.sqlite.test.ts` (`tests/fixtures/baza-1014-f42c0d8.sql`, kopia JSON `kopia-1014-f42c0d8.json`);
- 6 (1017–1022): `p9a-baza-1021.sqlite.test.ts`, `p9a-migracja-v7-czerwone.sqlite.test.ts` (`tests/fixtures/baza-1021-39f3890.sql`);
- 7 (1023): fikstury jeszcze brak — dodać z pierwszą migracją v8.

**Historia migracji:** v1 schemat startowy; v2 oceny miękiszu i proporcja karmienia; v3 kolumna podpisu `app_access`; v4 `starters.last_feed_ratio`; v5 dziennik zakwasu `starter_entries` z kluczem obcym (ADR-008, kopia w formacie 2); v6 `bake_sessions`, `bakes.recipe_id`, stały dzień karmienia (D-102; krok `przed` zapisuje surową starą sesję w `Backup/kopie-ratunkowe/`); v7 `bakes.leaven` i `bakes.bake_method` (D-242, D-260).

---

## 6. Macierz Zgodności: Decyzje ADR a Wymagania Biznesowe BRD

| Rejestr ADR | Kluczowa Decyzja Architektoniczna | Pokrywane Wymagania BRD |
|---|---|---|
| **ADR-001** | `expo-sqlite` w `/Library/SQLite` | `NFR-OFF-001`, `NFR-DANE-001`, `ZP-03` |
| **ADR-002** | `AppAccessContext` + Pub/Sub (M8) | `BR-ZAK-001..010`, `DEC-11`, `DEC-48` |
| **ADR-003** | zastąpiony przez ADR-009 (2026-11-09) | — |
| **ADR-004** | Maszyna Stanów Wypieku FSM | `BR-ETAP-001..025`, `RD-01..15`, `ZP-10` |
| **ADR-005** | zastąpiony przez ADR-010 (2026-11-09) | — |
| **ADR-006** | Powiadomienia lokalne kroków i karmienia (uzgadnianie z zapisanym stanem) | `BR-CZAS-001`, `BR-CZAS-002` kryt. 1, `BR-ZAKW-004`, `Z-041`, `Z-056` |
| **ADR-008** | Dziennik wpisów zakwasu `starter_entries` (migracja v5), plan z lodówki i Doktor zakwasu jako obliczenia, kopia w formacie 2 | `BR-ZAKW-005`, `BR-ZAKW-006`, `BR-ZAKW-007`, `BR-DIAG-002`, `BR-DANE-003` |
| **ADR-009** | Dane w SQLite: jedno połączenie z kolejką zapisów, migracje z bezpieczną przebudową, kopie JSON formatu 2 (stan zastany) | `NFR-DANE-001`, `NFR-DANE-002`, `BR-DANE-002`, `BR-DANE-003`, `BR-DANE-004`, `ZP-06` |
| **ADR-010** | Zawieszenie w tle bez blokady bazy (`0xdead10cc`), bez trybów tła i zegarka (stan zastany) | `NFR-OFF-001`, `BR-CZAS-001` |

---

## 7. Budżety Wydajności

Liczba czasu trafia tu tylko z pomiarem: urządzenie, wielkość danych, percentyl i metoda (zasada 9 roli 05). Pomiaru na urządzeniu dziś nie ma, więc dokument nie podaje budżetów czasu; dawne liczby milisekund w ADR-001 i w sekcjach 1 i 2.3 były bez pomiaru i zostały usunięte 2026-11-09.

- **Zmierzone:** plany zapytań głównych ekranów (`EXPLAIN QUERY PLAN`) na danych z szacunku 3 lat (ok. 312 wpisów Dziennika, 3 zakwasy, 3300 wpisów dziennika): bez pełnego skanu dużej tabeli; pełny skan tylko na małych tabelach `recipes` i `bake_sessions` (`audit/M1-2026-11-08/role/05-architekt/dowody/plan-zapytan.txt`, audyt M1, 2026-11-08).
- **Pomiary z laptopa** w tym samym pliku (Node, jeden pomiar) nie są budżetem.
- **Budżet czasu** (np. start, otwarcie Dziennika, import kopii): decyzja właściciela; pomiar na najstarszym wspieranym iPhonie to krok właściciela (metoda: kilka powtórzeń, mediana i najgorszy wynik, dane z szacunku 3 lat).
