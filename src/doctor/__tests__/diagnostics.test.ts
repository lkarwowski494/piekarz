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

  it('Identifies excessively sour vinegar bread and suggests feeding frequency / temperature', () => {
    const result = diagnoseBreadDefect({
      breadIsExcessivelySour: true,
    });

    expect(result.defectCode).toBe('EXCESSIVELY_SOUR');
    expect(result.titlePl).toContain('Zbyt kwaśny');
    expect(result.biologicalCausePl).toContain('Acetobacter');
    // oczekiwany tekst z docs/tresci/pl/doktor-chleba.md [M1-audytor-generalny-133]
    expect(result.actionChecklistPl.some((a) => a.includes('Dokarmiaj zakwas częściej'))).toBe(true);
  });

  it('Identifies bland flavor from short fermentation and suggests cold retard', () => {
    const result = diagnoseBreadDefect({
      breadIsBlandNoFlavor: true,
    });

    expect(result.defectCode).toBe('BLAND_FLAVOR');
    expect(result.titlePl).toContain('Płaski smak');
    // oczekiwany tekst z docs/tresci/pl/doktor-chleba.md [M1-audytor-generalny-133]
    expect(result.actionChecklistPl.some((a) => a.includes('Garuj ciasto w lodówce'))).toBe(true);
  });
});
