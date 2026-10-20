// ============================================================================
// Piekarz (Crust) — Import Recipe Modal (BR-DANE-003)
// Paste, validate, and import artisan formulas from JSON.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, sharedCraftTokens } from '@apps4craft/ui';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { formatFixed } from '../lib/format';
import { StoredRecipe } from '../data/db';
import { saveRecipe } from '../data/sqlite-store';
import { decodeRecipeFromShareUrl } from '../lib/recipe-sharing';

export interface ImportRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess: (importedRecipe: StoredRecipe) => void;
  initialInput?: string;
}

export function ImportRecipeModal({
  visible,
  onClose,
  onImportSuccess,
  initialInput,
}: ImportRecipeModalProps) {
  const [jsonInput, setJsonInput] = useState<string>(initialInput || '');

  React.useEffect(() => {
    if (initialInput) {
      setJsonInput(initialInput);
    }
  }, [initialInput, visible]);

  const validation = useMemo(() => {
    const trimmed = jsonInput.trim();
    if (!trimmed) return null;
    return decodeRecipeFromShareUrl(trimmed);
  }, [jsonInput]);

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setJsonInput(text);
      }
    } catch {
      Alert.alert(t('Błąd schowka'), t('Nie udało się odczytać zawartości schowka.'));
    }
  };

  const handleClear = () => {
    setJsonInput('');
  };

  const handleConfirmImport = async () => {
    if (!validation || !validation.success) return;
    // Import działa zawsze, bez bramki (D-039); zapis dopiero po „Zaimportuj” [M1-audytor-generalny-026]
    try {
      await saveRecipe(validation.recipe);
      onImportSuccess(validation.recipe);
      setJsonInput('');
      onClose();
      Alert.alert(
        t('Zaimportowano recepturę'),
        t('Przepis „{name}” został pomyślnie dodany do Twojej bazy.', {
          name: validation.recipe.name,
        })
      );
    } catch {
      Alert.alert(t('Błąd zapisu'), t('Wystąpił błąd podczas zapisywania receptury do bazy SQLite.'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard} testID="import-recipe-modal">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.flex1}>
              <Text style={styles.title}>{t('Importuj recepturę')}</Text>
              <Text style={styles.subtitle}>{t('Wklej kod JSON udostępniony przez innego piekarza')}</Text>
            </View>
            <Pressable
              testID="close-import-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Zamknij')}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              style={styles.closeBtn}
            >
              <CloseIcon size={20} color={theme.colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            {/* Action Bar (Paste / Clear) */}
            <View style={styles.actionRow}>
              <Pressable
                testID="paste-clipboard-btn"
                accessibilityRole="button"
                accessibilityLabel={t('Wklej ze schowka')}
                style={styles.actionBtn}
                onPress={handlePasteClipboard}
              >
                <Text style={styles.actionBtnText}>📋 {t('Wklej ze schowka')}</Text>
              </Pressable>
              {jsonInput.length > 0 && (
                <Pressable
                  testID="clear-json-btn"
                  accessibilityRole="button"
                  accessibilityLabel={t('Wyczyść')}
                  style={[styles.actionBtn, styles.clearBtn]}
                  onPress={handleClear}
                >
                  <Text style={styles.clearBtnText}>{t('Wyczyść')}</Text>
                </Pressable>
              )}
            </View>

            {/* JSON Text Input */}
            <TextInput
              testID="recipe-json-input"
              style={styles.jsonInput}
              multiline
              placeholder={t('Wklej kod JSON receptury tutaj...')}
              placeholderTextColor={theme.colors.textMuted}
              value={jsonInput}
              onChangeText={setJsonInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Validation States */}
            {validation === null && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  💡 {t('Możesz zaimportować plik JSON wygenerowany z Piekarza lub ręcznie przygotowany szablon.')}
                </Text>
              </View>
            )}

            {validation && !validation.success && (
              <View style={styles.errorBox} testID="import-error-box">
                <Text style={styles.errorTitle}>⚠️ {t('Nieprawidłowy format')}</Text>
                <Text style={styles.errorText}>{validation.error}</Text>
              </View>
            )}

            {validation && validation.success && (
              <View style={styles.previewCard} testID="import-preview-card">
                <View style={styles.previewHeader}>
                  <Text style={styles.previewBadge}>✓ {t('Poprawna formuła')}</Text>
                  <Text style={styles.previewDdt}>DDT: {validation.recipe.targetDDT}°C</Text>
                </View>

                <Text style={styles.previewName}>{validation.recipe.name}</Text>
                {validation.recipe.notes ? (
                  <Text style={styles.previewNotes}>{validation.recipe.notes}</Text>
                ) : null}

                <View style={styles.divider} />

                <Text style={styles.previewSectionTitle}>{t('Mieszanka mąk (100%):')}</Text>
                {validation.recipe.formula.flours.map((f, idx) => (
                  <View key={idx} style={styles.flourRow}>
                    <Text style={styles.flourBullet}>•</Text>
                    <Text style={styles.flourName}>{f.name}</Text>
                    <Text style={styles.flourPct}>{formatFixed(f.percentage, 1)}%</Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>{t('Woda')}</Text>
                    <Text style={styles.metricValue}>
                      {formatFixed(validation.recipe.formula.waterPercentage, 1)}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>{t('Sól')}</Text>
                    <Text style={styles.metricValue}>
                      {formatFixed(validation.recipe.formula.saltPercentage, 1)}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>{t('Zakwas')}</Text>
                    <Text style={styles.metricValue}>
                      {formatFixed(validation.recipe.formula.starterPercentage, 1)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              testID="cancel-import-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Anuluj')}
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>{t('Anuluj')}</Text>
            </Pressable>

            <Pressable
              testID="confirm-import-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Zaimportuj przepis')}
              disabled={!validation || !validation.success}
              style={[
                styles.confirmBtn,
                (!validation || !validation.success) && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirmImport}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  (!validation || !validation.success) && styles.confirmBtnTextDisabled,
                ]}
              >
                {t('Zaimportuj przepis')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 18, 11, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  scrollArea: {
    maxHeight: 450,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.crustGold,
  },
  clearBtn: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  clearBtnText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  jsonInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.textPrimary,
    minHeight: 120,
    maxHeight: 180,
    textAlignVertical: 'top',
  },
  hintBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hintText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  errorBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#FDF2F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8A399',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A02010',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#A02010',
    lineHeight: 18,
  },
  previewCard: {
    marginTop: 14,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.crustGold,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'uppercase',
  },
  previewDdt: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  previewNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  previewSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  flourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flourBullet: {
    fontSize: 14,
    color: theme.colors.crustGold,
    marginRight: 6,
  },
  flourName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  flourPct: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.crustGold,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.crustGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
});
