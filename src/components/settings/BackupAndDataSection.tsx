import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { exportBackup } from '../../lib/backup';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';
import { guardSave } from '../../lib/save-guard';
import { resyncNotifications } from '../../lib/notifications';
import { usunWszystkieDane } from '../../data/usun-wszystko';
import {
  getBakeLogs,
  getFlourInventory,
  collectBackupData,
} from '../../data/sqlite-store';
import {
  exportBakeLogsCsv,
  exportFlourInventoryCsv,
  exportAndShareCsv,
} from '../../lib/csv-exporter';

import { typografia } from '../../ui/tokeny';
export function BackupAndDataSection() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

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

  // „Usuń wszystkie dane” z potwierdzeniem (design-spec: „Usunąć wszystkie dane?” [Anuluj] [Usuń wszystko]);
  // kopia przed czyszczeniem w usunWszystkieDane, nieudana kopia: „Nie zapisano” [M1-audytor-generalny-124]
  const usunWszystko = guardSave(async () => {
    await usunWszystkieDane();
    await resyncNotifications();
  });
  const handleDeleteAll = () => {
    Alert.alert(t('Usunąć wszystkie dane?'), undefined, [
      { text: t('Anuluj'), style: 'cancel' },
      { text: t('Usuń wszystko'), style: 'destructive', onPress: () => void usunWszystko() },
    ]);
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

  return (
    <>
      {/* Backup Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Kopia zapasowa')}</Text>
        <Text style={styles.cardDescription}>
          {t('Dane są zapisywane tylko w tym telefonie.')}
        </Text>

        {/* Import kopii i receptury: jedno wejście „Importuj z pliku” (ImportRecepturySection) [M1-audytor-generalny-113] */}
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
        </View>

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
          {/* Spiżarnia mąk (F-30) PÓŹNIEJ: wejście ukryte, kod eksportu zostaje (D-043) [M1-audytor-generalny-117] */}
          {wejscieWidoczne('spizarnia') && (
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
          )}
        </View>
      </View>

      {/* Usunięcie wszystkich danych (F-65): kolor błędu tylko na tej akcji (design-spec, inne.html us.usun) */}
      <View style={styles.card}>
        <Pressable accessibilityRole="button" testID="delete-all-data-btn" style={styles.deleteRow} onPress={handleDeleteAll}>
          <Text style={styles.deleteText}>{t('Usuń wszystkie dane')}</Text>
        </Pressable>
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
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: typografia.style.przypis.pt,
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
  infoBadge: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
  },
  infoBadgeText: {
    fontSize: typografia.style.podpis.pt,
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
  deleteRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteText: {
    color: theme.colors.blad,
    fontSize: 14,
    fontWeight: '700',
  },
});
