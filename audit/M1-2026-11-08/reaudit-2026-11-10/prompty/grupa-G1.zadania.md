# G1: 12-niezawodnosc, 05-architekt
- M1-audytor-generalny-087 (P1, D, rola-właściciel 12-niezawodnosc, commit M2 bb162ddf, regresja od 003) — Import pakietu z trybu awaryjnego gubi trwający i zaplanowane wypieki (bake_sessions) bez komunikatu
  ID źródłowe: 12-niezawodnosc-601
  Poprzedni raport: K/reaudit-2026-11-09/12-niezawodnosc/12-niezawodnosc-reaudit-2026-11-09.md
  Test akceptacyjny: import pakietu z bazy 1021 z 2 sesjami (active, planned) → bake_sessions = 2 po „Zastąp dane”; test pada na ea249c9c
- Próbka regresji 05 i 12: `git diff ea249c9c..1c723632 -- src/data src/lib/backup* src/lib/*import* src/__tests__ src/data/__tests__` — czy poprawka 087 nie psuje: zwykłego importu kopii JSON, kopii „przed importem”, atomowości importu (kolejka zapisów, M1-001), „Usuń wszystkie dane” (023), zgodności wersji schematu pakietu (starszy/nowszy pakiet), sesji z nieznaną recepturą albo uszkodzonym JSON w pakiecie (zero utraty danych, zasada 10).
- Tylko wypisz stan (bez weryfikacji naprawy, bo nienaprawione): M1-audytor-generalny-032 (P2, dSYM; blokada: build TestFlight to krok właściciela) — czy coś w repo zmieniło się od ea249c9c w tej sprawie.
