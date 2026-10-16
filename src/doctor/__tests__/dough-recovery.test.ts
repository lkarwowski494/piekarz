import {
  DOUGH_RECOVERY_PROTOCOLS,
  getDoughRecoveryProtocol,
  searchDoughRecoveryProtocols,
  EmergencyCode,
} from '../dough-recovery';

describe('Emergency Dough Recovery Protocols (doctor/dough-recovery)', () => {
  it('retrieves Focaccia Pivot protocol for overproofed collapse', () => {
    const proto = getDoughRecoveryProtocol('OVERPROOFED_COLLAPSE');
    expect(proto.id).toBe('OVERPROOFED_COLLAPSE');
    expect(proto.pivotRecipeNamePl).toContain('Focaccia');
    expect(proto.stepByStepPl.length).toBeGreaterThanOrEqual(4);
    expect(proto.scientificReasoningPl).toContain('proteazy');
  });

  it('retrieves Tin Loaf protocol for slack / high-hydration dough', () => {
    const proto = getDoughRecoveryProtocol('SLACK_HIGH_HYDRATION');
    expect(proto.id).toBe('SLACK_HIGH_HYDRATION');
    expect(proto.pivotRecipeNamePl).toContain('foremkowy');
    expect(proto.stepByStepPl.length).toBeGreaterThanOrEqual(4);
  });

  it('searches protocols accurately by keyword', () => {
    const focacciaResults = searchDoughRecoveryProtocols('focaccia');
    expect(focacciaResults.length).toBe(1);
    expect(focacciaResults[0].id).toBe('OVERPROOFED_COLLAPSE');

    const saltResults = searchDoughRecoveryProtocols('sól');
    expect(saltResults.length).toBeGreaterThanOrEqual(1);
    expect(saltResults.some((p) => p.id === 'FORGOTTEN_SALT')).toBe(true);

    const allResults = searchDoughRecoveryProtocols('');
    expect(allResults.length).toBe(DOUGH_RECOVERY_PROTOCOLS.length);
  });

  it('verifies integrity of all recovery protocols', () => {
    for (const proto of DOUGH_RECOVERY_PROTOCOLS) {
      expect(proto.titlePl.length).toBeGreaterThan(5);
      expect(proto.triggerSummaryPl.length).toBeGreaterThan(10);
      expect(proto.immediateActionPl.length).toBeGreaterThan(10);
      expect(proto.pivotRecipeNamePl.length).toBeGreaterThan(3);
      expect(proto.scientificReasoningPl.length).toBeGreaterThan(15);
      expect(proto.stepByStepPl.length).toBeGreaterThanOrEqual(3);
      for (const step of proto.stepByStepPl) {
        expect(step.trim().length).toBeGreaterThan(5);
      }
    }
  });
});
