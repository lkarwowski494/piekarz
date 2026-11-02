# 08-programista (fix) — Piekarz, noc 2026-11-02

Gałąź: `noc/08-programista-2026-11-02` od `origin/redesign/piekarz-2026-10-22` (e4067e3). Zadania z D-131 (a). Decyzje: D-132, D-133 (noc, do weta).

## ETAP 0 — środowisko i plan
- Linux, Node v22.23.4, `npm ci --legacy-peer-deps` zainstalowane; Xcode, symulator i E2E iOS niedostępne (Linux). Sieć i workflowy nie używane.
- Klasyfikacja: 07-jakosc-001 = D (defekt), ale bez źródła treści w repo → zamknięte krokiem właściciela (D-132). 07-jakosc-002 = D, wdrożone (D-133). Typu P/M brak.
- STOP E0/E2 w trybie nocnym: plan zatwierdzony przez koordynatora w D-131; właściciel nie pytany.

## 07-jakosc-002 — zrobione
- Zmiana: `.github/workflows/testflight.yml` — zadanie `tz-matrix` (ubuntu-latest), pętla po UTC, Europe/Warsaw, America/New_York, America/Los_Angeles, Asia/Tokyo, Australia/Sydney, Pacific/Auckland (lista z `.github/workflows/tests-tz.yml`), komenda `TZ="$tz" npm test`; czerwona strefa → `exit 1` po przejściu wszystkich; `build` ma `needs: tz-matrix`. Kroki podpisu i wysyłki bez zmian (`git diff` dodaje 30 linii, nic nie usuwa).
- Test: `tests/testflight-strefy-workflow.test.ts` (7 przypadków).
- Przed (obecny plik): 4 czerwone, 3 zielone — padają asercje o istnieniu zadania, `needs`, strefach i kodzie błędu (nie błąd importu). Log: scratchpad `czerwony-002.txt`.
- Po: 7/7 zielone; razem z `e2e-ios-workflow` i `ci-galezie-napraw` 26/26.
- Commit: `0a5c549`.
- Mechanizm szukany ponownie: `grep -n "npm run verify" .github/workflows/*.yml` — verify w jednej strefie jest tylko w testflight.yml (zostaje, bramka stref dochodzi przed nim).

## 07-jakosc-001 — niezrobione, krok właściciela
- `site/privacy.html` w repo to odsyłacz do repo `apps4brew-www` (`piekarz/privacy.html`); treści polityki w tym repo nie ma. Streszczenie nie powstało, `br-wyjatki.json` bez zmian, testu BR-UST-003 brak.
- Krok właściciela: dostarczyć treść polityki (wkleić albo dodać repo `apps4brew-www` do sesji). Wtedy: 3–5 zdań PL+EN tylko z niej, adres jako zwykły tekst obok linku w `src/components/settings/StudioEcosystemSection.tsx`, test BR-UST-003, 33 języki do `docs/lokalizacja/czeka-na-przeklad.json` jak w D-126, usunięcie wpisu z `br-wyjatki.json`.
- Nowe znalezisko nie dotyczy; ścieżka offline-link ma jedno miejsce (`src/components/settings/StudioEcosystemSection.tsx:73`), `src/components/PaywallModal.tsx:163` ma osobny link.

## Weryfikacja
- `npm run verify`: kod 0, 513 zestawów, 5572 testów (po commitach 002 i D-132/D-133, przed raportem).
- `docs/decyzje.md`: CRLF zachowane (linie = linie z CR: 723 = 723; HEAD 707 = 707).
- Przegląd subagenta ścieżki wrażliwej (`.github/workflows/`): nieodbyty — brak niezależnego subagenta w tej sesji; do uruchomienia przez koordynatora na `git diff e4067e3..HEAD -- .github/workflows`.

## Nie sprawdzono
- Przebiegu zadania `tz-matrix` na GitHub Actions (workflowów nie uruchamiam; składnia YAML sprawdzona tylko testem tekstowym i parserem poniżej). Czas ok. +18 min — szacunek z raportu 07, nie pomiar.
- Pole dotyku, AX5 i 320 pt dla 001: nie dotyczy, bo UI nie zmieniony.
- Zrzuty przed/po: brak, zmiana niewidoczna w interfejsie.
