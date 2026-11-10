# Dowody: poprawka TF #24 (D-339), 2026-11-10

Środowisko: kontener Linux, `v22.23.4`, drzewo = `2b144eee` (zmienione tylko pliki testów i dokumenty).

| Krok | Komenda | Wynik |
|---|---|---|
| Strażnik przed poprawką | `npx jest tests/testy-bez-sciezki-tmp-tf24.test.ts` | 1 failed / 1 passed, kod 1, trafienie `sprawdzenie-kopii-033.sqlite.test.ts:29` (`startsWith('/tmp/')`) |
| Test 033 przed poprawką, TMPDIR jak na macOS | `TMPDIR=/var/tmp/piekarz-macos-tmp npx jest src/data/__tests__/sprawdzenie-kopii-033.sqlite.test.ts` | 1 failed / 3 passed, kod 1, `Expected: "ok"`, `Received: "pusta"` (jak w CI) |
| 033 + strażnik po poprawce | to samo z `TMPDIR=/var/tmp/piekarz-macos-tmp` i z domyślnym `/tmp` | 6/6, kod 0 w obu wariantach |
| Pełne verify, TMPDIR jak na macOS | `TMPDIR=/var/tmp/piekarz-macos-tmp npm run verify` | kod 0; Test Suites: 659 passed, 659 total; Tests: 6962 passed, 6962 total |
| Pełne verify na HEAD `2b144eee` | `npm run verify` | kod 0; Test Suites: 659 passed, 659 total; Tests: 6962 passed, 6962 total |
| Kod aplikacji nietknięty | `git diff --exit-code 7d35ec4d..HEAD -- app src ':!src/**/__tests__/**'` | kod 0 |

Recenzja niezależna (świeży subagent, tylko diff `7d35ec4d..HEAD -- src tests`): brak uwag P0/P1. Sprawdził m.in. TMPDIR z ukośnikiem na końcu (4/4) i dowiązanie /var → /private/var (adapter nie używa realpath). Uwagi P2: strażnik nie wyłapie zapisu `file:///tmp/` ani `path.join('/', 'tmp')`; `startsWith(os.tmpdir())` bez separatora przepuściłby katalog-sąsiada. Obie opisane w D-339 jako kompromis.

Nie sprawdzono: przebieg na runnerze macOS. Wymaga nowego buildu TestFlight, który uruchamia koordynator albo właściciel.
