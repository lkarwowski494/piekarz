// ============================================================================
// Apps4Craft Studio — BakeVesselSelector Component
// Selector for baking vessel (Dutch Oven, Cloche, Steel, Pullman Pan).
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakingVessel } from '../../data/sqlite-store';

export interface BakeVesselSelectorProps {
  bakingVessel: BakingVessel;
  onSelectVessel: (vessel: BakingVessel) => void;
}

export function BakeVesselSelector({
  bakingVessel,
  onSelectVessel,
}: BakeVesselSelectorProps) {
  const vessels = [
    { id: 'dutch_oven' as const, label: `🍲 ${t('Garnek')}` },
    { id: 'cloche' as const, label: `🏺 ${t('Klosz')}` },
    { id: 'baking_steel' as const, label: `⬛ ${t('Stal')}` },
    { id: 'pullman_pan' as const, label: `🔲 ${t('Forma')}` },
  ];

  return (
    <View style={styles.vesselSelectorContainer} testID="baking-vessel-selector">
      <Text style={styles.vesselSelectorTitle}>🔥 {t('Naczynie wypiekowe')}</Text>
      <View style={styles.vesselChipsRow}>
        {vessels.map((v) => (
          <Pressable
            key={v.id}
            testID={`vessel-chip-${v.id}`}
            style={[
              styles.vesselChip,
              bakingVessel === v.id && styles.vesselChipActive,
            ]}
            onPress={() => onSelectVessel(v.id)}
          >
            <Text
              style={[
                styles.vesselChipText,
                bakingVessel === v.id && styles.vesselChipTextActive,
              ]}
            >
              {v.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vesselSelectorContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  vesselSelectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vesselChipsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  vesselChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  vesselChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  vesselChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  vesselChipTextActive: {
    color: '#FFFFFF',
  },
});
