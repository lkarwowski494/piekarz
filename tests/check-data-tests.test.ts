// ============================================================================
// Piekarz — reguła „zmiana src/data wymaga zmiany testu” w CI
// (M1-audytor-generalny-063; 08-programista-017; decyzja właściciela 2026-10-20 „Tak, w CI”).
// Skrypt scripts/check-data-tests.mjs sprawdzany na tymczasowym repozytorium git.
// ============================================================================

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const root = join(__dirname, '..');
const script = join(root, 'scripts', 'check-data-tests.mjs');

function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'dane-testy-'));
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'core.autocrlf=false', ...args], {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const write = (rel: string, text: string) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  };
  git('init', '-q');
  write('src/data/store.ts', 'export const a = 1;\n');
  write('src/data/__tests__/store.test.ts', "test('a', () => {});\n");
  write('tests/inne.test.ts', "test('b', () => {});\n");
  write('src/lib/util.ts', 'export const u = 1;\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'baza');
  const base = git('rev-parse', 'HEAD');
  const commit = (files: Record<string, string>) => {
    for (const [rel, text] of Object.entries(files)) write(rel, text);
    git('add', '-A');
    git('commit', '-q', '-m', 'zmiana');
  };
  const check = (...args: string[]) =>
    spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: 'utf8', timeout: 60_000 });
  return { base, commit, check };
}

describe('check-data-tests: zmiana src/data wymaga zmiany testu (08-programista-017)', () => {
  it('zmiana src/data razem z testem w src/data/__tests__ → kod 0', () => {
    const r = repo();
    r.commit({ 'src/data/store.ts': 'export const a = 2;\n', 'src/data/__tests__/store.test.ts': "test('a2', () => {});\n" });
    expect(r.check('--base', r.base).status).toBe(0);
  }, 60_000);

  it('zmiana src/data razem z testem w tests/ → kod 0', () => {
    const r = repo();
    r.commit({ 'src/data/store.ts': 'export const a = 2;\n', 'tests/inne.test.ts': "test('b2', () => {});\n" });
    expect(r.check('--base', r.base).status).toBe(0);
  }, 60_000);

  it('zmiana src/data bez zmiany testu → kod 1 z nazwą pliku', () => {
    const r = repo();
    r.commit({ 'src/data/store.ts': 'export const a = 2;\n' });
    const w = r.check('--base', r.base);
    expect(w.status).toBe(1);
    expect(w.stdout + w.stderr).toContain('src/data/store.ts');
  }, 60_000);

  it('tylko testy → kod 0; zmiana poza src/data bez testu → kod 0', () => {
    const r = repo();
    r.commit({ 'src/data/__tests__/store.test.ts': "test('a3', () => {});\n" });
    expect(r.check('--base', r.base).status).toBe(0);
    const r2 = repo();
    r2.commit({ 'src/lib/util.ts': 'export const u = 2;\n' });
    expect(r2.check('--base', r2.base).status).toBe(0);
  }, 60_000);

  it('workflow CI uruchamia regułę z bazą PR albo poprzednim commitem pushu, z pełną historią', () => {
    const ci = readFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'utf8');
    expect(ci).toMatch(/fetch-depth:\s*0/);
    expect(ci).toMatch(/node scripts\/check-data-tests\.mjs --base/);
    expect(ci).toContain('github.event.pull_request.base.sha');
    expect(ci).toContain('github.event.before');
  }, 60_000);

  it('brak bazy albo same zera (pierwszy push) → pominięcie z komunikatem, kod 0', () => {
    const r = repo();
    r.commit({ 'src/data/store.ts': 'export const a = 2;\n' });
    for (const args of [[], ['--base', ''], ['--base', '0000000000000000000000000000000000000000']]) {
      const w = r.check(...args);
      expect(w.status).toBe(0);
      expect(w.stdout + w.stderr).toMatch(/pomijam/i);
    }
  }, 60_000);
});
