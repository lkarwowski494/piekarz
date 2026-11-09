# Rola 03 (zakres) · tryb fix · M2 partia 3b · 2026-11-09

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3`, od `5aa43faf` do `3e0fa3fa`, wypchnięta. Drzewo czyste. Zadanie M1-audytor-generalny-059 (03-zakres-003) z dodatkami z polecenia: N-2, BR-DANE-005, D-312, przekazania roli 01 (a2543cbe, 5584dd42, 5cfe8160, 5aa43faf).

## E0 · środowisko i plan
- Linux VM, Node v22.23.4, git; push na gałąź roboczą działa; bez macOS i symulatora (zmiany tylko w kontrakcie i testach, nic widocznego w aplikacji, zrzuty nie dotyczą).
- `npm run verify` bez TZ: kod 0 przy każdym commicie (`src/__tests__/dzis-plany-d5.test.tsx` przechodzi o 17:31 UTC; N-1 z poprzedniej sesji nie wystąpił).
- Klasyfikacja: **D** (niespójność kontraktu, ZAK-09). Plan zatwierdzony (D-300, D-302); nowa decyzja tylko przy apetycie (niżej).
- `zakres.mjs --brd docs/brd` przed: kod 1, 12 błędów — F-72 bez BR, BR-DANE-005, BR-UST-004, BR-UST-005, BR-RECP-005, BR-KALK-012, BR-MASZ-001…006 bez decyzji (`dowody/059-zakres-mjs-przed.txt`).

## E1/E2 · commity
| Commit | ID | Test (czerwony przed → zielony po) | Zmiana |
|---|---|---|---|
| 3bebc5ab | 059 (03-zakres-003), BR-DANE-005, przekazania 01 | `tests/kontrakt-slad-059.test.ts`, część „ślad”: 10 z 11 czerwonych (`dowody/059a-przed.txt`) → zielone | BR-MASZ-001…006 w F-72, BR-KALK-012 w F-55, BR-RECP-005 w F-26, BR-DANE-005 w F-33; F-82 (BR-UST-004, 48 źródeł zamiast 26; test liczy z `src/core/zrodla-wiedzy.ts`) i F-83 (BR-UST-005, podłoga „prawo: OG-13”) w tabeli „Zakres”; ranking +0,5 h każda; lista w `tests/kontrakt-zm28-058.test.ts` pusta |
| 211649bf | 059 (model płatności) | część „model płatności”: 4 z 4 czerwone (`dowody/059b-przed.txt`) → zielone | „próba / płatna” w 30 wierszach → Basic / Pro z `docs/monetyzacja.md` (nazwy funkcji z D-116); „Darmowe i płatne” według D-112, D-113, D-116; F-37 (ekran Pro, BR-ZAK-003, -005), F-67 (koniec Pro, bez „tylko historia”), F-35 dowód D-112 |
| 3e0fa3fa | 059, N-2, D-312 | część „apetyt i wynik”: 4 z 4 czerwone (`dowody/059c-przed.txt`) → zielone | „Apetyt 1.0: 97 h (D-312, 2026-11-09)” przy rankingu i w „Główna praca i pętla”; ZM-30 (D-312 pkt 3: plan receptur drożdżowych katalogu → backlog 1.0.1, ER-83, OP-74); F-43 bez „F-71 PÓŹNIEJ”; nowy blok wyniku `zakres.mjs`; „Definicja ukończenia” z dzisiejszym wynikiem |

`npm run verify` po `git add`, kod 0: `dowody/059a-verify.txt`, `dowody/059b-verify.txt`, `dowody/059c-verify.txt` (ostatni: 643 zestawy, 6610 testów).

Test akceptacyjny 03-zakres-003:
- `zakres.mjs --brd`: kod 1 (12 błędów) → **kod 0**, 57 funkcji, 86 BR, 0 błędów, 2 uwagi (`dowody/059-zakres-mjs-po.txt`).
- `grep -n "próba" docs/scope-contract.md`: 30 trafień → **0**.
- BR-RECP-005: test z ID jest (`src/__tests__/br-recp-005-wersja-drozdzowa-070.test.tsx`), wyjątku „bez kodu” nie ma (usunięty w 070); zostaje wpis „czesciowe” dla scenariusza źródła szczebla 4 (znalezisko 070, nie moje).
- Trwała kontrola: `tests/kontrakt-slad-059.test.ts` (każdy F-nn ma BR albo H, BR w jednej funkcji, brak odkładania „do kolumny Wymagania”, liczby ostatniego wyniku równe tabeli, brak „próba” poza historią ZM).

## Decyzja właściciela potrzebna (apetyt: 98 h wobec 97 h)
F-82 i F-83 były przy D-312 „MVP poza tabelą” bez kosztu. Po wpisaniu do tabeli (0,5 h każda [OCENA]: przegląd ekranu na telefonie) suma MVP wynosi 98 h, a skrypt zgłasza F-80 i F-82 poza apetytem 97 h (uwagi, nie błędy). Opcje:
- (a) apetyt 98 h, nic nie wypada — **rekomendacja**: oba ekrany są zbudowane i przetestowane, F-83 to obowiązek licencji (OG-13).
- (b) apetyt 97 h, F-82 i F-83 nazwane jako obowiązek poza apetytem — bez zmiany kodu; uwagi skryptu zostają.
Czas właściciela: jedna decyzja, ok. 1 min. Wpis: rola 03 przy rankingu i w `docs/decyzje.md`.

## Przekazania
- **01:** ER-84 i ER-87 wykonane po stronie kontraktu (F-82, F-83, F-72); ER-83 w ZM-30. Statusy „otwarte (03)” w `docs/brd/errata.md` do zamknięcia przez rolę 01.
- **02:** kolumna WTP opisuje Basic / Pro według „Basic i Pro według funkcji”; klasy WTP-0/1/2 bez zmian. Do sprawdzenia przez 02: F-70 (synchronizacja) nie ma przypisania Basic/Pro, F-82 i F-83 jako „zawsze (ustawienia)”.
- **07:** nowa trwała kontrola `tests/kontrakt-slad-059.test.ts` (D-187 wykonane); znalezisko N-3 niżej.
- **08:** brak zadań kodu.
- **M2:** przegląd ścieżki wrażliwej nie dotyczy (bez zmian kodu, zakupów i danych; zmienione tylko `docs/scope-contract.md` i testy kontraktu). Przekładu nie było (bez nowych tekstów interfejsu).

## Teksty do akceptacji roli 04
Brak (bez zmian tekstów interfejsu).

## Nowe znaleziska
- **N-3 (P2, D):** `node scripts/br-bez-testu.mjs` zgłasza „BR-KAL-012 ma pełny wyjątek i test”: test kontraktu w `tests/kontrakt-zm28-058.test.ts` ma w nazwie „widżet BR-KAL-012 PÓŹNIEJ”, więc skrypt liczy go jako test BR widżetu, którego nie ma. Naprawa: rola 07 (nazwa testu bez ID BR albo wykluczenie testów kontraktu w skrypcie).
- **N-4 (P2, D):** sekcja „Kolejność i przekazanie”, pierwszy punkt, podaje kolejność budowy MVP sprzed rozszerzeń 1.0 (do F-69). Aktualna kolejność jest w bloku wyniku pod tabelą „Ranking”. Do poprawy przez rolę 03 w kolejnym zadaniu.

## Przeczytane źródła
Tylko rejestr projektu, odczyt 2026-11-09: `docs/decyzje.md` (D-112, D-113, D-116, D-123, D-126, D-311, D-312), `docs/monetyzacja.md` („Model”, „Basic i Pro według funkcji”, „Reguły dostępu”), BRD (`docs/brd/wymagania-dane.md`: BR-DANE-005, BR-ZAK-003…005, BR-UST-004, BR-UST-005; `docs/brd/wymagania-liczenie.md`: BR-KALK-012; `docs/brd/wymagania-maszyna.md`; `docs/brd/errata.md`: ER-83, ER-84; `docs/brd/README.md`: OP-74), `scripts/br-wyjatki.json`, `src/core/zrodla-wiedzy.ts` (48 źródeł). Źródeł zewnętrznych nie otwierałem.

## Kontrola dowodów i sekretów
`node sprawdz-raport.mjs wynik-p3b.md /home/user/piekarz .` (skrypt z promptu roli w scratchpadzie): „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”, kod 0.

Korekta: treść commitu 211649bf podaje „było 31” trafień „próba”; poprawnie 30 linii (`git show 3bebc5ab:docs/scope-contract.md | grep -c próba`).
