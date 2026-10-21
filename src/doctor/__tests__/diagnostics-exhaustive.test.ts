import {
  diagnoseBreadDefect,
  BreadDefectCode,
  BreadInspectionCriteria,
} from '../diagnostics';

describe('Exhaustive Bread Doctor Diagnostics Matrix (BR-DIAG-EXHAUSTIVE)', () => {
  // --------------------------------------------------------------------------
  // 1. Isolated Coverage for All 9 Bread Defect Codes
  // --------------------------------------------------------------------------
  describe('All 9 Bread Defect Codes Reachability', () => {
    const testCases: Array<{
      expectedCode: BreadDefectCode;
      symptoms: BreadInspectionCriteria;
      expectedKeywordInTitle: string;
      expectedSeverity: 'mild' | 'moderate' | 'critical';
    }> = [
      {
        expectedCode: 'GUMMY_CRUMB',
        symptoms: { cutImmediatelyWhileSteamingHot: true },
        expectedKeywordInTitle: 'Gumowaty',
        expectedSeverity: 'moderate',
      },
      {
        expectedCode: 'GUMMY_CRUMB',
        symptoms: { crumbIsWetGummyToKnife: true },
        expectedKeywordInTitle: 'Gumowaty',
        expectedSeverity: 'moderate',
      },
      {
        expectedCode: 'UNDER_PROOFED',
        symptoms: { crumbHasHugeTopHolesWithDenseBottom: true },
        expectedKeywordInTitle: 'Niedofermentowanie',
        expectedSeverity: 'critical',
      },
      {
        expectedCode: 'OVER_PROOFED',
        symptoms: { loafCollapsedAfterScoring: true },
        expectedKeywordInTitle: 'Przekwaszenie',
        expectedSeverity: 'critical',
      },
      {
        expectedCode: 'OVER_PROOFED',
        symptoms: { loafIsFlatLikeDisk: true },
        expectedKeywordInTitle: 'Przekwaszenie',
        expectedSeverity: 'critical',
      },
      {
        expectedCode: 'OVER_PROOFED',
        symptoms: { crumbHasSmallUniformFoamLikeHoles: true },
        expectedKeywordInTitle: 'Przekwaszenie',
        expectedSeverity: 'critical',
      },
      {
        expectedCode: 'SIDE_BLOWOUT',
        symptoms: { loafBurstAtBottomSide: true },
        expectedKeywordInTitle: 'Pęknięcie boku',
        expectedSeverity: 'moderate',
      },
      {
        expectedCode: 'LACK_OF_EAR',
        symptoms: { crustLacksEarCutDidNotOpen: true },
        expectedKeywordInTitle: 'Brak uniesionego ucha',
        expectedSeverity: 'mild',
      },
      {
        expectedCode: 'PALE_CRUST',
        symptoms: { crustIsPaleLackColor: true },
        expectedKeywordInTitle: 'Blada skórka',
        expectedSeverity: 'mild',
      },
      {
        expectedCode: 'EXCESSIVELY_SOUR',
        symptoms: { breadIsExcessivelySour: true },
        expectedKeywordInTitle: 'Zbyt kwaśny',
        expectedSeverity: 'moderate',
      },
      {
        expectedCode: 'BLAND_FLAVOR',
        symptoms: { breadIsBlandNoFlavor: true },
        expectedKeywordInTitle: 'Płaski smak',
        expectedSeverity: 'mild',
      },
      {
        expectedCode: 'DENSE_CRUMB',
        symptoms: { crumbIsUniformlyDenseAllOver: true },
        expectedKeywordInTitle: 'Zbity, gęsty miękisz',
        expectedSeverity: 'moderate',
      },
      {
        expectedCode: 'DENSE_CRUMB',
        symptoms: {},
        expectedKeywordInTitle: 'Zbity, gęsty miękisz',
        expectedSeverity: 'moderate',
      },
    ];

    testCases.forEach(({ expectedCode, symptoms, expectedKeywordInTitle, expectedSeverity }, idx) => {
      it(`[Case ${idx + 1}] identifies ${expectedCode} with severity ${expectedSeverity}`, () => {
        const result = diagnoseBreadDefect(symptoms);
        expect(result.defectCode).toBe(expectedCode);
        expect(result.titlePl).toContain(expectedKeywordInTitle);
        expect(result.severity).toBe(expectedSeverity);
        expect(result.biologicalCausePl.length).toBeGreaterThan(15);
        expect(result.actionChecklistPl.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. Conflict Resolution & Precedence Hierarchy
  // --------------------------------------------------------------------------
  describe('Diagnostic Precedence Hierarchy', () => {
    it('cutting hot bread (gummy crumb) takes precedence over all crumb hole assessments', () => {
      // If user cut hot bread, holes and crumb cannot be accurately evaluated
      const result = diagnoseBreadDefect({
        cutImmediatelyWhileSteamingHot: true,
        crumbHasHugeTopHolesWithDenseBottom: true,
        crumbHasSmallUniformFoamLikeHoles: true,
      });

      expect(result.defectCode).toBe('GUMMY_CRUMB');
      // oczekiwany tekst z docs/tresci/pl/doktor-chleba.md [M1-audytor-generalny-133]
      expect(result.actionChecklistPl.some((a) => a.includes('całkowicie ostygnie'))).toBe(true);
    });

    it('under-proofed flying crust takes precedence over over-proofed flat disk when both checked', () => {
      const result = diagnoseBreadDefect({
        crumbHasHugeTopHolesWithDenseBottom: true,
        loafIsFlatLikeDisk: true,
      });

      expect(result.defectCode).toBe('UNDER_PROOFED');
    });

    it('side blowout takes precedence over aesthetic lack of ear', () => {
      const result = diagnoseBreadDefect({
        loafBurstAtBottomSide: true,
        crustLacksEarCutDidNotOpen: true,
      });

      expect(result.defectCode).toBe('SIDE_BLOWOUT');
      expect(result.actionChecklistPl.some((a) => a.includes('garnk'))).toBe(true);
    });

    it('over-proofed collapsed loaf takes precedence over pale crust', () => {
      const result = diagnoseBreadDefect({
        loafCollapsedAfterScoring: true,
        crustIsPaleLackColor: true,
      });

      expect(result.defectCode).toBe('OVER_PROOFED');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Actionability & Scientific Rigor of Recommendations
  // --------------------------------------------------------------------------
  describe('Biological Cause Explanations & Actionability', () => {
    it('under-proofed defect explains gas distribution and provides Poke Test advice', () => {
      const result = diagnoseBreadDefect({ crumbHasHugeTopHolesWithDenseBottom: true });
      expect(result.biologicalCausePl).toContain('Drożdże');
      expect(result.actionChecklistPl.some((a) => a.includes('test palca'))).toBe(true);
      // Rada o temperaturze ciasta nazywa akcję w aplikacji (temperatura wody w recepturze), nie dawny „kalkulator DDT” [M1-audytor-generalny-113]
      expect(result.actionChecklistPl.some((a) => a.startsWith('Policz temperaturę wody w recepturze:'))).toBe(true);
    });

    it('over-proofed defect explains gluten breakdown and protease activity', () => {
      const result = diagnoseBreadDefect({ loafCollapsedAfterScoring: true });
      expect(result.biologicalCausePl).toContain('kwasu mlekowego');
      expect(result.actionChecklistPl.some((a) => a.includes('lodówki'))).toBe(true);
    });

    it('excessively sour defect: cause from KWA-GLO/HYD/TEM, without Acetobacter (163)', () => {
      const result = diagnoseBreadDefect({ breadIsExcessivelySour: true });
      expect(result.biologicalCausePl).toContain('niedokarmionym zakwasem');
      expect(result.biologicalCausePl).not.toContain('Acetobacter'); // brak twierdzenia [M1-audytor-generalny-163]
      // oczekiwany tekst z docs/tresci/pl/doktor-chleba.md [M1-audytor-generalny-133]
      expect(result.actionChecklistPl.some((a) => a.includes('Dokarmiaj zakwas częściej'))).toBe(true);
    });

    it('dense crumb defect recommends hydration increase and protein flour check', () => {
      const result = diagnoseBreadDefect({ crumbIsUniformlyDenseAllOver: true });
      expect(result.actionChecklistPl.some((a) => a.includes('hydratację'))).toBe(true);
      expect(result.actionChecklistPl.some((a) => a.includes('białka'))).toBe(true);
    });
  });
});
