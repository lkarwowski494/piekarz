# Definicja Ukończenia (Definition of Done — DoD) — Piekarz (Crust)

Dokument potwierdzający spełnienie wszystkich kryteriów standardu studyjnego **BRD-QA-REL 1.0 (Role-Model)**.

---

## Tabela Weryfikacyjna Kryteriów Ukończenia

| Nr | Wymaganie | Identyfikator | Stan | Dowód / Plik weryfikacyjny |
| :---: | :--- | :---: | :---: | :--- |
| **1** | 100% pokrycia logiki domenowej | `BR-TEST-002` | ✅ SPEŁNIONE | `src/core/__tests__/domain-error-branches.test.ts` (100% linii/gałęzi/funkcji) |
| **2** | Blokada `act()` i `console.error` | `BR-TEST-018` | ✅ SPEŁNIONE | `jest.app-after-env.js` rzucające wyjątek przy ostrzeżeniach |
| **3** | Dwie rozdzielne pule po 10 kopii zapasowych | `BR-TEST-022` | ✅ SPEŁNIONE | `src/lib/backup.ts` (`piekarz-kopia-*` vs `piekarz-przed-*`) |
| **4** | Ochrona uszkodzonego stanu `state_corrupt_*` | `BR-TEST-023` | ✅ SPEŁNIONE | `src/lib/backup.ts`, baner `CorruptStateRecoveryBanner.tsx` |
| **5** | Konwersja bez dryfu `wInKeep` + `NumInput` | `BR-TEST-005` | ✅ SPEŁNIONE | `src/lib/unit-converter.ts`, `src/components/NumInput.tsx` (5/5 zielono) |
| **6** | Odporność timerów na tło | `NFR-PERF-004` | ✅ SPEŁNIONE | `app/(tabs)/stolnica.tsx` (`endAtMs - Date.now()`) |
| **7** | Ucieczka CSV przed Formula Injection | `NFR-SEC-015` | ✅ SPEŁNIONE | `src/lib/csv-exporter.ts` (`escapeCsvCell` z apostrofem i cudzysłowem) |
| **8** | Testy własnościowe `fast-check` | `BR-TEST-006` | ✅ SPEŁNIONE | `tests/matrix-invariants.test.ts` (500 losowych sekwencji stanowych) |
| **9** | Niezależne wyrocznie Pythona | `BR-TEST-011` | ✅ SPEŁNIONE | `scripts/gen-bakers-corpus.py`, `scripts/gen-theme-contrast-corpus.py` |
| **10** | 16 strażników interakcji `S1–S16` | `NFR-INT-001..16`| ✅ SPEŁNIONE | `tests/interaction-guards.test.ts`, `close-button-guard.test.tsx` |
| **11** | Pełna higiena i18n i brak polskich słów w EN | `NFR-I18N-001..08`| ✅ SPEŁNIONE | `npm run check:i18n`, `tests/i18n-no-polish-in-en.test.tsx` |
| **12** | Dostępność WCAG 2.1 AA, pola $\ge 44$ pt, AX5 | `NFR-A11Y-001..08`| ✅ SPEŁNIONE | `tests/matrix-a11y.test.tsx`, `tests/matrix-dimensions.test.tsx` |
| **13** | Skaner AST `test-matrix.mjs` (100% w 5 kategoriach)| `BR-TEST-028..31`| ✅ SPEŁNIONE | `docs/22-macierz-testow.md` (726/726 elementów, 0 braków) |
| **14** | Przepływy `.maestro/*.yaml` w pamięci w Jest | `BR-TEST-037` | ✅ SPEŁNIONE | `tests/maestro-runner.ts`, `tests/maestro-flows.test.tsx` (pn, nd, 23:55 UTC) |
| **15** | Weryfikacja 20 niezmienników natywnego iOS | `BR-REL-009..13` | ✅ SPEŁNIONE | `scripts/verify-native.mjs` (20/20 testów zielonych) |
| **16** | Strony prawne `site/` i potok Pages | `BR-REL-019..20` | ✅ SPEŁNIONE | `site/index.html`, `site/privacy.html`, `site/support.html`, `pages.yml` |
| **17** | Bezpieczeństwo repo i potoków CI | `NFR-SEC-001..14` | ✅ SPEŁNIONE | `tests/public-repo.test.ts`, `brands.contract.test.ts`, `check-licenses.mjs` |
| **18** | Potoki GitHub Actions | `BR-REL-001..08` | ✅ SPEŁNIONE | `ci.yml`, `tests-tz.yml`, `testflight.yml`, `e2e-ios.yml`, `select-xcode.sh` |
| **19** | Limit modularności plików $\le 20\,480$ B | Reguła modularności| ✅ SPEŁNIONE | Wszystkie pliki produkcyjne w `app/` i `src/` spełniają limit |
| **20** | Całościowa weryfikacja `npm run verify` | `NFR-TEST-005` | ✅ SPEŁNIONE | Pełny przebieg przechodzi w 100% na zielono |

---

## Zatwierdzenie
Projekt **Piekarz (Crust)** spełnia 100% wymagań technicznych i jakościowych specyfikacji studyjnej i jest w pełni gotowy do kompilacji wydawniczej w TestFlight i publikacji w App Store.
