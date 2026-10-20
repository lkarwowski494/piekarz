/**
 * M1-audytor-generalny-067 (07-jakosc-014): każde BR z kryterium akceptacji w docs/brd/*.md ma test
 * z tym ID w nazwie (describe / it / test) albo wyjątek z powodem i źródłem w scripts/br-wyjatki.json.
 * Testy „mutant” pokazują, że bramka potrafi paść (ID usunięte z nazw testów jednego pliku, także dla BR
 * z wpisem częściowym; wyjątek bez powodu).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(__dirname, '..');
const script = join(root, 'scripts', 'br-bez-testu.mjs');

const uruchom = (args: string[]) =>
  spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8', timeout: 60_000 });

type Raport = { brd: number; wyjatki: string[]; czesciowe: string[]; bezTestuBezWyjatku: string[]; bledy: string[]; mapa: Record<string, string[]> };

function kopia(): string {
  const dir = mkdtempSync(join(tmpdir(), 'br-bez-testu-'));
  mkdirSync(join(dir, 'docs', 'brd'), { recursive: true });
  for (const f of readdirSync(join(root, 'docs', 'brd')).filter((n) => n.endsWith('.md'))) {
    cpSync(join(root, 'docs', 'brd', f), join(dir, 'docs', 'brd', f));
  }
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(root, 'scripts', 'br-wyjatki.json'), join(dir, 'scripts', 'br-wyjatki.json'));
  const filtr = (src: string) => !/[\\/](node_modules|\.claude)([\\/]|$)/.test(src);
  cpSync(join(root, 'tests'), join(dir, 'tests'), { recursive: true, filter: filtr });
  cpSync(join(root, 'src'), join(dir, 'src'), { recursive: true, filter: filtr });
  return dir;
}

describe('Kryteria BRD w nazwach testów (M1-audytor-generalny-067, 07-jakosc-014)', () => {
  it('każde BR z kryterium w docs/brd ma test z ID w nazwie albo wyjątek z powodem (kod 0)', () => {
    const r = uruchom([]);
    expect(r.stderr + r.stdout).not.toMatch(/BRAK|błąd:/);
    expect(r.status).toBe(0);
  });

  it('skrypt widzi 55 BR z kryteriami z docs/brd (bez archiwum)', () => {
    const r = uruchom(['--json']);
    const raport = JSON.parse(r.stdout) as Raport;
    expect(raport.brd).toBe(55);
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
