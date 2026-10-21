/**
 * Cienka warstwa kontaktu z autorem przez systemowe okno poczty (docs/wzrost/petla-opinii.md §2.4)
 * [M1-audytor-generalny-083; 11-wzrost-005]. Aplikacja niczego nie wysyła sama: okno poczty pokazuje
 * adres, temat i treść do zmiany, a wysyła użytkownik. Bez poczty: adres do skopiowania, bez mailto i sieci.
 */
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as MailComposer from 'expo-mail-composer';
import * as Clipboard from 'expo-clipboard';
import { SUPPORT_EMAIL } from './links';
import { lang, t } from './i18n';
import { czyAdresWsparcia, trescZgloszenia } from './zgloszenie';

function pokazAdres(adres: string): void {
  Alert.alert(t('Napisz do nas'), t('Poczta nie jest skonfigurowana na tym telefonie. Napisz na adres: {adres}', { adres }), [
    { text: t('Zamknij'), style: 'cancel' },
    { text: t('Kopiuj adres'), onPress: () => void Clipboard.setStringAsync(adres).catch(() => {}) },
  ]);
}

/** Wersja iOS z Platform.Version; brak odczytu to null („nieznana”), nigdy „undefined”. */
function wersjaIos(): string | null {
  if (Platform.OS !== 'ios') return null;
  const v: unknown = Platform.Version;
  if (typeof v === 'string' && v.length > 0) return v;
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : null;
}

export async function napiszDoAutora(): Promise<void> {
  const adres = SUPPORT_EMAIL;
  if (!czyAdresWsparcia(adres)) return;
  const { temat, tresc } = trescZgloszenia({
    wersja: Constants.expoConfig?.version ?? null,
    build: Constants.expoConfig?.ios?.buildNumber ?? null,
    systemIos: wersjaIos(),
    jezyk: lang(),
  });
  let dostepna: boolean;
  try {
    dostepna = await MailComposer.isAvailableAsync();
  } catch {
    dostepna = false;
  }
  if (!dostepna) {
    pokazAdres(adres);
    return;
  }
  try {
    // Wynik sent/saved/cancelled: nic nie robimy, treść nie zostaje w aplikacji (KM04).
    await MailComposer.composeAsync({ recipients: [adres], subject: temat, body: tresc, isHtml: false });
  } catch {
    pokazAdres(adres);
  }
}
