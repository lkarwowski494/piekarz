import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import { PrefermentType, PrefermentBreakdownResult } from '../../../core/preferments';

export interface AccordionPrefermentSectionProps {
  prefermentType: PrefermentType;
  onPrefermentTypeChange: (type: PrefermentType) => void;
  prefermentFlourPct?: number;
  onPrefermentFlourPctChange?: (pct: number) => void;
  prefermentBreakdown?: PrefermentBreakdownResult | null;
}

export function AccordionPrefermentSection({
  prefermentType,
  onPrefermentTypeChange,
  prefermentFlourPct = 20,
  onPrefermentFlourPctChange,
  prefermentBreakdown,
}: AccordionPrefermentSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeaderTitle}>🏺 {t('Zaczyny rzemieślnicze (Preferments)')}</Text>
      <View style={styles.prefermentButtonsRow}>
        {(['direct', 'poolish', 'biga', 'pate_fermentee', 'levain'] as PrefermentType[]).map(
          (pType) => {
            const isSel = prefermentType === pType;
            return (
              <Pressable
                key={pType}
                testID={`pref-type-${pType}`}
                style={[styles.prefBtn, isSel && styles.prefBtnSelected]}
                onPress={() => onPrefermentTypeChange(pType)}
              >
                <Pressable
                  testID={`preferment-type-${pType}`}
                  onPress={() => onPrefermentTypeChange(pType)}
                >
                  <Text
                    style={[
                      styles.prefBtnText,
                      isSel && styles.prefBtnTextSelected,
                    ]}
                  >
                    {pType === 'direct'
                      ? t('Bezpośrednie')
                      : pType === 'poolish'
                      ? 'Poolish'
                      : pType === 'biga'
                      ? 'Biga'
                      : pType === 'pate_fermentee'
                      ? 'Pâte Fermentée'
                      : 'Levain'}
                  </Text>
                </Pressable>
              </Pressable>
            );
          }
        )}
      </View>

      {prefermentBreakdown && (
        <View style={styles.prefermentDetailsBlock} testID="preferment-details-block">
          <View style={styles.rowBetween}>
            <Text style={styles.paramLabel}>{t('Udział mąki w zaczynie')}:</Text>
            <View style={styles.chipRow}>
              {[15, 20, 25, 30, 40].map((pct) => (
                <Pressable
                  key={pct}
                  testID={`preferment-pct-${pct}`}
                  style={[styles.smallChip, prefermentFlourPct === pct && styles.smallChipActive]}
                  onPress={() => onPrefermentFlourPctChange?.(pct)}
                >
                  <Text style={[styles.smallChipText, prefermentFlourPct === pct && styles.smallChipTextActive]}>
                    {pct}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.prefermentGrid}>
            <View style={styles.prefermentCol}>
              <Text style={styles.prefermentColHeader}>🥣 {t('Zaczyn ({g} g)', { g: prefermentBreakdown.prefermentTotalWeightGrams })}</Text>
              <Text style={styles.prefermentItemText}>🌾 {t('Mąka w zaczynie')}: {prefermentBreakdown.prefermentFlourGrams} g</Text>
              <Text style={styles.prefermentItemText}>💧 {t('Woda w zaczynie')}: {prefermentBreakdown.prefermentWaterGrams} g</Text>
            </View>
            <View style={styles.prefermentCol}>
              <Text style={styles.prefermentColHeader}>🥖 {t('Do miski (Ciasto właściwe)')}</Text>
              <Text style={styles.prefermentItemText}>🌾 {t('Pozostała mąka: {g} g', { g: prefermentBreakdown.doughAddedFlourGrams })}</Text>
              <Text style={styles.prefermentItemText}>💧 {t('Pozostała woda: {g} g', { g: prefermentBreakdown.doughAddedWaterGrams })}</Text>
            </View>
          </View>

          <Text style={styles.fermentationTipText}>💡 {t(prefermentBreakdown.fermentationTipPl)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  paramLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  prefermentButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  prefBtn: {
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  prefBtnSelected: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  prefBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  prefBtnTextSelected: {
    color: theme.colors.textPrimary,
  },
  prefermentDetailsBlock: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
  },
  smallChip: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  smallChipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  prefermentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  prefermentCol: {
    flex: 1,
    gap: 4,
  },
  prefermentColHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  prefermentItemText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  fermentationTipText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});
