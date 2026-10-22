// Hipotezy wzrostu z progami (DEC-13 a): kryterium eksperymentu DEC-01 d jako H z progiem i datą oceny
// po 90 dniach od wydania; `docs/wzrost/hipotezy.mjs` z kodem 0 [M1-audytor-generalny-085; 11-wzrost-007]
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const skrypt = join(root, 'docs', 'wzrost', 'hipotezy.mjs');
const dane = join(root, 'docs', 'wzrost', 'hipotezy.json');

describe('Hipotezy wzrostu (docs/wzrost/hipotezy.json)', () => {
  test('pliki istnieją', () => {
    expect(existsSync(skrypt)).toBe(true);
    expect(existsSync(dane)).toBe(true);
  });

  test('hipotezy.mjs kończy się kodem 0 (dane poprawne, najwyżej 3 aktywne H)', () => {
    const r = spawnSync(process.execPath, [skrypt, dane, '--dzis', '2026-10-20'], { encoding: 'utf8' });
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('H-01');
    expect(r.stdout).toContain('przed terminem, bez oceny');
  });

  test('kontrola negatywna: skrypt odrzuca H bez ID decyzji progu (kod 1)', () => {
    const r = spawnSync(process.execPath, ['--input-type=module', '-e',
      `import { sprawdz } from ${JSON.stringify('file:///' + skrypt.replace(/\\/g, '/'))};
       const x = JSON.parse(${JSON.stringify(readFileSync(dane, 'utf8'))});
       delete x.hipotezy[0].prog.decyzja;
       process.exit(sprawdz(x).length ? 1 : 0);`], { encoding: 'utf8' });
    expect(r.status).toBe(1);
  });

  // Przepisane z D-038 (płatność po ofercie wprowadzającej) na „Kryterium po 90 dniach od wydania” kontraktu Basic/Pro
  // (docs/monetyzacja.md, D-112, D-113): pierwsze zakupy subskrypcji i dożywotniego, poniżej połowy przegląd, nie
  // zamrożenie [M3 P-a]
  test('H-01 to „Kryterium po 90 dniach od wydania” z docs/monetyzacja.md (Basic/Pro, D-112, D-113)', () => {
    const x = JSON.parse(readFileSync(dane, 'utf8'));
    const h = x.hipotezy.find((e: { id: string }) => e.id === 'H-01');
    expect(h).toBeDefined();
    expect(h.zrodlo).toMatch(/App Store Connect/);
    expect(h.zrodlo).not.toMatch(/Introductory/);
    expect(h.prog.decyzja).toMatch(/D-112/);
    expect(h.prog.decyzja).not.toMatch(/D-038/);
    expect(h.kryterium.zrodlo).toMatch(/Kryterium po 90 dniach od wydania/);
    expect(h.kryterium.okno_dni).toEqual([30, 90]);
    expect(h.kryterium.prog).toEqual({ nowi_placacy_mies: 7, wplyw_usd_mies: 42 });
    expect(h.kryterium.przeglad).toEqual({ nowi_placacy_mies: 3.5, wplyw_usd_mies: 21 });
    expect(h.kryterium.zamrozenie).toBeUndefined();
    expect(h.miara_pomocnicza).toMatch(/zakupy Pro/);
    // Ocena nie wcześniej niż 90 dni po najwcześniejszym możliwym wydaniu (2026-10-21)
    expect(h.data_oceny >= '2027-01-19').toBe(true);
  });

  test('zmierzone dane nie trafiają do publicznego repo', () => {
    const x = JSON.parse(readFileSync(dane, 'utf8'));
    for (const h of x.hipotezy) expect(h.dane).toBeUndefined();
  });
});
