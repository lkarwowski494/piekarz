# M2 — plan wykonania — Piekarz — 2026-11-09
Plan: sprawdz-plan kod 0 (86 zadań, 20 decyzji, 0 bez wyboru) · Pętla 1 · Audyt 2ef8870a · Baza dd824eee (`redesign/piekarz-2026-10-22`, 26 commitów od audytu) · Stan wyjściowy: typecheck kod 0; lint kod 0 (0 błędów, 2 ostrzeżenia `usePendingRecipeLoader.ts:34`); jest kod 0 (575/575 zestawów, 6024/6024 testów, 152 s) — `dowody/M2/stan-*.txt`

## Kolejka
Pełna tabela: `dowody/M2/zakres.txt` (zakres-napraw.mjs kod 0: 84 zadania, 3 partie, 0 zablokowanych).

| Partia | Zadania | D (M2) | P/M (rola) | Role w sesjach fix | Gałąź | STOP przed |
|---|---|---|---|---|---|---|
| 1 | 18 | 15 | 003 (P, DEC-17 a), 023 (P, DEC-11 a), 024 (M) | 12, 05 | `naprawy/M2-koordynator-napraw-2026-11-09-p1` | tak: P/M i dane użytkownika (001, 002, 019, 021, 022, 028, 033) |
| 2 | 31 | 19 | 004, 007–010, 040–043, 045 (M/P), 049 (P, DEC-12 b), 053 (P, DEC-13 a) | 01, 04, 06, 09 | `…-p2` (od końca p1) | tak: P/M |
| 3 | 35 | 19 | 015, 018, 054, 055, 057, 058, 061–065, 068, 078, 080, 082, 084 | 03, 11, 02, 07, 10 | `…-p3` (od końca p2) | tak: P/M |

Kolejność wewnątrz partii: zakres-napraw (partia → zależności → poziom → ID); zadanie roli, od którego zależy D, pierwsze (014 po 010; 017 po 007).

## Plan per ID
Tabela 84 wierszy (test akceptacyjny z raportu roli, pliki z pola „Mechanizm”, flaga danych): `dowody/M2/plan-per-id.md`.
Reguły obszaru czytane przed każdym D: `role/08-programista/rdzen.md` („Zasady programisty”, „Tryb: fix”) + `## Tryb: fix` roli z pola `rola`; dla danych dodatkowo `role/05-architekt/moduly/dane-lokalne-sqlite.md`, `role/08-programista/moduly/sqlite-expo.md`, `role/12-niezawodnosc/moduly/ratowanie-danych.md`.

### Zadania do ponownego odtworzenia (pliki zmienione po audycie)
| ID | Co zmieniono po audycie | Postępowanie |
|---|---|---|
| 042, 043 (M, 06) | D-284 `f73ae9ba`: terminy maszyny pt/ja/lt, `DODATKI_MASZYNY` | sesja 06 sprawdza źródła; jeśli wynik D-284 stoi — bez zmian, `blokada` „nie odtworzone: naprawione przed M2 przez D-284” do potwierdzenia w reaudycie |
| 046 (D, 09) | D-283: rodzajnik przy godzinie es/es-419/pt/pt-BR/it/el, test `godzina-przyimek.test.ts` | test akceptacyjny na bazie; zielony → `blokada` „nie odtworzone (D-283)” |
| 066 (D, 07) | D-282/D-285: E2E-95/96, zielone runy 42511814430, 42520804896 | sprawdzam run na bazie; zielony E2E na SHA kandydata to warunek — patrz „Czego nie zrobię” |
| 079 (D, 10) | `docs/wydanie/dziennik.md` | test czerwony rozstrzyga |

### Zadania P o wyborze „odłożyć”
- 049 (DEC-12 b: metryczne w 1.0, przeliczenie w 1.0.1) i 065 (DEC-19 b: do zakresu 1.1): sesja roli zapisuje odłożenie w dokumentach (09: plan 1.0.1; 03: lista odcięć z warunkiem powrotu). D-280 pkt 5 zakazuje prac nad 1.1 przed 1.0 — wpis odłożenia nie jest pracą nad 1.1, kod się nie zmienia.

## Sesje ról
- (a) **subagenci po kolei w tej sesji**, prompt roli złożony `assemble.mjs` (polecenia w `naprawy/polecenia/<rola>-p<N>.md`), wynik i dowody sprawdzam ja (sprawdz-raport.mjs, pełne testy) — rekomendacja: narzędzie jest, nie wymaga Twojego czasu, K dostępne.
- (b) nowe sesje otwierane przez Ciebie (12 sesji ról w 3 partiach) — świeższy kontekst, ale ok. 12 otwarć i dostarczanie dowodów z innych kontenerów.

## Push gałęzi partii
Gałęzie robocze `naprawy/M2-koordynator-napraw-2026-11-09-p<N>`, push po każdym commicie (chmura) i przed każdą sesją roli. Zgoda raz na cały plan. Scalenie partii do `redesign/piekarz-2026-10-22` po `npm run verify` kod 0 (polecenie M3 z D-280 pkt 1) — proszę o potwierdzenie tej zgody tutaj, bo prompt M2 traktuje scalenie jako osobne działanie.

## Koszt
Kalibracja roli (Piekarz 19.10.2026): plan ÷ ok. 5.
| Partia | Plan (agent) | Po kalibracji | Czekanie | Twój czas |
|---|---|---|---|---|
| 1 | ok. 18 h (15 D, w tym 7 z danymi; 2 sesje ról) | ok. 3,5–4 h | pełne testy po każdym ID (ok. 2,5 min) | STOP przed partią (dane) ~5 min |
| 2 | ok. 20 h (19 D, 4 sesje ról, 06 z 8 zadaniami M) | ok. 4 h | sesja 06 (źródła w sieci) | STOP ~5 min |
| 3 | ok. 22 h (19 D, 5 sesji ról) | ok. 4,5 h | iOS E2E na CI ok. 1 h (066, 016, 074, 075) | STOP ~5 min |
| E2 | ok. 2 h | ok. 0,5 h | verify | STOP końcowy ~10 min |
Razem: ok. 62 h planu → ok. 12–13 h agenta; Twój czas ok. 30 min (4–5 STOP-ów) plus kroki niżej.

## Czego nie zrobię (kroki właściciela)
- 017: wgranie zrzutów do App Store Connect (przygotuję pliki i kontrolę obrazów).
- 032: dSYM sprawdzi dopiero następny build (build = osobna zgoda, DEC-18: po zielonym E2E na tym samym SHA).
- 068, 074, 077 i każda zmiana `.github/workflows/`: przygotuję na gałęzi; scalenie workflow — Twoja zgoda.
- 082: rotacja i rola klucza App Store Connect — tylko Ty (ASC).
- 067: nightly na master — wynik zobaczymy dopiero po scaleniu do master (osobna zgoda).
- Push na master, build TestFlight, recenzja, strona, usuwanie gałęzi/danych: nie robię.
- K jest poza gitem: bez kopii przepada z kontenerem — po STOP start wypycham K na gałąź `audit-m1/piekarz-2026-11-08`? (wymaga Twojej zgody; alternatywa: zostaje tylko lokalnie + plik postępu w repo).

## Decyzja
(a) plan jak wyżej (rekomendacja) · (b) tylko partia 1 albo tylko P1 · (c) zmiany
