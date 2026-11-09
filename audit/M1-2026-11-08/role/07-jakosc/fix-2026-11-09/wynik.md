# Rola 07 Jakość — fix 2026-11-09 (partia 3 M2): 07-jakosc-004 + przekazania 07-przek-1…4

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3` (baza 991586dd, wypchnięta do 6a3d76ae). Tryb nocny D-289: STOP-y rozstrzygnięte według rekomendacji, oznaczone „do weta (D-289)”; numer decyzji nada M2.

## E0: środowisko i klasyfikacja

| Sprawdzenie | Wynik |
|---|---|
| System, Node, git | Linux 6.18, Node v22.23.4; drzewo czyste na 991586dd |
| GitHub | `gh api` (REST) działa przez proxy; GraphQL zablokowany (403); push na gałąź roboczą działa |
| Repo | `lkarwowski494/piekarz` (publiczne wg wcześniejszych ustaleń; `gh repo view` niedostępne — GraphQL) |
| Symulator iOS | brak (Linux): E2E i build TestFlight nieuruchamiane; testflight.yml zakazany w tym przebiegu |
| Stan E2E (`gh api …/e2e-ios.yml/runs`, odczyt 2026-11-09 19:32 UTC) | #96 na 2ef8870a (master) failure; #95 na 0e5fa7ef success; #99 na 221318bf (ta gałąź) success |

| ID | Rodzaj | Rozstrzygnięcie |
|---|---|---|
| M1-audytor-generalny-068 / 07-jakosc-004 | P | DEC-18 → D-286 wybór (a): „testflight.yml wymaga zielonego E2E na tym samym SHA” (`docs/decyzje.md:1679`) — wdrożone |
| 07-przek-1 (ER-83, BR-HARMO-001, D-312) | D (luka w testach) | testy z ID, wpis częściowy usunięty |
| 07-przek-2 (ER-88, BR-ETAP-001, 08-p3b-N3) | D (luka w testach) | test z ID, wpis częściowy usunięty |
| 07-przek-3 (03-p3b-N-3) | D | nazwa testu bez ID BR + trwała kontrola |
| 07-przek-4 (08-p3b-N1) | D | testID alertu zimnej wody |

Przeczytane źródła (rejestr, nie pamięć): D-131 (`docs/decyzje.md:704`, „dopiero z SHA z zielonym E2E i (po 002) zieloną pętlą stref”), D-272 (`docs/decyzje.md:1585`, „Czerwony E2E → poprawka, nowy E2E, bez buildu do zielonego”), D-276 pkt 2 (wyjątek: commit różni się od sprawdzonego tylko testami i dokumentami), D-286 (DEC-18), D-289, D-314; `docs/brd/wymagania-wypiek.md` (BR-HARMO-001, BR-ETAP-001), `docs/brd/errata.md` ER-83, ER-88; rejestr roli 06 `docs/tresci/rejestr.json`: ZYT-DRO-002 (Koistinen i in., Sci. Rep. 2018, Tabela 3, odczyt rejestru 2026-11-03), ZYT-ETA-005 (Stępniewska i in., Foods 2019, „until the dough surface reached the top of the tin”), DRO-WER-SP-001.

## E1/E2: dowody per ID

### M1-audytor-generalny-068 (07-jakosc-004) — commit fa679f03
- Zmiana: nowe zadanie `e2e-sha` w `.github/workflows/testflight.yml:62` (ubuntu, 5 min, `permissions: contents: read, actions: read` — linia 68, bez sekretów i bez środowiska release), `gh api …/actions/workflows/e2e-ios.yml/runs?status=completed&per_page=100` i `node scripts/ci/e2e-na-sha.mjs` (`.github/workflows/testflight.yml:79`); `build` ma `needs: [tz-matrix, e2e-sha]` (`.github/workflows/testflight.yml:83`). Środowisko `release` zadania build bez zmian (test 082 zielony).
- Reguła skryptu `scripts/ci/e2e-na-sha.mjs`: decyduje najbliższy SHA (kandydat albo przodek) z zakończonym przebiegiem E2E, przy czym przodek liczy się tylko, gdy `git diff --no-renames` przodek..kandydat nie dotyka żadnej ścieżki z `on.push.paths` e2e-ios.yml (ta sama lista, która uruchamia E2E; czytana z pliku, nieobsługiwany wzorzec = błąd). Kod 0 tylko przy przebiegu `success` na tym SHA (ponowienie po awarii maszyny, D-131, dozwolone).
- Test: `tests/testflight-e2e-sha-068.test.ts` (17): kontrakt workflowu (4) + zachowanie na repo git w katalogu tymczasowym (13: czerwony na SHA mimo zielonego przodka = przypadek 1023, zielony, ponowienie, brak/w toku/anulowany, przodek z różnicą tylko w docs/tests/workflow, przodek z różnicą w src/, app/, .maestro/, app.json, package-lock.json, e2e-ios.yml, SHA spoza historii, czerwony bliższy przodek, zły wzorzec).
- Przed: 7 czerwonych / 10 zielonych (`dowody/068-przed.txt`; zadania brak, skryptu brak). Po: 17/17. Mutanty (worktree w scratchpadzie): 5/5 zabitych (`dowody/068-mutanty.txt`).
- Prawdziwe przebiegi (`dowody/068-prawdziwe-przebiegi.txt`): 2ef8870a (build 1023) → kod 1 „#96 (failure)”; 0e5fa7ef → kod 0 (#95); HEAD tej gałęzi 991586dd → kod 1 (zielony #99 na 221318bf nie obowiązuje: różnica w `.github/workflows/e2e-ios.yml` i `.maestro/`).

### 07-przek-3 (03-p3b-N-3) — commit 83b8f333
- Nazwa testu w `tests/kontrakt-zm28-058.test.ts` bez ID BR (asercje bez zmian). Trwała kontrola: `tests/br-bez-testu.test.ts` „pełny wyjątek nie ma testu z ID w nazwie (wyjatkiZTestem puste; 03-p3b-N-3)” — przed czerwony (`["BR-KAL-012"]`), po zielony.
- Wyjście `node scripts/br-bez-testu.mjs` przed/po (`dowody/przek3-przed.txt`, `dowody/przek3-po.txt`): 80 → 79 BR z testem, BR-KAL-012 z „uwaga: … pełny wyjątek i test” → „wyjątek … PÓŹNIEJ”; BR-KAL-001 i BR-ETAP-006 nadal z testami w `src/`.
- Do weta (D-289): wybrałem zmianę nazwy (opcja pierwsza z przekazania) zamiast wykluczenia `tests/kontrakt-*` w skrypcie; powód: mniejsza zmiana narzędzia, a test „wyjatkiZTestem puste” łapie każdy przyszły fałszywy test pełnego wyjątku.

### 07-przek-4 (08-p3b-N1) — commit b42394c3
- `src/components/calculator/accordion/AccordionDdtSection.tsx:66`: testID `ddt-too-cold-warning` przy statusie `requires_ice`, `ddt-too-hot-warning` przy gorącej wodzie; nowy prop `waterTempStatus`. `app/(tabs)/receptury/receptura.tsx` przekazuje `ddtResult.status` i `warningMessagePl` wprost (jest tylko przy statusie innym niż normal — `src/core/domain-rules.ts`), bo plik miał 11 B zapasu do 20 480 B (po zmianie 20 456 B). Tekst, styl i rola alertu bez zmian.
- Testy: `src/__tests__/calculator-cold-water-warning-08p3n1.test.tsx` (szuka `ddt-too-cold-warning`, brak `ddt-too-hot-warning`) — przed 2 czerwone (`dowody/przek4-przed.txt`), po zielone; `calculator-thermal-warning.test.tsx` — brak `ddt-too-cold-warning` przy gorącej wodzie (`dowody/przek4-po.txt`). grep `.maestro/`, `tests/`: brak innych użyć.
- Wyjątek nazwany (do weta, D-289): rola 07 zmieniła kod aplikacji (uchwyt testID) z przekazania M2 zamiast przekazać rolę 08.

### 07-przek-1 (ER-83, BR-HARMO-001, D-312) — commit cf6f5ded
- `src/__tests__/br-harmo-001-stan-1-0-er83.test.tsx` (5): „Receptura drożdżowa z katalogu w 1.0” (chałka, bagietka, pizza: „Ułóż plan” nieaktywne, powód dosłownie z BRD, plan się nie otwiera), „Wersja drożdżowa bez podziału czasu na etapy” (orkisz na drożdżach: powód D-257; kontrola: na zakwasie aktywne), „Plan dla wersji drożdżowej” żyto 100% (kroki bez wyrabiania i odgazowania, czasy z ZYT-DRO-002: 60/60/45 min, koniec o godzinie „gotowe”).
- Zielony od razu, bramka: brak testu z ID. Mutanty w kopii: 4/4 zabite (`dowody/przek1-mutanty.txt`).
- `scripts/br-wyjatki.json`: wpis częściowy BR-HARMO-001 usunięty (wszystkie 6 scenariuszy mają testy z ID); `br-bez-testu` kod 0 (`dowody/przek1-br-przed-po.txt`).

### 07-przek-2 (ER-88, BR-ETAP-001, 08-p3b-N3) — commit 6a3d76ae
- `src/__tests__/br-etap-001-zyto-er88.test.tsx` (2): żyto 100% na drożdżach — pierwsze rośnięcie „Czasy są wskazówką…”, drugie „Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.”, na obu bez tekstu o palcu i bez wejścia `stolnica-poke-test-btn` (flaga wejść późniejszych włączona w teście); kontrola: graham ma test palca i wejście.
- Zielony od razu, bramka: brak testu z ID. Mutanty: 4/4 zabite (`dowody/przek2-mutanty.txt`).
- `scripts/br-wyjatki.json`: wpis częściowy BR-ETAP-001 usunięty; `br-bez-testu` kod 0 (`dowody/przek2-br-przed-po.txt`).

## Pełny zestaw (`git add`, potem `npm run verify`, przed każdym commitem)

| Commit | verify | Testy |
|---|---|---|
| fa679f03 | kod 0 | 647 zestawów, 6774 |
| 83b8f333 | kod 0 | 647, 6775 |
| b42394c3 | kod 0 | 647, 6775 |
| cf6f5ded | kod 0 (dwa przebiegi: przed i po poprawce komentarza) | 648, 6780 |
| 6a3d76ae | kod 0 | 649, 6782 |

Lint: 2 ostrzeżenia `react-hooks/exhaustive-deps` istniejące przed zmianami (0 błędów). `matrix:update`: 1684/1684, bez zmian w `docs/22-macierz-testow.md`. Nowych tekstów interfejsu brak: przekład, `i18n:kontekst` i akceptacja roli 04 nie dotyczą.

## Nieodbyte i otwarte
- Przegląd ścieżki wrażliwej (`.github/workflows/`, commit fa679f03): nieodbyty (brak narzędzia subagentów); polecenie: `przeglad-sciezki-wrazliwej-polecenie.md` — uruchamia M2.
- Bramka `e2e-sha` nie przeszła jeszcze w CI (zasada roli 8): pierwszy przebieg to pierwszy `testflight.yml` właściciela; do tego czasu sprawdzone lokalnie na prawdziwej odpowiedzi API.
- Status „zweryfikowane” nadaje tryb reaudit.

## Nowe znaleziska (do decyzji M2, bez naprawy)
- N1 (P2, JAK-16): filtr E2E zawiera `src/**`, więc same testy w `src/__tests__` unieważniają zielony E2E przodka — wyjątek D-276 („różni się tylko testami”) obejmuje bramką tylko testy poza `src/` (`tests/`, `docs/`). Do weta (D-289): reguła bramki = filtr `paths` e2e-ios.yml (słowniki w `src/lib/i18n-*` też wymagają nowego E2E), bo ta sama lista decyduje, czy E2E w ogóle biegnie; luźniejsza reguła „docs i słowniki” z raportu źródłowego przepuściłaby zmiany tekstów, które sprawdzają scenariusze Maestro. Skutek: po scaleniu partii z testami w `src/` przed buildem potrzebny nowy E2E (macOS, ok. 1–2 h).
- N2 (P2): HEAD tej gałęzi (991586dd i dalej) nie ma obowiązującego zielonego E2E — przed scaleniem do master i buildem potrzebny E2E na scalonym SHA.
- N3 (P2): `docs/brd/errata.md` ER-83 i ER-88 mają status „otwarte (07…)” — część roli 07 zamknięta tymi commitami; aktualizacja errat należy do roli 01.
- N4 (teoretyczny): bramka czyta 100 ostatnich zakończonych przebiegów E2E; starszy zielony przodek poza tą stroną daje błąd (bezpieczny kierunek).

## Przekazania
- Do 08: brak (kod aplikacji tylko w 07-przek-4, z przekazania M2).
- Do 01: ER-83 i ER-88 — część roli 07 wykonana (cf6f5ded, 6a3d76ae).
- Kroki właściciela: przy następnym buildzie `testflight.yml` uruchamiać dopiero po zakończonym zielonym `e2e-ios.yml` na tym samym SHA master (zadanie `e2e-sha` inaczej zatrzyma build przed akceptacją środowiska release); scalenie gałęzi do master — zgoda właściciela.

## Kontrola raportu
Wynik `node narzedzia/sprawdz-raport.mjs wynik.md /home/user/piekarz`: wklejony niżej.

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone
kod 0
```
