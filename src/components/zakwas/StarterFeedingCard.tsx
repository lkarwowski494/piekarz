// ============================================================================
// Apps4Craft Studio — StarterFeedingCard Component
// Sourdough starter feeding calculator with ratios and ingredient weights.
// 100% Offline-First.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NumInput } from '../NumInput';
import { dokarmienieZeZostawionego } from '../../core/dokarmianie';
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
  /** Hydratacja zakwasu (%) do wyniku z masy zostawionej w słoiku (BR-ZAKW-002). */
  hydratacjaZakwasu: number;
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
  hydratacjaZakwasu,
  unitSystem,
  onCopyFeeding,
  onOpenConverter,
  onOpenDiscardRecipes,
}: StarterFeedingCardProps) {
  // Masa zakwasu zostawionego w słoiku (g): z niej mąka, woda i hydratacja po dokarmieniu (RD-14, BR-ZAKW-002)
  // [M1-audytor-generalny-130]; puste pole = prośba o uzupełnienie, wynik z chipów masy zakwasu do ciasta zostaje
  const [zostawiam, setZostawiam] = useState<number | null>(null);
  const zZostawionego = zostawiam === null ? null : dokarmienieZeZostawionego(zostawiam, selectedRatio, hydratacjaZakwasu);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('Ilości do dokarmienia')}</Text>
      <Text style={styles.cardSubtitle}>
        {t('Wybierz proporcję i ile zakwasu potrzebujesz do ciasta. Policzę mąkę i wodę.')}
      </Text>

      <Text style={styles.subHeading}>{t('Zostawiam w słoiku')}</Text>
      <NumInput
        testID="zostawiam-input"
        accessibilityLabel={t('Zostawiam w słoiku')}
        unit="g"
        min={0}
        value={zostawiam ?? ''}
        onChangeText={(tekst) => {
          const n = Number(tekst.replace(',', '.'));
          setZostawiam(tekst.trim() === '' || !Number.isFinite(n) ? null : n);
        }}
      />
      {zZostawionego ? (
        <View testID="zostawiam-wynik" style={styles.zostawiamWynik}>
          <Text style={styles.feedingItemLabel}>{t('Mąka')}: {formatWeight(zZostawionego.makaG, unitSystem)}</Text>
          <Text style={styles.feedingItemLabel}>{t('Woda')}: {formatWeight(zZostawionego.wodaG, unitSystem)}</Text>
          <Text style={styles.feedingItemLabel}>{t('Hydratacja zakwasu {n}%', { n: zZostawionego.hydratacjaPct })}</Text>
        </View>
      ) : (
        <Text style={styles.feedingReserveTip}>{t('Wpisz, ile zakwasu zostawiasz w słoiku.')}</Text>
      )}

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
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
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
        {t('Potrzebny zakwas')}: {formatWeight(targetYield, unitSystem)}
      </Text>
      <View style={styles.yieldButtons}>
        {[100, 150, 200, 250, 300].map((y) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: targetYield === y }}
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
        {t('Wskazówka: Z powstałych {masa} pobierz wymaganą ilość do ciasta, a resztkę (~{od}–{do}) schowaj do lodówki jako matkę na kolejny wypiek.', {
          masa: formatWeight(targetYield, unitSystem),
          od: formatWeight(20, unitSystem),
          do: formatWeight(25, unitSystem),
        })}
      </Text>

      <Pressable
        accessibilityRole="button"
        testID="copy-feeding-btn"
        style={styles.copyFeedingBtn}
        onPress={onCopyFeeding}
      >
        <Text style={styles.copyFeedingBtnText}>
          {t('Kopiuj dokarmienie')}
        </Text>
      </Pressable>

      {/* F-49 i F-47 PÓŹNIEJ: wejścia ukryte (ZM-08, D-034) [M1-audytor-generalny-032] */}
      {wejscieWidoczne('konwerter-zakwasu') && (
        <Pressable
          accessibilityRole="button"
          testID="open-converter-btn"
          style={styles.openConverterBtn}
          onPress={onOpenConverter}
        >
          <Text style={styles.openConverterBtnText}>
            {t('Konwerter zakwasu & Lievito Madre')}
          </Text>
        </Pressable>
      )}

      {wejscieWidoczne('odrzut-zakwasu') && (
        <Pressable
          accessibilityRole="button"
          testID="open-discard-recipes-btn"
          style={styles.openConverterBtn}
          onPress={onOpenDiscardRecipes}
        >
          <Text style={styles.openConverterBtnText}>
            {t('Przepisy na Odrzut Zakwasu')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.tusz3,
    marginTop: 2,
    marginBottom: 12,
  },
  subHeading: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: 6,
  },
  ratioChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  ratioChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  ratioChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  ratioChipText: {
    fontSize: 12,
    color: theme.colors.tusz2,
    fontWeight: '500',
  },
  ratioChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  yieldButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  yieldChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  yieldChipActive: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.akcent,
  },
  yieldChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  yieldChipTextActive: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
  },
  feedingResultGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  feedingItem: {
    alignItems: 'center',
    flex: 1,
  },
  feedingItemLabel: {
    fontSize: 11,
    color: theme.colors.tusz3,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedingItemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.tusz,
  },
  feedingItemRatio: {
    fontSize: 10,
    color: theme.colors.akcentTekst,
    marginTop: 2,
    fontWeight: '700',
  },
  plusSign: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz3,
  },
  zostawiamWynik: {
    gap: 2,
    marginTop: 6,
    marginBottom: 12,
  },
  feedingReserveTip: {
    fontSize: 11,
    color: theme.colors.tusz3,
    fontStyle: 'italic',
    lineHeight: 15,
    marginBottom: 12,
  },
  copyFeedingBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    alignItems: 'center',
    marginBottom: 8,
  },
  copyFeedingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  openConverterBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    marginBottom: 8,
  },
  openConverterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
});
