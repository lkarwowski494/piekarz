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
    // Dwa zadania (D-314): ostatni krok ze skryptem to zapis z oryginalnym plikiem zgody; przebieg na sucho dostaje kopię z "zapis": false (tests/asc-klucz-082.test.ts)
    const krok = steps.filter((s) => s.includes('scripts/asc-zgloszenie.mjs')).pop() ?? '';
    expect(krok).toMatch(/run: node scripts\/asc-zgloszenie\.mjs --zgoda docs\/wydanie\/asc-zgoda-zgloszenie\.json$/m);
    if (zgoda.zapis === true) {
      expect(zgoda.skrot).toMatch(/^[0-9a-f]{64}$/);
      expect(zgoda.zgoda).toMatch(/^\d{4}-\d{2}-\d{2}: \S/);
    } else {
      expect(zgoda).toMatchObject({ zapis: false, skrot: null });
    }
  });

  it('sekrety ASC tylko w env kroku skryptu, bez set -x i bez wypisywania zmiennych; token repo tylko do odczytu', () => {
    // Dwa kroki z sekretami od D-314: skrypt na sucho (zadanie na-sucho) i skrypt zapisu (zadanie zapis, środowisko release)
    const zSekretami = steps.filter((s) => /secrets\./.test(s));
    expect(zSekretami).toHaveLength(2);
    for (const krok of zSekretami) expect(krok).toContain('scripts/asc-zgloszenie.mjs');
    expect(workflow).not.toMatch(/set -x|echo .*ASC_|printenv|env \|/);
    expect(workflow).toMatch(/\npermissions:\n  contents: read\n/);
  });

  it('zrzuty sklepu poza tym workflow (KO-033, D-366): bez --zrzuty, bez gh release i bez paczki zrzutów; nagłówek odsyła do asc-zrzuty.yml', () => {
    expect(workflow).not.toMatch(/--zrzuty|--sumy|--generuj-sumy/);
    expect(workflow).not.toMatch(/gh release|paczkaZrzutow|zrzuty-sklepu\.zip|RUNNER_TEMP\/zrzuty-sklepu/);
    expect(workflow).not.toMatch(/GH_TOKEN/);
    const naglowek = workflow.split(/\non:\n/)[0];
    expect(naglowek).toMatch(/asc-zrzuty\.yml/);
    expect(naglowek).toMatch(/D-366/);
  });

  it('ta sama grupa concurrency co asc-ustawienia, bez anulowania w trakcie zapisu', () => {
    expect(workflow).toMatch(/concurrency:\n  group: asc-ustawienia\n  cancel-in-progress: false/);
  });
});
