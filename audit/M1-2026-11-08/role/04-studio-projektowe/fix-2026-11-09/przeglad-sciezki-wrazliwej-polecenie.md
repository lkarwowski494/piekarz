# Polecenie przeglądu ścieżki wrażliwej (import) — M1-audytor-generalny-007, rola 04 fix 2026-11-09

Nieodbyty: subagent roli 04 nie ma narzędzia subagentów. Uruchamia M2 (nowy subagent, bez rozumowania autora).

Wejście dla przeglądającego (tylko to):
1. `git diff 4af7c631..a33b545b -- src/components/ImportRecipeModal.tsx src/components/settings/ImportZPlikuArkusz.tsx src/components/arkusz/ArkuszKart.tsx src/components/DraftHeader.tsx`
2. Znalezisko: 04-studio-projektowe-003 / M1-audytor-generalny-007 — siedem arkuszy przeniesionych na `ArkuszKart` + `Karta` bez zmiany zachowania (DEC-10 a).
3. Zasady wspólne 10–14 (wklej z promptu roli: zero utraty danych, testy przed kodem, działania zewnętrzne za zgodą, koszty, repo publiczne).

Pytanie: czy zmiana wyglądu arkuszy importu zmienia ścieżkę zapisu (podwójne stuknięcie „Dodaj” / „Zastąp dane” w trakcie zapisu, zamknięcie arkusza w trakcie zapisu, utrata wklejonej treści, import bez potwierdzenia)? Zwróć tylko P0/P1 z `plik:linia` i scenariuszem albo „brak uwag”.
