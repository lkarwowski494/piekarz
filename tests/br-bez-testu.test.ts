/**
 * M1-audytor-generalny-067 (07-jakosc-014): każde BR z kryterium akceptacji w docs/brd/*.md ma test
 * z tym ID w nazwie (describe / it / test) albo wyjątek z powodem i źródłem w scripts/br-wyjatki.json.
 * Testy „mutant” pokazują, że bramka potrafi paść (ID usunięte z nazw testów jednego pliku, także dla BR
 * z wpisem częściowym; wyjątek bez powodu).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const root = join(__dirname, '..');
const script = join(root, 'scripts', 'br-bez-testu.mjs');

const uruchom = (args: string[]) =>
  spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8', timeout: 60_000 });

type Raport = { brd: number; wyjatki: string[]; czesciowe: string[]; bezTestuBezWyjatku: string[]; bledy: string[]; mapa: Record<string, string[]> };

function kopia(zrodlo: string = root): string {
  const dir = mkdtempSync(join(tmpdir(), 'br-bez-testu-'));
  mkdirSync(join(dir, 'docs', 'brd'), { recursive: true });
  for (const f of readdirSync(join(zrodlo, 'docs', 'brd')).filter((n) => n.endsWith('.md'))) {
    cpSync(join(zrodlo, 'docs', 'brd', f), join(dir, 'docs', 'brd', f));
  }
  cpSync(join(zrodlo, 'docs', 'scope-contract.md'), join(dir, 'docs', 'scope-contract.md'));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(zrodlo, 'scripts', 'br-wyjatki.json'), join(dir, 'scripts', 'br-wyjatki.json'));
  // Ścieżka względem źródła: segment `.claude` nad repo (worktree sesji) nie wyklucza całej kopii (192).
  const filtr = (src: string) => !/(^|[\\/])(node_modules|\.claude)([\\/]|$)/.test(relative(zrodlo, src));
  cpSync(join(zrodlo, 'tests'), join(dir, 'tests'), { recursive: true, filter: filtr });
  cpSync(join(zrodlo, 'src'), join(dir, 'src'), { recursive: true, filter: filtr });
  return dir;
}

describe('Kryteria BRD w nazwach testów (M1-audytor-generalny-067, 07-jakosc-014)', () => {
  it('każde BR z kryterium w docs/brd ma test z ID w nazwie albo wyjątek z powodem (kod 0)', () => {
    const r = uruchom([]);
    expect(r.stderr + r.stdout).not.toMatch(/BRAK|błąd:/);
    expect(r.status).toBe(0);
  });

  // 55 + 16 BR-KAL i BR-ETAP-006 z badania kalendarza (ER-62…ER-64); liczbę potwierdza też kontrola-brd.mjs roli 01
  it('skrypt widzi 72 BR z kryteriami z docs/brd (bez archiwum)', () => {
    const r = uruchom(['--json']);
    const raport = JSON.parse(r.stdout) as Raport;
    expect(raport.brd).toBe(72);
  });

  it('mutant: usunięcie ID z nazw testów jedynego pliku z tym BR daje kod 1 i to BR na liście', () => {
    const dir = kopia();
    try {
      const raport = JSON.parse(spawnSync(process.execPath, [script, '--root', dir, '--json'], { encoding: 'utf8' }).stdout) as Raport;
      const [id, pliki] = Object.entries(raport.mapa).find(([b, p]) => p.length === 1 && !raport.wyjatki.includes(b) && !raport.czesciowe.includes(b)) ?? [];
      expect(id).toBeDefined();
      const plik = join(dir, (pliki as string[])[0]);
      writeFileSync(plik, readFileSync(plik, 'utf8').split(id as string).join('BR_USUNIETE'));
      const r = spawnSync(process.execPath, [script, '--root', dir], { encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stdout).toContain(`BRAK    ${id}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('mutant: wpis „czesciowe” (znalezisko) nie zwalnia BR z testu — usunięcie jego ID z testów daje kod 1', () => {
    const dir = kopia();
    try {
      const raport = JSON.parse(spawnSync(process.execPath, [script, '--root', dir, '--json'], { encoding: 'utf8' }).stdout) as Raport;
      const id = raport.czesciowe.find((b) => raport.mapa[b]?.length === 1);
      expect(id).toBeDefined();
      const plik = join(dir, raport.mapa[id as string][0]);
      writeFileSync(plik, readFileSync(plik, 'utf8').split(id as string).join('BR_USUNIETE'));
      const r = spawnSync(process.execPath, [script, '--root', dir], { encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stdout).toContain(`BRAK    ${id}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // M1-audytor-generalny-192 (07-jakosc-604): sesje pracują w worktree pod `.claude/worktrees`;
  // filtr kopii ma pomijać `.claude` i `node_modules` wewnątrz repo, a nie w ścieżce do repo.
  it('kopia do mutantów działa także, gdy repo leży pod katalogiem .claude (192)', () => {
    const baza = mkdtempSync(join(tmpdir(), 'br-claude-'));
    const repo = join(baza, '.claude', 'worktrees', 'repo');
    let dir = '';
    try {
      mkdirSync(join(baza, '.claude', 'worktrees'), { recursive: true });
      renameSync(kopia(), repo);
      mkdirSync(join(repo, 'src', '.claude'), { recursive: true });
      writeFileSync(join(repo, 'src', '.claude', 'obcy.test.ts'), "it('BR-SONDA-192', () => {});\n");
      dir = kopia(repo);
      expect(existsSync(join(dir, 'tests', 'br-bez-testu.test.ts'))).toBe(true);
      expect(existsSync(join(dir, 'src', '.claude'))).toBe(false);
      const r = spawnSync(process.execPath, [script, '--root', dir, '--json'], { encoding: 'utf8' });
      const raport = JSON.parse(r.stdout) as Raport;
      expect(raport.bezTestuBezWyjatku).toEqual([]);
      expect(Object.keys(raport.mapa).length).toBeGreaterThan(0);
      expect(r.status).toBe(0);
    } finally {
      rmSync(baza, { recursive: true, force: true });
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
  });

  // M1-audytor-generalny-067 (reaudit pętli 1): BR z MVP nie może być zwolnione z testu pełnym wyjątkiem
  // „kod nie spełnia kryterium”; znalezisko idzie jako „czesciowe” przy teście z ID dla pozostałych scenariuszy.
  const zakresBr = (dir: string) => {
    const wynik = new Map<string, string>();
    for (const l of readFileSync(join(dir, 'docs', 'scope-contract.md'), 'utf8').split(/\r?\n/)) {
      const k = l.split('|').map((s) => s.trim());
      if (!/^F-\d+$/.test(k[1] ?? '')) continue;
      for (const id of k[3].match(/BR-[A-Z]+-\d{3}/g) ?? []) wynik.set(id, k[4]);
    }
    return wynik;
  };

  it('pełny wyjątek tylko dla BR spoza MVP w kontrakcie zakresu (067)', () => {
    const zakres = zakresBr(root);
    expect(zakres.size).toBeGreaterThan(0);
    const dane = JSON.parse(readFileSync(join(root, 'scripts', 'br-wyjatki.json'), 'utf8')) as { wyjatki: { id: string; czesciowe?: boolean }[] };
    const pelneMvp = dane.wyjatki.filter((w) => w.czesciowe !== true && zakres.get(w.id) === 'MVP').map((w) => w.id);
    expect(pelneMvp).toEqual([]);
  });

  it('mutant: pełny wyjątek dla BR z MVP daje kod 1 (067)', () => {
    const dir = kopia();
    try {
      const mvp = [...zakresBr(dir).entries()].find(([, d]) => d === 'MVP')?.[0];
      expect(mvp).toBeDefined();
      const p = join(dir, 'scripts', 'br-wyjatki.json');
      const dane = JSON.parse(readFileSync(p, 'utf8')) as { wyjatki: { id: string; powod: string; zrodlo: string; czesciowe?: boolean }[] };
      dane.wyjatki = dane.wyjatki.filter((w) => w.id !== mvp);
      dane.wyjatki.push({ id: mvp as string, powod: 'znalezisko: kod nie spełnia kryterium', zrodlo: 'F-09' });
      writeFileSync(p, JSON.stringify(dane));
      const r = spawnSync(process.execPath, [script, '--root', dir], { encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stderr).toContain(`wyjątek pełny ${mvp}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('mutant: wyjątek bez powodu i źródła daje kod 1', () => {
    const dir = kopia();
    try {
      const p = join(dir, 'scripts', 'br-wyjatki.json');
      const dane = JSON.parse(readFileSync(p, 'utf8')) as { wyjatki: { id: string; powod: string; zrodlo: string }[] };
      dane.wyjatki.push({ id: 'BR-KALK-001', powod: '', zrodlo: 'brak czasu' });
      writeFileSync(p, JSON.stringify(dane));
      const r = spawnSync(process.execPath, [script, '--root', dir], { encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('wyjątek BR-KALK-001 bez powodu');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
