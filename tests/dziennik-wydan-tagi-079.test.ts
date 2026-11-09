/**
 * M1-audytor-generalny-079 (10-wydanie-003, WYD-02): dziennik wydań zna każdy build z tagu, bramki planu są aktualne.
 * - Każdy tag `v*-b*` (tworzy go `testflight.yml` po udanym przesłaniu) ma wiersz w `docs/wydanie/dziennik.md`
 *   z tym samym buildem i SHA tagu. Wiersze 1014–1021 dopisano z opóźnieniem (2026-11-08), 1023 brakowało w audycie.
 * - Z-1 (usunięcie Free Trial, 2026-11-03) wpisane w dzienniku słowami właściciela.
 * - `docs/wydanie/sklep.md` §3 nie podaje ZABLOKOWANE na ebd8471 jako bieżącej blokady; `plan-wydania-1.0.md` §1 pkt 3
 *   rozstrzygnięty przez D-225 (pełny M1 przed zgłoszeniem), bez `[DO USTALENIA]`.
 * Dlaczego trwała kontrola: wiersze dziennika dopisuje się ręcznie po fakcie; zgłoszenie błędu z buildu bez wiersza nie
 * wskaże SHA ani werdyktu. Tagi: CI pobiera pełną historię (`fetch-depth: 0`); lokalnie bez tagów test sprawdza 1023.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');
const git = (...a: string[]) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim();
const dziennik = read('docs/wydanie/dziennik.md');

function sekcja(tekst: string, naglowek: RegExp): string {
  const linie = tekst.split('\n');
  const i = linie.findIndex((l) => naglowek.test(l));
  if (i < 0) return '';
  const j = linie.findIndex((l, k) => k > i && /^## /.test(l));
  return linie.slice(i, j < 0 ? undefined : j).join('\n');
}

function tagi(): { build: string; sha: string }[] {
  const lista = git('tag', '-l', 'v*-b*').split('\n').filter(Boolean);
  return lista.map((t) => ({ build: t.replace(/^.*-b/, ''), sha: git('rev-list', '-n', '1', t) }));
}

describe('dziennik wydań: każdy build z tagu ma wiersz (079)', () => {
  const wiersze = dziennik.split('\n').filter((l) => /^\| \d{4}-\d{2}-\d{2} \|/.test(l));
  const wiersz = (build: string) => wiersze.find((l) => l.split('|')[3]?.trim() === build);

  it('tag v*-b* → wiersz z tym buildem i SHA tagu (skrót)', () => {
    const lista = tagi();
    if (process.env.CI) expect(lista.length).toBeGreaterThan(0);
    for (const t of lista) {
      const w = wiersz(t.build);
      expect({ build: t.build, wiersz: w ?? null }).toEqual({ build: t.build, wiersz: expect.any(String) });
      const sha = /`([0-9a-f]{7,40})`/.exec(w!.split('|')[4] ?? '')?.[1] ?? '';
      expect({ build: t.build, zgodny: sha.length >= 7 && t.sha.startsWith(sha) }).toEqual({ build: t.build, zgodny: true });
    }
  });

  it('build 1023: SHA 2ef8870, kanał TestFlight, zgoda D-272', () => {
    const w = wiersz('1023') ?? '';
    expect(w).toContain('`2ef8870');
    expect(w).toContain('TestFlight');
    expect(w).toMatch(/D-272/);
  });

  it('Z-1 w dzienniku słowami właściciela z datą', () => {
    expect(dziennik).toMatch(/2026-11-03[^\n]*Z-1[^\n]*„Obie usuenięte\.”/);
  });
});

describe('bramki wydania zgodne z D-225 (079)', () => {
  it('sklep.md §3: ZABLOKOWANE na ebd8471 nie jest bieżącą blokadą, droga przez M1 i reaudyt (D-225)', () => {
    const s3 = sekcja(read('docs/wydanie/sklep.md'), /^## 3\. /);
    expect(s3).not.toBe('');
    expect(s3).not.toMatch(/^\| Werdykt 07: ZABLOKOWANE na ebd8471/m);
    expect(s3).toMatch(/D-225/);
  });

  it('plan-wydania-1.0.md §1 pkt 3 rozstrzygnięty przez D-225, bez [DO USTALENIA]', () => {
    const pkt3 = read('docs/wydanie/plan-wydania-1.0.md').split('\n').find((l) => /^3\. \*\*Pełny głęboki audyt/.test(l)) ?? '';
    expect(pkt3).not.toBe('');
    expect(pkt3).not.toMatch(/DO USTALENIA/);
    expect(pkt3).toMatch(/D-225/);
  });
});
