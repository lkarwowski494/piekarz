# Sesja AB: krój tytułów po zmianie języka — naprawa systemowa (68 getterów) — Piekarz
Koordynator: session_01T66VBvsaNByxks7DxtBjJf. Gałąź stanu: koordynacja (tylko do odczytu). Wykonanie: subagent koordynatora (wyjątek nazwany jak AA).

1. Rola: 08-programista, tryb fix (prompt roli z pliku wskazanego przez koordynatora).
2. Start: gałąź `naprawy/M2-koordynator-napraw-2026-11-17-kroj` @ `9f523b96` (= `master` = `redesign`). `npm ci`. Tożsamość commitów według CLAUDE.md.
3. Tło: D-419 (`docs/decyzje.md`) i recenzje `docs/koordynacja/recenzje/AA-cadaf28e.md`, `AA-6283850c.md` na `koordynacja`: leniwy `get fontFamily()` w `StyleSheet.create` liczy się raz; ekrany zamontowane przed `initLanguage()` albo przy zmianie języka w Ustawieniach zostają z krojem poprzedniego języka (np. Sofia z bułgarskimi formami dla ru/uk, Sofia bez glifów dla vi/ja/ko/zh-Hant). Naprawione ręcznie 5 miejsc; zostaje ~68 getterów w ~46 plikach (`grep -rn "get fontFamily" app src`). Decyzja właściciela KO-070 (17.11): naprawa przed wydaniem 1.0.
4. Zadania (test najpierw czerwony z właściwego powodu):
   1. Rozwiązanie systemowe dla obu ścieżek: (a) start — drzewo ekranów renderuje się dopiero po `initLanguage()` (bez migotania i bez utraty danych; ekran ładowania/`StorageGate` jak dziś); (b) zmiana języka w Ustawieniach — style z krojem przeliczają się bez utraty stanu ekranu i nawigacji (rekomendacja AA: nie `key={lang}` na korzeniu, bo gubi stan; rozważ funkcję stylu przy renderze / hook zależny od języka; wybór z uzasadnieniem w decyzji). Gotowe: test na obie ścieżki (start w ru/uk/vi/ja/ko/zh-Hant i zmiana pl→ru w trakcie), czerwony przed.
   2. Usuń pozostałe gettery albo udowodnij testem, że po zmianie (1) dają dobry krój; zaktualizuj `tests/duzy-tekst-kroj.test.ts`, który dziś wymusza wzorzec getterów.
   3. Strażnik automatyczny: test/reguła, która zakazuje nowego `get fontFamily()` w `StyleSheet.create` bez mechanizmu z (1) (zasada wspólna 21: kontrola, którą agent może pominąć, w teście).
   4. Bez zmian wyglądu poza krojem (system z `theme.ts`); AX5, 320 pt, 44 pt bez zmian; limit 20 480 B na plik.
   5. `npm run verify` kod 0 na końcowym SHA → `docs/dowody-08-kroj/verify.txt` (nagłówek z SHA, ostatnie 30 linii, kod wyjścia); czerwony→zielony → `docs/dowody-08-kroj/czerwony-zielony.txt`; stan → `docs/stan-08-kroj-2026-11-17.md`. Commit, push.
   6. Decyzja w `docs/decyzje.md` z puli D-423…D-427, z odnośnikiem do KO-070 i D-419.
5. Zakazy: bez scalania do `redesign`/`master`, bez workflowów, bez `.maestro/` i workflowów bez PYTANIA, bez --no-verify/force-push, bez pytań do właściciela. Blokujące PYTANIE: stan, push, PYTANIE (≥2 opcje, rekomendacja) jako odpowiedź końcowa.
6. Kontekst: od 30% okna — stan, push, PRZEKAZANIE.
7. PRZEKAZANIE (≤12 linii): SHA końcowy, SHA verify, dowody, testy czerwony→zielony, decyzje, otwarte.
