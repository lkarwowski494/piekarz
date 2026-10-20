import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { DiagnosticResult } from '../doctor/diagnostics';
import { t } from './i18n';
import { announce } from './announce';

export function formatDiagnosisToText(diag: DiagnosticResult): string {
  // Poziom tekstem, jak plakietka w DiagnosisResultCard (emoji nie są ikonami, 088)
  const poziom =
    diag.severity === 'critical'
      ? t('Krytyczny błąd struktury')
      : diag.severity === 'moderate'
        ? t('Umiarkowana wada')
        : t('Drobna niedoskonałość');

  const lines: string[] = [];
  lines.push(`${t('Doktor Chleba')}: ${diag.titlePl}`);
  lines.push(`${poziom}: ${diag.subtitlePl}`);
  lines.push('');
  lines.push(`${t('Przyczyna biologiczna / fizyczna')}:`);
  lines.push(diag.biologicalCausePl);
  lines.push('');
  lines.push(`${t('Kroki naprawcze na kolejny wypiek')}:`);
  diag.actionChecklistPl.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item}`);
  });
  lines.push('');
  lines.push('— Apps4Craft Studio • Piekarz');
  return lines.join('\n');
}

export async function copyDiagnosisToClipboard(diag: DiagnosticResult): Promise<boolean> {
  const text = formatDiagnosisToText(diag);
  await Clipboard.setStringAsync(text);
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Non-native fallback
  }
  announce(t('Skopiowano diagnozę do schowka'));
  return true;
}
