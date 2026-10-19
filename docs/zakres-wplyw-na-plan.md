# Wpływ kontraktu zakresu na plan napraw M1
Stan: 2026-10-20 · Rola 03 build · Kontrakt: `docs/scope-contract.md` (D-043, wariant B) · Plan: `audit/M1-2026-10-19/M1-2026-10-19/plan-napraw.json` (95 zadań; rola 03 go nie edytuje — przestawia M1)

Lista dla M1: każda funkcja wycięta (NIE, PÓŹNIEJ, TEST), zmieniona albo nowa w nowym kontrakcie, z ID zadań planu, których dotyczy. Propozycja: **usunąć** (zadanie traci przedmiot), **zmienić** (inny test akceptacyjny albo zakres), **bez zmian** (zadanie zostaje, wpis tylko dla śladu), **nowe** (brak zadania; propozycja dla M1). Zadania z ID spoza tej listy kontrakt nie zmienia. Metoda: przeszukanie pól `tytul` i `test_akceptacyjny` wszystkich 95 zadań (słowa: QR, aparat, druk, PDF, spiżarnia, objętość, lód, Akademia, lekcja, jednostki, start, ocena aplikacji, kontakt, import, Doktor, porównanie) i ręczne przejrzenie trafień (trafienia przypadkowe, np. „kopia zapasowa” dla spiżarni, pominięte).

## Funkcje wycięte z wersji 1

| ID zadania | Funkcja | Co się zmienia | Propozycja |
|---|---|---|---|
| M1-audytor-generalny-029 | F-08 QR (PÓŹNIEJ) | QR ma BR i wiersz kontraktu, ale decyzja PÓŹNIEJ: wejście (`share-recipe-qr-btn`, skan) ukryte wzorcem `src/lib/wejscia-pozniej.ts`, uprawnienie aparatu usunięte z wersji 1 (`app.json`, Info.plist); kod i testy modułu zostają. Test: „brak przycisków QR i brak opisu uprawnienia aparatu w buildzie; testy modułu QR zielone” | zmienić |
| M1-audytor-generalny-049 | F-08 QR | opis uprawnienia aparatu nie jest potrzebny w 1.0; locales dla nazwy aplikacji zostają | zmienić (bez opisu aparatu) |
| M1-audytor-generalny-066 | F-08 QR | test importu z prawdziwego eksportu TestFlight zostaje dla kopii i pliku (F-33); QR i `.piekarz` poza zakresem 1.0 | zmienić (tylko import kopii i pliku) |
| M1-audytor-generalny-078 | F-08 QR | notatki dla App Review bez QR; zostaje ścieżka importu pliku | zmienić |
| M1-audytor-generalny-028 | F-08 QR | link do nieistniejącej domeny już usunięty (DEC-05 a); bez wpływu | bez zmian |
| M1-audytor-generalny-072 | F-50 druk (PÓŹNIEJ) | eksporty w języku i jednostkach użytkownika zostają (tekst receptury, plik danych); PDF karty i etykiety słoika poza 1.0 (wejście `print-menu-btn` ukryte); kalendarz już wycięty (KL-09) | zmienić (bez PDF druku) |
| nowe (08) | F-30 spiżarnia (PÓŹNIEJ) | ukryć wejście `open-flour-inventory-btn` (wzorzec `wejscia-pozniej.ts`); tabela zapasów, odpis i dane zostają, zapasy w eksporcie F-33 (podłoga danych dla testerów TestFlight) | nowe |
| nowe (08) | F-45 przelicznik objętości (PÓŹNIEJ) | jeśli wejście istnieje w kodzie (stary kontrakt: przycisk obok wyboru receptury) — ukryć; masy bez źródła (OP-44) [DO USTALENIA: czy kod jest] | nowe |
| nowe (08) | F-53 masa lodu (NIE) | usunąć pole i wynik lodu z sekcji DDT (`src/components/calculator/accordion/AccordionDdtSection.tsx`) i reguły RD-18 z interfejsu; temperatura wody (F-10) zostaje | nowe |
| M1-audytor-generalny-039 | F-53 / F-10 | ostrzeżenie o wodzie > 45 °C dotyczy F-10 (zostaje); próg OP-34 u roli 06 | bez zmian |
| — | F-63 porównanie, F-70 synchronizacja (PÓŹNIEJ) | brak kodu i zadań; nic nie budować | bez zmian |
| — | F-15 ocena gotowości ciasta (TEST) | istniejący przewodnik w Doktorze (`src/components/doktor/KitchenTestsGuideSection.tsx`) bez zmian do wyniku testu roli 04; nie przenosić do Stolnicy przed wynikiem | bez zmian |

## Funkcje zmienione

| ID zadania | Funkcja | Co się zmienia | Propozycja |
|---|---|---|---|
| M1-audytor-generalny-096 | F-38 miary USA | wymaganie w kontrakcie (kryteria w kolumnie „Intuicyjność” F-38); ustawienie domyślne jednostek: decyzja właściciela na STOP E3 roli 03 (rekomendacja: według regionu); BR-UST-001 do uzupełnienia przez rolę 01 (ER-49) | bez zmian (dopisać decyzję o domyślnych jednostkach po STOP E3) |
| M1-audytor-generalny-070, -072 | F-38 | formaty liczb i eksporty w jednostkach użytkownika — część pełnego pokrycia miar | bez zmian (072: patrz F-50) |
| M1-audytor-generalny-090 | F-38 i inne | wybory domyślne z decyzją: OP-38 12 h, OP-49 4★, domyślne jednostki (STOP E3) zapisane w D-042, D-043 | zmienić (wskazać D-042, D-043) |
| nowe (08) | F-44 Akademia | wersja 1 to „po co ten krok” przy krokach (BR-NAUK-001, H-13 a); lekcje i biblioteka technik (`src/components/academy/`) bez osobnego wejścia w 1.0 (PÓŹNIEJ w ramach F-44); zdania tylko ze źródłem (RYZ-21) | nowe |
| M1-audytor-generalny-045, -069 | F-44 | treści lekcji bez źródła: zostają naprawy treści, które trafiają do „po co ten krok” | bez zmian |
| M1-audytor-generalny-057 | F-09 Kalkulator, F-68 | z akcji Kalkulatora znikają QR, druk i spiżarnia (PÓŹNIEJ); cel „najwyżej 4 akcje główne” łatwiejszy; pierwszy ekran po uruchomieniu to start F-68 | bez zmian (kryterium partii 5) |
| M1-audytor-generalny-026 | F-33 import | D-039: import działa zawsze, także po próbie (bez bramki zakupu) | zmienić (test: import bez oferty po próbie) |
| M1-audytor-generalny-009, -027 | F-67, F-37 | uprzedzenie 3 dni i wypiek do końca (D-039, ER-48 w BRD) | bez zmian (rozbieżności dla 08 w `docs/monetyzacja.md`) |
| M1-audytor-generalny-035, -080, -081, -095 | wszystkie PÓŹNIEJ/NIE | opis sklepu, README i zrzuty bez QR, druku, spiżarni, przelicznika objętości i masy lodu (OG-05) | zmienić (lista funkcji z kontraktu) |
| M1-audytor-generalny-093 | funkcje PÓŹNIEJ z kodem | przekład 35 języków: teksty funkcji z ukrytym wejściem (F-30, F-08, F-50, F-45, lekcje F-44, F-46…F-49, F-52) poza zakresem 1.0 — mniej segmentów | zmienić (zakres tekstów; decyzja M1) |
| M1-audytor-generalny-032 | kontrakt | nowy kontrakt ma F-nn, BR z BRD i `zakres.mjs` z kodem 0 | bez zmian (do weryfikacji) |
| M1-audytor-generalny-031 | lista KL | KL-06…KL-17 przeniesione bez zmian | bez zmian |

## Funkcje nowe (BR nowe w BRD, ER-36, ER-44…ER-46)

| ID zadania | Funkcja | Co się zmienia | Propozycja |
|---|---|---|---|
| M1-audytor-generalny-087 | F-68 start (BR-START-001) | BR obejmuje przykłady oznaczone jako przykład i powrót do trwającego wypieku | bez zmian (kryterium partii 5) |
| nowe (08, partia 5) | F-68 start | ekran „co dziś robisz” z trzema czynnościami (BR-START-001); kształt: rola 04 (H-08) | nowe |
| M1-audytor-generalny-082 | F-69 pętla opinii | BR-OPIN-001, -002 (OG-07): tylko systemowa prośba po wypieku ≥ 4★ (D-042), link `action=write-review` | zmienić (test z progiem 4★ i bez własnego okna) |
| M1-audytor-generalny-083 | F-69 | BR-OPIN-003: kontakt przez systemową pocztę, treść widoczna przed wysłaniem, bez połączeń | zmienić (test z BR-OPIN-003) |
| nowe (08) | F-13 (BR-HARMO-005) | zakończenie kroku wcześniej, cofnięcie pomyłkowego potwierdzenia, przeliczenie powiadomień | nowe |
| nowe (08) | F-57 (BR-ETAP-004) | ostrzeżenia w krokach: gorące naczynie, surowe ciasto, krok nieznanego rodzaju (RD-22, RD-23; ER-42: `src/core/baking-phases.ts:41` bez ostrzeżenia) | nowe |
| M1-audytor-generalny-086 | F-57 | wymagania bezpieczeństwa są w BRD (rola 01) | bez zmian |
| nowe (08) [DO USTALENIA: stan kodu] | F-60 zakwas od zera, F-61 obudzenie z lodówki, F-62 poprawa wpisu, F-64 Doktor dla zakwasu (BR-ZAKW-005…007, BR-DIAG-002) | nowe BR; rola 08 sprawdza, co z nich jest w kodzie, i dopisuje brakujące | nowe |
| M1-audytor-generalny-007 | F-65 usunięcie danych | usunięcie po próbie bez zakupu (BR-DANE-004) | bez zmian |
| M1-audytor-generalny-019 | F-58 wznowienie wypieku | BR-ETAP-005 (bloker) | bez zmian |

## Bez zmian w zakresie, wpisy dla śladu
F-07 (030, 056), F-09 (040, 059), F-11 (091, 094), F-14 (041), F-16 (006), F-18 (060), F-24 (044), F-25 (013, 014, 016, 046), F-31…F-33 (001…005, 018, 020…022, 024, 061, 062), F-35, F-37 (008, 010, 011, 025), F-40 (012), F-43 (042, 043), F-55 (092): funkcje MVP bez zmiany względem planu.

## Ryzyka dla M1
- Numery D-040…D-043 (role 01 i 03 na tej gałęzi) mogą zderzyć się z wpisami partii 3 w `docs/DECISIONS.md` na gałęzi p3; przy scaleniu przenumerować jawnie.
- D-043 zmienia wcześniejsze decyzje właściciela D-029, DEC-05 a (QR) i D-034 pyt. 6a, 7b (spiżarnia, druk): zadania z nich wynikające (029 i pochodne) dostają nowy test akceptacyjny, a nie „naprawione”.
