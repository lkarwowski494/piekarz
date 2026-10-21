// ============================================================================
// Piekarz (Crust) — Maestro E2E Flows in Jest (BR-TEST-037 & NFR-TEST-001)
// Executes .maestro/*.yaml flows once, in memory (not E2E). The interpreter does not read the clock,
// so one run per flow; a run per date would repeat the same check [M2-koordynator-napraw-p12c2-001].
// ============================================================================

import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { executeMaestroFlowFile, parseMaestroYaml } from './maestro-runner';

describe('Maestro In-Memory Runner Suite (BR-TEST-037)', () => {
  const maestroDir = join(__dirname, '..', '.maestro');
  const flowFiles = readdirSync(maestroDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => join(maestroDir, f));

  it('verifies that at least 4 maestro flows exist in .maestro directory', () => {
    expect(flowFiles.length).toBeGreaterThanOrEqual(4);
  });

  test.each(flowFiles)('executes flow %s without assertions failing', (filePath) => {
    expect(() => {
      executeMaestroFlowFile(filePath, { now: new Date() });
    }).not.toThrow();
  });

  it('fails cleanly when an invalid element assertion is encountered in flow', () => {
    const brokenYaml = `
appId: com.apps4craft.piekarz
---
- launchApp
- assertVisible: "Nieistniejący Element Ekranu 12345"
`;
    const steps = parseMaestroYaml(brokenYaml);
    const { MaestroInterpreter } = require('./maestro-runner');
    const runner = new MaestroInterpreter({ now: new Date() });

    expect(() => {
      runner.runSteps(steps);
    }).toThrow(/assertVisible failed/);
  });
});
