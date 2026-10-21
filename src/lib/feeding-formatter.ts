import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { StarterFeedingResult } from '../core/domain-rules';
import { StoredStarter } from '../data/db';
import { t } from './i18n';
import { announce } from './announce';
import { formatWeight } from './unit-converter';

export function formatFeedingToText(
  starter: StoredStarter,
  feeding: StarterFeedingResult,
  ratio: [number, number, number]
): string {
  const lines: string[] = [];
  lines.push(`${t('Dokarmienie zakwasu')}: ${starter.name}`);
  lines.push(`${t('Proporcja')}: 1:${ratio[1]}:${ratio[2]}`);
  // Masy w jednostkach z ustawienia (design-spec §7, D-044) [M1-audytor-generalny-096]
  // Nazwy jak na karcie „Ilości do dokarmienia” i porada w języku interfejsu [reaudit-noc N-5]
  lines.push(`${t('Potrzebny zakwas')}: ${formatWeight(feeding.targetYieldGrams)}`);
  lines.push('');
  lines.push(`${t('Składniki do słoika')}:`);
  lines.push(`1. ${t('Stary zakwas')}: ${formatWeight(feeding.starterGrams)}`);
  lines.push(`2. ${t('Mąka')} (${starter.flourType}): ${formatWeight(feeding.flourGrams)}`);
  lines.push(`3. ${t('Woda')}: ${formatWeight(feeding.waterGrams)}`);
  lines.push('');
  if (feeding.tipPl) {
    lines.push(t(feeding.tipPl));
  }
  lines.push('— Apps4Craft Studio • Piekarz');
  return lines.join('\n');
}

export async function copyFeedingToClipboard(
  starter: StoredStarter,
  feeding: StarterFeedingResult,
  ratio: [number, number, number]
): Promise<boolean> {
  const text = formatFeedingToText(starter, feeding, ratio);
  await Clipboard.setStringAsync(text);
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Non-native fallback
  }
  announce(t('Skopiowano dokarmienie do schowka'));
  return true;
}
