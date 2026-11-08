# Stan M8 (formalności przed wydaniem 1.0) — Piekarz

Aktualizacja: 2026-11-08 · Gałąź: `formalnosci/piekarz-2026-11-08` (od `redesign/piekarz-2026-10-22` @ `fb8b66a`) · Pula decyzji: D-290…D-299 (żadna jeszcze nie użyta).

## Stan
- Etap: E0 zakończony → **STOP 1** (czeka na odpowiedzi właściciela).
- Wynik roboczy (inwentarz danych, stosowalność, licencje) jest w `audit/M8-2026-11-08/` poza gitem (zasada roli M8 nr 7: lista braków nie trafia do repo). W chmurze katalog znika z kontenerem — dlatego M8 pracuje w jednej sesji do STOP końcowego (wyjątek nazwany w prompcie roli).
- Odtworzenie w nowej sesji: prompt `node <prompts>/tools/assemble.mjs M8-formalnosci --tryb build --galaz formalnosci/piekarz-2026-11-08`, E0 od nowa (ok. 30 min agenta).

## Następny krok
Odpowiedzi właściciela na pytania STOP 1 → E1 (sprawdzenie) → E2 (projekty dokumentów) → STOP 2.
