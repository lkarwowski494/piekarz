import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { StarterFeedingResult } from '../core/domain-rules';
import { StoredStarter } from '../data/db';
import { t } from './i18n';
import { announce } from './announce';

export function formatFeedingToText(
  starter: StoredStarter,
  feeding: StarterFeedingResult,
  ratio: [number, number, number]
): string {
  const lines: string[] = [];
  lines.push(`🥣 ${t('Dokarmienie zakwasu')}: ${starter.name}`);
  lines.push(`⚖️ ${t('Proporcja')}: 1:${ratio[1]}:${ratio[2]}`);
  lines.push(`🎯 ${t('Docelowa masa zaczynu')}: ${feeding.targetYieldGrams} g`);
  lines.push('');
  lines.push(`📋 ${t('Składniki do słoika')}:`);
  lines.push(`1. 🫙 ${t('Zakwas matka')}: ${feeding.starterGrams} g`);
  lines.push(`2. 🌾 ${t('Mąka')} (${starter.flourType}): ${feeding.flourGrams} g`);
  lines.push(`3. 💧 ${t('Woda')}: ${feeding.waterGrams} g`);
  lines.push('');
  if (feeding.tipPl) {
    lines.push(`💡 ${feeding.tipPl}`);
  }
  lines.push('— Apps4Brew Studio • Piekarz 🥖');
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
