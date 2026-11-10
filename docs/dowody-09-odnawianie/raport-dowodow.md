# Dowody: odnawianie subskrypcji i „Przywróć zakupy” w opisie sklepu, 34 lokalizacje — rola 09 fix, sesja L, 2026-11-10

Decyzje właściciela: KO-031 (dopisać przed zgłoszeniem), KO-032 („Usuń 2 zdania wszędzie”), KO-034 („Zmień test”). Zapis: D-359, D-360, D-361 w `docs/decyzje.md`. Gałąź `naprawy/M2-koordynator-napraw-2026-11-10-odnawianie` od `b5007a00`.

| Co | Test / kontrola | Przed | Po |
|---|---|---|---|
| G-1 (P2) odnawianie, G-2 (P3) anulowanie i przywracanie, 34 lokalizacje | `tests/opis-sklepu-odnawianie-ko031.test.ts` | 40 z 43 czerwonych: w każdej lokalizacji „akapit bez zdania aplikacji o automatycznym odnawianiu i anulowaniu” i brak etykiety (`test-przed.txt`) | 79/79 (`test-po.txt`) |
| R-1 en-*, R-2 ms, R-3 ko (P3) | ten sam test, sekcja „poprawki P3” | 6 czerwonych (`test-przed.txt`) | zielone |
| KO-032: miejsce na dopisek | ten sam test, sekcja KO-032; limit 4000 w każdej lokalizacji | 10 lokalizacji ponad 4000 po dopisku (fr 4193) | max 3989 (fr-CA, fr-FR); usunięte zdania: `usuniete-zdania-ko032.json` |
| Limity ASC | `sprawdz-wydanie.mjs metadane` (kopia z promptu roli 10, gałąź `audit-m1/piekarz-2026-11-08`) | kod 0 (`metadane-przed.txt`) | kod 0 (`metadane-po.txt`) |
| Sens przekładu | tłumaczenie zwrotne, niezależny subagent (przegląd modelu) | — | P1 0, P2 0, P3 10; przyjęte w D-361 (`tlumaczenie-zwrotne.md`) |
| Całość | `npm run verify` | — | kod 0, 662/662 zestawów, 7155/7155 testów; lint 0 błędów, 2 ostrzeżenia w `app/`/`src/` (pliki niezmienione w tej sesji) (`verify.txt`) |

- Zdanie o odnawianiu = dosłownie zdanie ekranu Pro ze słownika języka (`src/lib/i18n-en/czesc-4.ts:17`, „The subscription renews automatically until you cancel it”); etykieta „Przywróć zakupy” ze słownika (`src/lib/i18n-en/czesc-3.ts:17`). Zdania o przywracaniu per lokalizacja: `zdania-przywracania.json`.
- Wyjątki nazwane w testach (D-359): `tests/oferta-dokumenty.test.ts` (brzmienie kontraktu EN, R-1) i `tests/teksty-sklepu.test.ts` (081: warunek „If you allow notifications… even when your phone is locked” zamiast usuniętego zdania, KO-034).
- Wygenerowane: `docs/wydanie/ustawienia/*.md` (`npm run karty:ustawien`), `docs/wydanie/asc-kontrola-oczekiwane.json`, `docs/22-macierz-testow.md` (tylko lista testów pokrywających).
- Zrzut przed/po: nie dotyczy (tekst sklepu, nie ekran aplikacji).
- Przegląd natywny: nieodbyty (DEC-06); to przegląd modelu.
- Nowe znaleziska (nie naprawiane): sl — zdanie aplikacji o odnawianiu mówi „ti”, opis sklepu „vi” (słownik sl a opis); sv — „årsabonnemang” obok „Prenumerationen” w akapicie (zdanie sprzed zmiany).
- Status: naprawione-do-weryfikacji (status „zweryfikowane” nadaje reaudit).

## Kontrola dowodów i sekretów
`node sprawdz-raport.mjs docs/dowody-09-odnawianie/raport-dowodow.md .` (skrypt z promptu roli 09, kopia w scratchpadzie) → wynik niżej.
„OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”, kod wyjścia 0.
