// ============================================================================
// Piekarz — propozycja Doktora po słabej ocenie wypieku (BR-DIAG-001, F-43, ZM-07)
// [M1-audytor-generalny-032; 03-zakres-013]
// ============================================================================

import { Alert } from 'react-native';
import { t } from './i18n';

/** Najwyższa ocena, przy której aplikacja proponuje Doktora (wybór produktowy właściciela, D-034). */
export const DOCTOR_SUGGESTION_MAX_STARS = 2;

/** Czy po zapisaniu tej oceny zaproponować Doktora. */
export function shouldSuggestDoctor(ratingStars: number): boolean {
  return ratingStars <= DOCTOR_SUGGESTION_MAX_STARS;
}

/**
 * Po zapisanym wpisie: przy ocenie ≤ 2★ pyta, czy otworzyć Doktora. Wpis jest już w historii,
 * więc odpowiedź niczego nie zmienia w danych (BR-DIAG-001, kryterium 2).
 * `openDoctor` przychodzi przez strażnika dostępu (chron('doktor', …)). `onNotNow`: „Nie teraz” zamyka propozycję
 * (tu rusza odłożona prośba o ocenę, D-089) [reaudit-noc N-12].
 */
export function suggestDoctorAfterRating(ratingStars: number, openDoctor: () => void, onNotNow?: () => void): void {
  if (!shouldSuggestDoctor(ratingStars)) return;
  Alert.alert(
    t('Sprawdzić przyczynę w Doktorze?'),
    t('Wpis jest w historii. Doktor Chleba podpowie, co zmienić przy następnym wypieku.'),
    [
      { text: t('Nie teraz'), style: 'cancel', onPress: onNotNow },
      { text: t('Otwórz Doktora Chleba'), onPress: openDoctor },
    ]
  );
}
