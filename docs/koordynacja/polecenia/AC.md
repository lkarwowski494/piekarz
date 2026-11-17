# Sesja AC: poprawki P2 z recenzji AB (KO-071) — Piekarz
Koordynator: session_01T66VBx7jgKEjU1waMqDC5H (wykonujesz jako subagent koordynatora; raport końcowy to twoja odpowiedź). Gałąź stanu `koordynacja` tylko do odczytu.

1. Rola: 08-programista, tryb fix. Prompt roli: plik wskazany w wiadomości startowej; przeczytaj w całości.
2. Start: gałąź `naprawy/M2-koordynator-napraw-2026-11-17-kroj-ac` od `52c755c6` (koniec AB). Pracuj w osobnym worktree w scratchpadzie. Instalacja: `npm ci`. Tożsamość commitów według CLAUDE.md (Claude <noreply@anthropic.com>), sprawdź przed pierwszym commitem.
3. Zadania (raport recenzji: `AB-recenzja.md` w scratchpadzie koordynatora); każde z testem czerwonym na `52c755c6` z właściwego powodu i zielonym po poprawce:
   - AB-01: `app/_layout.tsx` — po błędzie `initDatabase` i udanym „Spróbuj ponownie” drzewo ekranów musi się narysować (bramka języka nie może zostać w `start-jezyk-ladowanie`). Też P3: wiszące/rzucające `initLanguage` nie zostawia wiecznego ekranu ładowania ani nieobsłużonego odrzucenia (fallback na język domyślny/systemowy). Gotowe: test regresji + test błędu initLanguage.
   - AB-02: przywróć ochronę z `tests/stolnica-jedna-instancja-p1.test.tsx` (listener dotknięcia powiadomienia zarejestrowany przed końcem startu) i, jeśli trzeba, kod, by ją spełniał. Gotowe: kontrola negatywna (przeniesienie rejestracji za koniec startu = czerwone).
   - AB-03: strażnik `tests/kroj-tytulow-straznik-d423.test.ts` łapie też (a) arkusz z fabryki wywołany raz przy imporcie, (b) statyczne `typografia.krojTytulow` w fabryce. Gotowe: kontrola negatywna dla obu.
   - AB-04: po zmianie języka wszystkie zamontowane ekrany (także inne zakładki pod `StaticContainer`) pokazują nowy krój i nowe teksty `t()` bez ręcznego przejścia. Rozwiązanie systemowe (np. subskrypcja języka / przerysowanie poddrzewa), bez utraty stanu formularzy w toku, jeśli to możliwe — gdy nie, opisz kompromis w D-424. Popraw komentarz w `src/ui/kroj-tytulow.ts` i D-423. Gotowe: test, że ekran innej zakładki zmienia krój i tekst po zmianie języka.
   - AB-05: test `useNaglowek` (`src/ui/naglowek.ts`) przeliczania po zmianie języka; usunięcie `jezyk` z zależności = czerwone.
   - Na końcu `npm run verify` kod 0 na SHA kodu, wynik do `docs/dowody-08-kroj-ac/verify.txt`; czerwony→zielony do `docs/dowody-08-kroj-ac/czerwony-zielony.txt`.
4. Zakazy: nie scalasz do `redesign`/`master`, nie piszesz na `koordynacja`, nie ruszasz gałęzi AB, bez --no-verify i force-push, bez osłabiania asercji, bez @ts-ignore/test.skip, limit 20 480 B, nie pytasz właściciela. Wygląd bez zmian (zasada 15).
5. Decyzje: pula D-424…D-427 w `docs/decyzje.md` z odnośnikiem do KO-071 (pytania: w raporcie, z opcjami i rekomendacją).
6. Push: zbiorczo na swoją gałąź na końcu.
7. Raport końcowy ≤ 12 linii: SHA końcowy i SHA kodu, verify (kod, liczby), dowody, decyzje, zmienione istniejące testy z uzasadnieniem, otwarte [DO USTALENIA].
