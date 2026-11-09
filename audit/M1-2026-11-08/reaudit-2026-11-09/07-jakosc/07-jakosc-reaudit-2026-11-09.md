# Reaudyt: Jakość (strategia testów, gotowość wydania) — Piekarz — 2026-11-09
Commit: ea249c9c · Gałąź: `redesign/piekarz-2026-10-22` (HEAD odłączony, ea249c9cc069e911a9ce83beabea39ed7f314616) · Tryb: reaudit, pętla 1, baza 2ef8870a · Grupa E (07-jakosc, 10-wydanie; KO-006) · Środowisko: Linux x86_64, 4 rdzenie, Node 22, Jest, `git worktree` w scratchpadzie, MCP GitHub tylko do odczytu; bez macOS, Xcode, symulatora, telefonu

`git status --porcelain` na początku: pusty.

## Werdykt: ZABLOKOWANE
Commit: ea249c9c · Kandydat do wydania: jeszcze nie ustalony (ea249c9c nie jest na `master`; build TestFlight powstanie ze scalenia) · Rozstrzygnął warunek: „otwarte P0 albo P1” — 07-jakosc-001 (E2E na SHA kandydata: przebieg #101 na ea249c9c w toku), 07-jakosc-002 (Stryker: wynik dopiero w nightly), 10-wydanie-001 (zrzuty, P1, poza zakresem grupy E, bez zmian od 2ef8870a) · Próg projektu: `CLAUDE.md` nie ustala progu wydania; tabela domyślna roli.

Pełny `npm run verify` na ea249c9c: kod 0, 650/650 zestawów, 6800/6800 testów (`dowody/npm-verify.txt`). Dziewięć z trzynastu znalezisk z 2026-11-08 zweryfikowanych testem i sondą; dwa P1 czekają na przebiegi CI, których przed scaleniem nie da się wykonać w tej grupie.

## Komendy (każda osobno)
| Komenda | Kod wyjścia | Wynik (liczby) | Uwagi (powtórka jednym procesem, czas) |
|---|---|---|---|
| `npm run verify` (typecheck, i18n, licencje ×2, rozmiar, lint, native, matrix, jest) | 0 | 650/650 zestawów, 6800/6800 testów; lint 0 błędów, 2 ostrzeżenia | raz, `dowody/npm-verify.txt` |
| `npx jest --ci` 16 plików testów akceptacyjnych grupy (07) | 0 | 16/16 zestawów, 159/159 testów | `dowody/testy-akceptacyjne-07.txt` |
| mutanty M2, M8, G1, G2 w kopii roboczej (`npx jest --ci <plik>`) | 1 każdy | wszystkie zabite (M2: 1 test czerwony, M8: 4, G1: 1, G2: 2) | `dowody/mutacje-reaudit.txt`; kopia przywrócona `git checkout` |
| `scripts/ci/e2e-na-sha.mjs` na sucho (3 SHA, przebiegi z MCP) | 0 / 1 / 0 | ea249c9c → OK przez przodka 6a412c9a (#100); 2ef8870a → błąd (#96 failure); 6a412c9a → OK | `dowody/bramka-e2e-sha-na-sucho.txt` |
| Stryker w kopii (`mutate` zawężone, perTest vs off) | 0 / 0 / 1 | preferments.ts: perTest 101 mutantów w 174 s, 36 testów/mutant, wynik 64,36; off 329 s, 83 testy/mutant, 66,34; sol.ts: 14 przeżyłych, 0 testów/mutant | `dowody/stryker-proba.txt` |
| stan CI (MCP `actions_list`, `actions_get`, `list_workflow_jobs`) | — | nightly 0 przebiegów z nową konfiguracją; E2E #100 zielone w całości na 6a412c9a, #101 na ea249c9c `in_progress` | `dowody/ci-stan.txt`; nic nie uruchamiano |

## Twierdzenia projektu vs stan
| Twierdzenie (plik:linia) | Jak sprawdzone | Potwierdzone / obalone |
|---|---|---|
| README: korpus Pythona to korpus regresji (`README.md:124`) | odczyt + `tests/korpus-regresji-073.test.ts` kod 0 | potwierdzone |
| `CLAUDE.md` poniżej 200 linii (D-019) | `wc -l CLAUDE.md` = 69 | potwierdzone |
| Stryker perTest + incremental skróci nightly poniżej limitu (komunikat c0614ee9) | próba w kopii: perTest działa z `jest-expo` (36 vs 83 testy/mutant); szacunek ok. 3 h na 6509 mutantów na tej maszynie | niepotwierdzone — wynik dopiero w nightly (07-jakosc-002) |
| Bramka `e2e-sha` blokuje build bez zielonego E2E na SHA (D-286, D-316) | odczyt logiki, test 068, sonda na sucho, mutanty G1/G2 zabite | potwierdzone na sucho; w CI jeszcze nie biegła |

## Nie sprawdzono
| Co | Dlaczego (środowisko) | Krok i kto | Wpływ na werdykt |
|---|---|---|---|
| E2E #101 na ea249c9c | w toku (koordynator); polecenie: nie uruchamiać | koordynator: wynik `actions_get` run 42705979446; potem E2E na SHA scalenia do `master` | 07-jakosc-001 otwarte do zielonego przebiegu na SHA kandydata |
| Pełny Stryker z perTest | biegnie tylko w nightly na `master` (6509 mutantów) | po scaleniu: pierwszy nightly; sprawdzić czas kroku i wynik ≥ 60 | 07-jakosc-002 otwarte (warunek) |
| Bramka `e2e-sha` w prawdziwym CI | jeszcze nie biegła (pierwszy tag po scaleniu) | właściciel/koordynator: pierwszy build — log kroku „Check e2e-ios.yml result for GITHUB_SHA” | brak; zachowanie sprawdzone na sucho |
| Lista telefonu PH-15 i PH-02 na nowym buildzie | brak telefonu | właściciel po buildzie | zastrzeżenie; PH-02 warunek wysyłki |

## Otwarte P0/P1 innych ról z tego commitu
| ID | Rola | Tytuł | Status |
|---|---|---|---|
| 10-wydanie-001 | 10 (ta grupa) | zrzuty z plakietką Pro na funkcjach Basic, sprzed M3 | nadal otwarte (`docs/wydanie/zrzuty` bez zmian od 2ef8870a); poza zadaniami grupy E |
| pozostałe | 01–06, 08, 09, 11, 12 | raportów innych grup nie czytano (D-015) | do scalenia przez M1 |

## Lista wydania (moduł wydanie)
| Pozycja | Dowód | Wynik |
|---|---|---|
| 1. Jeden commit | kandydat jeszcze nie istnieje (scalenie do `master`); E2E #100 na 6a412c9a, różnica do ea249c9c tylko `docs/wznowienie-M3.md` | bramka `e2e-sha` wymusi to automatycznie (07-jakosc-004 zweryfikowane) |
| 2. Wersja i build | bez zmian mechanizmu: build = 1000 + numer przebiegu w `testflight.yml` | ok |
| 3. Pełny zestaw, typecheck, lint | `dowody/npm-verify.txt` kod 0 | ok |
| 4. E2E głównych przepływów | #100 zielone (pl_PL, en_US, kontrola negatywna, Basic) z nowym scenariuszem `06-koniec-wypieku`; #101 w toku | warunek: zielone na SHA kandydata |
| 5. Aktualizacja z poprzedniej wersji z danymi | PH-02 na telefonie | nie sprawdzono (krok właściciela, warunek wysyłki) |
| 6. Lista „tylko telefon” | PH-15 dopisany (`docs/wydanie/lista-kontrolna-telefonu.md:37`) | do wykonania na nowym buildzie |
| 7–10 | bez zmian względem raportu 2026-11-08 | — |

## Podsumowanie
Naprawy M2 dla jakości są w kodzie i mają testy, które potrafią paść: zabite są oba przeżyłe mutanty z poprzedniego audytu (ROLLBACK migracji, granica 1 oz) i dwa mutanty nowej bramki E2E. Bramka `e2e-sha` przed buildem TestFlight działa na sucho tak, jak opisuje D-316: przepuszcza ea249c9c przez zielonego przodka 6a412c9a (różnica tylko w `docs/`) i blokuje 2ef8870a (czerwony #96). Dwa P1 nie są zamknięte z powodów czasu, nie kodu: E2E na SHA kandydata (#101 w toku, kandydat powstanie przy scaleniu) i Stryker, którego pełny przebieg biegnie tylko w nightly; próba w kopii pokazuje, że perTest działa, ale szacunek czasu (ok. 3 h na tej maszynie) przekracza stały limit 120 min, a plik przyrostowy powstaje dopiero po ukończonym przebiegu. D-316 rekomenduję utrzymać.

| ID | Wynik | Dowód |
|---|---|---|
| 07-jakosc-001 | nadal otwarte (w toku) | M1-066: E2E #101 na ea249c9c `in_progress`; #100 na przodku 6a412c9a zielone we wszystkich krokach (`dowody/ci-stan.txt`) |
| 07-jakosc-002 | nadal otwarte (nie do zweryfikowania przed nightly, warunek) | M1-067: `stryker.config.json:23` perTest, cache w `.github/workflows/nightly.yml:50`; limit nadal `.github/workflows/nightly.yml:23`; `dowody/stryker-proba.txt` |
| 07-jakosc-003 | zweryfikowane | M1-016: `src/data/sqlite-store.ts:71`, `src/lib/kopia-auto-stan.ts:47`, scenariusz 06 zielony w #100, PH-15; testy kod 0 |
| 07-jakosc-004 | zweryfikowane | M1-068: `.github/workflows/testflight.yml:62`, `.github/workflows/testflight.yml:83`; `dowody/bramka-e2e-sha-na-sucho.txt`; G1, G2 zabite |
| 07-jakosc-005 | zweryfikowane | M1-069: `tests/helpers/fc-runs.ts:6`; `tests/fc-num-runs-069.test.ts` kod 0 |
| 07-jakosc-006 | zweryfikowane | M1-070: `scripts/br-bez-testu.mjs:101`; wpisy BR-HARMO-001, BR-ETAP-001 usunięte, testy z ID kod 0 |
| 07-jakosc-007 | zweryfikowane | M1-071: mutanty M2, M8 kod 1 (`dowody/mutacje-reaudit.txt`) |
| 07-jakosc-008 | zweryfikowane | M1-072: grep tytułów bez dopisku → 0; `tests/tytuly-a11y-072.test.ts` kod 0 |
| 07-jakosc-009 | zweryfikowane | M1-073: `README.md:124`, `src/core/__tests__/baking-physics-corpus.test.ts:10` |
| 07-jakosc-010 | nadal otwarte | poza zadaniami M1 grupy E; `.github/scripts/select-xcode.sh:8` bez zmian, brak `.claude/` |
| 07-jakosc-011 | zweryfikowane | M1-075: `.github/workflows/e2e-ios.yml:141`; 11/11 scenariuszy z `takeScreenshot`; #100 pokazał wszystkie kroki |
| 07-jakosc-012 | nadal otwarte | poza zadaniami M1 grupy E; brak listy stref w pliku konfiguracji testów |
| 07-jakosc-013 | zweryfikowane | M1-077: brak `pages.yml`; `tests/workflow-pages-077.test.ts` kod 0 (stan na `master` po scaleniu) |
| 07-jakosc-601 | istniało wcześniej (P3) | Stryker liczy `src/core` tylko testami z `src/core/__tests__` (`jest.mutation.config.js:6`) |
| 07-jakosc-602 | nowe (P3, teoretyczne) | bramka bierze `head_sha` przebiegów `pull_request`, które testują commit scalenia |

Liczby: zweryfikowane 9, nadal otwarte 4 (w tym 2 P1 czekające na CI), regresja 0, istniało wcześniej 1; nowe P3: 2.

## Ocena D-316 (do weta): utrzymać
Logika (`scripts/ci/e2e-na-sha.mjs:29`): zwolnienie przodka tylko, gdy różnica `git diff --no-renames --name-only` dotyka wyłącznie `docs/`, `audit/`, `tests/`, `site/`, plików `*.md` w katalogu głównym i workflowów innych niż `e2e-ios.yml` i `testflight.yml`. Sprawdziłem, że nic z tej listy nie trafia do buildu: `grep` importów `docs/`, `site/`, `tests/`, `audit/` w `app/` i `src/` (bez `__tests__`) → 0 trafień; brak `metro.config.js`; `app.json` bez odwołań do tych katalogów. Słowniki (`languages/`, `src/lib/i18n-*`), zasoby (`assets/`), konfiguracja budowania (`babel.config.js`, `tsconfig.json`, `.npmrc`, `eas.json`, `app.json`, `package*.json`), `scripts/`, `.github/scripts/select-xcode.sh`, `.maestro/` i nowe katalogi wymagają E2E na tym SHA (fail-closed; test `tests/testflight-e2e-sha-068.test.ts` ma przypadek dla każdej z tych ścieżek). Rozstrzyga najbliższy sprawdzony SHA, więc czerwony przebieg na samym kandydacie blokuje mimo zielonego starszego przodka (mutant G2 zabity). Brak przebiegu, przebieg w toku albo anulowany → kod 1. `e2e-ios.yml` nie ma warunków `if` na poziomie zadania ani wejść `workflow_dispatch`, więc „success” znaczy, że wszystkie kroki biegły. Koszt (zmiany w `scripts/` i `src/**/__tests__` wymagają ręcznego E2E przed tagiem) jest jawny w D-316. Uwaga bez zmiany decyzji: 07-jakosc-602.

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz <katalog roli> --rola 07-jakosc` na wersji końcowej: patrz ostatni wiersz tej sekcji. Raport nie zawiera wartości sekretów; dowody to wyniki komend i odczyty MCP.

Wynik: `OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 07-jakosc`, kod 0.

## Próbka regresji
- Zmienione pliki w obszarze roli: `git diff --stat 2ef8870a..ea249c9c` dla `.github`, `tests`, `stryker.config.json`, `scripts`, `.maestro` (174 pliki z dokumentami wydania). Najważniejsze: nowa bramka `e2e-sha` (bez regresji; 07-jakosc-602 jako ograniczenie), kroki E2E z `success() || failure()` (bez wyciszenia: zadanie nadal kończy się porażką), cache Strykera (07-jakosc-002), `kopia-auto-stan.ts` (kolejka kopii, zapis błędu w `app_settings`; test 016 kod 0).
- Lista kontrolna spoza zmienionych plików: JAK-15 (`CLAUDE.md` 69 linii, `verify:matrix --check` w `verify` kod 0, regeneracja macierzy pusta) — ok; JAK-11 (repo publiczne, standardowe runnery bez opłat; nowe zadanie `e2e-sha` 5 min na Linuksie) — ok; JAK-05 (pełny zestaw 6800 testów zielony; bez nowych asercji na czas zegarowy w testach akceptacyjnych grupy) — ok.

## Znaleziska (szczegóły)

### 07-jakosc-601 · Stryker liczy mutanty `src/core` tylko testami z `src/core/__tests__`, więc pliki domeny testowane gdzie indziej mają same przeżyłe mutanty
- Pozycja listy kontrolnej: JAK-07
- Poziom: P3 (D-288: P2 → P3, backlog 1.0.1)
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: `jest.mutation.config.js:6` ogranicza testy do `src/core/__tests__`, a `mutate` obejmuje cały `src/core/**/*.ts`; próba w kopii: `src/core/sol.ts` (testy w `src/__tests__/br-kalk-130-reszta.test.tsx`) → 14/14 mutantów „survived”, 0 testów na mutanta, wynik 0,00 (`dowody/stryker-proba.txt`). Konfiguracja bez zmian od 2ef8870a.
- Mechanizm: wynik Strykera zaniża siłę testów dla plików przeniesionych do `src/core` (w tej pętli m.in. `src/core/reverse-scheduler.ts`, `src/core/zakresy-receptury.ts`), co może zepchnąć wynik poniżej progu 60 bez osłabienia testów.
- Powraca: nie
- Wzorzec lub źródło: moduł `wlasnosci-i-domena` (przeżyły mutant ma znaczyć brakujący test).
- Kroki w aplikacji: brak; skutek dla bramki mutacyjnej.
- Opcje: (a) `testMatch` mutacji obejmuje testy importujące `src/core` (np. całe `src/**/__tests__` i `tests/` przy perTest) — wierny wynik, dłuższy dry-run; (b) wyłączyć z `mutate` pliki bez testów w `src/core/__tests__` — szybko, mniejsze pokrycie. Rekomendacja: (a) razem z pomiarem z 07-jakosc-002.
- Test akceptacyjny: mutant w `src/core/sol.ts` zabity w przebiegu Strykera.
- Status: istniało wcześniej (2ef8870a), do decyzji właściciela

### 07-jakosc-602 · Bramka E2E przyjmuje zielony przebieg `pull_request` dla `head_sha`, choć testował commit scalenia
- Pozycja listy kontrolnej: JAK-16
- Poziom: P3 (D-288)
- Realność: teoretyczny · Pewność: średnia
- Rodzaj: D (defekt)
- Dowód: `.github/workflows/testflight.yml:78` pobiera wszystkie zakończone przebiegi `e2e-ios.yml` bez filtra zdarzenia; `e2e-ios.yml` ma wyzwalacz `pull_request` (testuje `refs/pull/N/merge`), a API zwraca `head_sha` gałęzi PR. Skrypt porównuje `head_sha` z kandydatem (`scripts/ci/e2e-na-sha.mjs:43`).
- Mechanizm: tag na głowie PR (przodek `master`), gdy baza PR zawierała zmiany kodu spoza głowy, przejdzie na przebiegu, który sprawdzał inny kod. Wymaga tagu na commicie nie będącym scaleniem — praktyka projektu taguje `master`.
- Powraca: nie
- Wzorzec lub źródło: JAK-16 (jeden SHA dla wszystkich przebiegów).
- Kroki w aplikacji: brak.
- Opcje: filtr `event != 'pull_request'` w skrypcie (jedna linia + przypadek testu) albo bez zmian z adnotacją w D-316. Rekomendacja: filtr.
- Test akceptacyjny: zielony przebieg z `event: pull_request` na SHA kandydata nie zwalnia bramki.
- Status: otwarte (nowe, backlog 1.0.1)

### 07-jakosc-002 (reaudyt) · Stryker: konfiguracja zmieniona, wynik niepotwierdzony
- Pozycja listy kontrolnej: JAK-18
- Poziom: P1
- Realność: realny · Pewność: średnia
- Rodzaj: D (defekt)
- Dowód: `stryker.config.json:23` perTest i `incremental`; cache odczyt/zapis w nightly; limit `timeout-minutes: 120` bez zmian (`.github/workflows/nightly.yml:23`). Ostatni nightly #26 (run 42592498036, 2ef8870a) „cancelled” po 120 min ze starą konfiguracją; z nową żadnego przebiegu (`dowody/ci-stan.txt`). Próba: perTest działa z `jest-expo` i skraca czas ok. 1,9× na `preferments.ts`; ok. 1,7 s na mutanta → szacunek ok. 3 h dla 6509 mutantów na 4 rdzeniach (rachunek, przybliżenie).
- Mechanizm: plik przyrostowy Stryker zapisuje po ukończonym przebiegu; pierwszy przebieg bez cache musi zmieścić się w 120 min, inaczej cache nie powstanie i nightly zostanie anulowany jak dotąd. [DO USTALENIA] czasu na runnerze `ubuntu-latest`.
- Powraca: tak — 07-jakosc-002 (2026-11-08) → trwała kontrola: test kontraktu jest (`tests/quality-gates.test.ts`), brak pomiaru.
- Wzorzec lub źródło: zasada roli 6 (limity z pomiaru).
- Kroki w aplikacji: brak.
- Opcje: (a) czekać na pierwszy nightly po scaleniu; przy anulowaniu jednorazowy `workflow_dispatch` z `timeout-minutes` 360 w osobnym workflow, który zasieje cache; (b) od razu osobny tygodniowy workflow 360 min (opcja b raportu źródłowego). Rekomendacja: (a) z gotowym planem (b).
- Test akceptacyjny: nightly zielony na `master` z wynikiem Strykera ≥ 60 (bez zmian).
- Status: nadal otwarte (warunek: pierwszy nightly po scaleniu)

## Proponowane polecenie naprawy
Po wyniku #101 i scaleniu: E2E na SHA scalenia (koordynator), pierwszy nightly (07-jakosc-002). Backlog 1.0.1: `node tools/assemble.mjs 07-jakosc --tryb fix --zadania 07-jakosc-601,07-jakosc-602,07-jakosc-010,07-jakosc-012`.

`git status --porcelain` na końcu: pusty (kopia robocza w scratchpadzie usunięta `git worktree remove`).
