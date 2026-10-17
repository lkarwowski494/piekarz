// ============================================================================
// Piekarz (Crust) — Maestro E2E Flows in Jest (BR-TEST-037 & NFR-TEST-001)
// Executes .maestro/*.yaml in-memory flows across Monday, Sunday, and 23:55 UTC.
// ============================================================================

import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { executeMaestroFlowFile, parseMaestroYaml } from './maestro-runner';

describe('Maestro In-Memory Runner Suite (BR-TEST-037)', () => {
  const maestroDir = join(__dirname, '..', '.maestro');
  const flowFiles = readdirSync(maestroDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => join(maestroDir, f));

  const TEMPORAL_CHECKPOINTS = [
    { label: 'Monday 10:00 UTC (Workday)', date: new Date('2026-10-19T10:00:00Z') },
    { label: 'Sunday 10:00 UTC (Weekend bake)', date: new Date('2026-10-18T10:00:00Z') },
    { label: 'Saturday 23:55 UTC (Midnight boundary)', date: new Date('2026-10-17T23:55:00Z') },
  ];

  it('verifies that at least 4 maestro flows exist in .maestro directory', () => {
    expect(flowFiles.length).toBeGreaterThanOrEqual(4);
  });

  describe.each(TEMPORAL_CHECKPOINTS)('Temporal context: $label', ({ date }) => {
    test.each(flowFiles)('executes flow %s without assertions failing', (filePath) => {
      expect(() => {
        executeMaestroFlowFile(filePath, { now: date });
      }).not.toThrow();
    });
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
