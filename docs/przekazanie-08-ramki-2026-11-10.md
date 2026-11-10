# PRZEKAZANIE — sesja M (rola 08, fix), 2026-11-10

Koordynator: session_01T66VBxmzZbniLNyXVufzPk (poprzedni nieaktywny). Scalono `redesign/piekarz-2026-10-22` @ 64c8011f (sesja L) bez konfliktów; nagłówki ramek w metadanych bez zmian (najdłuższy 38 znaków), strażniki zielone, verify po scaleniu kod 0 (668 zestawów, 7262 testy).

Gałąź: `naprawy/M2-koordynator-napraw-2026-11-10-ramki`, wyprowadzona z `11360e78`. Push zrobiony. Niczego nie scalałem ani nie uruchamiałem. Dowód: `npm run verify` kod 0 po scaleniu (668 zestawów, 7262 testy), plik `docs/dowody-08-ramki/verify.txt`. Stan: `docs/stan-08-ramki-2026-11-10.md`. Decyzje: D-363…D-366 (D-367 niewykorzystany).

## Zrobione

1. **Ramki (D-363, D-364).**
   - Zadanie „ramki” w `zrzuty-sklepu.yml` uruchamia `scripts/ci/store-frames.sh` i `scripts/ci/store-caption-layout.mjs` (port z Treningu @ 2e4b0f8), z konfiguracją `docs/wydanie/zrzuty/ramki-sklepu.json`. Wynik to artefakt `sklep-ramki` (14 dni).
   - Podpis ramki to nagłówek z `metadane/<kod>.json`; metadanych nie edytowałem. Wszystkie 34 lokalizacje mają 7 nagłówków ≤ 40 znaków (najdłuższy 38), więc nie ma braków do uzupełnienia po scaleniu L.
   - Ekrany 01 i 05 mają oznaczenie „wymaga Piekarz Pro” (wytyczne 2.3.2). To nazwany wyjątek od Treningu.
   - Strażniki: `tests/ramki-sklepu-podpisy.test.ts`, `tests/store-caption-layout.test.ts`.
2. **Zrzut zakupu (D-365).** Zmiana kodu aplikacji: atrapa ofert w `src/lib/platnosci/sklep.ts`.
   - Działa tylko przy `EXPO_PUBLIC_STORE_FAKE='1'`, w trzecim buildzie `e2e-ios.yml`. `testflight.yml` odrzuca tę flagę.
   - Scena `.maestro/e2e-zakup/` zapisuje zrzut ekranu zakupu (`review-zakup.png`).
   - Instrukcja dla właściciela: `docs/wydanie/zrzut-zakupu.md`.
   - Z `zrzuty-sklepu.yml` usunąłem zadanie zakupu, katalog `bez-oferty/` i build Basic.
3. **Wgrywanie (D-366).**
   - `scripts/asc/zrzuty.mjs` i `.github/workflows/asc-zrzuty.yml`: najpierw przebieg na sucho, zapis tylko w środowisku `release` i ze skrótem planu w `docs/wydanie/asc-zgoda-zrzuty.json`. Skrypt nigdy nie usuwa, pomija grupy z istniejącymi zrzutami i sprawdza, że przebieg pochodzi z `zrzuty-sklepu.yml` w tym repo.
   - `asc-zgloszenie.mjs` nie wysyła już zrzutów sklepu i nie usuwa niczego (żadnego DELETE).

## Recenzje (dwa świeże subagenty)

**Bezpieczeństwo:** brak P0.
- P1 (realność brzegowa; ten sam wzorzec już był w asc-zgloszenie i asc-ustawienia): zadanie na sucho ma klucz ASC z prawem zapisu poza środowiskiem release.
- Poprawione: trzy uwagi P2 oraz błąd YAML w `asc-zrzuty.yml`. Dodałem test, który parsuje 4 workflowy.

**Ramki vs Trening:** brak P0. Algorytm i geometria są zgodne z Treningiem.
- P1 (logika jak w Treningu): krótkie słowo zostaje na końcu 1. wiersza (pl/01 „Chleb gotowy na / twoją godzinę”, es-MX, el), a ja i zh-Hant łamią się w złych miejscach.
- P2: znacznik Pro ma tylko 1,4% wysokości.
- Poprawione: strażnik cen i odrzucanie „\”.

## Pytania (wdrożona rekomendacja; zmiana na drugą opcję jest mała)

| Nr | Sprawa | Opcje | Rekomendacja |
|---|---|---|---|
| P1 | podpis ramki (D-363) | A: sam nagłówek; B: nagłówek + podtytuł (ok. 55 znaków, ponad limit) | A |
| P2 | oznaczenie Pro (D-364) | A: zostaje; B: usunąć jak Trening | A |
| P3 | zrzut zakupu (D-365) | A: atrapa ofert w E2E; B: zrzut z TestFlight | A |
| P4 | łamanie wierszy | A: jak Trening; B: kara za krótkie słowo na końcu wiersza, poprawki ja/zh | B, po pierwszym przebiegu |
| P5 | rozmiar znacznika Pro | A: 1,4% wysokości; B: 2% | B |
| P6 | klucz ASC w przebiegu na sucho | A: klucz z zapisem jako sekret środowiska release, na sucho klucz tylko do odczytu (krok właściciela); B: zostawić | A |

## Wymaga macOS albo ASC (zleca koordynator)

1. `zrzuty-sklepu.yml` z `tylko=pl`: zadania zrzuty, zbierz i ramki.
2. `e2e-ios.yml`: trzeci build i scena zakupu.
3. `asc-zrzuty.yml` na sucho, z ID przebiegu zrzutów z punktu 1.

Nieaktualne opisy do poprawy: pole `opis` w `docs/wydanie/asc-zgloszenie.json` i `docs/wydanie/droga-do-app-store.md:57`.
