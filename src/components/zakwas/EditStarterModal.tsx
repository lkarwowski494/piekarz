// ============================================================================
// Apps4Craft Studio — EditStarterModal Component
// Modal for editing starter name, flour type, and refrigeration storage state.
// Arkusz na kartach: „Anuluj” i „Zapisz” w pasku arkusza, profil i działania na zakwasie w karcie (README §1, §3)
// [M3 p7, 04-002].
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '@apps4craft/ui';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { formularz } from '../arkusz/style-formularza';
import { WyborPrzechowywania } from './WyborPrzechowywania';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export interface EditStarterModalProps {
  visible: boolean;
  name: string;
  onNameChange: (val: string) => void;
  flourType: string;
  onFlourTypeChange: (val: string) => void;
  storageState: 'ROOM_TEMP' | 'FRIDGE';
  onStorageStateChange: (state: 'ROOM_TEMP' | 'FRIDGE') => void;
  canDelete: boolean;
  onDelete: () => void;
  /** „Załóż zakwas od nowa” (BR-ZAKW-005): brak = bez przycisku. */
  onZalozOdNowa?: () => void;
  onClose: () => void;
  onSave: () => void;
}

export function EditStarterModal({
  visible,
  name,
  onNameChange,
  flourType,
  onFlourTypeChange,
  storageState,
  onStorageStateChange,
  canDelete,
  onDelete,
  onZalozOdNowa,
  onClose,
  onSave,
}: EditStarterModalProps) {
  return (
    <ArkuszKart
      visible={visible}
      onRequestClose={onClose}
      lewy={{ tekst: t('Anuluj'), onPress: onClose }}
      prawy={{ tekst: t('Zapisz'), onPress: onSave }}
    >
      <Karta testID="karta-edycja-zakwasu" tytul={t('Edytuj zakwas')} ikona={<IkonaKarty nazwa="sloik" />} podpis={t('Zmień parametry swojego zakwasu')}>
        <View style={formularz.grupa}>
          <Text style={formularz.etykieta}>{t('Imię zakwasu')}</Text>
          <TextInput
            accessibilityLabel={t('Imię zakwasu')}
            style={formularz.pole}
            value={name}
            onChangeText={onNameChange}
            placeholder={t('Imię zakwasu')}
          />
        </View>
        <View style={formularz.grupa}>
          <Text style={formularz.etykieta}>{t('Typ mąki')}</Text>
          <TextInput
            accessibilityLabel={t('Typ mąki')}
            style={formularz.pole}
            value={flourType}
            onChangeText={onFlourTypeChange}
            placeholder={t('Typ mąki')}
          />
        </View>
        <View style={formularz.grupa}>
          <Text style={formularz.etykieta}>{t('Miejsce przechowywania')}</Text>
          <WyborPrzechowywania wartosc={storageState} onZmiana={onStorageStateChange} kolejnosc={['FRIDGE', 'ROOM_TEMP']} />
        </View>

        {/* Zakładanie od nowa (BR-ZAKW-005, D-113): w Basic, także przy jedynym zakwasie [M3 P-a-fix P0-1] */}
        {onZalozOdNowa && (
          <Pressable
            accessibilityRole="button"
            testID="restart-starter-setup-btn"
            style={styles.zaloz}
            onPress={onZalozOdNowa}
            hitSlop={sharedCraftTokens.hitSlopStandard}
          >
            <Text style={styles.zalozTekst}>{t('Załóż zakwas od nowa')}</Text>
          </Pressable>
        )}
        {canDelete && (
          <Pressable
            accessibilityRole="button"
            testID="delete-starter-btn"
            style={styles.usun}
            onPress={onDelete}
            hitSlop={sharedCraftTokens.hitSlopStandard}
          >
            <Text style={styles.usunTekst}>{t('Usuń zakwas')}</Text>
          </Pressable>
        )}
      </Karta>
    </ArkuszKart>
  );
}

const styles = StyleSheet.create({
  zaloz: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.m,
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  zalozTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz2, textAlign: 'center' },
  usun: { minHeight: theme.cele.pozostale, justifyContent: 'center', alignItems: 'center' },
  usunTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.blad, fontWeight: '600' },
});
