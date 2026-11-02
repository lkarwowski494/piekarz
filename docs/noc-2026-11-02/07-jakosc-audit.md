# Audyt: Jakość (strategia testów, gotowość wydania) — Piekarz — 2026-11-02
Commit: 38f8e5fb06471b6e7912ed905c8f619faca15b48 · Gałąź: redesign/piekarz-2026-10-22 (praca na `noc/07-jakosc-2026-11-02`) · Tryb: audit · Środowisko: Linux x86_64 (kontener chmurowy), Node v22.23.4, Playwright 1.63.0; brak macOS, Xcode, symulatora iOS, emulatora Androida i telefonu; GitHub przez MCP (odczyt Actions), `gh` tylko do wyszukiwania.

Polecenie: `polecenia/piekarz-2026-11-02/07-jakosc-audit.md` z repo prompts @553e37b, pobrane z artefaktu koordynatora; sha256 f020f257edfff830… zgodny z podanym przez koordynatora (D-124, tor B).

## Werdykt: ZABLOKOWANE
Commit: 38f8e5f · Kandydat do wydania: ten sam (HEAD gałęzi; E2E iOS biegł na c660cec, różnica c660cec..38f8e5f to tylko `docs/decyzje.md` i `docs/wznowienie-M3.md`, `git diff --stat`) · Rozstrzygnął warunek: „otwarte P0 albo P1” (07-jakosc-001, 07-jakosc-002) oraz blokery wydania z BRD bez dowodu na tym SHA liczone jak otwarte P1 (sekcja „Nie sprawdzono”) · Próg projektu: `CLAUDE.md` nie ustala progu wydania — domyślny.

Werdykt dotyczy zgłoszenia 1.0 do App Review. Nie blokuje buildu TestFlight z toru A (D-124): TestFlight jest narzędziem do zamknięcia pozycji „tylko telefon”, które tu blokują.

## Komendy (każda osobno)
| Komenda | Kod wyjścia | Wynik (liczby) | Uwagi (powtórka jednym procesem, czas) |
|---|---|---|---|
| `npm ci` | 0 | zależności z pliku blokady | pierwszy `npm run verify` bez node_modules padł na typecheck (środowisko, nie kod) |
| `npm run verify` (łańcuch, linia bazowa) | 0 | Jest 512/512 zestawów, 5564/5564 testów | 154,7 s |
| `npm run typecheck` | 0 | 0 błędów | 14 s, `dowody/typecheck.txt` |
| `npm run lint` | 0 | 0 błędów | 7 s, `dowody/lint.txt` |
| `npm run check:i18n` | 0 | — | `dowody/check-i18n.txt` |
| `npm run check:licenses` | 0 | — | `dowody/check-licenses.txt` |
| `npm run check:size` | 0 | — | `dowody/check-size.txt` |
| `npm run verify:native` | 0 | — | `dowody/verify-native.txt` |
| `npm run verify:matrix` (`--check`, bez zapisu) | 0 | docs/22 aktualny | `dowody/verify-matrix.txt`; `git status --porcelain` po: tylko katalog raportu |
| `npx jest --ci` przebieg 1 (TZ kontenera = UTC) | 0 | 512/512, 5564/5564 | 158 s, `dowody/jest-ci-1.txt` |
| `npx jest --ci` przebieg 2 | 0 | 512/512, 5564/5564 | 128 s, `dowody/jest-ci-2.txt` |
| `TZ=Australia/Sydney npx jest --ci` | 0 | 5564/5564 | `dowody/jest-tz-Australia-Sydney.txt` |
| `TZ=Pacific/Auckland npx jest --ci` | 0 | 5564/5564 | `dowody/jest-tz-Pacific-Auckland.txt` |
| `TZ=Asia/Tokyo npx jest --ci` | 0 | 5564/5564 | `dowody/jest-tz-Asia-Tokyo.txt` |
| `TZ=America/New_York npx jest --ci` | 0 | 5564/5564 | `dowody/jest-tz-America-New_York.txt` |
| `TZ=Europe/Warsaw npx jest --ci` | 0 | 512/512, 5564/5564 | `dowody/jest-tz-Europe-Warsaw.txt` |
| `TZ=America/Los_Angeles npx jest --ci` | 0 | 512/512, 5564/5564 | `dowody/jest-tz-America-Los_Angeles.txt` |
| 8 prób mutacji na kopii (`git worktree`), testy celowane lub pełny zestaw | 1 przy każdej (mutant zabity) | M1–M8: 1, 4, 211, 2, 4, 105, 6, 5 testów czerwonych | `dowody/mutacje.txt` |
| E2E iOS (GitHub Actions, run 41536995568 na c660cec) | failure | build Release zielony; krok 10 (pl_PL) padł przed pierwszym scenariuszem: `IOSDriverTimeoutException` (sterownik Maestro nie wstał w 480 s); kroki 11–15 pominięte | nie uruchamiany przez tę rolę; klasyfikacja: **maszyna** (awaria przed pierwszym scenariuszem) → jedno powtórzenie; `dowody/e2e-41536995568.txt` |

Losowej kolejności (`--randomize`) nie uruchamiałem osobno: siedem stref i dwa przebiegi UTC dały ten sam wynik; brak niestabilności w 9 pełnych przebiegach.

## Twierdzenia projektu vs stan
| Twierdzenie (plik:linia) | Jak sprawdzone | Potwierdzone / obalone |
|---|---|---|
| Pełna weryfikacja bramek `npm run verify` (`CLAUDE.md:43`) | uruchomione, kod 0 | potwierdzone na 38f8e5f |
| Macierz AST 100% pokrycia w 5 kategoriach (`CLAUDE.md:61`) | `verify:matrix` kod 0; generator liczy obecność nazwy w kodzie testu (`scripts/test-matrix.mjs:121`) | potwierdzone jako obecność nazw, nie jako pokrycie zachowania (`dowody/testy-jakosc.txt`, A) |
| Maestro w Jest bez wpływu daty, to nie E2E (`CLAUDE.md:67`) | `tests/maestro-runner.ts:26` (pole `now` tylko zadeklarowane) | potwierdzone |
| Pole dotyku 44 pt sprawdza tylko styl `minHeight` (`CLAUDE.md:27`) | `tests/helpers/cele-dotykowe.ts:4` | potwierdzone; tytuły testów mówią więcej (07-jakosc-005) |
| Odporność na 320 pt i AX5: brak automatu (`CLAUDE.md:29`) | komentarz `tests/matrix-dimensions.test.tsx:3` twierdzi weryfikację | CLAUDE.md prawdziwy, komentarz testu fałszywy (07-jakosc-005) |
| Niezależny korpus Python ↔ TypeScript (`README.md:124`) | `scripts/gen-baking-physics-corpus.py:13` odtwarza zaokrąglenia i progi kodu | obalone dla tego korpusu (07-jakosc-005) |
| Hook pre-push = pełny verify (polecenie koordynatora, nagłówek) | brak `.husky`, `.githooks`, `core.hooksPath`, `.git/hooks/pre-push` | obalone na tym SHA (07-jakosc-006) |
| Ostatni iOS E2E na gałęzi: failure na b47abea (`docs/wznowienie-M3.md:8`) | GitHub Actions run 39924837386 | potwierdzone; nowy przebieg 41536995568 na c660cec (Komendy) |
| „112 wektorów” w `docs/sztafeta.md:10` | `tests/wektory/brd.json` ma 133 | nieaktualne (bez wpływu na werdykt) |

## Nie sprawdzono
| Co | Dlaczego (środowisko) | Krok i kto | Wpływ na werdykt |
|---|---|---|---|
| BR-CZAS-002 / NFR-CZAS-001: sygnał końca kroku przy zablokowanym ekranie, punktualnie (bloker BRD, wyjątek `scripts/br-wyjatki.json:11`) | wymaga telefonu | właściciel: build TestFlight, wypiek z krokiem 30 min, ekran zablokowany; wynik z datą i buildem | bloker BRD bez dowodu = jak otwarte P1 |
| BR-ZAK-001: zakup, przywrócenie, waluta w piaskownicy StoreKit (`scripts/br-wyjatki.json:16`) | wymaga urządzenia i produktów w ASC (D-033) | właściciel: piaskownica, Basic i Pro, przywracanie | jak otwarte P1 |
| BR-DIAG-004: ostrzeżenie nie tylko kolorem, VoiceOver (`scripts/br-wyjatki.json:23`) | VoiceOver tylko na urządzeniu | właściciel lub rola 04: przejście VoiceOver i zrzut w skali szarości | jak otwarte P1 |
| BR-KAL-009 / BR-ETAP-005: aktualizacja z wersji z jednym planem i trwającym wypiekiem; powrót do wypieku po zamknięciu aplikacji | wymaga instalacji buildu 1019 i kandydata na urządzeniu | właściciel: moduł wydanie pkt 5 (dane przed i po) | warunek wysyłki; utrata danych zmienia werdykt |
| E2E iOS na kandydacie (pl_PL, en_US, kontrola negatywna, Basic) | run 41536995568 padł na maszynie przed pierwszym scenariuszem; ostatni ukończony przebieg z e2e-basic (39924837386, b47abea) czerwony w kroku Basic; ostatni zielony 39916886227 (badb044) bez e2e-basic | koordynator: jedno powtórzenie E2E na HEAD (polityka niestabilnych testów pkt 5); przy drugiej awarii sterownika — przyczyna (obraz runnera, `MAESTRO_DRIVER_STARTUP_TIMEOUT`) | blokuje GOTOWE; bez zielonego E2E na kandydacie werdykt nie zmieni się na lepszy niż ZABLOKOWANE/zastrzeżenia |
| AX5 / 320 pt, rozmiar celu 44 pt (NFR-A11Y-004, RD-ENG-03) | Jest nie liczy układu | rola 04 / właściciel na urządzeniu | zastrzeżenie (nie bloker BRD) |
| Testy mutacyjne Strykera (`src/core`) | nightly anulowany po 120 min (07-jakosc-007) | rola 07 fix | zastrzeżenie |
| NFR-DANE-003, NFR-DANE-004, NFR-OFF-001, NFR-PRYW-001 (blokery BRD) bez ID w żadnym teście | ID nieobecne w testach; zachowanie może być pokryte bez ID (np. zakaz sieci w `tests/public-repo.test.ts`) | rola 07 fix: przypisać test z ID albo powód | „Do sprawdzenia” |

## Otwarte P0/P1 innych ról z tego commitu
| ID | Rola | Tytuł | Status |
|---|---|---|---|
| — | — | brak raportów innych ról z 38f8e5f w repo (katalogu `audit/` nie ma; tory C i D nocy D-124 równolegle) | nie dotyczy |

## Lista wydania (moduł wydanie)
1. Jeden commit: kandydat 38f8e5f; E2E na c660cec (różnica tylko w dokumentach) — akceptowalne, nazwane; TestFlight buduje HEAD.
2. Wersja i build: `app.json:5` wersja 1.0.0; numer buildu z `BUILD_BASE + GITHUB_RUN_NUMBER` (`.github/workflows/testflight.yml:90`) — mechanizm jest.
3. Pełny zestaw, typecheck, lint: osobno, kod 0 (Komendy).
4. E2E głównych przepływów: brak zielonego na kandydacie — run 41536995568 failure (maszyna, sterownik Maestro), powtórzenie: koordynator.
5. Aktualizacja z poprzedniej wersji z danymi (1019 → kandydat): nie sprawdzono, krok właściciela (warunek wysyłki).
6. Lista „tylko telefon”: brak jednej listy z wynikami (07-jakosc-008); pozycje rozproszone.
7. Zakres zmian od 1019 (`git log --oneline d8a0b40..38f8e5f`): T2, a5d, E2E-basic, TZ, „Zamknij” Pro; ryzyka dotknięte (dzień planu w strefach) mają testy zielone w 7 strefach lokalnie.
8. Raporty innych ról: brak z tego SHA.
9. Plan cofnięcia: rola 10 (tor C); baza nowsza niż aplikacja ma testy (`dowody/testy-jakosc.txt`, G).
10. Zasady projektu: wydanie i scalenie do master tylko za zgodą właściciela (D-124).

## Podsumowanie
Kod na 38f8e5f jest zielony we wszystkich bramkach lokalnych, w siedmiu strefach czasowych i w próbach mutacji (8 z 8 mutantów zabitych, w tym reguła krytyczna pleśni RD-21). Blokują dwie rzeczy po stronie jakości: niespełniony bloker BRD (polityka prywatności bez streszczenia offline) i ścieżka wydania, która przepuszcza build bez macierzy stref i bez E2E (build 1019 poszedł z czerwoną macierzą stref). E2E iOS na kandydacie nie dał wyniku (run 41536995568 padł na sterowniku Maestro przed pierwszym scenariuszem — maszyna, do jednego powtórzenia). Pozostałe blokery to pozycje „tylko telefon” z BRD bez wyniku na urządzeniu — do zamknięcia na buildzie TestFlight. Decyzje dla właściciela: sposób naprawy 001 i 002 oraz kto i kiedy wykonuje listę na telefonie.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 07-jakosc-001 | P1 | D | Bez sieci „Polityka prywatności” nie pokazuje streszczenia ani adresu (bloker BRD BR-UST-003) | otwarte |
| 07-jakosc-002 | P1 | D | Build TestFlight/wydania nie wymaga zielonej macierzy stref ani E2E; CI i strefy nie biegną na gałęzi kandydata | otwarte |
| 07-jakosc-003 | P2 | D | Testy zależne od prawdziwej daty i czasu; nightly 1.11 czerwony, 2.11 zielony na tym samym commicie | otwarte |
| 07-jakosc-004 | P2 | D | 53 ze 133 wektorów BRD nie ma śladu w testach (w tym 4 z 6 wektorów RD-21); wartości przepisane ręcznie | otwarte |
| 07-jakosc-005 | P2 | D | Testy i README deklarują więcej, niż sprawdzają (320 pt/AX5, „44 pt target”, korpus „niezależny”) | otwarte |
| 07-jakosc-006 | P2 | D | Brak haka przed pushem; wybór Xcode z cichym zjazdem, E2E bez wyboru Xcode | otwarte |
| 07-jakosc-007 | P2 | D | Stryker w nightly nie kończy się w 120 min — brak wyniku mutacji | otwarte |
| 07-jakosc-008 | P2 | P | Brak jednej listy „tylko telefon” i bramek wydania na wzór `trening` (39, 42) | otwarte |
| 07-jakosc-009 | P2 | D | Kod zewnętrzny w CI bez przypięcia (akcje do tagu, `curl … | bash`, brew bez wersji); wymuszone nadpisanie tagu | otwarte |

## Linia bazowa i założenia
Rejestr ryzyk od zera (E0b, przed czytaniem testów), soczewki: użytkownik tracący dane lub dostający złą liczbę, programista liczący na czerwony test, właściciel wydający bez cofnięcia, sceptyk.

| Ryzyko (skutek) | Priorytet | Test / kontrola | Wynik |
|---|---|---|---|
| Utrata danych: rotacja kopii kasuje nowe kopie (S1) | wysokie | `src/lib/__tests__/backup.test.ts`, `src/data/__tests__/auto-backup.sqlite.test.ts` | M1, M2 zabite |
| Utrata danych: import, czyszczenie, `state_corrupt`, migracje v5/v6, baza nowsza (S1) | wysokie | testy na node:sqlite i fixture buildu 1014 (`dowody/testy-jakosc.txt`, G, E) | ok; brak fixture 1017–1019 (Do sprawdzenia) |
| Utrata trwającego wypieku przy aktualizacji (S1) | wysokie | BR-KAL-009 26 plików testów; ścieżka na urządzeniu niesprawdzona | Nie sprawdzono |
| Złe ilości (Baker's %), zła temperatura wody 4-DDT (S2) | wysokie | `src/core` (1532 testy) | M3, M4, M6 zabite |
| Pleśń uznana za „w porządku” (bezpieczeństwo, RD-21) (S1) | wysokie | pełny zestaw | M7, M8 zabite; ślad wektorów słaby (004) |
| Krok w oknie snu nieostrzeżony (Sleep Guard) (S2) | wysokie | `src/scheduler` | M5 zabity |
| Zły dzień planu w strefie (S2) | wysokie | macierz 7 stref | zielone lokalnie; w CI nie biegnie na gałęzi (002) |
| Sygnał przy zablokowanym ekranie (główny przepływ, S1) | wysokie | tylko telefon | Nie sprawdzono |
| Zakup/przywrócenie (odrzucenie w sklepie, S1) | wysokie | `tests/helpers/platnosci` (atrapa) + piaskownica | piaskownica niesprawdzona |
| Prywatność: wywołania sieciowe (S1) | wysokie | `tests/public-repo.test.ts` | zielony |

Wymiary pokrycia: rejestr ryzyk — wyżej; wyrocznie — wektory BRD słabo wpięte (004), fast-check 48 wywołań w 16 plikach, ziarno stałe, w nightly losowe i wypisywane; dane z wycinków — fixture buildu 1014 (baza SQL, kopia JSON), bez danych osobowych; platforma — E2E na symulatorze w CI (zielony ostatnio na badb044), lista „tylko telefon” rozproszona (008); dostępność — Jest sprawdza rolę i styl, nie wymiary (005); bramki CI — 002, 006, 009; repo publiczne, standardowe runnery bez kosztu; niestabilne testy — 003; siła testów — 8/8 mutantów zabitych; dowody wydania — Lista wydania.

Wzorzec najlepszych: repo właściciela `trening` (commit 2e4b0f8) — `docs/42-plan-wydania-1.0.md` §1 i `docs/39-lista-kontrolna-wydania.md`: rejestr ryzyk R-NNN, lista na telefonie z ID i polem „dlaczego nie automat”, progi pauzy wydania stopniowego, kontrola znaków towarowych; porównanie punkt po punkcie w `dowody/trening-porownanie.txt`. Brakujące w Piekarzu bramki jakości są w 008; pozostałe (znaki towarowe, DSA, RODO, plan pierwszego tygodnia) należą do roli 10 (tor C).

Rejestr założeń: bez propozycji zmiany statusu (audyt nie dotknął hipotez ZAL).

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| Bramki lokalne (typy, lint, i18n, licencje, rozmiar, native, macierz) | tak | `dowody/typecheck.txt`, `dowody/lint.txt` i pozostałe |
| Pełny zestaw Jest, 2× UTC + 6 stref | tak | `dowody/jest-ci-1.txt`, `dowody/jest-tz-Asia-Tokyo.txt` itd. |
| Siła testów: kopie, Baker's %, 4-DDT, Sleep Guard, RD-21 | tak (mutacje) | `dowody/mutacje.txt` |
| Workflowy CI i ich ostatnie przebiegi | tak (odczyt Actions) | `dowody/ci-stan.txt` |
| Blokery wydania BRD → testy | tak (grep ID + wyjątki) | `dowody/blokery-brd.txt` |
| Wyrocznie, powtarzalność, dostępność w testach, dane z zewnątrz, kryteria (próbka 12 BR) | tak (odczyt, subagent; kluczowe tezy sprawdzone ręcznie) | `dowody/testy-jakosc.txt` |
| Porównanie z bramkami `trening` | tak (subagent) | `dowody/trening-porownanie.txt` |
| Aplikacja działająca (symulator, telefon), aktualizacja z 1019 | nie — środowisko | Nie sprawdzono |
| Ekrany wizualnie, dostępność natywna | nie — obszar roli 04 | — |
| Metadane, manifest prywatności, zgodność z wytycznymi | nie — obszar roli 10 | — |

## Kontrola dowodów i sekretów
`node sprawdz-raport.mjs docs/noc-2026-11-02/07-jakosc-audit.md . --rola 07-jakosc` (kopia skryptu w scratchpadzie): „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 07-jakosc”, kod 0. Pliki dowodów: wzorce sekretów — 0 trafień we wszystkich; notatki subagentów (`dowody/ci-stan.txt`, `dowody/testy-jakosc.txt`, `dowody/trening-porownanie.txt`, `dowody/blokery-brd.txt`) mają odwołania do repo `trening` i ścieżek bez prefiksu oraz cytaty parafrazowane, których skrypt nie potwierdza — to notatki robocze; tezy użyte w znaleziskach sprawdziłem ręcznie (plik:linia w raporcie przechodzą skrypt).

## Stosowalność listy kontrolnej
| Pozycja | Status (dotyczy / nie dotyczy + powód / decyzja D-xx) | Wynik (ok / znalezisko ID / nie sprawdzono + powód) |
|---|---|---|
| JAK-01 | dotyczy (rejestr ryzyk odtworzony, brak strategii — D-125) | ok dla ryzyk z testem; ścieżki urządzenia: Nie sprawdzono |
| JAK-02 | dotyczy | 07-jakosc-004 |
| JAK-03 | dotyczy | 07-jakosc-001; próbka 12 BR MVP: 12/12 z testem |
| JAK-04 | dotyczy | ok: 8/8 mutantów zabitych |
| JAK-05 | dotyczy | 07-jakosc-003 |
| JAK-06 | dotyczy (harmonogram, kalendarz, powiadomienia) | ok w 7 strefach lokalnie; przejścia DST 2026-10-25 i 2027-03-28 wpisane na sztywno (Do sprawdzenia) |
| JAK-07 | dotyczy | 07-jakosc-007 |
| JAK-08 | dotyczy (import, kopie) | ok: fixture z buildu 1014, bez danych osobowych |
| JAK-09 | dotyczy | 07-jakosc-002 |
| JAK-10 | dotyczy | 07-jakosc-009 (P2); brak `pull_request_target`, dane zdarzeń przez env |
| JAK-11 | dotyczy | ok: repo publiczne, standardowe runnery bez kosztu |
| JAK-12 | dotyczy | scenariusze są (`.maestro/e2e`, `.maestro/e2e-basic`); wynik na kandydacie: nie sprawdzono (maszyna, run 41536995568); lista „tylko telefon”: 07-jakosc-008 |
| JAK-13 | dotyczy | 07-jakosc-005 |
| JAK-14 | nie dotyczy: brak wyzwalania po lokalizacji (aplikacja offline, bez GPS) | — |
| JAK-15 | dotyczy | 07-jakosc-005, 07-jakosc-006; `wc -l CLAUDE.md` = 68 (< 200) |
| JAK-16 | dotyczy | E2E na c660cec, kandydat 38f8e5f (różnica tylko docs) — ok, nazwane; aktualizacja z 1019: Nie sprawdzono |
| JAK-17 | dotyczy | ok: job E2E buduje Release i steruje symulatorem (`.github/workflows/e2e-ios.yml:112` i kroki 6–15); `verify:matrix --check` nie zapisuje |
| JAK-18 | dotyczy | 07-jakosc-006; ostatni przebieg macierzy stref na master czerwony (run 39923870529, naprawione na kandydacie w 5125bcd) |

## Znaleziska (szczegóły)

### 07-jakosc-001 · Bez sieci „Polityka prywatności” nie pokazuje streszczenia ani adresu (bloker BRD BR-UST-003)
- Pozycja listy kontrolnej: JAK-03
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: `src/components/settings/StudioEcosystemSection.tsx:73` — przycisk woła tylko `Linking.openURL(PRIVACY_URL)`; kryterium `Scenariusz: Brak sieci` w `docs/brd/wymagania-dane.md:153`; projekt sam zapisał lukę jako znalezisko w `scripts/br-wyjatki.json:17`; bloker wydania `docs/brd/README.md:76`; brak decyzji akceptującej (`grep -rn "F-40" docs/decyzje.md` → 0).
- Mechanizm: link zewnętrzny bez treści lokalnej; `git grep -l "openURL(PRIVACY_URL"` → 1 miejsce (ekran Pro ma osobny link, `src/components/PaywallModal.tsx`).
- Powraca: tak — wyjątek w `br-wyjatki.json` utrwala lukę → trwała kontrola: test scenariusza bez sieci z ID BR-UST-003 i usunięcie wyjątku.
- Wzorzec lub źródło: BRD BR-UST-003 (OG-04); `docs/scope-contract.md:58` (F-40 MVP: „bez sieci streszczenie i adres”).
- Kroki w aplikacji: tryb samolotowy → Ustawienia → „Polityka prywatności” → Safari bez strony.
- Opcje: (a) krótkie streszczenie (3–5 zdań, 35 języków) i adres w aplikacji — ok. 1 h agenta + przekład; (b) decyzja właściciela: zdjąć scenariusz offline z blokerów (Apple wymaga linku, który jest) — zero kosztu, aplikacja „offline” odsyła do sieci. Rekomendacja: (a), bo obietnica produktu to „działa w pełni offline”.
- Test akceptacyjny: test z ID BR-UST-003 (bez sieci: widoczne streszczenie i adres), wpis usunięty z `scripts/br-wyjatki.json`.
- Status: otwarte

### 07-jakosc-002 · Build TestFlight/wydania nie wymaga zielonej macierzy stref ani E2E; CI i strefy nie biegną na gałęzi kandydata
- Pozycja listy kontrolnej: JAK-09
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `.github/workflows/ci.yml:6` i `.github/workflows/tests-tz.yml:6` — push tylko `master, main, naprawy/**`; `.github/workflows/e2e-ios.yml:12` — push tylko master/main; testflight uruchamia sam `npm run verify` w jednej strefie (`.github/workflows/testflight.yml:77`), bez `needs` na strefy i E2E. Skutek już wystąpił: macierz stref na master czerwona (run 39923870529, d8a0b40: Sydney, Auckland, Tokyo, `src/__tests__/harmonogram-rytm-d7.test.tsx:91`), a z tego commita poszedł TestFlight 1019 (run 39929298523, success) — `dowody/ci-stan.txt`.
- Weryfikacja przeciwna: na kandydacie błąd naprawiony (5125bcd), 7 stref zielonych lokalnie — to zamyka ten SHA, nie mechanizm; następny build znów może przejść z czerwoną strefą. Znalezisko utrzymane.
- Mechanizm: wyzwalacze ograniczone do gałęzi, których kandydat nie używa; `grep -n "branches" .github/workflows/*.yml` → ci, tests-tz, e2e-ios, nightly bez gałęzi `redesign/**`.
- Powraca: tak — M1-audytor-generalny-168 dodał `naprawy/**`, gałąź zmieniła nazwę → trwała kontrola: test workflowu (jak `tests/e2e-ios-workflow.test.ts`) sprawdzający, że gałąź kandydata uruchamia ci i tests-tz.
- Wzorzec lub źródło: zasada wspólna 21 (D-050); rola 07, zasada 8.
- Kroki w aplikacji: użytkownik w Sydney dostaje zły dzień planu w buildzie, który przeszedł bramkę.
- Opcje: (a) testflight.yml uruchamia pętlę stref (7 × ok. 2,5 min w jednym zadaniu) przed buildem — pewna bramka, +ok. 18 min na runnerze Linux, bez kosztu (repo publiczne); (b) wyzwalacze ci/tests-tz także na `redesign/**` i `noc/**` + zasada „TestFlight tylko z SHA z zielonym CI i E2E” w `CLAUDE.md` — tańsze, ale zależne od dyscypliny. Rekomendacja: (a) + test kontraktu workflowu.
- Test akceptacyjny: test workflowu czerwony na obecnym testflight.yml, zielony po zmianie; przebieg na gałęzi kandydata.
- Status: otwarte

### 07-jakosc-003 · Testy zależne od prawdziwej daty i czasu; nightly 1.11 czerwony, 2.11 zielony na tym samym commicie
- Pozycja listy kontrolnej: JAK-05
- Poziom: P2
- Realność: brzegowy · Pewność: średnia
- Rodzaj: D
- Dowód: nightly run 41266207599 (2026-11-01, d8a0b40): `npm run verify` czerwony, 6 testów, m.in. `src/__tests__/pro-wznowienie-w2.test.tsx:58`; run 41379393352 (2026-11-02, ten sam commit): verify zielony (`dowody/ci-stan.txt`). `src/__tests__/zakwas-staly-dzien-d7.test.tsx:47` liczy dzień tygodnia z `new Date()`; 5 testów czeka prawdziwe 800–1100 ms (`dowody/testy-jakosc.txt`, C). Na 38f8e5f 9 pełnych przebiegów zielonych.
- Mechanizm: `Date.now()`/`new Date()` bez fałszywego zegara w testach; lista w `dowody/testy-jakosc.txt`.
- Powraca: nie
- Wzorzec lub źródło: rola 07, zasada 5; polityka niestabilnych testów pkt 3.
- Kroki w aplikacji: brak bezpośrednio; bramka nocna fałszywie czerwona albo zielona zależnie od dnia.
- Opcje: (a) `jest.useFakeTimers().setSystemTime` w tych plikach + odtworzenie 1.11 02:00 UTC — ok. 1 h; (b) kwarantanna jawna do wydania — tańsze, gorsze. Rekomendacja: (a).
- Test akceptacyjny: test z datą 2026-11-01T02:00Z zielony; przebieg z `setSystemTime` na kilka dni tygodnia.
- Status: otwarte

### 07-jakosc-004 · 53 ze 133 wektorów BRD nie ma śladu w testach (w tym 4 z 6 wektorów RD-21); wartości przepisane ręcznie
- Pozycja listy kontrolnej: JAK-02
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D
- Dowód: `dowody/blokery-brd.txt` — RD-21-W2, W4, W5, W6 występują tylko w `tests/wektory/brd.json`; plik czytają 4 testy, głównie sprawdzając obecność wektora (`dowody/testy-jakosc.txt`, B). Weryfikacja przeciwna: zachowanie RD-21 ma testy bez ID — mutanty M7 (bez „białego nalotu”) i M8 (bez „kolorowej plamy”) w `src/core/sourdough-physics.ts` zabite (6 i 5 testów, `dowody/mutacje.txt`). Dlatego P2 (ślad i wyrocznia), nie P1.
- Mechanizm: oczekiwane wartości wpisane ręcznie zamiast czytane z pliku wektorów; zmiana wektora przez erratę roli 01 nie czerwieni testu.
- Powraca: nie
- Wzorzec lub źródło: rola 07, zasada 2; moduł własności („Wektor ze źródła przed własnością”).
- Kroki w aplikacji: brak bezpośrednio.
- Opcje: (a) test parametryzowany czytający `brd.json` dla reguł z funkcją (RD-14…RD-28) — ok. 2–3 h; (b) bramka: każdy wektor ma test z ID albo wpis w wyjątkach — tańsza, sam ślad. Rekomendacja: (a) dla RD-21…RD-23 i reguł liczb, (b) dla reszty.
- Test akceptacyjny: zmiana `oczekiwane` dowolnego wektora RD-21 w kopii daje czerwony test.
- Status: otwarte

### 07-jakosc-005 · Testy i README deklarują więcej, niż sprawdzają (320 pt/AX5, „44 pt target”, korpus „niezależny”)
- Pozycja listy kontrolnej: JAK-13
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `tests/matrix-dimensions.test.tsx:3` (komentarz o weryfikacji 320pt i AX5); `tests/matrix-a11y.test.tsx:55` (tytuł o celu 44 pt, asercja na styl); `README.md:124` korpus „niezależny”, a `scripts/gen-baking-physics-corpus.py:13` odtwarza zaokrąglenia i progi kodu. `CLAUDE.md:27` i `CLAUDE.md:29` opisują stan uczciwie — rozjazd jest między dokumentem a testami.
- Mechanizm: nazwy testów i komentarze sprzed korekty deklaracji; strażnik `tests/quality-declarations.test.ts` nie obejmuje tych fraz.
- Powraca: tak (JAK-13 w poprzednim audycie) → trwała kontrola: rozszerzyć `tests/quality-declarations.test.ts` o frazy „320pt”, „AX5”, „44 pt target”, „niezależny”.
- Wzorzec lub źródło: moduł e2e-mobilne, „Dostępność: co sprawdza które narzędzie”.
- Kroki w aplikacji: brak; fałszywa pewność przy wydaniu.
- Opcje: (a) poprawić nazwy i README + strażnik — ok. 30 min; (b) tylko README. Rekomendacja: (a).
- Test akceptacyjny: strażnik czerwony na obecnych nazwach, zielony po zmianie.
- Status: otwarte

### 07-jakosc-006 · Brak haka przed pushem; wybór Xcode z cichym zjazdem, E2E bez wyboru Xcode
- Pozycja listy kontrolnej: JAK-18
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: brak `.husky`, `.githooks`, `.claude/settings.json`, `.git/hooks/pre-push` (`ls .git/hooks` → same `*.sample`); polecenie nocy zakłada hak „pre-push = pełny verify” — nieprawda na tym SHA. `.github/scripts/select-xcode.sh:8` — gdy brak `Xcode_26*`, bierze `/Applications/Xcode.app` bez sprawdzenia wersji; e2e-ios.yml nie wybiera Xcode, więc E2E i TestFlight mogą budować różnymi wersjami.
- Mechanizm: kontrola zależna od pamięci agenta, nie od automatu.
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 21; wzorce „Bramki mechaniczne”.
- Kroki w aplikacji: brak bezpośrednio.
- Opcje: (a) hak PreToolUse w `.claude/settings.json` (szybkie bramki ok. 30 s) + `exit 1` w select-xcode przy braku wersji + ten sam skrypt w e2e — ok. 1 h; (b) tylko poprawka skryptu Xcode. Rekomendacja: (a).
- Test akceptacyjny: skrypt na sztucznym katalogu bez Xcode_26 kończy się błędem; hak blokuje push przy czerwonym typecheck.
- Status: otwarte

### 07-jakosc-007 · Stryker w nightly nie kończy się w 120 min — brak wyniku mutacji
- Pozycja listy kontrolnej: JAK-07
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: runy 41379393352 i 41161061627 anulowane po limicie `.github/workflows/nightly.yml:23`; ostatni wynik 61,08 na ebd8471 (`dowody/testy-jakosc.txt`, A).
- Mechanizm: limit stały przy rosnącym zestawie.
- Powraca: nie
- Wzorzec lub źródło: wzorce „Koszt CI” (limit z pomiaru, rośnie z danymi); moduł własności (Stryker tylko domena).
- Kroki w aplikacji: brak.
- Opcje: (a) Stryker z `--incremental` i `testRunner` tylko na `src/core` — krótszy przebieg; (b) osobny workflow tygodniowy z limitem 300 min. Rekomendacja: (a), pomiar przed zmianą limitu.
- Test akceptacyjny: nightly zielony z raportem Strykera.
- Status: otwarte

### 07-jakosc-008 · Brak jednej listy „tylko telefon” i bramek wydania na wzór `trening` (39, 42)
- Pozycja listy kontrolnej: JAK-12
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P (decyzja produktowa)
- Dowód: `dowody/trening-porownanie.txt`; kroki na telefonie rozproszone w `docs/wznowienie-M3.md:14`, `docs/wydanie/sklep.md:27`, `docs/20-definicja-ukonczenia.md:16`; D-124 (`docs/decyzje.md:639`) stwierdza brak odpowiedników 39/41/42.
- Mechanizm: wyniki z telefonu bez miejsca na build, datę i wynik — nie da się ich policzyć do werdyktu.
- Powraca: nie
- Wzorzec lub źródło: `trening` `docs/39-lista-kontrolna-wydania.md`, `docs/42-plan-wydania-1.0.md` §1 (commit 2e4b0f8).
- Kroki w aplikacji: —
- Opcje: (a) rola 10 (tor C) tworzy `docs/39`-odpowiednik z ID, polem „dlaczego nie automat”, buildem i datą — wejście: sekcja „Nie sprawdzono” tego raportu; (b) lista w `docs/wznowienie-M3.md` — szybciej, bez ID. Rekomendacja: (a).
- Test akceptacyjny: każda pozycja „Nie sprawdzono” z tego raportu ma wiersz z wynikiem na buildzie kandydata.
- Status: otwarte

### 07-jakosc-009 · Kod zewnętrzny w CI bez przypięcia; wymuszone nadpisanie tagu
- Pozycja listy kontrolnej: JAK-10
- Poziom: P2
- Realność: teoretyczny · Pewność: wysoka
- Rodzaj: D
- Dowód: `.github/workflows/e2e-ios.yml:112` instalator Maestro przez `curl | bash`; akcje `actions/*` przypięte do tagów, nie SHA; brew bez wersji (`dowody/ci-stan.txt`); `.github/workflows/testflight.yml:329` i `.github/workflows/testflight.yml:330` — `git tag -f` i `git push --force`.
- Mechanizm: zaufanie do zmiennego źródła przy buildzie podpisywanym sekretami (testflight nie używa Maestro — ryzyko ogranicza się do E2E).
- Powraca: nie
- Wzorzec lub źródło: JAK-10.
- Kroki w aplikacji: —
- Opcje: (a) przypięcie SHA akcji, pobranie Maestro z wydania z sumą kontrolną, tag bez `-f` (błąd przy istniejącym); (b) bez zmian do 1.1. Rekomendacja: (a) dla tagu przed 1.0, reszta w 1.1.
- Test akceptacyjny: test workflowu odrzuca `tag -f` i `| bash`.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- Testy DST dla `src/lib/plan-za-pozno.ts`, `godzina-gotowe.ts`, `godziny-snu.ts`, `czas-temu.ts` i nazw kopii w powtórzonej godzinie (`src/lib/backup.ts:65`) — subagent nie znalazł; brakuje odczytu testów pośrednich.
- `src/core/__tests__/plan-ics-d8.test.ts:65` ustawia `process.env.TZ` w piaskownicy Jest, co według helpera strefy nie działa — czy test sprawdza to, co mówi.
- Blokery NFR-DANE-003, NFR-DANE-004, NFR-OFF-001, NFR-PRYW-001 bez ID w testach (`dowody/blokery-brd.txt`) — zachowanie prawdopodobnie pokryte bez ID.
- Brak fixture bazy z buildów 1017–1019 do testu aktualizacji (jest 1014).
- Daty przejść DST 2026-10-25 i 2027-03-28 wpisane na sztywno w `src/scheduler/__tests__/reverse-scheduler-dst.test.ts` — w 2028 nie trafią w przejście.
- Czy instalator Maestro honoruje `MAESTRO_VERSION`.

## Co działa dobrze i należy zachować
- 8 z 8 mutantów w funkcjach ryzyka wysokiego zabitych, w tym reguła pleśni — testy potrafią paść.
- Macierz 7 stref z helperem strefy i wyrocznią DST przez Intl; fast-check ze stałym ziarnem, w nightly losowym i wypisywanym.
- Ścieżki utraty danych testowane na prawdziwym node:sqlite i fixture z wydanego buildu 1014.
- Job E2E naprawdę buduje Release i steruje symulatorem, z kontrolą negatywną, która musi paść.
- `CLAUDE.md` przy każdej zasadzie mówi, co ją egzekwuje, i uczciwie nazywa braki automatu.
- Repo publiczne, każdy workflow ma `permissions` i `timeout-minutes`, brak `pull_request_target`.

## Decyzje dla właściciela
1. 001: (a) streszczenie offline w aplikacji czy (b) zdjęcie scenariusza z blokerów. Rekomendacja (a).
2. 002: (a) pętla stref w testflight.yml czy (b) wyzwalacze + zasada. Rekomendacja (a).
3. Lista „tylko telefon” na buildzie TestFlight z tej nocy: BR-CZAS-002, zakupy w piaskownicy, VoiceOver ostrzeżeń, aktualizacja 1019 → kandydat z trwającym wypiekiem. Kto i kiedy (czas właściciela ok. 60–90 min).
4. Strategia testów (`docs/jakosc/strategia.md` nie istnieje): (a) rola 07 build od E1 na obecnym kodzie, (b) bez strategii, rejestr ryzyk z tego raportu jako tańsza kontrola. Noc: (b), D-125 (noc, do weta).

## Proponowane polecenie naprawy
`node tools/assemble.mjs 07-jakosc --tryb fix --zadania 07-jakosc-002,07-jakosc-003,07-jakosc-005,07-jakosc-006,07-jakosc-007,07-jakosc-009`
`node tools/assemble.mjs 08-programista --tryb fix --zadania 07-jakosc-001,07-jakosc-004`
Potem: `node tools/assemble.mjs 07-jakosc --tryb reaudit --baza <sha>` po wynikach z telefonu.

`git status --porcelain` na początku: pusto (0 linii). Na końcu (przed commitem): ` M docs/decyzje.md` (D-125) i `?? docs/noc-2026-11-02/` — kod aplikacji, testy i workflowy nietknięte; kopia do mutacji usunięta (`git worktree remove`).
