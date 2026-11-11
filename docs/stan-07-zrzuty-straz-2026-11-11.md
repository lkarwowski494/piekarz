# Stan sesji Q (rola 07, fix) — straż zrzutów (KO-047), 2026-11-11

Gałąź: `naprawy/M2-koordynator-napraw-2026-11-11-zrzuty-straz` od `935cd8dc` (= master/redesign po D-378). Zlecenie: koordynator, KO-047 (A+B).

| Decyzja | Commit | Co | Dowód |
|---|---|---|---|
| D-379 (A) | b7cc86eb | `tests/zrzuty-sklepu-przewijanie.test.ts`: tapOn po id bez poprzedzającego scrollUntilVisible pada (lista DOZWOLONE z pomiarem 6,3″) | `docs/dowody-07-zrzuty-straz/test-A-przed-b27fcd3e.txt` (czerwony: 04-doktor, dziennik-doktor-btn) → `test-A-po.txt` |
| D-380 (B) | d5b4c587, 248eb1f5 | wejście `sceny` / znacznik `[sceny=…]`; plan waliduje; komplet tylko wybranych; niepełny = artefakty `-czesciowe` | `test-B-przed.txt` (9 czerwonych) → `test-B-po.txt`; `proba-bash-B.txt` |
| verify | — | `npm run verify` KOD 0 na 248eb1f5 (670 zestawów, 7332 testy) | `verify.txt` |
| recenzja | — | brak P0/P1, 4× P2 | `recenzja-niezalezna.md` |

## Otwarte
1. P2 z recenzji (tapOn po tekście/doubleTapOn/longPressOn poza testem A).
2. Pierwszy przebieg z `sceny` informacyjny — czas [DO USTALENIA].
3. Z sesji Q-1: kadr 04 na 6,3″ (przebieg #4 run 43085791241).
