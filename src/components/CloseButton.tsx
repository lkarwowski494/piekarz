import React from 'react';
import { HeaderButton } from './DraftHeader';
import { t } from '../lib/i18n';

/**
 * Zasada projektowa Apps4Brew (HIG Sheets / Modality):
 * Każde okno wysuwane z dołu lub modalne ma spójny przycisk zamknięcia
 * w nagłówku, z testID `close-modal`. Nazwa według słownika interakcji
 * (docs/design/design-spec.md §5): „Anuluj” w formularzu, „Zamknij” w arkuszu
 * informacyjnym i w ofercie [M1-audytor-generalny-089].
 */
export const CLOSE_TEST_ID = 'close-modal';

export interface CloseButtonProps {
  onPress: () => void;
  label?: string;
  /** „anuluj” (formularz, domyślnie) albo „zamknij” (arkusz informacyjny, oferta, ustawienia). */
  akcja?: 'anuluj' | 'zamknij';
}

/**
 * Przycisk „Anuluj” albo „Zamknij” w nagłówku arkusza / okna modalnego.
 */
export function CloseButton({ onPress, label, akcja = 'anuluj' }: CloseButtonProps) {
  return (
    <HeaderButton
      testID={CLOSE_TEST_ID}
      title={akcja === 'zamknij' ? t('Zamknij') : t('Anuluj')}
      label={label}
      onPress={onPress}
    />
  );
}
