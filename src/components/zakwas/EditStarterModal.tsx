// ============================================================================
// Apps4Craft Studio — EditStarterModal Component
// Modal for editing starter name, flour type, and refrigeration storage state.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '@apps4craft/ui';

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
  onClose,
  onSave,
}: EditStarterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('Edytuj zakwas')}</Text>
          <Text style={styles.modalSubtitle}>{t('Zmień parametry swojego zakwasu')}</Text>

          {/* Name input */}
          <Text style={styles.modalInputLabel}>{t('Imię zakwasu')}</Text>
          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={onNameChange}
            placeholder={t('Imię zakwasu')}
          />

          {/* Flour type input */}
          <Text style={styles.modalInputLabel}>{t('Typ mąki')}</Text>
          <TextInput
            style={styles.modalInput}
            value={flourType}
            onChangeText={onFlourTypeChange}
            placeholder={t('Typ mąki')}
          />

          {/* Storage state toggle */}
          <Text style={styles.modalInputLabel}>{t('Miejsce przechowywania')}</Text>
          <View style={styles.storageToggleRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: storageState === 'FRIDGE' }}
              style={[styles.storageBtn, storageState === 'FRIDGE' && styles.storageBtnActive]}
              onPress={() => onStorageStateChange('FRIDGE')}
            >
              <Text style={[styles.storageBtnText, storageState === 'FRIDGE' && styles.storageBtnTextActive]}>
                {t('W lodówce (4°C)')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: storageState === 'ROOM_TEMP' }}
              style={[styles.storageBtn, storageState === 'ROOM_TEMP' && styles.storageBtnActive]}
              onPress={() => onStorageStateChange('ROOM_TEMP')}
            >
              <Text style={[styles.storageBtnText, storageState === 'ROOM_TEMP' && styles.storageBtnTextActive]}>
                {t('Temperatura pokojowa')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalButtonsRow}>
            {canDelete && (
              <Pressable
                accessibilityRole="button"
                testID="delete-starter-btn"
                style={styles.modalDeleteBtn}
                onPress={onDelete}
                hitSlop={sharedCraftTokens.hitSlopStandard}
              >
                <Text style={styles.modalDeleteBtnText}>{t('Usuń zakwas')}</Text>
              </Pressable>
            )}
            <View style={styles.modalRightButtons}>
              <Pressable
                accessibilityRole="button"
                style={styles.modalCancelBtn}
                onPress={onClose}
                hitSlop={sharedCraftTokens.hitSlopStandard}
              >
                <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.modalConfirmBtn}
                onPress={onSave}
                hitSlop={sharedCraftTokens.hitSlopStandard}
              >
                <Text style={styles.modalConfirmBtnText}>{t('Zapisz profil')}</Text>
              </Pressable>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDeleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalDeleteBtnText: {
    fontSize: 13,
    color: theme.colors.blad,
    fontWeight: '600',
  },
  modalRightButtons: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 'auto',
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
