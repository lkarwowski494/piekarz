// ============================================================================
// Piekarz — jedno wejście „Drukuj” w akcjach Kalkulatora (BR-DRUK-001, F-50, ZM-13, D-034 wybór 7b)
// [M1-audytor-generalny-032]. Karta receptury A4 albo etykieta słoika zakwasu; PDF lokalnie,
// dalej systemowy podgląd druku lub udostępniania.
// ============================================================================

import { Alert } from 'react-native';
import { t } from './i18n';
import { getStarters } from '../data/sqlite-store';
import type { StoredStarter } from '../data/db';
import { exportStarterLabelAsPdf } from './pdf-sheet-generator';
import type { StarterJarLabelOptions } from './pdf-sheet-generator';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Dane etykiety z zapisanego zakwasu; wiek liczony jak na ekranie Zakwasu. */
export function starterLabelOptions(starter: StoredStarter, now: number): StarterJarLabelOptions {
  return {
    starterName: starter.name,
    flourType: starter.flourType,
    hydration: starter.hydration,
    storageState: starter.storageState,
    ageDays: Math.floor(Math.max(0, now - starter.birthDate) / DAY_MS),
    feedingRatio: starter.feedingRatio,
  };
}

async function printLabel(starter: StoredStarter): Promise<void> {
  try {
    await exportStarterLabelAsPdf(starterLabelOptions(starter, Date.now()), true);
  } catch {
    Alert.alert(t('Etykieta zakwasu'), t('Nie udało się wygenerować etykiety PDF'));
  }
}

/** Etykieta słoika: bez zakwasu komunikat (kryterium 3), przy kilku wybór zakwasu. */
export async function printStarterJarLabel(): Promise<void> {
  const starters = await getStarters();
  if (starters.length === 0) {
    Alert.alert(t('Etykieta słoika zakwasu'), t('Najpierw dodaj zakwas w zakładce Zakwas.'));
    return;
  }
  if (starters.length === 1) {
    await printLabel(starters[0]);
    return;
  }
  Alert.alert(t('Który zakwas?'), undefined, [
    ...starters.map((s) => ({ text: s.name, onPress: () => void printLabel(s) })),
    { text: t('Anuluj'), style: 'cancel' as const },
  ]);
}

/** Okno wyboru po dotknięciu „Drukuj”. `printRecipe` drukuje kartę bieżącej receptury. */
export function openPrintMenu(printRecipe: () => void | Promise<void>): void {
  Alert.alert(t('Drukuj'), t('Co chcesz wydrukować?'), [
    { text: t('Karta receptury A4'), onPress: () => void printRecipe() },
    { text: t('Etykieta słoika zakwasu'), onPress: () => void printStarterJarLabel() },
    { text: t('Anuluj'), style: 'cancel' },
  ]);
}
