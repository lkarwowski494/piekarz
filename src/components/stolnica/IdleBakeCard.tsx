// ============================================================================
// Apps4Craft Studio — IdleBakeCard Component
// Idle state card with instructions, vessel picker, and start bake CTA.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakingVessel } from '../../data/sqlite-store';
import { BakeVesselSelector } from './BakeVesselSelector';

export interface IdleBakeCardProps {
  bakingVessel: BakingVessel;
  onSelectVessel: (vessel: BakingVessel) => void;
  onStartBake: () => void;
}

export function IdleBakeCard({
  bakingVessel,
  onSelectVessel,
  onStartBake,
}: IdleBakeCardProps) {
  return (
    <View style={styles.idleCard}>
      <Text style={styles.idleTitle}>{t('Brak aktywnego wypieku')}</Text>
      <Text style={styles.idleText}>
        {t('Wybierz recepturę w Kalkulatorze i kliknij „{przycisk}”, lub uruchom standardowy harmonogram rzemieślniczy poniżej.', {
          przycisk: t('Zacznij wypiek'),
        })}
      </Text>

      {/* Baking Vessel Selector */}
      <BakeVesselSelector
        bakingVessel={bakingVessel}
        onSelectVessel={onSelectVessel}
      />

      <Pressable accessibilityRole="button" style={styles.startBtn} onPress={onStartBake}>
        <Text style={styles.startBtnText}>{t('Zacznij wypiek')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  idleCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  idleTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 8,
  },
  idleText: {
    fontSize: 14,
    color: theme.colors.tusz2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
});
