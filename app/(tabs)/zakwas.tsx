import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CraftHeader,
  sharedCraftTokens,
} from '@apps4craft/ui';
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
import { exportStarterLabelAsPdf } from '../../src/lib/pdf-sheet-generator';
import { useAppAccess } from '../../src/lib/app-access';
import { PaywallModal } from '../../src/components/PaywallModal';
import { useUnitSystem } from '../../src/lib/unit-converter';
import { ZakwasSacredCard } from '../../src/components/zakwas/ZakwasSacredCard';
import { StartersSelectorRow } from '../../src/components/zakwas/StartersSelectorRow';
import { StarterProfileCard } from '../../src/components/zakwas/StarterProfileCard';
import { StarterPeakActivityCard } from '../../src/components/zakwas/StarterPeakActivityCard';
import { StarterFeedingCard } from '../../src/components/zakwas/StarterFeedingCard';
import { StarterSafetyCard } from '../../src/components/zakwas/StarterSafetyCard';
import { EditStarterModal } from '../../src/components/zakwas/EditStarterModal';
import { AddStarterModal } from '../../src/components/zakwas/AddStarterModal';

export default function ZakwasScreen() {
  const router = useRouter();
  const unitSystem = useUnitSystem();
  // Apps4Craft Monetization & Access (Cheaper than espresso)
  const {
    access,
    isPaywallVisible,
    setPaywallVisible,
    requireActionAccess,
    subscribe,
    restorePurchases,
  } = useAppAccess();

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
      lastFedAt: starter.lastFedAt ?? Date.now(),
      currentTempC: ambientTempC,
      ratio: selectedRatio,
      flourGrain,
      hydration: starter.hydration,
      now: Date.now(),
    });
  }, [starter.lastFedAt, ambientTempC, selectedRatio, flourGrain, starter.hydration]);

  // Feeding calculation
  const feeding = useMemo(() => {
    return calculateStarterFeeding(targetYield, selectedRatio);
  }, [targetYield, selectedRatio]);

  // Biological safety assessment
  const safetyResult = useMemo(() => {
    return evaluateSourdoughSafety({
      hasHoochLiquid: hasHooch,
      hasWhiteWrinkledFilm: hasKahm,
      hasFuzzySpots: hasMold,
    });
  }, [hasHooch, hasKahm, hasMold]);

  // Time since last feeding label
  const lastFedLabel = useMemo(() => {
    const diffHours = Math.floor((Date.now() - (starter.lastFedAt ?? Date.now())) / (1000 * 60 * 60));
    if (diffHours < 1) return t('przed chwilą');
    if (diffHours < 24) return t('{hours}h temu', { hours: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('{days}d temu', { days: diffDays });
  }, [starter.lastFedAt]);

  const handleLogFeeding = async () => {
    requireActionAccess(async () => {
      const now = Date.now();
      const updated: StoredStarter = {
        ...starter,
        lastFedAt: now,
      };
      await saveStarter(updated);
      setStarter(updated);
      setStartersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      Alert.alert(t('Dokarmiono zakwas'), t('Zarejestrowano dokarmienie zakwasu „{name}”.', { name: starter.name }));
    });
  };

  const handleOpenEditModal = () => {
    setEditName(starter.name);
    setEditFlourType(starter.flourType);
    setEditStorageState(starter.storageState);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    requireActionAccess(async () => {
      const trimmed = editName.trim();
      if (!trimmed) return;
      const updated: StoredStarter = {
        ...starter,
        name: trimmed,
        flourType: editFlourType.trim() || starter.flourType,
        storageState: editStorageState,
      };
      await saveStarter(updated);
      setStarter(updated);
      setStartersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setIsEditModalOpen(false);
      Alert.alert(t('Profil zakwasu'), t('Zapisano zaktualizowany profil'));
    });
  };

  const handleAddStarter = async () => {
    requireActionAccess(async () => {
      const trimmedName = newStarterName.trim();
      if (!trimmedName) return;
      const newStarter: StoredStarter = {
        id: `starter_${Date.now()}`,
        name: trimmedName,
        flourType: newStarterFlour.trim() || 'Mąka pszenna chlebowa',
        hydration: 100.0,
        birthDate: Date.now(),
        storageState: newStarterStorage,
        lastFedAt: Date.now(),
      };
      await saveStarter(newStarter);
      await loadStarterData(newStarter.id);
      setIsAddModalOpen(false);
      setNewStarterName('');
      Alert.alert(t('Dodano zakwas'), t('Kultura „{name}” została utworzona.', { name: trimmedName }));
    });
  };

  const handleDeleteCurrentStarter = () => {
    requireActionAccess(() => {
      if (startersList.length <= 1) {
        Alert.alert(t('Nie można usunąć'), t('Musisz posiadać co najmniej jeden profil zakwasu.'));
        return;
      }
      confirmDeleteStarter(starter.name, async () => {
        await deleteStarter(starter.id);
        setIsEditModalOpen(false);
        const remaining = startersList.filter((s) => s.id !== starter.id);
        if (remaining.length > 0) {
          await loadStarterData(remaining[0].id);
        }
      });
    });
  };

  const handleCopyFeeding = async () => {
    const copied = await copyFeedingToClipboard(starter, feeding, selectedRatio);
    if (copied) {
      Alert.alert(t('Kopiuj dokarmienie'), t('Skopiowano proporcje dokarmiania do schowka'));
    }
  };

  const handlePrintStarterLabel = async () => {
    try {
      await exportStarterLabelAsPdf(
        {
          starterName: starter.name,
          flourType: starter.flourType,
          hydration: starter.hydration,
          ageDays,
          storageState: starter.storageState,
          feedingRatio: `${selectedRatio[0]}:${selectedRatio[1]}:${selectedRatio[2]}`,
        },
        true
      );
    } catch {
      Alert.alert(t('Etykieta zakwasu'), t('Nie udało się wygenerować etykiety PDF'));
    }
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
      <CraftHeader
        title={t('Zakwas')}
        subtitle={t('Profil, cykl dokarmiania i szczyt aktywności (Peak Timer)')}
        testID="zakwas-header"
        rightAction={
          <Pressable
            testID="zakwas-doctor-shortcut-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Doktor Chleba')}
            hitSlop={sharedCraftTokens.hitSlopStandard}
            style={styles.headerDoctorBtn}
            onPress={() => router.push('/(tabs)/doktor')}
          >
            <Text style={styles.headerDoctorBtnText}>🩺 {t('Doktor')}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Sacred Numbers Glanceable Countertop Card */}
        <ZakwasSacredCard
          ageDays={ageDays}
          hydration={starter.hydration}
          selectedRatio={selectedRatio}
          ambientTempC={ambientTempC}
        />

        {/* Starters Carousel / Selector */}
        <StartersSelectorRow
          startersList={startersList}
          activeStarterId={starter.id}
          onSelectStarter={(s) => {
            setStarter(s);
            setSelectedStarterId(s.id);
          }}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Profile Card */}
        <StarterProfileCard
          starter={starter}
          ageDays={ageDays}
          lastFedLabel={lastFedLabel}
          unitSystem={unitSystem}
          onPrintLabel={handlePrintStarterLabel}
          onOpenEditModal={handleOpenEditModal}
        />

        {/* Peak Activity Timer Card */}
        <StarterPeakActivityCard
          phaseResult={phaseResult}
          peakPrediction={peakPrediction}
          ambientTempC={ambientTempC}
          onAmbientTempChange={setAmbientTempC}
          unitSystem={unitSystem}
          onLogFeeding={handleLogFeeding}
        />

        {/* Feeding Calculator */}
        <StarterFeedingCard
          selectedRatio={selectedRatio}
          onSelectRatio={setSelectedRatio}
          targetYield={targetYield}
          onTargetYieldChange={setTargetYield}
          feeding={feeding}
          unitSystem={unitSystem}
          onCopyFeeding={handleCopyFeeding}
          onOpenConverter={() => setIsConverterOpen(true)}
          onOpenDiscardRecipes={() => setIsDiscardModalOpen(true)}
        />

        {/* Biological Safety Checker */}
        <StarterSafetyCard
          hasHooch={hasHooch}
          onToggleHooch={() => setHasHooch((prev) => !prev)}
          hasKahm={hasKahm}
          onToggleKahm={() => setHasKahm((prev) => !prev)}
          hasMold={hasMold}
          onToggleMold={() => setHasMold((prev) => !prev)}
          safetyResult={safetyResult}
          onReset={handleReset}
        />

        {/* Modal: Edit Starter Profile */}
        <EditStarterModal
          visible={isEditModalOpen}
          name={editName}
          onNameChange={setEditName}
          flourType={editFlourType}
          onFlourTypeChange={setEditFlourType}
          storageState={editStorageState}
          onStorageStateChange={setEditStorageState}
          canDelete={startersList.length > 1}
          onDelete={handleDeleteCurrentStarter}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />

        {/* Modal: Add New Starter */}
        <AddStarterModal
          visible={isAddModalOpen}
          name={newStarterName}
          onNameChange={setNewStarterName}
          flour={newStarterFlour}
          onFlourChange={setNewStarterFlour}
          storage={newStarterStorage}
          onStorageChange={setNewStarterStorage}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddStarter}
        />

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

        {/* Apps4Craft Pass Paywall Modal */}
        <PaywallModal
          visible={isPaywallVisible}
          onClose={() => setPaywallVisible(false)}
          onSubscribe={subscribe}
          onRestore={restorePurchases}
          trialDaysRemaining={access.trialDaysRemaining}
          completedBakesCount={access.completedBakesCount}
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
  headerDoctorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
  },
  headerDoctorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
});
