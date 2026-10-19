import { Alert } from 'react-native';
import { t } from './i18n';
import { StorageWriteError, StorageReadOnlyError } from '../data/storage-status';

/** Treść komunikatu „Nie zapisano”: baza nowsza niż aplikacja albo błąd zapisu [M1-audytor-generalny-061]. */
export function saveErrorText(e: StorageWriteError): string {
  return e instanceof StorageReadOnlyError
    ? t('Dane zapisała nowsza wersja Piekarza. Zaktualizuj aplikację, żeby dalej zapisywać. Do tego czasu możesz tylko przeglądać.')
    : t('Zmiana nie została zapisana w pamięci telefonu. Sprawdź wolne miejsce i spróbuj ponownie.');
}

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
        Alert.alert(t('Nie zapisano'), saveErrorText(e));
        return;
      }
      throw e;
    }
  };
}
