// ============================================================================
// Piekarz (Crust) — sekrety wydania poza repozytorium (M1-audytor-generalny-076, 10-wydanie-005)
// Repo jest publiczne: plik poświadczeń EAS (credentials.json) ma być ignorowany,
// a dokumenty pokazują tylko znaczniki (<KEY_ID>, <ISSUER_ID>), nie identyfikatory kluczy.
// ============================================================================

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function trackedDocs(): string[] {
  const out = execFileSync('git', ['ls-files', '-z', '--', 'docs', '*.md'], { cwd: root, encoding: 'utf8' });
  return out
    .split('\0')
    .filter(Boolean)
    .filter((f) => /\.(md|txt|json|ya?ml|html)$/i.test(f));
}

// Identyfikator klucza App Store Connect: 10 znaków A-Z0-9, z co najmniej jedną cyfrą i jedną literą.
const KEY_ID = /\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{10}\b/g;
const KEY_CONTEXT = /(KEY_ID|Key ID|identyfikator klucza|AuthKey_)/i;
const AUTHKEY_FILE = /AuthKey_(?=[A-Z0-9]*\d)[A-Z0-9]{10}\.p8/;
// Identyfikator wystawcy (Issuer ID) to UUID.
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const ISSUER_CONTEXT = /(ISSUER|wystawc)/i;

describe('Sekrety wydania poza repozytorium (076)', () => {
  test('.gitignore obejmuje credentials.json (EAS) w katalogu głównym i podkatalogach', () => {
    for (const path of ['credentials.json', 'ios/credentials.json', 'sub/credentials.json']) {
      const r = spawnSync('git', ['check-ignore', '-q', '--no-index', path], { cwd: root });
      expect({ path, ignored: r.status === 0 }).toEqual({ path, ignored: true });
    }
  });

  test('śledzone dokumenty nie zawierają identyfikatorów kluczy App Store Connect ani UUID wystawcy', () => {
    const files = trackedDocs();
    expect(files.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const f of files) {
      const lines = readFileSync(join(root, f), 'utf8').split(/\r?\n/);
      lines.forEach((line, i) => {
        const where = `${f}:${i + 1}`;
        if (AUTHKEY_FILE.test(line)) hits.push(`${where} plik AuthKey z identyfikatorem`);
        if (KEY_CONTEXT.test(line) && (line.match(KEY_ID) ?? []).length > 0) {
          hits.push(`${where} identyfikator klucza przy opisie klucza`);
        }
        if (ISSUER_CONTEXT.test(line) && UUID.test(line)) hits.push(`${where} UUID przy wystawcy`);
      });
    }
    expect(hits).toEqual([]);
  });
});
