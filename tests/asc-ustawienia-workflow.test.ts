// ============================================================================
// Piekarz — kontrakt workflow „App Store Connect — ustawienia przez API”
// [M1-audytor-generalny-181]. Zapis w App Store Connect jest działaniem zewnętrznym:
// workflow rusza tylko z gałęzi toru p8b, domyślnie na sucho, zapis wyłącznie przez
// plik zgody ze skrótem planu; sekrety tylko w env kroku skryptu, bez śledzenia poleceń.
// ============================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const workflow = readFileSync(join(root, '.github', 'workflows', 'asc-ustawienia.yml'), 'utf8').replace(/\r\n/g, '\n');
const zgoda = JSON.parse(readFileSync(join(root, 'docs', 'wydanie', 'asc-zgoda.json'), 'utf8'));
const steps = workflow.split(/\n      - name: /).slice(1);

describe('workflow asc-ustawienia (M1-audytor-generalny-181)', () => {
  it('wyzwalacz: tylko push na gałąź toru p8b; bez workflow_dispatch, pull_request i harmonogramu', () => {
    const on = workflow.split(/\nconcurrency:/)[0].split(/\non:\n/)[1];
    expect(on).toMatch(/^  push:\n    branches:\n      - naprawy\/M2-koordynator-napraw-2026-10-19-p8b\n/);
    expect(on).not.toMatch(/pull_request|workflow_dispatch|schedule|tags/);
  });

  it('skrypt uruchamiany z plikiem zgody; plik zgody w repo domyślnie bez zapisu', () => {
    const krok = steps.find((s) => s.includes('scripts/asc-ustawienia.mjs')) ?? '';
    expect(krok).toMatch(/run: node scripts\/asc-ustawienia\.mjs --zgoda docs\/wydanie\/asc-zgoda\.json$/m);
    expect(zgoda).toMatchObject({ zapis: false, skrot: null });
  });

  it('sekrety ASC tylko w env kroku skryptu, bez set -x i bez wypisywania zmiennych', () => {
    const zSekretami = steps.filter((s) => /secrets\./.test(s));
    expect(zSekretami).toHaveLength(1);
    expect(zSekretami[0]).toContain('scripts/asc-ustawienia.mjs');
    expect(workflow).not.toMatch(/set -x|echo .*ASC_|printenv|env \|/);
  });

  it('bez równoległych przebiegów (concurrency bez anulowania w trakcie zapisu)', () => {
    expect(workflow).toMatch(/concurrency:\n  group: asc-ustawienia\n  cancel-in-progress: false/);
  });
});
