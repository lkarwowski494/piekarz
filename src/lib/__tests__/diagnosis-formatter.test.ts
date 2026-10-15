import * as Clipboard from 'expo-clipboard';
import { formatDiagnosisToText, copyDiagnosisToClipboard } from '../diagnosis-formatter';
import { DiagnosticResult } from '../../doctor/diagnostics';
import * as announceModule from '../announce';

describe('Diagnosis Formatter & Clipboard Specification (lib/diagnosis-formatter)', () => {
  const sampleDiagnosis: DiagnosticResult = {
    defectCode: 'UNDER_PROOFED',
    titlePl: 'Niedofermentowany bochenek (Under-proofed)',
    subtitlePl: 'Wielkie jaskinie na samej górze i zbity, ciężki dół miękiszu',
    biologicalCausePl:
      'Drożdże nie zdążyły wyprodukować wystarczającej ilości CO2 w całej objętości ciasta.',
    actionChecklistPl: [
      'Wydłuż fermentację burzliwą o 45-60 minut.',
      'Pilnuj temperatury ciasta (DDT min. 24°C).',
    ],
    severity: 'critical',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDiagnosisToText', () => {
    it('formats bread defect diagnosis with title, cause, and actionable checklist', () => {
      const text = formatDiagnosisToText(sampleDiagnosis);

      expect(text).toContain('🩺 Doktor Chleba: Niedofermentowany bochenek');
      expect(text).toContain('🔴 Wielkie jaskinie');
      expect(text).toContain('🧬 Przyczyna biologiczna / fizyczna:');
      expect(text).toContain('Drożdże nie zdążyły');
      expect(text).toContain('🛠️ Kroki naprawcze na kolejny wypiek:');
      expect(text).toContain('1. Wydłuż fermentację burzliwą');
      expect(text).toContain('2. Pilnuj temperatury ciasta');
      expect(text).toContain('Apps4Brew Studio');
    });

    it('uses correct severity emoji based on severity level', () => {
      const moderateDiag = { ...sampleDiagnosis, severity: 'moderate' as const };
      expect(formatDiagnosisToText(moderateDiag)).toContain('🟡');

      const mildDiag = { ...sampleDiagnosis, severity: 'mild' as const };
      expect(formatDiagnosisToText(mildDiag)).toContain('🟢');
    });
  });

  describe('copyDiagnosisToClipboard', () => {
    it('copies text to clipboard and announces to accessibility services', async () => {
      const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

      const result = await copyDiagnosisToClipboard(sampleDiagnosis);

      expect(result).toBe(true);
      expect(Clipboard.setStringAsync).toHaveBeenCalled();
      expect(announceSpy).toHaveBeenCalledWith('Skopiowano diagnozę do schowka');
    });
  });
});
