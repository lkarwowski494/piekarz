import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { t, lang, setLang, Lang, useLang } from '../lib/i18n';
import { CloseButton } from './CloseButton';
import { exportBackup, parseAndValidateBackup, safetyBackup } from '../lib/backup';
import {
  getBakeLogs,
  getStarters,
  getRecipes,
  restoreFromBackupData,
} from '../data/sqlite-store';

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const currentLang = useLang();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showImportInput, setShowImportInput] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [bakes, starters, recipes] = await Promise.all([
        getBakeLogs(),
        getStarters(),
        getRecipes(),
      ]);
      const success = await exportBackup({
        bakes,
        starters,
        customRecipes: recipes.filter((r) => !r.isBuiltIn),
      });
      if (!success) {
        Alert.alert(t('Kopia zapasowa'), t('Nie udało się wyeksportować kopii'));
      }
    } catch {
      Alert.alert(t('Kopia zapasowa'), t('Nie udało się wyeksportować kopii'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importJsonText.trim()) {
      Alert.alert(t('Kopia zapasowa'), t('Nieprawidłowy format JSON'));
      return;
    }
    setIsImporting(true);
    try {
      const envelope = parseAndValidateBackup(importJsonText);

      // Snapshot current state before applying changes (Safety Invariant ZP-06)
      const [bakes, starters, recipes] = await Promise.all([
        getBakeLogs(),
        getStarters(),
        getRecipes(),
      ]);
      const currentState = {
        bakes,
        starters,
        customRecipes: recipes.filter((r) => !r.isBuiltIn),
      };
      await safetyBackup('import', currentState);

      // Restore data inside transaction
      await restoreFromBackupData(envelope.state);

      Alert.alert(t('Kopia zapasowa'), t('Zaimportowano pomyślnie!'));
      setShowImportInput(false);
      setImportJsonText('');
    } catch (err: any) {
      Alert.alert(t('Kopia zapasowa'), err?.message || t('Nie udało się zaimportować kopii'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onClose} />
          <Text style={styles.headerTitle}>{t('Ustawienia')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Language Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Język')}</Text>
            <View style={styles.langRow}>
              <Pressable
                testID="lang-pl"
                style={[styles.langBtn, currentLang === 'pl' && styles.langBtnActive]}
                onPress={() => handleLanguageChange('pl')}
              >
                <Text style={[styles.langBtnText, currentLang === 'pl' && styles.langBtnTextActive]}>
                  🇵🇱 Polski
                </Text>
              </Pressable>
              <Pressable
                testID="lang-en"
                style={[styles.langBtn, currentLang === 'en' && styles.langBtnActive]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[styles.langBtnText, currentLang === 'en' && styles.langBtnTextActive]}>
                  🇬🇧 English
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Backup Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Kopia zapasowa')}</Text>
            <Text style={styles.cardDescription}>
              Twoje receptury i historia wypieków są zapisywane w lokalnej bazie danych SQLite.
            </Text>

            <View style={styles.backupButtonsRow}>
              <Pressable
                testID="export-backup-btn"
                style={styles.exportBtn}
                onPress={handleExport}
                disabled={isExporting}
              >
                <Text style={styles.exportBtnText}>
                  {isExporting ? '⏳ Eksportowanie...' : `📦 ${t('Eksportuj kopię')}`}
                </Text>
              </Pressable>

              <Pressable
                testID="import-backup-btn"
                style={styles.importBtn}
                onPress={() => setShowImportInput((prev) => !prev)}
                disabled={isImporting}
              >
                <Text style={styles.importBtnText}>📥 {t('Importuj kopię')}</Text>
              </Pressable>
            </View>

            {showImportInput && (
              <View style={styles.importBox}>
                <Text style={styles.importLabel}>
                  {t('Wklej zawartość pliku JSON kopii zapasowej:')}
                </Text>
                <TextInput
                  testID="import-json-input"
                  style={styles.importInput}
                  multiline
                  value={importJsonText}
                  onChangeText={setImportJsonText}
                  placeholder='{"format":"piekarz-backup",...}'
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.importActions}>
                  <Pressable
                    testID="confirm-import-btn"
                    style={styles.confirmImportBtn}
                    onPress={handleConfirmImport}
                    disabled={isImporting}
                  >
                    <Text style={styles.confirmImportBtnText}>
                      {isImporting ? '⏳ Importowanie...' : t('Zatwierdź import')}
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="cancel-import-btn"
                    style={styles.cancelImportBtn}
                    onPress={() => {
                      setShowImportInput(false);
                      setImportJsonText('');
                    }}
                    disabled={isImporting}
                  >
                    <Text style={styles.cancelImportBtnText}>{t('Anuluj')}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>
                🛡️ Automatyczna rotacja: 10 ostatnich kopii w katalogu Documents/Backup/
              </Text>
            </View>
          </View>

          {/* Security & Database Location */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Baza danych i bezpieczeństwo</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Lokalizacja bazy:</Text>
              <Text style={styles.codeText}>/Library/SQLite/piekarz.db</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tryb transakcji:</Text>
              <Text style={styles.valueText}>ACID / WAL mode</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Telemetria i chmura:</Text>
              <Text style={styles.statusOffText}>0% (Brak trackerów)</Text>
            </View>
          </View>

          {/* Apps4Brew Manifesto & Version */}
          <View style={styles.manifestoCard}>
            <Text style={styles.manifestoTitle}>Apps4Brew Studio</Text>
            <Text style={styles.manifestoText}>
              „Mąka, woda, sól i czas — rzemieślnicza precyzja bez kompromisów.”
            </Text>
            <Text style={styles.manifestoDetails}>
              Piekarz (Crust) v0.1.0 • 100% Offline-First • Data Not Collected • Licencja GPLv3
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  langRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  langBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  langBtnActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  langBtnTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  backupButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  exportBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  importBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  importBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  importBox: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  importLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  importInput: {
    height: 100,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    padding: 8,
    fontSize: 12,
    fontFamily: 'System',
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  importActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 8,
  },
  confirmImportBtn: {
    flex: 1,
    minHeight: 40,
    backgroundColor: theme.colors.accentDark,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmImportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelImportBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelImportBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  infoBadge: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  infoBadgeText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'System',
    color: theme.colors.accentDark,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statusOffText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.statusSuccess,
  },
  manifestoCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  manifestoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  manifestoText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  manifestoDetails: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
