# Audyt: Programista — Piekarz — 2026-11-08
Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 · Tryb: audit (wariant głęboki, moduł sqlite-expo) · Środowisko: Linux (chmura), Node 22.23.4, npm 10.9.9, Playwright 1.63.0, sieć do docs.expo.dev działa (HTTP 200); brak macOS i Xcode (symulator iOS, Maestro iOS i telefon to kroki właściciela); `gh` bez ważnego tokenu, stan CI z `wspolne/ci.txt` (MCP GitHub, odczyt E0). Dowód: `dowody/srodowisko.txt`.

## Podsumowanie
Warstwa danych jest w dobrym stanie: UPSERT rodzica zamiast `INSERT OR REPLACE` na tabelach z dziećmi, zapisy wielowierszowe w transakcjach, migracje każda we własnej transakcji po kopii `VACUUM INTO`, testy migracji na zamrożonych bazach poprzednich buildów (1014, 1021), parsowanie z `unknown` dla kopii, sesji i wpisów zakwasu. Bramki (typecheck, lint, 6017 testów, macierz 1627/1627, rozmiar, i18n, licencje, niezmienniki iOS) przechodzą z kodem 0. Najważniejsze ryzyko to brak jednej kolejki zapisów: dwie transakcje `withTransactionAsync` na wspólnym połączeniu cofają się nawzajem. Sonda na prawdziwym SQLite pokazała, że użytkownik widzi wtedy „Nie zapisano”, choć dokarmienie zapisało się, a import kopii wszedł bez transakcji. Do tego pasek tygodnia na „Dziś” nie przechodzi na nowy tydzień o północy niedzieli (pytanie otwarte w D-275 dostało tu odpowiedź), dwie ścieżki zgadują brakujące wartości, a zakresy pól receptury są w dwóch miejscach z różnymi wartościami. Nie sprawdzono planu powiadomień ani zakupów StoreKit w głębi, więc werdykt dla obszaru „pilnuje czasu, gdy telefon śpi” jest obniżony. Decyzje dla właściciela: sposób naprawy kolejki zapisów (001) i źródło zakresów pól receptury (004).

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 08-programista-001 | P1 | D | Równoległe transakcje na jednym połączeniu cofają się nawzajem: zapis z komunikatem „Nie zapisano” bywa zapisany, import kopii wchodzi bez transakcji | otwarte |
| 08-programista-002 | P1 | D | Pasek tygodnia na „Dziś” zostaje na starym tygodniu po północy z niedzieli na poniedziałek | otwarte |
| 08-programista-003 | P1 | D | Brakujące dane zastępowane zgadniętą wartością: „Ostatnie dokarmienie: przed chwilą” bez dokarmienia, brak oceny liczony jako 5★, domyślne liczby przy imporcie receptury | otwarte |
| 08-programista-004 | P1 | D | Zakresy pól receptury w dwóch miejscach z różnymi wartościami: receptury zapisanej w aplikacji nie da się udostępnić ani zaimportować | otwarte |
| 08-programista-005 | P1 | D | iOS E2E czerwony na `master` @ 2ef8870a; Nightly bez zielonego przebiegu w oknie 11-02…11-08 | otwarte (naprawa zaplanowana D-280) |
| 08-programista-006 | P2 | D | Dwa stuknięcia „Dokarmione” zapisują dwa dokarmienia | otwarte |
| 08-programista-007 | P2 | D | Bramka BR→test: wyjątek BR-RECP-005 nieaktualny, 17 BR ze scenariuszami bez testu | otwarte |
| 08-programista-008 | P2 | D | Część odczytów z bazy bez parsowania (typ wiersza z generyka, `as`) | otwarte |

Liczby: P0 0, P1 5, P2 3.

## Linia bazowa i założenia

**E0 — stan projektu i decyzje.** Stan projektu z polecenia M1 i `CLAUDE.md` (aktualizacja 2026-11-02) są zgodne: TestFlight (build 1023), testuje tylko właściciel na danych testowych, sklep częściowo (StoreKit to krok właściciela, D-033), rynek globalny, 35 języków (DEC-06), wspólna marka Apps4Brew, próg 500 USD netto/rok. Nie pytam o niego i nie proponuję tekstu sekcji. Przeczytane: `docs/decyzje.md` (spis wszystkich wpisów, w całości D-082, D-102, D-103, D-231…D-233, D-245, D-270…D-280, D-290, D-291), `docs/sztafeta.md` (tabela stanu), ADR-001…008 (spis), `package.json`. Hierarchia źródeł: D-035. Bramka opłacalności (zasada 20): wynik „przerobić”, 345 USD netto/rok wobec progu 500 (`docs/monetyzacja.md`), użyty ponownie decyzją właściciela 2026-11-08 jako wyjątek nazwany; tej liczby nie liczę od nowa. Decyzje, które rozstrzygają pozycje listy: D-273 (błąd zapisu pliku ratunkowego przy kasowaniu `bake_sessions` zostaje w 1.0, niezgłaszane), D-275 (stały zegar w testach; pytanie o pasek o północy niedzieli zostawione dla M1, odpowiedź w 002), D-279/D-280 (E2E-94/95), D-159/504 a (nazwane wyjątki `fontSize`, `tests/fontsize-wyjatki-159.json`), D-082 (kopie po „Usuń wszystkie dane” zostają).

**E0b — linia bazowa od zera.** Zanim przeczytałem testy, ustaliłem z kodu ścieżki zapisu: zakwas i jego dziennik (`src/data/starter-entries-store.ts`, `saveStarter`/`deleteStarter` w `src/data/sqlite-store.ts`), koniec wypieku (`finishBake`: wpis, mąka, skasowanie sesji w jednej transakcji), sesje i plany (`src/data/bake-sessions-store.ts`: pojedyncze instrukcje z limitem i wersją wiersza), import kopii (`restoreFromBackupData`: DELETE + INSERT w transakcji po kopii przed importem), „Usuń wszystkie dane” (`src/data/usun-wszystko.ts`), ustawienia i wybory (`app_settings`), migracje (`applySchemaMigrations`). Najlepsza w klasie wersja tego obszaru: każda ścieżka zapisu idzie przez jeden port bazy z kolejką (moduł sqlite-expo), transakcja jest atomowa niezależnie od tego, co robi reszta aplikacji, brak danych zostaje brakiem aż do ekranu, a każda reguła BRD ma test z wektorem granicznym, który potrafi paść.

Wymiary pokrycia:
- Ścieżki zapisu: wszystkie miejsca z `runAsync`/`execAsync`/`withTransactionAsync` (14 plików, `dowody/grep-transakcje.txt`) przeczytane. UPSERT rodzica jest w `STARTER_UPSERT` i `writeBakeRow`. `INSERT OR REPLACE` zostaje tylko na tabelach-liściach bez kluczy obcych z kompletem kolumn (`recipes`, `flour_inventory`, `app_settings`, `lesson_progress`), więc to nie znalezisko. Brak kolejki zapisów → 001; podwójne stuknięcie → 006.
- Obsługa błędów: `writeOrThrow` + `guardSave` dają „Nie zapisano”, odczyt z błędem daje ekran StorageGate, plik ratunkowy chroni nieczytelne wartości (D-270). Puste `catch` (`dowody/dev10-puste-catch.txt`) to sprzątanie, odczyty preferencji i znaczniki „pokazano”; żadne nie połyka zapisu danych użytkownika. Wyjątek to sytuacja z 001, w której komunikat jest fałszywy.
- Typy na granicach: kopia, sesja, wpisy zakwasu, wybory i plik receptury są parsowane z `unknown`. Część odczytów z bazy idzie z generykiem typu wiersza → 008.
- System projektowy: kolory i kroje poza motywem tylko w nazwanych wyjątkach z testami (`tests/kolory-poza-motywem.test.ts`, `tests/fontsize-wyjatki-159.json`). Sprawdzone, brak nowego znaleziska (`dowody/dev11-tokeny.txt`).
- Teksty przez i18n: `check:i18n` daje 0 błędów i 153 uwagi o kluczach dynamicznych (`dowody/npm-check-i18n.txt`, `dowody/check-i18n-uwagi.txt`). Sprawdzone, brak znaleziska; uwagi należą do roli 09.
- Kod wrażliwy na wydajność: odczyt zakwasów z podzapytaniem po indeksie `idx_starter_entries_starter_kind_at`, import wiersz po wierszu w jednej transakcji, zegary co minutę tylko przy widocznym ekranie. Sprawdzone na próbce, brak.
- Testy na właściwym poziomie: zapisy testowane na prawdziwym SQLite (`src/data/__tests__/helpers/node-sqlite-adapter.ts`, odwzorowuje ROLLBACK expo-sqlite 57.0.4), logika w Node, ekrany w react-test-renderer. Brak testu współbieżności transakcji (001) i granicy tygodnia (002).
- Dostępność w komponentach: 221 elementów dotykowych. Heurystyka wskazała 8 bez roli, ale po przeczytaniu kodu wszystkie 8 rolę mają (`dowody/a11y-role.txt`). Pasek „Cofnij” nie znika przy VoiceOver (D-083). Sprawdzone, brak; pomiar na urządzeniu nie sprawdzony.
- Liczby konfiguracyjne: stałe czasu (`HOUR_MS`, `DOBA_MS`, `MINUTA_MS`) zdefiniowane w kilku plikach z tą samą wartością, co jest stylem, a nie znaleziskiem (`dowody/dev16-jednostki.txt`). Zakresy pól receptury mają dwie różne wartości → 004.

Soczewki (każdą przeszedłem osobno, bez subagentów):
- **Użytkownik, któremu zapis przerwano w połowie:** transakcje są na każdym zapisie wielowierszowym, migracja nie rusza bez kopii, a nieudana migracja daje ekran błędu z kopią do udostępnienia. Słabe miejsce: atomowość zależy od tego, czy w tym czasie nie ruszy druga transakcja (001).
- **Recenzent szukający ścieżki bez testu:** przejście północy testowane tylko w środku tygodnia (002); średnia ocen bez wpisu bez oceny (003); brak testu dwóch transakcji naraz (001); BR-RECP-005 z nieaktualnym wyjątkiem (007).
- **Programista czytający moduł pierwszy raz:** zagrożenie ROLLBACK-iem opisuje tylko komentarz w `src/data/bake-sessions-store.ts:166-170`, a 10 innych miejsc dalej woła `withTransactionAsync`. Nowa ścieżka zapisu powtórzy błąd, bo nic tego nie pilnuje (001). Zakresy pól receptury trzeba znaleźć w dwóch plikach (004).
- **Użytkownik VoiceOver albo z dużym tekstem:** role i etykiety są, testy macierzy pilnują obecności elementów. Na urządzeniu nie sprawdzono (krok właściciela).

Wzorzec najlepszych: dokumentacja expo-sqlite dla SDK 57 (docs.expo.dev/versions/v57.0.0/sdk/sqlite/, odczyt 2026-11-08, surowy HTML przez curl): „Note: This transaction is not exclusive and can be interrupted by other async queries.” Kod pakietu w wersji z blokady (57.0.4) w catch woła ROLLBACK także po nieudanym BEGIN, co pokazuje `node_modules/expo-sqlite/src/SQLiteDatabase.ts:140-149`: „await this.execAsync('ROLLBACK');”. Z modułu sqlite-expo tej roli: każdy zapis idzie przez jedną kolejkę portu bazy, a `withExclusiveTransactionAsync` nie nadaje się do tabel z `REFERENCES`. Wzorca rynkowego (konkurencja, recenzje) ta rola nie ustala; to obszar ról 01 i 02.

Rejestr założeń (`docs/zalozenia.md`): nie proponuję zmian statusu. Znaleziska dotyczą wykonania, nie kierunku produktu.

Stosowalność środowiska: telefon, symulator iOS, Xcode i Maestro iOS nie były dostępne. Nie uruchamiałem ponownie instalacji ani pełnych testów; wyniki są w `wspolne/` (npm ci, typecheck, lint, npm test: kod 0).

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| `src/data/*` (23 pliki: schemat, migracje v1–v7, port, sesje, zakwasy, wpisy, ustawienia, wybory, kopie przed migracją, pliki ratunkowe, „Usuń wszystko”) | tak, przeczytane w całości | `dowody/grep-transakcje.txt`, `dowody/sonda-kolejka-transakcji.txt` |
| `src/lib/backup.ts`, `kopia-plikow-bazy.ts`, `import-z-pliku.ts`, `startup-guard.ts`, `save-guard.ts`, `przerwij-wypiek.ts` | tak, w całości | `dowody/dev10-puste-catch.txt` |
| `src/lib/recipe-sharing.ts` (walidacja importu receptury), `src/lib/kalendarz-akcje.ts` | tak, części dotyczące zapisu i walidacji | `dowody/sonda-eksport-import-zakresy.txt` |
| Hooki zapisu: `useBakeSession`, `useFinishBake`, `useCofnijDokarmienie`, `useDaneMaszyny`, `useZakwasPlanu`, `useKalendarz`, `usePendingRecipeLoader`; `src/components/zakwas/useAkcjeZakwasu.ts`, `useStarterLog.ts` | tak | `dowody/sonda-dwa-stukniecia-dokarmione.txt`, `dowody/sonda-polnoc-niedziela.txt` |
| Ekrany: Zakwasy (`app/(tabs)/zakwasy/index.tsx`, karty profilu i szczytu), import z pliku, prowadzenie (zegar, przerwanie), `app/_layout.tsx` (kolejność startu) | tak, części ze ścieżkami zapisu i czasu | `dowody/sonda-profil-bez-dokarmienia.txt`, `dowody/dev08-dev15-timery.txt` |
| Sekrety w repo i historii | tak | `dowody/sekrety.txt` |
| Testy osłabione, zmiany asercji od 2026-11-01, próbka DEV-02 | tak | `dowody/testy-oslabione-grep.txt`, `dowody/testy-zmiany-asercji.txt`, `dowody/dev02-probka.txt` |
| Bramki `verify` pojedynczo (macierz, rozmiar, i18n, natywne, licencje ×2) | tak, kod 0 | `dowody/npm-verify-matrix.txt`, `dowody/npm-check-size.txt`, `dowody/npm-check-i18n.txt`, `dowody/npm-verify-native.txt`, `dowody/npm-check-licenses.txt`, `dowody/npm-check-licencje.txt` |
| Typecheck, lint, pełne testy | wynik wspólny E0 (kod 0) | `wspolne/typecheck.txt`, `wspolne/lint.txt`, `wspolne/test.txt` |
| Plan i uzgadnianie powiadomień (`src/lib/notifications.ts`, `src/core/notification-plan.ts`, `notification-feeding.ts`) | **nie sprawdzono** w głębi (tylko grep zapisów do bazy) | obszar krytyczny dla celu „pilnuje czasu, gdy telefon śpi”: werdykt obniżony |
| Zakupy StoreKit (`src/lib/platnosci/*`) | **nie sprawdzono** w głębi (grep zapisów, nasłuchy) | krok właściciela w ASC i na telefonie |
| Logika domenowa (`domain-rules.ts`, `reverse-scheduler.ts`, `maszyna.ts` i in.) | tylko przez bramki i grep (każdy moduł ma test: `dowody/dev01-moduly-testy.txt`; BR→test: `dowody/br-bez-testu.txt`) | obliczeń nie liczyłem ręcznie |
| ~145 komponentów w `src/components` poza wymienionymi | grep (kolory, kroje, role, timery, puste catch) | `dowody/dev11-tokeny.txt`, `dowody/a11y-role.txt` |
| Urządzenie, symulator, Maestro iOS | **nie sprawdzono** (brak macOS) | krok właściciela |

## Kontrola dowodów i sekretów
Wynik `node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs` na tym raporcie: w sekcji niżej po uruchomieniu.

Komenda: `node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs /home/user/piekarz/audit/M1-2026-11-08/role/08-programista/08-programista-2026-11-08.md /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/role/08-programista --rola 08-programista`

Wynik: "OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 08-programista", kod 0 (po poprawkach cytatów w 002, 003, 004, 008 i dwóch ścieżek względnych w 006; pierwsze uruchomienie: 13 błędów).

Sekrety: brak w repo i w historii (DEV-14, `dowody/sekrety.txt`); raport i dowody nie zawierają kluczy ani tokenów.

## Stosowalność listy kontrolnej
| Pozycja | Status (dotyczy / nie dotyczy + powód / decyzja D-xx) | Wynik (ok / znalezisko ID / nie sprawdzono + powód) |
|---|---|---|
| DEV-01 | dotyczy | znalezisko 08-programista-002, 08-programista-007; każdy moduł logiki ma test (`dowody/dev01-moduly-testy.txt`), macierz LOGIKA 100% (`dowody/npm-verify-matrix.txt`) |
| DEV-02 | dotyczy | ok: 10/10 (8779cc6b, 91f5e721, 2d31a787, 75de19fc, e28537d1, c694861f, 80276b42, 21ebdb3c, 47677614, e658ae8c); 75de19fc i 80276b42 mają test czerwony we wcześniejszym commicie (7b24d2f2, a089a255), `dowody/dev02-probka.txt` |
| DEV-03 | dotyczy | ok: brak `.skip`, `.only`, `xit`, `it.todo`, `expect(true)`, `@ts-ignore`, `istanbul ignore` (`dowody/testy-oslabione-grep.txt`); 26 commitów od 2026-11-01 usuwa linie `expect(`, każdy z ID decyzji albo z równoważną asercją (`dowody/testy-zmiany-asercji.txt`) |
| DEV-04 | dotyczy | znalezisko 08-programista-005; typecheck, lint (0 błędów, 2 ostrzeżenia exhaustive-deps), testy 574/6017 i bramki `verify` kod 0 |
| DEV-05 | dotyczy (lokalna baza SQLite, moduł sqlite-expo) | znalezisko 08-programista-001, 08-programista-006; REPLACE tylko na liściach z kompletem kolumn (ok) |
| DEV-06 | dotyczy | ok: migracja każda w transakcji po `VACUUM INTO` (`src/data/sqlite-schema.ts:367-388`), testy na bazach 1014 i 1021 (D-231), kopie JSON, surowe pliki z `-wal`/`-shm` tylko po błędzie otwarcia |
| DEV-07 | dotyczy | znalezisko 08-programista-003 |
| DEV-08 | dotyczy (ADR: INTEGER ms) | ok: odliczanie od znacznika końca (`endAtMsRef`), brak `new Date(String(`; granica tygodnia → 08-programista-002 (zgłoszone jako DEV-01) |
| DEV-09 | dotyczy | znalezisko 08-programista-008 |
| DEV-10 | dotyczy | ok poza 08-programista-001 (komunikat „Nie zapisano” przy zapisie, który się udał); puste catch tylko przy sprzątaniu i znacznikach (`dowody/dev10-puste-catch.txt`) |
| DEV-11 | dotyczy | ok: wyjątki nazwane i pilnowane testami (decyzja 159/504 a) |
| DEV-12 | dotyczy (35 języków) | ok: `check:i18n` 0 błędów; uwagi o kluczach dynamicznych należą do roli 09 |
| DEV-13 | dotyczy | znalezisko 08-programista-004 |
| DEV-14 | dotyczy | ok: brak plików kluczy, brak sekretów w plikach i historii (trafienia w historii to opis formatu `.p8` w dokumentacji), `EXPO_PUBLIC_*` bez sekretów (`dowody/sekrety.txt`) |
| DEV-15 | dotyczy | ok: każdy `setInterval`, `setTimeout`, `addEventListener` i nasłuch powiadomień ma sprzątanie; blokada wygaszania przez `useKeepAwake` w komponencie warunkowym (`dowody/dev08-dev15-timery.txt`) |
| DEV-16 | dotyczy | ok na próbce 70 przeliczeń: jednostka w nazwie (`durationMin`, `timerEndsAt`, `…Ms`), brak `getUTC*`; stałe czasu powielone, ale z tą samą wartością (`dowody/dev16-jednostki.txt`) |

## Znaleziska (szczegóły)

### 08-programista-001 · Równoległe transakcje na jednym połączeniu cofają się nawzajem: zapis z komunikatem „Nie zapisano” bywa zapisany, import kopii wchodzi bez transakcji
- Pozycja listy kontrolnej: DEV-05
- Poziom: P1
- Realność: brzegowy · Pewność: wysoka (mechanizm odtworzony na prawdziwym SQLite)
- Rodzaj: D
- Dowód: `node_modules/expo-sqlite/src/SQLiteDatabase.ts:140-149` — catch woła „await this.execAsync('ROLLBACK');” także wtedy, gdy nie udało się samo BEGIN. Druga transakcja na tym samym połączeniu dostaje błąd „cannot start a transaction within a transaction” i swoim ROLLBACK cofa pierwszą. Pierwsza dalej wykonuje instrukcje już poza transakcją, a jej COMMIT i ROLLBACK padają. Zespół zna ten mechanizm (`src/data/bake-sessions-store.ts:166-170`, „po nieudanym BEGIN”), ale ominął go tylko w zapisach sesji. Sonda (`dowody/sonda-kolejka-transakcji.txt`, adapter `node:sqlite` odwzorowujący expo-sqlite 57.0.4): (A) dwa `saveStarter` naraz dają dwa błędy `StorageWriteError`, a mimo to w bazie zostaje wpis `feed-z-2000`; (B) import kopii i dokarmienie naraz dają dwa błędy, a w bazie są wyłącznie dane z kopii (stare wpisy i zakwas skasowane), dokarmienie przepada, a import nie był atomowy.
- Mechanizm: każda operacja wielowierszowa woła `withTransactionAsync` na wspólnym połączeniu bez kolejki zapisów; `grep -rn withTransactionAsync src` → 10 wywołań: `src/data/sqlite-store.ts:200` (saveStarter), `src/data/sqlite-store.ts:231` (deleteStarter), `src/data/sqlite-store.ts:277` (restoreFromBackupData), `src/data/sqlite-store.ts:359` (finishBake), `src/data/starter-entries-store.ts:85`, `src/data/starter-entries-store.ts:102`, `src/data/starter-entries-store.ts:152`, `src/data/starter-entries-store.ts:175`, `src/data/usun-wszystko.ts:25`, migracje ręcznym BEGIN (`src/data/sqlite-schema.ts:374`). Pojedyncze zapisy w tle trafiają do cudzej transakcji i znikają razem z nią: pamięć zakupu (`src/lib/platnosci/stan.ts:60-63`, nasłuch StoreKit) i postęp kroku (`src/hooks/useBakeSession.ts:79`); ekran ma wtedy nową wersję wiersza, której baza nie ma.
- Powraca: tak — przegląd danych D1 P2-1 (komentarz w `bake-sessions-store.ts`) naprawił jedno wystąpienie → trwała kontrola: test współbieżności w `src/data/__tests__` i reguła w warstwie danych (jedna kolejka), żeby nowe ścieżki nie omijały portu.
- Wzorzec lub źródło: zasada wspólna 10; moduł sqlite-expo („każdy zapis w aplikacji idzie przez jedną kolejkę portu bazy”); docs.expo.dev/versions/v57.0.0/sdk/sqlite/ (odczyt 2026-11-08): withTransactionAsync „is not exclusive and can be interrupted by other async queries”.
- Kroki w aplikacji: (1) Zakwasy → dwa szybkie stuknięcia „Dokarmione” w trakcie zapisu (dwie transakcje `saveStarter`) → dwa komunikaty „Nie zapisano”, a dokarmienie jest w dzienniku po ponownym wejściu. (2) Import kopii, gdy w tle przychodzi zapis z innej transakcji (np. „Zrobione” na „Dziś” z drugiej instancji ekranu) → „Nie zapisano”, a dane z telefonu już są zastąpione (kopia przed importem istnieje). (3) Koniec wypieku nieudany (pełny dysk) wycofuje też zapis kroku drugiego wypieku z tego samego czasu.
- Opcje: (a) jedna kolejka zapisów w warstwie danych (obietnica-mutex w `getDb`/`writeOrThrow`, przez którą idzie każda transakcja i każdy zapis) — mała zmiana w jednym miejscu, zapisy po kolei (milisekundy); (b) blokada podwójnych stuknięć tylko w przyciskach — nie chroni zapisów w tle (StoreKit, zegar kroku); (c) `withExclusiveTransactionAsync` — wykluczone, bo jego połączenie ma wyłączone klucze obce (moduł sqlite-expo, `starter_entries` ma `REFERENCES`). Rekomendacja: (a), razem z testem na adapterze `node:sqlite`.
- Test akceptacyjny: test na adapterze `node:sqlite` uruchamia `Promise.all([restoreFromBackupData(kopia), addStarterEntry(wpis)])` oraz dwa `saveStarter`; oba wywołania kończą się sukcesem albo jedno jawnym błędem, a stan bazy to stan po wykonaniu ich po kolei (żadnych „Nie zapisano” przy zapisanych danych, import w całości albo wcale); test pada na kodzie sprzed poprawki (jak sonda).
- Status: otwarte

### 08-programista-002 · Pasek tygodnia na „Dziś” zostaje na starym tygodniu po północy z niedzieli na poniedziałek
- Pozycja listy kontrolnej: DEV-01
- Poziom: P1
- Realność: realny (co tydzień, przy aplikacji otwartej albo wstrzymanej w tle przez noc z niedzieli na poniedziałek) · Pewność: wysoka
- Rodzaj: D
- Dowód:
  - `src/hooks/useKalendarz.ts:59` ustawia kotwicę widoku raz przy montowaniu: „widokDzis('tydzien', Date.now())”.
  - Pasek liczy dni z kotwicy: `src/hooks/useKalendarz.ts:99`, „dniPaska(now, first, widok.kotwica)”. Zegar minutowy zmienia tylko `now` (`src/hooks/useKalendarz.ts:63-69`). Zakładka "Dziś" zostaje zamontowana, a powrót na nią nie zmienia widoku.
  - Sonda: kopia testu BR-KAL-001 „Północ” z `src/__tests__/dzis-d4b.test.tsx:385`, w której zmieniono tylko datę na północ 2026-11-09 (niedziela→poniedziałek). Wynik: po minucie żaden dzień nie jest wyróżniony (oczekiwano `pasek-dzien-2026-11-09`, otrzymano `[]`), kod 1 (`dowody/sonda-polnoc-niedziela.txt`). Ten sam test dla środy→czwartku przechodzi.
- Mechanizm: widok z zapamiętaną datą kotwicy zamiast "bieżący, dopóki użytkownik nie przesunie"; `grep -n "widokDzis" src/hooks/useKalendarz.ts` → 2 wywołania: start (wiersz 59) i przycisk "Dziś" (wiersz 94). Innych miejsc z tym wzorcem nie ma.
- Powraca: nie (D-275 zostawił to pytanie dla M1: „czy pasek przełącza tydzień o północy niedzieli (nie sprawdzono)”) → trwała kontrola: wektor graniczny tygodnia w teście BR-KAL-001.
- Wzorzec lub źródło: `docs/brd/wymagania-kalendarz.md:44-47` (BR-KAL-001 „Północ”: „po powrocie na ekran albo najpóźniej po minucie wyróżniony jest czwartek”); DEV-01 (wektor na granicy).
- Kroki w aplikacji: w niedzielę wieczorem zostawić Piekarza na „Dziś” albo w tle; w poniedziałek rano otworzyć → pasek pokazuje zeszły tydzień bez wyróżnionego dnia, zdarzenia z dzisiejszego dnia nie są na pasku, pojawia się przycisk „Dziś”.
- Opcje: (a) stan widoku „bieżący” bez zapamiętanej kotwicy, dopóki użytkownik nie przesunie tygodnia albo miesiąca; po przesunięciu kotwica jak dziś — pasek zawsze pokazuje bieżący tydzień, przesunięty widok zostaje przesunięty; (b) przy zmianie dnia (zegar minutowy, powrót na ekran) widok wraca do dziś — prostsze, ale cofa tydzień, który użytkownik przewinął. Rekomendacja: (a).
- Test akceptacyjny: test „BR-KAL-001 Północ” z wektorem niedziela→poniedziałek (dla pierwszego dnia poniedziałek i niedziela, `systemFirstWeekday`) wyróżnia nowy dzień po minucie i po powrocie na ekran; test pada na obecnym kodzie.
- Status: otwarte

### 08-programista-003 · Brakujące dane zastępowane zgadniętą wartością: „Ostatnie dokarmienie: przed chwilą” bez dokarmienia, brak oceny liczony jako 5★, domyślne liczby przy imporcie receptury
- Pozycja listy kontrolnej: DEV-07
- Poziom: P1
- Realność: realny dla etykiety zakwasu (usunięcie wpisu dokarmienia w dzienniku); brzegowy dla średniej (wpisy bez oceny z importu albo starszych buildów); teoretyczny dla importu receptury (tylko plik spoza Piekarza) · Pewność: wysoka
- Rodzaj: D
- Dowód:
  - (1) `app/(tabs)/zakwasy/index.tsx:145-146` daje „if (diffHours < 1) return t('przed chwilą');”, bo brak `lastFedAt` zamienia się na `Date.now()`.
  - Sonda (`dowody/sonda-profil-bez-dokarmienia.txt`): po usunięciu jedynego dokarmienia karta profilu pokazuje "Ostatnie dokarmienie | przed chwilą", a karta szczytu na tym samym ekranie mówi „Brak danych o karmieniu” (`src/core/sourdough-physics.ts:106`).
  - (2) `src/core/bake-statistics.ts:55` liczy „ratingSum += log.ratingStars ?? 5;”; sonda daje średnią 3 dla wpisów 1★ i bez oceny (`dowody/sonda-srednia-oceny.txt`).
  - Karta Dziennika pokazuje tę wartość jako średnią ocen: `src/components/stolnica/BakeStatsCard.tsx:27`. Lista wpisów pokazuje wpis bez oceny jako wpis bez oceny: `src/components/stolnica/BakeHistorySection.tsx:96`.
  - (3) Import receptury z pliku albo QR: brak albo zły udział zakwasu daje 0 (`src/lib/recipe-sharing.ts:201-204`), a drożdże poza 0–10% znikają bez komunikatu (`src/lib/recipe-sharing.ts:222-229`).
  - Zła masa ciasta daje 850 g: `src/lib/recipe-sharing.ts:234`, „let targetDoughWeightGrams = 850;”. Dla wody i soli ten sam kod zwraca błąd. Podgląd importu pokazuje zakwas, ale nie drożdże ani masę.
- Mechanizm: brak wartości zamieniony na literał w kodzie ekranu i logiki zamiast `null` i stanu „brak”; `dowody/dev07-grep.txt` (77 linii przejrzanych) → 6 trafień w tym znalezisku: `app/(tabs)/zakwasy/index.tsx:145`, `src/core/bake-statistics.ts:55`, `src/core/bake-statistics.ts:119` (filtr minimalnej oceny, dziś nieużywany w UI), `src/lib/recipe-sharing.ts:204`, `src/lib/recipe-sharing.ts:227`, `src/lib/recipe-sharing.ts:234`. Pozostałe trafienia to wartości domyślne ze schematu (DDT 25, hydratacja zakwasu 100), preferencje interfejsu albo zabezpieczenia typu bez skutku na ekranie.
- Powraca: nie → trwała kontrola: test każdego z trzech miejsc z danymi bez wartości.
- Wzorzec lub źródło: zasada programisty 9 („Brakującej wartości … nie uzupełniasz zgadniętą liczbą”); wzorzec „Parsowanie: brak zostaje brakiem”. Poziom: dla importu lista daje P0 (zgadnięta wartość trafia do zapisu i obliczeń). Obniżam do P1 jako wyjątek nazwany: własny eksport Piekarza nie trafia w te gałęzie, bo pola arkusza mają drożdże 0–10, co sprawdziłem w `src/components/receptury/SkladnikiSheet.tsx:211`.
- Kroki w aplikacji: Zakwasy → dziennik → usuń wpis dokarmienia → karta profilu „przed chwilą”. Ustawienia → import kopii z wpisem bez oceny → Dziennik → „Średnia ocena” zawyżona. Import z pliku receptury z `"targetDoughWeightGrams": "900"` → receptura zapisana z masą 850 g bez słowa.
- Opcje: (a) brak = brak: etykieta „nie zapisano dokarmienia” zamiast „przed chwilą”, średnia tylko z ocenionych wpisów („brak ocen” przy zerze), w imporcie zła albo brakująca wartość daje błąd z polem jak przy wodzie; (b) w imporcie pokazać w podglądzie drożdże i masę zamiast błędu — mniej odrzuconych plików, ale zgadnięta masa zostaje. Rekomendacja: (a); teksty „brak” do akceptacji roli 04.
- Test akceptacyjny: ekran Zakwasy bez wpisu dokarmienia nie pokazuje „przed chwilą”; `calculateBakeStatistics` dla [1★, bez oceny] daje 1, a dla samych wpisów bez oceny daje brak; `decodeRecipeFromShareUrl` z masą „900” jako tekst, drożdżami 12 i bez `starterPercentage` zwraca błąd z nazwą pola. Każdy test pada na obecnym kodzie.
- Status: otwarte

### 08-programista-004 · Zakresy pól receptury w dwóch miejscach z różnymi wartościami: receptury zapisanej w aplikacji nie da się udostępnić ani zaimportować
- Pozycja listy kontrolnej: DEV-13
- Poziom: P1
- Realność: brzegowy (woda powyżej 120% albo poniżej 35%, sól powyżej 6%) · Pewność: wysoka
- Rodzaj: D
- Dowód:
  - Arkusz "Składniki" pozwala zapisać wodę 0–150: `src/components/receptury/SkladnikiSheet.tsx:205`, „wartosc={p.waterPct} min={0} max={150}”.
  - Sól 0–10: `src/components/receptury/SkladnikiSheet.tsx:210`, „wartosc={p.saltPct} min={0} max={10}”.
  - Walidacja pliku i QR odrzuca wodę poza 35–120: `src/lib/recipe-sharing.ts:189`, „waterPct < 35 || waterPct > 120”.
  - Sól powyżej 6: `src/lib/recipe-sharing.ts:197`, „saltPct < 0 || saltPct > 6”.
  - Sonda eksport→import (`dowody/sonda-eksport-import-zakresy.txt`): woda 75% i sól 2% dają „receptura”; woda 125%, woda 30% albo sól 7% dają „nierozpoznany”. Ekran mówi wtedy, że plik nie jest rozpoznany, i nie podaje powodu (`src/lib/import-z-pliku.ts:46` gubi komunikat walidacji).
- Mechanizm: ta sama wielkość (dopuszczalny zakres pola receptury) zdefiniowana w komponencie i w parserze z różnymi wartościami; zakwas ma 0–100 w arkuszu i 0–150 w imporcie; hydratacja zakwasu 20–200 i drożdże 0–10 są zgodne; 2 pliki, 5 par wartości.
- Powraca: nie → trwała kontrola: jeden moduł zakresów importowany przez arkusz i parser + test, że każda receptura z granic arkusza przechodzi eksport→import.
- Wzorzec lub źródło: DEV-13; zasada programisty 11 („Liczby konfiguracyjne trzymasz w jednym module konfiguracji”). Wartości graniczne są merytoryczne (rola 06, hierarchia D-035).
- Kroki w aplikacji: Receptura → Składniki → woda 125% → Zapisz jako moją → Więcej → Udostępnij plik → na drugim telefonie Importuj z pliku → „nierozpoznany”.
- Opcje: (a) jeden moduł zakresów z wartościami potwierdzonymi przez rolę 06, używany przez arkusz i import — spójne, wymaga krótkiej pracy roli 06; (b) import przyjmuje każdy zakres, który arkusz pozwala zapisać (0–150, 0–10, 0–150) — szybkie, bez rozstrzygania merytorycznego, plik z wodą 140% przejdzie. Rekomendacja: (b) w 1.0, (a) jako zadanie roli 06; w obu wariantach komunikat walidacji trafia na ekran importu.
- Test akceptacyjny: dla wartości granicznych arkusza (woda 0 i 150, sól 10, zakwas 100) `rozpoznajPlik(exportRecipeToJson(r))` daje „receptura”; zakresy są zdefiniowane w jednym miejscu (grep nie znajduje drugiej definicji).
- Status: otwarte

### 08-programista-005 · iOS E2E czerwony na `master` @ 2ef8870a; Nightly bez zielonego przebiegu w oknie 11-02…11-08
- Pozycja listy kontrolnej: DEV-04
- Poziom: P1
- Realność: dla użytkownika brak (D-279: wyścig scenariusza z arkuszem zgody, nie regresja aplikacji); dla wydania realny (zasada 21, D-272) · Pewność: wysoka (stan CI z E0)
- Rodzaj: D
- Dowód: `wspolne/ci.txt`: iOS E2E #96 (run 42511355281, push na 2ef8870a) FAILURE, flow `05-dwa-wypieki` „Assertion is false: id: next-or-finish-step-btn is visible”, 4/5 zielone; #97 na `wip/08-e2e95` (E2E-95) zielony; Nightly Deep Verification #25 failure na 9c255a0, #19–#24 przerwane po limicie 2 h, brak zielonego w oknie.
- Mechanizm: opcjonalne `tapOn` arkusza zgody w scenariuszach Maestro przegrywa wyścig z arkuszem systemowym (D-279: 6 miejsc). Utwardzenie E2E-95 jest gotowe na gałęzi, a D-280 odkłada je do chwili po buildzie kandydata. Nightly przekracza limit 2 h.
- Powraca: tak — E2E-94 (D-279) → trwała kontrola: E2E-95 na `master` i alarm przy przerwanym albo czerwonym Nightly.
- Wzorzec lub źródło: zasada wspólna 21 („Czerwony workflow na `main` to znalezisko przed pracą”); D-279, D-280.
- Kroki w aplikacji: brak (dotyczy bramki wydania).
- Opcje: (a) scalić E2E-95 (#97 zielony) do `master` i powtórzyć E2E na HEAD zgodnie z D-280 — zgodne z planem; (b) zostawić czerwony do M2 — kolejne scalenia nie mają sygnału E2E. Rekomendacja: (a); dla Nightly osobne zadanie roli 07 (czas przebiegu).
- Test akceptacyjny: iOS E2E zielony na HEAD `master`; Nightly kończy się w limicie z wynikiem zielonym.
- Status: otwarte (naprawa zaplanowana D-280)

### 08-programista-006 · Dwa stuknięcia „Dokarmione” zapisują dwa dokarmienia
- Pozycja listy kontrolnej: DEV-05
- Poziom: P2
- Realność: realny (mokre ręce, przycisk nie gaśnie w trakcie zapisu) · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/components/zakwas/StarterCycleCard.tsx:105` (przycisk bez `disabled`) → `src/components/zakwas/useAkcjeZakwasu.ts:52-60`, gdzie każde wywołanie tworzy wpis z nowym znacznikiem czasu. Sonda na ekranie Zakwasy z prawdziwym SQLite (`dowody/sonda-dwa-stukniecia-dokarmione.txt`): dwa stuknięcia w odstępie 150 ms albo 2 ms dają 3 wpisy feeding (start + 2), bez komunikatu. Koniec wypieku ma tę ochronę (`src/hooks/useFinishBake.ts:45-47`).
- Mechanizm: akcje zapisu bez blokady w trakcie zapisu; `grep -rn "useRef(false)"` → blokada tylko w `useFinishBake`, `PaywallModal`, `useDodajDoKalendarza`, `useProPoArkuszu`; bez niej: dokarmienie (`src/components/zakwas/useAkcjeZakwasu.ts:52`), obserwacja "Podwoił objętość" (`src/components/zakwas/useStarterLog.ts:45-49`), dodanie zakwasu (`src/components/zakwas/useAkcjeZakwasu.ts:101`).
- Powraca: tak — audyt niezależny D-11 naprawił to samo przy końcu wypieku → trwała kontrola: test dwóch stuknięć dla każdej akcji zapisu z karty zakwasu.
- Wzorzec lub źródło: wzorzec z `useFinishBake.ts` („Drugie stuknięcie … nic nie robi”).
- Kroki w aplikacji: Zakwasy → „Dokarmione” dwa razy szybko → dwa dokarmienia w dzienniku, „Przywróć” cofa tylko ostatnie.
- Opcje: (a) blokada w trakcie zapisu (ref i `disabled`) w akcjach karty zakwasu — wzór już jest w `useFinishBake`; (b) zapis idempotentny po minucie (ten sam zakwas i ta sama minuta = jeden wpis) — działa też przy powtórce z „Dziś”, ale zmienia regułę zapisu. Rekomendacja: (a).
- Test akceptacyjny: dwa stuknięcia „Dokarmione” w odstępie poniżej czasu zapisu dają jeden nowy wpis; test pada na obecnym kodzie.
- Status: otwarte

### 08-programista-007 · Bramka BR→test: wyjątek BR-RECP-005 nieaktualny, 17 BR ze scenariuszami bez testu
- Pozycja listy kontrolnej: DEV-01
- Poziom: P2
- Realność: brzegowy (funkcja ma testy, brakuje śladu ID; część scenariuszy bez testu) · Pewność: wysoka
- Rodzaj: D
- Dowód: `scripts/br-wyjatki.json:23` zwalnia BR-RECP-005, bo funkcja jest „jeszcze bez kodu”. Przełącznik wersji drożdżowej jest jednak w kodzie od p9b (68129e40) i ma testy bez ID BR (`src/__tests__/receptura-wersja-drozdzowa-p9b.test.tsx:58`). `node scripts/br-bez-testu.mjs` (`dowody/br-bez-testu.txt`) zgłasza 17 BR ze scenariuszami bez testu („czesciowe”: BR-CZAS-002, BR-DANE-002, BR-DIAG-001, BR-DIAG-003, BR-DIAG-004, BR-ETAP-001, BR-HARMO-001, BR-KAL-005, BR-KAL-009, BR-KAL-011, BR-KALK-010, BR-MASZ-005, BR-MASZ-006, BR-RECP-001, BR-RECP-003, BR-REKA-001, BR-ZAK-001) i kończy się kodem 0.
- Mechanizm: wyjątek zapisany „do czasu kodu” nie wygasa sam; scenariusze częściowe nie zatrzymują bramki.
- Powraca: nie → trwała kontrola: wyjątek z warunkiem wygaśnięcia sprawdzanym w `tests/br-bez-testu.test.ts`.
- Wzorzec lub źródło: DEV-01 („każda reguła z BRD … ma test z wektorem”); D-187, D-188.
- Kroki w aplikacji: brak (ślad testów).
- Opcje: (a) ID BR-RECP-005 w nazwach istniejących testów i usunięcie wyjątku; scenariusze częściowe jako lista zadań roli 07 — mała zmiana; (b) bramka pada na scenariuszu częściowym — pełniejsza, ale dziś zatrzyma verify. Rekomendacja: (a).
- Test akceptacyjny: `br-bez-testu` nie ma wyjątku dla BR z kodem; liczba scenariuszy częściowych maleje według listy roli 07.
- Status: otwarte

### 08-programista-008 · Część odczytów z bazy bez parsowania (typ wiersza z generyka, `as`)
- Pozycja listy kontrolnej: DEV-09
- Poziom: P2 (lista daje P1; obniżone, bo dane zapisuje sama aplikacja pod CHECK i NOT NULL, import jest parsowany, a skutku na ekranie nie znalazłem)
- Realność: teoretyczny · Pewność: wysoka (mechanizm), średnia (skutek)
- Rodzaj: D
- Dowód:
  - Profil sensoryczny z `JSON.parse` bez sprawdzenia kształtu: `src/data/wpisy-wypiekow.ts:36`, „sensoryProfile = JSON.parse(r.sensoryProfileRaw);”.
  - Asercja na smaku: `src/data/wpisy-wypiekow.ts:54`, „r.tasteProfile as StoredBakeLog['tasteProfile']”.
  - Bez parsowania są też: `src/data/flour-store.ts:17` (wiersz jako `StoredFlourInventoryItem`, NULL zamiast `undefined`), `src/data/sqlite-store.ts:170` (`StarterRow` bez sprawdzenia `storageState`), `src/data/settings-store.ts:19` (`as Array`), `src/data/recipes-store.ts:17` (kolumny poza formułą), `src/lib/backup.ts:226` (`as Partial<…>` na pliku; pola są później sprawdzane).
- Mechanizm: `get(All|First)Async<Typ>` zamiast `<unknown>` + parser; `dowody/dev09-granice-typow.txt` → 22 zapytania z typem, z czego 6 opisanych wyżej czyta dane użytkownika bez parsera. Pozostałe to PRAGMA albo pola od razu sprawdzane przez `isStr`/`isNum`.
- Powraca: nie → trwała kontrola: reguła lint albo test, który zabrania generyka typu wiersza w `src/data` poza PRAGMA.
- Wzorzec lub źródło: zasada programisty 10; `parseStarterEntryRow` i `parseBakeSession` w tym repo to dobry wzór.
- Kroki w aplikacji: brak drogi bez ręcznie uszkodzonej bazy.
- Opcje: (a) parsery wierszy jak `parseBakeRow` dla bazy, zły wiersz do pliku ratunkowego (istniejący mechanizm 121) — spójne; (b) zostawić do 1.1 — ryzyko teoretyczne. Rekomendacja: (b), z (a) przy najbliższej zmianie tych plików.
- Test akceptacyjny: wiersz z `taste_profile = 'xyz'` albo `sensory_profile = '{}'` nie trafia do Dziennika jako poprawny profil (pole puste, surowa treść w pliku ratunkowym).
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- `useZapisWypieku` (`src/hooks/useBakeSession.ts:61-66`) pokazuje komunikat tylko dla `StorageWriteError`. Błąd samego odczytu w `utworzWypiek` albo `zapiszPostepWypieku` (SELECT poza `writeOrThrow`) kończy zapis kroku bez słowa. Brakuje dowodu, że odczyt może tu paść na urządzeniu.
- `useDaneMaszyny.zapisz` ustawia dane maszyny w stanie ekranu przed zapisem. Po „Nie zapisano” ekran liczy dalej z niezapisanymi danymi aż do ponownego otwarcia. Skutek niewielki, bo komunikat jest; trzeba ocenić w telefonie.
- `resyncNotifications` po powrocie aplikacji może czytać bazę w trakcie migracji przy pierwszym starcie nowej wersji, jeśli zdarzenie „active” przyjdzie przed końcem `initDatabase`. Brak dowodu, że iOS wyśle to zdarzenie w tym oknie.
- Kopia automatyczna po wypieku (`src/data/sqlite-store.ts:69-72`) nie daje sygnału przy nieudanym zapisie (np. pełny dysk), więc pula kopii może cicho przestać rosnąć. Trzeba ustalić z rolą 12, czy to ma być widoczne.

## Co działa dobrze i należy zachować
- UPSERT rodzica i dzieci z komentarzem „dlaczego” (`STARTER_UPSERT`, `writeBakeRow` z `COALESCE` dla pól, których zapis nie dotyczy) oraz jawne usuwanie dzieci przed rodzicem w transakcji.
- Sesje wypieków: zapis jedną instrukcją z limitem i wersją wiersza (optymistyczna współbieżność), więc druga instancja Stolnicy nie cofa postępu.
- Migracje: kopia `VACUUM INTO` przed każdą próbą, każda migracja we własnej transakcji, `PRAGMA foreign_keys` przed BEGIN, plik ratunkowy przed migracją v6, testy na zamrożonych bazach buildów 1014 i 1021 (D-231).
- Parsowanie z `unknown` dla kopii, sesji, planów, wpisów zakwasu i wyborów; nieczytelny wiersz trafia do pliku ratunkowego, zamiast znikać; nieczytelnej wartości nie wolno nadpisać bez pliku ratunkowego (D-270).
- Testy zapisu na prawdziwym SQLite przez adapter, który odwzorowuje znane zachowanie expo-sqlite (ROLLBACK, wyłączone klucze obce).
- Dyscyplina „testy przed kodem” (10/10, czerwone logi w `docs/p9b-dowody/`) i zmiany asercji tylko z ID decyzji.

## Decyzje dla właściciela
1. **Kolejka zapisów (08-programista-001):** (a) jedna kolejka w warstwie danych dla wszystkich zapisów — rekomendacja; (b) tylko blokady przycisków; (c) zostawić jako znane ryzyko brzegowe (jak D-273). Kompromis (a): zapisy idą po kolei, opóźnienie rzędu milisekund, zmiana w jednym module.
2. **Zakresy pól receptury (08-programista-004):** (b) w 1.0 import przyjmuje zakresy arkusza — rekomendacja; (a) jeden moduł z wartościami potwierdzonymi przez rolę 06 jako zadanie po 1.0. Wartości graniczne są merytoryczne, więc ostatecznie rozstrzyga je hierarchia źródeł, a nie właściciel.
3. **Widok tygodnia (08-programista-002):** (a) widok „bieżący”, dopóki użytkownik nie przesunie — rekomendacja; (b) powrót do dziś przy każdej zmianie dnia.
4. **Import receptury z błędną wartością (08-programista-003, część 3):** (a) błąd z nazwą pola — rekomendacja; (b) wartości w podglądzie bez błędu.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 08-programista --tryb fix --zadania 08-programista-001,08-programista-002,08-programista-003,08-programista-004,08-programista-006,08-programista-007`

08-programista-005 wykonuje partia E2E-95 według D-280. 08-programista-008 proponuję po 1.0.

Wynik `git status --porcelain` (repo, na końcu pracy): pusty, kod 0 (pliki śledzone nietknięte; katalog `audit/` jest w `.git/info/exclude`; sondy w worktree w scratchpadzie, usuniętym po pracy).
