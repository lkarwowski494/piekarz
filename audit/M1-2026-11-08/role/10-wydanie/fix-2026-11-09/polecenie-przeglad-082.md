# Polecenie: przegląd ścieżki wrażliwej (workflowy, klucz App Store Connect) — M1-audytor-generalny-082 / 10-wydanie-007 / D-314

Nowy subagent, świeży kontekst. Repo /home/user/piekarz, gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3.
Przejrzyj WYŁĄCZNIE `git diff 1d7c3fc0..0ddecf89` (bez czytania rozumowania autora).

Znalezisko: „Klucz App Store Connect z rolą co najmniej App Manager trafia do każdego buildu TestFlight, wspólny z inną aplikacją,
bez procedury unieważnienia.” Decyzja D-314 (docs/decyzje.md): jeden klucz zostaje; build w testflight.yml i zapisy w asc-ustawienia.yml /
asc-zgloszenie.yml w środowisku GitHub `release` (akceptacja właściciela); przebiegi na sucho bez środowiska; asc-kontrola.yml tylko odczyt,
wspólny workflow przypięty do SHA; procedura unieważnienia.

Zasady 10–14 (wklejone):
10. Zero utraty danych użytkownika, zawsze. (…)
11. Testy przed kodem. Test błędu najpierw czerwony na kodzie sprzed poprawki, z właściwego powodu. Nie usuwaj, nie wyłączaj i nie dopasowuj testów, żeby przeszły; błędny test zgłoś z uzasadnieniem.
12. Działania zewnętrzne tylko za zgodą. Push na `main`, publikacja, wysyłka do sklepu, posty, wiadomości do ludzi, usuwanie danych lub gałęzi: osobna, wyraźna zgoda właściciela na to konkretne działanie.
13. Koszty. Narzędzia 0 zł poza opłatą Apple Developer. (…)
14. Repo publiczne. Żadnych sekretów, kluczy, certyfikatów ani `.env`. Przed każdym commitem przejrzyj `git diff --cached`.

Szukaj szczególnie: czy zadanie na-sucho może cokolwiek zapisać w App Store Connect (kopia zgody, zakres); czy zadanie zapis może ruszyć bez
"zapis": true lub bez środowiska; czy coś ujawnia sekret w logu; czy zmiana testów (public-repo, asc-*-workflow) osłabia kontrolę.
Wynik: tylko P0/P1 z `plik:linia` i scenariuszem, albo „brak uwag”. Nie uruchamiaj workflowów, nie łącz się z App Store Connect.
