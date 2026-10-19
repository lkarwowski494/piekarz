# Piekarz (Crust) — Instrukcja Projektowa i Standard Jakości

Piekarz to rzemieślniczy asystent domowego wypieku chleba stworzony w Apps4Brew Studio. Zasady niżej są regułami projektu; przy każdej znacznik „Sprawdza:” mówi, która komenda ją egzekwuje, albo że nie egzekwuje jej żaden automat (dowód zamiast deklaracji, M1-audytor-generalny-038). Stan kryteriów: `docs/20-definicja-ukonczenia.md`.

---

## 1. Kluczowe Zasady Architektoniczne

1. **100% Offline-First i Zero Telemetrii:** (Sprawdza: punkt niżej)
   Wszystkie obliczenia (True Baker's %, 4-DDT, harmonogram wsteczny ze Sleep Guard, baza mąk, profil zakwasu) działają lokalnie na urządzeniu. Bezwzględny zakaz wywołań sieciowych (`fetch`, `axios`, `WebSocket`, `XMLHttpRequest`) i instalacji analityki śledzącej.
   - Zakaz wywołań sieciowych w kodzie produkcyjnym. Sprawdza: `tests/public-repo.test.ts` (`npm test`); analityka w zależnościach: przegląd `package.json`, bez automatu.
2. **Limit Rozmiaru Pliku (Modularność):** (Sprawdza: `npm run check:size`, część `npm run verify`)
   Każdy plik produkcyjny `.ts` oraz `.tsx` w katalogach `app/` oraz `src/` musi bezwzględnie mieścić się w limicie **20 480 bajtów** (20 KB). W razie rozbudowy funkcji należy wydzielać podkomponenty lub moduły logiczne.
3. **Trwałość i Odzyskiwanie Danych:** (Sprawdza: punkty niżej)
   - Dwie rozdzielne pule po 10 kopii zapasowych: `piekarz-kopia-*` dla kopii po wypieku oraz `piekarz-przed-importem-*`/`piekarz-przed-czyszczeniem-*` dla kopii bezpieczeństwa przed operacjami niszczącymi. Sprawdza: `src/lib/__tests__/backup.test.ts`, `src/data/__tests__/auto-backup.sqlite.test.ts`.
   - Ochrona stanu `state_corrupt_*` zapobiega utracie danych użytkownika w przypadku błędu bazy lub uszkodzenia pliku JSON. Sprawdza: `src/lib/__tests__/corrupt-state.test.ts`, `src/lib/__tests__/corrupt-rescue.test.tsx`.
4. **Niezmienniki Interfejsu i Dostępności:** (Sprawdza: punkty niżej)
   - Wszystkie elementy klikalne posiadają pole dotyku minimum 44×44 pt (`RD-ENG-03`). Sprawdza: tylko styl `minHeight` w `tests/matrix-a11y.test.tsx`; zmierzone pole dotyku: brak automatu.
   - Kontrast kolorów spełnia wymogi WCAG 2.1 AA (`theme.ts`). Sprawdza: `src/ui/__tests__/theme-contrast.test.ts`.
   - Odporność interfejsu na szerokość 320 pt (iPhone SE) oraz powiększenie czcionki Dynamic Type AX5 (`NFR-A11Y-004`). Sprawdza: brak automatu (testy macierzy sprawdzają tylko obecność elementów).
   - Wszystkie formularze z klawiaturą numeryczną korzystają z `NumInput` (`wInKeep`) z obsługą przecinka i kropki. Sprawdza: konwersję `src/lib/__tests__/unit-converter.test.ts`; użycie `NumInput` w formularzach: brak automatu (dziś `app/` go nie używa — znalezisko, partia 2).
   - Formularze i listy posiadają `keyboardShouldPersistTaps="handled"`. Sprawdza: `tests/interaction-guards.test.ts` (zakładki w `app/(tabs)`).

---

## 2. Podstawowe Komendy

```bash
# Uruchomienie aplikacji w trybie deweloperskim
npm start

# Pełna weryfikacja wszystkich bramek jakościowych (Typecheck, i18n, Licencje, Rozmiar plików, Niezmienniki iOS, Macierz AST, Testy)
npm run verify

# Pojedyncze bramki:
npm run typecheck       # Kontrola typów TypeScript (--noEmit)
npm run check:i18n      # Kompletność tłumaczeń PL i EN
npm run check:licenses  # Weryfikacja braku wirusowych licencji GPL/AGPL
npm run check:size      # Limit 20 480 B plików produkcyjnych w app/ i src/
npm run verify:native   # Weryfikacja niezmienników natywnego projektu iOS
npm run verify:matrix   # Kontrola 100% pokrycia macierzy testów AST i aktualności docs/22 (bez zapisu)
npm run matrix:update   # Ponowne wygenerowanie docs/22-macierz-testow.md
npm test                # Uruchomienie zestawu testów Jest
```

---

## 3. Testowanie i Macierz AST

- Nigdy nie używaj `@ts-ignore`, `istanbul ignore` ani `test.skip`.
- Macierz testów AST (`scripts/test-matrix.mjs`) generuje raport `docs/22-macierz-testow.md` i egzekwuje 100% pokrycia we wszystkich 5 kategoriach:
  - `EKRAN` (trasy widoków w `app/`)
  - `UI` (przyciski, przełączniki, pola wejściowe)
  - `TEKST` (klucze językowe i komunikaty domenowe)
  - `LOGIKA` (eksportowane funkcje obliczeniowe)
  - `WYMIAR` (typy wyliczeniowe i stałe tablicowe)
- Scenariusze `.maestro/*.yaml` interpretuje w pamięci w Jest `tests/maestro-runner.ts` dla poniedziałku, niedzieli oraz godziny 23:55 UTC — to nie jest E2E.
- Prawdziwe E2E: `.maestro/e2e/*.yaml` na symulatorze iOS w workflow `.github/workflows/e2e-ios.yml` (build Release, Maestro CLI, kontrola negatywna `.maestro/kontrola-negatywna/`); lokalnie `tests/e2e-ios-workflow.test.ts` pilnuje kroków workflow.
