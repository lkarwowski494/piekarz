# Przegląd ścieżki wrażliwej (import, kopie) — NIEODBYTY, do uruchomienia przez M2

Sesja roli 12 działała jako subagent bez narzędzia subagentów. Polecenie dla nowego subagenta (świeży kontekst):

1. Wejście wyłącznie: `git diff e3c23559..26f6a87f -- src/lib/import-pakietu.ts src/lib/import-z-pliku.ts src/data/dane-z-bazy.ts src/data/recipes-store.ts src/data/flour-store.ts src/data/starter-entries-store.ts src/data/sqlite-store.ts src/components/RescueScreen.tsx src/components/StorageGate.tsx src/components/settings/ImportZPlikuArkusz.tsx` (zakres commitów 2665582f i 26f6a87f), treść znaleziska 12-niezawodnosc-001 (audit/M1-2026-11-08/naprawy/polecenia/12-niezawodnosc-p1.md, sekcja „Znalezisko”) i zasady wspólne 10–14 (wklejone dosłownie).
2. Bez rozumowania sesji naprawy.
3. Zgłaszaj tylko P0/P1 z `plik:linia` i scenariuszem utraty albo zepsucia danych, albo „brak uwag”.
4. Zgłoszenie naprawia rola 12 testem albo odrzuca z dowodem; drugiego przeglądu nie ma.
