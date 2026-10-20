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
import { useMotyw } from '../ui/motyw';
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
  const motyw = useMotyw();
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
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
              <CloseIcon size={20} color={motyw.kolory.tusz} />
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
              placeholderTextColor={theme.colors.tusz3}
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
                    <Text style={styles.metricLabel}>{t('Zakwas|składnik')}</Text>
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
    backgroundColor: theme.colors.tlo,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.powierzchnia,
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
    color: theme.colors.tusz,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.tusz2,
    marginTop: 2,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.linia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: theme.colors.tusz,
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
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
  },
  clearBtn: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  clearBtnText: {
    fontSize: 13,
    color: theme.colors.tusz3,
  },
  jsonInput: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.tusz,
    minHeight: 120,
    maxHeight: 180,
    textAlignVertical: 'top',
  },
  hintBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  hintText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    lineHeight: 18,
  },
  errorBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.blad,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.blad,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.tusz,
    lineHeight: 18,
  },
  previewCard: {
    marginTop: 14,
    padding: 16,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.akcent,
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
    color: theme.colors.akcentTekst,
    textTransform: 'uppercase',
  },
  previewDdt: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  previewNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.tusz2,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.linia,
    marginVertical: 10,
  },
  previewSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
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
    color: theme.colors.akcentTekst,
    marginRight: 6,
  },
  flourName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.tusz,
  },
  flourPct: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz,
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
    color: theme.colors.tusz2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
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
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  confirmBtnTextDisabled: {
    color: theme.colors.tusz3,
  },
});
