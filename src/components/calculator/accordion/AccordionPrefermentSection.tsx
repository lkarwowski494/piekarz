import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import { wskazowkaZaczynu } from '../../../lib/wskazowka-zaczynu';
import { useUnitSystem, formatWeight } from '../../../lib/unit-converter';
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
  // Masy w jednostkach z ustawienia (D-044) [M1-audytor-generalny-096]
  const unitSystem = useUnitSystem();
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeaderTitle}>{t('Zaczyny')}</Text>
      <View style={styles.prefermentButtonsRow}>
        {(['direct', 'poolish', 'biga', 'pate_fermentee', 'levain'] as PrefermentType[]).map(
          (pType) => {
            const isSel = prefermentType === pType;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !!(isSel) }}
                key={pType}
                testID={`pref-type-${pType}`}
                style={[styles.prefBtn, isSel && styles.prefBtnSelected]}
                onPress={() => onPrefermentTypeChange(pType)}
              >
                <Pressable
                  accessibilityRole="button"
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
                  accessibilityRole="button"
                  accessibilityState={{ selected: prefermentFlourPct === pct }}
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
              <Text style={styles.prefermentColHeader}>{t('Zaczyn ({g} g)', { g: prefermentBreakdown.prefermentTotalWeightGrams })}</Text>
              <Text style={styles.prefermentItemText}>{t('Mąka w zaczynie')}: {formatWeight(prefermentBreakdown.prefermentFlourGrams, unitSystem)}</Text>
              <Text style={styles.prefermentItemText}>{t('Woda w zaczynie')}: {formatWeight(prefermentBreakdown.prefermentWaterGrams, unitSystem)}</Text>
            </View>
            <View style={styles.prefermentCol}>
              <Text style={styles.prefermentColHeader}>{t('Do miski (Ciasto właściwe)')}</Text>
              <Text style={styles.prefermentItemText}>{t('Pozostała mąka: {g} g', { g: prefermentBreakdown.doughAddedFlourGrams })}</Text>
              <Text style={styles.prefermentItemText}>{t('Pozostała woda: {g} g', { g: prefermentBreakdown.doughAddedWaterGrams })}</Text>
            </View>
          </View>

          <Text style={styles.fermentationTipText}>{wskazowkaZaczynu(prefermentBreakdown)}</Text>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  paramLabel: {
    fontSize: 11,
    color: theme.colors.tusz3,
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
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
  },
  prefBtnSelected: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  prefBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz2,
  },
  prefBtnTextSelected: {
    color: theme.colors.naAkcencie,
  },
  prefermentDetailsBlock: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
  },
  smallChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallChipActive: {
    borderColor: theme.colors.akcent,
    backgroundColor: theme.colors.akcent,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  smallChipTextActive: {
    color: theme.colors.naAkcencie,
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
    color: theme.colors.tusz,
    marginBottom: 2,
  },
  prefermentItemText: {
    fontSize: 11,
    color: theme.colors.tusz2,
  },
  fermentationTipText: {
    fontSize: 11,
    color: theme.colors.tusz3,
    fontStyle: 'italic',
  },
});
