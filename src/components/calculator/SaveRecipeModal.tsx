// ============================================================================
// Apps4Craft Studio — SaveRecipeModal Component
// Modal for saving custom bread recipe formula into SQLite database.
// Arkusz na kartach: „Anuluj” i „Zapisz” w pasku arkusza, nazwa w karcie (README §1, §3) [M3 p7, 04-002].
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { TextInput } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { formularz } from '../arkusz/style-formularza';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export interface SaveRecipeModalProps {
  visible: boolean;
  recipeName: string;
  onRecipeNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function SaveRecipeModal({
  visible,
  recipeName,
  onRecipeNameChange,
  onClose,
  onSave,
}: SaveRecipeModalProps) {
  return (
    <ArkuszKart
      visible={visible}
      onRequestClose={onClose}
      lewy={{ tekst: t('Anuluj'), onPress: onClose }}
      prawy={{ tekst: t('Zapisz'), onPress: onSave }}
    >
      <Karta testID="karta-zapisz-recepture" tytul={t('Zapisz jako moją')} ikona={<IkonaKarty nazwa="receptury" />}
        podpis={t('Wprowadź unikalną nazwę dla tej proporcji składników')}>
        <TextInput
          accessibilityLabel={t('Wpisz nazwę przepisu')}
          style={formularz.pole}
          placeholder={t('Wpisz nazwę przepisu')}
          placeholderTextColor={theme.colors.tusz3}
          value={recipeName}
          onChangeText={onRecipeNameChange}
          autoFocus
        />
      </Karta>
    </ArkuszKart>
  );
}
