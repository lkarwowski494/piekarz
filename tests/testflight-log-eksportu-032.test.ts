// ============================================================================
// Piekarz — testflight.yml: pełny log eksportu i wysyłki jako artefakt (032, KO-025, 2026-11-10; sesja J).
// Bez pełnego logu nie wiadomo, czy xcodebuild wysłał symbole (dSYM): job pokazywał tylko tail -30 (TF #25).
// Log idzie do artefaktu wyłącznie po kontroli wzorców sekretów, z krótką retencją; linie o symbolach do podsumowania.
// ============================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const wf = readFileSync(join(__dirname, '..', '.github', 'workflows', 'testflight.yml'), 'utf8').replace(/\r\n/g, '\n');
const buildJob = wf.split(/\n  tag:\n/)[0];
const steps = buildJob.split(/\n      - name: /).slice(1);
const idx = (re: RegExp) => steps.findIndex((s) => re.test(s));

describe('testflight.yml: pełny log eksportu (032)', () => {
  const eksport = idx(/xcodebuild -exportArchive/);
  const kontrola = idx(/^Full export log/);
  const wysylka = idx(/^Upload full export log/);
  const sprzatanie = idx(/^Clean up credentials/);

  it('kroki: eksport → kontrola logu → artefakt → sprzątanie poświadczeń', () => {
    expect(eksport).toBeGreaterThanOrEqual(0);
    expect(kontrola).toBeGreaterThan(eksport);
    expect(wysylka).toBeGreaterThan(kontrola);
    expect(sprzatanie).toBeGreaterThan(wysylka);
  });

  it('log eksportu ma maskowane identyfikatory klucza, wydawcy i zespołu', () => {
    const e = steps[eksport];
    for (const z of ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'APPLE_TEAM_ID']) expect(e).toContain(`-e "s/\${${z}}/`);
  });

  it('kontrola: wzorce klucza prywatnego, JWT, Bearer i nazwy pliku klucza; przy trafieniu log usunięty, bez artefaktu', () => {
    const k = steps[kontrola] ?? '';
    expect(k).toMatch(/if: always\(\)/);
    expect(k).toContain('BEGIN [A-Z ]*PRIVATE KEY');
    expect(k).toContain('eyJ');
    expect(k).toContain('[Bb]earer');
    expect(k).toContain('AuthKey_');
    expect(k).toMatch(/rm -f "\$LOG"; echo "bezpieczny=false"/);
    expect(k).not.toMatch(/secrets\./);
  });

  it('podsumowanie joba ma linie o symbolach (dSYM)', () => {
    expect(steps[kontrola]).toMatch(/grep -iE 'dsym\|symbol'[\s\S]*GITHUB_STEP_SUMMARY/);
  });

  it('artefakt tylko po kontroli, tylko log eksportu, retencja ≤ 3 dni', () => {
    const u = steps[wysylka] ?? '';
    expect(u).toMatch(/if: always\(\) && steps\.log_eksportu\.outputs\.bezpieczny == 'true'/);
    expect(u).toMatch(/uses: actions\/upload-artifact@v4/);
    expect(u).toMatch(/path: \/tmp\/xcodebuild-export\.log\n/);
    const dni = Number(/retention-days: (\d+)/.exec(u)?.[1]);
    expect(dni).toBeGreaterThan(0);
    expect(dni).toBeLessThanOrEqual(3);
  });
});
