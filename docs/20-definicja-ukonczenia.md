# Definicja Ukończenia (Definition of Done) — Piekarz (Crust)

Każdy wiersz wskazuje komendę albo plik testu, który kryterium sprawdza i pada przy naruszeniu, albo mówi wprost „nie sprawdzane automatem”. Stan „sprawdzone” obowiązuje tylko dla commitu, na którym komenda przeszła; ten dokument nie ogłasza gotowości do wydania (M1-audytor-generalny-038, 2026-10-19; poprzednia wersja z deklaracjami bez automatu: historia git).

---

## Tabela kryteriów

| Nr | Wymaganie | Identyfikator | Jak sprawdzane | Uwagi |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Pokrycie logiki domenowej | `BR-TEST-002` | testy gałęzi błędów: `src/core/__tests__/domain-error-branches.test.ts`; próg 100% pokrycia: nie sprawdzane automatem | `jest.config.js` nie ma progu `coverageThreshold` |
| **2** | Blokada `act()` i `console.error` | `BR-TEST-018` | `npm run test` (setup `jest.app-after-env.js` rzuca wyjątek) | |
| **3** | Dwie rozdzielne pule po 10 kopii zapasowych | `BR-TEST-022` | `src/lib/__tests__/backup.test.ts`, `src/data/__tests__/auto-backup.sqlite.test.ts` | |
| **4** | Ochrona uszkodzonego stanu `state_corrupt_*` | `BR-TEST-023` | `src/lib/__tests__/corrupt-state.test.ts`, `src/lib/__tests__/corrupt-rescue.test.tsx` | |
| **5** | Konwersja bez dryfu `wInKeep` | `BR-TEST-005` | `src/lib/__tests__/unit-converter.test.ts`; użycie `NumInput` we wszystkich polach liczbowych: nie sprawdzane automatem | `NumInput` nie jest używany w `app/` (znalezisko roli 03, partia 2) |
| **6** | Czas kroku liczony od znacznika końca; powiadomienia lokalne | `NFR-PERF-004` | `src/core/__tests__/notification-plan.test.ts`; zachowanie przy zablokowanym telefonie: nie sprawdzane automatem | test na urządzeniu: krok właściciela |
| **7** | Ucieczka CSV przed Formula Injection | `NFR-SEC-015` | `src/lib/__tests__/csv-exporter.test.ts` | |
| **8** | Testy własnościowe `fast-check` | `BR-TEST-006` | `tests/matrix-invariants.test.ts` | nightly: ziarno z zegara wypisywane w logu, liczba przebiegów z `FC_NUM_RUNS` |
| **9** | Wyrocznie Pythona | `BR-TEST-011` | nie sprawdzane automatem jako niezależne | `scripts/gen-bakers-corpus.py` odtwarza wzory kodu JS, więc nie jest niezależną wyrocznią |
| **10** | 16 strażników interakcji `S1–S16` | `NFR-INT-001..16` | `tests/interaction-guards.test.ts` | |
| **11** | Higiena i18n i brak polskich słów w EN | `NFR-I18N-001..08` | `npm run check:i18n`, `tests/i18n-no-polish-in-en.test.tsx` | 33 pozostałe języki: partia lokalizacyjna (DEC-06) |
| **12** | Kontrast WCAG 2.1 AA | `NFR-A11Y-001..08` | `src/ui/__tests__/theme-contrast.test.ts` | |
| **12a** | Pola dotyku ≥ 44 pt, szerokość 320 pt, Dynamic Type AX5 | `NFR-A11Y-004`, `RD-ENG-03` | nie sprawdzane automatem | testy w `tests/matrix-a11y.test.tsx` i `tests/matrix-dimensions.test.tsx` sprawdzają styl `minHeight`, rolę i obecność elementu, nie zmierzone pole ani układ |
| **13** | Macierz AST 100% w 5 kategoriach i aktualny raport | `BR-TEST-028..31` | `npm run verify:matrix` (pada przy braku pokrycia i przy nieaktualnym `docs/22-macierz-testow.md`) | aktualizacja raportu: `npm run matrix:update` |
| **14** | Scenariusze Maestro | `BR-TEST-037` | interpreter w Jest: `tests/maestro-flows.test.tsx` (nie jest E2E); prawdziwe E2E na symulatorze: `tests/e2e-ios-workflow.test.ts` pilnuje workflow `e2e-ios.yml`, sam przebieg na GitHub Actions | |
| **15** | Niezmienniki natywnego projektu iOS | `BR-REL-009..13` | `npm run verify:native` | |
| **16** | Strony prawne `site/` i link do polityki | `BR-REL-019..20` | `tests/public-links.test.tsx` | publikacja strony: krok właściciela (zadanie 012) |
| **17** | Bezpieczeństwo repo i licencje | `NFR-SEC-001..14` | `tests/public-repo.test.ts`, `npm run check:licenses` | |
| **18** | Potoki GitHub Actions | `BR-REL-001..08` | nie sprawdzane automatem lokalnie | wynik przebiegów w zakładce Actions repozytorium |
| **19** | Limit pliku produkcyjnego ≤ 20 480 B w `app/` i `src/` | reguła modularności | `npm run check:size` | |
| **20** | Całościowa weryfikacja | `NFR-TEST-005` | `npm run verify` | |
