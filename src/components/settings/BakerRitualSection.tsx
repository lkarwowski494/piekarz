import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakingVessel } from '../../data/sqlite-store';

import { typografia } from '../../ui/tokeny';
// Bez wyboru stylu wypieku: rodzaj receptur wybiera się na Starcie; zapisana wartość
// baker_ritual_profile zostaje w bazie, kod jej nie czyta [M1-audytor-generalny-101; BR-START-001]
export interface BakerRitualSectionProps {
  bakingVessel: BakingVessel;
  onVesselChange: (vessel: BakingVessel) => void;
}

export function BakerRitualSection({
  bakingVessel,
  onVesselChange,
}: BakerRitualSectionProps) {
  return (
    <>
      {/* Baking Equipment Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Sprzęt i naczynie do wypieku')}</Text>
        <Text style={styles.cardDescription}>
          {t('Wybierz domyślne naczynie piecowe dla procedury Stolnicy:')}
        </Text>
        <View style={styles.optionsCol}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'dutch_oven' }}
            testID="vessel-dutch-oven-btn"
            style={[styles.optionCard, bakingVessel === 'dutch_oven' && styles.optionCardActive]}
            onPress={() => onVesselChange('dutch_oven')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'dutch_oven' && styles.optionTitleActive]}>
                {t('Garnek żeliwny')}
              </Text>
            </View>
            {bakingVessel === 'dutch_oven' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'cloche' }}
            testID="vessel-cloche-btn"
            style={[styles.optionCard, bakingVessel === 'cloche' && styles.optionCardActive]}
            onPress={() => onVesselChange('cloche')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'cloche' && styles.optionTitleActive]}>
                {t('Klosz ceramiczny')}
              </Text>
            </View>
            {bakingVessel === 'cloche' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'baking_steel' }}
            testID="vessel-steel-btn"
            style={[styles.optionCard, bakingVessel === 'baking_steel' && styles.optionCardActive]}
            onPress={() => onVesselChange('baking_steel')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'baking_steel' && styles.optionTitleActive]}>
                {t('Stal / Kamień szamotowy')}
              </Text>
            </View>
            {bakingVessel === 'baking_steel' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'pullman_pan' }}
            testID="vessel-pullman-btn"
            style={[styles.optionCard, bakingVessel === 'pullman_pan' && styles.optionCardActive]}
            onPress={() => onVesselChange('pullman_pan')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'pullman_pan' && styles.optionTitleActive]}>
                {t('Foremka z pokrywą')}
              </Text>
            </View>
            {bakingVessel === 'pullman_pan' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  sectionTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  optionsCol: {
    gap: 8,
  },
  optionCard: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  optionCardActive: {
    borderColor: theme.colors.akcent,
    borderWidth: 3,
    backgroundColor: theme.colors.powierzchnia,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  optionTitleActive: {
    get fontFamily() { return theme.typography.krojTytulow; },
    color: theme.colors.akcentTekst,
  },
  optionSubtitle: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz3,
    marginTop: 2,
    lineHeight: 16,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
    marginLeft: 8,
  },
});
