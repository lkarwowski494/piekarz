import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  calculateStarterFeeding,
  evaluateSourdoughSafety,
  calculateStarterPhase,
} from '../../src/core/domain-rules';
import { confirmResetStarter } from '../../src/lib/confirm';
import { getStarters, saveStarter } from '../../src/data/sqlite-store';
import { StoredStarter } from '../../src/data/db';

export default function ZakwasScreen() {
  const [starter, setStarter] = useState<StoredStarter>({
    id: 'starter_default',
    name: 'Bolesław',
    flourType: 'Żytnia razowa typ 2000',
    hydration: 100.0,
    birthDate: Date.now() - 1000 * 60 * 60 * 24 * 120,
    storageState: 'FRIDGE',
    lastFedAt: Date.now() - 1000 * 60 * 60 * 6,
  });

  const [targetYield, setTargetYield] = useState<number>(150);
  const [selectedRatio, setSelectedRatio] = useState<[number, number, number]>([1, 2, 2]);

  // Biological safety toggles
  const [hasHooch, setHasHooch] = useState<boolean>(false);
  const [hasKahm, setHasKahm] = useState<boolean>(false);
  const [hasMold, setHasMold] = useState<boolean>(false);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editFlourType, setEditFlourType] = useState<string>('');
  const [editStorageState, setEditStorageState] = useState<'ROOM_TEMP' | 'FRIDGE'>('FRIDGE');

  const loadStarterData = useCallback(async () => {
    const starters = await getStarters();
    if (starters.length > 0) {
      setStarter(starters[0]);
    }
  }, []);

  useEffect(() => {
    loadStarterData();
  }, [loadStarterData]);

  // Age in days
  const ageDays = useMemo(() => {
    const diffMs = Math.max(0, Date.now() - starter.birthDate);
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [starter.birthDate]);

  // Metabolic Phase calculation
  const phaseResult = useMemo(() => {
    return calculateStarterPhase(starter.lastFedAt, starter.storageState);
  }, [starter.lastFedAt, starter.storageState]);

  // Last fed formatted
  const lastFedLabel = useMemo(() => {
    if (!starter.lastFedAt) return 'Brak danych';
    const diffHours = (Date.now() - starter.lastFedAt) / (1000 * 60 * 60);
    if (diffHours < 1) {
      const mins = Math.max(1, Math.round(diffHours * 60));
      return `${mins} min temu`;
    }
    if (diffHours < 24) {
      const h = Math.floor(diffHours);
      const m = Math.round((diffHours - h) * 60);
      return `${h}h ${m}m temu`;
    }
    const days = Math.floor(diffHours / 24);
    return `${days} ${days === 1 ? 'dzień' : 'dni'} temu`;
  }, [starter.lastFedAt]);

  // Feeding amounts
  const feeding = useMemo(() => {
    return calculateStarterFeeding(targetYield, selectedRatio);
  }, [targetYield, selectedRatio]);

  // Biological safety check
  const safetyResult = useMemo(() => {
    return evaluateSourdoughSafety({
      hasHoochLiquid: hasHooch,
      hasWhiteWrinkledFilm: hasKahm,
      hasFuzzySpots: hasMold,
      hasColoredSpots: hasMold,
    });
  }, [hasHooch, hasKahm, hasMold]);

  // Log feeding action
  const handleLogFeeding = async () => {
    const updated: StoredStarter = {
      ...starter,
      lastFedAt: Date.now(),
    };
    await saveStarter(updated);
    setStarter(updated);
    Alert.alert(t('Zarejestrowano dokarmienie!'), `Zakwas ${starter.name} został nakarmiony.`);
  };

  // Open edit modal
  const handleOpenEditModal = () => {
    setEditName(starter.name);
    setEditFlourType(starter.flourType);
    setEditStorageState(starter.storageState);
    setIsEditModalOpen(true);
  };

  // Save edit modal
  const handleSaveProfile = async () => {
    const updated: StoredStarter = {
      ...starter,
      name: editName.trim() || starter.name,
      flourType: editFlourType.trim() || starter.flourType,
      storageState: editStorageState,
    };
    await saveStarter(updated);
    setStarter(updated);
    setIsEditModalOpen(false);
  };

  const handleReset = () => {
    confirmResetStarter(() => {
      setHasHooch(false);
      setHasKahm(false);
      setHasMold(false);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Zakwas')}</Text>
          <Text style={styles.subtitle}>
            Profil, cykl dokarmiania i wskaźnik szczytu aktywności (Peak Timer)
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.starterName}>{starter.name}</Text>
              <Text style={styles.starterType}>{starter.flourType} · Hydratacja {starter.hydration}%</Text>
            </View>
            <Pressable style={styles.editProfileBtn} onPress={handleOpenEditModal}>
              <Text style={styles.editProfileBtnText}>✏️ {t('Edytuj profil')}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t('Wiek zakwasu')}</Text>
              <Text style={styles.metaValue}>{ageDays} dni</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t('Ostatnie dokarmienie')}</Text>
              <Text style={styles.metaValue}>{lastFedLabel}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t('Miejsce przechowywania')}</Text>
              <Text style={styles.metaValue}>
                {starter.storageState === 'FRIDGE' ? t('W lodówce (4°C)') : t('Temperatura pokojowa')}
              </Text>
            </View>
          </View>
        </View>

        {/* Peak Activity Timer Card */}
        <View style={styles.card}>
          <View style={styles.peakHeaderRow}>
            <Text style={styles.cardTitle}>🕒 {t('Szczyt aktywności (Peak Timer)')}</Text>
            <View style={[styles.phaseBadge, { backgroundColor: phaseResult.badgeColor + '20' }]}>
              <Text style={[styles.phaseBadgeText, { color: phaseResult.badgeColor }]}>
                ● {phaseResult.labelPl}
              </Text>
            </View>
          </View>

          <Text style={styles.phaseAdvice}>{phaseResult.advicePl}</Text>

          <Pressable style={styles.feedNowBtn} onPress={handleLogFeeding}>
            <Text style={styles.feedNowBtnText}>🥣 {t('Zarejestruj dokarmienie')}</Text>
          </Pressable>
        </View>

        {/* Feeding Calculator */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Kalkulator dokarmiania')}</Text>
          <Text style={styles.cardSubtitle}>
            Dobierz proporcje i potrzebną masę zaczynu (Levain) do wypieku
          </Text>

          {/* Ratio Selector */}
          <Text style={styles.subHeading}>{t('Cykl dokarmiania')} (Proporcja)</Text>
          <View style={styles.ratioChipsRow}>
            {[
              { ratio: [1, 1, 1] as [number, number, number], label: '1:1:1 (Szybki 3-4h)' },
              { ratio: [1, 2, 2] as [number, number, number], label: '1:2:2 (Klasyk 6-8h)' },
              { ratio: [1, 3, 3] as [number, number, number], label: '1:3:3 (8-10h)' },
              { ratio: [1, 5, 5] as [number, number, number], label: '1:5:5 (Na noc 12h)' },
            ].map((item, idx) => {
              const isSelected =
                selectedRatio[0] === item.ratio[0] &&
                selectedRatio[1] === item.ratio[1] &&
                selectedRatio[2] === item.ratio[2];
              return (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedRatio(item.ratio)}
                  style={[styles.ratioChip, isSelected && styles.ratioChipActive]}
                >
                  <Text style={[styles.ratioChipText, isSelected && styles.ratioChipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Yield Amount Selector */}
          <Text style={styles.subHeading}>
            {t('Potrzebny zaczyn (Levain)')}: {targetYield} g
          </Text>
          <View style={styles.yieldButtons}>
            {[100, 150, 200, 250, 300].map((y) => (
              <Pressable
                key={y}
                onPress={() => setTargetYield(y)}
                style={[styles.yieldChip, targetYield === y && styles.yieldChipActive]}
              >
                <Text style={[styles.yieldChipText, targetYield === y && styles.yieldChipTextActive]}>
                  {y} g
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Result Calculation Breakdown */}
          <View style={styles.feedingResultGrid}>
            <View style={styles.feedingItem}>
              <Text style={styles.feedingItemLabel}>{t('Stary zakwas')}</Text>
              <Text style={styles.feedingItemValue}>{feeding.starterGrams} g</Text>
              <Text style={styles.feedingItemRatio}>{selectedRatio[0]} cz.</Text>
            </View>
            <Text style={styles.plusSign}>+</Text>
            <View style={styles.feedingItem}>
              <Text style={styles.feedingItemLabel}>{t('Mąka')}</Text>
              <Text style={styles.feedingItemValue}>{feeding.flourGrams} g</Text>
              <Text style={styles.feedingItemRatio}>{selectedRatio[1]} cz.</Text>
            </View>
            <Text style={styles.plusSign}>+</Text>
            <View style={styles.feedingItem}>
              <Text style={styles.feedingItemLabel}>{t('Woda')} (~28°C)</Text>
              <Text style={styles.feedingItemValue}>{feeding.waterGrams} g</Text>
              <Text style={styles.feedingItemRatio}>{selectedRatio[2]} cz.</Text>
            </View>
          </View>
          <Text style={styles.feedingReserveTip}>
            💡 Wskazówka: Z powstałych {targetYield} g pobierz wymaganą ilość do ciasta, a resztkę (~20–25 g)
            schowaj do lodówki jako matkę na kolejny wypiek.
          </Text>
        </View>

        {/* Biological Safety Checker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Kontrola biologiczna (Bezpieczeństwo)')}</Text>
          <Text style={styles.cardSubtitle}>
            Sprawdź nietypowe zjawiska na powierzchni zakwasu
          </Text>

          <View style={styles.checkRow}>
            <Pressable
              style={[styles.checkBtn, hasHooch && styles.checkBtnActive]}
              onPress={() => setHasHooch((prev) => !prev)}
            >
              <Text style={[styles.checkBtnText, hasHooch && styles.checkBtnTextActive]}>
                {t('Ciemny płyn / zapach alkoholu (Hooch)')}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.checkBtn, hasKahm && styles.checkBtnActive]}
              onPress={() => setHasKahm((prev) => !prev)}
            >
              <Text style={[styles.checkBtnText, hasKahm && styles.checkBtnTextActive]}>
                {t('Biały matowy kożuch (Kahm Yeast)')}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.checkBtn, hasMold && styles.checkBtnDangerActive]}
              onPress={() => setHasMold((prev) => !prev)}
            >
              <Text style={[styles.checkBtnText, hasMold && styles.checkBtnDangerTextActive]}>
                {t('Puszyste kolorowe plamy (Pleśń / Zgnilizna)')}
              </Text>
            </Pressable>
          </View>

          {/* Diagnostic Result */}
          <View
            style={[
              styles.safetyBox,
              safetyResult.status === 'toxic_mold_danger'
                ? styles.safetyDanger
                : safetyResult.status === 'kahm_yeast_safe'
                ? styles.safetyWarning
                : styles.safetyHealthy,
            ]}
          >
            <Text style={styles.safetyTitle}>{safetyResult.titlePl}</Text>
            <Text style={styles.safetyAction}>{safetyResult.actionPl}</Text>
          </View>

          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>{t('Resetuj profil zakwasu')}</Text>
          </Pressable>
        </View>

        {/* Modal: Edit Starter Profile */}
        <Modal visible={isEditModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('Edytuj zakwas')}</Text>
              <Text style={styles.modalSubtitle}>Zmień parametry swojego zakwasu</Text>

              {/* Name input */}
              <Text style={styles.modalInputLabel}>{t('Imię zakwasu')}</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('Imię zakwasu')}
              />

              {/* Flour type input */}
              <Text style={styles.modalInputLabel}>{t('Typ mąki')}</Text>
              <TextInput
                style={styles.modalInput}
                value={editFlourType}
                onChangeText={setEditFlourType}
                placeholder={t('Typ mąki')}
              />

              {/* Storage state toggle */}
              <Text style={styles.modalInputLabel}>{t('Miejsce przechowywania')}</Text>
              <View style={styles.storageToggleRow}>
                <Pressable
                  style={[styles.storageBtn, editStorageState === 'FRIDGE' && styles.storageBtnActive]}
                  onPress={() => setEditStorageState('FRIDGE')}
                >
                  <Text style={[styles.storageBtnText, editStorageState === 'FRIDGE' && styles.storageBtnTextActive]}>
                    ❄️ {t('W lodówce (4°C)')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.storageBtn, editStorageState === 'ROOM_TEMP' && styles.storageBtnActive]}
                  onPress={() => setEditStorageState('ROOM_TEMP')}
                >
                  <Text style={[styles.storageBtnText, editStorageState === 'ROOM_TEMP' && styles.storageBtnTextActive]}>
                    🏠 {t('Temperatura pokojowa')}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setIsEditModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
                </Pressable>
                <Pressable
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.modalConfirmBtnText}>{t('Zapisz profil')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starterName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  starterType: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  editProfileBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  peakHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  phaseAdvice: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  feedNowBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  feedNowBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  ratioChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  ratioChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ratioChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  ratioChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ratioChipTextActive: {
    color: '#FFFFFF',
  },
  yieldButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  yieldChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yieldChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  yieldChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  yieldChipTextActive: {
    color: '#FFFFFF',
  },
  feedingResultGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceCard,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feedingItem: {
    flex: 1,
    alignItems: 'center',
  },
  feedingItemLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  feedingItemValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  feedingItemRatio: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  plusSign: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMuted,
    paddingHorizontal: 4,
  },
  feedingReserveTip: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 10,
    lineHeight: 16,
  },
  checkRow: {
    gap: 8,
    marginBottom: 14,
  },
  checkBtn: {
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: theme.colors.statusWarning,
  },
  checkBtnDangerActive: {
    backgroundColor: '#FEE2E2',
    borderColor: theme.colors.statusDanger,
  },
  checkBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  checkBtnTextActive: {
    color: '#92400E',
  },
  checkBtnDangerTextActive: {
    color: '#991B1B',
  },
  safetyBox: {
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  safetyHealthy: {
    backgroundColor: '#F0FDF4',
    borderColor: theme.colors.statusSuccess,
  },
  safetyWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: theme.colors.statusWarning,
  },
  safetyDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: theme.colors.statusDanger,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: theme.colors.textPrimary,
  },
  safetyAction: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resetBtnText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 14,
  },
  storageToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  storageBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  storageBtnActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  storageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  storageBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
