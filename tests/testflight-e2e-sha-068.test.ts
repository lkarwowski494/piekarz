/**
 * M1-audytor-generalny-068 (07-jakosc-004; DEC-18 → D-286 a): build TestFlight wymaga zielonego iOS E2E
 * na tym samym SHA. Build 1023 poszedł z 2ef8870a po czerwonym E2E #96, bo testflight.yml nie znał wyniku
 * e2e-ios.yml (wymóg D-131 i D-272 wykonywała dyscyplina koordynatora).
 * Kontrakt: zadanie `e2e-sha` (Linux, bez sekretów, token z odczytem Actions) pobiera przebiegi e2e-ios.yml
 * i uruchamia scripts/ci/e2e-na-sha.mjs; `build` czeka na nie (needs). Skrypt przepuszcza tylko SHA z zielonym
 * przebiegiem; wyjątek D-276 jako reguła: zielony przodek, gdy różnica do niego nie dotyka żadnej ścieżki
 * z filtra `paths` e2e-ios.yml (te zmiany i tak nie uruchamiają E2E). Czerwony przebieg na najbliższym
 * sprawdzonym SHA blokuje build, także gdy starszy przodek był zielony (przypadek 2ef8870a).
 */
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const root = join(__dirname, '..');
const skrypt = join(root, 'scripts', 'ci', 'e2e-na-sha.mjs');
const wf = (n: string) => readFileSync(join(root, '.github', 'workflows', n), 'utf8').replace(/\r\n/g, '\n');

/** Treść zadania `nazwa:` w sekcji jobs (do następnego zadania na tym samym wcięciu). */
const zadanie = (t: string, nazwa: string): string => {
  const m = new RegExp(`\\n {2}${nazwa}:\\n([\\s\\S]*?)(?=\\n {2}[\\w-]+:\\n|$)`).exec(t);
  return m?.[1] ?? '';
};

describe('testflight.yml: build tylko po zielonym iOS E2E na tym samym SHA (M1-audytor-generalny-068, 07-jakosc-004)', () => {
  const tf = wf('testflight.yml');
  const bramka = zadanie(tf, 'e2e-sha');
  const build = zadanie(tf, 'build');

  it('istnieje zadanie e2e-sha na Linuksie, a build czeka na nie (needs)', () => {
    expect(bramka).not.toBe('');
    expect(bramka).toMatch(/\n {4}runs-on: ubuntu-latest\n/);
    expect(bramka).toMatch(/\n {4}timeout-minutes: \d+\n/);
    expect(build).toMatch(/\n {4}needs: \[[^\]]*\be2e-sha\b[^\]]*\]\n/);
  });

  it('e2e-sha: minimalne uprawnienia (contents: read, actions: read), bez środowiska release i bez sekretów', () => {
    expect(bramka).toMatch(/\n {4}permissions:\n {6}contents: read\n {6}actions: read\n(?! {6})/);
    expect(bramka).not.toMatch(/environment:|secrets\.|contents: write|actions: write/);
    expect(bramka).toMatch(/GH_TOKEN: \$\{\{ github\.token \}\}/);
  });

  it('e2e-sha: pełna historia (przodkowie), przebiegi e2e-ios.yml z API i skrypt na GITHUB_SHA', () => {
    expect(bramka).toMatch(/uses: actions\/checkout@v\d+\n\s+with:\n\s+fetch-depth: 0\n/);
    expect(bramka).toMatch(/gh api "repos\/\$GITHUB_REPOSITORY\/actions\/workflows\/e2e-ios\.yml\/runs\?status=completed&per_page=100" > "\$RUNNER_TEMP\/e2e-przebiegi\.json"/);
    expect(bramka).toMatch(/node scripts\/ci\/e2e-na-sha\.mjs --sha "\$GITHUB_SHA" --przebiegi "\$RUNNER_TEMP\/e2e-przebiegi\.json"/);
  });

  it('bramka nie jest wyciszona: bez if:, continue-on-error, || true', () => {
    expect(bramka).not.toMatch(/\n {4}if:|continue-on-error|\|\|\s*true/);
    expect(build).not.toMatch(/\n {4}if:/);
  });
});

// ---------------------------------------------------------------------------
// Zachowanie skryptu na prawdziwym repo git w katalogu tymczasowym (filtr paths z prawdziwego e2e-ios.yml)
// ---------------------------------------------------------------------------
type Przebieg = { id: number; run_number: number; head_sha: string; status: string; conclusion: string | null };

const git = (cwd: string, ...a: string[]) =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...a], { cwd, encoding: 'utf8' }).trim();

function repo(): { dir: string; commit: (pliki: Record<string, string>) => string } {
  const dir = mkdtempSync(join(tmpdir(), 'e2e-na-sha-'));
  git(dir, 'init', '-q', '-b', 'master');
  const commit = (pliki: Record<string, string>) => {
    for (const [p, tresc] of Object.entries(pliki)) {
      mkdirSync(dirname(join(dir, p)), { recursive: true });
      writeFileSync(join(dir, p), tresc);
    }
    git(dir, 'add', '-A');
    git(dir, 'commit', '-q', '-m', 'c');
    return git(dir, 'rev-parse', 'HEAD');
  };
  mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
  cpSync(join(root, '.github', 'workflows', 'e2e-ios.yml'), join(dir, '.github', 'workflows', 'e2e-ios.yml'));
  return { dir, commit };
}

let nr = 0;
const przebieg = (head_sha: string, conclusion: string | null, status = 'completed'): Przebieg => ({ id: ++nr, run_number: nr, head_sha, status, conclusion });

function sprawdz(dir: string, sha: string, przebiegi: Przebieg[]) {
  const plik = join(dir, '..', `${dir.split(/[\\/]/).pop()}-przebiegi.json`);
  writeFileSync(plik, JSON.stringify({ total_count: przebiegi.length, workflow_runs: [...przebiegi].reverse() }));
  const r = spawnSync(process.execPath, [skrypt, '--sha', sha, '--przebiegi', plik], { cwd: dir, encoding: 'utf8', timeout: 30_000 });
  rmSync(plik, { force: true });
  return { kod: r.status, wyjscie: `${r.stdout}${r.stderr}` };
}

describe('scripts/ci/e2e-na-sha.mjs: decyzja bramki (M1-audytor-generalny-068, 07-jakosc-004)', () => {
  const katalogi: string[] = [];
  const nowe = () => {
    const r = repo();
    katalogi.push(r.dir);
    r.commit({ 'src/a.ts': 'export const a = 1;\n', 'docs/x.md': 'x\n' });
    return r;
  };
  afterAll(() => katalogi.forEach((d) => rmSync(d, { recursive: true, force: true })));

  it('czerwony E2E na tym SHA → kod 1, choć starszy przodek był zielony (build 1023: #95 zielony, #96 czerwony na 2ef8870a)', () => {
    const { dir, commit } = nowe();
    const zielony = commit({ 'src/a.ts': 'export const a = 2;\n' });
    const scalenie = commit({ 'docs/x.md': 'scalenie\n' });
    const r = sprawdz(dir, scalenie, [przebieg(zielony, 'success'), przebieg(scalenie, 'failure')]);
    expect(r.kod).toBe(1);
    expect(r.wyjscie).toMatch(/::error::/);
    expect(r.wyjscie).toContain(scalenie);
  });

  it('zielony E2E na tym SHA → kod 0; także po jednym ponowieniu po awarii maszyny (D-131)', () => {
    const { dir, commit } = nowe();
    const sha = commit({ 'src/a.ts': 'export const a = 3;\n' });
    expect(sprawdz(dir, sha, [przebieg(sha, 'success')]).kod).toBe(0);
    expect(sprawdz(dir, sha, [przebieg(sha, 'failure'), przebieg(sha, 'success')]).kod).toBe(0);
  });

  it('brak przebiegu albo tylko przebieg w toku / anulowany → kod 1', () => {
    const { dir, commit } = nowe();
    const sha = commit({ 'src/a.ts': 'export const a = 4;\n' });
    expect(sprawdz(dir, sha, []).kod).toBe(1);
    expect(sprawdz(dir, sha, [przebieg(sha, null, 'in_progress')]).kod).toBe(1);
    expect(sprawdz(dir, sha, [przebieg(sha, 'cancelled')]).kod).toBe(1);
  });

  it('zielony przodek, różnica tylko poza filtrem paths e2e-ios.yml (docs/, tests/, inne workflowy) → kod 0 (D-276 jako reguła)', () => {
    const { dir, commit } = nowe();
    const zielony = commit({ 'src/a.ts': 'export const a = 5;\n' });
    const sha = commit({ 'docs/x.md': 'y\n', 'tests/t.test.ts': 'test\n', '.github/workflows/testflight.yml': 'x\n' });
    const r = sprawdz(dir, sha, [przebieg(zielony, 'success')]);
    expect(r.kod).toBe(0);
    expect(r.wyjscie).toContain(zielony);
  });

  it.each([
    ['src/', { 'src/lib/i18n-en/czesc-1.ts': 'x\n' }],
    ['app/', { 'app/index.tsx': 'x\n' }],
    ['.maestro/', { '.maestro/e2e/01.yaml': 'x\n' }],
    ['app.json', { 'app.json': '{}\n' }],
    ['package-lock.json', { 'package-lock.json': '{}\n' }],
    // Zmiana samego workflowu E2E (filtr nadal czytelny: dopisany komentarz na końcu)
    ['e2e-ios.yml', { '.github/workflows/e2e-ios.yml': `${wf('e2e-ios.yml')}# zmiana\n` }],
  ])('zielony przodek, ale różnica dotyka %s (ścieżka z filtra E2E) → kod 1', (_n, pliki) => {
    const { dir, commit } = nowe();
    const zielony = commit({ 'src/a.ts': 'export const a = 6;\n' });
    const sha = commit(pliki);
    expect(sprawdz(dir, sha, [przebieg(zielony, 'success')]).kod).toBe(1);
  });

  it('zielony SHA spoza historii kandydata (inna gałąź, nieznany commit) → kod 1', () => {
    const { dir, commit } = nowe();
    const baza = git(dir, 'rev-parse', 'HEAD');
    const boczny = commit({ 'docs/b.md': 'b\n' });
    git(dir, 'reset', '-q', '--hard', baza);
    const sha = commit({ 'docs/c.md': 'c\n' });
    expect(sprawdz(dir, sha, [przebieg(boczny, 'success'), przebieg('0'.repeat(40), 'success')]).kod).toBe(1);
  });

  it('decyduje najbliższy sprawdzony SHA: czerwony bliższy przodek z różnicą poza filtrem blokuje mimo zielonego dalszego → kod 1', () => {
    const { dir, commit } = nowe();
    const zielony = commit({ 'src/a.ts': 'export const a = 7;\n' });
    const czerwony = commit({ 'docs/x.md': 'z\n' });
    const sha = commit({ 'docs/x.md': 'zz\n' });
    expect(sprawdz(dir, sha, [przebieg(zielony, 'success'), przebieg(czerwony, 'failure')]).kod).toBe(1);
  });

  it('filtr paths czytany z e2e-ios.yml; wzorzec spoza obsługiwanych (np. **/*.ts) przerywa bramkę głośno → kod 1', () => {
    const { dir, commit } = nowe();
    const zielony = commit({ 'src/a.ts': 'export const a = 8;\n' });
    const sha = commit({ 'docs/x.md': 'w\n' });
    const sciezka = join(dir, '.github', 'workflows', 'e2e-ios.yml');
    writeFileSync(sciezka, readFileSync(sciezka, 'utf8').replace("      - 'app/**'\n", "      - '**/*.ts'\n"));
    const r = sprawdz(dir, sha, [przebieg(zielony, 'success')]);
    expect(r.kod).toBe(1);
    expect(r.wyjscie).toMatch(/wzorz/);
  });
});
