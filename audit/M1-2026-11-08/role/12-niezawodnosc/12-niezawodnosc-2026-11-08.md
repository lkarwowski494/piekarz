# Audyt: Niezawodność — Piekarz — 2026-11-08
Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 (kandydat 1.0, build TestFlight 1023) · Tryb: audit (M1, wariant głęboki; moduły ratowanie-danych, widocznosc-awarii, incydent-i-poprawka) · Środowisko: Linux bez Xcode i bez symulatora iOS; Node 22 z node:sqlite i Python sqlite3 działają; sieć do sqlite.org, developer.apple.com i App Store RSS działa; `gh` z nieważnym tokenem, stan CI i logi przez MCP GitHub; Playwright 1.63 jest, ale aplikacja nie ma podglądu web użytego w audycie (`dowody/e0-srodowisko.txt`)

## Podsumowanie
Ochrona danych przy awarii jest w Piekarzu dojrzała: kopia `VACUUM INTO` przed każdą migracją, migracja w transakcji, strażnik startu z kamieniem milowym bez timera, tryb awaryjny bez otwierania bazy i ratunek surowych plików `.db` + `-wal` + `-shm`. Odtworzenia na kopiach w scratchpadzie potwierdziły to licznościami: nieudana migracja v6→v7 zostawia oryginał 4/4 wypieki i 2/2 sesje, trzeci start otwiera tryb awaryjny, a pakiet z niego ma komplet danych; sam plik `.db` po awarii procesu ma 3 z 8 wierszy, komplet trzech plików 8 z 8. Najważniejsze ryzyko leży poza kodem bazy. Pakiet z trybu awaryjnego jest dla użytkownika bezużyteczny: aplikacja go nie importuje, ekran nie daje kontaktu i nie ostrzega przed usunięciem aplikacji, które kasuje dane i kopie (12-niezawodnosc-001, P1). Właściciel nie ma też sprawdzonej drogi sygnału o awariach (bez runbooka źródeł i bez ćwiczenia), a wiadomość od użytkownika nigdy nie podaje numeru buildu (002). Do decyzji: zakres ścieżki ratunku (001), runbook i ćwiczenia (NIE-06, NIE-12), progi wstrzymania wydania; D-273 oceniona jako brzegowa, decyzja właściciela się utrzymuje.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 12-niezawodnosc-001 | P1 | P | Tryb awaryjny daje plik, którego aplikacja nie przyjmie, bez kontaktu i bez ostrzeżenia przed usunięciem aplikacji | otwarte |
| 12-niezawodnosc-002 | P2 | D | Wiadomość do autora nigdy nie zawiera numeru buildu; test maskuje to atrapą | otwarte |
| 12-niezawodnosc-003 | P2 | D | Build 1023 (i 1021) bez dSYM dla React, ReactNativeDependencies i hermesvm | otwarte |
| 12-niezawodnosc-004 | P2 | D | Kopie ratunkowe udostępniane bez `integrity_check`; awaryjna kopia surowych plików przy otwartym połączeniu | otwarte |
| 12-niezawodnosc-005 | P2 | D | Czerwony iOS E2E #96 na master 2ef8870a, build kandydata 1023 wysłany równolegle (zasada 21) | otwarte |

Liczby: P0 0, P1 1, P2 4.

## Linia bazowa i założenia

**Tryby awarii od zera (E0b, przed lekturą dokumentów wydania)** — aplikacja offline, dane tylko w SQLite (`Library/SQLite/piekarz.db`, WAL) i kopiach JSON w `Documents/Backup/` (widoczne w Plikach), iOS, jeden właściciel bez Maca:
1. Nieudana migracja przy starcie (nowa wersja) → odcięcie od danych albo ich utrata. Zabezpieczenie: kopia `VACUUM INTO` przed migracją, transakcja na migrację, ekran błędu z udostępnieniem kopii (`src/data/sqlite-schema.ts:369`, `src/data/sqlite-schema.ts:386`, `src/data/sqlite-schema.ts:479`). Odtworzone: ok.
2. Uszkodzony plik bazy (nagłówek, strona tabeli) → surowe kopie trzech plików, plik `state_corrupt_*`, pakiet do udostępnienia, baner przy następnym starcie (`src/lib/kopia-plikow-bazy.ts:60`, `src/data/odczyt.ts:14`). Odtworzone na algorytmie kopii: ok.
3. Pętla awarii przy starcie → strażnik (`src/lib/startup-guard.ts:42`), tryb awaryjny bez bazy (`app/_layout.tsx:64`), kamień milowy na `onLayout` po bazie (`app/_layout.tsx:132`). Wektory: ok. Luka w ścieżce ratunku: 001.
4. Wyjątek renderu → `ErrorBoundary` z eksportem JSON (`app/_layout.tsx:46`). Ok.
5. Baza nowsza niż aplikacja (powrót do starszego buildu TestFlight) → tylko odczyt (`src/data/sqlite-schema.ts:348`, `src/components/StorageGate.tsx:49`). Ok.
6. Brak miejsca → zapis rzuca błąd zapisu (komunikat „Nie zapisano”), kopia przed czyszczeniem/importem obowiązkowa, kopia po wypieku cicha (`src/lib/backup.ts:179`). Ok; cichy brak kopii po wypieku: sekcja Do sprawdzenia.
7. Zabicie w tle w trakcie wypieku → zapis kroku na bieżąco, powiadomienia lokalne; bez zadań `TaskManager` (grep: 0 trafień). Ok.
8. Nieczytelny wiersz danych → plik `uszkodzone-wiersze-*` i kopie; brzeg przy kasowaniu sesji (D-273). Odtworzone.
9. Usunięcie aplikacji przez zdesperowanego użytkownika → kasuje bazę i `Documents/Backup/`; ekran awaryjny nie ostrzega (001). Wzorzec z recenzji konkurencji: użytkownik aplikacji, która nie startowała, usunął ją dwa razy w ciągu dnia (`dowody/e0b-recenzje-konkurencji.txt`).
10. Zły build w sklepie → nowy build (bez OTA, bez zdalnego wyłącznika), wydanie ręczne 1.0, aktualizacje stopniowo; progi wstrzymania to propozycja do weta (decyzja dla właściciela).
11. Zła aktualizacja OTA, zły pakiet treści → nie dotyczy (brak `expo-updates`, treści w kodzie).

**Wymiary pokrycia:**
- Katalog trybów awarii: wyżej, 11 pozycji.
- Migracja przerwana w połowie i baza nowsza: migracja per wersja w transakcji, `ROLLBACK` przy błędzie; nowsza baza tylko do odczytu. Odtworzone (S1, S3) — `dowody/nie14-d273-sonda-migracja-i-sesje.txt`.
- Widoczność bez SDK: TestFlight „Crashes” (raporty do pobrania 120 dni; testerzy TestFlight wysyłają raporty niezależnie od ustawień), Organizer wymaga Maca, raport z urządzenia e-mailem, MetricKit „Diagnostic reports arrive immediately in iOS 15 and later” — przeczytane 2026-11-08 (`dowody/zrodla-odczyt-2026-11-08.txt`). Android vitals: nie dotyczy (tylko iOS). W projekcie: dSYM wysyłane (`uploadSymbols`), mapy JS w wydaniu GitHub tagu; brak runbooka „gdzie i kiedy patrzeć” i brak ćwiczenia (decyzja). Tryb awaryjny wycisza sygnał: po dwóch awariach kolejne starty nie są awariami, więc raport Apple dostaje najwyżej dwa raporty na użytkownika.
- Ścieżki ratunku: kopia (ok), przywrócenie pliku bazy (brak funkcji, decyzja), tryb awaryjny (ok, luka 001), instrukcja dla użytkownika (brak, 001); przećwiczone: tylko w testach Jest i sondach, nie na urządzeniu (NIE-12).
- Tor incydentu: `docs/wydanie/sklep.md` §4 i `docs/wydanie/plan-wydania-1.0.md` §3–4 (decyzja, wstrzymanie wydania stopniowego, nowy build, wpis w dzienniku); wycofanie OTA nie dotyczy; komunikat do użytkowników i test odtwarzający: brak opisu (część decyzji o runbooku).
- Progi: wstrzymanie wydania „propozycja noc, do weta” (`docs/wydanie/plan-wydania-1.0.md:27`); próg pętli awarii 2 z kodu (`src/lib/startup-guard.ts:8`), bez wpisu decyzji o wartości; czas reakcji: brak. Apple nie podaje progu odsetka awarii (wzorce roli), więc to decyzje właściciela.
- Zależności zewnętrzne: brak usług w działaniu aplikacji; tor wydania zależy od klucza App Store Connect (.p8, sekret GitHub) i certyfikatów podpisu automatycznego — daty wygaśnięcia `[DO USTALENIA]` (krok właściciela w App Store Connect).
- Pliki od użytkowników: brak zasady w repo, gdzie trzymać i kiedy usuwać pakiety `piekarz-pliki-bazy-*` i kopie przysłane przez użytkowników (zawierają całe dane) — część decyzji o runbooku.

**Soczewki (po kolei, bez subagentów):**
- *Użytkownik z latami danych, aplikacja nie startuje:* dane w telefonie są bezpieczne i przetrwają aktualizację z poprawką; ryzyko to jego własne działanie (usunięcie aplikacji) i plik eksportu, z którym nic nie zrobi → 001.
- *Właściciel w weekend bez Maca:* TestFlight „Crashes” w przeglądarce działa, Organizer nie; brak runbooka, który to mówi; numer buildu w zgłoszeniu nie przyjdzie (002); symbolika ramek React/Hermes niepełna (003).
- *Prowadzący incydent po wydaniu:* sklep.md §4 daje kroki i mapę źródeł JS; brak progów zatwierdzonych przez właściciela i brak szablonu komunikatu do użytkowników.
- *Audytor za rok:* dziennik wydań łączy build z SHA i tagiem; brak post-mortemów i zapisów ćwiczeń, więc nie da się wykazać, że ratunek kiedykolwiek zadziałał na urządzeniu.

**Wzorzec najlepszych w klasie:** dokumentacja Apple (raporty awarii z TestFlight bez względu na ustawienia, symbole przy wysyłce buildu, MetricKit), sqlite.org (WAL, `VACUUM INTO`, howtocorrupt §1.4) — przeczytane 2026-11-08, `dowody/zrodla-odczyt-2026-11-08.txt`. Wniosek dla Piekarza: kod spełnia wzorzec ratowania danych; brakuje „ostatniej mili” do użytkownika (instrukcja, kontakt, droga powrotu pakietu) i przećwiczonego sygnału. Recenzje konkurencji (Loaflo, Rise; App Store US, 65 najnowszych): jedna o aplikacji, która nie startuje, z usunięciem jej przez użytkownika; to próbka, nie pomiar.

**D-273 (znane otwarte, sprawdzone u źródła):** `src/data/bake-sessions-store.ts:153` i `src/data/bake-sessions-store.ts:382` czekają na `zapisUszkodzonych()`, który połyka błąd zapisu pliku, i kasują wiersz. Sonda S2: nieczytelny wiersz `bake_sessions` przy nieudanym zapisie pliku → `deleteBakeSession` kasuje go (3 → 2 wiersze), plik ratunkowy 0, po restarcie treść nigdzie. Droga przez interfejs wymaga jednocześnie wiersza czytelnego przy wczytaniu ekranu i nieczytelnego przy kasowaniu (id pochodzą z odczytanych sesji: `src/lib/przerwij-wypiek.ts:59`, `src/lib/plany-akcje.ts:31`) oraz niezapisywalnego katalogu dokumentów. Ocena: brzegowe, decyzja właściciela „Zostawić” się utrzymuje; bez nowego znaleziska.

**Rejestr założeń:** bez propozycji zmian statusu; żadna ocena tej roli nie opiera się na założeniu ZAL-nnn.

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| Ścieżka startu: `app/_layout.tsx`, `src/lib/startup-guard.ts`, `src/components/StorageGate.tsx`, `src/data/storage-status.ts` | tak | czytanie kodu; `dowody/nie04-sonda-wektory-straznika.txt`; `dowody/nie14-d273-sonda-migracja-i-sesje.txt` |
| Baza i migracje: `src/data/sqlite-schema.ts`, `kopie-przed-migracja.ts`, `migracja-v6.ts`, `migracja-v7.ts` | tak | sonda S1, S3 (liczności) |
| Tryb awaryjny i eksport: `src/components/RescueScreen.tsx`, `src/lib/kopia-plikow-bazy.ts`, `src/lib/backup.ts` | tak | `dowody/nie01-odtworzenie-kopii-plikow.txt`, sonda S1 |
| Naprawa i kasowanie: grep `VACUUM`, `REINDEX`, usuwania plików bazy, tekstów „napraw/recover” | tak | `dowody/nie02-grep-naprawa.txt` |
| Uszkodzone wiersze i D-273: `src/data/uszkodzone-wiersze.ts`, `bake-sessions-store.ts` | tak | sonda S2 |
| Import kopii i „Usuń wszystkie dane” (ARCH-11, rola 05) | czytanie kodu, bez sondy | `src/lib/import-z-pliku.ts`, `src/data/usun-wszystko.ts` |
| Kontakt i diagnostyka: `src/lib/zgloszenie.ts`, `zgloszenie-wyslanie.ts` | tak | `dowody/nie08-numer-buildu.txt` |
| SDK awarii, OTA: `package.json`, `app.json`, `node_modules` | tak | grep: brak Sentry, Crashlytics, expo-updates |
| Wydanie: `.github/workflows/testflight.yml`, `asc-*.yml`, `eas.json`, `docs/wydanie/*` | tak | `dowody/nie08-dsym-build-1023.txt`, `dowody/ci-e2e-96-master.txt` |
| Ekrany na urządzeniu (tryb awaryjny, ekran błędu bazy, baner) | nie: brak symulatora i telefonu | krok właściciela (NIE-12) |
| Raporty awarii w App Store Connect (TestFlight „Crashes”) dla buildów 1006–1023 | nie: wymaga konta właściciela | krok właściciela (NIE-06) |
| Raporty innych ról z tego commitu | nie czytane (polecenie M1) | pozycje wspólne zgłoszone z ID listy NIE |

## Kontrola dowodów i sekretów
`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs 12-niezawodnosc-2026-11-08.md /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/role/12-niezawodnosc --rola 12-niezawodnosc` → „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 12-niezawodnosc”, kod 0 (2026-11-08, po trzech poprawkach cytatów i ścieżki). Sekrety: brak; w raporcie i dowodach brak kluczy, identyfikatory ASC zamaskowane w logach CI. Pliki od użytkowników: żadnych (sondy na danych testowych z zrzutu bazy 1021).

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| NIE-01 | dotyczy (SQLite z danymi użytkownika) | ok co do kompletności (komplet trzech plików bez otwierania bazy; `VACUUM INTO` przed migracją; odtworzenie 8/8 vs 3/8 dla samego `.db`); znalezisko 12-niezawodnosc-004 (brak `integrity_check`) |
| NIE-02 | dotyczy | ok: brak `VACUUM` bez `INTO`, `REINDEX`, usuwania pliku bazy i obietnicy naprawy w tekstach (`dowody/nie02-grep-naprawa.txt`); oryginał nietknięty w S1 (v6, `integrity_check` ok po 3 startach) |
| NIE-03 | dotyczy częściowo: aplikacja nie przywraca pliku bazy, tylko importuje eksport JSON (ARCH-11) | brak funkcji przywracania pliku bazy → „Decyzje dla właściciela” (nie znalezisko); import JSON robi obowiązkową kopię przed importem (`src/lib/import-z-pliku.ts:77`) |
| NIE-04 | dotyczy | ok: zapis licznika w pliku przed bazą, zerowanie po `onLayout` za bramką, tylko starty UI (brak `TaskManager`), uszkodzony zapis = stan początkowy, bez timera; wektory wzorca zgodne (`dowody/nie04-sonda-wektory-straznika.txt`); wątpliwość co do chwili kamienia w „Do sprawdzenia” |
| NIE-05 | dotyczy | znalezisko 12-niezawodnosc-001 (brak kontaktu, instrukcji i drogi powrotu pakietu); tryb nie otwiera bazy (S1: 2 otwarcia na 3 starty) i niczego nie kasuje; czyszczenie pamięci podręcznej: nie dotyczy (aplikacja nie ma pamięci podręcznej wpływającej na start) |
| NIE-06 | dotyczy (TestFlight od buildu 1006) | nie sprawdzono: brak runbooka źródeł sygnału i ćwiczenia z celową awarią → „Decyzje dla właściciela”; dostęp do App Store Connect to krok właściciela |
| NIE-07 | dotyczy | ok: brak SDK awarii, diagnostyki i analityki w `package.json`, pluginach `app.json` i `node_modules`; `NSPrivacyCollectedDataTypes` puste; polityka prywatności opisuje raporty Apple |
| NIE-08 | dotyczy | znaleziska 12-niezawodnosc-002 (numer buildu w zgłoszeniu) i 12-niezawodnosc-003 (dSYM); ok: tag `v<wersja>-b<build>` → SHA, mapa JS w wydaniu GitHub, `uploadSymbols` |
| NIE-09 | dotyczy | ok: brak dziennika diagnostycznego; wiadomość do autora tylko wersja aplikacji i iOS, widoczna i wysyłana przez użytkownika (`src/lib/zgloszenie.ts:20`); pakiet plików bazy wychodzi tylko przez arkusz udostępniania z inicjatywy użytkownika |
| NIE-10 | nie dotyczy: brak `expo-updates` | — |
| NIE-11 | dotyczy | ok: brak automatycznej wysyłki do recenzji i publikacji (`testflight.yml` kończy na TestFlight, `asc-*.yml` tylko ręcznie, `eas.json` bez submit automatu); runbook incydentu częściowy (`docs/wydanie/sklep.md` §4) |
| NIE-12 | dotyczy (aplikacja z danymi, przed wydaniem) | nie sprawdzono, warunek wysyłki: przywrócenie z kopii na telefonie (PH-12, PH-13 nieodhaczone) i wymuszona pętla awarii na buildzie testowym — brak zapisów ćwiczeń |
| NIE-13 | nie dotyczy: treści w kodzie, bez pakietów wersjonowanych osobno | — |
| NIE-14 | dotyczy | ok: kopia sprzed migracji zostaje po sukcesie i po porażce (2 na wersję), błąd migracji → ekran błędu z udostępnieniem kopii, po 2 startach tryb awaryjny z eksportem (S1, S3) |
| Zasada wspólna 21 | stan CI na master | znalezisko 12-niezawodnosc-005 |

## Znaleziska (szczegóły)

### 12-niezawodnosc-001 · Tryb awaryjny daje plik, którego aplikacja nie przyjmie, bez kontaktu i bez ostrzeżenia przed usunięciem aplikacji
- Pozycja listy kontrolnej: NIE-05
- Poziom: P1
- Realność: brzegowy (wymaga pętli awarii przy starcie)   · Pewność: wysoka
- Rodzaj: P
- Dowód: `src/components/RescueScreen.tsx:30` — w trybie awaryjnym startu eksport JSON jest pominięty, zostaje pakiet surowych plików (`src/lib/kopia-plikow-bazy.ts:15`, format `piekarz-pliki-bazy`); import przyjmuje tylko `piekarz-backup` albo recepturę (`src/lib/import-z-pliku.ts:36`), więc pakiet jest plikiem nierozpoznanym. Ekran ma tylko dwa przyciski, eksport i ponowienie (`src/components/RescueScreen.tsx:62`, `src/components/RescueScreen.tsx:72`); nie ma kontaktu (istniejąca funkcja `napiszDoAutora` w `src/lib/zgloszenie-wyslanie.ts:29` nie jest użyta) ani zdania, że usunięcie aplikacji kasuje dane i kopie w `Documents/Backup/`. To samo na ekranie błędu bazy (`src/components/StorageGate.tsx:73`): udostępnia kopię `.db` sprzed migracji albo pakiet, oba nieimportowalne. W repo nie ma narzędzia ani opisu, jak deweloper zamienia pakiet albo `backup_pre_migration-*.db` na kopię `piekarz-backup` (grep `pliki-bazy` w `scripts/` i `docs/`: 0 trafień poza kodem). Sonda S1: pakiet z trybu awaryjnego ma komplet danych (4 wypieki, 2 zakwasy, 2 sesje, `integrity_check` ok) — dane są, droga ich powrotu nie istnieje (`dowody/nie14-d273-sonda-migracja-i-sesje.txt`).
- Mechanizm: ścieżka ratunku kończy się na pliku dla dewelopera, a deweloper nie jest osiągalny z tego ekranu; `grep -rn "napiszDoAutora" src app` → 1 użycie poza definicją (`src/components/settings/StudioEcosystemSection.tsx:122`), 0 w `RescueScreen.tsx` i `StorageGate.tsx`.
- Powraca: nie
- Wzorzec lub źródło: kontrakt roli NIE-05 (eksport, „spróbuj normalnie”, kontakt); wymiar „instrukcja dla użytkownika”; recenzja Rise 2026-01-24 (aplikacja nie startowała, użytkownik usunął ją dwa razy, `dowody/e0b-recenzje-konkurencji.txt`).
- Kroki w aplikacji: dwa starty kończą się awarią (np. błąd w nowej wersji) → trzeci start: ekran „Piekarz nie uruchomił się poprawnie” → „Eksportuj kopię danych” zapisuje pakiet → użytkownik usuwa i instaluje aplikację → „Importuj z pliku” nie rozpoznaje pakietu; dane w praktyce utracone, kontakt tylko przez stronę w App Store.
- Opcje: (a) na ekranie awaryjnym i ekranie błędu bazy: „Napisz do nas” (istniejąca funkcja), zdanie „Nie usuwaj aplikacji — usunięcie skasuje dane i kopie” i zdanie, co zrobić z plikiem; plus skrypt dewelopera w repo (pakiet albo `.db` → `piekarz-backup`) i krok w runbooku — mało kodu, teksty przez role 04 i 09 (35 języków); (b) jak (a) oraz import pakietu i pliku `.db` w aplikacji (otwarcie kopii jako osobnej bazy, migracja kopii, eksport do formatu kopii) — pełna droga bez dewelopera, ale nowa ścieżka danych z zewnątrz (rola 05, testy na każdej wydanej wersji schematu); (c) bez zmian, ryzyko nazwane w raporcie. Rekomendacja: (a) przed 1.0, (b) do rozważenia przez 03 po pierwszym incydencie.
- Test akceptacyjny: test renderu trybu awaryjnego i ekranu błędu bazy: przycisk kontaktu wywołuje `napiszDoAutora`, tekst ostrzeżenia obecny w 35 językach; skrypt dewelopera na pakiecie z sondy S1 daje kopię, którą `rozpoznajPlik` rozpoznaje jako `kopia` z 4 wypiekami i 2 zakwasami.
- Status: otwarte

### 12-niezawodnosc-002 · Wiadomość do autora nigdy nie zawiera numeru buildu; test maskuje to atrapą
- Pozycja listy kontrolnej: NIE-08
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/lib/zgloszenie-wyslanie.ts:34` czyta `Constants.expoConfig?.ios?.buildNumber`; `app.json` celowo nie ma `ios.buildNumber` (`scripts/verify-native.mjs:40`), a numer ustawia workflow w `Info.plist`. Konfiguracja, którą expo-constants osadza w buildzie (`getConfig`), daje `version 1.0.0 ios.buildNumber undefined` (komenda i kod 0: `dowody/nie08-numer-buildu.txt`). Test podstawia atrapę z numerem (`src/__tests__/kontakt-z-adresem.test.tsx:17`), więc nie widzi braku. `EXPO_PUBLIC_BUILD_NUMBER` z workflow nie jest nigdzie czytany (grep: 0 trafień w `src` i `app`).
- Mechanizm: źródło numeru buildu w aplikacji inne niż źródło w workflow; `grep -rn "buildNumber" src app` → 1 trafienie w kodzie (`src/lib/zgloszenie-wyslanie.ts:34`).
- Powraca: nie
- Wzorzec lub źródło: NIE-08 (numer buildu wskazuje commit); `docs/wydanie/sklep.md` §4 zakłada ścieżkę numer buildu → tag → SHA.
- Kroki w aplikacji: Ustawienia → „Napisz do nas” → treść ma „Wersja aplikacji: 1.0.0” bez „(1023)”. W TestFlight wersja 1.0.0 ma buildy 1006–1023, więc zgłoszenie testera nie wskazuje kodu.
- Opcje: (a) numer z `Info.plist` przez `expo-application` (`nativeBuildVersion`) — nowa zależność Expo, moduł natywny w buildzie; (b) `process.env.EXPO_PUBLIC_BUILD_NUMBER` wstawiany przez Metro w czasie budowania (workflow już go ustawia przed archiwum) — bez zależności, ale lokalnie i w E2E wartość pusta. Rekomendacja: (b) z testem na zmiennej i atrapą bez numeru.
- Test akceptacyjny: test treści zgłoszenia bez atrapy `ios.buildNumber` pokazuje numer z mechanizmu wybranego w opcji; test workflow sprawdza, że zmienna jest ustawiona przed krokiem archiwum.
- Status: otwarte

### 12-niezawodnosc-003 · Build 1023 (i 1021) bez dSYM dla React, ReactNativeDependencies i hermesvm
- Pozycja listy kontrolnej: NIE-08
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: D
- Dowód: log wysyłki buildu 1023 (run 42511360071): trzy ostrzeżenia „exportArchive Upload Symbols Failed. The archive did not include a dSYM” dla React.framework, ReactNativeDependencies.framework i hermesvm.framework (`dowody/nie08-dsym-build-1023.txt`); to samo przy 1021 (`docs/wznowienie-M3.md:189`, opisane jako brzegowe, bez decyzji). `uploadSymbols` jest włączone (`.github/workflows/testflight.yml:271`).
- Mechanizm: prebudowane frameworki React Native i Hermes w archiwum bez plików DWARF; dotyczy każdego buildu tym workflow.
- Powraca: tak — ostrzeżenie z buildu 1021 (2026-11-03) wraca w 1023 → trwała kontrola: krok workflow, który po archiwum wypisuje frameworki bez dSYM i kończy się błędem albo ostrzeżeniem z decyzją.
- Wzorzec lub źródło: Apple, „Crash reports automatically contain identifiable symbol information if you include symbol information when submitting a build to the App Store” (odczyt 2026-11-08, `dowody/zrodla-odczyt-2026-11-08.txt`).
- Kroki w aplikacji: awaria natywna w kodzie React Native albo Hermes (np. fatalny błąd JS ponownie rzucony przez RN) → raport w TestFlight „Crashes” ma adresy zamiast nazw funkcji w tych ramkach.
- Opcje: (a) dołączyć dSYM tych frameworków do archiwum (pobranie z artefaktów wydania React Native/Hermes dla tej wersji albo budowa ze źródeł) — czas buildu macOS; (b) zostawić i zapisać w runbooku, jak symbolizować ręcznie (dSYM z wydania RN/Hermes, `atos`) — wymaga Maca; (c) bez zmian. Rekomendacja: (a), jeśli ćwiczenie z NIE-06 pokaże nieczytelny raport; do tego czasu (b).
- Test akceptacyjny: log wysyłki bez „Upload Symbols Failed”; ćwiczenie z celową awarią pokazuje nazwy funkcji w ramkach React/Hermes.
- Status: otwarte

### 12-niezawodnosc-004 · Kopie ratunkowe udostępniane bez `integrity_check`; awaryjna kopia surowych plików przy otwartym połączeniu
- Pozycja listy kontrolnej: NIE-01
- Poziom: P2
- Realność: brzegowy   · Pewność: wysoka
- Rodzaj: D
- Dowód: kopia przed migracją (`src/data/kopie-przed-migracja.ts:45`) i pakiet (`src/lib/kopia-plikow-bazy.ts:15`) nie są sprawdzane przed udostępnieniem; `grep integrity_check` w `app` i `src` poza testami → 0 trafień (`dowody/nie02-grep-naprawa.txt`). Po błędzie innym niż migracja surowe kopie powstają przed zamknięciem połączenia (`src/data/sqlite-schema.ts:485`, `src/data/sqlite-schema.ts:486`), a w `ErrorBoundary` pakiet jest zapasowym eksportem przy otwartej bazie (`src/components/RescueScreen.tsx:42`). Odtworzenie algorytmu kopii po awarii procesu: komplet trzech plików 8/8, `integrity_check` ok (`dowody/nie01-odtworzenie-kopii-plikow.txt`) — kopia jest kompletna, brakuje tylko sprawdzenia i informacji o wyniku.
- Mechanizm: żadna ścieżka ratunkowa nie sprawdza kopii; 3 miejsca: `kopiaPrzedMigracja`, `pakietPlikowBazy`, `copyRawDatabaseFiles` (`src/lib/backup.ts:305`).
- Powraca: nie
- Wzorzec lub źródło: lista roli NIE-01 („kopia sprawdzona integrity_check przed udostępnieniem”); sqlite.org/pragma.html (`integrity_check` zwraca „ok”).
- Kroki w aplikacji: uszkodzona baza → ekran błędu → „Udostępnij kopię bazy” → użytkownik i deweloper nie wiedzą, czy kopia jest zdrowa, zanim zaczną odzyskiwanie.
- Opcje: (a) `PRAGMA integrity_check` na kopii `VACUUM INTO` przed jej podaniem, wynik w nazwie albo w pliku obok — kilka linii, czas sprawdzenia na małej bazie; (b) tylko w skrypcie dewelopera z 001 (sprawdzenie po stronie odbiorcy) — zero zmian w aplikacji. Rekomendacja: (b) razem z 001; (a), jeśli 001 wybierze import w aplikacji.
- Test akceptacyjny: test sqlite na uszkodzonej i zdrowej kopii: wynik sprawdzenia zapisany i widoczny w skrypcie albo w aplikacji.
- Status: otwarte

### 12-niezawodnosc-005 · Czerwony iOS E2E #96 na master 2ef8870a, build kandydata 1023 wysłany równolegle (zasada 21)
- Pozycja listy kontrolnej: poza listą NIE (zasada wspólna 21, bramki i stan CI); właściwa ocena przyczyny: rola 07 (JAK) i 08
- Poziom: P2
- Realność: realny (stan CI)   · Pewność: wysoka co do stanu, przyczyna `[DO USTALENIA]`
- Rodzaj: D
- Dowód: iOS E2E #96 (run 42511355281) na 2ef8870a: „05-dwa-wypieki” niezaliczony („next-or-finish-step-btn is visible”), 4/5 przepływów zielonych; TestFlight #23 z tego samego pusha wysłał build 1023 o 19:21 UTC (`dowody/ci-e2e-96-master.txt`). Kod między zielonym #95 (0e5fa7ef) a #96 różni się tylko słownikami tłumaczeń (34 pliki, `src/lib/i18n-slowniki/*` i `src/lib/i18n-en/czesc-30.ts`), więc regresja aplikacji jest mało prawdopodobna; wcześniejszy wyścig scenariusza z arkuszem zgody opisuje D-279.
- Mechanizm: `testflight.yml` nie zależy od wyniku `e2e-ios.yml`; bramka E2E przed buildem istnieje tylko w decyzji (D-272).
- Powraca: tak — E2E-94 (D-279) to też czerwony przebieg na wyścigu scenariusza → trwała kontrola: przyczyna #96 ustalona przez 07/08 przed wysyłką do recenzji, wpis w dzienniku wydań.
- Wzorzec lub źródło: zasada wspólna 21 (czerwony workflow na `main` to znalezisko przed pracą).
- Kroki w aplikacji: nie dotyczy bezpośrednio; ryzyko to wysyłka do recenzji kandydata z niezbadanym czerwonym E2E przepływu dwóch wypieków.
- Opcje: (a) ponowić E2E na 2ef8870a i zbadać artefakt `maestro-e2e` (ID 13630142877) — mało pracy; (b) dodać do `testflight.yml` sprawdzenie zielonego E2E na tym SHA — buduje dopiero po E2E, dłuższy tor. Rekomendacja: (a) teraz, (b) do decyzji roli 07.
- Test akceptacyjny: zielony E2E na SHA kandydata albo zapisana przyczyna (wyścig scenariusza) z poprawką scenariusza i zielonym ponowieniem.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- **Chwila kamienia milowego.** `onLayout` korzenia (`app/_layout.tsx:132`) zeruje licznik, zanim ekran Dziś wczyta dane w efektach. Awaria natywna wywołana danymi po kamieniu (nie wyjątek renderu, ten łapie `ErrorBoundary`) dałaby pętlę bez trybu awaryjnego. Brakuje: przykładu takiej awarii na urządzeniu; ćwiczenie z NIE-12 z celową awarią po wczytaniu danych rozstrzygnie, czy przesunąć kamień na dane pierwszego ekranu wczytane.
- **Treść awarii JS w raporcie TestFlight.** Czy komunikat i stos JS (Hermes, mapa z wydania GitHub) da się odczytać z raportu w App Store Connect bez Maca — `[DO USTALENIA]`, rozstrzyga ćwiczenie właściciela.
- **Cichy brak kopii po wypieku.** `autoBackup` zwraca null bez śladu (`src/lib/backup.ts:179`); przy trwale niezapisywalnym katalogu pula kopii przestaje się odnawiać i nikt o tym nie wie. Brakuje: oceny roli 05 (ARCH-10) i decyzji, czy pokazywać datę ostatniej kopii w Ustawieniach.
- **Rozmiar pakietu.** Pakiet trzyma całą bazę jako base64 w pamięci JS (`src/lib/kopia-plikow-bazy.ts:24`); przy dzisiejszych danych (tekst, bez zdjęć) to małe pliki, ale po F-29 (zdjęcia, PÓŹNIEJ) wymaga pomiaru.
- **Wygaśnięcie klucza ASC i certyfikatów.** Daty `[DO USTALENIA]` (App Store Connect, krok właściciela).

## Co działa dobrze i należy zachować
- Kopia `VACUUM INTO` przed każdą migracją i migracja per wersja w transakcji; po porażce oryginał bez zmian, po sukcesie kopia zostaje (S1, S3).
- Strażnik startu w pliku poza bazą, kamień milowy bez timera, start awaryjny nie zmienia licznika, uszkodzony zapis = stan początkowy (wektory wzorca zgodne).
- Tryb awaryjny bez otwierania bazy (2 otwarcia na 3 starty w S1) i ratunek kompletu `.db` + `-wal` + `-shm` (8/8 wobec 3/8 dla samego `.db`); deduplikacja zestawów ratunkowych po podpisie plików.
- Baza nowsza niż aplikacja → tylko odczyt, bez zmiany nawet `journal_mode`.
- Brak SDK, OTA i automatycznej wysyłki do recenzji; dSYM wysyłane, mapy JS trwale w wydaniu GitHub tagu, tag łączy build z SHA.
- Obowiązkowa kopia przed importem i czyszczeniem; nieczytelne wiersze trafiają do pliku ratunkowego i kopii.

## Decyzje dla właściciela
1. **Ścieżka ratunku dla użytkownika (12-niezawodnosc-001):** (a) kontakt i ostrzeżenie na ekranach awaryjnych plus skrypt dewelopera (rekomendacja); (b) dodatkowo import pakietu w aplikacji; (c) bez zmian z nazwanym ryzykiem.
2. **Runbook i źródło sygnału o awariach (NIE-06, NIE-08, NIE-11; brak dokumentów to nie znalezisko):** (a) tryb `build` roli 12 od E1 na obecnym kodzie: ADR „źródło sygnału bez SDK” (TestFlight „Crashes” w przeglądarce teraz; po premierze Organizer na Macu, MetricKit albo nic), runbook (gdzie i kiedy patrzeć, numer buildu → tag → mapa, pliki od użytkowników poza repo i ich usuwanie, szablon komunikatu), ćwiczenia; ok. 3–4 h agenta, ok. 30 min właściciela na ćwiczenie; (b) tylko runbook (ok. 1 h agenta); (c) bez zmian, ryzyko: o awariach po premierze właściciel dowie się z recenzji. Rekomendacja: (a) przed wysyłką 1.0.
3. **Ćwiczenia przed wysyłką (NIE-12):** przywrócenie z kopii na telefonie (PH-12, PH-13) i wymuszona pętla awarii na buildzie testowym z zapisem w dzienniku (data, build, liczności). Wymaga sposobu wymuszenia awarii w buildzie testowym (np. ukryta flaga tylko w buildzie testowym, decyzja roli 05). Opcje: (a) oba ćwiczenia przed wysyłką (rekomendacja); (b) tylko PH-12/PH-13; (c) bez ćwiczeń.
4. **Progi wstrzymania wydania stopniowego i czas reakcji** (`docs/wydanie/plan-wydania-1.0.md:27`, „propozycja noc, do weta”): (a) potwierdzić propozycję (pauza po pierwszym zgłoszeniu utraty danych lub awarii przy starcie, po 3 zgłoszeniach tego samego błędu); (b) własne progi; Apple nie podaje progu, więc to decyzja, nie norma. Próg pętli awarii 2 (`src/lib/startup-guard.ts:8`) warto zapisać w rejestrze jako decyzję.
5. **Przywracanie pliku bazy (NIE-03):** (a) bez funkcji w 1.0, przywrócenie tylko importem JSON (stan dziś; rekomendacja, łączy się z decyzją 1); (b) funkcja przywracania pliku `.db` przez API kopii z pełnym sprawdzeniem (rola 05).
6. **D-273:** ocena M1 potwierdza decyzję „Zostawić” (ryzyko brzegowe, odtworzone w S2); nowej decyzji nie trzeba.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 12-niezawodnosc --tryb fix --zadania 12-niezawodnosc-001,12-niezawodnosc-002,12-niezawodnosc-003,12-niezawodnosc-004`

12-niezawodnosc-005 do roli 07/08 (przyczyna czerwonego E2E). Teksty ekranów z 001: rola 04 i 09; skrypt dewelopera i ewentualny import: rola 05.

`git status --porcelain` w /home/user/piekarz na końcu pracy: pusty (0 linii), HEAD 2ef8870a525485cc1ac57e5abe9d97d9937dfe42; pliki śledzone nietknięte. Sondy w worktree scratchpadu (usunięty po pracy), treść sond w plikach dowodów; w katalogu roli tylko .md i .txt.
