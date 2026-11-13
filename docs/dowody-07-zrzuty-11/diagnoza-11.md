# Zrzuty #11 (run 43427151863, master c6e34ba6, aplikacja z 43218573090) — diagnoza (sesja Z, 2026-11-13)

Wejścia: puste poza `aplikacja_z_przebiegu=43218573090` (34 lokalizacje × 2 rozmiary × 7 scen = 476 ramek). Źródła (odczyt 2026-11-13, narzędzia GitHub MCP): `get_workflow_run`, `list_workflow_jobs` (wyciąg: `joby-11.txt`), `get_workflow_job` i `get_check_run` dla 131891362700, log joba `komplet` (132169700990, końcówka 120 linii). Tylko diagnoza, bez zmian kodu i scenariuszy.

## Wynik
- 28 jobów: `plan` zielony, `build` pominięty (aplikacja z 43218573090), **23 z 24 jobów `zrzuty` zielone**, **`zrzuty (iphone-6.3-2)` anulowany**, `komplet (bez alfy, wymiary, 7 ramek)` czerwony, `podpisy i ramki` pominięty (zależy od `komplet`).
- `komplet`, krok 4 „Alpha off, dimensions and completeness”: 21 błędów, wszystkie z joba 6.3-2 — „##[error]brak el/iphone-6.3/01-plan.png” … „##[error]brak en-CA/iphone-6.3/07-offline.png” (7 scen × el, en-AU, en-CA), potem „Pliki: 455, błędy: 21”. 455 = 476 − 21: wszystkie pozostałe ramki są, bez błędów wymiaru i alfy.
- Artefakt `sklep-zrzuty` (ID 14076743592, 455 plików, 105,8 MB, retencja 14 dni) zawiera komplet poza el/en-AU/en-CA 6,3″.

## Jedyny czerwony: iphone-6.3-2 (el, en-AU, en-CA, 6,3″) — job nie dostał maszyny (klasa a)
- `get_workflow_job 131891362700`: „created_at 12:40:32Z”, „started_at 12:40:32Z”, „completed_at 17:18:45Z”, „conclusion cancelled”, **„runner_id 0”, „runner_name ""”**; brak kroków w `list_workflow_jobs` (pozostałe joby mają 25 kroków), log: HTTP 404 (nie powstał), check run bez treści („summary "", text ""”).
- Czyli: 4 h 38 min w kolejce bez przydzielonej maszyny `macos-26`, potem anulowanie. Żadna scena nie ruszyła, więc nie ma kroku, zrzutu ani komunikatu Maestro.
- `timeout-minutes: 150` (`.github/workflows/zrzuty-sklepu.yml:145`) liczy się od startu na maszynie, więc nie on anulował. Kto anulował: [DO USTALENIA] — interfejs GitHub nie anuluje pojedynczego joba macierzy, a reszta przebiegu biegła dalej, więc najpewniej sam GitHub (przydział maszyny nieudany); źródła limitu kolejki dla runnerów GitHub nie czytałem.
- Slot `max-parallel: 4` (`.github/workflows/zrzuty-sklepu.yml:148`): 6.3-2 nie blokował slotu (przy nim biegły równocześnie 4 inne joby, np. 13:33–14:09 i 15:52–15:58; `joby-11.txt`). Pozostałe 6,3″ ruszyły dopiero po 6,9″ (kolejność macierzy).
- Klasa **(a) maszyna/infrastruktura**. Nie (b): poprawka Y w 98efd38b zmienia tylko `.maestro/e2e/06-koniec-wypieku.yaml` i `.maestro/zrzuty-sklepu/00-przygotuj-podwojenie.yaml` (czekanie na `start-czynnosci` po `finish-save-btn` i warunkowe drugie `tapOn tab-dziennik`) — tu żaden krok scenariusza nie wystartował, więc Y przyczyny nie obejmuje i nie musi. Nie (c)/(d): ten sam zestaw scen przeszedł w 23 jobach (w tym el/en-AU/en-CA na 6,9″ w 6.9-2).
- Realność: **brzegowe** (losowy brak maszyny macOS), bez ryzyka dla danych użytkownika; realne dla kompletu do wysyłki (21 ramek brak).

## Porównanie z #10 i E2E #125
- #10: awaria maszyny w trakcie sceny (`kAXErrorIPCTimeout`, 42 s na swipe). #11: awaria przed startem — inny objaw, ta sama klasa (a).
- E2E #125: wyścig po zapisie oceny (`06-koniec-wypieku`), naprawiony przez Y. W #11 na c6e34ba6 (bez Y) para `00-przygotuj` + `00-przygotuj-podwojenie` przeszła we wszystkich 23 jobach z maszyną (komplet ma 05/06 dla 33 lokalizacji × 2 rozmiary poza 3 z 6.3-2). Czy któryś job zużył drugą próbę pary (`scripts/ci/zrzuty-sklepu.sh:115-124`): nie sprawdzono.

## Czas maszyn
- 23 joby z maszyną: 1 609 min macOS łącznie; 33–97 min na job, średnio 72 min dla 6,3″. Kolejka przebiegu 12:40 → ostatni job 21:06 (8 h 26 min przy `max-parallel: 4`).

## Opcje
| opcja | czas macOS | kompromis |
|---|---|---|
| A. Ponowić tylko brakujące: `tylko=el,en-AU,en-CA`, `rozmiary=6.3`, sceny puste, `aplikacja_z_przebiegu=43218573090`, na master 98efd38b | 1 job, ok. 70–80 min (+ kolejka) | komplet z dwóch przebiegów (455 z #11 + 21 z nowego) trzeba złożyć ręcznie przed ramkami/wysyłką; scenariusze 98efd38b ≠ c6e34ba6 tylko w czekaniach po zapisie oceny (stan końcowy i ramki te same); artefakt aplikacji wygasa 15.11 12:56 UTC |
| B. Pełny przebieg na 98efd38b z tą samą aplikacją | 24 joby, ok. 1 600 min (~8,5 h z kolejką) | jeden SHA i jeden artefakt `sklep-zrzuty`, `komplet` i `ramki` w jednym przebiegu; 20× droższy, ta sama szansa awarii maszyny |
| C. Poprawka workflowu (np. ponowienie joba bez maszyny) | 0 teraz + praca agenta i przebieg informacyjny | nie ma ruchu po stronie scenariusza do naprawienia; automatyczne ponowienie przy jednym zdarzeniu bez wzoru to nadmiar |

Rekomendacja: **A** (przyczyna poza scenariuszem i aplikacją; brakuje 21 z 476 ramek). B, jeśli do wysyłki wymagany jest komplet z jednego przebiegu i jednego SHA (decyzja właściciela, JAK-16). Uruchomienie przed 15.11 12:56 UTC albo z budową aplikacji (~40 min).

## Nie sprawdzono
- Kto/co anulował 6.3-2 i limit kolejki runnerów GitHub (brak logu; [DO USTALENIA]).
- Treść 455 ramek (artefakt nie pobrany ani nie obejrzany); logi i dzienniki zielonych jobów (ponowienia pary 00-przygotuj, `nieudane-*.txt`).
- Widoczność repo i koszt w USD minut macOS.
Kontrola sprawdz-raport.mjs (2026-11-13): OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone (kod 0).
