# Rola 08 · fix · p4 · M1-audytor-generalny-005 (04-studio-projektowe-001)

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p4`, baza f6291d8f, commit **2f4a260e** (wypchnięty). Klasyfikacja: D, wygląd wg opcji (A) — **decyzja M2 D-318, do weta (D-289)**; nie dopisano jej do `docs/decyzje.md`.

## Co zmienione
- Pas prowadzenia: tylko tytuł kroku, „Krok n z m”, czas i „potem …” (`src/components/stolnica/ProwadzenieWypieku.tsx:325`).
- Nazwa receptury, Spirala (pełna, z legendą) i „Gotowe …” przeniesione z pasa do karty „Plan wypieku” pod kartą kroku i ostrzeżeniem (`src/components/stolnica/StrefaPlanu.tsx:33`); tekst istniejący (`Plan wypieku`), ikona `kalendarz`; bez nowych tekstów.
- Karta kroku bez podwójnych marginesów (instrukcja i „Ekran nie zgaśnie…” miały `marginBottom` 16 obok `gap` karty) — `src/components/stolnica/stolnica-screen.styles.ts:45`.
- testID i ścieżki E2E bez zmian (`karta-kroku`, `step-title`, `step-time`, `step-next`, przyciski); zegar i kroki bez zmian.
- E2E `.maestro/e2e/03-prowadzenie-widok-skupiony.yaml:74`: `assertVisible` na `step-warning` (pierwszy krok, dokarmienie zakwasu, ma ostrzeżenie).
- Test `src/__tests__/pas-plan-prowadzenie-p4b.test.tsx` zaktualizowany do nowego układu (Spirala w `karta-planu`, nie na pasie) — kodował układ D-194, który D-318 zmienia.

## Testy
- Nowy: `src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx` + rachunek układu `tests/helpers/uklad-ekranu.ts` (tokeny i style; kalibracja na zrzucie E2E #100 402×874: góra „Zrobione” 706/706 pt, czas 238/~235 pt).
- Przed (kod f6291d8f): 4/4 czerwone z właściwego powodu — dół ostrzeżenia 920 (pl) i 942 (en) > góra „Zrobione” 684; karta 778 > przełącznik 597; brak `step-warning` w E2E (dowody/p4-005-jest-przed.txt).
- Po: 4/4 zielone (dowody/p4-005-jest-po.txt). `npm run verify` kod 0: 654 zestawy, 6827 testów (dowody/p4-005-verify.txt).

## Otwarte
- **320×568 niewykonalne w opcji A** (dowody/p4-005-rachunek-po.txt): pasek kciuka przy 320 pt ma dwa rzędy, „Zrobione” od 376 pt, sam pas kończy się na 408 pt; nawet pas z samym rzędem nawigacji (84 pt) + karta 134 + ostrzeżenie 165 = 395 > 376. Przy 375×667 ostrzeżenie widać w ok. 60 pt. Opcje dla roli 04 (P): (a) przy niskim ekranie „Cofnij poprzedni”/„Po co ten krok” w jednym rzędzie i pas zwarty (czas obok tytułu) — zmiana komponentów systemu; (b) wejście w krok przewija do karty, tytuł i czas w czapce paska stanu — czas znika z pasa; (c) przyjąć 320×568 z ostrzeżeniem po przewinięciu. Rekomendacja: (a), z rachunkiem tym samym testem.
- 393×852 dwa wypieki: karta nad przełącznikiem, ostrzeżenie częściowo pod nim (ok. 56 pt). en przy 393: zapas ok. 7 pt (rachunek, nie pomiar).
- Zrzuty przed/po z symulatora: brak (Linux); E2E iOS uruchamia koordynator. Przegląd ścieżek wrażliwych: nie dotyczy (bez danych).
- AX5: bez zmian zachowania (pas przy dużym tekście jak wcześniej, Spirala pod kartą); nie mierzone.

## Kontrola dowodów i sekretów
`node sprawdz-raport.mjs wynik-p4.md .` → kod 0: „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”.
