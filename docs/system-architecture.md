# Architektura Techniczna Systemu (System Architecture v2.0)
## Aplikacja Piekarz (Crust) — Apps4Craft Studio
**Wersja:** 2.0-craft  
**Data wydania:** 18.10.2026  
**Rola:** Principal System Architect, Lead Software Engineer & Data Modeling Strategist  
**Status:** WIĄŻĄCY I ZATWIERDZONY  
**Dokumenty nadrzędne:** `docs/brd/00_START.md`, `docs/scope-contract.md`, `docs/monetyzacja-audyt.md`, `docs/adr/ADR-001..005`  

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
• 1-Tap Quick Start           • reverse-scheduler (Q10=2.15) • Indeksy B-Tree < 5ms
• Akordeon Rzemieślniczy Pro  • Maszyna Stanów Wypieku FSM   • Kolejka Outbox pending_ops
• AppAccessContext (Pub/Sub)  • Doktor Chleba (Triage)       • Rotacyjna autokopia JSON (T-012)
```

1. **Izolacja Domeny od Frameworka (Clean Architecture):**  
   Cała logika fizyki piekarskiej (`src/core/domain-rules.ts`, `src/core/domain/types.ts`) jest w 100% czystym TypeScriptem bez importów z bibliotek Reacta, React Native czy Expo.
2. **100% Offline-First i Zero Telemetrii:**  
   Brak zależności od sieci, brak zewnętrznych serwerów i SDK śledzących (*Data Not Collected*).
3. **Determinizm Danych i Transakcyjność ACID:**  
   Wszystkie mutacje wielotabelowe są wykonywane w transakcjach SQLite (`BEGIN TRANSACTION ... COMMIT`).
4. **Ergonomia Kuchenna („Flour Hands”):**  
   Wielkie cele dotykowe (64pt), blokada wygaszania (Keep-Awake), Live Activity i niezależna aplikacja na Apple Watch (gest Double Tap).

---

## 2. Model Danych Relacyjnych (SQLite DDL)

Plikiem źródłowym schematu jest [`db/schema.sql`](file:///c:/Users/lukas/Documents/antigravity/noble-pasteur/db/schema.sql).

### 2.1 Konfiguracja Pragmatyki SQLite
```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA temp_store = MEMORY;
PRAGMA cache_size = -64000; -- 64MB cache w RAM
```
*Uwaga SRE:* Wartość `busy_timeout = 5000` wraz z trybem WAL eliminuje błąd systemu iOS `0xDEAD10CC`, zapobiegając ubiciu aplikacji podczas przechodzenia do stanu uśpienia.

### 2.2 Zestawienie Tabel Relacyjnych

| Nazwa Tabeli | Klucz Główny | Zastosowanie / Opis | Kluczowe Ograniczenia CHECK |
|---|---|---|---|
| `schema_migrations` | `version INT` | Wersjonowanie migracji schematu DDL | `version > 0`, unikalność |
| `bakes` | `id TEXT` | Dziennik wypieków i oceny sensoryczne | `rating_stars IN (1..5)`, `crumb_score IN (1..5)` |
| `starters` | `id TEXT` | Kultury zakwasu i estymacja szczytu | `hydration BETWEEN 30 AND 300`, `storage_state ENUM` |
| `recipes` | `id TEXT` | Receptury Master i autorskie | `target_ddt BETWEEN 15 AND 35`, `is_built_in IN (0,1)` |
| `flour_inventory` | `id TEXT` | Stan magazynowy mąk w spiżarni | `stock_grams >= 0.0`, `protein_pct BETWEEN 5 AND 25` |
| `lesson_progress` | `level_id INT`| Postęp w szkole chleba (Lekcje 1..6)| `level_id > 0` |
| `app_access` | `id TEXT` | Stan licencji "Cheaper than Espresso"| `subscription_tier ENUM`, `completed_bakes_count >= 0` |
| `app_settings` | `key TEXT` | Ustawienia aplikacji i FSM sesji | Klucz-Wartość |
| `pending_ops` | `id TEXT` | Kolejka Outbox zdarzeń Apple Watch | `status IN ('PENDING', 'PROCESSING', 'SYNCED')` |

### 2.3 Indeksy B-Tree pod Zapytania o Złożoności $O(\log N)$ i Czasie < 5ms
```sql
CREATE INDEX IF NOT EXISTS idx_bakes_started_at ON bakes(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_starters_last_fed_at ON starters(last_fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_built_in ON recipes(is_built_in, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flour_inventory_name ON flour_inventory(name);
CREATE INDEX IF NOT EXISTS idx_pending_ops_status ON pending_ops(status, created_at ASC);
```

---

## 3. Architektura Stanu, Reaktywność i Likwidacja Wady M8

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
Paywall znika w < 1ms           Odblokowany nowy wypiek        Odblokowane dokarmienia
```

- **Luka M8 rozwiązana:** Wprowadzenie centralnego serwisu uprawnień z subskrypcją stanu (`IAppAccessService.addListener`) oraz React Contextu w `_layout.tsx` eliminuje wymóg restartu aplikacji po zakupie planu rocznego lub Lifetime.
- **Odporność usuwania danych (DEC-48):** Operacje `deleteRecipe` i `deleteStarter` są wyjęte spod strażnika `requireActionAccess`, gwarantując prawo do usunięcia danych w trybie Read-Only.

---

## 4. Architektura Integracji z Apple Watch i Praca w Tle

Zgodnie z decyzjami `DEC-03`, `DEC-45` oraz `ADR-005`:
1. **Niezależna Aplikacja watchOS 11 (Standalone):**  
   Target w Xcode komunikujący się z telefonem przez `WatchConnectivity`. W przypadku braku telefonu w zasięgu zegarek zapisuje zdarzenia w lokalnej kolejce Outbox.
2. **Gest Double Tap i Cyfrowa Koronka:**  
   Odliczanie interwałów składań ciasta i kontrola pieczenia w garnku żeliwnym (Dutch Oven) bez dotykania ekranu.
3. **Całkowity Brak Background Audio:**  
   Wyeliminowanie wpisu `"audio"` z `UIBackgroundModes` w `app.json`. Alerty w tle oparte wyłącznie na powiadomieniach systemowych `Time-Sensitive` przebijających tryb skupienia (Focus).

---

## 5. Strategia Bezpiecznej Migracji (Aksjomat Zerowej Utraty Danych)

Migracja ze schematu v1.0 do v2.0 realizowana jest przez atomowy skrypt [`db/migrations/002_retrofit_to_standard_v2.sql`](file:///c:/Users/lukas/Documents/antigravity/noble-pasteur/db/migrations/002_retrofit_to_standard_v2.sql):
- Tabela `schema_migrations` rejestruje wykonane wersje schematu.
- Wszelkie rozszerzenia istniejących tabel (np. `feeding_ratio` w `starters`) wykonywane są z domyślnymi wartościami wstecznymi (`DEFAULT '1:1:1'`).
- Przed wykonaniem migracji mechanizm rotacyjny generuje snapshot JSON całej bazy danych w `backup_pre_migration.json`.

---

## 6. Macierz Zgodności: Decyzje ADR a Wymagania Biznesowe BRD

| Rejestr ADR | Kluczowa Decyzja Architektoniczna | Pokrywane Wymagania BRD |
|---|---|---|
| **ADR-001** | `expo-sqlite` w `/Library/SQLite` | `NFR-OFF-001`, `NFR-DANE-001`, `ZP-03` |
| **ADR-002** | `AppAccessContext` + Pub/Sub (M8) | `BR-ZAK-001..010`, `DEC-11`, `DEC-48` |
| **ADR-003** | Relacyjny Outbox `pending_ops` & T-012 | `DEC-45`, `NFR-DANE-002`, `ZP-06` |
| **ADR-004** | Maszyna Stanów Wypieku FSM | `BR-ETAP-001..025`, `RD-01..15`, `ZP-10` |
| **ADR-005** | watchOS Standalone & Brak Background Audio | `DEC-03`, `DEC-06`, `NFR-ZEG-001..010` |
