# Rola 09 fix 2026-11-09 — M1-audytor-generalny-049 (09-lokalizacja-008), DEC-12 b

- Commit: 3ccfd438 → M1-audytor-generalny-049; 09-lokalizacja-008 (push na naprawy/M2-koordynator-napraw-2026-11-09-p2). Klasa P; wdrożona tylko opcja b (D-286). Nie znalazłem dowodu przeciwko b: żadna z tych wartości nie dotyczy bezpieczeństwa (LOK-07 P0), a w regionie US masa i temperatura są przeliczane.
- Zmiana: `docs/lokalizacja/jezyki.md`, nowa sekcja „Długość i objętość w trybie imperialnym: zakres 1.0.1”. W 1.0 przeliczane są tylko °C, g i kg (D-044, `src/lib/unit-converter.ts:218-220`). Do zakresu 1.0.1 zapisane: cm/mm → in, ml/l → fl oz/cup/qt, zaokrąglenia od roli 06 i test kluczy z cm/mm/ml/l w trybie imperialnym. Bez zmiany kodu i słowników.
- Testy: bez nowego testu, bo przy opcji b test akceptacyjny to „decyzja w rejestrze”. Po `git add` uruchomiłem `npm run verify`: kod 0, 596 zestawów, 6116 testów (dowody/verify.txt).
- Dowody: dowody/jednostki-cm-mm-ml-l.txt (grep na HEAD 6fec6b7d znajduje 16 tekstów EN z cm/mm/ml/l; audyt policzył 9 poza PÓŹNIEJ).
- Przeczytane źródła: tylko rejestr projektu: `docs/decyzje.md` D-044, D-286 (DEC-12 b), D-288, D-302, D-276. Źródeł zewnętrznych nie czytałem (nie było potrzeby).
- Nowe znalezisko: D-302 i dopisek M2 powołują się na „D-280 pkt 5”, ale D-280 ma tylko punkty 1–2. Zasada „bez prac nad 1.1” to D-276 pkt 5; w `jezyki.md` podałem D-276.
- Przekazania: 06 — reguły przelicznika i zaokrągleń cm/mm/ml/l (1.0.1); 08 i 07 — brak w 1.0.
- Teksty do akceptacji roli 04: brak (nie ma nowych tekstów interfejsu). Przekład, drugi przegląd AI i ścieżka wrażliwa: nie dotyczy.
- Otwarte: czy przeliczać teksty opisu produkcji ze źródła (`czesc-26`, `czesc-27`) i etykietę „US Cup (236,6 ml)” — to decyzja w 1.0.1. Kroków właściciela brak.
