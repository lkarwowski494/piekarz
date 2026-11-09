# Polecenie: M1-audytor-generalny, tryb reaudit (pętla 1) — Piekarz

Nowa sesja, świeży kontekst (D-015: sprawdzający nie zna uzasadnień naprawiającego). Repo lkarwowski494/piekarz, katalog /home/user/piekarz.

1. Gałąź: `redesign/piekarz-2026-10-22` @ ea249c9c (merge partii 3, 6a412c9a; E2E #100 zielone na 6a412c9a, E2E na ea249c9c uruchamia koordynator M9 `session_01T66VBvnDeKWC3vg8bd7wL9`).
2. Katalog K: /home/user/piekarz/audit/M1-2026-11-08 (w nowym kontenerze: `git fetch origin audit-m1/piekarz-2026-11-08` i skopiuj `audit/M1-2026-11-08` z tej gałęzi; katalog w `.git/info/exclude`).
3. Prompt: `node <prompts>/tools/assemble.mjs M1-audytor-generalny --tryb reaudit --wyjscie /home/user/piekarz/audit/M1-2026-11-08 --baza 2ef8870a`.
4. Wejście: `plan-napraw.json` (68 × naprawione-do-weryfikacji z commitami), `M2-koordynator-napraw-2026-11-09.md`, `naprawy/`, `role/<rola>/fix-2026-11-09/`, `nowe-znaleziska-M2.md`.
5. Reguła D-288: nowe P2 z reaudytu → P3 z klasą (backlog 1.0.1), chyba że dotyczą utraty danych, prywatności albo bezpieczeństwa.
6. Do sprawdzenia szczególnie: decyzje „do weta” D-309, D-310, D-315, D-316 (tryb nocny D-289); 067 (pełny przebieg Strykera dopiero w nightly po scaleniu); bramka `e2e-sha` w testflight.yml (jeszcze nie biegła w CI).
7. Ograniczenia: bez push na master, buildu TestFlight, zgłoszenia do recenzji, zapisu w App Store Connect, strony, usuwania gałęzi i danych.
