// ============================================================================
// Piekarz — nazwy funkcji Pro i etykieta „{funkcja}, Pro” (kontrakt docs/monetyzacja.md „Reguły dostępu”: bez Pro widać,
// co jest Pro; przegląd P-a P2-4) [M3 P-b, D-117]. Oznaczenie jest tekstem, nie samym kolorem: ta sama etykieta trafia
// do VoiceOver i do pytań systemowych (Alert), gdzie nie ma miejsca na znacznik graficzny.
// ============================================================================

import { t } from '../i18n';
import type { Funkcja } from './konfiguracja';

/** Etykieta funkcji: bez dostępu do Pro „{funkcja}, Pro”, z dostępem sama nazwa. */
export function etykietaPro(nazwa: string, dostep: boolean): string {
  return dostep ? nazwa : t('{funkcja}, Pro', { funkcja: nazwa });
}

/** Nazwa obszaru funkcji Pro w wierszu blokady (BlokadaFunkcji); funkcja bez własnego obszaru: nazwa produktu. */
export function nazwaBlokady(funkcja: Funkcja): string {
  switch (funkcja) {
    case 'plan-wstecz':
      return t('Plan wstecz od godziny „gotowe”');
    case 'gotowosc-zakwasu':
      return t('Gotowość i szczyt zakwasu');
    case 'staly-dzien':
      return t('Stały dzień karmienia');
    case 'proporcje-zakwasu':
      return t('Proporcje dokarmiania');
    case 'porownanie':
      return t('Porównanie i statystyki');
    default:
      return t('Piekarz Pro');
  }
}
