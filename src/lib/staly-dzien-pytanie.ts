// ============================================================================
// Piekarz — pytanie po dokarmieniu zakwasu w inny dzień niż stały (BR-KAL-010 „Karmienie w inny dzień”; D-110) [M3 D7]
// Pytanie systemowe (Alert, jak D5/D6): „Zostaw: {stały dzień}” albo „Licz od: {dzień dokarmienia}”; decyzja „licz od”
// zapisuje nowy dzień przez saveStarter (UPSERT, ta sama godzina) i uzgadnia przypomnienia. Wołają: karta zakwasu
// (zapis dokarmienia) i „Zrobione” na „Dziś”. Bez stałego dnia albo w stały dzień — bez pytania (null).
// ============================================================================

import { Alert } from 'react-native';
import { pytanieOStalyDzien } from '../core/notification-feeding';
import { stalyDzienPoDecyzji, type DecyzjaStalegoDnia } from '../core/staly-dzien';
import { getStarters, saveStarter } from '../data/sqlite-store';
import { t } from './i18n';
import { nazwaDniaTygodnia } from './kalendarz-widok';
import { resyncNotifications } from './notifications';

/** Pyta, czy zostawić stały dzień, czy liczyć od dnia dokarmienia, i zapisuje decyzję; null = bez pytania. */
export async function zapytajOStalyDzien(starterId: string, fedAt: number): Promise<DecyzjaStalegoDnia | null> {
  const s = (await getStarters()).find((x) => x.id === starterId);
  const p = s ? pytanieOStalyDzien(s, fedAt) : null;
  if (!s || !p) return null;
  const staly = nazwaDniaTygodnia(p.stalyDzien);
  const dzien = nazwaDniaTygodnia(p.dzienKarmienia);
  const decyzja = await new Promise<DecyzjaStalegoDnia>((resolve) => {
    Alert.alert(
      t('Stały dzień karmienia'),
      t('Stały dzień karmienia to {staly}, a zakwas dokarmiono w dniu: {dzien}.', { staly, dzien }),
      [
        { text: t('Zostaw: {dzien}', { dzien: staly }), style: 'cancel', onPress: () => resolve('zostaw') },
        { text: t('Licz od: {dzien}', { dzien }), onPress: () => resolve('licz-od') },
      ],
      { cancelable: true, onDismiss: () => resolve('zostaw') }
    );
  });
  if (decyzja === 'licz-od') {
    await saveStarter({ ...s, fridgeFeedDay: stalyDzienPoDecyzji(s, fedAt, decyzja) });
    void resyncNotifications();
  }
  return decyzja;
}
