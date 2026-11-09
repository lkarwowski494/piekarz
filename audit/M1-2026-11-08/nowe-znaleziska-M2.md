# Nowe znaleziska M2 (bez naprawy; M1 włącza w reaudycie)

### M2-koordynator-napraw-001 · Komunikat adaptacji czasu fermentacji do temperatury (RD-08) nie jest nigdzie pokazywany
- Pozycja listy kontrolnej: DEV-05 (rola 08; martwy kod domeny)
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: P (czy pokazywać komunikat w Harmonogramie/Stolnicy — rola 03/04)
- Dowód: przed 259f0880 `calculateFermentationAdaptation(...).messagePl` używane tylko w testach (`grep -rn "messagePl\|calculateFermentationAdaptation" src app` poza `__tests__` → tylko `src/core/domain-rules.ts`); po 020 domena zwraca `komunikat: { rodzaj, temperaturaC, minuty }`.
- Mechanizm: funkcja domeny z tekstem w i18n (3 klucze w 35 słownikach) bez ekranu, który ją wywołuje.
- Opcje: (a) pokazać komunikat przy temperaturze w Harmonogramie — praca 04/08, teksty już przetłumaczone; (b) usunąć funkcję i 3 klucze — mniej kodu. Rekomendacja: decyzja roli 03 (zakres).
- Test akceptacyjny: (a) test ekranu z komunikatem; (b) brak funkcji i kluczy, check:i18n kod 0.
- Status: otwarte

### M2-koordynator-napraw-002 · Niespójności w istniejących słownikach zauważone przy drugim przeglądzie przekładu 026
- Pozycja listy kontrolnej: LOC (rola 09; jakość przekładu)
- Poziom: P2
- Realność: realny   · Pewność: średnia (przegląd modelu, nie rodzimego użytkownika)
- Rodzaj: D
- Dowód: drugi przegląd AI 2026-11-09 (`docs/lokalizacja/przeklad-m2-026-2026-11-09.json`, pole `drugi_przeglad`): bg i sr mieszają „g” i „г” (np. 'Woda: {amount} g' → „г”, 'Mąka: {amount} g' → „g”); ro komunikaty zakresu „între 0–150%” zamiast „între 0 și 150%”; sl/hr zakwas „kvas” obok drożdży „kvasovke”/„kvasac” (w sl „kvas” potocznie = drożdże).
- Opcje: (a) poprawki w `docs/lokalizacja/poprawki-przekladu.json` z drugim przeglądem; (b) bez zmian do przeglądu natywnego. Rekomendacja: (a) dla g/г, reszta do przeglądu natywnego.
- Test akceptacyjny: kontrola jednostki g/г w bg/sr (jedna forma) w check:i18n albo teście.
- Status: otwarte
