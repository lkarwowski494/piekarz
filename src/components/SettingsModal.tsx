import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { t, lang, setLang, Lang, useLang } from '../lib/i18n';
import { CloseButton } from './CloseButton';
import { exportBackup } from '../lib/backup';
import { getBakeLogs, getStarters, getRecipes } from '../data/sqlite-store';

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const currentLang = useLang();
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
  exportBtn: {
    minHeight: 44,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
