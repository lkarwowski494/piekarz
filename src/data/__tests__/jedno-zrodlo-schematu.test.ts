// ============================================================================
// Jedno źródło schematu SQLite (M1-audytor-generalny-062, 05-architekt-013)
// Aplikacja wykonuje tylko SCHEMA_MIGRATIONS z src/data/sqlite-schema.ts; żaden inny śledzony plik
// (poza fiksturami testów migracji) nie definiuje tabel, a dokumentacja architektury wskazuje to źródło.
// ============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const SOURCE = 'src/data/sqlite-schema.ts';

function tracked(...paths: string[]): string[] {
  return execFileSync('git', ['ls-files', '-z', '--', ...paths], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
}

describe('Jedno źródło schematu (062)', () => {
  test('CREATE TABLE w kodzie i plikach SQL występuje tylko w src/data/sqlite-schema.ts', () => {
    const files = tracked('src', 'app', 'db', '*.sql').filter(
      (f) => !f.includes('/__tests__/') && !f.includes('/fixtures/') && existsSync(join(root, f))
    );
    const withCreate = files.filter((f) => /\bCREATE\s+TABLE\b/i.test(readFileSync(join(root, f), 'utf8')));
    expect(withCreate).toEqual([SOURCE]);
  });

  test('nie ma równoległego pliku schematu db/schema.sql ani src/data/schema.ts', () => {
    expect(existsSync(join(root, 'db', 'schema.sql'))).toBe(false);
    expect(existsSync(join(root, 'src', 'data', 'schema.ts'))).toBe(false);
  });

  test('docs/system-architecture.md wskazuje SCHEMA_MIGRATIONS w sqlite-schema.ts, nie db/schema.sql', () => {
    const doc = readFileSync(join(root, 'docs', 'system-architecture.md'), 'utf8');
    expect(doc).not.toContain('db/schema.sql');
    const model = doc.slice(doc.indexOf('## 2.'), doc.indexOf('### 2.1'));
    expect(model).toContain('SCHEMA_MIGRATIONS');
    expect(model).toContain(SOURCE);
  });
});
