// ============================================================================
// Piekarz — kontrakt workflow TestFlight: mapa źródeł JS każdego buildu
// (M1-audytor-generalny-068, 12-niezawodnosc-008). Bez mapy stosu awarii JS
// z buildu Release nie da się przełożyć na linie kodu. react-native-xcode.sh
// (faza „Bundle React Native code and images”) emituje mapę, gdy w środowisku
// jest SOURCEMAP_FILE. Sam przebieg na macOS sprawdza GitHub Actions.
// ============================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const workflow = readFileSync(join(root, '.github', 'workflows', 'testflight.yml'), 'utf8').replace(/\r\n/g, '\n');

/** Kroki zadania `build` (tekst od `- name:` do następnego kroku). */
const buildJob = workflow.split(/\n  tag:\n/)[0];
const steps = buildJob.split(/\n      - name: /).slice(1);
const stepIndex = (re: RegExp) => steps.findIndex((s) => re.test(s));

describe('workflow TestFlight: mapy źródeł (M1-audytor-generalny-068)', () => {
  const archiveIdx = stepIndex(/xcodebuild archive/);
  const archive = steps[archiveIdx] ?? '';
  const mapPath = /SOURCEMAP_FILE:\s*([^\n]+)/.exec(archive)?.[1].trim() ?? '';

  it('krok archiwum ustawia SOURCEMAP_FILE na plik main.jsbundle.map', () => {
    expect(archiveIdx).toBeGreaterThanOrEqual(0);
    expect(mapPath).toMatch(/main\.jsbundle\.map$/);
  });

  it('po archiwum sprawdza, że mapa powstała', () => {
    expect(archive).toMatch(/test -s "\$SOURCEMAP_FILE"/);
  });

  it('zapisuje mapę jako artefakt każdego buildu: po archiwum, if: always(), nazwa z numerem buildu, 90 dni', () => {
    const uploadIdx = steps.findIndex(
      (s) => /uses: actions\/upload-artifact@v\d+/.test(s) && /main\.jsbundle\.map/.test(s),
    );
    expect(uploadIdx).toBeGreaterThan(archiveIdx);
    const upload = steps[uploadIdx];
    expect(upload).toMatch(/\n\s+if: always\(\)\n/);
    expect(upload).not.toMatch(/if: failure\(\)/);
    expect(upload).toMatch(/name: [^\n]*\$\{\{ env\.BUILD_NUMBER \}\}/);
    expect(upload).toMatch(/retention-days: 90\b/);
    expect(upload).toMatch(/if-no-files-found: error/);
  });
});
