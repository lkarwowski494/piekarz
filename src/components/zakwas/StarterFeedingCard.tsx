// ============================================================================
// Apps4Craft Studio — StarterFeedingCard Component
// Sourdough starter feeding calculator with ratios and ingredient weights.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatWeight, formatTemperature, UnitSystem } from '../../lib/unit-converter';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';

export interface StarterFeedingCardProps {
  selectedRatio: [number, number, number];
  onSelectRatio: (ratio: [number, number, number]) => void;
  targetYield: number;
  onTargetYieldChange: (y: number) => void;
  feeding: {
    starterGrams: number;
    flourGrams: number;
    waterGrams: number;
  };
  unitSystem: UnitSystem;
  onCopyFeeding: () => void;
  onOpenConverter: () => void;
  onOpenDiscardRecipes: () => void;
}

export function StarterFeedingCard({
  selectedRatio,
  onSelectRatio,
  targetYield,
  onTargetYieldChange,
  feeding,
  unitSystem,
  onCopyFeeding,
  onOpenConverter,
  onOpenDiscardRecipes,
}: StarterFeedingCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('Kalkulator dokarmiania')}</Text>
      <Text style={styles.cardSubtitle}>
        {t('Dobierz proporcje i potrzebną masę zaczynu (Levain) do wypieku')}
      </Text>

      {/* Ratio Selector */}
      <Text style={styles.subHeading}>{t('Cykl dokarmiania')} ({t('Proporcja')})</Text>
      <View style={styles.ratioChipsRow}>
        {[
          { ratio: [1, 1, 1] as [number, number, number], label: t('1:1:1 (Szybki 3-4h)') },
          { ratio: [1, 2, 2] as [number, number, number], label: t('1:2:2 (Klasyk 6-8h)') },
          { ratio: [1, 3, 3] as [number, number, number], label: '1:3:3 (8-10h)' },
          { ratio: [1, 5, 5] as [number, number, number], label: t('1:5:5 (Na noc 12h)') },
        ].map((item, idx) => {
          const isSelected =
            selectedRatio[0] === item.ratio[0] &&
            selectedRatio[1] === item.ratio[1] &&
            selectedRatio[2] === item.ratio[2];
          return (
            <Pressable
              key={idx}
              onPress={() => onSelectRatio(item.ratio)}
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
        {t('Potrzebny zaczyn (Levain)')}: {formatWeight(targetYield, unitSystem)}
      </Text>
      <View style={styles.yieldButtons}>
        {[100, 150, 200, 250, 300].map((y) => (
          <Pressable
            key={y}
            onPress={() => onTargetYieldChange(y)}
            style={[styles.yieldChip, targetYield === y && styles.yieldChipActive]}
          >
            <Text style={[styles.yieldChipText, targetYield === y && styles.yieldChipTextActive]}>
              {formatWeight(y, unitSystem)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Result Calculation Breakdown */}
      <View style={styles.feedingResultGrid}>
        <View style={styles.feedingItem}>
          <Text style={styles.feedingItemLabel}>{t('Stary zakwas')}</Text>
          <Text style={styles.feedingItemValue}>{formatWeight(feeding.starterGrams, unitSystem)}</Text>
          <Text style={styles.feedingItemRatio}>{t('{n} cz.', { n: selectedRatio[0] })}</Text>
        </View>
        <Text style={styles.plusSign}>+</Text>
        <View style={styles.feedingItem}>
          <Text style={styles.feedingItemLabel}>{t('Mąka')}</Text>
          <Text style={styles.feedingItemValue}>{formatWeight(feeding.flourGrams, unitSystem)}</Text>
          <Text style={styles.feedingItemRatio}>{t('{n} cz.', { n: selectedRatio[1] })}</Text>
        </View>
        <Text style={styles.plusSign}>+</Text>
        <View style={styles.feedingItem}>
          <Text style={styles.feedingItemLabel}>{t('Woda')} (~{formatTemperature(28, unitSystem)})</Text>
          <Text style={styles.feedingItemValue}>{formatWeight(feeding.waterGrams, unitSystem)}</Text>
          <Text style={styles.feedingItemRatio}>{t('{n} cz.', { n: selectedRatio[2] })}</Text>
        </View>
      </View>
      <Text style={styles.feedingReserveTip}>
        💡 {t('Wskazówka: Z powstałych {masa} pobierz wymaganą ilość do ciasta, a resztkę (~{od}–{do}) schowaj do lodówki jako matkę na kolejny wypiek.', {
          masa: formatWeight(targetYield, unitSystem),
          od: formatWeight(20, unitSystem),
          do: formatWeight(25, unitSystem),
        })}
      </Text>

      <Pressable
        testID="copy-feeding-btn"
        style={styles.copyFeedingBtn}
        onPress={onCopyFeeding}
      >
        <Text style={styles.copyFeedingBtnText}>
          📋 {t('Kopiuj dokarmienie')}
        </Text>
      </Pressable>

      {/* F-49 i F-47 PÓŹNIEJ: wejścia ukryte (ZM-08, D-034) [M1-audytor-generalny-032] */}
      {wejscieWidoczne('konwerter-zakwasu') && (
        <Pressable
          testID="open-converter-btn"
          style={styles.openConverterBtn}
          onPress={onOpenConverter}
        >
          <Text style={styles.openConverterBtnText}>
            ⚖️ {t('Konwerter zakwasu & Lievito Madre')}
          </Text>
        </Pressable>
      )}

      {wejscieWidoczne('odrzut-zakwasu') && (
        <Pressable
          testID="open-discard-recipes-btn"
          style={styles.openConverterBtn}
          onPress={onOpenDiscardRecipes}
        >
          <Text style={styles.openConverterBtnText}>
            🥞 {t('Przepisy na Odrzut Zakwasu')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  ratioChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  ratioChip: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ratioChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  ratioChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  ratioChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  yieldButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  yieldChip: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yieldChipActive: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.accent,
  },
  yieldChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  yieldChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  feedingResultGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feedingItem: {
    alignItems: 'center',
    flex: 1,
  },
  feedingItemLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedingItemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  feedingItemRatio: {
    fontSize: 10,
    color: theme.colors.accentDark,
    marginTop: 2,
    fontWeight: '700',
  },
  plusSign: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  feedingReserveTip: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 15,
    marginBottom: 12,
  },
  copyFeedingBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    alignItems: 'center',
    marginBottom: 8,
  },
  copyFeedingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  openConverterBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: 8,
  },
  openConverterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
