/**
 * E2E iOS: jedna porażka nie ukrywa wyniku pozostałych przebiegów (en_US, kontrola negatywna, Basic biegną także po
 * porażce pl_PL, gdy aplikacja i Maestro są zainstalowane), a każdy scenariusz ma zrzut punktu kontrolnego
 * [M1-audytor-generalny-075; 07-jakosc-011].
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const wf = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'e2e-ios.yml'), 'utf8');
/** Blok kroku od „- name: <nazwa>” do następnego kroku. */
const krok = (nazwa: string) => {
  const i = wf.indexOf(`- name: ${nazwa}`);
  if (i < 0) return '';
  const j = wf.indexOf('\n      - name:', i + 5);
  return wf.slice(i, j < 0 ? undefined : j);
};

describe('075: niezależne kroki E2E i zrzuty', () => {
  it.each([
    'Run E2E flows (.maestro/e2e, en_US)',
    'Negative control must fail',
    'Build Release for simulator (Basic, without EXPO_PUBLIC_E2E)',
    'Install Basic build on simulator',
    'Run E2E flows in Basic (.maestro/e2e-basic)',
  ])('krok „%s” biegnie także po porażce wcześniejszego przebiegu', (n) => {
    expect(krok(n)).toMatch(/if: \(success\(\) \|\| failure\(\)\) && steps\.\w+\.outcome == 'success'/);
  });
  it('raport zbiera zrzuty punktów kontrolnych', () => {
    expect(krok('Upload Maestro report and screenshots')).toMatch(/zrzuty-e2e/);
  });
  it.each(['e2e', 'e2e-basic'])('każdy scenariusz .maestro/%s ma ≥ 1 takeScreenshot', (kat) => {
    const d = path.join(ROOT, '.maestro', kat);
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.yaml'))) {
      expect([f, /^- takeScreenshot:/m.test(fs.readFileSync(path.join(d, f), 'utf8'))]).toEqual([f, true]);
    }
  });
});
