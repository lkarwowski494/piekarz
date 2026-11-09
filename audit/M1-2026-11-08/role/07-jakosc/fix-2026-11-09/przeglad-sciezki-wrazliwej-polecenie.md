# Polecenie: przegląd ścieżki wrażliwej (nowy subagent, bez kontekstu roli 07)

Ścieżka wrażliwa: `.github/workflows/` (testflight.yml) i skrypt bramki wydania. Przegląd NIE odbył się w sesji roli 07 (subagent bez narzędzia subagentów) — uruchamia M2.

Wejście dla recenzenta (tylko to):
1. `git diff 991586dd..fa679f03` w repo /home/user/piekarz (gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3).
2. Znalezisko 07-jakosc-004 (z pliku audit/M1-2026-11-08/naprawy/polecenia/07-jakosc-p3.md, sekcja „Znaleziska źródłowe”).
3. Zasady wspólne 10–14 (wklejone z promptu roli).

Zadanie: tylko P0/P1 z `plik:linia` i scenariuszem (np. bramka przepuszcza build z czerwonym E2E, token z prawem zapisu, wstrzyknięcie danych zdarzenia w run:, sekret w zadaniu bez środowiska release) albo „brak uwag”.
