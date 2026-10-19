// ============================================================================
// Piekarz — „Przywróć zakupy” z komunikatem (MON-03) [M1-audytor-generalny-010; 02-monetyzacja-003].
// Wspólne dla ekranu zakupu i Ustawień. Synchronizacja ze sklepem tylko na wyraźne żądanie użytkownika
// (AppStore.sync w adapterze); błąd połączenia to nie brak zakupu, więc ma osobny komunikat.
// ============================================================================

import { Alert } from 'react-native';
import { t } from '../lib/i18n';

export type Przywracanie = () => Promise<boolean | void> | boolean | void;

/** Wywołuje przywracanie i mówi użytkownikowi, jaki jest wynik. Zwraca true, gdy jest dostęp. */
export async function przywrocZKomunikatem(przywroc: Przywracanie): Promise<boolean> {
  try {
    const ok = (await przywroc()) === true;
    Alert.alert(t('Przywróć zakupy'), ok ? t('Zakupy zostały pomyślnie przywrócone') : t('Nie znaleziono aktywnych zakupów'));
    return ok;
  } catch {
    Alert.alert(t('Przywróć zakupy'), t('Nie udało się połączyć z App Store. Spróbuj ponownie.'));
    return false;
  }
}
