# Postęp napraw M2 — Piekarz
Pętla 1 · Zadania: zatwierdzone (84; 085, 086 odrzucone) · Audyt 2ef8870a · Baza dd824eee (redesign/piekarz-2026-10-22, 26 commitów od audytu) · Sesje ról: subagenci

Prompt roli: `node /home/user/prompts/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --zadania zatwierdzone` (biblioteka c025063).
K odtworzone z `origin/audit-m1/piekarz-2026-11-08` @ 68116bf8 (plan, raport M1, role/); K poza gitem (`.git/info/exclude:7: audit/`).

## Zgody
- 2026-11-09 (przez M3, D-286): „Wszystkie rekomendacje M1, zakres M2: wszystkie otwarte, mozesz startowac role M2”. To zgoda na uruchomienie roli, nie na STOP start M2.
- 2026-11-09: dodanie repo `lkarwowski494/prompts` do sesji (odczyt) — odpowiedź właściciela „Dodaj repo prompts (Recommended)”.
- 2026-11-09 STOP start (odpowiedzi właściciela): zakres „Cały plan, 3 partie (Recommended)”; sesje ról „Subagenci po kolei (Recommended)”; „Push + scalenie do redesign (Recommended)” (push gałęzi partii po każdym commicie, scalenie partii do redesign po verify kod 0; master, build, sklep wykluczone); kopia K „Push na gałąź audit-m1 (Recommended)”.

## Ograniczenia (z polecenia M3, zapisane w D-286 i wcześniejszych)
- Baza napraw = `redesign/piekarz-2026-10-22`, nie `master`. Scalenie partii do redesign po `npm run verify` kod 0.
- Bez osobnej zgody: push na master, build TestFlight, zgłoszenie do recenzji, zapis w App Store Connect, strona, usuwanie gałęzi i danych (D-272 zużyte; DEC-18: build tylko po zielonym E2E na tym samym SHA).
- Numery decyzji w `docs/decyzje.md`: od D-300.

## Partie
| Partia | Gałąź | Od | Do | STOP przed | Stan |
|---|---|---|---|---|---|
| 1 | naprawy/M2-koordynator-napraw-2026-11-09-p1 | dd824eee | — | tak (P/M: 003, 023, 024; dane użytkownika) | czeka na STOP przed partią 1 |
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

## Czekające zgody i kroki właściciela
- STOP przed partią 1 (dane użytkownika, P/M 003, 023, 024).
