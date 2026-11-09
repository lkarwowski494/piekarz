# Drugi przegląd AI przekładu tekstów sklepu (M1-audytor-generalny-078, -080) — do uruchomienia przez M2

Nowy subagent, bez rozumowania roli 10. Wejście: `git diff 3e0fa3fa..HEAD -- docs/wydanie/metadane/` na gałęzi
`naprawy/M2-koordynator-napraw-2026-11-09-p3`; źródło PL/EN: `docs/wydanie/metadane/pl.json`, `en-US.json`.
Zakres w 32 lokalizacjach (bez pl, en-*): tekst promocyjny; sekcja receptur (zdanie o 26/11 recepturach, oznaczenie zaczynu);
nowa sekcja 3 (wersja na drożdżach i maszyna do chleba; termin maszyny jak w słowniku aplikacji klucz 'Maszyna do chleba');
nagłówek planu z „(Pro)”; sekcja zakwasów (zdanie „Opieka nad zakwasem (Pro): …”); statystyki dziennika „(Pro)”;
zdanie dostępu „Pro dodaje funkcje oznaczone (Pro) …”; skróty fr/it (pole `poprawki`).
Sprawdź: wierność znaczenia PL (zwłaszcza: co jest Pro — tylko zaczyn, plan wstecz, godzina startu maszyny, opieka nad
zakwasem, statystyki; reszta Basic), terminologia spójna z resztą opisu danej lokalizacji, gramatyka, brak słów OG-05.
Wynik: lista `kod: pole: problem → propozycja` albo „brak uwag”; poprawki wdraża rola 10/09, potem
`node scripts/sprawdz-metadane.mjs`, `node scripts/karty-ustawien.mjs`, `npx jest tests/opis-sklepu-pro-078.test.ts tests/opis-sklepu-receptury-080.test.ts`.
