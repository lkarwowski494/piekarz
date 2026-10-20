// ============================================================================
// Piekarz (Crust) — Sourdough & Lievito Madre Converter Modal
// Interactive Substitution & Hydration Shift for Artisan Bakers.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import {
  calculateRecipeStarterSubstitution,
  convertStarterHydration,
  STARTER_PRESETS,
} from '../core/starter-converter';

export interface StarterConverterModalProps {
  visible: boolean;
  onClose: () => void;
  currentStarterHydration?: number;
  currentStarterName?: string;
}

export function StarterConverterModal({
  visible,
  onClose,
  currentStarterHydration = 100,
  currentStarterName = 'Twój zakwas',
}: StarterConverterModalProps) {
  const [activeTab, setActiveTab] = useState<'substitution' | 'hydration_shift'>('substitution');

  // Substitution state
  const [recipeStarterGrams, setRecipeStarterGrams] = useState<number>(150);
  const [recipeStarterHydration, setRecipeStarterHydration] = useState<number>(100);
  const [userStarterHydration, setUserStarterHydration] = useState<number>(currentStarterHydration);

  // Shift state
  const [targetYieldGrams, setTargetYieldGrams] = useState<number>(150);
  const [sourceHydration, setSourceHydration] = useState<number>(currentStarterHydration);
  const [targetHydration, setTargetHydration] = useState<number>(50);

  // Substitution calculation
  const subResult = useMemo(() => {
    try {
      return calculateRecipeStarterSubstitution({
        recipeStarterGrams,
        recipeStarterHydration,
        userStarterHydration,
      });
    } catch {
      return null;
    }
  }, [recipeStarterGrams, recipeStarterHydration, userStarterHydration]);

  // Hydration shift calculation
  const shiftResult = useMemo(() => {
    try {
      return convertStarterHydration({
        targetYieldGrams,
        sourceHydration,
        targetHydration,
      });
    } catch {
      return null;
    }
  }, [targetYieldGrams, sourceHydration, targetHydration]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard} testID="starter-converter-modal">
          {/* Header */}
          <Text style={styles.modalTitle}>⚖️ {t('Konwerter zakwasu & Lievito Madre')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Przelicznik hydratacji i zamiennik w recepturze')}
          </Text>

          {/* Mode Switcher */}
          <View style={styles.tabRow}>
            <Pressable
              testID="tab-substitution"
              style={[styles.tabButton, activeTab === 'substitution' && styles.tabButtonActive]}
              onPress={() => setActiveTab('substitution')}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'substitution' && styles.tabButtonTextActive]}
              >
                🔄 {t('Zamiennik w przepisie')}
              </Text>
            </Pressable>
            <Pressable
              testID="tab-shift"
              style={[styles.tabButton, activeTab === 'hydration_shift' && styles.tabButtonActive]}
              onPress={() => setActiveTab('hydration_shift')}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'hydration_shift' && styles.tabButtonTextActive]}
              >
                🌱 {t('Przygotowanie (Odrost)')}
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {activeTab === 'substitution' ? (
              <View testID="substitution-section">
                {/* Recipe Starter Quantity */}
                <Text style={styles.sectionLabel}>{t('Masa zakwasu w przepisie')}:</Text>
                <View style={styles.chipsRow}>
                  {[100, 150, 200, 250].map((g) => (
                    <Pressable
                      key={g}
                      testID={`recipe-starter-${g}g`}
                      style={[styles.chip, recipeStarterGrams === g && styles.chipActive]}
                      onPress={() => setRecipeStarterGrams(g)}
                    >
                      <Text style={[styles.chipText, recipeStarterGrams === g && styles.chipTextActive]}>
                        {g}g
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Recipe Starter Hydration */}
                <Text style={styles.sectionLabel}>{t('Hydratacja w przepisie')}:</Text>
                <View style={styles.presetsRow}>
                  {[
                    { label: '50% (Lievito Madre)', value: 50 },
                    { label: t('60% (Żytni)'), value: 60 },
                    { label: t('100% (Płynny)'), value: 100 },
                  ].map((p) => (
                    <Pressable
                      key={p.value}
                      testID={`recipe-hydr-${p.value}`}
                      style={[styles.presetChip, recipeStarterHydration === p.value && styles.presetChipActive]}
                      onPress={() => setRecipeStarterHydration(p.value)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          recipeStarterHydration === p.value && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* User Starter Hydration */}
                <Text style={styles.sectionLabel}>
                  {t('Hydratacja Twojego zakwasu')} ({currentStarterName}):
                </Text>
                <View style={styles.presetsRow}>
                  {[
                    { label: '50% (Lievito Madre)', value: 50 },
                    { label: t('60% (Sztywny)'), value: 60 },
                    { label: t('100% (Płynny Levain)'), value: 100 },
                  ].map((p) => (
                    <Pressable
                      key={p.value}
                      testID={`user-hydr-${p.value}`}
                      style={[styles.presetChip, userStarterHydration === p.value && styles.presetChipActive]}
                      onPress={() => setUserStarterHydration(p.value)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          userStarterHydration === p.value && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Substitution Results */}
                {subResult && (
                  <View style={styles.resultCard} testID="substitution-result-card">
                    <Text style={styles.resultCardTitle}>{t('Wynik przeliczenia')}</Text>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Użyj Twojego zakwasu')}:</Text>
                      <Text style={styles.metricValueHighlight}>{subResult.userStarterGrams}g</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Korekta wody w cieście')}:</Text>
                      <View
                        style={[
                          styles.badge,
                          subResult.doughWaterAction === 'ADD'
                            ? styles.badgeAdd
                            : subResult.doughWaterAction === 'REDUCE'
                            ? styles.badgeReduce
                            : styles.badgeNeutral,
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {subResult.doughWaterAction === 'ADD' && t('+{g}g wody', { g: subResult.waterAdjustmentGrams })}
                          {subResult.doughWaterAction === 'REDUCE' && t('{g}g wody', { g: subResult.waterAdjustmentGrams })}
                          {subResult.doughWaterAction === 'NONE' && t('0g (brak zmian)')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Mąka ze sfermentowanego zaczynu')}:</Text>
                      <Text style={styles.metricValue}>{subResult.starterFlourGrams}g</Text>
                    </View>

                    <Text style={styles.adviceText}>{t(subResult.adviceTemplatePl, subResult.adviceParams)}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View testID="shift-section">
                {/* Target Yield */}
                <Text style={styles.sectionLabel}>{t('Docelowa masa nowego zakwasu')}:</Text>
                <View style={styles.chipsRow}>
                  {[100, 150, 200, 300].map((g) => (
                    <Pressable
                      key={g}
                      testID={`target-yield-${g}g`}
                      style={[styles.chip, targetYieldGrams === g && styles.chipActive]}
                      onPress={() => setTargetYieldGrams(g)}
                    >
                      <Text style={[styles.chipText, targetYieldGrams === g && styles.chipTextActive]}>
                        {g}g
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Source Hydration */}
                <Text style={styles.sectionLabel}>{t('Hydratacja zakwasu matki (Seed)')}:</Text>
                <View style={styles.presetsRow}>
                  {[
                    { label: '50% Lievito Madre', value: 50 },
                    { label: t('100% Płynny Levain'), value: 100 },
                  ].map((p) => (
                    <Pressable
                      key={p.value}
                      testID={`source-hydr-${p.value}`}
                      style={[styles.presetChip, sourceHydration === p.value && styles.presetChipActive]}
                      onPress={() => setSourceHydration(p.value)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          sourceHydration === p.value && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Target Hydration */}
                <Text style={styles.sectionLabel}>{t('Docelowa hydratacja nowego zakwasu')}:</Text>
                <View style={styles.presetsRow}>
                  {STARTER_PRESETS.map((p) => (
                    <Pressable
                      key={p.id}
                      testID={`target-preset-${p.id}`}
                      style={[styles.presetChip, targetHydration === p.hydration && styles.presetChipActive]}
                      onPress={() => setTargetHydration(p.hydration)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          targetHydration === p.hydration && styles.presetChipTextActive,
                        ]}
                      >
                        {p.hydration}% ({p.namePl.split(' (')[0]})
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Shift Results */}
                {shiftResult && (
                  <View style={styles.resultCard} testID="shift-result-card">
                    <Text style={styles.resultCardTitle}>{t('Receptura odrostu')}</Text>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Zakwas matka (Seed)')}:</Text>
                      <Text style={styles.metricValueHighlight}>{shiftResult.seedStarterGrams}g</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Mąka dodana')}:</Text>
                      <Text style={styles.metricValue}>{shiftResult.addedFlourGrams}g</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Woda dodana')}:</Text>
                      <Text style={styles.metricValue}>{shiftResult.addedWaterGrams}g</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Uzyskana masa i hydratacja')}:</Text>
                      <Text style={styles.metricValue}>
                        {shiftResult.actualYieldGrams}g ({shiftResult.actualHydration}%)
                      </Text>
                    </View>

                    <Text style={styles.adviceText}>{`${t(shiftResult.tipTemplatePl, shiftResult.tipParams)}${shiftResult.tipConsistencyPl ? ` ${t(shiftResult.tipConsistencyPl)}` : ''}`}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Close button */}
          <Pressable
            testID="close-converter-btn"
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={sharedCraftTokens.hitSlopStandard}
          >
            <Text style={styles.closeButtonText}>{t('Zamknij')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  tabButtonTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '800',
  },
  scrollArea: {
    maxHeight: 400,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 10,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  chipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  chipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  presetChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  presetChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  resultCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.linia,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.tusz2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  metricValueHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
  },
  badgeAdd: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeReduce: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeNeutral: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  adviceText: {
    fontSize: 12,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
  closeButton: {
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  closeButtonText: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
    fontSize: 14,
  },
});
