// ============================================================================
// Piekarz — bramki jakości w CI według decyzji DEC-12 (a) planu napraw M1-2026-10-19
// (2026-10-19; to nie DEC-12 z BRD): próg Strykera 60 z planem podnoszenia,
// nightly bez wyciszania błędów, ziarno fast-check zawsze liczbowe, bramka TestFlight
// z i18n i bez `|| true`. M1-audytor-generalny-064 (07-jakosc-010, 07-jakosc-011).
// Ochrona master to krok właściciela w ustawieniach GitHub; tego test nie sprawdza.
// ============================================================================

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const stryker = JSON.parse(read('stryker.config.json'));
const pkg = JSON.parse(read('package.json'));

/** Treść kroku workflowu (od `- name: <nazwa>` do następnego `- name:`). */
function step(workflow: string, name: RegExp): string {
  const parts = workflow.split(/\n\s*- name: /);
  const found = parts.find((p) => name.test(p.split('\n')[0]));
  if (!found) throw new Error(`brak kroku ${name}`);
  return found;
}

describe('Stryker: próg z DEC-12 (a) i plan podnoszenia (07-jakosc-010)', () => {
  it('thresholds.break = 60, a konfiguracja wskazuje ID decyzji', () => {
    expect(stryker.thresholds.break).toBe(60);
    expect(stryker['//']).toMatch(/DEC-12 \(a\) planu napraw M1-2026-10-19/);
    expect(stryker['//']).toMatch(/M1-audytor-generalny-064/);
  });

  it('progi high/low nie są niższe niż break (Stryker kolory raportu)', () => {
    expect(stryker.thresholds.low).toBeGreaterThanOrEqual(stryker.thresholds.break);
    expect(stryker.thresholds.high).toBeGreaterThanOrEqual(stryker.thresholds.low);
  });

  it('definicja ukończenia podaje ten sam próg i plan podnoszenia z terminem', () => {
    const row = read('docs/20-definicja-ukonczenia.md')
      .split('\n')
      .find((l) => /^\| \*\*21\*\* \|/.test(l));
    expect(row).toBeDefined();
    expect(row).toMatch(new RegExp(`próg ${stryker.thresholds.break} od \\d{4}-\\d{2}-\\d{2}`));
    const plan = [...(row ?? '').matchAll(/(\d{2}) do (\d{4}-\d{2}-\d{2})/g)].map((m) => Number(m[1]));
    expect(plan.length).toBeGreaterThanOrEqual(1);
    for (const next of plan) expect(next).toBeGreaterThan(stryker.thresholds.break);
  });

  it('nightly uruchamia Strykera bez wyciszania wyniku', () => {
    const nightly = read('.github/workflows/nightly.yml');
    const mutation = step(nightly, /Stryker/);
    expect(mutation).toMatch(/npm run test:mutation/);
    expect(pkg.scripts['test:mutation']).toMatch(/^stryker run/);
    expect(nightly).not.toMatch(/continue-on-error|\|\|\s*true/);
  });
});

describe('fast-check: ziarno zawsze liczbowe, także przy PROP_SEED=random (07-jakosc-010)', () => {
  const allowed = new Set(['jest.app-after-env.js', join('tests', 'helpers', 'fc-config.js')]);
  const testFiles: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(test\.)?[jt]sx?$/.test(name)) testFiles.push(relative(root, full));
    }
  };
  walk(join(root, 'src'));
  walk(join(root, 'tests'));

  it('żaden test nie liczy ziarna z PROP_SEED sam (Number("random") = NaN daje stały ciąg)', () => {
    const offenders = testFiles
      .filter((f) => !allowed.has(f) && f.split(sep).join('/') !== 'tests/quality-gates.test.ts')
      .filter((f) => /process\.env\.PROP_SEED/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it('globalna konfiguracja w tym przebiegu ma skończone ziarno', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fc = require('fast-check');
    expect(Number.isFinite(fc.readConfigureGlobal().seed)).toBe(true);
  });
});

describe('bramka TestFlight (07-jakosc-011)', () => {
  const testflight = read('.github/workflows/testflight.yml');

  it('krok bramek jakości uruchamia i18n, macierz, licencje i Jest', () => {
    const gates = step(testflight, /Run quality gates/);
    expect(gates).toMatch(/npm run check:i18n|node scripts\/check-i18n\.mjs/);
    expect(pkg.scripts['check:i18n']).toMatch(/check-i18n\.mjs/);
    expect(gates).toMatch(/npx tsc --noEmit/);
    expect(gates).toMatch(/test-matrix\.mjs --check/);
    expect(gates).toMatch(/check-licenses\.mjs/);
    expect(gates).toMatch(/npx jest/);
  });

  it('żaden krok nie wycisza błędów `|| true` ani continue-on-error', () => {
    expect(testflight).not.toMatch(/\|\|\s*true/);
    expect(testflight).not.toMatch(/continue-on-error/);
  });

  it('wersja i numer buildu ustawiane bez wyciszania (PlistBuddy przerywa krok)', () => {
    const ver = step(testflight, /Compute & set monotonic build number/);
    const plist = ver.split('\n').filter((l) => /PlistBuddy/.test(l));
    expect(plist.length).toBe(2);
    for (const l of plist) expect(l).not.toMatch(/\|\||2>\s*\/dev\/null/);
  });
});
