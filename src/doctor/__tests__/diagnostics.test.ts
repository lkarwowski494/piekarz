import { diagnoseBreadDefect } from '../diagnostics';

describe('Piekarz „Doktor Chleba” Diagnostics Engine (BR-DIAG-001…004)', () => {
  it('Identifies under-proofed loaf with huge top holes and dense bottom', () => {
    const result = diagnoseBreadDefect({
      crumbHasHugeTopHolesWithDenseBottom: true,
    });

    expect(result.defectCode).toBe('UNDER_PROOFED');
    expect(result.titlePl).toContain('Niedofermentowanie');
    expect(result.actionChecklistPl.some((a) => a.includes('fermentację burzliwą'))).toBe(true);
  });

  it('Identifies over-proofed collapsed loaf', () => {
    const result = diagnoseBreadDefect({
      loafCollapsedAfterScoring: true,
    });

    expect(result.defectCode).toBe('OVER_PROOFED');
    expect(result.titlePl).toContain('Przekwaszenie');
    expect(result.actionChecklistPl.some((a) => a.includes('garowania'))).toBe(true);
  });

  it('Identifies side blowout from poor scoring / lack of steam', () => {
    const result = diagnoseBreadDefect({
      loafBurstAtBottomSide: true,
    });

    expect(result.defectCode).toBe('SIDE_BLOWOUT');
    expect(result.titlePl).toContain('Pęknięcie boku');
  });

  it('Warns against cutting steaming hot bread', () => {
    const result = diagnoseBreadDefect({
      cutImmediatelyWhileSteamingHot: true,
    });

    expect(result.defectCode).toBe('GUMMY_CRUMB');
    expect(result.titlePl).toContain('Gumowaty');
  });
});
