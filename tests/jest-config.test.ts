/**
 * M1-audytor-generalny-166 (07-jakosc-504): `npm test` w głównym checkoucie
 * nie może zbierać testów ze starych drzew sesji w `.claude/worktrees`.
 * Sonda tworzy plik testu pod `<rootDir>/.claude/` i pyta Jest o listę testów.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const sondaDir = path.join(root, '.claude', 'worktrees', 'sonda-166', 'src', '__tests__');
const sonda = path.join(sondaDir, 'sonda-166.test.ts');

// Najwyższy katalog, którego sonda nie zastała; tylko on jest sprzątany.
const najwyzszyNowy = [path.join(root, '.claude'), path.join(root, '.claude', 'worktrees')].find(
  (d) => !fs.existsSync(d),
) ?? path.join(root, '.claude', 'worktrees', 'sonda-166');

describe('jest.config.js: drzewa sesji poza zestawem (166)', () => {
  beforeAll(() => {
    fs.mkdirSync(sondaDir, { recursive: true });
    fs.writeFileSync(sonda, "test('sonda', () => expect(1).toBe(1));\n");
  });
  afterAll(() => {
    fs.rmSync(najwyzszyNowy, { recursive: true, force: true });
  });

  it('jest --listTests nie zwraca ścieżek z <rootDir>/.claude, a zwraca testy repo', () => {
    const wynik = execFileSync(process.execPath, [require.resolve('jest/bin/jest'), '--listTests'], {
      cwd: root,
      encoding: 'utf8',
    });
    const sciezki = wynik
      .split(/\r?\n/)
      .filter(Boolean)
      .map((p) => path.relative(root, p).split(path.sep).join('/'));
    expect(sciezki.filter((p) => p.startsWith('.claude/'))).toEqual([]);
    expect(sciezki).toContain('tests/jest-config.test.ts');
  }, 120000);
});
