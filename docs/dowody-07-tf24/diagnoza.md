# Diagnoza: czerwony build TestFlight #24 (rola 07, sesja F, 2026-11-10)

**Wejście:** workflow „Build & Upload to TestFlight (iOS)”, run 42793170293 (#24), job 129767054367 (`macos-26`), krok „Run quality gates (npm run verify)” (`.github/workflows/testflight.yml:134-135`), commit `7d35ec4d` (`master`, drzewo = `redesign` @ `2fbc1a98`).

## Co padło (log joba)

- Wszystkie bramki `verify` przed Jest przeszły; padł ostatni etap, `npm test`.
- Log 11:04:19.93: `Test Suites: 1 failed, 657 passed, 658 total` / `Tests: 1 failed, 6959 passed, 6960 total`, `Time: 523.215 s`.
- Jedyny czerwony test: `src/data/__tests__/sprawdzenie-kopii-033.sqlite.test.ts` › „sprawdzenie nie zmienia sprawdzanej kopii: plik -wal zostaje, .db bez zmian (kopia robocza w Caches)”, `Expected: "ok"`, `Received: "pusta"`, w linii 84 (`expect(await sprawdzKopieBazy(...)).toBe('ok')`).
- Limit czasu, pamięć i historia gita odpadają: Jest skończył wszystkie 658 plików (523 s; poza tym tylko ostrzeżenie „worker process has failed to exit gracefully”, bez skutku), a test 079/110 (`ci-pelna-historia-110`) przeszedł w tym samym przebiegu.

## Przyczyna (test, nie kod aplikacji)

- Atrapa `FileSystem.getInfoAsync` w teście (przed poprawką linia 29) uznawała plik na dysku za istniejący tylko wtedy, gdy ścieżka zaczynała się od `/tmp/`: „if (sciezka.startsWith('/tmp/') && fs.existsSync(sciezka))”. Dla innych ścieżek zwracała wynik atrapy pamięciowej („nie istnieje”).
- Pliki bazy testu leżą w `fs.mkdtempSync(path.join(os.tmpdir(), 'piekarz-sqlite-'))` (`src/data/__tests__/helpers/node-sqlite-adapter.ts:55`). Na Linuksie `os.tmpdir()` to `/tmp`; na runnerze macOS to `$TMPDIR` = `/var/folders/...`.
- Na macOS `sprawdzKopieBazy` (`src/lib/sprawdzenie-kopii.ts:27`) słyszała więc, że `-wal` nie istnieje, i kopiowała do kopii roboczej sam `.db` sprzed checkpointu. Ten plik nie zawiera jeszcze `user_version = 7` ani tabeli (są w `-wal`), więc `PRAGMA user_version` dawało 0, a wynik „pusta” (`src/lib/sprawdzenie-kopii.ts:32-33`).
- Kod aplikacji jest poprawny: na urządzeniu `getInfoAsync` jest prawdziwe. Błąd jest tylko w założeniu atrapy.

## Odtworzenie w kontenerze Linux (dowód)

| Komenda | Wynik |
|---|---|
| `npx jest src/data/__tests__/sprawdzenie-kopii-033.sqlite.test.ts` (TMPDIR domyślny, `/tmp`) | 4/4, kod 0 |
| `TMPDIR=/var/tmp/piekarz-macos-tmp npx jest src/data/__tests__/sprawdzenie-kopii-033.sqlite.test.ts` | 1 failed / 3 passed, kod 1; `Expected: "ok"`, `Received: "pusta"`, czyli ten sam komunikat co w CI |

## Poprawka (D-339)

- Strażnik `tests/testy-bez-sciezki-tmp-tf24.test.ts`: żaden plik testu ani pomocnika nie ma literału ścieżki `/tmp`. Przed poprawką czerwony (1 failed / 1 passed, kod 1; trafienie `sprawdzenie-kopii-033.sqlite.test.ts:29`).
- Atrapa porównuje teraz ścieżkę z `os.tmpdir()` zamiast `'/tmp/'` (`src/data/__tests__/sprawdzenie-kopii-033.sqlite.test.ts:31`). Kod aplikacji, workflowy i progi bez zmian.
- Po poprawce: oba pliki 6/6, kod 0, przy `TMPDIR=/var/tmp/piekarz-macos-tmp` i przy domyślnym `/tmp`.
- Pełne `npm run verify`: wyniki w `verify.md`.

## Nie sprawdzono

- Przebieg na prawdziwym runnerze macOS: testflight.yml uruchamia koordynator albo właściciel. Symulacja `TMPDIR` odtwarza jedną różnicę macOS/Linux, którą widać w logu; innych (np. system plików bez rozróżniania wielkości liter) nie odtwarza.
- Od kiedy test ma to założenie: `[DO USTALENIA]`. W historii repo plik powstał w spłaszczonym commicie `f6f9f162`, a wcześniejsze buildy TestFlight nie zostały porównane.
