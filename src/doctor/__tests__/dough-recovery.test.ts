import {
  DOUGH_RECOVERY_PROTOCOLS,
  getDoughRecoveryProtocol,
  searchDoughRecoveryProtocols,
} from '../dough-recovery';

// F-71 (rola 06, 2026-10-22): focaccia, foremka keksowa i proteazy wycofane bez źródła (RAT-PRZ-900/901, RAT-LUZ-900);
// teksty pilnuje tests/tresci-f71.test.ts, tu tylko logika wyszukiwania i kompletność.
describe('Emergency Dough Recovery Protocols (doctor/dough-recovery)', () => {
  it('retrieves the over-proofed protocol: re-shape and proof again (RAT-PRZ-003)', () => {
    const proto = getDoughRecoveryProtocol('OVERPROOFED_COLLAPSE');
    expect(proto.id).toBe('OVERPROOFED_COLLAPSE');
    expect(proto.stepByStepPl.length).toBeGreaterThanOrEqual(4);
    expect(proto.stepByStepPl.join(' ')).toContain('Uformuj je ponownie');
  });

  it('retrieves the slack dough protocol: check salt, fold (RAT-SOL-001, KRO-POC-006)', () => {
    const proto = getDoughRecoveryProtocol('SLACK_HIGH_HYDRATION');
    expect(proto.id).toBe('SLACK_HIGH_HYDRATION');
    expect(proto.immediateActionPl).toContain('sól');
    expect(proto.stepByStepPl.length).toBeGreaterThanOrEqual(3);
  });

  it('searches protocols accurately by keyword', () => {
    const przerosniete = searchDoughRecoveryProtocols('przerośnięte');
    expect(przerosniete.length).toBe(1);
    expect(przerosniete[0].id).toBe('OVERPROOFED_COLLAPSE');

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
      expect(proto.scientificReasoningPl.length).toBeGreaterThan(15);
      expect(proto.stepByStepPl.length).toBeGreaterThanOrEqual(3);
      for (const step of proto.stepByStepPl) {
        expect(step.trim().length).toBeGreaterThan(5);
      }
    }
  });
});
