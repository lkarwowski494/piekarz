import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import { formatFixed, formatNumber } from '../../../lib/format';
import { HydrationDifficultyInfo } from '../../../core/domain-rules';
import { BlendAbsorptionAnalysis } from '../../../core/flour-atlas';
import { useUnitSystem, formatTemperature, krokTemperatury } from '../../../lib/unit-converter';

export interface AccordionDdtSectionProps {
  targetDdt: number;
  onTargetDdtChange: (val: number) => void;
  waterTempTarget: number;
  /** Ostrzeżenie reguły RD-05 (status too_hot_danger); brak = woda w zakresie [M1-audytor-generalny-039]. */
  waterTempWarning?: string;
  waterPct: number;
  onWaterPctChange: (pct: number) => void;
  hydrationDifficulty?: HydrationDifficultyInfo;
  blendAbsorption?: BlendAbsorptionAnalysis;
}

export function AccordionDdtSection({
  targetDdt,
  onTargetDdtChange,
  waterTempTarget,
  waterTempWarning,
  waterPct,
  onWaterPctChange,
  hydrationDifficulty,
  blendAbsorption,
}: AccordionDdtSectionProps) {
  const unitSystem = useUnitSystem();

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeaderTitle}>
        {t('Temperatura wody')}
      </Text>
      <Text style={styles.sectionDesc}>
        {t(
          'Właściwa temperatura wody zapewnia docelową temperaturę ciasta po wymieszaniu.'
        )}
      </Text>

      <View style={styles.ddtResultCard}>
        <View style={styles.ddtResultRow}>
          <Text style={styles.ddtResultLabel}>{t('Docelowa temp. wody:')}</Text>
          <Text style={styles.ddtResultValue}>
            {formatTemperature(waterTempTarget, unitSystem)}
          </Text>
        </View>

        {waterTempWarning !== undefined && (
          <View style={styles.hotAlertRow} testID="ddt-too-hot-warning" accessibilityRole="alert">
            <Text style={styles.hotAlertText}>{t(waterTempWarning)}</Text>
          </View>
        )}


      </View>

      <View style={styles.gridParams}>
        <View style={styles.paramBox}>
          <Text style={styles.paramLabel}>{t('Docelowe DDT')}</Text>
          <View style={styles.stepperInline}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Obniż docelową temperaturę ciasta')}
              testID="ddt-minus-btn"
              style={styles.miniBtn}
              onPress={() => onTargetDdtChange(Math.max(18, krokTemperatury(targetDdt, -1, unitSystem)))}
            >
              <Text style={styles.miniBtnText}>−</Text>
            </Pressable>
            <Text style={styles.paramValue}>{formatTemperature(targetDdt, unitSystem)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Podnieś docelową temperaturę ciasta')}
              testID="ddt-plus-btn"
              style={styles.miniBtn}
              onPress={() => onTargetDdtChange(Math.min(32, krokTemperatury(targetDdt, 1, unitSystem)))}
            >
              <Text style={styles.miniBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.paramBox}>
          <Text style={styles.paramLabel}>{t('Hydratacja bazy')}</Text>
          <View style={styles.stepperInline}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Zmniejsz hydratację')}
              testID="water-pct-minus-btn"
              style={styles.miniBtn}
              onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 1).toFixed(1))))}
            >
              <Text style={styles.miniBtnText}>−</Text>
            </Pressable>
            <Text style={styles.paramValue}>{formatFixed(waterPct, 1)}%</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Zwiększ hydratację')}
              testID="water-pct-plus-btn"
              style={styles.miniBtn}
              onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 1).toFixed(1))))}
            >
              <Text style={styles.miniBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Steppery -5%, -1%, +1%, +5% */}
      <View style={styles.stepperRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Zmniejsz hydratację o {n}%', { n: 5 })}
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 5).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>-5%</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Zmniejsz hydratację o {n}%', { n: 1 })}
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 1).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>-1%</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Zwiększ hydratację o {n}%', { n: 1 })}
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 1).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>+1%</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Zwiększ hydratację o {n}%', { n: 5 })}
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 5).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>+5%</Text>
        </Pressable>
      </View>

      {/* Badge trudności hydratacji */}
      {hydrationDifficulty && (
        <View style={styles.diffBadgeRow}>
          <View style={styles.diffBadge}>
            <Text style={styles.diffBadgeText}>
              ● {t(hydrationDifficulty.labelPl)}
            </Text>
          </View>
          <Text style={styles.diffTipText}>{t(hydrationDifficulty.tipPl)}</Text>
        </View>
      )}

      {/* Chłonność mąk */}
      {blendAbsorption && (
        <View style={styles.absorptionBadge} testID="flour-absorption-badge">
          <Text style={styles.absorptionLabel}>
            {t('Chłonność mąk:')} {formatNumber(blendAbsorption.weightedAbsorptionPercent)}% ({t('zalecana')}: {formatNumber(blendAbsorption.recommendedHydrationRange[0])}–{formatNumber(blendAbsorption.recommendedHydrationRange[1])}%) • {t('Białko')}: ~{formatNumber(blendAbsorption.estimatedProteinPercent)}%
          </Text>
          <Text style={styles.absorptionAdviceText}>
            {t(blendAbsorption.doughFeelAdvicePl)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  sectionHeaderTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  ddtResultCard: {
    backgroundColor: theme.colors.powierzchnia,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.sm,
  },
  ddtResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ddtResultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  ddtResultValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },

  hotAlertRow: {
    marginTop: 6,
    padding: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.blad,
  },
  hotAlertText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz,
  },

  gridParams: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paramBox: {
    flex: 1,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  paramLabel: {
    fontSize: 11,
    color: theme.colors.tusz3,
    marginBottom: 4,
  },
  stepperInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniBtn: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    width: 32,
    height: 32,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  miniBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  paramStepBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  paramStepText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  diffBadgeRow: {
    marginTop: 10,
    gap: 4,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.tloGrupa, // poziom info (hydrationDifficulty.poziom): kolor z komponentu, nie z danych
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  diffTipText: {
    fontSize: 11,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
  },
  absorptionBadge: {
    marginTop: 10,
    padding: 8,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    gap: 4,
  },
  absorptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  absorptionAdviceText: {
    fontSize: 11,
    color: theme.colors.tusz2,
  },
});
