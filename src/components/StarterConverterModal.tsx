// ============================================================================
// Piekarz (Crust) — Sourdough & Lievito Madre Converter Modal
// Interactive Substitution & Hydration Shift for Artisan Bakers.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { ArkuszKart } from './arkusz/ArkuszKart';
import { Karta } from '../ui/karty/Karta';
import { IkonaKarty } from '../ui/karty/IkonaKarty';
import { t } from '../lib/i18n';
import { useUnitSystem, formatWeight } from '../lib/unit-converter';
import {
  calculateRecipeStarterSubstitution,
  convertStarterHydration,
  STARTER_PRESETS,
} from '../core/starter-converter';
import { styles } from './starter-converter.styles';

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
  // Masy w jednostkach z ustawienia (D-044) [M1-audytor-generalny-096]
  const unitSystem = useUnitSystem();
  const w = (g: number) => formatWeight(g, unitSystem);
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
    // Arkusz na kartach: „Zamknij” w pasku arkusza, tryb, dane i wynik w kartach (README §1, §3) [M3 p7, 04-002]
    <ArkuszKart visible={visible} onRequestClose={onClose} trescTestID="starter-converter-modal"
      lewy={{ tekst: t('Zamknij'), onPress: onClose, testID: 'close-converter-btn' }}>
          <Karta testID="karta-konwertera" tytul={t('Konwerter zakwasu & Lievito Madre')} ikona={<IkonaKarty nazwa="proporcje" />}
            podpis={t('Przelicznik hydratacji i zamiennik w recepturze')}>
          {/* Mode Switcher */}
          <View style={styles.tabRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === 'substitution' }}
              testID="tab-substitution"
              style={[styles.tabButton, activeTab === 'substitution' && styles.tabButtonActive]}
              onPress={() => setActiveTab('substitution')}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'substitution' && styles.tabButtonTextActive]}
              >
                {t('Zamiennik w przepisie')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === 'hydration_shift' }}
              testID="tab-shift"
              style={[styles.tabButton, activeTab === 'hydration_shift' && styles.tabButtonActive]}
              onPress={() => setActiveTab('hydration_shift')}
            >
              <Text
                style={[styles.tabButtonText, activeTab === 'hydration_shift' && styles.tabButtonTextActive]}
              >
                {t('Przygotowanie (Odrost)')}
              </Text>
            </Pressable>
          </View>
          </Karta>

            {activeTab === 'substitution' ? (
              <View testID="substitution-section" style={styles.sekcja}>
                <Karta testID="karta-zamiennika" tytul={t('Zamiennik w przepisie')} ikona={<IkonaKarty nazwa="sloik" />}>
                {/* Recipe Starter Quantity */}
                <Text style={styles.sectionLabel}>{t('Masa zakwasu w przepisie')}:</Text>
                <View style={styles.chipsRow}>
                  {[100, 150, 200, 250].map((g) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: recipeStarterGrams === g }}
                      key={g}
                      testID={`recipe-starter-${g}g`}
                      style={[styles.chip, recipeStarterGrams === g && styles.chipActive]}
                      onPress={() => setRecipeStarterGrams(g)}
                    >
                      <Text style={[styles.chipText, recipeStarterGrams === g && styles.chipTextActive]}>
                        {w(g)}
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: recipeStarterHydration === p.value }}
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: userStarterHydration === p.value }}
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

                </Karta>
                {/* Substitution Results */}
                {subResult && (
                  <Karta testID="substitution-result-card" tytul={t('Wynik przeliczenia')} ikona={<IkonaKarty nazwa="waga" />}>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Użyj Twojego zakwasu')}:</Text>
                      <Text style={styles.metricValueHighlight}>{w(subResult.userStarterGrams)}</Text>
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
                      <Text style={styles.metricValue}>{w(subResult.starterFlourGrams)}</Text>
                    </View>

                    <Text style={styles.adviceText}>{t(subResult.adviceTemplatePl, subResult.adviceParams)}</Text>
                  </Karta>
                )}
              </View>
            ) : (
              <View testID="shift-section" style={styles.sekcja}>
                <Karta testID="karta-odrostu" tytul={t('Przygotowanie (Odrost)')} ikona={<IkonaKarty nazwa="sloik" />}>
                {/* Target Yield */}
                <Text style={styles.sectionLabel}>{t('Docelowa masa nowego zakwasu')}:</Text>
                <View style={styles.chipsRow}>
                  {[100, 150, 200, 300].map((g) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: targetYieldGrams === g }}
                      key={g}
                      testID={`target-yield-${g}g`}
                      style={[styles.chip, targetYieldGrams === g && styles.chipActive]}
                      onPress={() => setTargetYieldGrams(g)}
                    >
                      <Text style={[styles.chipText, targetYieldGrams === g && styles.chipTextActive]}>
                        {w(g)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Source Hydration */}
                <Text style={styles.sectionLabel}>{t('Hydratacja zakwasu matki')}:</Text>
                <View style={styles.presetsRow}>
                  {[
                    { label: '50% Lievito Madre', value: 50 },
                    { label: t('100% Płynny Levain'), value: 100 },
                  ].map((p) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: sourceHydration === p.value }}
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: targetHydration === p.hydration }}
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

                </Karta>
                {/* Shift Results */}
                {shiftResult && (
                  <Karta testID="shift-result-card" tytul={t('Receptura odrostu')} ikona={<IkonaKarty nazwa="waga" />}>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Zakwas matka')}:</Text>
                      <Text style={styles.metricValueHighlight}>{w(shiftResult.seedStarterGrams)}</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Mąka dodana')}:</Text>
                      <Text style={styles.metricValue}>{w(shiftResult.addedFlourGrams)}</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Woda dodana')}:</Text>
                      <Text style={styles.metricValue}>{w(shiftResult.addedWaterGrams)}</Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>{t('Uzyskana masa i hydratacja')}:</Text>
                      <Text style={styles.metricValue}>
                        {w(shiftResult.actualYieldGrams)} ({shiftResult.actualHydration}%)
                      </Text>
                    </View>

                    <Text style={styles.adviceText}>{`${t(shiftResult.tipTemplatePl, shiftResult.tipParams)}${shiftResult.tipConsistencyPl ? ` ${t(shiftResult.tipConsistencyPl)}` : ''}`}</Text>
                  </Karta>
                )}
              </View>
            )}
    </ArkuszKart>
  );
}
