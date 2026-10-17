import React, { useState, useEffect } from 'react';
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
  getFlourInventory,
  restoreFromBackupData,
  getBakerRitualProfile,
  setBakerRitualProfile,
  BakerRitualProfile,
  getBakingVessel,
  setBakingVessel,
  BakingVessel,
} from '../data/sqlite-store';
import { useUnitSystem, setUnitSystem } from '../lib/unit-converter';
import {
  exportBakeLogsCsv,
  exportFlourInventoryCsv,
  exportAndShareCsv,
} from '../lib/csv-exporter';
import {
  CRAFT_APPS,
  NaparAppIcon,
  PiekarzAppIcon,
  SloikAppIcon,
  MasazAppIcon,
  FermentAppIcon,
} from '@apps4craft/ui';

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const currentLang = useLang();
  const unitSystem = useUnitSystem();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [showImportInput, setShowImportInput] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Craft Ritual Profile & Equipment
  const [ritualProfile, setRitualProfileState] = useState<BakerRitualProfile>('artisan_hybrid');
  const [bakingVessel, setBakingVesselState] = useState<BakingVessel>('dutch_oven');

  useEffect(() => {
    if (visible) {
      void getBakerRitualProfile().then(setRitualProfileState);
      void getBakingVessel().then(setBakingVesselState);
    }
  }, [visible]);

  const handleProfileChange = async (p: BakerRitualProfile) => {
    setRitualProfileState(p);
    await setBakerRitualProfile(p);
  };

  const handleVesselChange = async (v: BakingVessel) => {
    setBakingVesselState(v);
    await setBakingVessel(v);
  };

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
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onClose} />
          <Text style={styles.headerTitle}>{t('Ustawienia')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Baking Ritual Profile Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Rytuał piekarski')}</Text>
            <Text style={styles.cardDescription}>
              {t('Wybierz styl prowadzenia ciasta i filozofię wypieku:')}
            </Text>
            <View style={styles.optionsCol}>
              <Pressable
                testID="ritual-purist-btn"
                style={[styles.optionCard, ritualProfile === 'sourdough_purist' && styles.optionCardActive]}
                onPress={() => handleProfileChange('sourdough_purist')}
              >
                <Text style={styles.optionEmoji}>🌾</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, ritualProfile === 'sourdough_purist' && styles.optionTitleActive]}>
                    {t('Klasyczny Zakwasowiec')}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {t('Dziki zakwas, 100% naturalna fermentacja, długi rozrost w chłodzie (4°C) i garnek żeliwny. Zero drożdży komercyjnych.')}
                  </Text>
                </View>
                {ritualProfile === 'sourdough_purist' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>

              <Pressable
                testID="ritual-hybrid-btn"
                style={[styles.optionCard, ritualProfile === 'artisan_hybrid' && styles.optionCardActive]}
                onPress={() => handleProfileChange('artisan_hybrid')}
              >
                <Text style={styles.optionEmoji}>🥖</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, ritualProfile === 'artisan_hybrid' && styles.optionTitleActive]}>
                    {t('Nowoczesny Rzemieślnik')}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {t('Zakwas, prefermenty (biga, poolish), ciabatty, bagietki, focaccia i chleby mieszane. Pełna swoboda technik.')}
                  </Text>
                </View>
                {ritualProfile === 'artisan_hybrid' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>

              <Pressable
                testID="ritual-beginner-btn"
                style={[styles.optionCard, ritualProfile === 'beginner' && styles.optionCardActive]}
                onPress={() => handleProfileChange('beginner')}
              >
                <Text style={styles.optionEmoji}>🍞</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, ritualProfile === 'beginner' && styles.optionTitleActive]}>
                    {t('Początkujący Piekarz')}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {t('Przewidywalne receptury z bezpieczną hydratacją (65–68%), proste prowadzenie za rękę i brak skomplikowanych wzorów.')}
                  </Text>
                </View>
                {ritualProfile === 'beginner' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            </View>
          </View>

          {/* Baking Equipment Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Sprzęt i naczynie do wypieku')}</Text>
            <Text style={styles.cardDescription}>
              {t('Wybierz domyślne naczynie piecowe dla procedury Stolnicy:')}
            </Text>
            <View style={styles.optionsCol}>
              <Pressable
                testID="vessel-dutch-oven-btn"
                style={[styles.optionCard, bakingVessel === 'dutch_oven' && styles.optionCardActive]}
                onPress={() => handleVesselChange('dutch_oven')}
              >
                <Text style={styles.optionEmoji}>🍲</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, bakingVessel === 'dutch_oven' && styles.optionTitleActive]}>
                    {t('Garnek żeliwny (Dutch Oven)')}
                  </Text>
                </View>
                {bakingVessel === 'dutch_oven' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>

              <Pressable
                testID="vessel-cloche-btn"
                style={[styles.optionCard, bakingVessel === 'cloche' && styles.optionCardActive]}
                onPress={() => handleVesselChange('cloche')}
              >
                <Text style={styles.optionEmoji}>🏺</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, bakingVessel === 'cloche' && styles.optionTitleActive]}>
                    {t('Klosz ceramiczny (Cloche)')}
                  </Text>
                </View>
                {bakingVessel === 'cloche' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>

              <Pressable
                testID="vessel-steel-btn"
                style={[styles.optionCard, bakingVessel === 'baking_steel' && styles.optionCardActive]}
                onPress={() => handleVesselChange('baking_steel')}
              >
                <Text style={styles.optionEmoji}>🛡️</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, bakingVessel === 'baking_steel' && styles.optionTitleActive]}>
                    {t('Stal / Kamień szamotowy')}
                  </Text>
                </View>
                {bakingVessel === 'baking_steel' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>

              <Pressable
                testID="vessel-pullman-btn"
                style={[styles.optionCard, bakingVessel === 'pullman_pan' && styles.optionCardActive]}
                onPress={() => handleVesselChange('pullman_pan')}
              >
                <Text style={styles.optionEmoji}>🍞</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, bakingVessel === 'pullman_pan' && styles.optionTitleActive]}>
                    {t('Foremka z pokrywą (Pullman)')}
                  </Text>
                </View>
                {bakingVessel === 'pullman_pan' && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            </View>
          </View>

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

          {/* Unit System Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Jednostki miar')}</Text>
            <View style={styles.langRow}>
              <Pressable
                testID="unit-metric"
                style={[styles.langBtn, unitSystem === 'metric' && styles.langBtnActive]}
                onPress={() => setUnitSystem('metric')}
              >
                <Text style={[styles.langBtnText, unitSystem === 'metric' && styles.langBtnTextActive]}>
                  ⚖️ {t('Metryczne (°C, g)')}
                </Text>
              </Pressable>
              <Pressable
                testID="unit-imperial"
                style={[styles.langBtn, unitSystem === 'imperial' && styles.langBtnActive]}
                onPress={() => setUnitSystem('imperial')}
              >
                <Text style={[styles.langBtnText, unitSystem === 'imperial' && styles.langBtnTextActive]}>
                  🌡️ {t('Imperialne (°F, oz)')}
                </Text>
              </Pressable>
            </View>
          </View>

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

          {/* Apps4Craft Studio Family Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Rodzina Apps4Craft Studio')}</Text>
            <Text style={styles.cardDescription}>
              {t('Rzemieślnicze aplikacje kulinarne offline-first. Zero chmury, zero telemetrii, 100% pasji:')}
            </Text>
            <View style={styles.appsList}>
              {Object.values(CRAFT_APPS).map((app) => (
                <View
                  key={app.id}
                  style={[
                    styles.appItem,
                    app.id === 'piekarz' && styles.appItemCurrent,
                  ]}
                >
                  <View style={styles.appItemIconWrapper}>
                    {app.id === 'napar' && <NaparAppIcon size={28} color={app.accent} />}
                    {app.id === 'piekarz' && <PiekarzAppIcon size={28} color={app.accent} />}
                    {app.id === 'sloik' && <SloikAppIcon size={28} color={app.accent} />}
                    {app.id === 'masaz' && <MasazAppIcon size={28} color={app.accent} />}
                    {app.id === 'ferment' && <FermentAppIcon size={28} color={app.accent} />}
                  </View>
                  <View style={styles.appItemMeta}>
                    <View style={styles.appItemTitleRow}>
                      <Text style={[styles.appItemName, { color: app.accent }]}>
                        {app.name}
                      </Text>
                      {app.id === 'piekarz' && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>{t('Ta aplikacja')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.appItemDomain}>{t(app.domain)}</Text>
                    <Text style={styles.appItemDesc}>{t(app.heroDescriptor)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Security & Database Location */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Baza danych i bezpieczeństwo')}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{t('Lokalizacja bazy:')}</Text>
              <Text style={styles.codeText}>/Library/SQLite/piekarz.db</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('Tryb transakcji:')}</Text>
              <Text style={styles.valueText}>ACID / WAL mode</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('Telemetria i chmura:')}</Text>
              <Text style={styles.statusOffText}>{t('0% (Brak trackerów)')}</Text>
            </View>
          </View>

          {/* Apps4Craft Manifesto & Version */}
          <View style={styles.manifestoCard}>
            <Text style={styles.manifestoTitle}>Apps4Craft Studio</Text>
            <Text style={styles.manifestoText}>
              „{t('Mąka, woda, sól i czas — rzemieślnicza precyzja bez kompromisów.')}”
            </Text>
            <Text style={styles.manifestoDetails}>
              Piekarz (Crust) v1.0.0 • 100% Offline-First • Data Not Collected
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
    height: 52,
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
  optionsCol: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  optionTitleActive: {
    color: theme.colors.accent,
  },
  optionSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
    marginLeft: 8,
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
    backgroundColor: theme.colors.surfaceCard,
  },
  langBtnActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  langBtnTextActive: {
    color: theme.colors.accent,
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
  appsList: {
    gap: 8,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  appItemCurrent: {
    borderColor: theme.colors.accent,
  },
  appItemIconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appItemMeta: {
    flex: 1,
  },
  appItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  currentBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#121214',
  },
  appItemDomain: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  appItemDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'System',
    color: theme.colors.accent,
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  manifestoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.accent,
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
