// ============================================================================
// Piekarz — jedno źródło numeru buildu i minimalny iOS z decyzji
// (M1-audytor-generalny-077, 10-wydanie-006). TestFlight buduje workflow
// GitHub Actions (xcodebuild), nie EAS: numer buildu liczy tylko workflow,
// app.json nie ma sztywnego buildNumber, eas.json nie ma autoIncrement.
// Minimalny iOS 18.0: decyzja w obowiązującym rejestrze docs/decyzje.md (D-059,
// przeniesiona z archiwalnej DEC-06 BRD 00b).
// ============================================================================

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(__dirname, '..');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const easJson = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));
const workflow = readFileSync(join(root, '.github', 'workflows', 'testflight.yml'), 'utf8').replace(/\r\n/g, '\n');

describe('numer buildu: jedno źródło (M1-audytor-generalny-077)', () => {
  it('app.json nie ma sztywnego ios.buildNumber', () => {
    expect(appJson.expo.ios.buildNumber).toBeUndefined();
  });

  it('eas.json nie ma sprzecznego autoIncrement ani zdalnego appVersionSource', () => {
    const profiles = Object.entries(easJson.build ?? {}) as [string, Record<string, unknown>][];
    const withAuto = profiles.filter(([, p]) => 'autoIncrement' in p).map(([n]) => n);
    expect(withAuto).toEqual([]);
    expect(easJson.cli?.appVersionSource).toBeUndefined();
  });

  it('workflow liczy numer buildu dokładnie raz i ustawia go bez ukrywania błędów', () => {
    expect(workflow.match(/BUILD_NUMBER=\$\(\(BUILD_BASE \+ GITHUB_RUN_NUMBER\)\)/g)).toHaveLength(1);
    const plistLines = workflow.split('\n').filter((l) => /PlistBuddy|sed -i/.test(l));
    expect(plistLines.length).toBeGreaterThan(0);
    for (const l of plistLines) expect(l).not.toMatch(/\|\|\s*true/);
    expect(workflow).toMatch(/CURRENT_PROJECT_VERSION="\$BUILD_NUMBER"/);
  });
});

describe('minimalny iOS z decyzji w rejestrze (M1-audytor-generalny-077)', () => {
  it('app.json ios.deploymentTarget = 18.0', () => {
    expect(appJson.expo.ios.deploymentTarget).toBe('18.0');
  });

  it('obowiązujący rejestr docs/decyzje.md ma decyzję o minimalnym iOS równym app.json', () => {
    const dec = readFileSync(join(root, 'docs', 'decyzje.md'), 'utf8').replace(/\r\n/g, '\n');
    const wpis = dec.split('\n### ').find((w) => /^\[D-\d{3}\][^\n]*Minimalny iOS/.test(w));
    expect(wpis).toBeDefined();
    expect(wpis).toMatch(/\*\*Decyzja:\*\*[^\n]*iOS 18\.0/);
    expect(wpis).toMatch(new RegExp(`deploymentTarget[^\\n]*${appJson.expo.ios.deploymentTarget.replace('.', '\\.')}`));
  });

  describe('verify-native pilnuje wartości', () => {
    let tmp: string;
    beforeAll(() => {
      tmp = mkdtempSync(join(tmpdir(), 'piekarz-native-'));
    });
    afterAll(() => rmSync(tmp, { recursive: true, force: true }));

    const run = (mutate: (cfg: { expo: Record<string, any> }) => void) => {
      const cfg = JSON.parse(JSON.stringify(appJson));
      mutate(cfg);
      const p = join(tmp, `app-${Math.random().toString(36).slice(2)}.json`);
      writeFileSync(p, JSON.stringify(cfg), 'utf8');
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'verify-native.mjs'), '--app', p], { cwd: root, encoding: 'utf8' });
      return { kod: r.status, wynik: `${r.stdout}${r.stderr}` };
    };

    it('obecny app.json: kod 0', () => {
      expect(run(() => undefined).kod).toBe(0);
    });

    it('deploymentTarget 15.1 albo brak: kod 1 z komunikatem', () => {
      const zly = run((c) => {
        c.expo.ios.deploymentTarget = '15.1';
      });
      expect(zly.kod).toBe(1);
      expect(zly.wynik).toMatch(/deploymentTarget/);
      expect(run((c) => delete c.expo.ios.deploymentTarget).kod).toBe(1);
    });

    it('sztywny ios.buildNumber: kod 1', () => {
      const r = run((c) => {
        c.expo.ios.buildNumber = '1';
      });
      expect(r.kod).toBe(1);
      expect(r.wynik).toMatch(/buildNumber/);
    });
  });
});
