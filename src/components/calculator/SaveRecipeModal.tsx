// ============================================================================
// Apps4Craft Studio — SaveRecipeModal Component
// Modal for saving custom bread recipe formula into SQLite database.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '@apps4craft/ui';

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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('Zapisz przepis')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Wprowadź unikalną nazwę dla tej proporcji składników')}
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder={t('Wpisz nazwę przepisu')}
            placeholderTextColor={theme.colors.tusz3}
            value={recipeName}
            onChangeText={onRecipeNameChange}
            autoFocus
          />

          <View style={styles.modalButtonsRow}>
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
    maxWidth: 400,
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
  modalInput: {
    backgroundColor: theme.colors.tlo,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.tusz,
    marginBottom: 18,
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
