// ============================================================================
// Piekarz — kontrakt workflow E2E iOS (M1-audytor-generalny-037, 07-jakosc-005)
// Workflow ma zbudować aplikację, uruchomić symulator i prawdziwe Maestro dla
// scenariuszy głównego przepływu, a kontrola negatywna ma dowodzić, że pada.
// Sam przebieg na macOS sprawdza GitHub Actions; ten test pilnuje, że kroki są.
// ============================================================================

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const workflow = readFileSync(join(root, '.github', 'workflows', 'e2e-ios.yml'), 'utf8');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const bundleId: string = appJson.expo.ios.bundleIdentifier;
const e2eDir = join(root, '.maestro', 'e2e');

describe('workflow E2E iOS (M1-audytor-generalny-037)', () => {
  it('buduje aplikację na symulator, bootuje symulator i instaluje build', () => {
    expect(workflow).toMatch(/expo prebuild --platform ios/);
    expect(workflow).toMatch(/xcodebuild[\s\S]*-sdk iphonesimulator/);
    expect(workflow).toMatch(/xcrun simctl boot/);
    expect(workflow).toMatch(/xcrun simctl install/);
  });

  it('uruchamia prawdziwe Maestro CLI, a nie interpreter w Jest', () => {
    expect(workflow).toMatch(/MAESTRO_VERSION:\s*["']?\d+\.\d+\.\d+/);
    expect(workflow).toMatch(/maestro\s+(--device\s+\S+\s+)?test\s+\.maestro\/e2e/);
    expect(workflow).not.toMatch(/jest tests\/maestro-flows/);
  });

  it('ma kontrolę negatywną, która musi paść', () => {
    expect(workflow).toMatch(/!\s*maestro\s+(--device\s+\S+\s+)?test\s+\.maestro\/kontrola-negatywna/);
  });

  it('uruchamia się na gałęziach napraw, nie tylko na master', () => {
    expect(workflow).toMatch(/naprawy\/\*\*/);
  });

  it('ma co najmniej 2 scenariusze E2E z appId zgodnym z app.json', () => {
    const flows = readdirSync(e2eDir).filter((f) => f.endsWith('.yaml'));
    expect(flows.length).toBeGreaterThanOrEqual(2);
    for (const f of flows) {
      const text = readFileSync(join(e2eDir, f), 'utf8');
      expect(text).toMatch(new RegExp(`^appId: ${bundleId.replace(/\./g, '\\.')}$`, 'm'));
    }
  });
});
