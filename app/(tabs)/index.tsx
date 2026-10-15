import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  calculateDoughRecipe,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateBakedWeight,
} from '../../src/core/domain-rules';
import { MASTER_RECIPES } from '../../src/recipes/presets';

export default function CalculatorScreen() {
  const [selectedPresetId, setSelectedPresetId] = useState(MASTER_RECIPES[0].id);
  const [flourGrams, setFlourGrams] = useState(500);
  const [waterPct, setWaterPct] = useState(72.0);
  const [starterPct, setStarterPct] = useState(20.0);
  const [saltPct, setSaltPct] = useState(2.0);
  const [starterHydration, setStarterHydration] = useState(100.0);

  // DDT parameters
  const [targetDdt, setTargetDdt] = useState(26.0);
  const [flourTemp, setFlourTemp] = useState(21.0);
  const [roomTemp, setRoomTemp] = useState(22.0);
  const [starterTemp, setStarterTemp] = useState(21.0);
  const [frictionFactor, setFrictionFactor] = useState(2.0); // Ręczne wyrabianie
  const [tapWaterTemp, setTapWaterTemp] = useState(16.0);

  // Apply preset
  const handleSelectPreset = (presetId: string) => {
    const preset = MASTER_RECIPES.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setWaterPct(preset.formula.waterPercentage);
    setStarterPct(preset.formula.starterPercentage);
    setSaltPct(preset.formula.saltPercentage);
    setStarterHydration(preset.formula.starterHydration ?? 100.0);
    setTargetDdt(preset.targetDDT);
  };

  // Calculations
  const calculations = useMemo(() => {
    const totalPercent = 100.0 + waterPct + starterPct + saltPct;
    const targetWeight = Math.round(flourGrams * (totalPercent / 100.0));
    return calculateDoughRecipe({
      flours: [{ name: 'Mąka pszenna typ 750', percentage: 100.0 }],
      waterPercentage: waterPct,
      starterPercentage: starterPct,
      saltPercentage: saltPct,
      starterHydration,
      targetDoughWeightGrams: targetWeight,
    });
  }, [flourGrams, waterPct, starterPct, saltPct, starterHydration]);

  const ddtResult = useMemo(() => {
    return calculateDDTWaterTemp({
      targetDDT: targetDdt,
      flourTemp,
      roomTemp,
      starterTemp,
      frictionFactor,
    });
  }, [targetDdt, flourTemp, roomTemp, starterTemp, frictionFactor]);

  const iceResult = useMemo(() => {
    if (ddtResult.status === 'requires_ice') {
      return calculateIceRequirement(
        calculations.waterGrams,
        tapWaterTemp,
        ddtResult.waterTempTarget
      );
    }
    return null;
  }, [ddtResult, calculations.waterGrams, tapWaterTemp]);

  const bakedWeight = useMemo(() => {
    return calculateBakedWeight(calculations.targetDoughWeightGrams, 14.0);
  }, [calculations.targetDoughWeightGrams]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Kalkulator')}</Text>
          <Text style={styles.subtitle}>True Baker’s % & DDT (Apps4Brew)</Text>
        </View>

        {/* Master Recipes Presets */}
        <Text style={styles.sectionHeading}>Receptury mistrzowskie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {MASTER_RECIPES.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <Pressable
                key={preset.id}
                onPress={() => handleSelectPreset(preset.id)}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
              >
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                  {preset.namePl}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Ingredients & Weights Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Składniki i gramatury</Text>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>{t('Mąka')}</Text>
              <Text style={styles.sublabel}>Podstawa (100%)</Text>
            </View>
            <View style={styles.inputGroup}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => setFlourGrams((prev) => Math.max(100, prev - 50))}
              >
                <Text style={styles.stepBtnText}>-50</Text>
              </Pressable>
              <TextInput
                keyboardType="numeric"
                value={String(flourGrams)}
                onChangeText={(val) => setFlourGrams(Number(val) || 0)}
                style={styles.numberInput}
              />
              <Text style={styles.unitText}>g</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => setFlourGrams((prev) => prev + 50)}
              >
                <Text style={styles.stepBtnText}>+50</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Water */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>{t('Woda')}</Text>
              <Text style={styles.sublabel}>{waterPct.toFixed(1)}% mąki</Text>
            </View>
            <Text style={styles.weightValue}>{calculations.waterGrams} g</Text>
          </View>

          <View style={styles.divider} />

          {/* Starter */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>{t('Zakwas (Levain)')}</Text>
              <Text style={styles.sublabel}>{starterPct.toFixed(1)}% (hydr. {starterHydration}%)</Text>
            </View>
            <Text style={styles.weightValue}>{calculations.starterGrams} g</Text>
          </View>

          <View style={styles.divider} />

          {/* Salt */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>{t('Sól')}</Text>
              <Text style={styles.sublabel}>{saltPct.toFixed(1)}% mąki</Text>
            </View>
            <Text style={styles.weightValue}>{calculations.saltGrams} g</Text>
          </View>
        </View>

        {/* True Baker's % Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('Hydratacja całkowita')}</Text>
              <Text style={styles.summaryValueBig}>
                {calculations.overallHydrationPercent.toFixed(1)}%
              </Text>
              <Text style={styles.summaryCaption}>True Baker’s %</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Masa ciasta</Text>
              <Text style={styles.summaryValueBig}>
                {calculations.targetDoughWeightGrams} g
              </Text>
              <Text style={styles.summaryCaption}>Bochenek: ~{bakedWeight} g</Text>
            </View>
          </View>
        </View>

        {/* DDT & Water Temp Calculation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Docelowa temperatura ciasta (DDT)')}</Text>
          <Text style={styles.cardSubtitle}>
            4-składnikowa formuła Mathonsa dla zakwasu
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Cel DDT</Text>
            <Text style={styles.valueHighlight}>{targetDdt.toFixed(1)}°C</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('Temperatura mąki')}</Text>
            <Text style={styles.labelSmall}>{flourTemp.toFixed(1)}°C</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('Temperatura otoczenia')}</Text>
            <Text style={styles.labelSmall}>{roomTemp.toFixed(1)}°C</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('Ciepło tarcia')}</Text>
            <Text style={styles.labelSmall}>{frictionFactor.toFixed(1)}°C (ręcznie)</Text>
          </View>

          <View style={styles.divider} />

          {/* Calculated Water Result */}
          <View style={styles.ddtResultBox}>
            <Text style={styles.ddtResultLabel}>{t('Wymagana temperatura wody')}</Text>
            <Text style={styles.ddtResultValue}>
              {ddtResult.waterTempTarget.toFixed(1)}°C
            </Text>

            {ddtResult.status === 'too_hot_danger' && (
              <View style={styles.alertDanger}>
                <Text style={styles.alertText}>{ddtResult.warningMessagePl}</Text>
              </View>
            )}

            {ddtResult.status === 'requires_ice' && iceResult && (
              <View style={styles.alertWarning}>
                <Text style={styles.alertText}>
                  Woda poniżej 4°C! Dodaj {iceResult.iceGrams} g lodu do {iceResult.waterGrams} g wody z kranu ({tapWaterTemp}°C).
                </Text>
              </View>
            )}
          </View>
        </View>
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  presetChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  presetChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sublabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  labelSmall: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  valueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  numberInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    width: 65,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  summaryCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: theme.colors.border,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValueBig: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  summaryCaption: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  ddtResultBox: {
    marginTop: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  ddtResultLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  ddtResultValue: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.accent,
    marginVertical: 4,
  },
  alertDanger: {
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  alertWarning: {
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.statusWarning,
  },
  alertText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
});
