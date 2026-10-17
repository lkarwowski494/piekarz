// ============================================================================
// Apps4Craft Studio — IdleBakeCard Component
// Idle state card with instructions, vessel picker, and start bake CTA.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
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
      <Text style={styles.idleTitle}>Brak aktywnego wypieku</Text>
      <Text style={styles.idleText}>
        Wybierz recepturę w Kalkulatorze i kliknij „Rozpocznij wypiek na Stolnicy”, lub
        uruchom standardowy harmonogram rzemieślniczy poniżej.
      </Text>

      {/* Baking Vessel Selector */}
      <BakeVesselSelector
        bakingVessel={bakingVessel}
        onSelectVessel={onSelectVessel}
      />

      <Pressable style={styles.startBtn} onPress={onStartBake}>
        <Text style={styles.startBtnText}>🥖 Rozpocznij wypiek</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  idleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  idleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  idleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
