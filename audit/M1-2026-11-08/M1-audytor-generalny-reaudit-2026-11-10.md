# Reaudyt: Audytor Generalny — Piekarz — 2026-11-10 (pętla 2, ostatnia według D-043)
Commit: 1c723632 (`redesign/piekarz-2026-10-22`) · Baza: ea249c9c · Tryb: reaudit · Środowisko: Linux, Node 22, kopia robocza `git worktree` z `npm ci` (kod 0); brak Xcode i symulatora; render Expo web nie działa (dwie próby roli 04); GitHub tylko do odczytu przez MCP.

## Podsumowanie

Z czterech zadań P1 naprawionych w partii 4/4b trzy są zweryfikowane (087, 088, 089), a 005 zostaje otwarte: naprawa działa na pierwszym kroku po polsku i angielsku, ale na kroku pieczenia w garnku ostrzeżenie „Gorące naczynie” wypada pod paskiem kciuka, a test akceptacyjny tego kroku ani innych języków nie liczy. Wynik 005 potwierdziła weryfikacja przeciwna. 066 (E2E) jest zweryfikowane u źródła, 067 (nightly) czeka na scalenie do `master`. Pozycja 017 (zrzuty) jest P1 rozwiązanym decyzją właściciela dla wydania TestFlight (KO-014). Nowych P0, P1 i P2 nie ma; dziewięć nowych pozycji to P3 (D-288). To druga i ostatnia pętla: dla 005 raport podaje opcje do decyzji właściciela zamiast trzeciej naprawy.

| ID | Poziom | Wynik | Dowód |
|---|---|---|---|
| M1-audytor-generalny-005 | P1 | nadal otwarte (naprawione częściowo) | raport roli 04 i weryfikacja przeciwna (`reaudit-2026-11-10/weryfikacja/005.md`); szczegóły niżej |
| M1-audytor-generalny-087 | P1 | zweryfikowane | test akceptacyjny na prawdziwym SQLite: 1c723632 kod 0, ea249c9c kod 1 (`bake_sessions` 0 zamiast 2); sonda 12 przypadków brzegowych kod 0 (rola 12) |
| M1-audytor-generalny-088 | P1 | zweryfikowane | plany rye_100_pan, borodinsky_rye, latvian_scalded_rye przy 50% żyta bez liczb spoza danych i bez „brioszk”; 94 testy kod 0, na ea249c9c 12 z 22 czerwonych z właściwego powodu (rola 06) |
| M1-audytor-generalny-089 | P1 | zweryfikowane | D-317 wykonane: start, planowanie, kalendarz i kopiowanie planu brioszki zablokowane (rola 06); reszta: 103 |
| M1-audytor-generalny-066 | P2 | zweryfikowane | run 42725323063, head_sha 1c723632, próba 2: pl 6/6, en 6/6, kontrola negatywna czerwona zgodnie z założeniem, Basic 5/5 (rola 07, odczyt MCP GitHub) |
| M1-audytor-generalny-067 | P2 | nadal otwarte (czeka na scalenie) | nightly biega tylko z `master`, naprawy c0614ee9 tam nie ma; ostatni przebieg #26 anulowany na Strykerze (rola 07) |
| M1-audytor-generalny-017 | P1 | nienaprawione; rozwiązane decyzją właściciela dla TestFlight | KO-014 (`docs/koordynacja/decyzje.md` na gałęzi `koordynacja`); repo bez zmian od ea249c9c (rola 10) |
| M1-audytor-generalny-032 | P2 | nienaprawione; krok właściciela | repo bez zmian od ea249c9c; wymaga buildu TestFlight (rola 12) |
| M1-audytor-generalny-102 | P3 | nowe | 12-niezawodnosc-701: import pomija wypieki ponad limit bez komunikatu |
| M1-audytor-generalny-103 | P3 | nowe (reszta 089) | 06-tresci-701: plan brioszki po „Piecz ponownie” nadal pokazuje oś czasu |
| M1-audytor-generalny-104 | P3 | regresja (od 088) | 06-tresci-702: odesłanie do karty „O recepturze” bez dojścia z prowadzenia |
| M1-audytor-generalny-105 | P3 | regresja (od 089) | 06-tresci-703: `kontrole-tresci.mjs` kod 1 po dodaniu `powody-bez-planu.md` |
| M1-audytor-generalny-106 | P3 | regresja (od 005) | 04-studio-projektowe-701 i 09-lokalizacja-702: zwarty pasek kciuka łamie słowa |
| M1-audytor-generalny-107 | P3 | regresja (od 005) | 04-studio-projektowe-702: „Krok n z m” łamie się na znaki przy 320 pt |
| M1-audytor-generalny-108 | P3 | istniało wcześniej | 04-studio-projektowe-703: AX5 na 320×568, pasek kciuka ok. 400 z 568 pt |
| M1-audytor-generalny-109 | P3 | regresja (od 089) | 10-wydanie-701: opis sklepu i README podają 11 receptur z planem, jest 10 |
| M1-audytor-generalny-110 | P3 | istniało wcześniej | „Tests across Timezones” czerwony 7/7 na 1c723632; szczegóły niżej |

Liczby: zweryfikowane 4 (087, 088, 089, 066), nadal otwarte 2 (005 P1, 067 P2), nienaprawione z krokiem właściciela 2 (017, 032), nowe P3 9 (w tym regresje 5, istniało wcześniej 2).

## Zakres i metoda

- Pętla 2 (wpisy `reaudyty` w planie: 1 → ten jest drugi). Kryterium zakończenia: brak otwartych P0/P1 poza rozstrzygniętymi decyzją właściciela i bez nowych regresji P0/P1. Kryterium niespełnione przez 005; trzeciej pętli nie zlecam (D-043).
- E0: `git status --porcelain` pusty na początku i na końcu w kopii roboczej badanego commitu; `git diff --stat ea249c9c..1c723632`: 145 plików, 9 commitów (99 słowników i18n, 6 plików `src/components/stolnica`, testy, dokumenty).
- STOP 1 rozstrzygnął koordynator (KO-013, wariant A): cztery grupy subagentów, najwyżej trzy naraz — G1 role 12 i 05, G2 role 06 i 09, G3 rola 04, G4 role 07 i 10. Kilka ról w jednym kontekście to wyjątek nazwany (zasada 7). Role 01, 02, 03, 08, 11 nie miały zadań ani zmienionych plików i nie były uruchamiane.
- Niezależność (D-015): subagenci dostali prompt roli (złożony z `prompts` @ f701ce97), plik zadań i zakaz czytania uzasadnień naprawiającego oraz raportów innych ról; każdy raport ma nagłówek „Commit: 1c723632”. Polecenia: `reaudit-2026-11-10/prompty/`.
- Kontrola dowodów (GEN-05): `sprawdz-raport.mjs` uruchomiłem sam na siedmiu raportach ról i na pliku weryfikacji — wszystkie kod 0 (`reaudit-2026-11-10/dowody/sprawdz-*.txt`).
- Weryfikacja przeciwna (GEN-10): jedyne otwarte P1 po scaleniu (005) sprawdził świeży subagent bez uzasadnień autora: potwierdzone, z jedną poprawką szczegółu.
- Bramki lokalne: `npm run verify` kod 0 w 207 s (654 zestawy, 6831 testów, macierz 1685/1685, lint 0 błędów) — rola 07, po zakończeniu pozostałych grup.
- Próbka regresji M1 spoza zmienionych plików: zakaz wywołań sieciowych (`tests/public-repo.test.ts`), ochrona `state_corrupt_*` (dwa pliki testów) — 12 testów kod 0; `npm run check:licenses` kod 0 (`reaudit-2026-11-10/dowody/m1-probka-regresji-*.txt`).
- Analogia D-289: nie była potrzebna — nie podjąłem żadnej nowej decyzji; numery D-320…D-329 niewykorzystane.

## Decyzje i punkty polecenia B2

| Punkt | Wynik | Dowód |
|---|---|---|
| D-317 (brioszka bez planu; krok pieczenia bez cudzych liczb) | wykonane; reszta w 103 (oś czasu widoczna po „Piecz ponownie”) | rola 06 |
| D-318 (na pasie tytuł, czas, „potem …”; Spirala w karcie „Plan wypieku”) | wykonane | rola 04, zrzuty z E2E #103 |
| D-319 (niski ekran: zwarty pas i pasek kciuka; „Zrobione” 48 pt) | wykonane w kodzie; próg 700 pt i warunek skali tekstu są w kodzie i teście; 48 pt zmierzone na zrzucie z symulatora; skutki uboczne: 106, 107 | rola 04 |
| KO-008 (N8 nie wdrażać; 320×568 w partii 4b) | wykonane: `.github` bez zmian, w `.maestro` tylko asercja `step-warning` | rola 07 |
| KO-009, KO-010 (E2E #103 na 1c723632; ponowienie bez zmian w kodzie) | wykonane: ten sam run, próba 2, ten sam SHA | rola 07 |
| M2-p4-N9 (320×568 i dwa wypieki) | potwierdzone: ok. 80 pt ostrzeżenia pod przełącznikiem wypieków; P3 brzegowy trafne; nie zgłaszam ponownie | rola 04 (rachunek) |
| KO-014 (017: TestFlight bez zrzutów) | zapisane w planie w polu `decyzja_wlasciciela`; zadanie zostaje przed zgłoszeniem do App Store | plan |

## Znaleziska (szczegóły)

### M1-audytor-generalny-005 · Na kroku pieczenia w garnku ostrzeżenie „Gorące naczynie” jest pod paskiem kciuka; test akceptacyjny liczy tylko pierwszy krok po polsku i angielsku
- Pozycja listy kontrolnej: SP-07, LOK-08, JAK (jakość testu); GEN-14
- Poziom: P1 (bez zmiany; weryfikator: P1 pasuje, pewność średnia)
- Realność: realny · Pewność: średnia (rachunek wysokości z kodu, nie pomiar; wniosek utrzymuje się w wariancie optymistycznym z brakiem 67–119 pt)
- Rodzaj: D
- Dowód: `src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:141` „for (const jezyk of ['pl', 'en'] as const) {”; rachunek dla kroku „Wypiek z parą i rumienienie”: 393×852 pl — dół ostrzeżenia 831 pt przy oknie do 672 pt; 320×568 pl — 701 pt przy oknie do 504 pt (weryfikacja przeciwna, `reaudit-2026-11-10/weryfikacja/005.md`). Góra pola ostrzeżenia wystaje 6–28 pt nad krawędź, więc na urządzeniu może być widoczny sam tytuł.
- Mechanizm: ostrzeżenie jest rysowane pod kartą instrukcji; krok pieczenia ma najdłuższą instrukcję (310 znaków pl, 329 en), więc pole ostrzeżenia zaczyna się przy dolnej krawędzi widocznej treści. Na pasie nie ma ostrzeżenia ani plakietki, ekran nie przewija się sam. Na pierwszym kroku przy 393×852 dół ostrzeżenia wypada pod „Zrobione” w 18 z 35 języków (dla de, fr, ru w granicy błędu; fi, id, ms, sv, nb, es-419 także w wariancie optymistycznym).
- Powraca: tak (04-studio-projektowe-001 z audytu; pętla 1: otwarte; pętla 2: otwarte) → trwała kontrola w teście akceptacyjnym niżej.
- Wzorzec lub źródło: D-319 odrzuca wariant „ostrzeżenie po przewinięciu” jako bezpieczeństwo poza pierwszym ekranem (`docs/decyzje.md:1850`).
- Kroki w aplikacji: receptura w garnku → „Zacznij wypiek” → krok „Wypiek z parą i rumienienie”.
- Co łagodzi: to samo ostrzeżenie jest w pierwszym ekranie na poprzednim kroku (nagrzewanie, 45 min) w pl i en; testuje tylko właściciel, po polsku (CLAUDE.md, stan projektu).
- Opcje (pętla ostatnia, do decyzji właściciela):
  1. Inne podejście u roli 04: na krokach z ostrzeżeniem pole ostrzeżenia nad kartą „Co zrobić” oraz test układu dla wszystkich kroków z ostrzeżeniem i wszystkich języków — kompromis: zmiana makiety prowadzenia, długa instrukcja pieczenia kończy się pod zgięciem.
  2. Przyjęcie ryzyka decyzją na czas TestFlight (jak KO-014 dla 017), naprawa przed zgłoszeniem do App Store; tańsza kontrola zamiast żadnej: zrzut kroku pieczenia z telefonu właściciela (rachunek zastąpiony pomiarem) — kompromis: przeczy uzasadnieniu D-319, P1 zostaje w planie.
  3. Krótsza treść kroku pieczenia (rola 06: instrukcja osobno dla fazy pod pokrywką i bez) — kompromis: nie rozwiązuje innych języków ani innych kroków.
  Rekomendacja: 2 teraz (TestFlight, jeden tester, język polski) razem ze zrzutem z telefonu, a 1 jako zadanie przed App Store razem z 106 i 107; 3 odradzam jako samodzielne rozwiązanie.
- Test akceptacyjny: dla każdego kroku planu z ostrzeżeniem (w tym pieczenie w garnku) przy 393×852 i 320×568 dół ostrzeżenia nie niżej niż góra paska kciuka, w każdym języku z ACTIVE_LANGS albo w zakresie języków zapisanym decyzją; zrzut kroku pieczenia z symulatora lub telefonu.
- Status: otwarte

### M1-audytor-generalny-110 · Workflow „Tests across Timezones” jest czerwony w 7 z 7 stref na badanym commicie
- Pozycja listy kontrolnej: JAK (stan CI), zasada wspólna 21; GEN-14
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: bramka-CI); istniało wcześniej (test jest w ea249c9c)
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: run 42724467509, head_sha 1c723632: 7/7 jobów „1 failed, 6830 passed”; pada `tests/dziennik-wydan-tagi-079.test.ts:39` „if (process.env.CI) expect(lista.length).toBeGreaterThan(0);” z wynikiem 0 (`reaudit-2026-11-10/dowody/m1-tests-tz-czerwony.txt`, odczyt MCP GitHub 2026-11-10).
- Mechanizm: test 079 wymaga tagów, gdy `CI=true`; `ci.yml` pobiera pełną historię (`.github/workflows/ci.yml:29` „fetch-depth: 0”), a `tests-tz.yml` nie — `grep -c fetch .github/workflows/tests-tz.yml` → 0 trafień. Lokalnie `npm run verify` jest zielone, bo bez `CI` test nie wymaga tagów.
- Powraca: nie (pętla 1 tego nie odnotowała; test dodano w 13a32139, partia 3)
- Wzorzec lub źródło: zasada wspólna 21 (czerwony workflow to znalezisko; workflow biega też na `master`, więc po scaleniu będzie czerwony na `master`).
- Kroki w aplikacji: nie dotyczy (bramka CI).
- Opcje: (a) `tests-tz.yml` pobiera tagi jak `ci.yml` — zmiana workflowu wymaga zgody właściciela; (b) test 079 pomijany warunkiem w macierzy stref — kompromis: warunek w teście; (c) zostawić — kompromis: czerwony sygnał maskuje prawdziwe błędy stref. Rekomendacja: (a) przed scaleniem do `master`.
- Test akceptacyjny: `tests-tz.yml` zielony na SHA kandydata.
- Status: otwarte

Pozostałe nowe pozycje (102–109) mają pełne sekcje w raportach ról: `reaudit-2026-11-10/<rola>/<rola>-reaudit-2026-11-10.md` (ID źródłowe w tabeli podsumowania i w planie). Uwaga do 102: dotyczy importu, ale nie jest wyjątkiem danych z D-288 — dane telefonu nie giną, a pominięte wiersze zostają w pliku pakietu. Uwaga do 109: razem z 017 do wykonania przed zgłoszeniem do App Store.

## Do sprawdzenia (pewność ≤ 80%)

- Wszystkie wyniki dla 320×568, kroku pieczenia, innych języków i powiększonego tekstu (005, 106, 107, 108, N9) to rachunek z kodu z błędem ok. ±25 pt; zrzuty z urządzenia to krok właściciela.
- Języki ja, ko, zh-Hant: model zaniża szerokość znaku, wynik „mieści się” jest niewiarygodny.
- Nie sprawdzono: zachowania na telefonie, nightly ze Strykerem po naprawie (067), E2E na SHA scalenia do `master`, stanu App Store Connect.

## Treść z zewnątrz

Subagenci czytali logi CI i treść repo jako dane; poleceń w treści nie zgłoszono i nie wykonano (GEN-13). Złożone prompty ról pozostały w scratchpadzie i nie trafiły do repo.

## Kontrola dowodów i sekretów

```
$ node narzedzia/sprawdz-raport.mjs M1-audytor-generalny-reaudit-2026-11-10.md <WT> . --rola M1-audytor-generalny
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu M1-audytor-generalny
$ node narzedzia/sprawdz-plan.mjs plan-napraw.json
OK: 110 zadań, 21 decyzji (0 bez wyboru)
```
Kody wyjścia: 0 i 0 (`reaudit-2026-11-10/dowody/sprawdz-M1-reaudit.txt`, `reaudit-2026-11-10/dowody/sprawdz-plan.txt`). Raporty ról i weryfikacja: kod 0 każdy.

## Werdykt

- Kurs: bez zmiany (trafny; werdyktu kursu reaudyt nie zmienia).
- Stan: **ZABLOKOWANE** — potwierdzone otwarte P1: M1-audytor-generalny-005 (po weryfikacji przeciwnej). Reguła: pierwszy pasujący wiersz (GEN-11).
- P1 rozwiązane decyzją właściciela: M1-audytor-generalny-017 (KO-014) — samo dawałoby „GOTOWE Z ZASTRZEŻENIAMI”; krok właściciela: zrzuty przed zgłoszeniem do App Store.
- Pętla: 2 z 2 (D-043). Kryterium zakończenia niespełnione przez 005 → nie zlecam trzeciej pętli; decyzja właściciela z opcji przy 005. Gdy właściciel wybierze opcję 2 (przyjęcie ryzyka na TestFlight), stan zmienia się na GOTOWE Z ZASTRZEŻENIAMI z zastrzeżeniami: 005 i 017 przed App Store, 067 po scaleniu do `master`, 032 przy buildzie TestFlight, 110 przed scaleniem do `master`, wyniki układu z rachunku do potwierdzenia zrzutem.
- Następny krok (STOP 2): decyzja właściciela w sprawie 005; potem rola 10 (wydanie TestFlight) albo M2 dla opcji 1. P3 102–110: backlog 1.0.1.

### Decyzja właściciela po STOP 2 (2026-11-10)

Słowa właściciela w sesji reaudytu: „Zgodnie z rekomendacja.” Dotyczy M1-audytor-generalny-005: opcja 2 teraz (przyjęcie ryzyka na czas TestFlight; kontrola zastępcza: zrzut kroku pieczenia w garnku z telefonu właściciela), opcja 1 (ostrzeżenie nad kartą „Co zrobić” i test układu wszystkich kroków z ostrzeżeniem i języków, rola 04) przed zgłoszeniem do App Store, razem z 106 i 107.

- Stan po decyzji: **GOTOWE Z ZASTRZEŻENIAMI** (brak otwartych P0/P1 poza rozwiązanymi decyzją właściciela).
- Zastrzeżenia, każde z właścicielem i krokiem:
  - 005 (P1): krok właściciela — zrzut kroku pieczenia z telefonu przy teście TestFlight; rola 04 przez M2 — opcja 1 przed App Store.
  - 017 (P1, KO-014): krok właściciela — zrzuty przed zgłoszeniem do App Store; razem z 109 (opis sklepu: 10 receptur z planem).
  - 067 (P2): rola 07 — nightly po scaleniu do `master`.
  - 032 (P2): krok właściciela — build TestFlight, kontrola dSYM.
  - 110 (P3): zgoda właściciela na zmianę `tests-tz.yml` przed scaleniem do `master`.
  - Wyniki układu z rachunku (320×568, języki, AX): do potwierdzenia zrzutem.
- Wpis do `docs/decyzje.md` aplikacji: przez koordynatora (reaudyt nie zmienia plików aplikacji).
- Następny krok: rola 10 (wydanie TestFlight).

### Zastąpienie decyzji (KO-019, 2026-11-10 07:01 UTC)

Sekcja „Decyzja właściciela po STOP 2” wyżej jest nieobowiązująca. Właściciel rozstrzygnął sprzeczność w czacie koordynatora słowami „Napraw teraz (E2 dalej)” (KO-019 w `docs/koordynacja/decyzje.md` na gałęzi `koordynacja`): obowiązują KO-015 (005 naprawiane przed TestFlight: ostrzeżenie nad kartą „Co zrobić” i test wszystkich kroków i języków; tests-tz naprawiany przed kandydatem) oraz KO-018 (przy 320 pt akcje pasa jako ikony 44 pt).

- Stan: **ZABLOKOWANE** do zweryfikowania naprawy 005 (P1 zatwierdzone do naprawy, nie rozwiązane decyzją); 017 pozostaje rozwiązane decyzją właściciela dla TestFlight (KO-014).
- 005 i 110 nie są już zastrzeżeniami „przed App Store”: naprawia je M2 przed kandydatem TestFlight. Pozostałe zastrzeżenia (017 z 109, 067, 032, wyniki układu z rachunku) bez zmian.
- Naprawa po tej pętli jest decyzją właściciela (KO-015), nie trzecią pętlą zleconą przez M1 (D-043); jej weryfikacja należy do koordynatora (E2E na końcowym SHA według KO-015).
