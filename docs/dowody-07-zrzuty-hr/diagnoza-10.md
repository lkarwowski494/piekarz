# Próbka #10 (run 43397489667, master c6e34ba6, aplikacja z 43218573090) — diagnoza (sesja W, 2026-11-13)

Wejścia: `tylko=hr,nl-NL,pt-PT,ro,vi,cs,fr-CA`, `sceny=05`. Źródło: lista jobów przebiegu, log joba `komplet`, artefakt `zrzuty-dzienniki-iphone-6.9-1` (pobrany 2026-11-13).

## Wynik
- 6 z 6 jobów zrzutów: 5 zielonych (6.9-2, 6.9-3, 6.3-1, 6.3-2, 6.3-3), czerwony **6.9-1** (hr, nl-NL, pt-PT).
- `komplet` czerwony tylko z tego powodu: log joba `komplet`: „##[error]brak nl-NL/iphone-6.9/05-zakwasy.png”, „Pliki: 13, błędy: 1”.
- `nieudane-iphone-6.9-1.txt`: `nl-NL 00-przygotuj`. hr i pt-PT w 6.9-1 przeszły.
- **D-400 potwierdzone:** hr przeszło na obu rozmiarach; w 6.9-1 wzorzec stuknął „Dozvoli” (`etykiety.py` na dziennikach: `hr 6.9-1 stuknięty Dozvoli`, `pt-PT 6.9-1 stuknięty Permitir`).

## nl-NL 6,9″: dwie awarie maszyny w obu próbach (klasa: maszyna)
Skrypt `scripts/ci/zrzuty-sklepu.sh:115-124` daje parze `00-przygotuj` + `00-przygotuj-podwojenie` dwie próby.
1. **Próba 1, `00-przygotuj`:** zawieszenie przy starcie aplikacji. `logs/maestro.log` kończy się na „Clearing app state com.apps4brew.baker” (03:39:05), bez wyniku kroku. W `xctest_runner_*.log` sterownika (linia 51): „Failed to get list of active applications: Accessibility error kAXErrorIPCTimeout”.
2. **Próba 2:** `00-przygotuj` przeszło (okno zgody zamknięte); `00-przygotuj-podwojenie` padło na `scrollUntilVisible zakwas-podwoil-btn` (limit 30 s). W `logs/maestro.log` jest tylko jeden swipe: „09:36:35.995 Swiping UP from center”, a następna linia ma 09:37:18.229 (**42,2 s**). Sterownik zlecił swipe 0,6 s („Swipe (v2) from (220.0, 478.0) to (220.0, 95.0) with 0.601 duration”, xctest 09:36:36). Po jednym swipie limit 30 s był przekroczony → „No visible element found: id: zakwas-podwoil-btn”.
   - Ta sama maszyna, ta sama scena: hr 4,7 / 4,3 / 5,5 / 2,6 s na swipe, pt-PT 4,4 / 4,8 / 4,6 / 2,8 s.
   - Hierarchia z chwili błędu (`step-009-scrollUntilVisible-zakwas-podwoil-btn.json`): ekran Zakwasy z kartą zakładania; „5 uur 59 minuten sinds het voeden”, czyli zegar przestawiony poprawnie. Przycisk leży niżej w karcie (karta do y 1181, widoczne do ~984), więc dane są poprawne i nie było tylko kolejnych przewinięć.
- Nie scenariusz: nl-NL przeszło na 6,3″ w #9 (6.3-3) i w #10 (6.3-1), etykieta „Sta toe” potwierdzona (#9).
- Ocena: **brzegowe** (losowa wydajność maszyny; dwie niezależne awarie w jednym jobie), bez ryzyka dla danych użytkownika.

## Opcje
| opcja | koszt | kompromis |
|---|---|---|
| A. Ponowić tylko nl-NL 6,9″ (`tylko=nl-NL`, `sceny=05`, ta sama aplikacja) | 1 job macOS (~50 min), bez zmian w kodzie | przy pechu maszyny może paść znowu |
| B. Limit `scrollUntilVisible` podwojenia 30 → 60 s i/lub 3 próby pary w skrypcie | ok. 30 min agenta + test + recenzja; dłuższe przebiegi przy awariach | maskuje wolną maszynę; nie pomaga na zawieszenie startu (próba 1) |
| C. Przyjąć komplet bez nl-NL 6,9″ | 0 | brak ramki 05 nl-NL 6,9″, `komplet` czerwony |

Rekomendacja: A (przyczyna poza scenariuszem); B tylko, jeśli ten sam objaw wróci w pełnym przebiegu.
