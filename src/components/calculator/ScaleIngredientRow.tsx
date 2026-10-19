// ============================================================================
// Apps4Brew Studio — ScaleIngredientRow
// Jeden wiersz karty „Do miski na wagę”: odhaczanie składnika na wadze.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';

export interface ScaleIngredientRowProps {
  testID: string;
  label: string;
  subtext?: string;
  weight: string;
  checked: boolean;
  onPress: () => void;
}

export function ScaleIngredientRow({ testID, label, subtext, weight, checked, onPress }: ScaleIngredientRowProps) {
  return (
    <Pressable
      testID={testID}
      style={[styles.ingredientRow, checked && styles.ingredientRowChecked]}
      onPress={onPress}
    >
      <View style={styles.checkbox}>
        <Text style={styles.checkboxMark}>{checked ? '✓' : '○'}</Text>
      </View>
      <View style={styles.ingredientDetails}>
        <Text style={[styles.ingredientName, checked && styles.ingredientNameChecked]}>{label}</Text>
        {subtext !== undefined && <Text style={styles.ingredientSubtext}>{subtext}</Text>}
      </View>
      <Text style={[styles.ingredientWeight, checked && styles.ingredientWeightChecked]}>{weight}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 52, // Zasada Brudnego Kciuka
  },
  ingredientRowChecked: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.borderLight,
    opacity: 0.5,
  },
  checkbox: {
    marginRight: theme.spacing.sm,
  },
  checkboxMark: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  ingredientDetails: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  ingredientNameChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  ingredientSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  ingredientWeight: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  ingredientWeightChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
});
