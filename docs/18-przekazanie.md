# Dokument Przekazania i Utrzymania (Handoff) — Piekarz (Crust)

Dokument techniczny dla zespołu deweloperskiego i utrzymaniowego Apps4Brew Studio.

---

## 1. Architektura Aplikacji

Aplikacja **Piekarz (Crust)** została zrealizowana zgodnie ze standardem **Role-Model Wariant T (Jednobinarkowy Offline-First)**:

- **Framework:** React 19.2, React Native 0.86, Expo SDK 57, Expo Router 57.
- **Baza danych:** SQLite (`expo-sqlite`) z automatyczną migracją schematu oraz pamięciowym mechanizmem awaryjnym (`memStore`) dla środowisk testowych i symulatorów.
- **Prywatność i sieć:** 100% Offline-First. Brak bibliotek analitycznych, zero telemetrii, brak wywołań sieciowych w kodzie domenowym i interfejsu.
- **Bezpieczeństwo danych:** Dwie niezależne pule po 10 kopii zapasowych (`piekarz-kopia-*` oraz `piekarz-przed-importem-*`/`piekarz-przed-czyszczeniem-*`), ochrona stanu przed uszkodzeniem `state_corrupt_*` z banerem przywracania.
- **Odporność na tło:** Timery oparte o bezwzględne znaczniki czasu `endAtMs - Date.now()`.

---

## 2. Struktura Katalogów

```
noble-pasteur/
├── app/                        # Ekrany i routing Expo Router
│   ├── (tabs)/                 # Główne zakładki: kalkulator, stolnica, harmonogram, doktor, akademia
│   └── _layout.tsx             # Root layout, motyw kolorystyczny i nawigacja
├── assets/                     # Ikona 1024x1024 RGB (colorType 2), splash screen, grafiki
├── docs/                       # Dokumentacja BRD, audytów, testów i publikacji App Store
├── scripts/                    # Narzędzia CI/CD i bramki weryfikacji jakości:
│   ├── test-matrix.mjs         # Skaner macierzy AST (BR-TEST-028..031)
│   ├── verify-native.mjs       # Weryfikator 20 niezmienników iOS na Linuksie
│   ├── check-licenses.mjs      # Strażnik licencji open-source (NFR-SEC-009)
│   ├── check-i18n.mjs          # Detektor brakujących i martwych kluczy i18n
│   ├── gen-bakers-corpus.py    # Wyrocznia Pythona dla procentu piekarskiego i DDT
│   └── gen-theme-contrast-corpus.py # Wyrocznia kontrastu WCAG 2.1
├── site/                       # Statyczne strony GitHub Pages (index, privacy, support)
├── src/
│   ├── components/             # Reużywalne komponenty UI (NumInput, Field, Btn, Empty, Missing)
│   ├── core/                   # Czysta logika domenowa (True Baker's %, DDT, mąki, zakwas, prefermenty)
│   ├── data/                   # Schemat bazy danych SQLite, repozytorium i memStore
│   ├── doctor/                 # Silnik diagnostyki problemów ciasta i bochenka
│   ├── lib/                    # Narzędzia pomocnicze (i18n, backup, CSV, jednostki, data, ucieczka znaków)
│   ├── recipes/                # Wbudowane receptury mistrzowskie
│   └── scheduler/              # Harmonogram wsteczny z ochroną snu piekarza (Sleep Guard)
├── tests/                      # Zestaw testów automatycznych (Jednostkowe, Integracyjne, Maestro, Macierz)
└── .maestro/                   # Scenariusze E2E w YAML wykonywane w pamięci w Jest
```

---

## 3. Komendy Weryfikacyjne i Bramki Jakości

Wszystkie bramki uruchamiane są jedną komendą:

```bash
npm run verify
```

Podkomendy składowe:
- `npm run typecheck` — weryfikacja typów TypeScript w trybie `--noEmit`.
- `npm run check:i18n` — weryfikacja kompletności słowników tłumaczeń (PL i EN).
- `npm run check:licenses` — audyt licencji open-source pod kątem braku wirusowego GPL/AGPL.
- `npm run verify:native` — weryfikacja 20 niezmienników natywnego iOS na Linuksie/Windowsie.
- `npm run verify:matrix` — weryfikacja 100% pokrycia macierzy AST w 5 kategoriach.
- `npm test` — pełny zestaw testów Jest (100% zielono, zero ostrzeżeń `act()` i `console.error`).

---

## 4. Procedura Wydania Nowej Wersji (TestFlight / App Store)

1. Podbij wersję w `app.json` (np. `"version": "1.0.1"`).
2. Uruchom `npm run verify` i upewnij się, że wszystkie testy przechodzą w 100%.
3. Zacommituj zmiany i wypchnij na gałąź `main`:
   ```bash
   git add app.json
   git commit -m "chore: bump version to 1.0.1"
   git push origin main
   ```
4. Utwórz tag wydawniczy lub uruchom workflow w GitHub Actions:
   - Wejdź w zakładkę **Actions** → **Build & Upload to TestFlight (iOS)** → **Run workflow**.
5. Po około 15 minutach build pojawi się w konsoli App Store Connect i w aplikacji TestFlight na telefonach testerów.
