import { Alert } from 'react-native';
import { t } from './i18n';
import { StorageWriteError } from '../data/storage-status';

/**
 * Obsługa nieudanego zapisu w akcjach ekranu [M1-audytor-generalny-003]: błąd bazy daje komunikat
 * „Nie zapisano” zamiast cichego sukcesu; inne błędy przechodzą dalej.
 */
export function guardSave<A extends unknown[]>(action: (...args: A) => Promise<void>): (...args: A) => Promise<void> {
  return async (...args: A) => {
    try {
      await action(...args);
    } catch (e) {
      if (e instanceof StorageWriteError) {
        Alert.alert(
          t('Nie zapisano'),
          t('Zmiana nie została zapisana w pamięci telefonu. Sprawdź wolne miejsce i spróbuj ponownie.')
        );
        return;
      }
      throw e;
    }
  };
}
