# Reaudit: Audytor Generalny — Piekarz — 2026-11-09 (pętla 1)
Commit: ea249c9c (redesign/piekarz-2026-10-22) · Tryb: reaudit · Baza: 2ef8870a (drzewo = 48c81304, przodek ea249c9c) · Katalog R: `reaudit-2026-11-09/`
Środowisko: Linux, Node v22.23.4, npm ci kod 0; bez Xcode i symulatora (zrzuty tylko z artefaktu E2E #100); MCP GitHub do odczytu CI; repo płytkie do czasu `git fetch --depth=1000` (commity M2 widoczne od tego momentu).

## Podsumowanie
Pętla 1 reaudytu po partiach 1–3 M2: z 68 zadań „naprawione-do-weryfikacji” 65 zweryfikowanych, 3 nadal otwarte (005 P1, 066 P2, 067 P2), 0 „istniało wcześniej” wśród zadań. Nowe: 3 regresje P1 potwierdzone weryfikacją przeciwną (087 dane: import pakietu awaryjnego gubi wypieki w toku; 088 i 089 treści głównego przepływu), 6 regresji P3 i 6 pozycji „istniało wcześniej” P3 (D-288, backlog 1.0.1). Werdykt: kurs trafny, stan ZABLOKOWANE (otwarte P1: 005, 087, 088, 089 oraz zatwierdzone 017). Decyzje do weta: D-309 (zmienić czasy → DEC-21), D-310, D-315, D-316 (utrzymać).

| ID | Poziom | Wynik | Dowód (raport roli reaudytu) |
|---|---|---|---|
| M1-audytor-generalny-001 | P1 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 b069827f) |
| M1-audytor-generalny-002 | P1 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 9feae565) |
| M1-audytor-generalny-003 | P1 | zweryfikowane; regresja → M1-audytor-generalny-087 | `reaudit-2026-11-09/12-niezawodnosc/12-niezawodnosc-reaudit-2026-11-09.md` (commit M2 26f6a87f) |
| M1-audytor-generalny-004 | P1 | zweryfikowane | `reaudit-2026-11-09/01-odkrywanie/01-odkrywanie-reaudit-2026-11-09.md` (commit M2 4af7c631) |
| M1-audytor-generalny-005 | P1 | nadal otwarte: instrukcja i ostrzeżenie poza pierwszym ekranem (402 pt: nagłówek i kilka wierszy, bez ostrzeżenia; 320 pt: karta poza ekranem); test akceptacyjny nie sprawdza tytułu; potwierdzone w weryfikacja/V1 | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (commit M2 1d0dce0a) |
| M1-audytor-generalny-006 | P1 | zweryfikowane | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (commit M2 cfb3b16c) |
| M1-audytor-generalny-007 | P1 | zweryfikowane | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (commit M2 a33b545b) |
| M1-audytor-generalny-008 | P1 | zweryfikowane; regresje → M1-audytor-generalny-088, -089 | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (commit M2 49a83170) |
| M1-audytor-generalny-009 | P1 | zweryfikowane | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (commit M2 944c1808) |
| M1-audytor-generalny-010 | P1 | zweryfikowane | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (commit M2 e57cef29) |
| M1-audytor-generalny-011 | P1 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 831199d7) |
| M1-audytor-generalny-012 | P1 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 6c2a6e26) |
| M1-audytor-generalny-013 | P1 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 76610a26) |
| M1-audytor-generalny-014 | P1 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 8f90a72e) |
| M1-audytor-generalny-015 | P1 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 e8345215+69d895b8) |
| M1-audytor-generalny-016 | P1 | zweryfikowane; regresja → M1-audytor-generalny-094 | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 f38f9e63+5589c91e) |
| M1-audytor-generalny-018 | P1 | zweryfikowane | `reaudit-2026-11-09/11-wzrost/11-wzrost-reaudit-2026-11-09.md` (commit M2 83235746) |
| M1-audytor-generalny-019 | P2 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 d59f8226) |
| M1-audytor-generalny-020 | P2 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 259f0880) |
| M1-audytor-generalny-021 | P2 | zweryfikowane; regresja → M1-audytor-generalny-090 | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 91a26110) |
| M1-audytor-generalny-022 | P2 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 0d47bab2) |
| M1-audytor-generalny-023 | P2 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 2dceaeeb) |
| M1-audytor-generalny-024 | P2 | zweryfikowane | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (commit M2 4c542e20) |
| M1-audytor-generalny-025 | P2 | zweryfikowane | `reaudit-2026-11-09/08-programista/08-programista-reaudit-2026-11-09.md` (commit M2 cf0de762) |
| M1-audytor-generalny-026 | P2 | zweryfikowane | `reaudit-2026-11-09/08-programista/08-programista-reaudit-2026-11-09.md` (commit M2 8cedbade) |
| M1-audytor-generalny-027 | P2 | zweryfikowane | `reaudit-2026-11-09/08-programista/08-programista-reaudit-2026-11-09.md` (commit M2 c685a636) |
| M1-audytor-generalny-028 | P2 | zweryfikowane | `reaudit-2026-11-09/08-programista/08-programista-reaudit-2026-11-09.md` (commit M2 a13c842c) |
| M1-audytor-generalny-030 | P2 | zweryfikowane | `reaudit-2026-11-09/08-programista/08-programista-reaudit-2026-11-09.md` (commit M2 d74e40c0) |
| M1-audytor-generalny-031 | P2 | zweryfikowane | `reaudit-2026-11-09/12-niezawodnosc/12-niezawodnosc-reaudit-2026-11-09.md` (commit M2 e3c23559) |
| M1-audytor-generalny-033 | P2 | zweryfikowane | `reaudit-2026-11-09/12-niezawodnosc/12-niezawodnosc-reaudit-2026-11-09.md` (commit M2 f7cfd76f) |
| M1-audytor-generalny-034 | P2 | zweryfikowane | `reaudit-2026-11-09/01-odkrywanie/01-odkrywanie-reaudit-2026-11-09.md` (commit M2 4de29436) |
| M1-audytor-generalny-035 | P2 | zweryfikowane; regresja → M1-audytor-generalny-091 | `reaudit-2026-11-09/01-odkrywanie/01-odkrywanie-reaudit-2026-11-09.md` (commit M2 58b65480) |
| M1-audytor-generalny-037 | P2 | zweryfikowane | `reaudit-2026-11-09/01-odkrywanie/01-odkrywanie-reaudit-2026-11-09.md` (commit M2 b8a8f0d2) |
| M1-audytor-generalny-038 | P2 | zweryfikowane | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (commit M2 e07a9ee1) |
| M1-audytor-generalny-039 | P2 | zweryfikowane | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (commit M2 69bf0924) |
| M1-audytor-generalny-040 | P2 | zweryfikowane | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (commit M2 d1f2166f) |
| M1-audytor-generalny-041 | P2 | zweryfikowane | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (commit M2 ef9dd782) |
| M1-audytor-generalny-044 | P2 | zweryfikowane | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (commit M2 d4d1d40d) |
| M1-audytor-generalny-046 | P2 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 f1aa3ad7) |
| M1-audytor-generalny-047 | P2 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 4f24b6a6) |
| M1-audytor-generalny-048 | P2 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 0e952949) |
| M1-audytor-generalny-049 | P2 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 3ccfd438) |
| M1-audytor-generalny-051 | P2 | zweryfikowane | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (commit M2 64d2aa55) |
| M1-audytor-generalny-054 | P2 | zweryfikowane | `reaudit-2026-11-09/02-monetyzacja/02-monetyzacja-reaudit-2026-11-09.md` (commit M2 69a1c258) |
| M1-audytor-generalny-057 | P2 | zweryfikowane | `reaudit-2026-11-09/02-monetyzacja/02-monetyzacja-reaudit-2026-11-09.md` (commit M2 9a692b21) |
| M1-audytor-generalny-058 | P2 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 7526830d) |
| M1-audytor-generalny-059 | P2 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 3bebc5ab+211649bf+3e0fa3fa) |
| M1-audytor-generalny-060 | P2 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 9174cd66) |
| M1-audytor-generalny-061 | P2 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 e58a3ac1) |
| M1-audytor-generalny-062 | P2 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 6caf322b) |
| M1-audytor-generalny-064 | P2 | zweryfikowane; regresja → M1-audytor-generalny-092 | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 1f5eac3a+f34b06fd) |
| M1-audytor-generalny-065 | P2 | zweryfikowane | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (commit M2 7f520c7b) |
| M1-audytor-generalny-066 | P2 | nadal otwarte: E2E iOS #101 (42705979446) na ea249c9c in_progress w chwili reaudytu; #100 na 6a412c9a zielone we wszystkich krokach; zamknięcie po zielonym #101 (koordynator) | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 E2E run 42653620839 @221318bf (success: pl_PL, en_US, kontrola negatywna, Basic)) |
| M1-audytor-generalny-067 | P2 | nadal otwarte z warunkiem: pełny Stryker tylko w nightly po scaleniu; szacunek ~3 h wobec limitu 120 min, cache przyrostowy powstaje po ukończonym przebiegu; warunek: pierwszy nightly po scaleniu zielony z wynikiem ≥ 60 | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 c0614ee9) |
| M1-audytor-generalny-068 | P2 | zweryfikowane; nowe teoretyczne → M1-audytor-generalny-095 | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 fa679f03+6a412c9a) |
| M1-audytor-generalny-069 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 cd6a097e) |
| M1-audytor-generalny-070 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 6ed7109e) |
| M1-audytor-generalny-071 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 221318bf) |
| M1-audytor-generalny-072 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 40c4a011) |
| M1-audytor-generalny-073 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 1590999f) |
| M1-audytor-generalny-075 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 550fc6b1) |
| M1-audytor-generalny-077 | P2 | zweryfikowane | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (commit M2 86efd997) |
| M1-audytor-generalny-078 | P2 | zweryfikowane | `reaudit-2026-11-09/10-wydanie/10-wydanie-reaudit-2026-11-09.md` (commit M2 a6d8013c, 1d7c3fc0) |
| M1-audytor-generalny-079 | P2 | zweryfikowane | `reaudit-2026-11-09/10-wydanie/10-wydanie-reaudit-2026-11-09.md` (commit M2 13a32139) |
| M1-audytor-generalny-080 | P2 | zweryfikowane | `reaudit-2026-11-09/10-wydanie/10-wydanie-reaudit-2026-11-09.md` (commit M2 6a6b410e, 1d7c3fc0) |
| M1-audytor-generalny-081 | P2 | zweryfikowane | `reaudit-2026-11-09/10-wydanie/10-wydanie-reaudit-2026-11-09.md` (commit M2 2d426037) |
| M1-audytor-generalny-082 | P2 | zweryfikowane | `reaudit-2026-11-09/10-wydanie/10-wydanie-reaudit-2026-11-09.md` (commit M2 0ddecf89, a57d6de2) |
| M1-audytor-generalny-084 | P2 | zweryfikowane; regresja → M1-audytor-generalny-093 | `reaudit-2026-11-09/11-wzrost/11-wzrost-reaudit-2026-11-09.md` (commit M2 14e5f546) |
| M1-audytor-generalny-087 | P1 | regresja od 003: Import pakietu z trybu awaryjnego gubi trwający i zaplanowane wypieki (bake_sessions) bez komunikatu | `reaudit-2026-11-09/12-niezawodnosc/12-niezawodnosc-reaudit-2026-11-09.md` (12-niezawodnosc-601) |
| M1-audytor-generalny-088 | P1 | regresja od 008: Receptura żytnia po zmianie mąk (żyto ≤ 50%) dostaje w planie i prowadzeniu tekst i temperatury brioszki, łotewska 250 °C zamiast 225 °C | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (06-tresci-601) |
| M1-audytor-generalny-089 | P1 | regresja od 008: Plan brioszki na Lievito Madre: rośnięcie w keksówce 20 min (czas drożdży instant) i lodówka bez rośnięcia w cieple, bez informacji, że czasy są szacunkowe | `reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md` (06-tresci-602) |
| M1-audytor-generalny-090 | P3 | regresja od 021 (klasa: teoretyczny): Cykle importów wartości lib/backup.ts ↔ src/data po naprawie 023; test granic ich nie widzi | `reaudit-2026-11-09/05-architekt/05-architekt-reaudit-2026-11-09.md` (05-architekt-601) |
| M1-audytor-generalny-091 | P3 | regresja od 035 (klasa: dokumentacja): BR-DANE-005 uzasadnia eksport historii recenzją o eksporcie receptur | `reaudit-2026-11-09/01-odkrywanie/01-odkrywanie-reaudit-2026-11-09.md` (01-odkrywanie-601) |
| M1-audytor-generalny-092 | P3 | regresja od 064 (klasa: dokumentacja): Dwie różne daty oceny „wydanie + 90 dni” (2027-03-31 w kontrakcie, 2027-02-07 w H-01) | `reaudit-2026-11-09/03-zakres/03-zakres-reaudit-2026-11-09.md` (03-zakres-601) |
| M1-audytor-generalny-093 | P3 | regresja od 084 (klasa: realny): Test daty oceny H-01 czerwienieje przy każdym nowym wierszu TestFlight w dzienniku wydań | `reaudit-2026-11-09/11-wzrost/11-wzrost-reaudit-2026-11-09.md` (11-wzrost-601) |
| M1-audytor-generalny-094 | P3 | regresja od 016 (klasa: dokumentacja): Plan wydania liczy 5 scenariuszy E2E, a jest 6 | `reaudit-2026-11-09/10-wydanie/10-wydanie-reaudit-2026-11-09.md` (10-wydanie-601) |
| M1-audytor-generalny-095 | P3 | regresja od 068 (klasa: teoretyczny): Bramka e2e-sha przyjmuje zielony przebieg pull_request dla head_sha, choć testował commit scalenia | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (07-jakosc-602) |
| M1-audytor-generalny-096 | P3 | istniało wcześniej (klasa: realny): Numer toru w spirali dwóch wypieków ok. 7,5 pt; test 038 nie łapie atrybutu JSX fontSize | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (04-studio-projektowe-601) |
| M1-audytor-generalny-097 | P3 | istniało wcześniej (klasa: realny): Plakietka dnia na osi czasu planu łamie się w środku wyrazu w części języków | `reaudit-2026-11-09/04-studio-projektowe/04-studio-projektowe-reaudit-2026-11-09.md` (04-studio-projektowe-602) |
| M1-audytor-generalny-098 | P3 | istniało wcześniej (klasa: realny): Stryker liczy mutanty src/core tylko testami z src/core/__tests__ | `reaudit-2026-11-09/07-jakosc/07-jakosc-reaudit-2026-11-09.md` (07-jakosc-601) |
| M1-audytor-generalny-099 | P3 | istniało wcześniej (klasa: brzegowy): Tryb imperialny: zakres mas z кг/г w ru, uk, bg, sr traci dolną granicę | `reaudit-2026-11-09/09-lokalizacja/09-lokalizacja-reaudit-2026-11-09.md` (09-lokalizacja-601) |
| M1-audytor-generalny-100 | P3 | istniało wcześniej (klasa: dokumentacja): Kontrakt płatności wymienia w Basic 1.0 odczyt QR i Akademię bez wejścia w 1.0 | `reaudit-2026-11-09/02-monetyzacja/02-monetyzacja-reaudit-2026-11-09.md` (02-monetyzacja-601) |
| M1-audytor-generalny-101 | P3 | istniało wcześniej (klasa: dokumentacja): Dwie różne hipotezy H-01 i cztery aktywne H przy limicie trzech | `reaudit-2026-11-09/11-wzrost/11-wzrost-reaudit-2026-11-09.md` (11-wzrost-602) |

Liczby: zadania pętli 68 → zweryfikowane 65, otwarte 3, regresja (nowe pozycje) 9, istniało wcześniej (nowe pozycje) 6. Zadania „zatwierdzone” bez naprawy (16) tylko wypisane: 017 (P1, zrzuty, krok właściciela), 032 (P2, dSYM, czeka na build, D-302), 029, 036, 042, 043, 045, 050, 052, 053, 055, 056, 063, 074, 076, 083 (P3 backlog, D-288). Rola-właściciel 11 zgłasza, że 083 (szablon wpisu The Fresh Loaf z płatnością po 14 dniach) trzeba poprawić przed pierwszym wpisem, nie w 1.0.1.

## Zakres i metoda
- E0: HEAD ea249c9c, `git status --porcelain` puste (początek i koniec), K z gałęzi audit-m1/piekarz-2026-11-08 @ 579535fa; diff 2ef8870a..ea249c9c: 1157 plików, 111 commitów (src/lib 700 — słowniki).
- Fan-out (STOP 1 rozstrzygnięty przez koordynatora KO-006, 2026-11-09): wariant B, 6 subagentów grupowanych A (05, 12, 08), B (06, 01), C (09), D (04), E (07, 10), F (03, 02, 11), każdy z promptem reaudit swoich ról (`reaudit-2026-11-09/prompty/<rola>.md`, assemble kod 0) i wspólnym poleceniem `reaudit-2026-11-09/prompty/polecenie-grupy.md`.
- **Wyjątek nazwany (zasada 7):** kilka ról w jednym kontekście subagenta (do trzech) zamiast jednego subagenta na rolę; powód: koszt ok. połowy wariantu A przy ostrzeżeniu limitu 7-dniowego konta. Kontrola zastępcza: każda rola ma osobny raport z `sprawdz-raport --rola` kod 0, subagenci bez uzasadnień M2 (zakaz czytania `role/*/fix-*/wynik*.md`, `M2-*.md`, `naprawy/`), każde nowe P1 przez świeżego weryfikatora przeciwnego.
- Weryfikacja przeciwna: `reaudit-2026-11-09/weryfikacja/V1-dane-i-przeplyw.md` (087, 005: potwierdzone), `reaudit-2026-11-09/weryfikacja/V2-tresci.md` (088, 089: potwierdzone).
- Próbka regresji: każda grupa sprawdziła zmienione pliki swoich ról i co najmniej trzy pozycje listy kontrolnej spoza zmian (szczegóły w raportach ról).
- Analogia D-289 (lkarwowski494/trening, oczko, oczko-warsztat): nie sprawdzono — `add_repo` trening i oczko odrzucone przez klasyfikator uprawnień, oczko-warsztat dołączone, klon odrzucony; bez obchodzenia.
- Testy: `npm run verify` kod 0, 650/650 zestawów, 6800/6800 testów (grupa E, `reaudit-2026-11-09/07-jakosc/dowody/npm-verify.txt`). Pełne `npm test` w grupach A–D dały kod 1 przez brak pamięci i limit 30 s przy czterech równoległych przebiegach; każdy wskazany plik osobno kod 0 — wynik środowiska, nie kodu.
- CI: E2E iOS #101 (42705979446) na ea249c9c w toku w chwili raportu (odczyt MCP); #100 na 6a412c9a (ten sam kod) zielone.

## Decyzje do weta (D-289) i specjalne punkty polecenia
- **D-309 (brioszka):** kroki i teksty zgodne ze źródłem CIA (cytaty sprawdzone dosłownie, grupa B); czasy dla Lievito Madre potwierdzone jako błędne dla zaczynu (089, V2). Rekomendacja: zmienić — DEC-21 a (brioszka bez planu do zamknięcia PIE-BRI-900, opcja d z D-309).
- **D-310 (rada przy temperaturze wody):** utrzymać; wzór 4-DDT przeliczony (przykład 52 °C, warianty 57/55/36/44 °C, King Arthur 67 °F). Uwaga dla roli 04: przy mące i zakwasie w temperaturze pokojowej działa tylko „niższa temperatura ciasta”.
- **D-315 (H-01, data oceny):** utrzymać; mierzalne bez telemetrii (App Store Connect). Skutki uboczne: 092 i 093 (P3).
- **D-316 (bramka e2e-sha):** utrzymać; sprawdzona na sucho, mutanty G1 i G2 giną; lista dozwolonych nie przepuszcza zmian w buildzie. Uwaga 095 (P3, teoretyczne).
- **067 (Stryker):** nie do zweryfikowania przed nightly; warunek: pierwszy nightly po scaleniu zielony z wynikiem ≥ 60. Ryzyko: ok. 3 h wobec limitu 120 min — jeśli pierwszy przebieg się nie zmieści, cache się nie zasieje.
- **Bramka e2e-sha w CI:** nie biegła; pierwsze wywołanie testflight.yml na ea249c9c pokaże wynik (krok koordynatora/właściciela).

## Znaleziska M2 (nowe-znaleziska-M2.md) według D-288
| ID M2 | Wynik reaudytu | Rola |
|---|---|---|
| M2-koordynator-napraw-001 | potwierdzone, P3 (realny), istniało wcześniej | 08 |
| M2-koordynator-napraw-002 | potwierdzone, P3 (realny), otwarte | 09 |
| M2-koordynator-napraw-003 | potwierdzone, P3 (brzegowy) | 12 |
| M2-koordynator-napraw-004 | potwierdzone, P3 (teoretyczny) | 05 |
| M2-koordynator-napraw-005 | potwierdzone, P3 (brzegowy), istniało wcześniej; jedna receptura (ten sam id) | 08 |
| M2-006 | zamknięte sprostowaniem (`docs/decyzje.md:1769`) | 09 |
| 08-p2-N1 | naprawione w M2-012; zostaje sprawa czasów → 089 | 06 |
| 08-p2-N2 | P3 (treść), istniało wcześniej | 06 |
| 08-p2-N3 | P3 (treść/i18n), istniało wcześniej; rekomendacja „zostawić” przyjęta | 06 |

## Znaleziska (szczegóły)
Szczegóły według szablonu są w raportach ról (kolumna „Dowód”); tu tylko nowe P1 po weryfikacji przeciwnej.

### M1-audytor-generalny-087 · Import pakietu z trybu awaryjnego gubi trwający i zaplanowane wypieki bez komunikatu
- Pozycja listy kontrolnej: GEN-14; NIE-03 (12-niezawodnosc-601)
- Poziom: P1 (na granicy P0; dane zostają w pliku pakietu)
- Realność: brzegowy   · Pewność: wysoka (V1 potwierdzone)
- Rodzaj: D
- Dowód: `src/data/sqlite-store.ts:312` „if (data.bakeSessions) await wstawSesjeZKopii(tx, data.bakeSessions);”; sonda na bazie 1021: 2 sesje w pakiecie, 0 po „Zastąp dane”; zbieranie stanu bez sesji: src/data/dane-z-bazy.ts, linia 25.
- Powraca: tak — luka 05-architekt-504 zamknięta w 023 tylko dla czyszczenia; D-301 notuje ją jako otwartą (12-niezawodnosc-703) poza planem.
- Test akceptacyjny: jak w planie (bake_sessions = 2 po imporcie).
- Status: otwarte (regresja od 003)

### M1-audytor-generalny-088 · Receptura żytnia po zmianie mąk dostaje tekst i temperatury brioszki
- Pozycja listy kontrolnej: GEN-14; TRE (06-tresci-601)
- Poziom: P1   · Realność: brzegowy   · Pewność: wysoka (V2 potwierdzone)
- Rodzaj: D
- Dowód: `src/core/pieczenie-receptury.ts:71` „Posmaruj brioszkę roztrzepanym jajkiem i piecz 20 minut, potem obróć keksówkę”; `src/lib/pieczenie-planu.ts:17` „if (zytni || !recipeId) return undefined;”; sonda `planBakeSteps` przy 50% żyta.
- Test akceptacyjny: jak w planie.
- Status: otwarte (regresja od 008)

### M1-audytor-generalny-089 · Plan brioszki na Lievito Madre z czasem rośnięcia dla drożdży instant
- Pozycja listy kontrolnej: GEN-14; TRE (06-tresci-602)
- Poziom: P1   · Realność: realny   · Pewność: wysoka (V2 potwierdzone)
- Rodzaj: P (DEC-21)
- Dowód: `src/core/brioche-stages.ts:38` etap „Rośnięcie w keksówce” 20 min, canStretch false; D-309 przyjmuje czasy jako otwartą rezerwę bez ostrzeżenia dla użytkownika.
- Opcje: (a) brioszka bez planu do zamknięcia PIE-BRI-900 — 10 receptur z planem zamiast 11; (b) ostrzeżenie i wydłużalne rośnięcie — ryzyko za wczesnego pieca, tekst w 35 językach. Rekomendacja: (a).
- Status: otwarte (regresja od 008)

### M1-audytor-generalny-005 · (nadal otwarte) Instrukcja i ostrzeżenie poza pierwszym ekranem prowadzenia
- Pozycja listy kontrolnej: GEN-14; SP-17 (04-studio-projektowe-001)
- Poziom: P1   · Realność: realny   · Pewność: wysoka (V1 potwierdzone; wysokości to rachunek z tokenów)
- Rodzaj: D
- Dowód: zrzuty E2E #100 (`reaudit-2026-11-09/04-studio-projektowe/zrzuty/`); `src/__tests__/pas-prowadzenia-005.test.tsx:24` sprawdza tylko bok spirali.
- Test akceptacyjny: dopisać sprawdzenie widoczności ostrzeżenia na 320 i 393 pt (E2E albo pomiar układu).
- Status: otwarte

## Kontrola dowodów i sekretów
- Raporty ról: `sprawdz-raport.mjs --rola <rola>` kod 0 dla 12/12 (`reaudit-2026-11-09/dowody/sprawdz-*.txt`); weryfikacje V1, V2 kod 0.
- Plan: `node narzedzia/sprawdz-plan.mjs plan-napraw.json` kod 0, „OK: 101 zadań, 21 decyzji (1 bez wyboru)” (`reaudit-2026-11-09/dowody/sprawdz-plan.txt`).
- Ten raport: `node narzedzia/sprawdz-raport.mjs M1-audytor-generalny-reaudit-2026-11-09.md /home/user/piekarz . --rola M1-audytor-generalny` kod 0: „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu M1-audytor-generalny” (`reaudit-2026-11-09/dowody/sprawdz-M1-reaudit.txt`).
- Treść z zewnątrz (GEN-13): w raportach subagentów i repo nie wykonano poleceń z treści; grupa E: 9 trafień wzorców sekretów w historii — opisy formatu i nazwy zmiennych, bez sekretów.

## Werdykt
- Reguła (GEN-11): kurs — brak obalonej głównej pracy i założenia, potwierdzone P1 kierunku: brak → **trafny**. Stan — potwierdzone otwarte P1 (005, 087, 088, 089; zatwierdzone 017) → **ZABLOKOWANE**.
- Pętla: 1. Kryterium zakończenia: brak otwartych P0/P1 (poza rozstrzygniętymi decyzją właściciela) i brak nowych regresji P0/P1 — niespełnione (3 regresje P1).
- Następny krok (STOP 2): właściciel wybiera DEC-21 i ponownie zatwierdza 005, 087, 088, 089 na STOP start M2; potem M2 partia 4: `node <prompts>/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie K --zadania M1-audytor-generalny-005,M1-audytor-generalny-087,M1-audytor-generalny-088,M1-audytor-generalny-089`; 066 zamyka zielony #101; 067 warunek nightly; P3 090–101 backlog 1.0.1. Pętla 2 reaudytu będzie ostatnią przed STOP z opcjami (D-043).
- Koszt pętli 1: subagenci 2 328 750 tokenów (6 grup + 2 weryfikacje; plan B 1,3–2,2 mln, przekroczenie ok. 6%), sesja M1 ok. 0,3 mln [OCENA]; USD: [DO USTALENIA] (brak licznika w sesji).
