// ============================================================================
// Piekarz — kontrakt workflow „App Store Connect — zgłoszenie przez API”
// [M1-audytor-generalny-186]. Zapis w App Store Connect jest działaniem zewnętrznym:
// workflow rusza tylko z gałęzi toru p8c, domyślnie na sucho, zapis wyłącznie przez
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
  it('wyzwalacz: tylko push na gałąź toru p8c; bez workflow_dispatch, pull_request i harmonogramu', () => {
    const on = workflow.split(/\nconcurrency:/)[0].split(/\non:\n/)[1];
    expect(on).toMatch(/^  push:\n    branches:\n      - naprawy\/M2-koordynator-napraw-2026-10-19-p8c\n/);
    expect(on).not.toMatch(/pull_request|workflow_dispatch|schedule|tags/);
    for (const p of ['scripts/asc-zgloszenie.mjs', 'docs/wydanie/metadane/**', 'docs/wydanie/zrzuty/**', 'docs/wydanie/asc-zgoda-zgloszenie.json']) expect(on).toContain(`- ${p}\n`);
  });

  it('skrypt uruchamiany z plikiem zgody; zgoda albo wyłączona, albo pełna (skrót planu i słowa właściciela z datą)', () => {
    const krok = steps.find((s) => s.includes('scripts/asc-zgloszenie.mjs')) ?? '';
    expect(krok).toMatch(/run: node scripts\/asc-zgloszenie\.mjs --zgoda docs\/wydanie\/asc-zgoda-zgloszenie\.json$/m);
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

  it('ta sama grupa concurrency co asc-ustawienia, bez anulowania w trakcie zapisu', () => {
    expect(workflow).toMatch(/concurrency:\n  group: asc-ustawienia\n  cancel-in-progress: false/);
  });
});
