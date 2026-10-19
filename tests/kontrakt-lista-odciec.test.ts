// ============================================================================
// Piekarz — kontrakt i kod zgodne: moduły z listy odcięć nie istnieją w kodzie
// M1-audytor-generalny-031 (DEC-03 a, D-031): KL-06…KL-17 w docs/scope-contract.md
// ============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const contract = readFileSync(join(root, 'docs', 'scope-contract.md'), 'utf8');

const rows = contract
  .split('\n')
  .filter((l) => /^\| KL-(0[6-9]|1[0-7]) \|/.test(l));

const cutPaths = rows.flatMap((row) => {
  const codeColumn = row.split('|')[2] ?? '';
  return [...codeColumn.matchAll(/`([^`]+)`/g)].map((m) => m[1].replace(/\/$/, ''));
});

describe('lista odcięć KL-06…KL-17 zgodna z kodem (M1-audytor-generalny-031)', () => {
  it('kontrakt ma 12 wierszy odcięć i wskazuje moduły', () => {
    expect(rows).toHaveLength(12);
    expect(cutPaths).toEqual(expect.arrayContaining(['src/lib/live-activity.ts', 'App.tsx', 'garmin']));
  });

  it.each(cutPaths)('%s nie istnieje w repo', (p) => {
    expect(existsSync(join(root, p))).toBe(false);
  });

  it('tabela pending_ops zostaje w schemacie (bez migracji, decyzja 4 planu M2)', () => {
    const schema = readFileSync(join(root, 'src', 'data', 'sqlite-schema.ts'), 'utf8');
    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS pending_ops/);
  });
});
