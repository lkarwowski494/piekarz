// M1-audytor-generalny-064: nightly na Linuksie padał na verify:matrix, bo readdirSync
// na ext4 nie zwraca plików alfabetycznie (NTFS zwraca), więc docs/22 zależał od systemu.
// Test odwraca kolejność readdirSync i sprawdza, że raport jest ten sam.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = join(__dirname, '..');

describe('verify:matrix nie zależy od kolejności plików w systemie plików (M1-audytor-generalny-064)', () => {
  it('przy odwróconej kolejności readdirSync --check przechodzi', () => {
    const dir = mkdtempSync(join(tmpdir(), 'matrix-kolejnosc-'));
    const preload = join(dir, 'odwroc-readdir.mjs');
    writeFileSync(
      preload,
      [
        "import fs from 'node:fs';",
        "import { syncBuiltinESMExports } from 'node:module';",
        'const oryginal = fs.readdirSync;',
        'fs.readdirSync = (...a) => { const w = oryginal(...a); return Array.isArray(w) ? [...w].reverse() : w; };',
        'syncBuiltinESMExports();',
      ].join('\n'),
    );
    try {
      const wynik = spawnSync(
        process.execPath,
        ['--import', pathToFileURL(preload).href, join(root, 'scripts', 'test-matrix.mjs'), '--check'],
        { cwd: root, encoding: 'utf8' },
      );
      expect(`${wynik.stdout}${wynik.stderr}`).not.toContain('nieaktualny');
      expect(wynik.status).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120000);
});
