// ============================================================================
// Piekarz — kontrakt workflow „App Store Connect — zgłoszenie przez API”
// [M1-audytor-generalny-186]. Zapis w App Store Connect jest działaniem zewnętrznym:
// workflow rusza tylko ręcznie (workflow_dispatch), domyślnie na sucho, zapis wyłącznie przez
// plik zgody ze skrótem planu; sekrety tylko w env kroku skryptu; nigdy naraz
// z workflow ustawień (ta sama grupa concurrency).
// ============================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const workflow = readFileSync(join(root, '.github', 'workflows', 'asc-zgloszenie.yml'), 'utf8').replace(/\r\n/g, '\n');
const zgoda = JSON.parse(readFileSync(join(root, 'docs', 'wydanie', 'asc-zgoda-zgloszenie.json'), 'utf8'));
const steps = workflow.split(/\n      - name: /).slice(1);

describe('workflow asc-zgloszenie (M1-audytor-generalny-186)', () => {
  // Po scaleniu z master: tylko ręczne uruchomienie z master (wybór a 10-wydanie-601), żeby przebieg na sucho
  // szedł na treści master; push nie uruchamia zapisu po zmianie pliku zgody [M1-audytor-generalny-186]
  it('wyzwalacz: tylko workflow_dispatch (ręcznie z master); bez push, pull_request i harmonogramu', () => {
    const on = workflow.split(/\nconcurrency:/)[0].split(/\non:\n/)[1];
    expect(on.trim()).toBe('workflow_dispatch:');
    expect(on).not.toMatch(/push|pull_request|schedule|tags|branches/);
  });

  it('skrypt uruchamiany z plikiem zgody; zgoda albo wyłączona, albo pełna (skrót planu i słowa właściciela z datą)', () => {
    const krok = steps.find((s) => s.includes('scripts/asc-zgloszenie.mjs')) ?? '';
    expect(krok).toMatch(/run: node scripts\/asc-zgloszenie\.mjs --zgoda docs\/wydanie\/asc-zgoda-zgloszenie\.json --zrzuty "\$RUNNER_TEMP\/zrzuty-sklepu"$/m);
    if (zgoda.zapis === true) {
      expect(zgoda.skrot).toMatch(/^[0-9a-f]{64}$/);
      expect(zgoda.zgoda).toMatch(/^\d{4}-\d{2}-\d{2}: \S/);
    } else {
      expect(zgoda).toMatchObject({ zapis: false, skrot: null });
    }
  });

  it('sekrety ASC tylko w env kroku skryptu, bez set -x i bez wypisywania zmiennych; token repo tylko do odczytu', () => {
    const zSekretami = steps.filter((s) => /secrets\./.test(s));
    expect(zSekretami).toHaveLength(1);
    expect(zSekretami[0]).toContain('scripts/asc-zgloszenie.mjs');
    expect(workflow).not.toMatch(/set -x|echo .*ASC_|printenv|env \|/);
    expect(workflow).toMatch(/\npermissions:\n  contents: read\n/);
  });

  it('paczka zrzutów spoza repo: tylko pobranie z wydania o tagu z asc-zgloszenie.json tokenem repo, przed krokiem skryptu; bez publikacji', () => {
    const i = steps.findIndex((s) => s.includes('gh release download'));
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(steps.findIndex((s) => s.includes('scripts/asc-zgloszenie.mjs')));
    expect(steps[i]).toContain('GH_TOKEN: ${{ github.token }}');
    expect(steps[i]).toContain("paczkaZrzutow.tag");
    expect(workflow).not.toMatch(/gh release (create|upload|edit|delete)/);
  });

  it('ta sama grupa concurrency co asc-ustawienia, bez anulowania w trakcie zapisu', () => {
    expect(workflow).toMatch(/concurrency:\n  group: asc-ustawienia\n  cancel-in-progress: false/);
  });
});
