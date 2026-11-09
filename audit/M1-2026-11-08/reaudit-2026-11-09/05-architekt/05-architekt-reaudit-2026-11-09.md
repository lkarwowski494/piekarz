# Reaudyt: Architekt systemu — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit (pętla 1, baza 2ef8870a) · Grupa A (05-architekt, 12-niezawodnosc, 08-programista; wyjątek nazwany KO-006) · Środowisko: Linux 6.18 x86_64, Node v22.23.4, `node_modules` z `npm ci`; Jest z adapterem `node:sqlite` działa; brak Xcode i symulatora (zachowanie na telefonie: nie sprawdzono); `gh` działa (stan CI odczytany 2026-11-09). Sondy kodu w `git worktree` w scratchpadzie (`--detach ea249c9c`), wyniki tylko jako `.txt` w `dowody/`.

## Podsumowanie
Kolejka zapisów (M1-audytor-generalny-001) działa: na prawdziwym SQLite nieudany import przy równoległym zapisie wraca w całości, a zapisy obok nie giną; mutacja „bez kolejki” czerwieni 3 z 4 testów akceptacyjnych. Test „Usuń wszystkie dane” nie ma wymuszonego błędu i przechodzi także bez kolejki; własna sonda z błędem w środku czyszczenia potwierdza atomowość (liczności przed = po). Runner przebudowy (019), granica domeny (020), uzgadnianie po starcie (022), sesje w kopii przed czyszczeniem (023) i dokumenty (024) zweryfikowane. Regresja przy 021/023: nowe cykle importów wartości przez `lib/backup.ts` ↔ `src/data` (05-architekt-601, P3 teoretyczny wg D-288); test granic sprawdza tylko cykle złożone wyłącznie z plików `data/`. M2-koordynator-napraw-004 potwierdzone sondą (P3).

| ID | M1 | Wynik | Dowód (skrót) |
|---|---|---|---|
| 05-architekt-001 | M1-audytor-generalny-001 | zweryfikowane | `src/data/sqlite-schema.ts:112` „dbInstance = zKolejka(db);”; testy kod 0 (`dowody/jest-testy-akceptacyjne-grupa-A.txt`); mutacja bez kolejki: 3 z 4 czerwone, sonda czyszczenia z błędem: przed = po (`dowody/sonda-001-kolejka.txt`) |
| 05-architekt-502 | M1-audytor-generalny-001 | zweryfikowane | jak wyżej; `src/data/kolejka-zapisow.ts:42` „wKolejce(() => cel.withTransactionAsync(() => task(cel)))” |
| 05-architekt-501 | M1-audytor-generalny-002 | zweryfikowane | UPSERT bez `last_fed_at`: `src/data/starter-entries-store.ts:19`; test 002 kod 0 (3 przypadki z testu akceptacyjnego) |
| 05-architekt-002 | M1-audytor-generalny-019 | zweryfikowane | `src/data/runner-migracji.ts:45` „if (m.przebudowa) await db.execAsync('PRAGMA foreign_keys = OFF;');”, `foreign_key_check` przed COMMIT (`:49`); test 019: 5 wpisów przed = po, `foreign_keys` = 1 |
| 05-architekt-003 | M1-audytor-generalny-020 | zweryfikowane | `granice.mjs src core 20`: 0 wierszy DOMENA (było 8 na 2ef8870a) — `dowody/granice-src.txt`, `dowody/granice-src-2ef8870a.txt` |
| 05-architekt-506 | M1-audytor-generalny-020 | zweryfikowane | jak wyżej |
| 05-architekt-004 | M1-audytor-generalny-021 | zweryfikowane (cykl v6) + regresja 05-architekt-601 | cykl `migracja-v6 → bake-session-store` zniknął; migracja używa zamrożonego parsera (`migracja-v6-parser.ts`); nowe cykle przez `lib/backup.ts` |
| 05-architekt-507 | M1-audytor-generalny-021 | regresja (05-architekt-601) | „granice.mjs src bez wierszy CYKL” niespełnione: 4 cykle z `src/data` (`dowody/granice-src.txt`) |
| 05-architekt-503 | M1-audytor-generalny-022 | zweryfikowane | `app/_layout.tsx:93` „poStarcieBazy().then((stan) => (stan === 'ok' ? resyncNotifications() : undefined))”; test 022 (k = 0…40) kod 0 |
| 05-architekt-504 | M1-audytor-generalny-023 | zweryfikowane (DEC-11 a) | `src/data/usun-wszystko.ts:19` „const bakeSessions = await czytajSesjeDoKopii(await getDb());”; import: `src/data/sqlite-store.ts:312`; test 023 kod 0 |
| 05-architekt-505 | M1-audytor-generalny-024 | zweryfikowane | ADR-005 „zastąpiona”, ADR-009/010; test `tests/architektura-dokumenty-024.test.ts` kod 0 |
| 05-architekt-601 | (nowe) | regresja, P3 | sekcja Znaleziska |

Znaleziska M2 przypisane tej roli (D-288, bez nowego numeru):

| Znalezisko M2 | Wynik na ea249c9c | Poziom wg D-288 | Dowód |
|---|---|---|---|
| M2-koordynator-napraw-004 | potwierdzone (obie części) | P3, klasa: teoretyczny (backlog 1.0.1) | sonda: błąd `PRAGMA foreign_keys = ON` w `finally` daje zwykły `Error`, nie `MigrationError` (`dowody/sonda-m2-004-runner.txt`); `src/data/storage-status.ts:116` nowy słuchacz przy każdym wywołaniu |

Poza zadaniami grupy A (właściciel w planie: 07-jakosc, M1-audytor-generalny-066, grupa E): 05-architekt-005 i 05-architekt-509 (czerwony iOS E2E) — nie oceniam; stan CI z dnia w `dowody/ci-stan.txt`: iOS E2E na 6a412c9a zielony, na ea249c9c w toku; TZ Matrix na 6a412c9a czerwony przez `tests/dziennik-wydan-tagi-079.test.ts` (zasada 21, do roli 07/10). 05-architekt-508: odrzucone (D-273), bez zmian.

Liczby: zweryfikowane 10, nadal otwarte 0, regresja 1 (507 → 601; 004 zweryfikowane w części cyklu v6), istniało wcześniej 0.

## Linia bazowa i założenia
- Krytyczne dane: dziennik zakwasu, Dziennik wypieków, receptury własne, trwające i zaplanowane wypieki (`bake_sessions`), spiżarnia, kopie JSON i kopie bazy przed migracją. Ścieżki utraty danych sprawdzone w tej pętli: zapis równoległy (kolejka), przebudowa tabeli w runnerze, czyszczenie, import kopii, import pakietu awaryjnego (rola 12, `12-niezawodnosc-601`).
- Wymiary pokrycia: zapis i transakcje — sprawdzone (sondy); migracje — runner sprawdzony testem i sondą; kopie — `VACUUM INTO` przed migracją z `integrity_check` kopii (rola 12, 033); tło i 0xdead10cc — tylko dokumenty (024), bez pomiaru na urządzeniu; prywatność, pakiety treści, budżety — poza zakresem pętli (bez zmian w kodzie od 2ef8870a w tych obszarach).
- Założenie: adapter testów (`src/data/__tests__/helpers/node-sqlite-adapter.ts`) odwzorowuje `withTransactionAsync` expo-sqlite 57.0.4 (BEGIN, zadanie, COMMIT, ROLLBACK przy każdym błędzie); porównałem z `node_modules/expo-sqlite/src/SQLiteDatabase.ts:141-149`.

## Pokrycie (co sprawdzono, czego nie)
| Obszar / pliki | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| `src/data/kolejka-zapisow.ts`, wszystkie `withTransactionAsync` w `src` i `app` | tak | odczyt każdej treści transakcji i wołanych funkcji (bez zapisu przez kolejkę w treści — brak zakleszczenia); mutacja i sonda (`dowody/sonda-001-kolejka.txt`) |
| `src/data/runner-migracji.ts` | tak | test 019; sonda M2-004 (`dowody/sonda-m2-004-runner.txt`) |
| Granice modułów `src` | tak | `dowody/granice-src.txt`, `dowody/granice-src-2ef8870a.txt` |
| `app/_layout.tsx`, `src/data/storage-status.ts` (022) | tak | test 022; odczyt `uzgadniajZDostepem` (słuchacz stanu dostępu nie woła się przy subskrypcji, `src/lib/platnosci/stan.ts:34-39`) |
| `src/data/usun-wszystko.ts`, `src/data/sesje-kopii.ts`, `src/lib/backup.ts` (023) | tak | test 023 |
| ADR-001/003/005/009/010, `docs/system-architecture.md` (024) | tak | test 024, odczyt nagłówka ADR-005 |
| Zachowanie na telefonie, 0xdead10cc, pomiar czasu | nie | brak urządzenia i Xcode |

Testy akceptacyjne grupy A: `npx jest --ci` na 20 plikach — 20 zestawów, 89 testów, kod 0 (`dowody/jest-testy-akceptacyjne-grupa-A.txt`). Pełny Jest raz na grupę: `../08-programista/dowody/npm-test-pelny.txt` (raport roli 08).

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <raport> /home/user/piekarz audit/M1-2026-11-08/reaudit-2026-11-09/05-architekt --rola 05-architekt`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 05-architekt
```
(kod 0)

`git status --porcelain` po pracy (katalog K jest w `.git/info/exclude`): pusty wynik — pliki śledzone nietknięte; worktree sond tylko w scratchpadzie.

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| ARCH-02 | dotyczy | ok dla dokarmienia (jedna droga: dziennik, 501 zweryfikowane) |
| ARCH-03 | dotyczy | ok (0 wierszy DOMENA) |
| ARCH-04 | dotyczy | znalezisko 05-architekt-601 (P3) |
| ARCH-06 | dotyczy | ok: `src/data/sqlite-schema.ts:111` pragma po otwarciu, poza transakcją; proxy nie zmienia połączenia |
| ARCH-07 | dotyczy (próbka regresji spoza zmian) | ok: jedyny `REFERENCES` to `starter_entries → starters` (`src/data/sqlite-schema.ts:282`); zakwas zapisywany UPSERT-em; `INSERT OR REPLACE` tylko na tabelach-liściach (recipes, flour_inventory, lesson_progress, app_settings) |
| ARCH-08 | dotyczy | ok (019); resztka M2-004 jako P3 |
| ARCH-09 | dotyczy | ok: testy migracji 1014/1021 kod 0 |
| ARCH-10 | dotyczy | ok (023: kopia przed czyszczeniem z sesjami) |
| ARCH-11 | dotyczy | ok w zakresie importu kopii; import pakietu: patrz 12-niezawodnosc-601 |
| ARCH-12 | dotyczy | ok (001/502 zweryfikowane) |
| ARCH-13 | dotyczy (próbka regresji spoza zmian) | nie sprawdzono na urządzeniu; w kodzie transakcja końca wypieku nadal czeka na zapis pliku ratunkowego (`src/data/bake-sessions-store.ts:382`), stan jak w 2ef8870a — bez nowego zgłoszenia (Do sprawdzenia) |
| ARCH-21 | dotyczy (próbka regresji spoza zmian) | ok: `git ls-files` bez plików kluczy, `git grep` wzorców kluczy w `src`, `app` bez trafień (`../08-programista/dowody/dev03-dev14-grep.txt`) |
| ARCH-01, -05, -14…-20, -22 | dotyczy | nie sprawdzono w tej pętli: poza zakresem reaudytu (brak zmian i otwartych ID) |

## Znaleziska (szczegóły)

### 05-architekt-601 · Naprawa 023 wprowadziła cykle importów wartości między `lib/backup.ts` a warstwą danych, a test granic ich nie widzi
- Pozycja listy kontrolnej: ARCH-04
- Poziom: P3 (poziom_audytu P2; D-288: nowe P2 → P3, backlog 1.0.1)   · klasa: teoretyczny
- Realność: teoretyczny   · Pewność: wysoka
- Rodzaj: D
- Dowód: `dowody/granice-src.txt` (kod 1): „CYKL data/sqlite-schema.ts -> data/runner-migracji.ts -> data/kopie-przed-migracja.ts -> lib/backup.ts -> data/sesje-kopii.ts -> data/sqlite-schema.ts” oraz „CYKL lib/backup.ts -> data/sesje-kopii.ts -> data/bake-sessions-store.ts -> data/uszkodzone-wiersze.ts -> lib/backup.ts”; na 2ef8870a tych cykli nie było (`dowody/granice-src-2ef8870a.txt`). Krawędzie wartości: `src/lib/backup.ts:10` „import { parseSesjeKopii } from '../data/sesje-kopii';”, `src/data/sesje-kopii.ts:16` „import { memStore } from './sqlite-schema';”, `src/data/kopie-przed-migracja.ts:14` „import { PRE_MIGRATION_BACKUP_NAME } from '../lib/backup';”. Test granic odrzuca tylko cykle złożone z samych plików `data/`: `tests/granice-modulow.test.ts:66` „every((n) => n.startsWith('data/'))”.
- Mechanizm: parser pola `bakeSessions` (023) siedzi w `src/data`, a woła go `lib/backup.ts`, który sam jest importowany przez warstwę danych; 3 nowe cykle przez `lib/backup.ts`. Dziś bez skutku: stałe z cyklu są czytane w funkcjach, nie przy ładowaniu modułu (`src/data/uszkodzone-wiersze.ts:59`).
- Powraca: tak — 05-architekt-004/507 (cykl schemat ↔ sesje ↔ migracja v6) → trwała kontrola: test granic na cyklach przechodzących przez `src/data`, nie tylko złożonych z `data/`.
- Wzorzec lub źródło: zasada architekta 7 („Małe moduły bez cykli”); test akceptacyjny 05-architekt-507 („granice.mjs src bez wierszy CYKL dla importów wartości”).
- Kroki w aplikacji: brak; ryzyko `undefined` przy zmianie kolejności importów albo użyciu stałej na poziomie modułu.
- Opcje: (a) `parseSesjeKopii` i stałe ścieżek kopii (`AUTO_DIR`, `RESCUE_DIR`, `PRE_MIGRATION_BACKUP_NAME`, `stampOf`) w module bez importów aplikacji (np. `src/lib/sciezki-kopii.ts`), test granic bez filtra „tylko data/” — kompromis: kilka importów do przepięcia; (b) zostawić i zawęzić test akceptacyjny do cykli z samych `data/` — kompromis: cykl przez `lib` wraca bez sygnału. Rekomendacja: (a) w 1.0.1.
- Test akceptacyjny: `granice.mjs src core 20` bez wierszy CYKL zawierających `data/` (poza cyklem przerwanym leniwym `require` w `lib/i18n.ts`, jeśli zostaje z decyzją); `tests/granice-modulow.test.ts` pada na dzisiejszym kodzie.
- Status: otwarte

## Klasyfikacja znalezisk M2 (D-288)
**M2-koordynator-napraw-004 — potwierdzone na ea249c9c, P3 (klasa: teoretyczny).**
- Część runnera: `src/data/runner-migracji.ts:64` „if (m.przebudowa) await db.execAsync('PRAGMA foreign_keys = ON;');” w `finally`; sonda z atrapą połączenia (migracja z `przebudowa: true`, której `run` rzuca, i pragma ON, która rzuca) kończy się błędem „pragma ON nieudane” zamiast `MigrationError` (`dowody/sonda-m2-004-runner.txt`, kod 0). Skutek: `initDatabase` idzie gałęzią „inny błąd” (surowe kopie, zamknięcie połączenia, ekran błędu z pakietem) zamiast ekranu błędu migracji z kopią `.db`; dane zostają (transakcja wycofana, kopia przed migracją jest). `ROLLBACK` połykany: `src/data/runner-migracji.ts:61` „await db.execAsync('ROLLBACK;').catch(() => {});” — gdy ROLLBACK zawiedzie przy otwartej transakcji, pragma ON w transakcji nic nie robi i połączenie zostaje z wyłączonymi kluczami do restartu (aplikacja i tak jest na ekranie błędu). Dziś nie ma migracji z `przebudowa: true`.
- Część `poStarcieBazy`: `src/data/storage-status.ts:116` dodaje słuchacza przy każdym wywołaniu w stanie „initializing”; przy starcie, który nie wychodzi z tego stanu, obietnice nie spełniają się. Bez wpływu na dane.
- Test akceptacyjny z M2 bez zmian.

## Do sprawdzenia (pewność ≤ 80%)
- **Odczyty poza kolejką widzą niezatwierdzony stan cudzej transakcji** (świadomy kompromis, `src/data/kolejka-zapisow.ts:7`). `safetyBackup` przed importem i czyszczeniem czyta tabele bez transakcji odczytu; gdy w tym czasie trwa inna transakcja, która potem się wycofa, kopia bezpieczeństwa może mieć stan pośredni, a import zastąpi dane. Wymaga dwóch operacji w tym samym oknie i błędu jednej z nich — teoretyczne; nie odtwarzałem.
- **Okno między kopią bezpieczeństwa a transakcją importu/czyszczenia.** Zapis, który zmieści się między `safetyBackup` a transakcją (`src/data/usun-wszystko.ts:19-28`), nie trafia do kopii, a operacja go usuwa. Użytkownik i tak usuwa albo zastępuje dane — teoretyczne.
- **ARCH-13**: transakcja końca wypieku czeka na zapis pliku ratunkowego (`src/data/bake-sessions-store.ts:382`), a z kolejką każdy zapis czeka na tę transakcję; czas na najstarszym iPhonie i raporty `0xdead10cc` z TestFlight — krok właściciela (jak w raporcie 2026-11-08).

## Co działa dobrze i należy zachować
- Kolejka jako jedna warstwa (`zKolejka`) przy jednym połączeniu z kluczami obcymi i statyczna kontrola „w treści transakcji tylko `tx`” (`tests/kolejka-zapisow-tx.test.ts`).
- Runner z flagą `przebudowa`, `foreign_key_check` przed COMMIT i testem liczności dziennika.
- Kopia przed migracją sprawdzana `integrity_check` na kopii roboczej (sprawdzana kopia nietknięta).

## Decyzje dla właściciela
1. 05-architekt-601 (P3): (a) moduł stałych i parserów kopii bez importów aplikacji + test granic na cyklach przez `src/data` — ok. 1 h roli 08; (b) bez zmian do 1.0.1. Rekomendacja: (a) w 1.0.1.
2. Test „Usuń wszystkie dane” w `kolejka-zapisow-001` bez wymuszonego błędu (przechodzi bez kolejki): (a) dopisać przypadek z błędem w środku czyszczenia (jak sonda w `dowody/sonda-001-kolejka.txt`) — 15 min roli 07; (b) bez zmian. Rekomendacja: (a), bo test akceptacyjny 001 wymaga „wymuszonego błędu” dla czyszczenia.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 08-programista --tryb fix --zadania 05-architekt-601` (1.0.1); test czyszczenia z błędem: rola 07.
