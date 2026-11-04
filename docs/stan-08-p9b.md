# Stan p9b-1 (rola 08, build) — 2026-11-04

Gałąź `wip/08-p9b-dane-2026-11-04` od `0a2618fd`. Polecenie: p9b-1 (dane p9 wg D-242 + D-154/D-155). **Stan (2026-11-04, koniec sesji 1):** warstwa danych p9b-1 gotowa, `npm run verify` kod 0 (Jest 5836/5836, macierz 1543/1543, `docs/p9b-dowody/verify-p9b-4-podsumowanie.txt`); ekrany D-154/D-155 nie zaczęte (próg kontekstu sesji).

## Zrobione
| Commit | Co |
|---|---|
| `6a2ba39` | struktura: odczyt i zapis wiersza `bakes` do `src/data/wpisy-wypiekow.ts` (bez zmiany zachowania; `sqlite-store.ts` 19 840 → 16 445 B) |
| `2947d3c2` | Z3 a migracja v7 `bakes.leaven` (`src/data/migracja-v7.ts`), wersja z sesji do wpisu (`wpisZSesji`), kopia/import `leaven` (`backup.ts`, `nowe-pola-kopii.ts`); Z2 a `wersja`/`tryb` w `ActiveBakeState` z parserem; Z1 b i Z4 a `src/data/wybory-uzytkownika.ts` (parsery z `unknown`, zapis/odczyt); 9 zatwierdzonych zmian 6 → 7 w testach |

Testy:
- R1–R5, R7: czerwone na bazie (`docs/p9b-dowody/czerwien-R1-R7-baza.txt`) → zielone. R6: czerwony (klucze nie na liście kopii, D-244).
- Nowe: `p9b-wersja-wypieku.sqlite.test.ts` (7), `p9b-wybory.sqlite.test.ts` (5); czerwone przed kodem na asercji (`docs/p9b-dowody/czerwien-p9b-nowe-testy.log`; jeden — „sesja bez wersji” — padał na braku kolumny `leaven`, czyli na samej zmianie schematu), po kodzie 12/12.
- G1, G2, G4, G5 zielone; G3 czerwony (D-244).
- Łańcuch migracji do v7 zielony z: stary `schema.ts` (adfe1fa = 1006/1007, 70fd81a, b21c194 = 1012), v3 (ebd8471 = 1013), v4, v5 (1014–1016, R5), v6 (1021/1022, R1, R3, R4).
- `npm run verify` (`docs/p9b-dowody/verify-p9b-1-podsumowanie.txt`): kod 1; bramki przed Jest zielone (macierz 1542/1542, lint 0 błędów, 2 ostrzeżenia sprzed partii); Jest 5813 zielonych, 20 czerwonych — wszystkie wymagają zmiany testu spoza zgody D-242 (lista w D-244).

## Po D-250 (koordynator, 2026-11-04)
- Wykonane: `migracja-d1-1014:22` (7), `sqlite-migration:90,108` (7; w D-244 błędnie „:89”), G5 z listą kluczy z 1021 (`src/data/__tests__/helpers/ustawienia-kopii-1021.ts`), klucze `wersje_receptur` i `maszyna` w `KLUCZE_USTAWIEN_KOPII` (R6 i G5 zielone), pkt 3: „Piecz ponownie” bierze wbudowaną recepturę z kodu przed wierszem bazy (`src/lib/recipe-navigation.ts`, test `src/lib/__tests__/piecz-ponownie-katalog-p9b.test.ts`, czerwień: `docs/p9b-dowody/czerwien-karelian-piecz-ponownie.log`, 2 → 2,1).
- **STOP D-246:** G3 (`p9a-baza-1021:91`), `migracja-d1-1014:79` (3 testy), `eksport-ustawien-139:41` — przyczyny i opcje w D-246; każda wymaga zmiany testu.

## Po D-251 (koordynator)
- `874fd856`: G3 `schema_migrations` przed+1, `migracja-d1-1014:79` +2, `eksport-ustawien-139:41` lista +2 klucze; verify kod 0.
- Drugi przegląd ścieżek wrażliwych (subagent, diff `2947d3c2..c2625ca6 -- src/`): **P1** — import kopii przyjmował każdy tekst dla `maszyna`/`wersje_receptur` (zły kształt nadpisałby poprawne dane w telefonie). Naprawione: `6ebb9012` (struktura: parsery do `src/data/wybory-parsery.ts`, bez cyklu importów), `2d8218c2` (`przyjety()` w `ustawienia-kopii.ts`; test czerwony przed: `docs/p9b-dowody/czerwien-import-ksztalt-kluczy.log`). recipe-navigation i zmiany testów: brak uwag. Uwagi poniżej P1, niezrobione: `jest.dontMock` w G5 na końcu testu (lepiej `afterEach`); `zapiszMaszyne` nadpisuje bez pliku ratunkowego (ekranu maszyny jeszcze nie ma, p9b-2).

## Sprawdzenie `INSERT OR IGNORE` (polecenie, pkt „Uwaga z planu §1”)
- p8 (`22d949f`, receptura `karelian_rye_pasties`, sól 2,0%) **jest** w buildzie 1022 (`9c255a0`); p10 (`8423442`, sól 2,1%) **nie jest**. U właściciela wiersz `recipes` tej receptury będzie miał 2,0%, a `INSERT OR IGNORE` (`src/data/sqlite-schema.ts`, `initDatabase`) go nie zaktualizuje.
- Ekrany biorą formułę wbudowanej receptury z kodu (`CATALOG_RECIPES`/`MASTER_RECIPES`); wiersz z bazy wygrywa tylko w „Piecz ponownie” dla wpisu **bez** `recipeId` dopasowanego po nazwie (`src/lib/recipe-navigation.ts:92,97`: wbudowane z bazy przed katalogiem). Wpisy z 1022 mają `recipeId` (D1), więc ocena: **brzegowy**.
- Poprawka zrobiona wg D-250 pkt 3 (opcja a), bez zapisu w bazie (sekcja wyżej).

## p9b-1b (sesja 2, gałąź `wip/08-p9b-ekrany-2026-11-04` od `9cf15139`)
| Commit | Co |
|---|---|
| `68129e4` | przełącznik wersji (`SegmentWersji`, `useWersjaReceptury`), dane 4 receptur (`src/recipes/wersje-drozdzowe.ts`), kroki drożdżowe (`src/core/yeast-stages.ts`), `powodBezPlanu` |
| `96f19a1` | struktura: `plakietkaDnia` z `harmonogram.tsx` (limit 20 KB) |
| `90b7b74` | plan i start z `wersja`, Dziennik `leaven`, „Piecz ponownie” w zapisanej wersji; D-252 |

Testy (czerwone przed kodem: `docs/p9b-dowody/czerwien-p9b-ekrany.log`, `czerwien-piecz-ponownie-wersja.log`): `wersje-drozdzowe-p9b` (5), `yeast-stages-p9b` (6), `plan-drozdzowy-p9b` (5), `receptura-wersja-drozdzowa-p9b` (4), `plan-wersja-drozdzowa-p9b` (3), `piecz-ponownie-wersja-p9b` (3), `plakietka-dnia` (2, charakteryzujący). Istniejące testy bez zmian (zgoda na `plan-bez-zakwasu-d3` niewykorzystana, D-252 pkt 3).
Verify (`docs/p9b-dowody/verify-p9b-1b-1*.log`): typecheck, licencje, rozmiar, lint, natywne, macierz 1554/1554 — 0; Jest 5878/5881, czerwone tylko `check-i18n-gate` (2: 15 nowych kluczy PL × 33 języki) i `zrodla-katalogu-06z` (domeny: redstaryeast.com, fcs.mgcafe.uky.edu, doi 10.1016/j.crfs.2025.101208, 10.1038/s41598-018-24149-w, 10.3390/ijms24032770).

## Zostało
1. Rola 09: przekład 15 kluczy (`src/lib/i18n-en/czesc-28.ts`) na 33 języki. Rola 06: domeny 06z na ekran „Źródła wiedzy”, luki z D-252 (orkisz 3 h, czasy kroków z rękami, żyto: studzenie i gotowość, czasy receptur drożdżowych).
2. Rola 04: makieta przełącznika wersji i teksty z D-252; zrzuty (brak Expo web w projekcie): `receptura-graham-zakwas`, `receptura-graham-drozdze`, `receptura-orkisz-drozdze-bez-planu`, `plan-zyto-drozdze`, `stolnica-drozdze-drugie-rosniecie` — jasny i ciemny, 320 pt i AX5.
3. p9b-2: tryb maszyny (Z4 ekrany, Z5, Z6, RD-37…39).

## Nie sprawdzono
Ekrany p9b-1b na urządzeniu (zrzuty, VoiceOver, AX5); migracja na iOS (expo-sqlite natywne, `VACUUM INTO` ze ścieżką `file://`), prawdziwa baza z telefonu, E2E iOS, powrót do 1022 z bazą v7 (zamierzone: ekran „nowsza wersja”, test `baza-nowsza`).
