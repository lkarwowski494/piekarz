# Piekarz (Crust) — Instrukcja Projektowa i Standard Jakości

Piekarz to rzemieślniczy asystent domowego wypieku chleba stworzony w Apps4Brew Studio. Aplikacja spełnia najwyższy standard jakości **Role-Model (trening + organizer)** zgodnie ze specyfikacją `BRD-QA-REL 1.0`.

---

## 1. Kluczowe Zasady Architektoniczne

1. **100% Offline-First i Zero Telemetrii:**
   Wszystkie obliczenia (True Baker's %, 4-DDT, harmonogram wsteczny ze Sleep Guard, baza mąk, profil zakwasu) działają lokalnie na urządzeniu. Bezwzględny zakaz wywołań sieciowych (`fetch`, `axios`, `WebSocket`, `XMLHttpRequest`) i instalacji analityki śledzącej.
2. **Limit Rozmiaru Pliku (Modularność):**
   Każdy plik produkcyjny `.ts` oraz `.tsx` w katalogach `app/` oraz `src/` musi bezwzględnie mieścić się w limicie **20 480 bajtów** (20 KB). W razie rozbudowy funkcji należy wydzielać podkomponenty lub moduły logiczne.
3. **Trwałość i Odzyskiwanie Danych:**
   - Dwie rozdzielne pule po 10 kopii zapasowych: `piekarz-kopia-*` dla kopii po wypieku oraz `piekarz-przed-importem-*`/`piekarz-przed-czyszczeniem-*` dla kopii bezpieczeństwa przed operacjami niszczącymi.
   - Ochrona stanu `state_corrupt_*` zapobiega utracie danych użytkownika w przypadku błędu bazy lub uszkodzenia pliku JSON.
4. **Niezmienniki Interfejsu i Dostępności:**
   - Wszystkie elementy klikalne posiadają pole dotyku minimum 44×44 pt (`RD-ENG-03`).
   - Kontrast kolorów spełnia wymogi WCAG 2.1 AA (`theme.ts`).
   - Odporność interfejsu na szerokość 320 pt (iPhone SE) oraz powiększenie czcionki Dynamic Type AX5 (`NFR-A11Y-004`).
   - Wszystkie formularze z klawiaturą numeryczną korzystają z `NumInput` (`wInKeep`) z obsługą przecinka i kropki.
   - Formularze i listy posiadają `keyboardShouldPersistTaps="handled"`.

---

## 2. Podstawowe Komendy

```bash
# Uruchomienie aplikacji w trybie deweloperskim
npm start

# Pełna weryfikacja wszystkich bramek jakościowych (Typecheck, i18n, Licencje, Niezmienniki iOS, Macierz AST, Testy)
npm run verify

# Pojedyncze bramki:
npm run typecheck       # Kontrola typów TypeScript (--noEmit)
npm run check:i18n      # Kompletność tłumaczeń PL i EN
npm run check:licenses  # Weryfikacja braku wirusowych licencji GPL/AGPL
npm run verify:native   # Weryfikacja 20 niezmienników natywnego projektu iOS
npm run verify:matrix   # Kontrola 100% pokrycia macierzy testów AST
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
- Scenariusze E2E w `.maestro/*.yaml` są weryfikowane w pamięci w Jest przez `tests/maestro-runner.ts` dla poniedziałku, niedzieli oraz godziny 23:55 UTC.
