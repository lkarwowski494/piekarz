# Przegląd ścieżki wrażliwej (zakupy) — M1-audytor-generalny-015

Uruchamia: koordynator M2 (nowy subagent, bez rozumowania roli 03). Repo /home/user/piekarz, gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3.

Wejście: tylko `git diff 831199d7..e8345215 -- src/components/PaywallModal.tsx src/lib/platnosci/ src/__tests__/ekran-pro-pb.test.tsx src/lib/__tests__/nazwy-pro-pb.test.ts tests/obietnice-pro-015.test.ts`, znalezisko 01-odkrywanie-001 / 03-zakres-002 (ekran Pro obiecuje „porównanie” wypieków, którego nie ma; decyzja DEC-04 a: usunąć obietnicę) i treść zasad wspólnych 10–14 z promptu roli.

Wynik: tylko P0/P1 z `plik:linia` i scenariuszem albo „brak uwag”.

# Drugi przegląd AI przekładu — M1-audytor-generalny-015

Plik: `docs/lokalizacja/przeklad-m2-015-2026-11-09.json` (1 klucz × 33 języki; zdanie wycięte z przetłumaczonego klucza „Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.”). Wynik wpisać w `_opis` (pole drugi przegląd) i ponownie wpiąć: `python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>"`, potem `npm run i18n:kontekst`.
