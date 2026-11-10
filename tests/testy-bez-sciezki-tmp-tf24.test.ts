/**
 * TestFlight #24 (run 42793170293, job 129767054367, D-339): `npm run verify` na macos-26 padł w
 * `sprawdzenie-kopii-033`, bo atrapa `getInfoAsync` uznawała za prawdziwy plik tylko ścieżki z `/tmp/`.
 * Na macOS `os.tmpdir()` to `/var/folders/...`, więc plik `-wal` „nie istniał” i wynik był „pusta”
 * zamiast „ok”. Na Linuksie (kontener, CI ubuntu) `os.tmpdir()` to `/tmp` i błąd był niewidoczny.
 * Strażnik: testy i ich pomocnicy nie zakładają katalogu tymczasowego na sztywno — biorą go z
 * `os.tmpdir()` / `useTempDbDir()`. *Dlaczego:* ten sam zestaw biegnie na Linuksie i na macOS (testflight.yml).
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const POMIN = new Set(['node_modules', '.git', 'ios', 'android', 'dist', 'build', 'coverage']);

function plikiTestow(dir: string, wynik: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (POMIN.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) plikiTestow(p, wynik);
    else if (/\.(ts|tsx|js|mjs)$/.test(e.name) && (/__tests__/.test(p) || p.startsWith(path.join(root, 'tests')))) wynik.push(p);
  }
  return wynik;
}

// Literał ścieżki zaczynający się od /tmp (np. '/tmp/', "/tmp", `/tmp/...`) w cudzysłowie lub szablonie.
const LITERAL_TMP = /['"`]\/tmp(?:\/|['"`])/;

describe('Testy bez katalogu tymczasowego na sztywno (TF #24, D-339)', () => {
  const pliki = [...plikiTestow(path.join(root, 'src')), ...plikiTestow(path.join(root, 'tests'))]
    .filter((p) => p !== __filename);

  it('zestaw plików testów jest niepusty (strażnik coś sprawdza)', () => {
    expect(pliki.length).toBeGreaterThan(100);
  });

  it('żaden plik testu ani pomocnika nie ma literału ścieżki /tmp', () => {
    const trafienia = pliki.flatMap((p) =>
      fs.readFileSync(p, 'utf8').split('\n')
        .map((l, i) => (LITERAL_TMP.test(l) ? `${path.relative(root, p)}:${i + 1}: ${l.trim()}` : null))
        .filter((x): x is string => x !== null));
    expect(trafienia).toEqual([]);
  });
});
