# Polecenie: przegląd ścieżki wrażliwej (zakupy, dokumenty sklepu) — nieodbyty, uruchamia M2

Nowy subagent, bez rozumowania roli 02. Wejście wyłącznie:
- `git diff 287de811..9a692b21` w /home/user/piekarz (gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3);
- znaleziska 02-monetyzacja-002 i 02-monetyzacja-005 (tekst w audit/M1-2026-11-08/naprawy/polecenia/02-monetyzacja-p3.md);
- zasady wspólne 10–14 (wklejone z promptu roli).
Zadanie: tylko P0/P1 z `plik:linia` i scenariuszem albo „brak uwag”. Zmiana nie dotyka kodu zakupów (src/lib/platnosci bez zmian);
dotyka dokumentów cen, instrukcji App Store Connect i generatora kart (scripts/karty-ustawien.mjs).
