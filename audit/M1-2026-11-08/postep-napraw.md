# Postęp napraw M2 — Piekarz
Pętla 1 · Zadania: zatwierdzone (84; 085, 086 odrzucone) · Audyt 2ef8870a · Baza dd824eee (redesign/piekarz-2026-10-22, 26 commitów od audytu) · Sesje ról: subagenci

Prompt roli: `node /home/user/prompts/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --zadania zatwierdzone` (biblioteka c025063).
K odtworzone z `origin/audit-m1/piekarz-2026-11-08` @ 68116bf8 (plan, raport M1, role/); K poza gitem (`.git/info/exclude:7: audit/`).

## Zgody
- 2026-11-09 (przez M3, D-286): „Wszystkie rekomendacje M1, zakres M2: wszystkie otwarte, mozesz startowac role M2”. To zgoda na uruchomienie roli, nie na STOP start M2.
- 2026-11-09: dodanie repo `lkarwowski494/prompts` do sesji (odczyt) — odpowiedź właściciela „Dodaj repo prompts (Recommended)”.
- 2026-11-09 STOP start (odpowiedzi właściciela): zakres „Cały plan, 3 partie (Recommended)”; sesje ról „Subagenci po kolei (Recommended)”; „Push + scalenie do redesign (Recommended)” (push gałęzi partii po każdym commicie, scalenie partii do redesign po verify kod 0; master, build, sklep wykluczone); kopia K „Push na gałąź audit-m1 (Recommended)”.

- 2026-11-09 STOP przed partią 1 (`stop-p1-M2-2026-11-09.md`): 001 „Kolejka + osłona teraz (Recommended)”; 021 „Wyjątek nazwany (Recommended)” (zamrożenie parsera w wydanej migracji v6, dowód: testy 1014 i 1021 identyczne przed/po). Zapis: D-300.

- 2026-11-09 STOP przed partią 2 (`stop-p2-M2-2026-11-09.md`): „Tak, jak w planie (Recommended)”; 029 „Odłożyć do 1.1 (Recommended)”; 032 „Runbook teraz (Recommended)”. Zapis: D-302.

- 2026-11-09 D-288 (właściciel przez M3, wpis przeczytany na redesign @ 005cd82a): plan zamrożony; 14 zadań P2 brzegowych/teoretycznych → P3 backlog 1.0.1 (029, 036, 042, 043, 045, 050, 052, 053, 055, 056, 063, 074, 076, 083); wyjątki 071, 082, 081 zostają; reaudyt: nowe P2 → P3 z `klasa`. Zapis w planie: poziom P3, poziom_audytu, klasa, blokada (walidator biblioteki nie zna statusu `backlog` — niespójność modułu plan-napraw z jego skryptem); lista: backlog-1-0-1.json; plan przed zmianą: dowody/M2/plan-napraw-przed-D288.json.

## Ograniczenia (z polecenia M3, zapisane w D-286 i wcześniejszych)
- Baza napraw = `redesign/piekarz-2026-10-22`, nie `master`. Scalenie partii do redesign po `npm run verify` kod 0.
- Bez osobnej zgody: push na master, build TestFlight, zgłoszenie do recenzji, zapis w App Store Connect, strona, usuwanie gałęzi i danych (D-272 zużyte; DEC-18: build tylko po zielonym E2E na tym samym SHA).
- Numery decyzji w `docs/decyzje.md`: od D-300.

## Partie
| Partia | Gałąź | Od | Do | STOP przed | Stan |
|---|---|---|---|---|---|
| 1 | naprawy/M2-koordynator-napraw-2026-11-09-p1 | dd824eee | f7cfd76f (scalenie redesign 4454f1fd) | tak (P/M: 003, 023, 024; dane użytkownika) | zakończona: 16 naprawionych, 029/032 blokada |
| 2 | naprawy/M2-koordynator-napraw-2026-11-09-p2 | 4454f1fd | — | tak (P/M: 004, 007–010, 040–043, 045, 049, 053) | w toku |
| 3 | naprawy/M2-koordynator-napraw-2026-11-09-p3 | — | — | tak (P/M: 015, 018, 054, 055, 057, 058, 061–065, 068, 078, 080, 082, 084) | czeka |

## Zadania
Kolejka i plan per ID: `dowody/M2/zakres.txt`, `dowody/M2/plan-per-id.md`. Statusy: plan-napraw.json (źródło prawdy), commity: `git log --grep M1-audytor-generalny-NNN`.
| ID | Krok | Commit |
|---|---|---|
| 001, 002, 019, 020, 021, 022, 025, 026, 027, 028, 030, 031 | naprawione-do-weryfikacji | b069827f, 9feae565, d59f8226, 259f0880, 91a26110, 0d47bab2, cf0de762, 8cedbade, c685a636, a13c842c, d74e40c0, e3c23559 |
| 029, 032 | blokada (decyzja / build) | — |
| 003 | polecenie wysłane (rola 12) | — |
| 023, 024 | czeka na rolę 05 | — |
| 033 | czeka na 003 | — |
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
- 06:09 027 test czerwony (`dowody/M2/027-przed.txt`) → zakresy-receptury.ts, parametry {min}–{max}, powód na ekranie importu → verify kod 0 (6064) → commit c685a636. Test recipe-sharing dostosowany do kontraktu b (151%). Tekst ekranu: powód = istniejące komunikaty walidacji. Do roli 06: potwierdzenie zakresów (wariant a).
- 06:14 028 test czerwony (`dowody/M2/028-przed.txt`: 2 wpisy) → blokada ref w 3 akcjach → verify kod 0 (6066) → commit a13c842c. Dodanie zakwasu: blokada bez osobnego testu (ta sama funkcja jedenNaraz).
- 06:22 030 test czerwony (`dowody/M2/030-przed.txt`) → pierwsze podejście (samo okno 24 h) łamało notification-plan.test (bieżący krok); poprawka zgodna z oboma: bieżący krok → 24 h → grupy → verify kod 0 (6067) → commit d74e40c0. Okno 24 h = istniejąca gwarancja testu „nic z najbliższych 24 h nie wypada”.
- 06:29 031 test czerwony (`dowody/M2/031-przed.txt`) → EXPO_PUBLIC_BUILD_NUMBER → verify kod 0 (6069) → commit e3c23559. Potwierdzenie w prawdziwym buildzie (Metro inline) — przy następnym buildzie (krok właściciela).
- 06:29 029, 032: blokada (decyzja / krok poza kontenerem), opcje na STOP przed partią 2.
- 06:30 Sesje ról p1: polecenie 12-niezawodnosc-p1.md wysłane (subagent opus, 003 DEC-17 a); 05-architekt-p1.md przygotowane (023 DEC-11 a, 024 M) — po wyniku roli 12.
- 06:59 003 wynik roli 12: commity 2665582f (refactor), 26f6a87f; sprawdzone przeze mnie: drzewo czyste, gałąź = origin, test 003 7/7 zielony, sprawdz-raport wynik.md kod 0, verify kod 0 (591/6079, `dowody/M2/003-verify-M2.txt`). Uruchomione: przegląd ścieżki wrażliwej (diff e3c23559..26f6a87f, subagent opus) i drugi przegląd przekładu 003. Nowe znaleziska roli 12: 701, 702, 703 (raport-fix.md; 703 pokrywa się z 023 — kopia z sesjami).
- 07:03 003: przegląd ścieżki wrażliwej — brak P0/P1 (3 uwagi P2 → M2-003); drugi przegląd przekładu — 6 poprawek w 56fb4a0b; verify kod 0 (6079). Status 003 naprawione-do-weryfikacji (26f6a87f + 56fb4a0b). Przekazanie roli 12 do 08/07: brak otwartych (test akceptacyjny w repo). Teksty 003 do akceptacji roli 04 (3).
- 07:03 Polecenie 05-architekt-p1.md wysłane (subagent opus; 023 DEC-11 a, 024 M). Drzewo nietykane do wyniku.
- 07:25 023 (2dceaeeb), 024 (4c542e20) od roli 05: sprawdzone — drzewo czyste, gałąź = origin, sprawdz-raport OK, verify kod 0 (593/6091, `dowody/M2/023-024-verify-M2.txt`), przegląd ścieżki wrażliwej 023 brak P0/P1. Statusy ustawione. D-301 dopisane (N3 roli 05). Znaleziska roli 05: N1, N2 (raport w role/05-architekt/fix-2026-11-09).
- 07:36 033 test czerwony (`dowody/M2/033-przed.txt`) → sprawdzKopieBazy w 3 miejscach → pierwsze verify: 4 testy (moje 001/002 czytały ostatni otwarty plik = kopię; auto-backup widział plik wyniku przy wersji 0; corrupt-rescue nowe pole) → poprawki: bez sprawdzania przy wersji 0, testy czytają bazę po nazwie, oczekiwane pole sprawdzenie → verify kod 0 (6094) → commit 5198132e. Przegląd ścieżki wrażliwej 033 w toku.
- 07:41 033 przegląd ścieżki wrażliwej: P1 przyjęty (checkpoint kasował -wal surowej kopii) → test czerwony (`dowody/M2/033-przeglad-przed.txt`) → kopia robocza w Caches → verify kod 0 (6095) → commit f7cfd76f; status 033 naprawione-do-weryfikacji. Drugiego przeglądu nie ma (zasada trybu fix).
- 07:42 Przegląd ścieżki wrażliwej dla zmian danych M2 (001, 002, 019, 021, 022; 7 commitów) uruchomiony — przed scaleniem partii 1.
- 07:47 Partia 1 zakończona: przegląd zmian danych M2 bez P0/P1 (uwagi → M2-004); scalenie do redesign 4454f1fd (konflikt tylko decyzje.md: D-287 M3 + D-300/D-301), verify kod 0 (594/6095, `dowody/M2/p1-scalenie-verify.txt`), push redesign. Koniec p1 = f7cfd76f. D-287 (M3): terminy maszyny D-284 zostają (b) — dotyczy 042.
- 07:51 STOP p2 rozstrzygnięty (D-302). Gałąź p2 od 4454f1fd. 029 blokada „odłożone do 1.1”.
- 07:53 Partia 2: polecenie 01-odkrywanie-p2 wysłane (004); polecenia 04, 06, 09 gotowe (generator narzedzia/polecenie-roli.py). Badanie źródeł do runbooka 032 (subagent, tylko plik w K: naprawy/032-zrodla-runbook.md).
- 07:55 D-288 naniesione: 14 → P3 (klasy z raportów zgodne z listą M3), sprawdz-plan kod 0, zakres: 68 zatwierdzonych, 53 do wykonania. Polecenia 06 (008, 009, 010, 040, 041) i 09 (049) odświeżone. D-288 scalę do p2 przy najbliższym scaleniu (drzewo zajęte przez rolę 01).
- 07:58 032 badanie źródeł: naprawy/032-zrodla-runbook.md (18 źródeł, 13 kroków); sprawdzone przeze mnie curl: Maven react-native-artifacts/0.86.3 ma reactnative-core-dSYM-release i reactnative-dependencies-dSYM-release, hermes-ios/250829098.0.17 ma hermes-framework-dSYM-release. Runbook do docs po zwolnieniu drzewa przez rolę 01.
- 08:02 032: runbook docs/wydanie/symbolizacja-awarii.md (0976c0ca), verify kod 0; blokada zaktualizowana (build). 004: rola 01 → 0282f59d (BRD/ER-79), sprawdzone: drzewo czyste, sprawdz-raport OK; przekazanie do 08/07 (karta bez fazy z okna przy showPeakWindow=false) robię sam pod 004.
- 08:06 004: rola 01 0282f59d (BRD, ER-79) + przekazanie do 08 wykonane przeze mnie 4af7c631 (test czerwony `dowody/M2/004-kod-przed.txt`, verify kod 0 6103); status naprawione-do-weryfikacji. Znaleziska roli 01: chipy temperatury bez skutku po usunięciu fazy (P2, rola 04); źródło okna (rola 06, ZAK-SZC-900); test ekranu (rola 07).
- 08:06 Polecenie 04-studio-projektowe-p2 wysłane (007, DEC-10 a). Drzewo zajęte do wyniku.
- 08:26 007: rola 04 fef62d3e (refactor) + a33b545b; sprawdzone: drzewo czyste, sprawdz-raport OK po poprawce formatu odwołania do zrzutów (wzorzec nazw), verify kod 0 (596/6116), przegląd ścieżki wrażliwej (arkusze importu) brak P0/P1. Status naprawione-do-weryfikacji. Nowe: 04-studio-projektowe-007 (P1, P: 6 kolejnych arkuszy poza kartami — decyzja właściciela na STOP), M2-005 (P2 → P3).
- 08:26 Polecenie 06-tresci-p2 wysłane (008, 009, 010, 040, 041). Drzewo zajęte do wyniku.
- 09:09 09:15 049: rola 09 3ccfd438 (wpis zakresu 1.0.1 w jezyki.md, bez kodu); sprawdzone: drzewo czyste, HEAD=origin, sprawdz-raport OK, verify kod 0 (596/6116). Status naprawione-do-weryfikacji. Nowe: M2-006 (P3, odwołanie D-280→D-276). Przekazanie do 06 na 1.0.1 (bez pracy w 1.0). Start przekazania 06→08 (008, 009, 010, 040, 041, potem 014).
- 10:32 10:40 Przekazanie 06→08: 944c1808 (009), 49a83170 (008), e57cef29 (010), d1f2166f (040), 99cda7a1 (041), 9265f84c (014); sprawdzone: drzewo czyste, HEAD=origin, sprawdz-raport OK, sprawdz-pieczenie 45/0, sprawdz-maki 0/0, czeka-na-przeklad pusta. W toku: mój verify, drugi przegląd AI przekładu, przegląd ścieżki danych (041, 008). Statusy po przeglądach.
- 10:47 12:20 Przekazanie 06→08 zamknięte: verify 602/6300 (mój), przegląd ścieżki danych (P2 regresja 041 + P3 → ef9dd782, TDD 4/4 czerwone→zielone, verify 603/6304), drugi przegląd AI przekładu (4 P2 → 8f90a72e, verify 603/6304). Statusy naprawione-do-weryfikacji: 008 (ffb4174e+49a83170), 009 (f6f9f162+944c1808), 010 (162a3fa3+e57cef29), 040 (5628bbfe+d1f2166f), 041 (6fec6b7d+99cda7a1+ef9dd782), 014 (9265f84c+8f90a72e). Nowe: M2-007 (P3), P3 przekładu w rejestrze. Dalej: moje D partii 2.
- 10:57 013: 76610a26 — para °F/°C ze źródła bez przeliczenia °C, grupowanie tysięcy w masach (także „100–50 000 g”). TDD 71/72 czerwone → 72/72; verify 6376 kod 0. Wyjątek nazwany: test 096 zawężony do °C bez pary (°C pary zostaje zamiast usunięcia frazy — usuwanie w 35 językach łamałoby gramatykę). Status naprawione-do-weryfikacji.
- 11:01 012: 6c2a6e26 — ekran awaryjny w języku systemu (ustawJezykSystemu w gałęzi awaryjnej). TDD 3/3 czerwone → zielone; verify 6379 kod 0. Status naprawione-do-weryfikacji.
- 11:08 006: ff453a6b — skok z „Przywróć” (stan sprzed skoku), bieżący krok bez zmian; nowy tekst EN+33. TDD 2/2 czerwone → zielone; verify 6381 kod 0. Przegląd ścieżki wrażliwej (sesja wypieku) + drugi przegląd AI klucza w toku — status po przeglądzie. Uwaga do STOP p3: test akceptacyjny planu wymienia też potwierdzenie; wybrana opcja A znaleziska (cofnięcie zamiast pytania).
- 11:17 051: 64d2aa55 (t('DDT') w podglądzie importu; TDD; verify 6382). 006: przegląd ścieżki danych — brak P0/P1; P2-1 + przekład et i 6 P3 → cfb3b16c (verify 6383). Statusy 006, 051 naprawione-do-weryfikacji. Nowe: M2-008, M2-009 (P3).
- 11:25 047: 4f24b6a6 — 12 h bez zera wiodącego (opcjeGodziny), jedna kropka po „p.m.”/„μ.μ.”; TDD 4 czerwone → 37/37; 2 stare testy utrwalały „09:05 PM” (zmienione z ID); verify 6420 kod 0. 046: zrobione w torze B (D-283, f1aa3ad7 + test e6b69e0f, wariant bez rodzajnika zamiast tPlural z rekomendacji znaleziska); sprawdzone testem godzina-przyimek 6/6 + 047 na HEAD (dowody/M2/046-sprawdzenie-toru-B.txt). Statusy naprawione-do-weryfikacji.
- 11:36 048: 6c5546bd — data odległa po dwukropku (5 kluczy, EN+33), słowo dnia w zdaniu; TDD; 2 testy dostosowane (089 miejsce klucza, spirala regex); verify 6427 kod 0. Drugi przegląd AI przekładu w toku — status po przeglądzie.
- 11:44 034: 4de29436 — BRD bez próby (ER-80), trwała kontrola; TDD 2/2 czerwone → zielone; verify 6429. kontrola-brd: 2 błędy RD-37/38 sprzed zmiany (M2-010). 048: drugi przegląd AI bez P0/P1; ru P2 + es-419 P3 → 0e952949, verify 6429. Statusy 034, 048 naprawione-do-weryfikacji.
- 11:48 037: b8a8f0d2 — BR-RECP-001 26 receptur + D-236 (ER-81), trwała kontrola; TDD; verify 6431. Status naprawione-do-weryfikacji. M2-011: pełny przegląd D-221…D-291 otwarty.
- 11:56 035: 58b65480 — BR-DANE-005 CSV z testem (ER-82); schowek → rola 03 (naprawy/przekazania-M2.md). Test dokumentuje istniejący kod (zielony od razu; czerwona była bramka: brak BR). verify 6436. Status naprawione-do-weryfikacji.
- 12:04 039: 69bf0924 — systemowy Switch; TDD; verify 6437. Status naprawione-do-weryfikacji. Zrzut wyglądu: krok właściciela (brak Xcode).
- 12:16 044: d4d1d40d — zdanie produktu w docs/tresci, znaczniki ja/ko/zh-Hant, skrypt z modułu; TDD; verify 6444. Status naprawione-do-weryfikacji. Treść ja/zh dopisana przez M2 tylko spacją (bez zmiany słów).
- 12:22 038: e07a9ee1 — tokeny typografii i promieni w 33 plikach, trwała kontrola; TDD; verify 6446. Status naprawione-do-weryfikacji. Ryzyko: wygląd na 320 pt / AX5 bez automatu — zrzuty krok właściciela, przegląd roli 04.
- 12:26 005: 1d0dce0a — mała spirala na pasie + assertVisible karta-kroku w E2E 03; TDD; verify 6448. Status naprawione-do-weryfikacji; pełna akceptacja (375×667, 402×874, 2 wypieki) dopiero w E2E iOS na symulatorze — przed buildem (DEC-18).
- 12:35 011: 3e51b342 — kontrola (a) 189 par (3 sesje na ślepo + porównanie), 5 poprawek notatek wdrożonych, rejestr + test; verify 6450. Blokada: 13 poprawek zdań maszyny wobec D-287 → decyzja na STOP p3.
- 12:36 Partia 2 scalona: redesign = 3e51b342 (fast-forward, verify 6450 kod 0). STOP p3 zapisany (stop-p3-M2-2026-11-09.md): 4 decyzje.
- 12:41 STOP p3: właściciel wg rekomendacji (D-308, 5f134962). 011: 13 poprawek zdań maszyny → 831199d7, verify 6450; status naprawione-do-weryfikacji (3e51b342 + 831199d7). Partia 3 na gałęzi p3.
- 12:42 Partia 3 start: rola 03 (015, 058, 061, 062, 064, 065) w drzewie p3. Zadania dodatkowe M2-012…014 zapisane (D-308).
- 13:26 Rola 03 p3: e8345215 (015), 7526830d (058), 6caf322b (062), e58a3ac1 (061), 7f520c7b (065), 1f5eac3a (064); sprawdz-raport OK; statusy 058, 061, 062, 065 naprawione-do-weryfikacji; 064 blokada (apetyt — decyzja właściciela); 015 po przeglądach (w toku). N-1 (test zależny od pory dnia po 048) naprawione 287de811, verify 6467 kod 0 (UTC) + jest Tokyo kod 0.
- 13:27 015: przegląd ścieżki zakupów brak P0/P1, drugi przegląd przekładu bez P0–P2 (P3 do 1.0.1, propozycja tr odrzucona jako błędna). Status naprawione-do-weryfikacji (e8345215; dopisek docs/monetyzacja.md przez rolę 02 pod tym ID).
- 13:45 Rola 02 p3: 69a1c258 (054), 69d895b8 (015 dok.), 9a692b21 (057); sprawdz-raport OK; verify 6476 kod 0 bez TZ (po 287de811). Ceny bez zmian (diff). Statusy 054, 057 naprawione-do-weryfikacji. N1 decyzja właściciela (zbieram), N2/N3 → P3. Start rola 06 (M2-012, M2-013).
- 14:00 Rola 06 p3: cac65b73 (M2-012, D-309: plan brioszki ze źródła CIA, czasy Lievito Madre [DO USTALENIA] jako nazwana rezerwa), 09d8227a (M2-013, D-310: rada przy gorącej wodzie poprawna w kodzie od p2; do usunięcia martwy klucz). Brak decyzji właściciela (D-309/310 do weta). Start rola 08 p3 (M2-012 kod, M2-013 klucz+test, M2-014 ZgodaPowiadomien).
- 14:26 Rola 08 p3: bcf5ac2f (M2-012), 7ba9198a (M2-013), 4fa0359b (M2-014); sprawdz-raport OK; verify 6517 wg roli. Przegląd ścieżki danych + drugi przegląd przekładu M2-012 w toku. Moje D partii 3 startują w drzewie.
- 14:49 M2-012: przegląd brak P0/P1, P2 → ede75863 (verify 6527). M2-012/013/014 naprawione-do-weryfikacji. 016: f38f9e63 (kopia auto bez ciszy, E2E 06, PH-15), verify 6524; przegląd ścieżki wrażliwej + przekładu w toku.
- 14:49 017: blokada (zrzuty wymagają buildu kandydata i urządzenia/narzędzia; test skrótu podpisów razem z nowymi obrazami).
- 14:58 016: przegląd ścieżki wrażliwej brak P0/P1, P3 + przekład → 5589c91e, verify 6530; status naprawione-do-weryfikacji (E2E 06 na symulatorze: krok przed buildem). 060: 9174cd66, verify 6529, status naprawione-do-weryfikacji.
- 15:02 069: cd6a097e — nr() w testach własnościowych; TDD; verify 6533. Status naprawione-do-weryfikacji.
- 16:19 070: 6ed7109e (testy z ID BR, kontrola „bez kodu” z polem brak), 071: 221318bf (mutanty M2 i M8 zabite); verify kod 0 (6565). Statusy naprawione-do-weryfikacji. Znaleziska 070-N1…N5 (N1: 15 receptur drożdżowych bez planu wbrew BR-HARMO-001). Decyzje właściciela: N1 monetyzacja → PÓŹNIEJ; E2E teraz; 072 i 077 zgoda; 064 — prośba o listę „co jeszcze dobudować”.
- 16:30 077: 86efd997 (pages.yml usunięty, zgoda), 072: 40c4a011 (tytuły z dopiskiem, zgoda); verify kod 0. E2E iOS uruchomione ręcznie na p3 @221318bf (zgoda właściciela).
- 16:37 064: decyzja właściciela D-312 (97 h; dobudować 070-N2, 070-N5, 08-p3-N1 w partii 3; 070-N1 → ER zawężające BR-HARMO-001 + backlog 1.0.1). Status 064 naprawione-do-weryfikacji.
- 16:40 073: 1590999f — korpus regresji; TDD; verify 6570.
- 16:44 075: 550fc6b1 — niezależne kroki E2E i zrzuty; TDD; verify 6578. Działanie na macOS: następny przebieg E2E.
- 16:45 075 zrobione. Rola 08 p3b (D-312: 070-N5, 08-p3-N1, 070-N2) w drzewie. Przygotowane polecenia: 01-odkrywanie-p3 (ER BR-HARMO-001 wg D-312, BR F-82/F-83, ZM-29), 03-zakres-p3b (059 + N-2 + BR-DANE-005 + D-312), 10/11/07-p3. E2E run 99 w toku.
- 17:05 Rola 08 p3b: cfc4337b (070-N5), 339ecf48 (08-p3-N1), 9377bc95 (070-N2); verify 6591 kod 0 wg roli; sprawdz-raport OK. Start rola 01 p3.
- 17:28 Rola 01 p3: a2543cbe, 5584dd42, 5cfe8160, 5aa43faf (ER-83…88); verify 6591 kod 0 wg roli. Start rola 03 p3b (059).
- 17:44 059: rola 03 p3b, zakres.mjs kod 0, verify 6610 kod 0 wg roli; status naprawione-do-weryfikacji. Decyzja 98 h do zebrania.
- 17:44 066: E2E iOS run 99 (42653620839) na 221318bf — success (pl_PL, en_US, kontrola negatywna, Basic; w tym nowy scenariusz 06 koniec wypieku). Status naprawione-do-weryfikacji; przed buildem ponowny przebieg na SHA kandydata (DEC-18). Start rola 10 p3.
- 17:52 Punkt wznowienia zapisany (punkt-wznowienia-M2-2026-11-09.md); rola 10 p3 w toku w drzewie.

## Czekające zgody i kroki właściciela
- brak (partia 1 w toku)
