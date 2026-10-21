// ============================================================================
// Piekarz — deklaracje jakości mają komendę, która je sprawdza i pada przy naruszeniu
// M1-audytor-generalny-038 (07-jakosc-008, 07-jakosc-007), zasada wspólna 2.
// ============================================================================

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const node = (args: string[], env: Record<string, string> = {}) =>
  spawnSync(process.execPath, args, { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8' });

describe('limit 20 KB plików produkcyjnych (CLAUDE.md)', () => {
  it('npm run verify uruchamia kontrolę rozmiaru', () => {
    expect(pkg.scripts['check:size']).toMatch(/check-file-size\.mjs/);
    expect(pkg.scripts.verify).toMatch(/check:size/);
  });

  it('kontrola pada na pliku 21 KB i przechodzi na repo', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rozmiar-'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'duzy.ts'), `export const x = '${'a'.repeat(21_000)}';\n`);
    expect(node(['scripts/check-file-size.mjs', dir]).status).toBe(1);
    expect(node(['scripts/check-file-size.mjs']).status).toBe(0);
  });
});

describe('verify:matrix --check porównuje, a nie przepisuje raportu', () => {
  it('nieaktualny raport macierzy daje kod 1 i zostaje bez zmian', () => {
    const dir = mkdtempSync(join(tmpdir(), 'macierz-'));
    const copy = join(dir, '22.md');
    copyFileSync(join(root, 'docs', '22-macierz-testow.md'), copy);
    writeFileSync(copy, readFileSync(copy, 'utf8') + '\nzmiana poza generatorem\n');
    const before = readFileSync(copy, 'utf8');
    const res = node(['scripts/test-matrix.mjs', '--check'], { MATRIX_DOC: copy });
    expect(res.status).toBe(1);
    expect(readFileSync(copy, 'utf8')).toBe(before);
  });
});

describe('nightly: ziarno i liczba przebiegów fast-check', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { resolveFastCheckConfig } = require('./helpers/fc-config');

  it('PROP_SEED=random daje skończone ziarno, a nie NaN', () => {
    const cfg = resolveFastCheckConfig({ PROP_SEED: 'random' }, () => 123456);
    expect(Number.isFinite(cfg.seed)).toBe(true);
    expect(cfg.seed).toBe(123456);
  });

  it('liczbowe PROP_SEED i FC_NUM_RUNS trafiają do konfiguracji', () => {
    expect(resolveFastCheckConfig({ PROP_SEED: '42', FC_NUM_RUNS: '1000' }, () => 1)).toEqual({ seed: 42, numRuns: 1000 });
  });
});

describe('dokumenty nie ogłaszają gotowości bez dowodu', () => {
  const banned = /PRODUCTION READY|SPEŁNIONE|w pełni gotowy|najwyższy standard jakości/i;

  it('definicja ukończenia: każdy wiersz wskazuje komendę albo mówi „nie sprawdzane automatem”', () => {
    const dod = read('docs/20-definicja-ukonczenia.md');
    expect(dod).not.toMatch(banned);
    const rows = dod.split('\n').filter((l) => /^\| \*\*\d+\*\* \|/.test(l));
    expect(rows.length).toBeGreaterThanOrEqual(15);
    for (const row of rows) {
      const cmd = row.match(/`npm run ([\w:-]+)`/);
      const file = row.match(/`((?:tests|src|scripts)\/[^`]+)`/);
      const manual = /nie sprawdzane automatem/.test(row);
      expect(Boolean(cmd || file || manual)).toBe(true);
      if (cmd) expect(pkg.scripts[cmd[1]]).toBeDefined();
      if (file) expect(existsSync(join(root, file[1]))).toBe(true);
    }
  });

  it('raport QA v2 z „PRODUCTION READY” jest wycofany do archiwum', () => {
    expect(existsSync(join(root, 'docs', '26-audyt-qa-v2.md'))).toBe(false);
    const archived = read('docs/archiwum/26-audyt-qa-v2.md');
    expect(archived.split('\n')[0]).toMatch(/^> \*\*NIEAKTUALNY/);
  });

  it('CLAUDE.md: każda zasada z sekcji 1 ma znacznik „Sprawdza:”', () => {
    const claude = read('CLAUDE.md');
    expect(claude).not.toMatch(banned);
    const section = claude.split('## 2.')[0].split('## 1.')[1];
    const bullets = section.split('\n').filter((l) => /^\s*-\s/.test(l) || /^\d+\.\s/.test(l));
    expect(bullets.length).toBeGreaterThanOrEqual(8);
    for (const b of bullets) expect(b).toMatch(/Sprawdza:/);
  });
});

// M1-audytor-generalny-038 (reaudit pętli 1): interpreter Maestro zapisuje kontekst `now`, ale go nie czyta,
// więc deklaracja „dla poniedziałku, niedzieli i 23:55 UTC” nie ma dowodu w kodzie.
describe('interpreter Maestro w pamięci: deklaracja w CLAUDE.md zgodna z kodem (038)', () => {
  it('CLAUDE.md nie przypisuje interpreterowi dni ani godzin, których kod nie używa', () => {
    const runner = read('tests/maestro-runner.ts');
    const czytaCzas = /context\.now\b/.test(runner);
    const linia = read('CLAUDE.md')
      .split('\n')
      .find((l) => l.includes('tests/maestro-runner.ts'));
    expect(linia).toBeDefined();
    if (!czytaCzas) expect(linia).not.toMatch(/poniedział|niedziel|23:55|\bUTC\b/i);
    expect(linia).toMatch(/nie jest E2E/);
  });
});

describe('nazwy testów mówią, co naprawdę sprawdzają (07-jakosc-007)', () => {
  it.each(['tests/matrix-dimensions.test.tsx', 'tests/matrix-a11y.test.tsx'])('%s nie obiecuje pomiaru 320 pt, AX5 ani 44 pt', (f) => {
    const titles = [...read(f).matchAll(/(?:it|describe)\(\s*'([^']+)'/g)].map((m) => m[1]);
    for (const title of titles) {
      expect(title).not.toMatch(/without overflow|without clipping|wraps gracefully|touch area of 44pt|Touch Targets >= 48pt/i);
    }
  });
});
