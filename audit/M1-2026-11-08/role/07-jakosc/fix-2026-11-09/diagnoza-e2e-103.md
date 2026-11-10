# Diagnoza iOS E2E #103 (run 42725323063) — rola 07, tryb diagnozy, tylko odczyt

Data: 2026-11-10. Repo `lkarwowski494/piekarz`, gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p4` @ `1c723632`, job 129529738606, runner `macos-26` (OS 26.7.2, Xcode 26.6), Maestro 2.11.0, iPhone 17 Pro (sim, UDID FCC5F673-…).
Nic w repo nie zmieniono (poza tym plikiem raportu); nie uruchomiono żadnego workflow. Kopie: scratchpad
`/tmp/claude-0/-home-user-piekarz/8eebabd9-216b-5dbb-83c0-ed801aa300ba/scratchpad/e2e103/` (`logs/job103.log` z narzędzia `mcp__github__get_job_logs`, `art103/` = artefakt `maestro-e2e`, id 13726675514).

## Wynik w skrócie

- Przepływ / krok: **żaden**. W kroku 10 „Run E2E flows (.maestro/e2e, pl_PL)” Maestro nie uruchomił ani jednego przepływu: padł przy starcie sterownika XCUITest, zanim otworzył aplikację.
- Komunikat (job log, `logs/job103.log:2140–2142`, 00:44:13Z): `iOS driver not ready in time, consider increasing timeout by configuring MAESTRO_DRIVER_STARTUP_TIMEOUT env variable` (`xcuitest.installer.LocalXCTestInstaller$IOSDriverTimeoutException`, `LocalXCTestInstaller.kt:134`), potem `##[error]Process completed with exit code 1.` (`:2166`). W logu brak jakiejkolwiek linii `[Passed]`/`[Failed]` dla pl.
- Przyczyna: zimny start sterownika Maestro (`xcodebuild test-without-building` z runnerem `maestro-driver-iosUITests`) na świeżo przeładowanym symulatorze (shutdown/boot w kroku pl) trwał dłużej niż limit `MAESTRO_DRIVER_STARTUP_TIMEOUT: 480000` (8 min, `.github/workflows/e2e-ios.yml:55`). Serwer HTTP sterownika wstał ok. 30 s po upływie limitu.
- Klasa: **C (infrastruktura runnera: czas zimnego startu XCTest na symulatorze)**. Nie jest to ani zgubiony dotyk z #101, ani skutek zmian 005/D-319/088/089 (żaden scenariusz się nie wykonał).
- Pewność: **≈95%**.

## Dowody

1. `art103/.maestro/tests/2026-11-10_003538/` (sesja pl) zawiera tylko `maestro.log` i `xctest_runner_2026-11-10_003549.log` — **brak katalogów przepływów, zrzutów ekranu i `device-simulator.log`**. Zrzutu „z chwili błędu” nie ma, bo aplikacja nie została uruchomiona przez Maestro; nie było czego obejrzeć narzędziem Read. Z tego samego powodu nie ma wpisów `canceling paths contacts` / `didn't see a previous touch down` — nie było żadnego stuknięcia.
2. `maestro.log` (pl): 00:35:49.031 `Restarting XCTest Runner (uninstalling, installing and starting)` → 00:35:49.598 start `xcodebuild test-without-building … port 53328` → 1480 linii `Perform XCUITest driver status check … [Failed] … ConnectException: Failed to connect to /127.0.0.1:53328` do 00:43:49 (ostatnia próba ~00:43:49, w tym jeden `SocketTimeoutException` 00:43:36–43). Ani jednego `[Done] … status check`.
3. `xctest_runner_2026-11-10_003549.log`: xcodebuild wystartował 00:35:54, runner zgłosił `Running tests...` dopiero **00:43:48**, `[FlyingFox] starting server 127.0.0.1:53328` o **00:44:19** — po wyjątku Maestro (00:44:06–13). Na końcu `Failing tests: maestro_driver_iosUITests.testHttpServer()` / `** TEST EXECUTE FAILED **` (00:53:00, runner ubity przez następną sesję) — skutek, nie przyczyna.
4. Trend czasu pierwszego (zimnego) startu sterownika w kroku pl, ten sam workflow i ten sam limit 8 min:
   | Run | start runnera → `[Done] status check` |
   |---|---|
   | #100 (job100.log:2295–2298) | 20:54:06 → ~20:59:07, ok. 5 min |
   | #101 (`e2e101/art101/.../2026-11-09_221927/maestro.log`) | 22:19:45 → 22:26:32, **6 min 47 s** |
   | #103 | 00:35:49 → brak (serwer 00:44:19), **> 8 min** |
   Kolejne sesje w tym samym jobie startują szybko: #103 en 00:46:16 → 00:48:52 (2 min 36 s), kontrola negatywna 33 s, Basic 31 s; #101 en 1 min 50 s, kontrola 41 s, Basic 38 s. Wolny jest wyłącznie pierwszy start po shutdown/boot w kroku pl — to on się zbliżał do limitu i w #103 go przekroczył.
5. Workflow bez zmian od #101: `git diff --stat ea249c9c 1c723632 -- .github/ .maestro/` → tylko `.maestro/e2e/03-prowadzenie-widok-skupiony.yaml` (+5/−1, assertVisible `step-warning`). Limit 480000 stoi od `bcf5ac2f`.
6. Zmiany aplikacji są zielone w tym samym runie: en_US 6/6 (`logs/job103.log:2188–2195`), w tym `03-prowadzenie-widok-skupiony` (z nowym `step-warning`, 1 min 8 s) i `06-koniec-wypieku`; Basic 5/5; kontrola negatywna padła zgodnie z oczekiwaniem. Scenariusze są po id, a bundle ten sam dla pl i en (`BUNDLE_E2E_SHA ec604410…`), więc nie da się ich uruchomić „po polsku inaczej” na etapie, do którego pl nie doszedł.

## Rozstrzygnięcie hipotez

- (1) zgubiony dotyk jak w #101 (klasa C): **odrzucone** — brak stuknięć, brak `device-simulator.log`.
- (2) regresja z 005/D-319/088/089 przy pl_PL (klasa A): **odrzucone** — żaden przepływ się nie wykonał; te same przepływy zielone w en_US tego runu.
- (3) niestabilność scenariusza (klasa B): **odrzucone** — porażka przed pierwszym krokiem scenariusza.
- Faktyczna przyczyna: limit startu sterownika XCTest przekroczony przy zimnym starcie — **C**, z elementem konfiguracji workflow (limit bez zapasu wobec obserwowanego trendu 5 → 6:47 → >8 min).

## Proponowana poprawka (C/workflow, nie wdrażana; bez wyłączania testów)

Opcja A (rekomendowana): rozgrzać sterownik przed krokiem pl i ponowić tylko porażkę startu sterownika.
- W kroku „Run E2E flows (.maestro/e2e, pl_PL)” (`.github/workflows/e2e-ios.yml:130–138`) po `bootstatus` uruchomić Maestro raz; jeśli wyjście zawiera dokładnie `iOS driver not ready in time` i nie zawiera żadnego `[Passed]`/`[Failed]`, uruchomić polecenie drugi raz (sterownik jest wtedy zwykle już zainstalowany i rozgrzany). Każdy inny błąd — w tym porażka przepływu — nadal czerwony bez ponowienia, więc prawdziwe błędy aplikacji nie są maskowane.
- Kompromis: +0–3 min przy rzadkiej porażce; nie przesłania regresji, bo ponowienie zależy od komunikatu sterownika, a nie od wyniku przepływów.

Opcja B: podnieść `MAESTRO_DRIVER_STARTUP_TIMEOUT` do 900000 (15 min). Prosta, ale tylko przesuwa próg przy rosnącym trendzie i wydłuża czerwony run, gdy sterownik naprawdę nie wstanie.

Można połączyć (A + umiarkowane 600000). Decyzja należy do koordynatora/właściciela (zmiana CI).

## Proponowany test (najpierw czerwony)

`tests/e2e-ios-workflow.test.ts` (już pilnuje kroków workflow): nowy przypadek „krok pl_PL ponawia tylko porażkę startu sterownika” — parsuje `.github/workflows/e2e-ios.yml`, w `run` kroku `Run E2E flows (.maestro/e2e, pl_PL)` wymaga (a) warunku na tekst `iOS driver not ready in time`, (b) braku bezwarunkowego `|| maestro …`/`continue-on-error` (żeby ponowienie nie maskowało porażek przepływów). Na `1c723632` czerwony z właściwego powodu (krok ma jedno bezwarunkowe wywołanie `maestro … test .maestro/e2e`), zielony po poprawce. Dla opcji B: asercja `MAESTRO_DRIVER_STARTUP_TIMEOUT >= 600000` (czerwona na 480000).

## Otwarte pytania

- [DO USTALENIA] Dlaczego zimny start runnera na `macos-26` rośnie (5 → 6:47 → >8 min); log runnera nie pokazuje nic między 00:35:54 a 00:43:48 (instalacja/uruchomienie przez xcodebuild). Nie sprawdzałem `.xcresult` (nie ma go w artefakcie) ani issue trackera Maestro.
- [DO USTALENIA] Czy proponowana poprawka #101 (ponowienie stuknięcia nawigacyjnego) została wdrożona — nie dotyczy tej porażki.
- Zmiany 005/D-319/088/089 w pl_PL **nie zostały zweryfikowane** przez E2E w tym runie (pl nie doszło do scenariuszy); zielone są tylko w en_US. Potrzebny ponowny przebieg (decyzja koordynatora; nie uruchamiałem).
