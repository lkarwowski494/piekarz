# Reaudyt: Architekt systemu — Piekarz — 2026-11-10
Commit: 1c723632 · Tryb: reaudit (pętla 2, ostatnia; baza ea249c9c) · Grupa G1 (12-niezawodnosc, 05-architekt; wyjątek nazwany KO-013: dwie role w jednym kontekście) · Środowisko: Linux 6.18 x86_64, Node v22.23.4, `node_modules` z `npm ci` w kopii roboczej; Jest z adapterem `node:sqlite` (prawdziwy SQLite) działa; brak Xcode i symulatora. Sondy kodu w `git worktree` w scratchpadzie (usunięte po pracy); pełnego `npm test` i `npm run verify` nie uruchamiano (robi to G4).

## Podsumowanie
Rola 05 nie ma w tej pętli własnego ID źródłowego; sprawdza zadanie M1-audytor-generalny-087 od strony architektury danych (import, atomowość, jedna ścieżka zapisu) i próbkę regresji. Poprawka to jedna linia odczytu w `src/data/dane-z-bazy.ts` i ponowne użycie mechanizmu 023 (`czytajSesjeDoKopii`, `wstawSesjeZKopii`): nie dodaje drugiej ścieżki zapisu sesji, nie zmienia formatu eksportu ani kopii (D-102) i nie zmienia schematu. Na prawdziwym SQLite import pakietu pozostaje atomowy, a zwykły import JSON, kopia przed importem, „Usuń wszystkie dane”, kolejka zapisów i odrzucenie nowszej bazy działają jak w ea249c9c (16 plików testów, 100 testów, kod 0). Nowych znalezisk roli 05 nie ma; luka komunikatu o limicie jest u roli 12 (patrz 12-niezawodnosc-701, P3).

| Zadanie / pozycja | Wynik | Dowód (skrót) |
|---|---|---|
| M1-audytor-generalny-087 (ID źródłowe 12-niezawodnosc-601; widok roli 05: ARCH-11, ARCH-12, ARCH-02) | zweryfikowane | `src/data/dane-z-bazy.ts:29` „const bakeSessions = await czytajSesjeDoKopii(db);”; test akceptacyjny kod 0 na 1c723632 (`dowody/jest-087-akceptacyjny-1c723632.txt`), kod 1 na ea249c9c (`dowody/jest-087-akceptacyjny-ea249c9c.txt`); sonda 12 przypadków kod 0 (`dowody/sonda-087-brzegowe.txt`) |
| Próbka regresji 087 (import JSON, kopia przed importem, atomowość, 023, wersje pakietu, uszkodzona sesja) | bez regresji | tabela niżej; `dowody/jest-probka-regresji-1c723632.txt` (kod 0) |
| M1-audytor-generalny-032 (dSYM) | stan: otwarte, bez zmian w repo od ea249c9c | `dowody/probka-regresji-grep.txt` (pusty `git diff --stat` dla konfiguracji buildu i CI) |

Liczby: zweryfikowane 1 (087, wspólne z rolą 12), nadal otwarte 0, regresja 0, istniało wcześniej 0; nowe znaleziska roli 05: 0.

### Test akceptacyjny 087 (widok roli 05)
- Test istnieje i idzie przez interfejs importu na prawdziwym SQLite (przypadek od linii 177 pliku testu); asercja liczności: `src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx:209` „expect(counts()).toEqual(expect.objectContaining({ bakes: 4, starters: 2, bake_sessions: 2 }));”.
- Na 1c723632: kod 0 (11 testów w 2 plikach). Na ea249c9c z tym samym plikiem testu: kod 1, czerwony tylko nowy przypadek, `bake_sessions` 0 zamiast 2.
- Drugi test pilnuje granicy D-102: `zbierzDaneZBazy` = `collectBackupData` plus sesje, a `collectBackupData` pola nie ma (`src/data/__tests__/odczyt-z-polaczenia-003.sqlite.test.ts`, kod 0).

### Próbka regresji poprawki 087 (pytania z pliku zadań)
| Pytanie | Wynik (liczności przed → po) | Dowód |
|---|---|---|
| Zwykły import kopii JSON | bez zmian: kopia bez pola nie rusza sesji telefonu; testy `restore`, `import-z-pliku-113`, `czyszczenie-sesje-023` (przypadek starej kopii bez pola) zielone | `dowody/jest-probka-regresji-1c723632.txt` |
| Kopia „przed importem” | powstaje przed każdym importem pakietu (S1: 2 importy → 2 kopie; S7: kopia jest mimo błędu importu); nadal bez sesji (D-102), a import sesji nie kasuje | `dowody/sonda-087-brzegowe.txt`; `src/lib/import-z-pliku.ts:92` „await safetyBackup('import', await collectBackupData());” |
| Atomowość importu (kolejka zapisów, M1-001) | S7: wymuszony błąd przy `INSERT INTO bake_sessions` → `StorageWriteError`, bakes 1 → 1, starters 0 → 0, `bake_sessions` 0 → 0; wstawienie sesji w tej samej transakcji co `DELETE` i zapisy; test `kolejka-zapisow-001` zielony | `src/data/sqlite-store.ts:312` „if (data.bakeSessions) await wstawSesjeZKopii(tx, data.bakeSessions);”; transakcja od linii 271 tego pliku |
| „Usuń wszystkie dane” (023) | bez zmian: testy `czyszczenie-sesje-023` (4 + 2 przypadki) i `usun-wszystkie-dane-124` zielone; `czytajSesjeDoKopii` ma dwóch wywołujących (czyszczenie, odczyt pakietu) | `dowody/jest-probka-regresji-1c723632.txt`; `src/data/usun-wszystko.ts:19` |
| Pakiet starszy | S9: pakiet v5 (build 1014, sesja w `app_settings`) → migracja kopii, `bake_sessions` 0 → 1, bakes 1 → 3; `migracja-d1-1014` zielony | `dowody/sonda-087-brzegowe.txt` |
| Pakiet nowszy | S11: `user_version` 99 → „nowsza”, liczności przed = po, bez kopii przed importem; `baza-nowsza` zielony | `src/lib/import-pakietu.ts:82` |
| Sesja z nieznaną recepturą | S3: wraca bez zmian (0 → 2); wiersz sesji niesie własny stan, klucza obcego do receptur nie ma | `dowody/sonda-087-brzegowe.txt` |
| Uszkodzony JSON sesji w pakiecie | S2: wiersz pominięty i policzony (`skippedRows` 1), reszta wraca (0 → 1); dane telefonu bez strat; surowa treść zostaje w pliku pakietu | `dowody/sonda-087-brzegowe.txt` |
| Zły typ kolumny sesji w pakiecie | S8: wiersz do pliku `uszkodzone-wiersze-*` aplikacji, nie do importu (0 → 1) — znane, patrz M2-koordynator-napraw-003 | `dowody/sonda-087-brzegowe.txt` |
| Telefon albo pakiet ponad limit | S4: 7 → 7, S12: 0 → 7; pominięcie bez komunikatu — patrz 12-niezawodnosc-701 (P3) | `dowody/sonda-087-brzegowe.txt` |

### Pozycje listy kontrolnej (zmienione pliki i próbka spoza nich)
| Pozycja | Zakres | Wynik | Dowód |
|---|---|---|---|
| ARCH-11 | zmienione (`src/data/dane-z-bazy.ts`) | ok: wersja sprawdzona przed zapisem, walidacja przez `parseAndValidateBackup`, jedna transakcja, kopia przed importem | wiersze wyżej |
| ARCH-12 | zmienione | ok: zapis sesji w transakcji importu na połączeniu z kolejką; brak `withExclusiveTransactionAsync` w kodzie produkcyjnym | `dowody/probka-regresji-grep.txt` |
| ARCH-02 | zmienione | ok: jeden mechanizm sesji w kopii (moduł `sesje-kopii`), ten sam dla 023 i pakietu; brak drugiej implementacji | `src/data/dane-z-bazy.ts:19` |
| ARCH-03, ARCH-04 | zmienione (nowy import `dane-z-bazy` → `sesje-kopii`) | ok: `tests/granice-modulow.test.ts` zielony; `check:size` 1499 plików, przekroczeń 0 (kod 0). Cykl w warstwie danych: znany, patrz M1-audytor-generalny-021 | `dowody/jest-probka-regresji-1c723632.txt`; `dowody/check-size.txt` |
| ARCH-06 | spoza zmienionych plików | ok: pragma po otwarciu połączenia | `src/data/sqlite-schema.ts:111` „await db.execAsync('PRAGMA foreign_keys = ON;');” |
| ARCH-07 | spoza zmienionych plików | ok: jedyna tabela z `REFERENCES` to dziennik zakwasu → `starters` (`src/data/sqlite-schema.ts:282`), a `starters` zapisuje UPSERT; `INSERT OR REPLACE` zostaje tylko na tabelach bez tabel podrzędnych (`recipes`, `flour_inventory`, `lesson_progress`, `app_settings`) — stan jak w ea249c9c | `dowody/probka-regresji-grep.txt` |
| ARCH-17 | zmienione (`wstawSesjeZKopii` użyte dla danych z pakietu) | ok: wartości z pakietu idą parametrami `?`; doklejany jest tylko stały fragment `WOLNE` z kodu | `src/data/sesje-kopii.ts:67` |
| ARCH-21 | spoza zmienionych plików | ok: `git ls-files` bez plików sekretów (grep kod 1); `EXPO_PUBLIC_` tylko numer buildu i znacznik E2E | `dowody/probka-regresji-grep.txt` |

Pozostałe pozycje (ARCH-01, -05, -08, -09, -10, -13 do -16, -18 do -20, -22): nie sprawdzano w tej pętli (zakres reaudytu: zadanie grupy i próbka); stan z raportu `05-architekt-reaudit-2026-11-09.md`. Pozostałe pliki zmienione od ea249c9c w `src/` to ekran prowadzenia, plan pieczenia i słowniki (role 04, 06, 09; inne grupy).

Uwaga architektoniczna bez znaleziska: po poprawce nazwa i komentarz `zbierzDaneZBazy` mówią wprost, że wynik różni się od `collectBackupData` o sesje, a test pilnuje tej różnicy; gdyby funkcję wywołał w przyszłości eksport, sesje trafiłyby do eksportu wbrew D-102 — kontrola: test `odczyt-z-polaczenia-003` plus grep wywołujących (dziś 1: `src/lib/import-pakietu.ts:78`).

## Kontrola dowodów i sekretów
- `git status --porcelain` w kopii roboczej badanego commitu (HEAD 1c7236327901e7b693d1934775ecd8bebcd8b865): pusty; pliki śledzone w `/home/user/piekarz`: bez zmian (`dowody/git-status.txt`). Worktree sond usunięte.
- Odtworzenia tylko w katalogach tymczasowych testów i w worktree sondy; żadnych danych z urządzenia.
- Niezależność (D-015): czytane tylko diff i komunikat commitu bb162ddf, kod, testy, tytuły i ID znanych znalezisk oraz poprzednie raporty ról 05 i 12 (nagłówek i tabela 05).
- Nie sprawdzono: zachowanie na telefonie; stan CI na GitHub; pełny zestaw testów i `tsc` (G4); `granice.mjs` z promptu roli (zastąpione testem repo `tests/granice-modulow.test.ts`, wyjątek nazwany).
- Wynik `node K/narzedzia/sprawdz-raport.mjs <raport> WT R/05-architekt --rola 05-architekt`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 05-architekt
kod 0
```
