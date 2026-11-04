// ============================================================================
// Apps4Craft Studio — AddStarterModal Component
// Modal for adding a new sourdough starter culture.
// Arkusz na kartach: „Anuluj” i „Zapisz” w pasku arkusza, profil w karcie (README §1, §3) [M3 p7, 04-002].
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { formularz } from '../arkusz/style-formularza';
import { useZmienionyFormularz } from '../arkusz/useZmienionyFormularz';
import { WyborPrzechowywania } from './WyborPrzechowywania';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export interface AddStarterModalProps {
  visible: boolean;
  name: string;
  onNameChange: (val: string) => void;
  flour: string;
  onFlourChange: (val: string) => void;
  storage: 'ROOM_TEMP' | 'FRIDGE';
  onStorageChange: (val: 'ROOM_TEMP' | 'FRIDGE') => void;
  onClose: () => void;
  onSave: () => void;
}

export function AddStarterModal({
  visible,
  name,
  onNameChange,
  flour,
  onFlourChange,
  storage,
  onStorageChange,
  onClose,
  onSave,
}: AddStarterModalProps) {
  const zmieniony = useZmienionyFormularz(visible, [name, flour, storage]);
  return (
    <ArkuszKart
      visible={visible}
      onRequestClose={onClose}
      zmieniony={zmieniony}
      lewy={{ tekst: t('Anuluj'), onPress: onClose, testID: 'cancel-add-starter-btn' }}
      prawy={{ tekst: t('Zapisz'), onPress: onSave, testID: 'save-new-starter-btn' }}
    >
      <Karta testID="karta-nowy-zakwas" tytul={t('Dodaj nowy zakwas')} ikona={<IkonaKarty nazwa="sloik" />} podpis={t('Utwórz profil dla nowej kultury zakwasu')}>
        <View style={formularz.grupa}>
          <Text style={formularz.etykieta}>{t('Imię zakwasu')}</Text>
          <TextInput
            accessibilityLabel={t('Imię zakwasu')}
            testID="new-starter-name-input"
            style={formularz.pole}
            value={name}
            onChangeText={onNameChange}
            placeholder={t('np. San Francisco White, Lievito...')}
            placeholderTextColor={theme.colors.tusz3}
          />
        </View>
        <View style={formularz.grupa}>
          <Text style={formularz.etykieta}>{t('Typ mąki')}</Text>
          <TextInput
            accessibilityLabel={t('Typ mąki')}
            testID="new-starter-flour-input"
            style={formularz.pole}
            value={flour}
            onChangeText={onFlourChange}
            placeholder={t('np. Mąka pszenna chlebowa t750')}
            placeholderTextColor={theme.colors.tusz3}
          />
        </View>
        <View style={formularz.grupa}>
          <Text style={formularz.etykieta}>{t('Miejsce przechowywania')}</Text>
          <WyborPrzechowywania wartosc={storage} onZmiana={onStorageChange} kolejnosc={['ROOM_TEMP', 'FRIDGE']} />
        </View>
      </Karta>
    </ArkuszKart>
  );
}
