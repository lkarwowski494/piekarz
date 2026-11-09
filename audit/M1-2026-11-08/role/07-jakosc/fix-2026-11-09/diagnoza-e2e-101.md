# Diagnoza iOS E2E #101 (run 42705979446) — rola 07, tryb diagnozy, tylko odczyt

Data: 2026-11-09. Repo `lkarwowski494/piekarz`, gałąź `redesign/piekarz-2026-10-22` @ `ea249c9c`, job 129462768309, runner `macos-26`, Maestro 2.11.0, iPhone 17 Pro (sim).
Nic w repo nie zmieniono; nie uruchomiono żadnego workflow. Kopie logów i artefaktu: scratchpad
`/tmp/claude-0/-home-user-piekarz/8eebabd9-216b-5dbb-83c0-ed801aa300ba/scratchpad/e2e101/` (`logs/job101.log`, `logs/job100.log`, `art101/`, `src/.maestro` z `git archive ea249c9c`).

## Wynik w skrócie

- Przepływ: `.maestro/e2e/06-koniec-wypieku.yaml`, krok 7 `assertVisible id: start-bake-btn` (plik:20–21), po `tapOn id: recipe-row-country_loaf_72` (plik:18–19).
- Komunikat (job log, 22:28:03Z): `[Failed] 06-koniec-wypieku (1m 27s) (Assertion is false: id: start-bake-btn is visible)`; pozostałe 5 przepływów pl_PL zielone, `1/6 Flow Failed`.
- Przyczyna: stuknięcie w wiersz receptury zostało zgubione w warstwie dotyku symulatora (backboardd zarejestrował drugi, „nieznany” digitizer, odrzucił zdarzenia ruchu/podniesienia i anulował kontakt). Aplikacja dostała touch-began + cancel, więc `Pressable` nie wywołał `onPress` i ekran został na liście „Receptury”.
- Klasa: **C (infrastruktura runnera / synteza dotyku XCTest–simulator)**, z częścią **B**: scenariusz nie jest odporny na zgubione stuknięcie (twarda asercja zaraz po nawigacyjnym tapnięciu, bez ponowienia).
- Pewność: wysoka (≈90%). Hipoteza daty/godziny: odrzucona (dowody niżej).

## Dowody

1. Zrzut z chwili błędu: `art101/.maestro/tests/2026-11-09_221927/06-koniec-wypieku/screenshots/step-007-assertCondition-start-bake-btn.png` — godzina 22:28, ekran „Receptury”, zakładka Receptury aktywna, pierwszy wiersz „Wiejski chleb codzienny na zakwasie” widoczny w tym samym miejscu, w które celowano. Brak nakładki, alertu, arkusza.
2. `06-koniec-wypieku/logs/maestro.log:21–27`: tap w `recipe-row-country_loaf_72`, bounds `[16,283][386,367]`, punkt `(201, 325)` (środek wiersza, zgodny z zrzutem); Maestro uznał „Something have changed in the UI … Proceed.” i oznaczył tap jako COMPLETED; `:28–29` asercja szuka `start-bake-btn` 17,8 s i pada.
3. `06-koniec-wypieku/logs/device-simulator.log` od linii 117491 (`Tapping 201.0, 325.0`):
   - `backboardd … digitizer attached (sender 103AB82000001)` dwa razy dla tego samego sendera, w tym `*** unknown digitizer …`;
   - 10× `didn't see a previous touch down or range-in event for pathIndex:2; skipping event` (zdarzenia ruchu/podniesienia odrzucone);
   - `cancel -- digitizer did disappear … canceling paths contacts: [pathIndex: 2; … touching; locked; destinations: ((hitTest); contextID: 0xC9CB0655 …` — kontakt wciąż „touching” zostaje anulowany zamiast zakończony; contextID 0xC9CB0655 to okno aplikacji Piekarz (`Sending UIEvent … to window … contextId: 0xC9CB0655`).
   - Dla porównania poprzedni tap (zakładka, 22:27:41) ma czystą sekwencję: `touch down` → `contact 2 presence: none` → `digitizer detached`, bez „unknown”/„skipping”/„canceling paths”.
4. Licznik anomalii we wszystkich 18 logach `device-simulator.log` artefaktu (≈110 stuknięć w pl, en, Basic, kontrola negatywna): `unknown digitizer`, `skipping event` i `canceling paths contacts` występują **wyłącznie** w `2026-11-09_221927/06-koniec-wypieku` (1 / 10 / 1), wszędzie indziej 0.
5. Ten sam kod i ten sam bundle JS: `git diff --stat 6a412c9a ea249c9c` → tylko `docs/wznowienie-M3.md` (+7); `BUNDLE_E2E_SHA` w #100 i #101 identyczny: `5ec5af142efbfb24bc74b28ee9f8a995ddcdd8748f1137735bfd7f302e627971`.
6. Ta sama sekwencja (tap `recipe-row-country_loaf_72` → `start-bake-btn`) przeszła w tym samym runie w przepływach 01, 02, 03 (pl) oraz w 06 en (22:39:10–13Z: `start-bake-btn` widoczny po 0,5 s, `en/.../06-koniec-wypieku/logs/maestro.log:20–29`). #100 (6a412c9a): 06-koniec-wypieku zielony w pl i en.

## Hipoteza daty/godziny — odrzucona

- Symulator działa w UTC (znaczniki `+0000` w `device-simulator.log`). Padający krok był o 22:27:43Z, a ten sam przepływ w en przeszedł o 22:39Z, czyli tego samego dnia w UTC i w Europe/Warsaw (23:27 vs 23:39); 04-plan-na-pozniej (zależny od czasu) przeszedł w pl o 22:29–22:30Z.
- Padający krok to nawigacja lista → ekran receptury, niezależna od daty; zrzut pokazuje poprawnie wyrenderowaną listę.
- Odtworzenie Jest z fałszywym zegarem nie ma sensu: przyczyna leży w warstwie dotyku symulatora, a nie w logice JS, więc żaden test Jest jej nie odtworzy. Nie pisałem takiego testu.

## Dlaczego Maestro nie powtórzył stuknięcia

Maestro po tapnięciu porównuje hierarchię; zmiana (podświetlenie wciśniętego wiersza/przewinięcie) dała „Something have changed … Proceed.”, więc mechanizm `retryTapIfNoChange` i tak by nie zadziałał. Scenariusz od razu wykonuje twardą asercję (`assertVisible`, domyślny limit ~17 s) bez drugiej próby.

## Proponowana poprawka (B, nie wdrażana; bez wyłączania testu)

W `.maestro/e2e/06-koniec-wypieku.yaml:18–21` (i ten sam wzorzec w 01:25/32, 02:29/31, 03:20/22) zamienić „tap + assertVisible” na „tap + czekanie warunkowe + jedno ponowienie, gdy ekran się nie zmienił”:

```yaml
- tapOn:
    id: "recipe-row-country_loaf_72"
# Zgubione stuknięcie w symulatorze (E2E #101, run 42705979446: digitizer anulował kontakt): jedno ponowienie,
# tylko gdy nadal widać listę; przy udanej nawigacji wiersza już nie ma i krok się nie wykonuje.
- extendedWaitUntil:
    visible:
      id: "start-bake-btn"
    timeout: 10000
    optional: true
- runFlow:
    when:
      notVisible:
        id: "start-bake-btn"
    commands:
      - tapOn:
          id: "recipe-row-country_loaf_72"
- extendedWaitUntil:
    visible:
      id: "start-bake-btn"
    timeout: 15000
```

Najlepiej jako wspólny podprzepływ `.maestro/sub/tap-nawigacja.yaml` (parametry: id celu, id oczekiwanego elementu), używany we wszystkich nawigacyjnych tapnięciach. Ponowienie jest bezpieczne: przy udanym pierwszym stuknięciu warunek `notVisible` jest fałszywy; asercja końcowa pozostaje twarda, więc prawdziwy błąd aplikacji (przycisk nie otwiera ekranu) nadal daje czerwony wynik po dwóch próbach.

## Proponowany test (najpierw czerwony)

`tests/e2e-flows-guard.test.ts` (Jest, bez symulatora): parsuje `.maestro/e2e/*.yaml` i dla każdego `tapOn` w id `recipe-row-*` (docelowo: lista id nawigacyjnych) wymaga, by następnym krokiem było `extendedWaitUntil` / `runFlow: sub/tap-nawigacja.yaml`, a nie bezpośrednie `assertVisible`/`tapOn` elementu ekranu docelowego. Na `ea249c9c` czerwony z właściwego powodu w 01, 02, 03 i 06; zielony po poprawce. Uzupełnienie dla C (opcjonalne): krok workflow po porażce, który szuka w `~/.maestro/tests/**/device-simulator.log` wzorca `canceling paths contacts` i dopisuje do podsumowania „zgubiony dotyk symulatora”, żeby kolejna taka porażka była od razu sklasyfikowana.

## Otwarte pytania

- [DO USTALENIA] Czy błąd podwójnej rejestracji digitizera jest znany w Maestro 2.11.0 / Xcode na `macos-26` (nie sprawdzałem źródeł Maestro ani issue trackera).
- [DO USTALENIA] Częstość: w 101 przebiegach to pierwszy znany przypadek tego wzorca? Nie przeglądałem artefaktów starszych runów.
