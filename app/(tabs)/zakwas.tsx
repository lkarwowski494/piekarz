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
import { predictStarterPeak } from '../../src/core/starter-peak-predictor';
import { confirmResetStarter, confirmDeleteStarter } from '../../src/lib/confirm';
import { getStarters, saveStarter, deleteStarter } from '../../src/data/sqlite-store';
import { StoredStarter } from '../../src/data/db';
import { copyFeedingToClipboard } from '../../src/lib/feeding-formatter';
import { StarterConverterModal } from '../../src/components/StarterConverterModal';
import { DiscardRecipesModal } from '../../src/components/DiscardRecipesModal';

export default function ZakwasScreen() {
  const [startersList, setStartersList] = useState<StoredStarter[]>([]);
  const [selectedStarterId, setSelectedStarterId] = useState<string>('starter_default');
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
  const [ambientTempC, setAmbientTempC] = useState<number>(22.0);

  // Biological safety toggles
  const [hasHooch, setHasHooch] = useState<boolean>(false);
  const [hasKahm, setHasKahm] = useState<boolean>(false);
  const [hasMold, setHasMold] = useState<boolean>(false);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editFlourType, setEditFlourType] = useState<string>('');
  const [editStorageState, setEditStorageState] = useState<'ROOM_TEMP' | 'FRIDGE'>('FRIDGE');

  // Add New Starter Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newStarterName, setNewStarterName] = useState<string>('');
  const [newStarterFlour, setNewStarterFlour] = useState<string>('Mąka pszenna chlebowa t750');
  const [newStarterStorage, setNewStarterStorage] = useState<'ROOM_TEMP' | 'FRIDGE'>('ROOM_TEMP');
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState<boolean>(false);

  const loadStarterData = useCallback(async (preferredId?: string) => {
    const list = await getStarters();
    setStartersList(list);
    if (list.length > 0) {
      const targetId = preferredId !== undefined ? preferredId : selectedStarterId;
      const current = list.find((s) => s.id === targetId) || list[0];
      setStarter(current);
      setSelectedStarterId(current.id);
    }
  }, [selectedStarterId]);

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

  const flourGrain = useMemo(() => {
    const lower = (starter.flourType || '').toLowerCase();
    if (lower.includes('żytn') || lower.includes('rye')) return 'rye' as const;
    if (lower.includes('orkisz') || lower.includes('spelt')) return 'spelt' as const;
    return 'wheat' as const;
  }, [starter.flourType]);

  const peakPrediction = useMemo(() => {
    return predictStarterPeak({
      lastFedAt: starter.lastFedAt || Date.now(),
      currentTempC: ambientTempC,
      ratio: selectedRatio,
      flourGrain,
      hydration: starter.hydration,
    });
  }, [starter.lastFedAt, ambientTempC, selectedRatio, flourGrain, starter.hydration]);

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
    await loadStarterData();
  };

  const handleCopyFeeding = async () => {
    await copyFeedingToClipboard(starter, feeding, selectedRatio);
  };

  const handleAddStarter = async () => {
    const trimmed = newStarterName.trim();
    if (!trimmed) return;
    const created: StoredStarter = {
      id: `starter_${Date.now()}`,
      name: trimmed,
      flourType: newStarterFlour.trim() || 'Mąka pszenna chlebowa t750',
      hydration: 100,
      birthDate: Date.now(),
      storageState: newStarterStorage,
      lastFedAt: Date.now(),
    };
    await saveStarter(created);
    setSelectedStarterId(created.id);
    setStarter(created);
    setIsAddModalOpen(false);
    setNewStarterName('');
    await loadStarterData(created.id);
  };

  const handleDeleteCurrentStarter = () => {
    if (startersList.length <= 1) return;
    confirmDeleteStarter(starter.name, async () => {
      await deleteStarter(starter.id);
      setIsEditModalOpen(false);
      const remaining = startersList.filter((s) => s.id !== starter.id);
      const nextId = remaining.length > 0 ? remaining[0].id : undefined;
      await loadStarterData(nextId);
    });
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

        {/* Starters Carousel / Selector */}
        {startersList.length > 0 && (
          <View style={styles.startersSelectorRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.startersScroll}
            >
              {startersList.map((s) => {
                const isSelected = s.id === starter.id;
                return (
                  <Pressable
                    key={s.id}
                    testID={`select-starter-${s.id}`}
                    style={[styles.starterPill, isSelected && styles.starterPillActive]}
                    onPress={() => {
                      setStarter(s);
                      setSelectedStarterId(s.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.starterPillText,
                        isSelected && styles.starterPillTextActive,
                      ]}
                    >
                      {isSelected ? '🥣 ' : ''}{s.name}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                testID="add-starter-btn"
                style={styles.addStarterBtn}
                onPress={() => setIsAddModalOpen(true)}
              >
                <Text style={styles.addStarterBtnText}>+ {t('Dodaj nowy zakwas')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.starterName}>{starter.name}</Text>
              <Text style={styles.starterType}>{starter.flourType} · Hydratacja {starter.hydration}%</Text>
            </View>
            <Pressable
              testID="edit-profile-btn"
              style={styles.editProfileBtn}
              onPress={handleOpenEditModal}
            >
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
        <View style={styles.card} testID="peak-activity-card">
          <View style={styles.peakHeaderRow}>
            <Text style={styles.cardTitle}>🕒 {t('Szczyt aktywności (Peak Timer)')}</Text>
            <View style={[styles.phaseBadge, { backgroundColor: phaseResult.badgeColor + '20' }]}>
              <Text style={[styles.phaseBadgeText, { color: phaseResult.badgeColor }]}>
                ● {phaseResult.labelPl}
              </Text>
            </View>
          </View>

          <Text style={styles.phaseAdvice}>{phaseResult.advicePl}</Text>

          {/* Metabolic Peak Window Prediction */}
          <View style={styles.predictionBox} testID="peak-prediction-box">
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>{t('Szacowane okno szczytu:')}</Text>
              <Text style={styles.predictionWindowText}>{peakPrediction.formattedWindowPl}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${peakPrediction.progressPercent}%`,
                    backgroundColor: peakPrediction.isCurrentlyInPeak
                      ? theme.colors.statusSuccess
                      : peakPrediction.hasPassedPeak
                      ? theme.colors.statusWarning
                      : theme.colors.accent,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressSubtext}>
                {t('Postęp do szczytu:')} {peakPrediction.progressPercent}%
              </Text>
              <Text style={styles.progressSubtext}>
                {peakPrediction.isCurrentlyInPeak ? `✓ ${t('W szczycie')}` : ''}
              </Text>
            </View>

            <Text style={styles.predictionStatusText}>{peakPrediction.statusMessagePl}</Text>

            {/* Ambient Temperature Selector */}
            <Text style={styles.tempSelectorHeading}>{t('Temperatura otoczenia')}: {ambientTempC}°C</Text>
            <View style={styles.tempChipsRow}>
              {[
                { temp: 19, label: '❄️ 19°C', id: 'temp-19' },
                { temp: 22, label: '🏠 22°C', id: 'temp-22' },
                { temp: 25, label: '☀️ 25°C', id: 'temp-25' },
                { temp: 28, label: '♨️ 28°C', id: 'temp-28' },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  testID={`temp-chip-${item.temp}`}
                  style={[
                    styles.tempChip,
                    ambientTempC === item.temp && styles.tempChipActive,
                  ]}
                  onPress={() => setAmbientTempC(item.temp)}
                >
                  <Text
                    style={[
                      styles.tempChipText,
                      ambientTempC === item.temp && styles.tempChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

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

          <Pressable
            testID="copy-feeding-btn"
            style={styles.copyFeedingBtn}
            onPress={handleCopyFeeding}
          >
            <Text style={styles.copyFeedingBtnText}>
              📋 {t('Kopiuj dokarmienie')}
            </Text>
          </Pressable>

          <Pressable
            testID="open-converter-btn"
            style={styles.openConverterBtn}
            onPress={() => setIsConverterOpen(true)}
          >
            <Text style={styles.openConverterBtnText}>
              ⚖️ {t('Konwerter zakwasu & Lievito Madre')}
            </Text>
          </Pressable>

          <Pressable
            testID="open-discard-recipes-btn"
            style={styles.openConverterBtn}
            onPress={() => setIsDiscardModalOpen(true)}
          >
            <Text style={styles.openConverterBtnText}>
              🥞 {t('Przepisy na Odrzut Zakwasu')}
            </Text>
          </Pressable>
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
                {startersList.length > 1 && (
                  <Pressable
                    testID="delete-starter-btn"
                    style={styles.modalDeleteBtn}
                    onPress={handleDeleteCurrentStarter}
                  >
                    <Text style={styles.modalDeleteBtnText}>🗑️ {t('Usuń zakwas')}</Text>
                  </Pressable>
                )}
                <View style={styles.modalRightButtons}>
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
          </View>
        </Modal>

        {/* Modal: Add New Starter */}
        <Modal visible={isAddModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🥣 {t('Dodaj nowy zakwas')}</Text>
              <Text style={styles.modalSubtitle}>Utwórz profil dla nowej kultury zakwasu</Text>

              {/* Name input */}
              <Text style={styles.modalInputLabel}>{t('Imię zakwasu')}</Text>
              <TextInput
                testID="new-starter-name-input"
                style={styles.modalInput}
                value={newStarterName}
                onChangeText={setNewStarterName}
                placeholder="np. San Francisco White, Lievito..."
                placeholderTextColor={theme.colors.textMuted}
              />

              {/* Flour type input */}
              <Text style={styles.modalInputLabel}>{t('Typ mąki')}</Text>
              <TextInput
                testID="new-starter-flour-input"
                style={styles.modalInput}
                value={newStarterFlour}
                onChangeText={setNewStarterFlour}
                placeholder="np. Mąka pszenna chlebowa t750"
                placeholderTextColor={theme.colors.textMuted}
              />

              {/* Storage toggle */}
              <Text style={styles.modalInputLabel}>{t('Miejsce przechowywania')}</Text>
              <View style={styles.storageToggleRow}>
                <Pressable
                  style={[styles.storageBtn, newStarterStorage === 'ROOM_TEMP' && styles.storageBtnActive]}
                  onPress={() => setNewStarterStorage('ROOM_TEMP')}
                >
                  <Text style={[styles.storageBtnText, newStarterStorage === 'ROOM_TEMP' && styles.storageBtnTextActive]}>
                    🏠 {t('Temperatura pokojowa')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.storageBtn, newStarterStorage === 'FRIDGE' && styles.storageBtnActive]}
                  onPress={() => setNewStarterStorage('FRIDGE')}
                >
                  <Text style={[styles.storageBtnText, newStarterStorage === 'FRIDGE' && styles.storageBtnTextActive]}>
                    ❄️ {t('W lodówce (4°C)')}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.modalButtonsRow}>
                <Pressable
                  testID="cancel-add-starter-btn"
                  style={styles.modalCancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
                </Pressable>
                <Pressable
                  testID="save-new-starter-btn"
                  style={styles.modalConfirmBtn}
                  onPress={handleAddStarter}
                >
                  <Text style={styles.modalConfirmBtnText}>{t('Zapisz')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <StarterConverterModal
          visible={isConverterOpen}
          onClose={() => setIsConverterOpen(false)}
          currentStarterHydration={starter.hydration}
          currentStarterName={starter.name}
        />

        <DiscardRecipesModal
          visible={isDiscardModalOpen}
          onClose={() => setIsDiscardModalOpen(false)}
        />
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
  startersSelectorRow: {
    marginBottom: 12,
  },
  startersScroll: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  starterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  starterPillActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  starterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  starterPillTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  addStarterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderStyle: 'dashed',
  },
  addStarterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  copyFeedingBtn: {
    marginTop: 10,
    minHeight: 40,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyFeedingBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  modalRightButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  modalDeleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalDeleteBtnText: {
    color: theme.colors.statusDanger,
    fontSize: 13,
    fontWeight: '700',
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
  predictionBox: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginTop: 8,
    marginBottom: 10,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  predictionWindowText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  predictionStatusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  tempSelectorHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  tempChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tempChip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  tempChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  tempChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tempChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  openConverterBtn: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  openConverterBtnText: {
    color: theme.colors.accentDark,
    fontSize: 13,
    fontWeight: '700',
  },
});
