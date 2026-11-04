# Stan p9b-1 (rola 08, build) — 2026-11-04

Gałąź `wip/08-p9b-dane-2026-11-04` od `0a2618fd`. Polecenie: p9b-1 (dane p9 wg D-242 + D-154/D-155). **Stan: STOP (D-244)** po warstwie danych; ekrany D-154/D-155 nie zaczęte.

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

## Sprawdzenie `INSERT OR IGNORE` (polecenie, pkt „Uwaga z planu §1”)
- p8 (`22d949f`, receptura `karelian_rye_pasties`, sól 2,0%) **jest** w buildzie 1022 (`9c255a0`); p10 (`8423442`, sól 2,1%) **nie jest**. U właściciela wiersz `recipes` tej receptury będzie miał 2,0%, a `INSERT OR IGNORE` (`src/data/sqlite-schema.ts`, `initDatabase`) go nie zaktualizuje.
- Ekrany biorą formułę wbudowanej receptury z kodu (`CATALOG_RECIPES`/`MASTER_RECIPES`); wiersz z bazy wygrywa tylko w „Piecz ponownie” dla wpisu **bez** `recipeId` dopasowanego po nazwie (`src/lib/recipe-navigation.ts:92,97`: wbudowane z bazy przed katalogiem). Wpisy z 1022 mają `recipeId` (D1), więc ocena: **brzegowy**.
- Poprawka nie zrobiona (STOP). Opcje: (a) w `prepareBakeAgainRecipe` katalog z kodu przed wbudowanymi z bazy — bez zmian danych; (b) przy starcie aktualizacja formuły wierszy `is_built_in = 1` z kodu — zmienia wiersze bazy (nie dane użytkownika, użytkownik nie edytuje wbudowanych). Rekomendacja: (a). Testu nie napisano.

## Zostało (p9b-1)
1. Decyzja D-244 → zmiany testów → klucze `maszyna`, `wersje_receptur` na `KLUCZE_USTAWIEN_KOPII` (R6, G5).
2. D-154/D-155: przełącznik wersji na recepturze (zapamiętanie przez `wczytajWersjeReceptury`/`zapiszWersjeReceptury`), zdjęcie blokady `src/lib/plan-receptury.ts:55-61` (zgoda na `plan-bez-zakwasu-d3.test.tsx:43`), plan wstecz i prowadzenie wersji drożdżowej, `wersja` w starcie wypieku, „Piecz ponownie” z zapisaną wersją, nowe klucze i18n (PL + EN), zrzuty.
3. Przegląd ścieżek wrażliwych: wynik w raporcie końcowym tej sesji.

## Nie sprawdzono
Migracja na iOS (expo-sqlite natywne, `VACUUM INTO` ze ścieżką `file://`), prawdziwa baza z telefonu, E2E iOS, powrót do 1022 z bazą v7 (zamierzone: ekran „nowsza wersja”, test `baza-nowsza`).
