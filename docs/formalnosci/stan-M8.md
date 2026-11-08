# Stan M8 (formalności przed wydaniem 1.0) — Piekarz

Aktualizacja: 2026-11-08 · Gałąź: `formalnosci/piekarz-2026-11-08` (od `redesign/piekarz-2026-10-22` @ `fb8b66a`) · Pula decyzji: D-290…D-299 (żadna jeszcze nie użyta).

## Stan
- Etap: E0, E1, E2 zakończone (STOP 1: D-290; audyt roli 10: bez P0/P1; weryfikacja świeża: 5 rozbieżności poprawionych) → **STOP 2** (akceptacja dokumentów i zadania dla roli 08).
- Wynik roboczy (inwentarz danych, stosowalność, licencje) jest w `audit/M8-2026-11-08/` poza gitem (zasada roli M8 nr 7: lista braków nie trafia do repo). W chmurze katalog znika z kontenerem — dlatego M8 pracuje w jednej sesji do STOP końcowego (wyjątek nazwany w prompcie roli).
- Odtworzenie w nowej sesji: prompt `node <prompts>/tools/assemble.mjs M8-formalnosci --tryb build --galaz formalnosci/piekarz-2026-11-08`, E0 od nowa (ok. 30 min agenta).

## Następny krok
Akceptacja na STOP 2 → E3: dokumenty w `docs/prawne/`, rola 08 (ekran licencji), poprawki `docs/wydanie/` (DSA) → E4 raport → STOP końcowy.
