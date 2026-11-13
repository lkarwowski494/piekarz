# E2E #125 (run 43397474441, push master c6e34ba6) — diagnoza (sesja W, 2026-11-13)

Źródło: log joba „Maestro E2E on iOS Simulator” (job 131791843663) i artefakt `maestro-e2e` (pobrane 2026-11-13). #124 (dispatch, ten sam SHA) zielone.

## Wynik
- pl: „6/6 Flows Passed in 8m 7s”. **en-US:** „[Failed] 06-koniec-wypieku (2m 33s) (Assertion is false: id: bake-log-card-.* is visible)”, „1/6 Flow Failed” (log joba, 10:01:13). Kontrola negatywna, e2e-basic, e2e-zakup: zgodnie z oczekiwaniem.
- Krok: `.maestro/e2e/06-koniec-wypieku.yaml:86-91` — `tapOn tab-dziennik`, potem `extendedWaitUntil bake-log-card-.*` (15 s).

## Co jest na ekranie (zrzut `e2e-125-06-en-blad.png`, hierarchia `step-026`)
- Karta **Today**, nie Journal: „What are you doing today?”, w kalendarzu „Friday, November 13, today. 10:00 AM Wiejski chleb codzienny na zakwasie: rated 4 out of 5”. Wypiek zapisany z oceną 4 — dane są, brak tylko przełączenia karty.

## Dlaczego (maestro.log tego przepływu)
- Stuknięcie „finish-save-btn”: 09:59:56 → „Something have changed in the UI” dopiero 10:00:13 (17 s).
- „Tap on id: tab-dziennik”: element znaleziony 10:00:16 („accessibilityText=Journal … bounds=[301,791][402,840]”), stuknięcie (351, 815) o 10:00:21, „Something have changed…” 10:00:52 (31 s), krok COMPLETED.
- Mimo to po 18 s czekania ekran to Today. Najbardziej prawdopodobne: stuknięcie karty trafiło w trakcie przejścia po zapisie oceny (powrót na Today), które je nadpisało [DO USTALENIA: czy zapis nawiguje na Today — nie sprawdzałem kodu `app/`]. Ten sam przepływ w pl przeszedł na tej samej maszynie (2m 25s), a #124 na tym SHA zielone.
- Objaw maszyny: wolne odpowiedzi hierarchii (17 s i 31 s na stuknięcie; w pl kroki trwają sekundy). `kAXErrorIPCTimeout` w dziennikach tego przebiegu: brak. Ta sama rodzina co #10 (wolna maszyna), inny objaw; i ten sam wzór co #8 6,3-6 („stuknięcie w kartę nie przełączyło karty”).
- Klasa: maszyna/wyścig w scenariuszu (niestabilny test), nie aplikacja. Ocena: **brzegowe**, ale realne dla bramki: czerwony E2E na `master` przy zielonym kodzie (JAK-05/JAK-18).

## Opcje
| opcja | koszt | kompromis |
|---|---|---|
| A. Ponowić E2E na c6e34ba6 | 1 przebieg macOS (~80 min), 0 zmian | wyścig zostaje; wróci przy wolnej maszynie |
| B. Scenariusz: po zapisie czekać na stan docelowy (`extendedWaitUntil` ekranu Today po zapisie), potem `tapOn tab-dziennik` i warunkowe drugie stuknięcie, gdy `bake-log-card-.*` niewidoczny; test w `tests/` pilnujący wzorca | ~45 min agenta + recenzja + 1 przebieg E2E | usuwa wyścig zamiast go maskować; trzeba potwierdzić id ekranu Today |
| C. Dłuższy limit czekania na kartę | ~15 min | nie pomaga: karta nie przełączyła się wcale |

Rekomendacja: B (przyczyna w scenariuszu, bramka musi być stabilna); A tylko jako szybkie odblokowanie, jeśli trzeba zielonego `master` dziś.
