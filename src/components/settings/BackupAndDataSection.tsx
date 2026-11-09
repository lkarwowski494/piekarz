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
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WIERSZ, wierszUstawien } from './wiersz-ustawien';
import { kopiaRecznaUdana, useBladKopiiAuto } from '../../lib/kopia-auto-stan';
export function BackupAndDataSection() {
  const bladKopii = useBladKopiiAuto();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Pełny stan z bazy: dziennik zakwasu i spiżarnia w pliku (ADR-008) [M1-audytor-generalny-104]
      const success = await exportBackup(await collectBackupData());
      if (!success) {
        Alert.alert(t('Kopia zapasowa'), t('Nie udało się wyeksportować kopii'));
      } else {
        void kopiaRecznaUdana();
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
  // Kopie w aplikacji Pliki zostają (ostatnia droga odzyskania danych); okno mówi o tym wprost [audyt-niezalezny B-4]
  const handleDeleteAll = () => {
    Alert.alert(t('Usunąć wszystkie dane?'), t('Przed usunięciem zapiszę kopię obecnych danych. Kopie zapasowe zostają w aplikacji Pliki, w folderze tej aplikacji; tam możesz je usunąć.'), [
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
      {/* Kopia zapasowa: karta z ikoną, akcje jako wiersze; „Usuń wszystkie dane” w tej karcie, kolor błędu tylko na tej
          akcji (makieta inne.html #ustawienia, F-65) [M3 p5]. Handlery, potwierdzenie i kopia przed czyszczeniem bez zmian */}
      <Karta testID="karta-kopia" tytul={t('Kopia zapasowa')} ikona={<IkonaKarty nazwa="dysk" />}>
        <Text style={styles.cardDescription}>
          {t('Dane są zapisywane tylko w tym telefonie.')}
        </Text>
        {/* Nieudana kopia automatyczna po wypieku nie jest cicha [M1-audytor-generalny-016] */}
        {bladKopii !== null && (
          <Text style={styles.cardDescription} testID="kopia-auto-blad">
            {t('Ostatnia kopia automatyczna po wypieku nie zapisała się. Zapisz kopię ręcznie przyciskiem niżej.')}
          </Text>
        )}
        {/* Import kopii i receptury: jedno wejście „Importuj z pliku” (ImportRecepturySection) [M1-audytor-generalny-113] */}
        <View>
          <Pressable
            accessibilityRole="button"
            testID="export-backup-btn"
            style={styles.wiersz}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Text style={wierszUstawien.akcja}>
              {isExporting ? t('Eksportowanie...') : t('Eksportuj do pliku')}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" testID="delete-all-data-btn" style={styles.wiersz} onPress={handleDeleteAll}>
            <Text style={wierszUstawien.usun}>{t('Usuń wszystkie dane')}</Text>
          </Pressable>
        </View>
        <Text style={wierszUstawien.opis}>
          {t('Trzymam 10 ostatnich kopii na tym telefonie.')}
        </Text>
      </Karta>

      {/* CSV Export Section */}
      <Karta testID="karta-csv" tytul={t('Eksport arkuszy CSV')} ikona={<IkonaKarty nazwa="lista" />}>
        <Text style={styles.cardDescription}>
          {t('Eksportuj swoje dane do otwartego formatu CSV (zgodnego z Excel i arkuszami kalkulacyjnymi).')}
        </Text>
        <View>
          <Pressable
            accessibilityRole="button"
            testID="export-bakes-csv-btn"
            style={styles.wiersz}
            onPress={handleExportBakesCsv}
            disabled={isExportingCsv}
          >
            <Text style={wierszUstawien.akcja}>
              {isExportingCsv ? t('Eksportowanie...') : t('Eksportuj historię wypieków (CSV)')}
            </Text>
          </Pressable>
          {/* Spiżarnia mąk (F-30) PÓŹNIEJ: wejście ukryte, kod eksportu zostaje (D-043) [M1-audytor-generalny-117] */}
          {wejscieWidoczne('spizarnia') && (
            <Pressable
              accessibilityRole="button"
              testID="export-inventory-csv-btn"
              style={styles.wiersz}
              onPress={handleExportInventoryCsv}
              disabled={isExportingCsv}
            >
              <Text style={wierszUstawien.akcja}>
                {isExportingCsv ? t('Eksportowanie...') : t('Eksportuj spiżarnię mąk (CSV)')}
              </Text>
            </Pressable>
          )}
        </View>
      </Karta>
    </>
  );
}

const styles = StyleSheet.create({
  // Wiersz w karcie (README §2): min 52, linia nad wierszem
  wiersz: { minHeight: 52, ...WIERSZ },
  cardDescription: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
  },
});
