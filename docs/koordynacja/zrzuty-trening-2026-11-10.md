# Zrzuty sklepu i zrzut zakupu: jak robi Trening (2026-11-10, KO-033)

Źródło: subagent koordynatora (odczyt), trening `main` @ `2e4b0f8`; porównanie z Piekarzem (`naprawy/M2-koordynator-napraw-2026-11-10-zrzuty` @ `14d8f6e1`) i Oczkiem (`claude/build3-2026-11-10` @ `87ade5a`). Plik:linia w repo trening.

## Zrzuty (Trening)
- CI na symulatorze iOS, build Release bez sztucznego sklepu: `.github/workflows/store-screenshots.yml` (ręcznie; zadania dane → build → zrzuty → ramki), `scripts/ci/store-screenshots.sh` (stan do SQLite, łącze `trening://`, Maestro `scripts/ci/maestro-sklep/*.yaml`, `xcrun simctl io screenshot`, pasek 9:41), dane zmyślone z `scripts/screens/store-seed.test.ts`, ciemny motyw (decyzja właściciela).
- Rozmiar domyślny 6,9″ (iPhone 17 Pro Max 1320×2868), 6,3″ opcja; bez iPada; Apple skaluje w dół (docs/48:280-281).
- Każda lokalizacja ma własny zestaw (inaczej Apple pokazuje podpisy języka głównego, docs/48:299); 35 języków aplikacji, do ASC 32 lokalizacje (`scripts/asc/zrzuty.mjs:42-46`); macierz do 3 zadań macOS.
- **Ramki i podpisy (decyzja D-6 B, docs/41:85-88,156):** `scripts/ci/store-frames.sh` (zadanie ubuntu, ImageMagick 6 + `fonts-noto-cjk`): tło `kolory.tlo`, podpis u góry (86% × 15%), zrzut 78% z zaokrągleniem 7% i obwódką, bez obudów Apple; krój marki z `node_modules` (IBM Plex Sans Bold), CJK Noto Sans CJK Bold; `scripts/ci/store-caption-layout.mjs` (1 rozmiar na język, ≤ 2 wiersze, `Intl.Segmenter` dla ja/zh) + `tests/store-caption-layout.test.ts`.
- Teksty: `store/screenshot-captions.json` (`kolory` z ciemnego motywu, `maxZnakow` 40, `podpisy[język][ekran]`, `status`: PL/EN zaakceptował właściciel, reszta przekład agenta + recenzja agenta); strażnik `tests/audit-m1-2026-10-27-037-podpisy-zrzutow.test.ts`.
- Wyniki: artefakty 3 dni. Wgrywanie: `asc-zrzuty.yml` (dry-run → apply za `release`) + `scripts/asc/zrzuty.mjs` (App Asset Library, nigdy nie usuwa, pomija grupy z zrzutami); 64/64 zestawów 30.10 (docs/48:110).
- Proces: przegląd każdego obrazu przez agenta (L-004, docs/40:671-677), potem akceptacja właściciela.

## Zrzut zakupu dla App Review (Trening)
- Użyty w 1.0: `99-zakup-ceny.png` ze scenariusza E2E `.maestro/21-subskrypcja.yaml:57` (build E2E z atrapą sklepu `EXPO_PUBLIC_STORE_FAKE=1`, ekran z cenami i planami), jeden plik dla 3 produktów, **wgrany ręcznie przez właściciela** (docs/48:118, Z-24). Brak użycia API zrzutów recenzji IAP.
- Zadanie „zakup” w workflowie zrzutów (wejście przez łącze) zepsute — okno „Open in Training?” (docs/21:246) — nie kopiować.

## Do przeniesienia (Piekarz i Oczko)
1. Krok „ramki”: `store-frames.sh` + `store-caption-layout.mjs` + test; zadanie ubuntu po zrzutach; krój marki; ramka własna.
2. Plik podpisów jak `store/screenshot-captions.json` + strażnik; PL/EN akceptuje właściciel, reszta przekład + recenzja (w Piekarzu źródło: pole `ramki` w `docs/wydanie/metadane/<kod>.json`).
3. Własny zestaw na każdą lokalizację sklepu; domyślnie 6,9″ (Oczko: dołożyć języki poza en).
4. Wgrywanie przez App Asset Library (`scripts/asc/zrzuty.mjs`, `asc-zrzuty.yml`; Piekarz dziś `appScreenshotSets` i usuwa stare zrzuty — `asc-zgloszenie.mjs:183,277-281`).
5. Zrzut zakupu: scena Maestro w E2E z atrapą sklepu (ekran z cenami i planami) → plik z artefaktu, wgrany ręcznie przez właściciela przy każdym produkcie.
6. Przegląd każdego obrazu przed pokazaniem właścicielowi (L-004).

Nie sprawdzono: `scripts/asc/zrzuty.mjs` poza 1–80, `scripts/ci/maestro-sklep/`, `store-seed.test.ts`, wyniki przebiegów CI z dokumentów.
