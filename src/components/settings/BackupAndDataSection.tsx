import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { exportBackup, parseAndValidateBackup, safetyBackup } from '../../lib/backup';
import { StorageWriteError } from '../../data/storage-status';
import { saveErrorText } from '../../lib/save-guard';
import { resyncNotifications } from '../../lib/notifications';
import {
  getBakeLogs,
  getFlourInventory,
  collectBackupData,
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
      // Pełny stan z bazy: dziennik zakwasu i spiżarnia w pliku (ADR-008) [M1-audytor-generalny-104]
      const success = await exportBackup(await collectBackupData());
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

      // Kopia przed importem z pełnego stanu bazy, z dziennikiem zakwasu i spiżarnią (ZP-06, ADR-008) [M1-audytor-generalny-104]
      await safetyBackup('import', await collectBackupData());

      // Restore data inside transaction
      await restoreFromBackupData(envelope.state);
      void resyncNotifications(); // przypomnienia dla zaimportowanych zakwasów (ADR-006)

      Alert.alert(
        t('Kopia zapasowa'),
        envelope.skippedRows > 0
          ? t('Zaimportowano. Pominięto uszkodzone wpisy: {count}.', { count: envelope.skippedRows })
          : t('Zaimportowano pomyślnie!')
      );
      setShowImportInput(false);
      setImportJsonText('');
    } catch (err: unknown) {
      if (err instanceof StorageWriteError) {
        Alert.alert(t('Nie zapisano'), saveErrorText(err));
        return;
      }
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
          {t('Dane są zapisywane tylko w tym telefonie.')}
        </Text>

        <View style={styles.backupButtonsRow}>
          <Pressable
            accessibilityRole="button"
            testID="export-backup-btn"
            style={styles.exportBtn}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Text style={styles.exportBtnText}>
              {isExporting ? t('Eksportowanie...') : t('Eksportuj do pliku')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            testID="import-backup-btn"
            style={styles.importBtn}
            onPress={() => setShowImportInput((prev) => !prev)}
            disabled={isImporting}
          >
            <Text style={styles.importBtnText}>{t('Importuj z pliku')}</Text>
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
              placeholderTextColor={theme.colors.tusz3}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.importActions}>
              <Pressable
                accessibilityRole="button"
                testID="confirm-import-btn"
                style={styles.confirmImportBtn}
                onPress={handleConfirmImport}
                disabled={isImporting}
              >
                <Text style={styles.confirmImportBtnText}>
                  {isImporting ? t('Importowanie...') : t('Zatwierdź import')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
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
            {t('Trzymam 10 ostatnich kopii na tym telefonie.')}
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
            accessibilityRole="button"
            testID="export-bakes-csv-btn"
            style={styles.csvBtn}
            onPress={handleExportBakesCsv}
            disabled={isExportingCsv}
          >
            <Text style={styles.csvBtnText}>
              {isExportingCsv ? t('Eksportowanie...') : t('Eksportuj historię wypieków (CSV)')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            testID="export-inventory-csv-btn"
            style={styles.csvBtn}
            onPress={handleExportInventoryCsv}
            disabled={isExportingCsv}
          >
            <Text style={styles.csvBtnText}>
              {isExportingCsv ? t('Eksportowanie...') : t('Eksportuj spiżarnię mąk (CSV)')}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  sectionTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.tusz2,
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
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  exportBtnText: {
    color: theme.colors.naAkcencie,
    fontSize: 14,
    fontWeight: '700',
  },
  importBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  importBtnText: {
    color: theme.colors.tusz,
    fontSize: 14,
    fontWeight: '700',
  },
  importBox: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  importLabel: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginBottom: theme.spacing.xs,
  },
  importInput: {
    minHeight: 80,
    backgroundColor: theme.colors.tlo,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.tusz,
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
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmImportBtnText: {
    color: theme.colors.naAkcencie,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelImportBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelImportBtnText: {
    color: theme.colors.tusz,
    fontSize: 13,
  },
  infoBadge: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
  },
  infoBadgeText: {
    fontSize: 12,
    color: theme.colors.tusz3,
  },
  csvButtonsCol: {
    gap: theme.spacing.sm,
  },
  csvBtn: {
    minHeight: 44,
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  csvBtnText: {
    color: theme.colors.tusz,
    fontSize: 14,
    fontWeight: '700',
  },
});
