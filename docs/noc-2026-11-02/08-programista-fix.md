# 08-programista (fix) — Piekarz, noc 2026-11-02

Gałąź: `noc/08-programista-2026-11-02` od `origin/redesign/piekarz-2026-10-22` (e4067e3). Zadania z D-131 (a); 001 dokończone po wiadomości koordynatora ze źródłem. Decyzje: D-132, D-133 (noc, do weta).

## ETAP 0 — środowisko i plan
- Linux, Node v22.23.4, `npm ci --legacy-peer-deps` zainstalowane; Xcode, symulator i E2E iOS niedostępne (Linux). Workflowów nie uruchamiałem; sieć tylko do anonimowego klonu publicznego `apps4brew-www`.
- Klasyfikacja: 07-jakosc-001 = D (defekt), wdrożone po dostarczeniu źródła (D-132). 07-jakosc-002 = D, wdrożone (D-133). Typu P/M brak.
- STOP E0/E2 w trybie nocnym: plan zatwierdzony przez koordynatora w D-131; właściciel nie pytany.

## 07-jakosc-002 — zrobione
- Zmiana: `.github/workflows/testflight.yml` — zadanie `tz-matrix` (ubuntu-latest), pętla po UTC, Europe/Warsaw, America/New_York, America/Los_Angeles, Asia/Tokyo, Australia/Sydney, Pacific/Auckland (lista z `.github/workflows/tests-tz.yml`), komenda `TZ="$tz" npm test`; czerwona strefa → `exit 1` po przejściu wszystkich; `build` ma `needs: tz-matrix`. Kroki podpisu i wysyłki bez zmian (`git diff` dodaje 30 linii, nic nie usuwa).
- Test: `tests/testflight-strefy-workflow.test.ts` (7 przypadków).
- Przed (obecny plik): 4 czerwone, 3 zielone — padają asercje o istnieniu zadania, `needs`, strefach i kodzie błędu (nie błąd importu). Log: scratchpad `czerwony-002.txt`.
- Po: 7/7 zielone; razem z `e2e-ios-workflow` i `ci-galezie-napraw` 26/26.
- Commit: `0a5c549`.
- Mechanizm szukany ponownie: `grep -n "npm run verify" .github/workflows/*.yml` — verify w jednej strefie jest tylko w testflight.yml (zostaje, bramka stref dochodzi przed nim).

## 07-jakosc-001 — zrobione po dostarczeniu źródła
- Źródło: koordynator wskazał repo `lkarwowski494/apps4brew-www` @ fb85d20, `piekarz/privacy.html`. Sklonowałem je do scratchpadu i sprawdziłem w pliku: sekcja „W skrócie” PL zgadza się dosłownie, EN („The Crust app …”) też. Strona nadal wspomina „okres próbny” (po D-112/D-113 próby nie ma): do właściciela/M8, nie zmieniam.
- Zmiana: `src/components/settings/StudioEcosystemSection.tsx` — pod linkiem „Polityka prywatności” dwa teksty: streszczenie (`t()` z kluczem PL = 3 zdania) i `PRIVACY_URL` jako zwykły, zaznaczalny tekst (`testID settings-privacy-url`). Zawsze widoczne, bo `openURL` offline nie zgłasza błędu. Kontaktu e-mail nie dodałem (nie jest kluczem tekstowym).
- EN: `src/lib/i18n-en/czesc-25.ts`; 33 języki: wpis `[D-132]` w `docs/lokalizacja/czeka-na-przeklad.json`, wyjątek nazwany w `tests/czeka-na-przeklad-093.test.ts`; kontekst: `docs/lokalizacja/pl.kontekst.json` (ręcznie +6 linii, bo `npm run i18n:kontekst` zmieniał też niepowiązane wpisy mąk); `docs/22-macierz-testow.md` odświeżone (`matrix:update`: TEKST 607 → 608).
- Test: `src/__tests__/polityka-offline-ust003.test.tsx` (ID BR-UST-003). Przed (kod bez zmiany): 2 czerwone, widoczne teksty to tylko „Kontakt”, „Polityka prywatności”, „Oceń w App Store”, „Napisz do nas”. Po: 2/2 zielone. Wpis BR-UST-003 usunięty z `scripts/br-wyjatki.json`.
- Pole dotyku: teksty nie są klikalne, link ma `minHeight: 44` bez zmian. AX5 i 320 pt: nie sprawdzono (brak automatu i urządzenia); teksty zawijają się (`Text` bez `numberOfLines`), ale zrzutu nie robiłem. Wygląd (rozmiar `przypis`, kolor `tusz2`) wzięty z istniejącej `cardDescription`; do przeglądu roli 04.

## Nowe znalezisko (nie naprawiane)
- DEV-10, brzegowy: `src/components/settings/StudioEcosystemSection.tsx:73` — `void Linking.openURL(PRIVACY_URL)` bez `.catch`; odrzucone `openURL` (brak aplikacji obsługującej adres) kończy się nieobsłużoną obietnicą. Na iOS dla https rzadkie. Podobnie `src/components/PaywallModal.tsx:163`.

## Weryfikacja
- `npm run verify`: kod 0, po commicie 002: 513 zestawów, 5572 testów; po 001: 514 zestawów, 5574 testów.
- `docs/decyzje.md`: CRLF zachowane (linie = linie z CR: 723 = 723; HEAD 707 = 707).
- Przegląd subagenta ścieżki wrażliwej (`.github/workflows/`): nieodbyty — brak niezależnego subagenta w tej sesji; do uruchomienia przez koordynatora na `git diff e4067e3..HEAD -- .github/workflows`.

## Nie sprawdzono
- Przebiegu zadania `tz-matrix` na GitHub Actions (workflowów nie uruchamiam; składnia YAML sprawdzona tylko testem tekstowym i parserem poniżej). Czas ok. +18 min — szacunek z raportu 07, nie pomiar.
- Zrzuty przed/po dla 001: brak (Linux bez symulatora; zmiana widoczna w Ustawieniach).
