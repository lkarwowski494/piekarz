# Wejście weryfikacji G3-ratunek-awaria (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 12-niezawodnosc-001 · Tryb awaryjny daje plik, którego aplikacja nie przyjmie, bez kontaktu i bez ostrzeżenia przed usunięciem aplikacji
- Pozycja listy kontrolnej: NIE-05
- Poziom: P1
- Realność: brzegowy (wymaga pętli awarii przy starcie)   · Pewność: wysoka
- Rodzaj: P
- Dowód: `src/components/RescueScreen.tsx:30` — w trybie awaryjnym startu eksport JSON jest pominięty, zostaje pakiet surowych plików (`src/lib/kopia-plikow-bazy.ts:15`, format `piekarz-pliki-bazy`); import przyjmuje tylko `piekarz-backup` albo recepturę (`src/lib/import-z-pliku.ts:36`), więc pakiet jest plikiem nierozpoznanym. Ekran ma tylko dwa przyciski, eksport i ponowienie (`src/components/RescueScreen.tsx:62`, `src/components/RescueScreen.tsx:72`); nie ma kontaktu (istniejąca funkcja `napiszDoAutora` w `src/lib/zgloszenie-wyslanie.ts:29` nie jest użyta) ani zdania, że usunięcie aplikacji kasuje dane i kopie w `Documents/Backup/`. To samo na ekranie błędu bazy (`src/components/StorageGate.tsx:73`): udostępnia kopię `.db` sprzed migracji albo pakiet, oba nieimportowalne. W repo nie ma narzędzia ani opisu, jak deweloper zamienia pakiet albo `backup_pre_migration-*.db` na kopię `piekarz-backup` (grep `pliki-bazy` w `scripts/` i `docs/`: 0 trafień poza kodem). Sonda S1: pakiet z trybu awaryjnego ma komplet danych (4 wypieki, 2 zakwasy, 2 sesje, `integrity_check` ok) — dane są, droga ich powrotu nie istnieje (`dowody/nie14-d273-sonda-migracja-i-sesje.txt`).
- Mechanizm: ścieżka ratunku kończy się na pliku dla dewelopera, a deweloper nie jest osiągalny z tego ekranu; `grep -rn "napiszDoAutora" src app` → 1 użycie poza definicją (`src/components/settings/StudioEcosystemSection.tsx:122`), 0 w `RescueScreen.tsx` i `StorageGate.tsx`.
- Powraca: nie
- Kroki w aplikacji: dwa starty kończą się awarią (np. błąd w nowej wersji) → trzeci start: ekran „Piekarz nie uruchomił się poprawnie” → „Eksportuj kopię danych” zapisuje pakiet → użytkownik usuwa i instaluje aplikację → „Importuj z pliku” nie rozpoznaje pakietu; dane w praktyce utracone, kontakt tylko przez stronę w App Store.
- Test akceptacyjny: test renderu trybu awaryjnego i ekranu błędu bazy: przycisk kontaktu wywołuje `napiszDoAutora`, tekst ostrzeżenia obecny w 35 językach; skrypt dewelopera na pakiecie z sondy S1 daje kopię, którą `rozpoznajPlik` rozpoznaje jako `kopia` z 4 wypiekami i 2 zakwasami.

### 09-lokalizacja-002 · Ekran awaryjny po dwóch nieudanych startach jest zawsze po polsku
- Pozycja listy kontrolnej: LOK-13
- Poziom: P1
- Realność: brzegowy (tylko po dwóch nieudanych startach z rzędu; wtedy dotyczy 34 z 35 języków) · Pewność: wysoka
- Rodzaj: D
- Dowód: `app/_layout.tsx:64` „if ((await beginStartup()).rescue) {” — gałąź awaryjna kończy efekt przed `startAplikacji()`, a język ustawia tylko `startAplikacji` (`app/_layout.tsx:36` „await initLanguage();”); stan początkowy języka to źródło: `src/lib/i18n.ts:62` „let currentLang: Lang = SOURCE_LANG;”. Sonda: telefon de-DE, `beginStartup` → awaria, render `RootLayout`: „język aplikacji: pl”, teksty „Piekarz nie uruchomił się poprawnie”, „Eksportuj kopię danych”, „Spróbuj ponownie” (`dowody/sonda-awaryjny.txt`, kod 0). Komunikaty błędu eksportu też po polsku (`src/components/RescueScreen.tsx:46`).
- Mechanizm: język rozstrzyga się dopiero po bazie, a tryb awaryjny bazy nie dotyka; `grep -n "initLanguage\|setLang" app/_layout.tsx` → 1 trafienie (linia 36). StorageGate po błędzie bazy jest w porządku, bo `initDatabase` nie rzuca i `initLanguage` biegnie dalej (język z systemu).
- Powraca: nie → test: tryb awaryjny na telefonie de-DE pokazuje niemiecki tekst.
- Kroki w aplikacji: dwa starty przerwane przed pierwszym ekranem → trzeci start → ekran z eksportem kopii danych po polsku.
- Weryfikacja przeciwna (E2): RescueScreen nie ustawia języka sam; nie ma innego wywołania `initLanguage` przed renderem; sonda potwierdza. Zostaje.
- Test akceptacyjny: test renderu `RootLayout` z `beginStartup` → awaria i `getLocales` de-DE: tytuł i przyciski po niemiecku; z en-US po angielsku.

### 07-jakosc-003 · Koniec wypieku (wpis w Dzienniku, ocena, kopia automatyczna) bez scenariusza E2E i bez punktu listy telefonu
- Pozycja listy kontrolnej: JAK-12
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: żaden z 10 scenariuszy E2E nie dochodzi do końca wypieku — identyfikatory użyte w scenariuszach nie obejmują oceny ani zakończenia (`dowody/e2e-pokrycie.txt`); `next-or-finish-step-btn` stukany najwyżej 4 razy przy recepturze `country_loaf_72`; lista telefonu nie ma słów „Dziennik”, „ocen”, „zakończ”, „piekarz-kopia” (`grep` kod 1, tamże); kopia automatyczna po wypieku połyka błąd zapisu (`src/data/sqlite-store.ts:70`).
- Mechanizm: lista „tylko telefon” pisana ręcznie (`docs/wydanie/lista-kontrolna-telefonu.md:3`), bez generatora z przepływów; E2E pokrywa start, prowadzenie i plan, a nie wynik wypieku; `grep -rn "autoBackup(" src app` → 2 trafienia: `src/data/sqlite-store.ts:70`, `src/data/sqlite-store.ts:381`, oba z cichym `.catch`.
- Powraca: częściowo — 07-jakosc-008 z 2026-11-02 (brak jednej listy „tylko telefon” na wzór `trening`) → trwała kontrola: test, że każdy przepływ głównej pracy z `docs/brd/wymagania.md` (PR) ma scenariusz E2E albo punkt PH.
- Kroki w aplikacji: Stolnica → ostatni krok → „Zakończ” → ocena → Dziennik; kopia `piekarz-kopia-*` w Plikach. Jeśli zapis kopii albo wpisu zawiedzie tylko na urządzeniu, użytkownik nie dostaje komunikatu, a żaden przebieg przed wydaniem tego nie pokazuje.
- Test akceptacyjny: scenariusz E2E kończy wypiek i sprawdza wpis w Dzienniku; punkt PH z wynikiem dla buildu kandydata w dzienniku wydań.

### 12-niezawodnosc-002 · Wiadomość do autora nigdy nie zawiera numeru buildu; test maskuje to atrapą
- Pozycja listy kontrolnej: NIE-08
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/lib/zgloszenie-wyslanie.ts:34` czyta `Constants.expoConfig?.ios?.buildNumber`; `app.json` celowo nie ma `ios.buildNumber` (`scripts/verify-native.mjs:40`), a numer ustawia workflow w `Info.plist`. Konfiguracja, którą expo-constants osadza w buildzie (`getConfig`), daje `version 1.0.0 ios.buildNumber undefined` (komenda i kod 0: `dowody/nie08-numer-buildu.txt`). Test podstawia atrapę z numerem (`src/__tests__/kontakt-z-adresem.test.tsx:17`), więc nie widzi braku. `EXPO_PUBLIC_BUILD_NUMBER` z workflow nie jest nigdzie czytany (grep: 0 trafień w `src` i `app`).
- Mechanizm: źródło numeru buildu w aplikacji inne niż źródło w workflow; `grep -rn "buildNumber" src app` → 1 trafienie w kodzie (`src/lib/zgloszenie-wyslanie.ts:34`).
- Powraca: nie
- Kroki w aplikacji: Ustawienia → „Napisz do nas” → treść ma „Wersja aplikacji: 1.0.0” bez „(1023)”. W TestFlight wersja 1.0.0 ma buildy 1006–1023, więc zgłoszenie testera nie wskazuje kodu.
- Test akceptacyjny: test treści zgłoszenia bez atrapy `ios.buildNumber` pokazuje numer z mechanizmu wybranego w opcji; test workflow sprawdza, że zmienna jest ustawiona przed krokiem archiwum.

### 12-niezawodnosc-003 · Build 1023 (i 1021) bez dSYM dla React, ReactNativeDependencies i hermesvm
- Pozycja listy kontrolnej: NIE-08
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: D
- Dowód: log wysyłki buildu 1023 (run 42511360071): trzy ostrzeżenia „exportArchive Upload Symbols Failed. The archive did not include a dSYM” dla React.framework, ReactNativeDependencies.framework i hermesvm.framework (`dowody/nie08-dsym-build-1023.txt`); to samo przy 1021 (`docs/wznowienie-M3.md:189`, opisane jako brzegowe, bez decyzji). `uploadSymbols` jest włączone (`.github/workflows/testflight.yml:271`).
- Mechanizm: prebudowane frameworki React Native i Hermes w archiwum bez plików DWARF; dotyczy każdego buildu tym workflow.
- Powraca: tak — ostrzeżenie z buildu 1021 (2026-11-03) wraca w 1023 → trwała kontrola: krok workflow, który po archiwum wypisuje frameworki bez dSYM i kończy się błędem albo ostrzeżeniem z decyzją.
- Kroki w aplikacji: awaria natywna w kodzie React Native albo Hermes (np. fatalny błąd JS ponownie rzucony przez RN) → raport w TestFlight „Crashes” ma adresy zamiast nazw funkcji w tych ramkach.
- Test akceptacyjny: log wysyłki bez „Upload Symbols Failed”; ćwiczenie z celową awarią pokazuje nazwy funkcji w ramkach React/Hermes.
