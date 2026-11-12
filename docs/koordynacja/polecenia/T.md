# Sesja T: diagnoza zrzutów #5 (6,9″ czerwone) — Piekarz
Koordynator: session_01T66VBw2HUmSmpTzryFK8eF (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID). Gałąź stanu `koordynacja` tylko do odczytu.

1. Rola: 07-jakosc (fix), poprawka kodu/sceny jako 08 (fix). Prompty: `git fetch origin audit-m1/piekarz-2026-11-08`, `git show origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/naprawy/polecenia/rola-07-jakosc-prompt.md` i `…/rola-08-prompt.md` — przeczytaj w całości. Biblioteki prompts nie dołączasz.
2. Start: nowa gałąź `naprawy/M2-koordynator-napraw-2026-11-12-zrzuty5` od `master` @ `0a0b9970` (inny HEAD: zgłoś). `npm ci`. Tożsamość commitów wg CLAUDE.md.
3. Kontekst: zrzuty #5 run 43166559855 (master `0a0b9970`, tylko=pl, workflow_dispatch). Job `zrzuty (iphone-6.3-1)` 131016764934 ZIELONY; job `zrzuty (iphone-6.9-1)` 131016764955 CZERWONY w kroku „Zrzuty” (06:36→07:00 UTC); `komplet` 131027835804 czerwony (brak kompletu, skutek). Artefakty przebiegu: logi Maestro i zrzuty częściowe (pobierz przez API/`gh run download` albo MCP; przy 502 — logi jobu przez get_job_logs). Zmiany od #4 (zielony): sesja R (D-381…D-386: radar, zegar runnera sudo date 03:35→09:35→09:41, kadry 01/02/05/07, scena 00-przygotuj-podwojenie) i S (D-389/D-390: stan „Dziś”, nagłówek 03). Stan R: `docs/stan-08-zrzuty4-2026-11-11.md`, decyzje w `docs/decyzje.md`.
4. Zadania:
   1. Diagnoza: która scena i dlaczego padła na 6,9″ (a nie na 6,3″); dowód z logu/zrzutu (`docs/dowody-07-zrzuty5/`). Gotowe: raport do koordynatora (przyczyna, dowód, plan poprawki, czy dotyczy też innych rozmiarów/lokalizacji).
   2. Poprawka: test najpierw czerwony (odtwarza przyczynę, np. test scen/skryptu), potem poprawka, zielony. Zmiana treści ramki albo wyglądu aplikacji → PYTANIE z ≥ 2 opcjami i rekomendacją. Gotowe: commit z dowodem czerwony→zielony.
   3. `npm run verify` KOD 0 na końcowym SHA → `docs/dowody-07-zrzuty5/verify.txt`; recenzja niezależna (subagent, sam diff) bez P0/P1. Gotowe: PRZEKAZANIE (z propozycją wejść ponownego przebiegu: rozmiary, sceny, aplikacja_z_przebiegu=43166559855 jeśli app bez zmian).
5. Zakazy: nie scalasz do `redesign`/`master`, nie tworzysz/archiwizujesz sesji, nie piszesz na `koordynacja`, nie uruchamiasz workflowów, nigdy --no-verify ani force-push, bez AskUserQuestion. STOP-y i punkt czyszczenia → raport do koordynatora.
6. Decyzje: tryb „właściciel” (dzień): techniczne sama do weta, produktowe/wyglądu jako PYTANIE. Numery tylko D-391…D-396.
7. Od 30% okna: stan w `docs/stan-07-zrzuty5-2026-11-12.md`, push, PRZEKAZANIE.
8. Raporty (≤ 10 linii, send_message): po zadaniu 1; PYTANIE; PRZEKAZANIE.
