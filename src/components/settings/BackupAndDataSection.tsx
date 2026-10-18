import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { exportBackup, parseAndValidateBackup, safetyBackup } from '../../lib/backup';
import {
  getBakeLogs,
  getStarters,
  getRecipes,
  getFlourInventory,
  restoreFromBackupData,
} from '../../data/sqlite-store';
import {
  exportBakeLogsCsv,
  exportFlourInventoryCsv,
  exportAndShareCsv,
} from '../../lib/csv-exporter';

export function BackupAndDataSection() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
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

  const handleExportBakesCsv = async () => {
    setIsExportingCsv(true);
    try {
      const bakes = await getBakeLogs();
      const csv = exportBakeLogsCsv(bakes);
      const filename = `piekarz-historia-wypiekow-${new Date().toISOString().slice(0, 10)}.csv`;
      const success = await exportAndShareCsv(filename, csv, t('Eksportuj historię wypieków (CSV)'));
      if (!success) {
        Alert.alert(t('Eksport CSV'), t('Nie udało się wyeksportować pliku CSV'));
      }
    } catch {
      Alert.alert(t('Eksport CSV'), t('Nie udało się wyeksportować pliku CSV'));
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportInventoryCsv = async () => {
    setIsExportingCsv(true);
    try {
      const inventory = await getFlourInventory();
      const csv = exportFlourInventoryCsv(inventory);
      const filename = `piekarz-spizarnia-mak-${new Date().toISOString().slice(0, 10)}.csv`;
      const success = await exportAndShareCsv(filename, csv, t('Eksportuj spiżarnię mąk (CSV)'));
      if (!success) {
        Alert.alert(t('Eksport CSV'), t('Nie udało się wyeksportować pliku CSV'));
      }
    } catch {
      Alert.alert(t('Eksport CSV'), t('Nie udało się wyeksportować pliku CSV'));
    } finally {
      setIsExportingCsv(false);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Nie udało się zaimportować kopii');
      Alert.alert(t('Kopia zapasowa'), msg);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {/* Backup Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Kopia zapasowa')}</Text>
        <Text style={styles.cardDescription}>
          {t('Twoje receptury i historia wypieków są zapisywane w lokalnej bazie danych SQLite.')}
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
            🛡️ {t('Automatyczna rotacja: 10 ostatnich kopii w katalogu Documents/Backup/')}
          </Text>
        </View>
      </View>

      {/* CSV Export Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Eksport arkuszy CSV')}</Text>
        <Text style={styles.cardDescription}>
          {t('Eksportuj swoje dane do otwartego formatu CSV (zgodnego z Excel i arkuszami kalkulacyjnymi).')}
        </Text>
        <View style={styles.csvButtonsCol}>
          <Pressable
            testID="export-bakes-csv-btn"
            style={styles.csvBtn}
            onPress={handleExportBakesCsv}
            disabled={isExportingCsv}
          >
            <Text style={styles.csvBtnText}>
              {isExportingCsv ? '⏳ Eksportowanie...' : `📊 ${t('Eksportuj historię wypieków (CSV)')}`}
            </Text>
          </Pressable>
          <Pressable
            testID="export-inventory-csv-btn"
            style={styles.csvBtn}
            onPress={handleExportInventoryCsv}
            disabled={isExportingCsv}
          >
            <Text style={styles.csvBtnText}>
              {isExportingCsv ? '⏳ Eksportowanie...' : `🌾 ${t('Eksportuj spiżarnię mąk (CSV)')}`}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
    color: '#121214',
    fontSize: 14,
    fontWeight: '700',
  },
  importBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  importLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  importInput: {
    minHeight: 80,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  importActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  confirmImportBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmImportBtnText: {
    color: '#121214',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelImportBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelImportBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  infoBadge: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
  },
  infoBadgeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  csvButtonsCol: {
    gap: theme.spacing.sm,
  },
  csvBtn: {
    minHeight: 44,
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  csvBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
