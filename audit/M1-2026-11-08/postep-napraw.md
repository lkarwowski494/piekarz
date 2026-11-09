# Postęp napraw M2 — Piekarz
Pętla 1 · Zadania: zatwierdzone (84; 085, 086 odrzucone) · Audyt 2ef8870a · Baza dd824eee (redesign/piekarz-2026-10-22, 26 commitów od audytu) · Sesje ról: subagenci

Prompt roli: `node /home/user/prompts/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --zadania zatwierdzone` (biblioteka c025063).
K odtworzone z `origin/audit-m1/piekarz-2026-11-08` @ 68116bf8 (plan, raport M1, role/); K poza gitem (`.git/info/exclude:7: audit/`).

## Zgody
- 2026-11-09 (przez M3, D-286): „Wszystkie rekomendacje M1, zakres M2: wszystkie otwarte, mozesz startowac role M2”. To zgoda na uruchomienie roli, nie na STOP start M2.
- 2026-11-09: dodanie repo `lkarwowski494/prompts` do sesji (odczyt) — odpowiedź właściciela „Dodaj repo prompts (Recommended)”.
- 2026-11-09 STOP start (odpowiedzi właściciela): zakres „Cały plan, 3 partie (Recommended)”; sesje ról „Subagenci po kolei (Recommended)”; „Push + scalenie do redesign (Recommended)” (push gałęzi partii po każdym commicie, scalenie partii do redesign po verify kod 0; master, build, sklep wykluczone); kopia K „Push na gałąź audit-m1 (Recommended)”.

- 2026-11-09 STOP przed partią 1 (`stop-p1-M2-2026-11-09.md`): 001 „Kolejka + osłona teraz (Recommended)”; 021 „Wyjątek nazwany (Recommended)” (zamrożenie parsera w wydanej migracji v6, dowód: testy 1014 i 1021 identyczne przed/po). Zapis: D-300.

## Ograniczenia (z polecenia M3, zapisane w D-286 i wcześniejszych)
- Baza napraw = `redesign/piekarz-2026-10-22`, nie `master`. Scalenie partii do redesign po `npm run verify` kod 0.
- Bez osobnej zgody: push na master, build TestFlight, zgłoszenie do recenzji, zapis w App Store Connect, strona, usuwanie gałęzi i danych (D-272 zużyte; DEC-18: build tylko po zielonym E2E na tym samym SHA).
- Numery decyzji w `docs/decyzje.md`: od D-300.

## Partie
| Partia | Gałąź | Od | Do | STOP przed | Stan |
|---|---|---|---|---|---|
| 1 | naprawy/M2-koordynator-napraw-2026-11-09-p1 | dd824eee | — | tak (P/M: 003, 023, 024; dane użytkownika) | w toku |
| 2 | naprawy/M2-koordynator-napraw-2026-11-09-p2 | — | — | tak (P/M: 004, 007–010, 040–043, 045, 049, 053) | czeka |
| 3 | naprawy/M2-koordynator-napraw-2026-11-09-p3 | — | — | tak (P/M: 015, 018, 054, 055, 057, 058, 061–065, 068, 078, 080, 082, 084) | czeka |

## Zadania
Kolejka i plan per ID: `dowody/M2/zakres.txt`, `dowody/M2/plan-per-id.md`. Krok wszystkich: czeka.
Do ponownego odtworzenia (pliki zmienione po audycie, tor B): 042, 043 (D-284, `src/recipes/maszyna-receptur.ts`), 046 (D-283, słowniki es/es-419/pt/pt-BR/it/el), 066 (D-282/D-285, scenariusze Maestro), 079 (`docs/wydanie/dziennik.md`).

## Dziennik
- 2026-11-09 04:0x E0: klon biblioteki odmówiony (repo spoza sesji) → STOP do właściciela → repo dodane, klon c025063, prompt złożony (61 286 znaków).
- 2026-11-09 E0: sprawdz-plan kod 0 (86 zadań, 20 decyzji, 0 bez wyboru) → `dowody/M2/sprawdz-plan-start.txt`; zakres-napraw kod 0 (84 zadania, 3 partie) → `dowody/M2/zakres.txt`.
- 2026-11-09 E0: repo: drzewo czyste, audyt 2ef8870a istnieje, 26 commitów od audytu (80 plików), K ignorowany; gałęzie `naprawy/M2-koordynator-napraw-2026-11-09-*` nie istnieją.
- 2026-11-09 E0: bramka D-025: `docs/monetyzacja.md:152` werdykt „przerobić” → przechodzi.
- 2026-11-09 E0: CI na master: E2E #96 czerwone na 2ef8870a, nightly czerwone/anulowane — w planie (066, 067, 068), nie nowe znaleziska.
- 2026-11-09 E0: stan wyjściowy: typecheck kod 0, lint kod 0 (2 ostrzeżenia), jest kod 0 (575/6024, 152 s).
- 04:48 001 test czerwony (`dowody/M2/001-przed.txt`: import tracił 2 wypieki, 2 równoległe saveStarter odrzucone) → kolejka zapisów `src/data/kolejka-zapisow.ts`, 9 transakcji przez tx, strażnik `tests/kolejka-zapisow-tx.test.ts` → verify kod 0 (578/6034, `dowody/M2/001-verify.txt`) → commit b069827f, status naprawione-do-weryfikacji. Reguły: 08 rdzen (Zasady, Tryb fix), 08 sqlite-expo (Port bazy), 05 dane-lokalne-sqlite (Transakcje). Uwaga: runner migracji nadal BEGIN przez execAsync (każda instrukcja osobno w kolejce) — poza mechanizmem 001; osłona (b) w 028. Test „Usuń wszystkie dane” zielony też przed poprawką (kopia przed czyszczeniem kończy się przed zapisem) — kontrola, nie odtworzenie.
- 05:01 002 test czerwony (`dowody/M2/002-przed.txt`: usunięty wpis feed-… wracał) → saveStarter bez wpisów, dokarmienie przez addStarterEntry/createStarterWithEntry, tryb pamięci z dziennika → verify kod 0 (579/6037, `dowody/M2/002-verify.txt`) → commit 9feae565. Przygotowanie danych w 9 testach przez dziennik (asercje bez zmian). Reguły: jak 001 + 08 sqlite-expo „Zapis rodzica i dzieci”.
- 05:16 019: refactor ea7efb2f (runner do runner-migracji.ts) — BŁĄD WŁASNY: po śledzeniu pliku padał test 062 (git ls-files), verify przed commitem tego nie widział; naprawa ae7d36c7 (DDL w sqlite-schema, parametr). Od teraz verify po git add. Test czerwony (`dowody/M2/019-przed.txt`: 5 wpisów → 0) → flaga przebudowa → verify kod 0 (6040, `dowody/M2/019-verify.txt`) → commit d59f8226. Reguły: 05 dane-lokalne-sqlite „Migracje schematu”, „Runner migracji”.
- 05:28 020 test czerwony (`dowody/M2/020-przed.txt`: 8× DOMENA) → scheduler i profile-snu do core (fasady), yeast-stages do recipes, import type, komunikat adaptacji bez tekstu → verify kod 0 (6041, `dowody/M2/020-verify.txt`) → commit 259f0880. Nowe znalezisko M2-koordynator-napraw-001: komunikat adaptacji fermentacji (RD-08) nigdy nie pokazywany w aplikacji; klucze zostają w słownikach. Reguły: 05 wzorce „Granice modułów”, rdzen zasada 7.
- 05:35 021 test czerwony (`dowody/M2/021-przed.txt`: 2 cykle data) → zamrożony parser migracja-v6-parser.ts (D-300), sesja-parsery.ts → migracje 1014/1021 identyczne (`dowody/M2/021-migracje-przed.txt`, `021-migracje-po.txt`), równoważność (`021-rownowaznosc-parsera.txt`) → verify kod 0 (6045) → commit 91a26110. Reguły: 05 dane-lokalne-sqlite „Migracje schematu” (wydanej nie zmieniasz — wyjątek D-300).
- 05:44 022 test czerwony (`dowody/M2/022-przed.txt`: k=0 unavailable) → poStarcieBazy + bramka w nasłuchu _layout (pierwsza wersja z funkcją w lib odrzucona: atrapa w start-aplikacji-p11 nie widziała wywołania) → verify kod 0 (6048) → commit 0d47bab2. Uwaga: zachowanie na telefonie (czy iOS wysyła active przy zimnym starcie) [DO USTALENIA] jak w znalezisku.
- 05:49 025 test czerwony (`dowody/M2/025-przed.txt`; przy niedzieli jako 1. dniu błędu nie ma — ten sam tydzień) → widok bieżący z zegara → verify kod 0 (6052) → commit cf0de762. Reguły: 08 rdzen.
- 06:01 026 test czerwony (`dowody/M2/026-przed.txt`) → 3 poprawki; nowe klucze: najpierw „czeka na przekład” (odrzucone: test 093 wymaga pustej listy) → przekład 33 języków + drugi przegląd AI (3 poprawki) → verify kod 0 (6055) → commit 8cedbade. Zawężenie: brak masy w płaskim JSON zostaje 850 g (format wspierany; test akceptacyjny dotyczy złej masy). Teksty do akceptacji roli 04: „Brak ocen”, „Udział drożdży…”, „Masa ciasta…”. Nowe znalezisko M2-002 (słowniki bg/sr/ro/sl). Reguły: 08 rdzen zasada 9; 09 rdzen (drugi przegląd AI).

## Czekające zgody i kroki właściciela
- brak (partia 1 w toku)
