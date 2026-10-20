// ============================================================================
// Apps4Craft Studio — AddStarterModal Component
// Modal for adding a new sourdough starter culture.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '@apps4craft/ui';

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
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('Dodaj nowy zakwas')}</Text>
          <Text style={styles.modalSubtitle}>{t('Utwórz profil dla nowej kultury zakwasu')}</Text>

          {/* Name input */}
          <Text style={styles.modalInputLabel}>{t('Imię zakwasu')}</Text>
          <TextInput
            testID="new-starter-name-input"
            style={styles.modalInput}
            value={name}
            onChangeText={onNameChange}
            placeholder={t('np. San Francisco White, Lievito...')}
            placeholderTextColor={theme.colors.tusz3}
          />

          {/* Flour type input */}
          <Text style={styles.modalInputLabel}>{t('Typ mąki')}</Text>
          <TextInput
            testID="new-starter-flour-input"
            style={styles.modalInput}
            value={flour}
            onChangeText={onFlourChange}
            placeholder={t('np. Mąka pszenna chlebowa t750')}
            placeholderTextColor={theme.colors.tusz3}
          />

          {/* Storage toggle */}
          <Text style={styles.modalInputLabel}>{t('Miejsce przechowywania')}</Text>
          <View style={styles.storageToggleRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: storage === 'ROOM_TEMP' }}
              style={[styles.storageBtn, storage === 'ROOM_TEMP' && styles.storageBtnActive]}
              onPress={() => onStorageChange('ROOM_TEMP')}
            >
              <Text style={[styles.storageBtnText, storage === 'ROOM_TEMP' && styles.storageBtnTextActive]}>
                {t('Temperatura pokojowa')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: storage === 'FRIDGE' }}
              style={[styles.storageBtn, storage === 'FRIDGE' && styles.storageBtnActive]}
              onPress={() => onStorageChange('FRIDGE')}
            >
              <Text style={[styles.storageBtnText, storage === 'FRIDGE' && styles.storageBtnTextActive]}>
                {t('W lodówce (4°C)')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalButtonsRow}>
            <Pressable
              accessibilityRole="button"
              testID="cancel-add-starter-btn"
              style={styles.modalCancelBtn}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
            >
              <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              testID="save-new-starter-btn"
              style={styles.modalConfirmBtn}
              onPress={onSave}
              hitSlop={sharedCraftTokens.hitSlopStandard}
            >
              <Text style={styles.modalConfirmBtnText}>{t('Zapisz')}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.tusz3,
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: theme.colors.tlo,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.tusz,
    marginBottom: 14,
  },
  storageToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  storageBtn: {
    flex: 1,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  storageBtnActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  storageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  storageBtnTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: theme.colors.tusz3,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
});
