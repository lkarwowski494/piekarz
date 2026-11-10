# Reaudyt: Niezawodność — Piekarz — 2026-11-10
Commit: 1c723632 · Tryb: reaudit (pętla 2, ostatnia; baza ea249c9c) · Grupa G1 (12-niezawodnosc, 05-architekt; wyjątek nazwany KO-013: dwie role w jednym kontekście) · Środowisko: Linux 6.18 x86_64, Node v22.23.4, `node_modules` z `npm ci` w kopii roboczej; Jest z adapterem `node:sqlite` (prawdziwy SQLite) działa; brak Xcode i symulatora (zachowanie na telefonie: nie sprawdzono). Sondy kodu w `git worktree` w scratchpadzie (usunięte po pracy); pełnego `npm test` i `npm run verify` nie uruchamiano (robi to G4).

## Podsumowanie
Import pakietu plików bazy z trybu awaryjnego przywraca teraz trwające i zaplanowane wypieki: test akceptacyjny przechodzi na 1c723632 (kod 0) i pada na ea249c9c z właściwego powodu (`bake_sessions` 0 zamiast 2). Sonda na prawdziwym SQLite z 12 przypadkami brzegowymi nie pokazała utraty danych telefonu: import jest atomowy (błąd zapisu sesji w środku wycofuje całość, liczności przed = po), pakiet z nowszej wersji jest odrzucony bez zmian, wiersz telefonu o tym samym id wygrywa, a pakiet starszy (v5, sesja w `app_settings`) oddaje sesję po migracji kopii. Jedna luka komunikatu, brzegowa: sesje z pakietu, które nie mieszczą się w limicie (2 trwające, 5 zaplanowanych), są pomijane bez liczenia i bez komunikatu (12-niezawodnosc-701, P3). Otwartych P0/P1 w zakresie grupy nie ma, więc STOP zbieżności (D-043) nie dotyczy.

| ID | M1 | Wynik | Dowód (skrót) |
|---|---|---|---|
| 12-niezawodnosc-601 | M1-audytor-generalny-087 | zweryfikowane | odczyt pakietu niesie sesje: `src/data/dane-z-bazy.ts:29` „const bakeSessions = await czytajSesjeDoKopii(db);”; test akceptacyjny kod 0 na 1c723632 (`dowody/jest-087-akceptacyjny-1c723632.txt`), kod 1 na ea249c9c (`dowody/jest-087-akceptacyjny-ea249c9c.txt`); sonda brzegowa kod 0 (`dowody/sonda-087-brzegowe.txt`) |
| 12-niezawodnosc-701 | (nowe) | nowe, P3 (klasa: brzegowy); mechanizm limitu istniał w ea249c9c dla ścieżki 023 | sekcja Znaleziska; sonda S4 i S12 (`dowody/sonda-087-brzegowe.txt`) |

Liczby: zweryfikowane 1, nadal otwarte 0, regresja 0, istniało wcześniej 0; nowe 1 (701, P3). Stan bez weryfikacji naprawy: M1-audytor-generalny-032 (niżej).

### Test akceptacyjny 087 wprost
- Istnieje: `src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx:177` (przypadek o trwającym i zaplanowanym wypieku po „Zastąp dane”).
- Sprawdza to, co mówi tytuł: pakiet z bazy 1021 (2 sesje: active, planned) zbudowany funkcją ekranu awaryjnego, import przez arkusz „Importuj z pliku” i przycisk `confirm-import-btn`, potem liczności z pliku bazy aplikacji czytane surowym połączeniem: `src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx:209` „expect(counts()).toEqual(expect.objectContaining({ bakes: 4, starters: 2, bake_sessions: 2 }));” oraz równość całych wierszy z wierszami pakietu (linia 211 tego pliku).
- Przechodzi na 1c723632: 2 pliki, 11 testów, kod 0 (`dowody/jest-087-akceptacyjny-1c723632.txt`).
- Pada na kodzie sprzed poprawki: worktree sondy na ea249c9c z plikiem testu z 1c723632 — 1 czerwony (ten przypadek: `bake_sessions` 0 zamiast 2), 7 zielonych, kod 1 (`dowody/jest-087-akceptacyjny-ea249c9c.txt`). Powód właściwy: w ea249c9c `zbierzDaneZBazy` zwracał stan bez pola sesji.

### Sonda brzegowa na prawdziwym SQLite (liczności przed → po; `dowody/sonda-087-brzegowe.txt`, 12 przypadków, kod 0)
| Przypadek | Sesje w pakiecie | `bake_sessions` w telefonie przed → po | Wynik |
|---|---|---|---|
| S1 wzorzec, import dwa razy | 2 | 0 → 2 (po drugim imporcie nadal 2) | wiersze identyczne z pakietem; 2 kopie przed importem |
| S2 urwany JSON trwającej sesji | 2 (1 nieczytelna) | 0 → 1 | pominięta i policzona (`skippedRows` 1, komunikat o pominiętych wpisach); surowa treść zostaje w pliku pakietu |
| S3 sesja z recepturą, której nie ma | 2 | 0 → 2 | wraca bez zmian |
| S4 telefon na limicie (2 + 5) | 2 | 7 → 7 | sesje telefonu nietknięte; sesje pakietu pominięte, `skippedRows` 0 → 12-niezawodnosc-701 |
| S5 to samo id w telefonie | 2 | 1 → 2 | wiersz telefonu zostaje (inna treść niż w pakiecie), druga sesja dopisana |
| S6 sesja o id wpisu Dziennika | 2 | 0 → 1 | wypiek z wpisem w Dzienniku nie wraca jako trwający (reguła 023) |
| S7 błąd zapisu sesji w środku importu | 2 | 0 → 0 | `StorageWriteError`; wszystkie liczności przed = po (bakes 1 → 1, starters 0 → 0); kopia przed importem jest |
| S8 zły typ kolumny wiersza sesji | 2 | 0 → 1 | wiersz trafia do pliku `uszkodzone-wiersze-*` aplikacji (znane: M2-koordynator-napraw-003), `skippedRows` 0 |
| S9 pakiet starszy (1014, v5) | 0 (sesja w `app_settings`) | 0 → 1 | migracja kopii przenosi sesję, import ją dopisuje; plik `sesja-przed-migracja-*` w katalogu ratunkowym aplikacji (znane: M2-koordynator-napraw-003) |
| S10 pakiet 1014 z uszkodzoną sesją | 0 | 0 → 0 | reszta danych wraca (bakes 1 → 3); surowa sesja w pliku ratunkowym |
| S11 pakiet nowszy (`user_version` 99) | 2 | 0 → 0 | „nowsza”, bez kopii przed importem, liczności przed = po |
| S12 pakiet ponad limit (3 + 6) | 9 | 0 → 7 | 2 trwające i 5 zaplanowanych wraca, 2 pominięte bez liczenia → 12-niezawodnosc-701 (stan nieosiągalny zapisem aplikacji) |

### Stan M1-audytor-generalny-032 (dSYM; bez weryfikacji naprawy)
Bez zmian w repo od ea249c9c: `git diff --stat ea249c9c..1c723632` dla `ios`, `plugins`, `app.json`, `eas.json`, `.github`, `fastlane`, `scripts`, `package.json`, `docs/niezawodnosc` jest pusty, a `git log --grep=032` w tym zakresie nie zwraca commitów (`dowody/probka-regresji-grep.txt`). Stan zastany: workflow ma `uploadSymbols` w `.github/workflows/testflight.yml:296`, opis w `docs/wydanie/symbolizacja-awarii.md`. Zadanie zostaje otwarte; blokada: build TestFlight to krok właściciela.

### Próbka regresji (pliki zmienione od ea249c9c w obszarze roli i pozycje spoza nich)
| Pozycja | Zakres | Wynik | Dowód |
|---|---|---|---|
| NIE-03 | zmienione: `src/data/dane-z-bazy.ts`, 2 pliki testów | ok: przywrócenie pakietu nie nadpisuje danych przy błędzie (S7), wersja nowsza odrzucona (S11), kopia bieżących danych przed importem (S1–S10) | `dowody/sonda-087-brzegowe.txt`; `src/lib/import-z-pliku.ts:92` „await safetyBackup('import', await collectBackupData());” |
| NIE-02 | spoza zmienionych plików | ok: jedyny `VACUUM` to `VACUUM INTO` kopii przed migracją; brak `REINDEX` i `deleteDatabase` | `dowody/probka-regresji-grep.txt`; `src/data/kopie-przed-migracja.ts:46` |
| NIE-07 | spoza zmienionych plików | ok: brak SDK awarii i analityki w `package.json` (grep kod 1) | `dowody/probka-regresji-grep.txt` |
| NIE-10 | spoza zmienionych plików | nie dotyczy: brak `expo-updates` w `package.json` | `dowody/probka-regresji-grep.txt` |
| NIE-05 | spoza zmienionych plików | ok w zakresie testów ekranów ratunku (ostrzeżenie, kontakt): 3 przypadki zielone w pliku testu 003 | `dowody/jest-087-akceptacyjny-1c723632.txt` |

Inne zmiany od ea249c9c (ekran prowadzenia, plan brioszki, słowniki) nie dotykają ścieżek ratunku, kopii ani migracji (`git diff --stat ea249c9c..1c723632 -- src/data src/lib` poza słownikami: `src/data/dane-z-bazy.ts`, `src/lib/pieczenie-planu.ts`, `src/lib/plan-receptury.ts`). Pozostałe pozycje listy (NIE-01, -04, -06, -08, -09, -11, -12, -13, -14): nie sprawdzano w tej pętli (zakres reaudytu: zadanie grupy i próbka); stan z raportu `12-niezawodnosc-reaudit-2026-11-09.md`.

Weryfikacja przeciwna 601: szukałem drogi, na której sesje z pakietu nadal giną po poprawce. (1) Pole przechodzi przez `buildBackup` i `parseAndValidateBackup` (S1: `poleBakeSessions` 2 z 2). (2) Wstawienie jest w tej samej transakcji co reszta importu: `src/data/sqlite-store.ts:312` „if (data.bakeSessions) await wstawSesjeZKopii(tx, data.bakeSessions);”. (3) Eksport i kopie nie zyskały pola (D-102 bez zmian; test `odczyt-z-polaczenia-003` to pilnuje), bo jedyny wywołujący `zbierzDaneZBazy` to `src/lib/import-pakietu.ts:78`. Zostają dwie ciche ścieżki pominięcia: limit (701) i zły typ kolumny (S8, dane w pliku ratunkowym; M2-koordynator-napraw-003).

## Znaleziska (szczegóły)

### 12-niezawodnosc-701 · Import pakietu (i kopii przed czyszczeniem) pomija wypieki ponad limit bez komunikatu: „Dane z kopii są w aplikacji”, a trwający wypiek z pliku nie wrócił
- Pozycja listy kontrolnej: NIE-03
- Poziom: P3 (z P2 według D-288; klasa: brzegowy; backlog 1.0.1). Nie jest wyjątkiem danych z D-288: dane telefonu nie giną, a pominięte wiersze zostają w pliku pakietu.
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P (decyzja produktowa)
- Dowód: sonda S4 (`dowody/sonda-087-brzegowe.txt`, kod 0): telefon z 2 trwającymi i 5 zaplanowanymi, pakiet z 2 sesjami → `bake_sessions` 7 → 7, `skippedRows` 0, `blad` null. Warunek limitu: `src/data/sesje-kopii.ts:59` „(SELECT count(*) FROM bake_sessions WHERE status = ? AND json_valid(session_json)) < ?”. Komunikat po imporcie zależy tylko od `skippedRows`: `src/components/settings/ImportZPlikuArkusz.tsx:96`.
- Mechanizm: `wstawSesjeZKopii` wstawia wiersz tylko przy wolnym miejscu w limicie i nie zwraca liczby pominiętych; `skippedRows` liczy tylko wiersze nieczytelne przy parsowaniu. `grep -n "skipped" src/data/sesje-kopii.ts` → trafienia tylko w `parseSesjeKopii`.
- Powraca: nie. Reguła limitu jest w ea249c9c (`git show ea249c9c:src/data/sesje-kopii.ts`, linie 59–68) dla kopii przed czyszczeniem (023); poprawka 087 rozszerzyła ją na import pakietu. Przed poprawką z pakietu nie wracała żadna sesja, więc to nie regresja.
- Wzorzec lub źródło: zasada wspólna 10 (zero utraty danych) i polityka błędów roli 05 („nigdy cicho”); komentarz modułu: wiersz pominięty przez limit zostaje w pliku kopii.
- Kroki w aplikacji: awaria → zapis pakietu z ekranu awaryjnego → ponowna instalacja → użytkownik zaczyna 2 nowe wypieki → Ustawienia → „Importuj z pliku” → pakiet → „Zastąp dane” → komunikat o powodzeniu; trwający wypiek z pakietu nie pojawia się na Stolnicy.
- Opcje: (a) `wstawSesjeZKopii` zwraca liczbę pominiętych przez limit i id z Dziennika, a komunikat po imporcie podaje ją osobnym zdaniem (tekst: rola 04, 35 języków) — kompromis: nowy tekst i przekłady; (b) bez zmian, z opisem w `docs/` że pominięte wypieki zostają w pliku — kompromis: użytkownik nie wie, że czegoś brakuje; (c) import ponad limit dopuszczony — kompromis: łamie D-092 (limity wypieków). Rekomendacja: (a) w 1.0.1.
- Test akceptacyjny: import pakietu z 2 sesjami na telefon z 2 trwającymi i 5 zaplanowanymi → komunikat po imporcie podaje liczbę wypieków, które nie wróciły; liczności telefonu bez zmian.
- Status: otwarte

## Kontrola dowodów i sekretów
- `git status --porcelain` w kopii roboczej badanego commitu (HEAD 1c7236327901e7b693d1934775ecd8bebcd8b865): pusty; pliki śledzone w `/home/user/piekarz`: bez zmian (`dowody/git-status.txt`). Worktree sond (`G1-sonda`, `G1-sonda-head`) usunięte.
- Treść repo traktowana jako dane; poleceń w treści nie znaleziono w przeczytanych plikach.
- Niezależność (D-015): czytane tylko diff i komunikat commitu bb162ddf, kod, testy, tytuły i ID znanych znalezisk oraz poprzedni raport roli.
- Nie sprawdzono: zachowanie na telefonie (brak symulatora); stan CI na GitHub; pełny zestaw testów (G4); powiadomienia dla przywróconego, starego trwającego wypieku (kompromis opcji (a) z poprzedniego raportu, poza testem akceptacyjnym).
- Wynik `node K/narzedzia/sprawdz-raport.mjs <raport> WT R/12-niezawodnosc --rola 12-niezawodnosc`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 12-niezawodnosc
kod 0
```
