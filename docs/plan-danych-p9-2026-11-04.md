# Plan zmian danych p9 (D-221) — rola 08, partia p9a, STOP przed wdrożeniem

Gałąź `wip/08-p9a-dane-2026-11-04` od `d24ea87` (w historii `origin/redesign/piekarz-2026-10-22`: `git merge-base --is-ancestor` kod 0). Data: 2026-11-04. Moduły: M2 `dane-uzytkownika` (Przed partią → STOP), `sqlite-expo`, 05 `dane-lokalne-sqlite`, 12 `ratowanie-danych`. W p9a **bez zmian w `src/` i `app/` poza testami** (`src/data/__tests__/`, `tests/fixtures/`).

Zakres funkcji (decyzje właściciela, nie otwierane): D-154 (przełącznik „na zakwasie / na drożdżach”), zawężony przez D-173 do **4 receptur** (`spelt_ancient_seeded`, `graham_bread_honey`, `rye_100_pan`, `tartine_high_hydration_80`) — polecenie p9a mówi „9 recepturach”, rejestr (D-173, BR-RECP-005) mówi 4; plan idzie za rejestrem. D-155/D-174 (plan wstecz i prowadzenie wersji drożdżowej, czasy z receptury). D-138/D-153/D-156/D-175/D-179/D-189 + BR-MASZ-001…006 (tryb maszyny, uniwersalny). D-221 (migracja w transakcji, test na kopii, STOP).

## E0 — środowisko i stan wyjściowy

| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Linux 6.18 x86_64, Node v22.23.4, repo bez zmian na starcie; historia pobrana pełna (`--unshallow`, tagi) |
| GitHub | MCP GitHub; push na gałąź `wip/` |
| Stan CI na `master` (39f3890 = build 1021) | CI, iOS E2E, TZ Matrix: success (2026-11-03). **Nightly Deep Verification: cancelled 03.11 i 02.11, failure 01.11** — znalezisko (zasada 21), poza zakresem p9a, do koordynatora |
| Symulator iOS, urządzenie | brak (Linux) — kroki właściciela w §6 |
| Bazowe `npm run verify` na `d24ea87` | **kod 0**; Jest: 537 zestawów, **5731 testów**, wszystkie zielone (log w scratchpadzie sesji) |

Założenia z artefaktów innych ról, na których stoi plan (hipotezy, sprawdzone w źródle): u właściciela schemat v6 (sprawdzone tagami, §2); dane wersji drożdżowej to dane z kodu (`presets.ts`, p8), nie dane użytkownika (`docs/tresci/pl/wersje-drozdzowe.md`: pola `<preset>.yeastVersion.*`); maszyna — jedna maszyna użytkownika, bez profili (D-153).

## 1. Co się zmienia: wybory użytkownika do zapisania

Dziś (kod wydany = HEAD): ustawienia w `app_settings` (klucz–wartość, `setAppSetting`, `INSERT OR REPLACE` — tabela bez dzieci, więc bez kaskady); trwające i zaplanowane wypieki w `bake_sessions.session_json` (JSON, parser `isActiveBakeState` / `parsePlannedBake` przyjmuje pola nieznane i je zachowuje — test zielony niżej); Dziennik w `bakes` (kolumny, bez pola JSON na metadane). Kopia: ustawienia tylko z listy `KLUCZE_USTAWIEN_KOPII` (`src/data/ustawienia-kopii.ts:15`).

**Z1. Wybrana wersja receptury („na drożdżach”) przy następnym otwarciu** (OP-62 cz. 1; BR-RECP-005 tego nie wymaga)
- (a) nie pamiętać: stan ekranu, każde otwarcie „na zakwasie”. Zero danych. Kompromis: kto piecze graham zawsze na drożdżach, przełącza za każdym razem.
- (b) **rekomendacja:** klucz `wersje_receptur` w `app_settings`, JSON `{"<recipeId>":"drozdze"}` (tylko odstępstwa od domyślnej), na liście kopii. Bez schematu; ten sam wzorzec co `rodzaj_drozdzy` (D-101). Kompromis: parsowanie JSON z `unknown`, wpis po usuniętej recepturze zostaje (nieszkodliwy).
- (c) kolumna `recipes.leaven_choice` (migracja). Odrzucam: wbudowane receptury są wierszami `INSERT OR IGNORE`, kopia nie niesie wbudowanych, więc wybór i tak wymagałby osobnej ścieżki kopii.
- Do decyzji właściciela (z rolą 03/04, OP-62).

**Z2. Wersja i tryb w trwającym i zaplanowanym wypieku** (potrzebne do prowadzenia; D-155)
- (a) **rekomendacja:** pola opcjonalne `wersja?: 'zakwas' | 'drozdze'` i `tryb?: 'piekarnik' | 'maszyna'` w `ActiveBakeState` (JSON w `session_json`, także `PlannedBake.bake`). Bez schematu. Brak pola = wypiek sprzed p9 (wszystkie trwające przed p9 są na zakwasie, bo „Zacznij wypiek” bez zakwasu był zablokowany, `plan-receptury.ts:55-61`). Wydany parser 1021 czyta i zachowuje te pola — **test zielony** `p9a-baza-1021 › sesja i plan z polami wersji i trybu`.
- (b) wyprowadzać wersję z `recipeFormula.starterPercentage === 0`. Bez nowych pól, ale reguła pośrednia i brak przy sesji bez `recipeFormula`.
- Warunek dla p9b niezależny od wyboru: **kroki planu drożdżowego tylko z istniejących kategorii** (`bake-steps.ts:32-35`). Nowa kategoria (np. „odgazowanie”) sprawia, że 1021 nie odczyta sesji po powrocie właściciela do starszego buildu — **test zielony** `p9a-baza-1021 › krok z kategorią spoza listy` (wiersz zostaje w bazie, sesja znika z ekranu). Uwaga logiki (nie danych): krok `bake` poza żytnimi dostaje dziś dwie fazy garnka (`isDutchOvenStep`), co nie pasuje do chleba w formie (graham, żyto 100%) — dla roli 04/08 w p9b.

**Z3. Wersja (i tryb) wypieku w Dzienniku** (OP-62 cz. 2: bez tego poprawa następnego wypieku, J-05, miesza obie wersje; „Piecz ponownie” nie wie, którą wersję otworzyć)
- (a) **rekomendacja:** migracja v7: `ALTER TABLE bakes ADD COLUMN leaven TEXT CHECK (leaven IS NULL OR leaven IN ('sourdough','yeast'))`; NULL dla starych wpisów (brak zostaje brakiem). Samo ADD COLUMN, bez przebudowy (05 „Migracje schematu”: zwykła migracja w transakcji). Jeśli właściciel chce też wypieki z maszyny w Dzienniku: w tej samej migracji `bake_method TEXT CHECK (… IN ('oven','machine'))` — jedna migracja taniej niż dwie `[DO USTALENIA: czy wypiek z maszyny trafia do Dziennika — rola 03/04; BRD MASZ tego nie mówi]`.
  Kompromis: (1) pierwsza migracja od v6 — kopia `VACUUM INTO` przed nią i test łańcucha z każdej wydanej wersji; (2) powrót właściciela do 1021 po starcie p9b daje bazę „nowszą” → tylko odczyt (`sqlite-schema.ts:386`, zamierzone); (3) **p9b musi zmienić istniejące testy z wersją 6 na sztywno**: `sqlite-migration.test.ts:64,70,82,88,135`, `testflight-migration.sqlite.test.ts:67`, `starter-entries-v5-migration.sqlite.test.ts:91,117`, `starter-feeding-ratio.sqlite.test.ts:47,79` — zmiana oczekiwanej bieżącej wersji (jak przy v6 w D1: komentarz „bieżąca wersja: v6 (D-102)”), wymaga zgody jako wyjątek nazwany.
- (b) bez zapisu wersji w Dzienniku: wersja żyje tylko w trwającym wypieku. Zero migracji, zero zmian testów. Kompromis: OP-62 zostaje otwarte, wpisy obu wersji tej samej receptury nierozróżnialne.
- (c) wersja zakodowana w `recipe_id` (np. `graham_bread_honey#drozdze`) albo w kolumnie tekstowej o innym znaczeniu (`taste_profile`). Odrzucam: psuje wyszukiwanie po `recipe_id` (kalendarz, statystyki) i miesza znaczenia kolumn.

**Z4. Dane maszyny** (BR-MASZ-002 „Dane maszyny zapamiętane”, BR-MASZ-003 układ, D-189 czas programu)
- Pola (z BRD, nie wymyślone): największa masa mąki (wymagana, g), masa ciasta i drożdży suchych (nieobowiązkowe, g), układ `plyny_najpierw` / `drozdze_najpierw` (brak = pytanie), czas programu wpisany z instrukcji `[DO USTALENIA: jeden czas „wybranego programu” (D-189) czy osobno dla każdego z pięciu rodzajów (D-179) — rola 04]`.
- (a) **rekomendacja:** jeden klucz `maszyna` w `app_settings`, JSON `{"v":1,"makaMaxG":620,"ciastoMaxG":1000|null,"drozdzeSucheMaxG":10|null,"uklad":…|null,"czasProgramuMin":…}`, parsowany z `unknown` (zły kształt → typowany błąd, brak → prośba o dane, nie liczba domyślna), na liście kopii. Bez schematu.
- (b) kilka kluczy (`maszyna_maka_max_g`, …): prostsze parsowanie pojedynczych wartości, ale zapis kilku kluczy nie jest atomowy bez transakcji (`setAppSetting` to pojedyncze instrukcje) i dłuższa lista kopii.
- (c) tabela `machines` (kilka maszyn): migracja i nowa ścieżka kopii dla potrzeby bez dowodu (D-153: tryb uniwersalny, nie profile). Odrzucam w 1.0.

**Z5. Wybór „piekarnik / maszyna” przy recepturze** — jak Z1: (a) nie pamiętać (domyślnie „piekarnik”), (b) w tym samym kluczu co Z1 (`{"<recipeId>":{"wersja":"drozdze","tryb":"maszyna"}}`). Rekomendacja: (a) dla trybu, bo maszyna zależy od dnia, nie od receptury `[OCENA]`; do decyzji z Z1.

**Z6. „Zapisz plan” w trybie maszyny** (`docs/design/karty/README.md:35`, przycisk w makiecie; znaczenie nieopisane `[DO USTALENIA — rola 04/03]`)
- (a) zaplanowany wypiek w `bake_sessions` (`PlannedBake` z `bake.tryb = 'maszyna'`), widoczny w kalendarzu „Dziś”, liczony do limitu 5 zaplanowanych; kroki z istniejących kategorii (warunek Z2), parser wymaga ≥ 1 kroku (`bake-sessions-store.ts:70`).
- (b) samo przypomnienie lokalne o godzinie startu programu, bez zapisu w bazie.
- (c) bez „Zapisz plan” w 1.0 (godzina startu tylko na ekranie).
- Rekomendacja: (a), bez schematu; koszt w p9b większy niż (b) o test limitu i kalendarza.

**Katalog +15 (D-157, p8):** nowe receptury bazowe wchodzą przez `INSERT OR IGNORE` przy starcie (`sqlite-schema.ts`, `initDatabase`), bez migracji. Do sprawdzenia przez p8: `INSERT OR IGNORE` nie aktualizuje formuły istniejącego wiersza wbudowanego, a `getRecipes` czyta formułę z bazy — zmiana formuły istniejącej receptury bazowej nie dojdzie do telefonu `[DO USTALENIA: czy p8 zmienia formuły istniejących 15]`.

## 2. Wydane wersje schematu i plan testu na kopii każdej

Z tagów (`git tag`, `git show <tag>:src/data/sqlite-schema.ts`) i `docs/wydanie/dziennik.md` (dziennik kończy się na 1013; nowsze buildy tylko w tagach — luka dla roli 10):

| Build (tag) | Commit | Schemat | Kopia do testu |
|---|---|---|---|
| 1006, 1007 | adfe1fa, 276ba2f | stary `src/data/schema.ts` (bez runnera `user_version`) | `fixtures/schema-adfe1fa.sql` (istniejący `testflight-migration.sqlite.test.ts`) |
| 1012 | 0016299 | stary `schema.ts` | `fixtures/schema-70fd81a.sql`, `schema-b21c194.sql` (istniejące) |
| 1013 | ebd8471 | v3 | `fixtures/schema-ebd8471.sql` (istniejący) |
| 1014–1016 | f42c0d8, 2b0db0f, 37edbfb | v5 | `tests/fixtures/baza-1014-f42c0d8.sql` (istniejąca) |
| 1017–1021 | 49ab67a … 39f3890 | **v6 — u właściciela** (najwyższy build z `master` = 1021; `git diff v1.0.0-b1017 HEAD -- src/data src/lib/backup.ts` pusty) | **nowa** `tests/fixtures/baza-1021-39f3890.sql` (p9a) |
| 1022 (jeszcze bez tagu, D-220) | z `redesign` po p7b | v6 (kod danych bez zmian) | ta sama co 1021 |

Kopia 1021 to zrzut bazy zapisanej **kodem wydanym** (migracja v6 z kopii 1014, potem `savePlannedBake`, `saveBakeLog` z `recipeId`, `saveStarter` ze stałym dniem, `rodzaj_drozdzy`), zrobiony na `d24ea87` przed jakąkolwiek zmianą kodu danych; generator `zrzutBazy` w `src/data/__tests__/helpers/baza-1021.ts`. Liczności: `app_settings 7, bake_sessions 2 (active + planned), bakes 4, flour_inventory 2, lesson_progress 2, recipes 17, schema_migrations 6, starter_entries 5, starters 2`.

Plan testu p9b: przy Z3 (a) — łańcuch do v7 z każdej kopii z tabeli (istniejące testy z wersją 6 podniesione do 7, §1 Z3), plus nowe testy z §5; przy Z3 (b) — brak migracji, wystarczają zielone testy zgodności (§5 G1–G5) i istniejące.

## 3. Odwrót

- **Migracja padnie u użytkownika** (tylko Z3 a): runner (`applySchemaMigrations`) robi `VACUUM INTO backup_pre_migration-v6-<czas>.db` przed migracją (bez kopii nie migruje, `kopie-przed-migracja.ts`, 2 kopie na wersję), potem `BEGIN … ALTER … INSERT schema_migrations … PRAGMA user_version = 7 … COMMIT`; błąd → `ROLLBACK`, `MigrationError`, ekran błędu z kopią do udostępnienia (`markStorageUnavailable(msg, backupPath)`). Stan po wycofaniu: v6, bez kolumny, liczności jak przed — test czerwony `błąd w środku migracji v7`. Ponowny start powtarza próbę.
- Runner nie ustawia `foreign_keys = OFF` przed BEGIN ani nie robi `foreign_key_check` przed COMMIT (moduł 05 „Runner”). Dla samego ADD COLUMN bez znaczenia (bez DROP TABLE, bez kaskady); test sprawdza `foreign_key_check` po migracji. Poprawka runnera to zadanie roli 05, nie p9b.
- **Baza z nowszej wersji** (właściciel wraca z TestFlight do 1021/1022 po buildzie z v7): `NewerDatabaseError` przed jakąkolwiek zmianą (`sqlite-schema.ts:386`, `query_only = ON`, ekran „nowsza wersja”), dane nietknięte — istniejący `baza-nowsza.sqlite.test.ts`. Przy opcjach bez schematu (Z1 b, Z2 a, Z4 a, Z3 b) powrót do 1021 działa w pełni: dodatkowe pola JSON są czytane i zachowane (G1), nieznane klucze ustawień leżą nieużywane.
- **Kopia ratunkowa** (moduł 12): bez zmian; tryb awaryjny otwiera bazę bez migracji.

## 4. Kopie, eksport, import

| Dane | Kopia/eksport | Import starej kopii (bez pola) | Stara aplikacja (1021) importuje nową kopię |
|---|---|---|---|
| Z1 `wersje_receptur`, Z4 `maszyna` | dopisać klucze do `KLUCZE_USTAWIEN_KOPII` (inaczej BR-DANE-003 „Pełny eksport” traci dane maszyny) | klucz nieobecny → wartość w telefonie zostaje (istniejąca reguła `zapiszUstawieniaILekcje`) | nieznany klucz odrzucony przez listę dozwolonych, bez błędu — **G5 zielony** |
| Z2 pola sesji | sesja nie wchodzi do kopii (decyzja M1-139: stan urządzenia) | nie dotyczy | nie dotyczy |
| Z3 `bakes.leaven` | jawnie także `null`, jak `recipeId` (`buildBackup`), format 2 z polem opcjonalnym, `SCHEMA_VERSION` bez zmian | pole nieobecne → wartość z telefonu (wzorzec `nowe-pola-kopii.ts`: `czytajNowePola` przed DELETE) | 1021 pomija nieznane pole wpisu, wpis wchodzi — **G5 zielony**; ale 1021 nie otworzy bazy v7 do zapisu, więc ten przypadek to import na innym telefonie z 1021 |

## 5. Testy przed kodem (napisane w p9a)

**Zielone dziś i mają zostać zielone** (`src/data/__tests__/p9a-baza-1021.sqlite.test.ts`, 5/5 PASS):
- G1 `zrzut ma schemat wydanych migracji 1–6 z kodu` — fixture = migracje 1–6 (strażnik „wydanej migracji się nie edytuje”).
- G2 `baza 1021: spójna, wersja 6, WAL, liczności…` — `integrity_check` ok, `foreign_key_check` pusty, liczności jak w §2.
- G3 `sesja i plan z polami wersji i trybu (opcja Z2 a) czyta wydany parser, a zapis postępu ich nie gubi` — liczności przed = po.
- G4 `krok z kategorią spoza listy wydanego buildu: 1021 nie odczyta sesji` — warunek Z2 dla p9b.
- G5 `nieznane klucze ustawień i pola wpisu są pomijane bez błędu` — import kopii p9b w kodzie 1021; `integrity_check`, `foreign_key_check`.

**Czerwone dziś, dla opcji rekomendowanych** (`src/data/__tests__/p9a-migracja-v7-czerwone.sqlite.test.ts`, 7/7 FAIL na asercji; przy innej decyzji zastępowane przed kodem, z zapisanym powodem):

| Test | Co sprawdza | Czerwień dziś |
|---|---|---|
| R1 `v6 → v7: liczności bez strat…` | kopia 1021 → v7: każda tabela n przed = n po (`schema_migrations` +1), stare wpisy `leaven` NULL, sesje identyczne, `integrity_check`, `foreign_key_check` | `wersja: 7, kolumna: true` ← `6, false` |
| R2 `kolumna przyjmuje tylko zamkniętą listę wartości (CHECK)` | `yeast`, `sourdough` przyjęte, inna wartość odrzucona | jw. |
| R3 `przed migracją kopia VACUUM INTO backup_pre_migration-v6-*; drugi start niczego nie zmienia` | 1 kopia v6, idempotencja (liczności, sesje, wersja) | jw. |
| R4 `błąd w środku migracji v7: wycofanie całości…` | awaria `INSERT INTO schema_migrations` → `unavailable`, kopia v6 w pliku ratunkowym, v6 bez kolumny, liczności jak przed | `Expected "unavailable"` ← `"ok"` |
| R5 `v5 (build 1014–1016) → v7 jednym startem` | łańcuch v5→v6→v7 bez strat | `wersja 7` ← `6` |
| R6 `BR-MASZ-002 Dane maszyny zapamiętane, BR-DANE-003: klucze maszyna i wersje_receptur na liście kopii…` | lista kopii, eksport → import, kopia 1014 nie zmienia wartości | lista bez `maszyna`, `wersje_receptur` |
| R7 `wersja wypieku w kopii: eksport jawnie (także null)…` | `leaven` w eksporcie, import starej kopii zostawia wartość z telefonu | `wersja 7` ← `6` |

Do napisania w p9b (cięcie pionowe, przy kodzie): logika — `powodBezZakwasu` dla receptury drożdżowej = brak blokady (D-155; **zmienia istniejący `src/__tests__/plan-bez-zakwasu-d3.test.tsx:43`** — zgoda na zmianę testu jako wykonanie D-155), RD-37-W1…W7, RD-38-W1…W10, RD-39-W1…W8, parser `maszyna` z `unknown` (zły kształt, brak, granice), wybór wersji (Z1) po restarcie, łańcuch v3/stare `schema.ts` → v7 w `testflight-migration.sqlite.test.ts` (podniesiona wersja).

## 6. Czego nie sprawdzono tutaj; kroki właściciela; koszt p9b

Nie sprawdzono: prawdziwa baza z telefonu właściciela (wersja schematu u niego wynika z tagów, nie z odczytu); migracja na iOS (expo-sqlite natywne, `VACUUM INTO` ze ścieżką z prefiksem `file://` — `[DO USTALENIA]`, moduł 12); powrót do starszego buildu w TestFlight z bazą v7; E2E iOS.

Kroki właściciela (po p9b, na buildzie kandydata, D-226): (1) przed instalacją zanotuj numer buildu na telefonie (TestFlight → Piekarz); (2) zrób eksport kopii (Ustawienia → Kopia zapasowa) i zachowaj plik; (3) zainstaluj kandydata, otwórz, sprawdź, że Dziennik, zakwasy i trwający/zaplanowany wypiek są na miejscu; (4) przy Z3 (a): tylko jeśli chcesz sprawdzić odwrót — zainstaluj 1021 i potwierdź ekran „baza z nowszej wersji” bez utraty danych, potem wróć do kandydata.

Koszt p9b (czas agenta `[OCENA]`): przy rekomendacjach (Z1 b, Z2 a, Z3 a, Z4 a, Z5 a, Z6 a): dane i migracja ok. 2–3 h, logika planu drożdżowego i trybu maszyny (RD-37…39, ekrany z roli 04) ok. 6–9 h, testy istniejące z wersją 6 i i18n nowych tekstów ok. 1 h; razem ok. 9–13 h agenta w 2–3 sesjach. Przy Z3 (b): mniej o ok. 1,5 h. Czekanie: verify ok. 2,5 min na przebieg, E2E iOS ok. 70 min, build TestFlight ok. 40 min. Właściciel: decyzje Z1–Z6 (ok. 10 min), test telefonu jak w D-226.

## Punkt czyszczenia

Rola 08, tryb build, partia p9a (STOP przed wdrożeniem). Plik stanu: ten plik. Następny krok: decyzje właściciela Z1–Z6 → p9b (rola 08 build, moduły jak w p9a), testy czerwone R1–R7 zostają albo są zastępowane przed kodem.
