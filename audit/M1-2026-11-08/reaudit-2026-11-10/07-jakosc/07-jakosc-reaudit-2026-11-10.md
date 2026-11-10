# Reaudyt: Jakość (strategia testów, gotowość wydania) — Piekarz — 2026-11-10 (pętla 2)
Commit: 1c723632 · Tryb: reaudit · Baza: ea249c9c · Gałąź: redesign/piekarz-2026-10-22 (kopia robocza WT, HEAD odłączony) · Środowisko: Linux x86_64, Node 22.23.4, npm 10.9.9, 4 rdzenie, 16 GB; Jest i wszystkie bramki `npm run verify` uruchomione lokalnie; iOS E2E i nightly tylko odczytem z GitHub Actions (MCP GitHub, repo lkarwowski494/piekarz), niczego nie uruchamiano ponownie. Grupa G4, wyjątek nazwany KO-013 (kilka ról w jednym kontekście).

## Werdykt: ZABLOKOWANE
Commit: 1c723632 · Kandydat do wydania: ten sam SHA (build TestFlight powstanie po scaleniu do `master`; SHA scalenia wymaga własnego E2E, patrz „Nie sprawdzono”) · Rozstrzygnął warunek: „otwarte P0 albo P1 raportów innych ról” — wyłącznie M1-audytor-generalny-017 (P1, rola 10, zrzuty sklepu; krok właściciela, dotyczy zgłoszenia do App Store, nie buildu TestFlight) · Próg projektu: domyślny (`CLAUDE.md` nie ustala progu wydania).

Po stronie tej roli nie ma otwartego P0 ani P1: pełny zestaw i typecheck zielone na 1c723632, iOS E2E zielone na tym samym SHA. Bez 017 werdykt brzmiałby „GOTOWE Z ZASTRZEŻENIAMI” (nightly bez wyniku Strykera, E2E na SHA scalenia, lista telefonu).

## Komendy (każda osobno)
| Komenda | Kod wyjścia | Wynik (liczby) | Uwagi |
|---|---|---|---|
| `npm run verify` (WT, jeden proces naraz; `pgrep` przed startem: brak expo, chromium i jest innych grup) | 0 | 207 s; łańcuch `&&`, więc kod 0 = każda bramka 0 | `dowody/10-npm-run-verify.txt` |
| ↳ `tsc --noEmit` | 0 | bez błędów | tamże |
| ↳ `check:i18n` | 0 | 923 teksty w kodzie, 2220 w słowniku EN, 33 języki przekładu, błędy 0, uwagi 155 | tamże |
| ↳ `check:licenses`, `check:licencje` | 0 | 30 zależności dozwolone; 559 pakietów zgodnych z blokadą | tamże |
| ↳ `check:size` | 0 | 1499 plików, przekroczeń 0 | tamże |
| ↳ `eslint app src` | 0 | 0 błędów, 2 ostrzeżenia (`src/hooks/usePendingRecipeLoader.ts`, zależności `useEffect`; plik bez zmian od bazy) | tamże |
| ↳ `verify:native` | 0 | 20 z 20 niezmienników | tamże |
| ↳ `verify:matrix` (bez zapisu) | 0 | 1685 z 1685 elementów (100%), `docs/22-macierz-testow.md` aktualny | tamże |
| ↳ `jest` (pełny zestaw) | 0 | 654 zestawy, 6831 testów, 0 porażek, 0 migawek | tamże |
| `npx jest tests/quality-gates.test.ts tests/e2e-ios-workflow.test.ts tests/quality-declarations.test.ts --maxWorkers=2 --ci` (sonda, kod 1c723632) | 0 | 50 testów | `dowody/07-sonda-kontrakt-nightly.txt` |
| to samo `tests/quality-gates.test.ts` z `nightly.yml` i `stryker.config.json` sprzed c0614ee9 | 1 | 1 porażka z 18: test kontraktu 067 | tamże |
| 7 plików testów partii 4/4b na kodzie produkcyjnym z ea249c9c (sonda) | 1 | 21 porażek z 43, wszystkie na asercjach | `dowody/05-sonda-testy-na-kodzie-sprzed.txt` |

## Podsumowanie
Oba ID tej roli sprawdzone u źródła. E2E #103 (run 42725323063) jest zielone na 1c723632 w próbie 2: pl 6/6, en 6/6, kontrola negatywna padła zgodnie z założeniem, Basic 5/5. Nightly nadal nie ma zielonego przebiegu ani wyniku Strykera: harmonogram biega tylko z `master`, a naprawa c0614ee9 nie jest na `master`. Lokalnie pełne `npm run verify` kończy się kodem 0. Jedno nowe znalezisko P3 (test układu 005 opiera się na rachunku z małym zapasem).

| ID | Wynik | Dowód |
|---|---|---|
| 07-jakosc-001 | zweryfikowane | M1-audytor-generalny-066. Run 42725323063 (#103, `e2e-ios.yml`, workflow_dispatch): head_sha 1c7236327901e7b693d1934775ecd8bebcd8b865, run_attempt 2, conclusion success; job 129562014399: wszystkie 16 kroków success; log: pl 6/6, en 6/6, kontrola negatywna 1/1 Failed (oczekiwane), Basic 5/5 — `dowody/03-e2e-run-42725323063.txt`. Szczegóły niżej. |
| 07-jakosc-002 | nadal otwarte (czeka na scalenie) | M1-audytor-generalny-067. Ostatni nightly #26 (run 42592498036, `master` 2ef8870a, 2026-11-09): cancelled, krok Strykera przerwany po 117 min; brak zielonego przebiegu od #6 (2026-10-20); naprawa c0614ee9 nie jest przodkiem 2ef8870a — `dowody/04-nightly-przebiegi.txt`. Szczegóły niżej. |
| 07-jakosc-701 | nowe, P3 (klasa: jakość testów) | `dowody/06-sonda-zapas-ukladu-005.txt`; sekcja Znaleziska. |

Liczby: zweryfikowane 1, nadal otwarte 1, regresja 0, istniało wcześniej 0; nowe znaleziska 1 (P3).

### 07-jakosc-001 / M1-066 — szczegóły weryfikacji
- Tożsamość: `actions_get` → run_number 103, head_branch `naprawy/M2-koordynator-napraw-2026-11-09-p4`, head_sha równy 1c723632 (ten sam commit co `redesign/piekarz-2026-10-22`; w logu obu prób checkout `1c7236327901e7b693d1934775ecd8bebcd8b865`).
- Próba 2 (job 129562014399, macos-26, 01:19–02:16 UTC): pl_PL 6/6 Flows Passed (7 min 59 s), en_US 6/6 (5 min 40 s), kontrola negatywna `brak-elementu` Failed i komunikat kroku o oczekiwanej porażce, Basic 5/5 (2 min 12 s). Liczby zgodne z katalogami: 6 plików w `.maestro/e2e`, 5 w `.maestro/e2e-basic`, 1 w `.maestro/kontrola-negatywna`.
- Próba 1 (job 129529738606): krok pl_PL failure po 10 min bez żadnego przepływu, log l. 2135: „iOS driver not ready in time” (limit `.github/workflows/e2e-ios.yml:55`); kolejne kroki mimo to wykonane: en_US 6/6, kontrola negatywna padła, Basic 5/5. Druga część tytułu 066 (po porażce pominięte en_US, kontrola negatywna i Basic) już nie występuje: warunki `(success() || failure())` w `.github/workflows/e2e-ios.yml:141`.
- Klasyfikacja porażki próby 1: maszyna (awaria przed pierwszym scenariuszem, 0 wyników przepływów). Jedno ręczne powtórzenie tego samego runu na tym samym SHA jest zgodne z polityką niestabilnych testów; w workflow nie ma automatycznych ponowień (`dowody/11-probka-regresji-ci.txt`).
- Zastrzeżenie (znane, nie zgłaszam ponownie): start sterownika XCUITest przekroczył limit w #103 próba 1, a #101 na ea249c9c było czerwone — patrz M2-p4-N10 i M2-p4-N8 (`nowe-znaleziska-M2.md`); właściciel rozstrzygnął w KO-011 (N10 tak, N8 nie); run #104 na gałęzi n10 (b7c77c37) był w toku w chwili odczytu i nie dotyczy badanego SHA.
- Zakres dowodu: E2E biegnie na jednym symulatorze (pierwszy dostępny iPhone, w logu iPhone 17 Pro), w pl_PL i en_US.

### 07-jakosc-002 / M1-067 — szczegóły weryfikacji
- `actions_list` (nightly.yml): 26 przebiegów; ostatnie 8 to `schedule` na `master`: 7 cancelled, 1 failure (#25). Filtr gałęzi `redesign/piekarz-2026-10-22`: 0 przebiegów; `workflow_dispatch`: 3 przebiegi, wszystkie z 2026-10-20.
- #26: fuzzing success, „Full Quality Gate (npm run verify)” success (2 min 33 s), „Stryker Mutation Verification” cancelled 09:22–11:19 UTC — limit `.github/workflows/nightly.yml:23`.
- Naprawa c0614ee9 (perTest, tryb przyrostowy, cache) jest w 1c723632 (`stryker.config.json:23`, `stryker.config.json:24`), ale nie na `master` (`git merge-base --is-ancestor c0614ee9 2ef8870a` → kod 1). Harmonogram `.github/workflows/nightly.yml:5` uruchamia workflow tylko z gałęzi domyślnej, więc żaden przebieg nie sprawdził jeszcze naprawy.
- Test kontraktu istnieje i potrafi paść: `tests/quality-gates.test.ts:58` zielony na 1c723632, czerwony na konfiguracji sprzed c0614ee9 (`dowody/07-sonda-kontrakt-nightly.txt`). Test akceptacyjny z raportu 2026-11-08 (nightly zielony na master z wynikiem Strykera ≥ progu) niespełniony.
- Krok: po scaleniu do `master` pierwszy nightly; sprawdzić czas kroku Strykera i wynik ≥ 60. Powiązane znane: M1-audytor-generalny-098, M2-p3-N12.

## Wykonanie decyzji koordynatora KO-008, KO-009, KO-010
| Pozycja | Wynik | Dowód |
|---|---|---|
| KO-008 (2): poprawka M2-p4-N8 (ponowne stuknięcie w E2E) nie wdrożona | wykonane | `git diff --stat ea249c9c..1c723632 -- .github .maestro`: 1 plik, 5 dodanych i 1 usunięta linia, tylko `.maestro/e2e/03-prowadzenie-widok-skupiony.yaml` (dodana asercja `step-warning` i komentarz); `.github` bez zmian; żadnego ponownego stuknięcia — `dowody/01-diff-github-maestro.txt` |
| KO-008 (1): 005 przy 320×568 w partii 4b przez rolę 04, D-319 | wykonane | commit d5a6dc4c (fix prowadzenia, niski ekran) i 1c723632 (D-319 w `docs/decyzje.md:1847`) w `git log ea249c9c..1c723632` — `dowody/01-diff-github-maestro.txt`; zasadności układu nie oceniam (rola 04) |
| KO-009: E2E #103 na head p4 1c723632, anuluje #102 | wykonane | #102 (run 42720983459, 292870c0) conclusion cancelled, zaktualizowany 00:04:18 UTC; #103 utworzony 00:03:25 UTC na 1c723632; `.github/workflows/e2e-ios.yml:50` |
| KO-010: ponowienie runu 42725323063 na tym samym SHA bez zmian w kodzie | wykonane | ten sam run_id, run_attempt 2, head_sha bez zmian; próba 1 failure (sterownik), próba 2 success — `dowody/03-e2e-run-42725323063.txt` |

## Testy dodane w partii 4/4b
Zakres: `git diff --stat ea249c9c..1c723632 -- tests src/__tests__ 'src/**/__tests__'` → 10 plików, 715 dodanych linii (`dowody/02-diff-testy.txt`). Wszystkie przechodzą na 1c723632 (pełny zestaw), a 21 testów pada na asercjach na kodzie produkcyjnym z ea249c9c (`dowody/05-sonda-testy-na-kodzie-sprzed.txt`).

| Plik | Co sprawdza | Ocena |
|---|---|---|
| `src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx` (087) | prawdziwy import pakietu przez ekran `ImportZPlikuArkusz` do bazy SQLite w Node; porównuje wiersze `bake_sessions` z pakietem pole po polu | zachowanie i skutek w danych; atrapa tylko `Alert`; czerwony na kodzie sprzed |
| `tests/brioszka-bez-planu-089.test.ts` | `powodBezPlanu` na prawdziwym katalogu; tekst PL i EN z `docs/tresci`; lista 10 receptur z planem | zachowanie; wyrocznia z pliku treści i decyzji D-317 |
| `tests/brioszka-bez-eksportu-089.test.tsx` | render ekranu planu: brak przycisków eksportu dla brioszki, obecne dla receptury z planem (kontrola pozytywna) | zachowanie; atrapy tylko nawigacji i wcięć |
| `tests/pieczenie-bez-cudzych-liczb-088.test.ts` | kroki pieczenia z prawdziwego harmonogramu; liczby °C i min równe danym receptury albo tekst dosłownie z pliku treści | zachowanie; znane ograniczenie M2-p4-N7, nie zgłaszam ponownie |
| `src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx` + `tests/helpers/uklad-ekranu.ts` | render ekranu prowadzenia i rachunek układu z tokenów i stylów (bez pomiaru) | pada na kodzie sprzed (907 wobec 684 pt); deklaracja uczciwa („rachunek, nie pomiar”), ale mały zapas — 07-jakosc-701 |
| zmiany w 4 istniejących testach (`czapka-ekranow-p7`, `pas-plan-prowadzenie-p4b`, `pas-prowadzenia-005`, `kontrakt-receptury-plan-061`) | dopasowanie do D-317/D-318: Spirala pod kartą kroku; F-26 liczone z katalogu | asercje zaostrzone albo przeniesione, żadna nie usunięta bez zastąpienia |

- `test.skip`, `it.skip`, `.only`, `@ts-ignore`, `@ts-expect-error`, `istanbul ignore`, `eslint-disable`: 0 dodanych linii w `git diff ea249c9c..1c723632 -- tests src app`; w całym `tests`, `src`, `app` jedyne trafienie wzorca to `process.exit(` w `tests/wzrost-hipotezy.test.ts` (fałszywe).
- Macierz AST: `verify:matrix` kod 0, 1685/1685.

## Twierdzenia projektu vs stan
| Twierdzenie (plik:linia) | Jak sprawdzone | Potwierdzone / obalone |
|---|---|---|
| Prawdziwe E2E z kontrolą negatywną (`CLAUDE.md:69`) | run 42725323063 próba 2 | potwierdzone na 1c723632 |
| `npm run verify` jako pełna bramka (`CLAUDE.md:42`) | uruchomione, kod 0 | potwierdzone |
| 26 receptur bazowych, 11 z planem (`README.md:45`) | katalog na 1c723632: 10 z planem (D-317, `docs/decyzje.md:1833`) | obalone — patrz 10-wydanie-701 (ten sam mechanizm, jedno ID) |
| `CLAUDE.md` poniżej 200 linii | `wc -l` → 69 | potwierdzone (`dowody/11-probka-regresji-ci.txt`) |

## Próbka regresji
- Zmienione pliki w obszarze roli: `.maestro` (1 plik, asercja zaostrzona, bez `scrollUntilVisible`), `.github` (bez zmian), testy (tabela wyżej), `docs/22-macierz-testow.md` (aktualny). Nowy problem: tylko 07-jakosc-701.
- JAK-10 (spoza zmienionych plików): brak `pull_request_target` i `workflow_run`; wszystkie workflowy mają `permissions: contents: read`; brak akcji spoza `actions/*` bez pełnego SHA; dane zdarzenia przez `env` — ok (`dowody/11-probka-regresji-ci.txt`).
- JAK-09: brak `continue-on-error`, `--passWithNoTests`, `--forceExit`; jedyne `|| true` przy odinstalowaniu aplikacji z symulatora (`.github/workflows/e2e-ios.yml:190`), nie przy testach — ok.
- JAK-15: `CLAUDE.md` 69 linii; `verify:matrix` i `check:licencje` w trybie sprawdzania bez zapisu (stan końcowy WT pusty) — ok; README patrz wyżej.

## Nie sprawdzono
| Co | Dlaczego (środowisko) | Krok i kto | Wpływ na werdykt |
|---|---|---|---|
| Nightly ze Strykerem po naprawie c0614ee9 | biega tylko z `master`; uruchamiania zakazano | koordynator/właściciel: scalenie, potem odczyt pierwszego nightly | 07-jakosc-002 otwarte (P2 w planie, nie blokuje) |
| E2E na SHA scalenia do `master` | scalenie jeszcze nie istnieje | koordynator: `e2e-ios.yml` na SHA scalenia; bramka `e2e-sha` w `testflight.yml` | warunek wysyłki (JAK-16) |
| Układ prowadzenia 320×568 i języki poza pl/en na symulatorze | Linux bez symulatora; E2E tylko iPhone 17 Pro | rola 04 / właściciel: zrzut na iPhone SE lub „Powiększenie ekranu” | 07-jakosc-701 (P3) |
| Lista „tylko telefon”, aktualizacja z poprzedniej wersji z danymi na buildzie kandydata | brak buildu kandydata | właściciel po buildzie TestFlight | warunek wysyłki |
| Pełny zestaw 3 razy i w losowej kolejności (JAK-05) | limit zasobów grupy; reaudyt z zasadą próbki | — | brak; pełny zestaw 1 raz zielony |

## Otwarte P0/P1 innych ról z tego commitu
| ID | Rola | Tytuł | Status |
|---|---|---|---|
| M1-audytor-generalny-017 (10-wydanie-001) | 10 | Zrzuty do wysyłki oznaczają funkcje Basic jako płatne i pokazują interfejs sprzed M3 | zatwierdzone, nienaprawione; krok właściciela (zrzuty z buildu kandydata) — patrz raport 10-wydanie z tego reaudytu |

Raportów pozostałych ról z pętli 2 nie czytałem (niezależność D-015); ich otwarte P0/P1 dolicza M1.

## Lista wydania (moduł wydanie)
1. Jeden commit: verify lokalnie i E2E #103 na 1c723632 — spełnione dla gałęzi; SHA scalenia do `master` wymaga własnego E2E.
2. Wersja i build: `app.json` bez zmian od bazy (1.0.0); numer buildu nadaje `testflight.yml` — bez zmian w tej pętli.
3. Pełny zestaw, typecheck, lint: kod 0 (tabela komend).
4. E2E głównych przepływów: 6 scenariuszy pl i en, 5 Basic, kontrola negatywna — zielone na 1c723632.
5. Aktualizacja z poprzedniej wersji z danymi: nie sprawdzono (krok właściciela).
6. Lista „tylko telefon”: nie sprawdzono (krok właściciela).
7. Zakres zmian od bazy: 9 commitów (087, 088, 089, 005, D-317…D-319); dotknięte ryzyka mają testy, które przechodzą.
8. Raporty innych ról: 017 otwarte (P1).
9. Plan cofnięcia: bez zmian w tej pętli, nie oceniano ponownie.
10. Zasady projektu: zamrożenie zakresu (D-288) — zmiany pętli mieszczą się w zatwierdzonych ID.

## Znaleziska (szczegóły)

### 07-jakosc-701 · Test „pierwszego ekranu” 005 opiera wynik dla 320×568 i tekstu EN na rachunku z zapasem mniejszym niż jeden wiersz tekstu
- Pozycja listy kontrolnej: JAK-13
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: jakość testów)
- Realność: brzegowy · Pewność: średnia
- Rodzaj: D
- Dowód: `dowody/06-sonda-zapas-ukladu-005.txt`: dół ostrzeżenia wobec góry „Zrobione” — 393×852 pl 654/684, en 676/684; 320×568 pl 482/512, en 502/512 (zapas 8–10 pt dla en, wiersz treści ma ok. 22 pt). Model: `tests/helpers/uklad-ekranu.ts:15` „const ZNAK_TRESC = 0.5;”
- Mechanizm: pomocnik liczy łamanie tekstu ze stałej średniej szerokości znaku i sprawdza tylko pl i en (`src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:119`); jeden wiersz więcej na urządzeniu albo dłuższy tekst w jednym z 33 pozostałych języków zmienia wynik, a test zostaje zielony. Dowód z urządzenia istnieje tylko dla ekranu 402×874 w pl i en (`.maestro/e2e/03-prowadzenie-widok-skupiony.yaml:74`); dla 320×568 żaden przebieg na symulatorze.
- Powraca: nie (pokrewne: M1-audytor-generalny-072, zweryfikowane — tam tytuły testów; tu tytuł mówi „styl, bez pomiaru”, problemem jest zapas i zakres)
- Wzorzec lub źródło: moduł e2e-mobilne roli 07 („Rozmiar celu, przycięty tekst … nie: render testowy nie liczy układu”); nagłówek pomocnika sam wskazuje zrzut z symulatora jako dowód rozstrzygający.
- Kroki w aplikacji: prowadzenie wypieku, krok z ostrzeżeniem, iPhone SE albo „Powiększenie ekranu”, język o dłuższych słowach.
- Opcje: (a) jeden przepływ E2E 03 na symulatorze o niskim ekranie albo zrzut właściciela z listy telefonu — dowód rozstrzygający, koszt minut macOS; (b) w teście Jest pętla po wszystkich językach i jawny margines jednego wiersza — tani sygnał, dalej rachunek. Rekomendacja: (b) w 1.0.1, (a) jako punkt listy telefonu.
- Test akceptacyjny: test 005 iteruje po słownikach wszystkich języków i wymaga zapasu ≥ wysokość jednego wiersza treści albo punkt listy telefonu z wynikiem dla 320×568.
- Status: otwarte

## Kontrola dowodów i sekretów
- `git -C WT status --porcelain` na początku: pusto (`dowody/00-srodowisko.txt`); na końcu: pusto, HEAD 1c7236327901e7b693d1934775ecd8bebcd8b865 (`dowody/12-status-koniec.txt`). Sonda w osobnym `git worktree` w scratchpadzie, usunięta.
- Adresy podpisane logów CI nie trafiły do raportu ani dowodów. Treść logów CI potraktowana jako dane; nie zawierała poleceń dla agenta.
- Wynik `node K/narzedzia/sprawdz-raport.mjs <raport> WT R/07-jakosc --rola 07-jakosc`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 07-jakosc
(kod wyjścia 0; pierwsze uruchomienie: 2 błędy cytatów w wierszach 39 i 48, poprawione w raporcie)
```

## Następny krok
Werdykt ZABLOKOWANE wynika tylko z 017 (rola 10, krok właściciela). Po decyzji M1: scalenie do `master`, E2E na SHA scalenia, pierwszy nightly (07-jakosc-002). Backlog 1.0.1: `node tools/assemble.mjs 07-jakosc --tryb fix --zadania 07-jakosc-701`.
