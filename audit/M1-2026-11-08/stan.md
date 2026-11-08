# Stan M1 — Piekarz — 2026-11-08 — E1 partia 1 w toku
- Rola M1-audytor-generalny, tryb audit, baza 2ef8870a (tag v1.0.0-b1023). Prompt: prompty/M1.md (assemble.mjs, po regule uprawnień właściciela).
- STOP 1 rozstrzygnięty (właściciel, 2026-11-08): wariant głęboki; reguły uprawnień dodane; bramka użyta ponownie (wyjątek nazwany). Szczegóły: plan-audytu.md, „Decyzje właściciela na STOP 1”.
- K = /home/user/piekarz/audit/M1-2026-11-08 (exclude). Prompty i polecenia: prompty/ (14 ról z 05-architekt-b, 5 soczewek). Narzędzia: narzedzia/sprawdz-raport.mjs, sprawdz-plan.mjs.
- Partia 1 uruchomiona: 01, 03, 06, 11, soczewka 1. Czekają w partii 1: soczewki 2–5. Partia 2: 02, 04, 05, 05-b, 08, 12. Partia 3: 09, 10, potem 07 sama.
- Po każdym subagencie: sprawdz-raport.mjs --rola <rola> → dowody/, nagłówek „Commit” = 2ef8870a, zużycie → koszty.md.
- Wznowienie po utracie kontenera: odtwórz K z gałęzi audit-m1/piekarz-2026-11-08, ponownie złóż prompty (polecenia w plan-audytu.md), uruchom role bez raportów.
