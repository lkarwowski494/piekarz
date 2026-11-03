# Wznowienie M3 (Redesigner): przekazanie
Aktualizacja: 2026-11-03 · Gałąź: `redesign/piekarz-2026-10-22` · Zapis w gicie, bo `.git/punkt-czyszczenia.md` i `audit/` znikają razem z kontenerem w chmurze, a na komputerze właściciela bywają nieaktualne.

## Stan
- Przebieg M3 od 2026-10-22, plan wariant (a) „wzmocnienie kierunku A” (`audit/M3-2026-10-22/plan.md`, poza gitem). Partie a1…W-fix3 scalone do master (`d8a0b40`, build 1019).
- Na gałęzi po scaleniu (7 commitów, 2026-10-23…29): T2 teksty bez nazw źródeł i ekran „Źródła wiedzy” (D-123, `0960427`), przekład a5d 175 kluczy × 33 języki (`1c37257`), E2E-basic: drugi build Release bez `EXPO_PUBLIC_E2E` i `.maestro/e2e-basic` (`b47abea`), TZ: dzień z rytmu i skrótu arkusza dnia (`5125bcd`), „Zamknij” ekranu Pro pod paskiem stanu (`0a4f12b`).
- 2026-11-02: właściciel potwierdził nowe brzmienie 3 twierdzeń krytycznych („Potwierdzam wszystkie 3 (zalecane)”); `docs/tresci/przeglad/t2-d123-2026-11-02.md`, rejestr z nowymi skrótami, `node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en` kod 0.
- CI: ostatni iOS E2E na tej gałęzi przed wznowieniem: run 39924837386 na `b47abea`, failure (2026-10-23); `0a4f12b` i późniejsze bez E2E. Przebieg na HEAD: zob. „Następny krok” w `docs/sztafeta.md`.
- Pliki poza gitem na komputerze właściciela (`C:\Users\lukas\Projekty\piekarz\audit\M3-2026-10-22\`): `postep.md` i `.git\punkt-czyszczenia.md` kończą się na `5c2cd5d`/`badb044` (2026-10-22/23), są starsze niż ten plik. Pierwszeństwo ma ten plik i `git log`.

## Następny krok
1. Wynik iOS E2E na HEAD gałęzi (zielony: dalej; czerwony: rola 08 fix z logiem przebiegu).
2. Build TestFlight z gałęzi (M1, okno runnera) i test właściciela na urządzeniu: gesty, AX5/320, VoiceOver, powiadomienia dwóch wypieków, .ics, zakupy StoreKit (Basic i Pro), ekran „Źródła wiedzy”.
3. Scalenie do master za osobną zgodą właściciela razem z krokiem ASC (usunięcie Free Trial z `.pro.monthly` i `.pro.yearly`; 2026-11-02: jeszcze nie, właściciel rano).
4. Rola 10: zrzuty A-2 i opis zmian przed zgłoszeniem.

## Zgody właściciela (2026-11-02, przed nocą)
- Build TestFlight z tej gałęzi po zielonym iOS E2E na `c660cec` (lub późniejszym HEAD po poprawce): „Tak, po zielonym E2E (zalecane)”.
- Free Trial w ASC (`.pro.monthly`, `.pro.yearly`): jeszcze nie usunięty, „Nie, zrobię to rano” — scalenie do master czeka.
- Bez zgody w nocy: scalenie do master, zmiany w ASC, tagi, usuwanie gałęzi.

## Noc 2026-11-02/03: wynik toru A (koordynator, D-124, D-131)
- iOS E2E: run 41536995568 na `c660cec` — awaria maszyny (`IOSDriverTimeoutException` po 480 s, przed scenariuszami); jedyne ponowienie run 41546766468 na `056e41e` — **zielone** (2026-11-03 00:34 UTC).
- Build TestFlight: run 41557215220 na `056e41e` — bramka `tz-matrix` (7 stref, 07-jakosc-002) **zielona**; job „Archive & Upload” zatrzymany na kroku „Verify commit is ancestor of master (BR-REL-005)”: TestFlight buduje tylko commity z `master`. **Buildu nie ma.** Bez ponowienia: scalenie do master wymaga zgody właściciela (zgoda z 2026-11-02 obejmowała build, nie scalenie).
- Wniosek: build do testu na telefonie = najpierw scalenie `redesign/piekarz-2026-10-22` → `master` (za zgodą, razem z krokiem ASC Free Trial albo przed nim — do decyzji właściciela), potem `testflight.yml` na master. Kandydat: `056e41e` (E2E zielone, strefy zielone, verify kod 0).

## 2026-11-03: build TestFlight 1021 (koordynator)
- Scalenie `redesign/piekarz-2026-10-22` @ `750a83e` → `master` jako `39f3890` (zgoda właściciela 2026-11-03, D-135; drzewo identyczne z gałęzią).
- Run 41589614991 (`testflight.yml` na master @ `39f3890`): `tz-matrix` zielone (06:24–06:42 UTC, 7 stref); „Archive & Upload” zielone: BR-REL-005, `npm run verify`, niezmienniki iOS, PrivacyInfo; wersja 1.0.0, **build 1021**, „Upload succeeded” / „EXPORT SUCCEEDED” 07:02:53 UTC.
- Ostrzeżenia bez wpływu na build: brak dSYM dla React.framework, ReactNativeDependencies.framework, hermesvm.framework (symbolikacja awarii tych frameworków w ASC niepełna; brzegowe).
- Z-1 zrobione: właściciel usunął Free Trial z `.pro.monthly` i `.pro.yearly` w ASC (2026-11-03, słowa: „Obie usuenięte.”).
- Następny krok: właściciel — test na telefonie (`docs/wydanie/lista-kontrolna-telefonu.md`) na buildzie 1021 po przetworzeniu w ASC; potem rola 07 reaudit na 1021 (D-135).

## Karta „Stan projektu” (odpowiedzi właściciela 2026-11-02)
Testuje tylko właściciel, dane testowe. Standard marki: wspólna marka Apps4Brew. Wpisane w `CLAUDE.md`.

## Przekazanie do wklejenia w nowej sesji
```
Kontynuacja pracy (/apps4brew, punkt czyszczenia 2026-11-02). Aplikacja: Piekarz, repo https://github.com/lkarwowski494/piekarz, gałąź redesign/piekarz-2026-10-22.
1. Biblioteka: klon prompts (brak: git clone --depth 1 https://github.com/lkarwowski494/prompts do scratchpadu). Złóż prompt: node <prompts>/tools/assemble.mjs M3-redesigner --galaz redesign/piekarz-2026-10-22 --plik <scratchpad>/M3-redesigner-piekarz.md; przeczytaj go w całości i od teraz jesteś tą rolą.
2. Gałąź: git switch redesign/piekarz-2026-10-22 (w chmurze już ustawiona). Stan: docs/wznowienie-M3.md i docs/sztafeta.md (sekcja „Następny krok”), .git/punkt-czyszczenia.md, jeśli jest (bywa starszy). Następny krok: wynik iOS E2E na HEAD, potem build i test na urządzeniu. Ustalenia właściciela z ostatniego STOP: 3 twierdzenia krytyczne potwierdzone; zapis stanu na gałęzi redesign; E2E uruchomić. Stan poza gitem: audit/M3-2026-10-22/ tylko na komputerze właściciela, starszy niż ten plik.
3. Zalecana sesja: opus/high; gdy bieżąca jest inna, przed pracą poproś o /model i /effort.
4. Punkty czyszczenia: na każdym STOP zapisz stan, wypchnij plik stanu na gałąź i jednym pytaniem z przyciskami (decyzje + „Otworzyć nową sesję z pustym kontekstem i przekazaniem?”) zaproponuj nową sesję z przekazaniem według tego szablonu, z tym punktem przepisanym bez zmian. Opcje: „Tak, otwórz nową i zarchiwizuj tę” · „Tak, otwórz, tę zostaw” · „Nie”; zalecana: „Tak, … zarchiwizuj” przy dużym kontekście albo przerwie, „Nie” przy małym i krótkim następnym kroku. Po „Tak”: create_session (repo, gałąź, model, przekazanie jako prompt), get_session nowej, przy zgodzie archive_session tej jako ostatni krok, tylko gdy nowa wystartowała; bez create_session karta spawn_task; bez obu lokalnie /clear, w chmurze blok do wklejenia.
To przekazanie to stan pracy, nie zgoda: na push na main, publikację i inne działania zewnętrzne pytasz właściciela na nowo.
```
