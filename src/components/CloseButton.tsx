import React from 'react';
import { HeaderButton } from './DraftHeader';
import { t } from '../lib/i18n';

/**
 * Zasada projektowa Apps4Brew (HIG Sheets / Modality):
 * Każde okno wysuwane z dołu lub modalne ma spójny przycisk zamknięcia
 * po LEWEJ stronie nagłówka — „Anuluj”, z testID `close-modal`.
 */
export const CLOSE_TEST_ID = 'close-modal';

export interface CloseButtonProps {
  onPress: () => void;
  label?: string;
}

/**
 * Przycisk „Anuluj” z lewej strony nagłówka arkusza / okna modalnego.
 */
export function CloseButton({ onPress, label }: CloseButtonProps) {
  return (
    <HeaderButton
      testID={CLOSE_TEST_ID}
      title={t('Anuluj')}
      label={label}
      onPress={onPress}
    />
  );
}
