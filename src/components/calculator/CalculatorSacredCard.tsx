// ============================================================================
// Piekarz — liczby receptury jako lista grupowana (mapa-rol.md §4: CraftCard i CraftStatDisplay zastąpione
// komórkami listy; etykieta `tusz`, wartość `tusz2`, liczby tabelaryczne, komórka ≥ cele.pozostale,
// tło `powierzchnia`, promień grupy, separator `linia`, bez wersalików) [M1-audytor-generalny-057]
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatFixed } from '../../lib/format';
import { useUnitSystem, formatWeight, formatTemperature } from '../../lib/unit-converter';

export interface CalculatorSacredCardProps {
  overallHydrationPercent: number;
  targetDoughWeightGrams: number;
  totalFlourGrams: number;
  targetDdt: number;
}

function Komorka({ testID, etykieta, wartosc, ostatnia }: { testID: string; etykieta: string; wartosc: string; ostatnia?: boolean }) {
  return (
    <View testID={testID} style={[styles.komorka, !ostatnia && styles.podzial]} accessible accessibilityLabel={`${etykieta}: ${wartosc}`}>
      <Text style={styles.etykieta}>{etykieta}</Text>
      <Text style={styles.wartosc}>{wartosc}</Text>
    </View>
  );
}

export function CalculatorSacredCard({
  overallHydrationPercent,
  targetDoughWeightGrams,
  totalFlourGrams,
  targetDdt,
}: CalculatorSacredCardProps) {
  // Masa i DDT w jednostkach z ustawienia (design-spec §7, D-044) [M1-audytor-generalny-096]
  const unitSystem = useUnitSystem();
  return (
    <View testID="sacred-numbers-panel" style={styles.grupa}>
      <Komorka testID="stat-hydration" etykieta={t('Hydratacja')} wartosc={`${formatFixed(overallHydrationPercent, 1)}%`} />
      <Komorka testID="stat-dough-weight" etykieta={t('Masa')} wartosc={formatWeight(targetDoughWeightGrams, unitSystem)} />
      <Komorka testID="stat-total-flour" etykieta={t('Mąka')} wartosc={formatWeight(totalFlourGrams, unitSystem)} />
      <Komorka testID="stat-target-ddt" etykieta={t('DDT')} wartosc={formatTemperature(targetDdt, unitSystem)} ostatnia />
    </View>
  );
}

const styles = StyleSheet.create({
  grupa: {
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  komorka: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  podzial: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.linia,
  },
  etykieta: {
    fontSize: 17,
    color: theme.colors.tusz,
  },
  wartosc: {
    fontSize: 17,
    color: theme.colors.tusz2,
    fontVariant: ['tabular-nums'],
  },
});
