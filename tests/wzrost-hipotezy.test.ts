// Hipotezy wzrostu z progami (DEC-13 a): kryterium eksperymentu DEC-01 d jako H z progiem i datą oceny
// po 90 dniach od wydania; `docs/wzrost/hipotezy.mjs` z kodem 0 [M1-audytor-generalny-085; 11-wzrost-007]
// Minimalna próba z ID decyzji właściciela i data oceny z daty wydania w dzienniku wydań
// (DEC-16 a, D-286) [M1-audytor-generalny-084; 11-wzrost-005]
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

  test('min_proba każdej H ma ID decyzji właściciela zapisanej w docs/decyzje.md (084)', () => {
    const x = JSON.parse(readFileSync(dane, 'utf8'));
    const decyzje = readFileSync(join(root, 'docs', 'decyzje.md'), 'utf8');
    for (const h of x.hipotezy) {
      const ids = [...String(h.min_proba_decyzja ?? '').matchAll(/D-\d{3}/g)].map((m) => m[0]);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(decyzje).toContain(`### [${id}]`);
    }
    const wzrost = readFileSync(join(root, 'docs', 'wzrost.md'), 'utf8');
    expect(wzrost).not.toMatch(/do potwierdzenia/);
  });

  test('data_oceny = data wydania z dziennika + 90 dni; przed wydaniem nie wcześniej niż ostatni wiersz dziennika + 90 (084)', () => {
    const x = JSON.parse(readFileSync(dane, 'utf8'));
    const dziennik = readFileSync(join(root, 'docs', 'wydanie', 'dziennik.md'), 'utf8');
    const wiersze = dziennik.split('\n').filter((l) => /^\| \d{4}-\d{2}-\d{2} \|/.test(l)).map((l) => l.split('|').map((c) => c.trim()));
    const plus90 = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 90 * 86400000).toISOString().slice(0, 10);
    const h = x.hipotezy.find((e: { id: string }) => e.id === 'H-01');
    expect(h.data_oceny_regula).toMatch(/docs\/wydanie\/dziennik\.md/);
    if (h.data_wydania) {
      // po wydaniu: data z wiersza dziennika z kanałem App Store
      expect(wiersze.some((c) => c[1] === h.data_wydania && c[6] === 'App Store')).toBe(true);
      expect(h.data_oceny).toBe(plus90(h.data_wydania));
    } else {
      expect(h.data_wydania).toBeNull();
      expect(wiersze.some((c) => c[6] === 'App Store')).toBe(false);
      const ostatni = wiersze.map((c) => c[1]).sort().at(-1) as string;
      expect(h.data_oceny >= plus90(ostatni)).toBe(true);
    }
  });
});
