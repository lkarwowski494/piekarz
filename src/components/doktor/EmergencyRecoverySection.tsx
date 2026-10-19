// ============================================================================
// Apps4Craft Studio — EmergencyRecoverySection Component
// Dough recovery protocols and triage cards for kitchen emergencies.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import {
  DOUGH_RECOVERY_PROTOCOLS,
  EmergencyCode,
  getDoughRecoveryProtocol,
} from '../../doctor/dough-recovery';
import { formatTextUnits } from '../../lib/unit-converter';

export interface EmergencyRecoverySectionProps {
  selectedRecoveryId: EmergencyCode | null;
  onSelectRecoveryId: (id: EmergencyCode | null) => void;
  unitSystem: any;
  onPivotToRecipe?: (protocolId: EmergencyCode) => void;
}

export function EmergencyRecoverySection({
  selectedRecoveryId,
  onSelectRecoveryId,
  unitSystem,
  onPivotToRecipe,
}: EmergencyRecoverySectionProps) {
  const selectedProto = selectedRecoveryId
    ? getDoughRecoveryProtocol(selectedRecoveryId)
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>🚨 {t('Protokoły ratunkowe (Pogotowie ciasta)')}</Text>
      <Text style={styles.sectionSubheading}>
        {t('Szybkie interwencje w trakcie fermentacji')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsRow}
      >
        {DOUGH_RECOVERY_PROTOCOLS.map((proto) => {
          const isSelected = selectedRecoveryId === proto.id;
          return (
            <Pressable
              key={proto.id}
              testID={`recovery-chip-${proto.id}`}
              style={[styles.presetChip, isSelected && styles.recoveryChipActive]}
              onPress={() => onSelectRecoveryId(isSelected ? null : (proto.id as EmergencyCode))}
            >
              <Text style={styles.presetIcon}>{proto.icon}</Text>
              <Text style={[styles.presetName, isSelected && styles.recoveryChipTextActive]}>
                {t(proto.titlePl)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Selected Protocol Expanded Card */}
      {selectedProto && (
        <View style={styles.recoveryCard} testID="recovery-protocol-card">
          <View style={styles.recoveryHeaderRow}>
            <Text style={styles.recoveryCardTitle}>
              {selectedProto.icon} {t(selectedProto.titlePl)}
            </Text>
            <Pressable
              testID="close-recovery-card-btn"
              onPress={() => onSelectRecoveryId(null)}
              style={styles.closeRecoveryBtn}
            >
              <Text style={styles.closeRecoveryBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.recoveryTriggerText}>
            🔍 {formatTextUnits(t(selectedProto.triggerSummaryPl), unitSystem)}
          </Text>

          {/* Immediate Action Alert */}
          <View style={styles.immediateAlertBox}>
            <Text style={styles.immediateAlertLabel}>{t('Akcja natychmiastowa:')}</Text>
            <Text style={styles.immediateAlertText}>
              {formatTextUnits(t(selectedProto.immediateActionPl), unitSystem)}
            </Text>
          </View>

          {/* Target Pivot Recipe */}
          <View style={styles.pivotRecipeBox}>
            <View style={styles.pivotTextCol}>
              <Text style={styles.pivotRecipeLabel}>{t('Receptura awaryjna:')}</Text>
              <Text style={styles.pivotRecipeName}>{t(selectedProto.pivotRecipeNamePl)}</Text>
            </View>
            {onPivotToRecipe && (
              <Pressable
                testID="pivot-recipe-btn"
                accessibilityRole="button"
                accessibilityLabel={`${t('Załaduj do Kalkulatora')}: ${t(selectedProto.pivotRecipeNamePl)}`}
                style={styles.pivotActionBtn}
                onPress={() => onPivotToRecipe(selectedProto.id)}
              >
                <Text style={styles.pivotActionBtnText}>⚡ {t('Załaduj do Kalkulatora')}</Text>
              </Pressable>
            )}
          </View>

          {/* Steps */}
          <Text style={styles.recoveryStepsHeading}>{t('Kroki ratunkowe:')}</Text>
          {selectedProto.stepByStepPl.map((step, idx) => (
            <View key={idx} style={styles.recoveryStepRow}>
              <View style={styles.recoveryStepIndexPill}>
                <Text style={styles.recoveryStepIndexText}>{idx + 1}</Text>
              </View>
              <Text style={styles.recoveryStepText}>{formatTextUnits(t(step), unitSystem)}</Text>
            </View>
          ))}

          {/* Scientific Reasoning */}
          <View style={styles.scienceBox}>
            <Text style={styles.scienceLabel}>🔬 {t('Fizjologia ciasta:')}</Text>
            <Text style={styles.scienceText}>
              {formatTextUnits(t(selectedProto.scientificReasoningPl), unitSystem)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 2,
  },
  sectionSubheading: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  presetsRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 6,
  },
  recoveryChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  recoveryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  presetName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  recoveryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.accentLight,
    marginTop: 8,
    marginBottom: 12,
  },
  recoveryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recoveryCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  closeRecoveryBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeRecoveryBtnText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  recoveryTriggerText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  immediateAlertBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.statusDanger,
    marginBottom: 10,
  },
  immediateAlertLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.statusDanger,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  immediateAlertText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    lineHeight: 17,
  },
  pivotRecipeBox: {
    backgroundColor: theme.colors.surfaceCard,
    padding: 10,
    borderRadius: theme.radius.sm,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pivotTextCol: {
    flex: 1,
  },
  pivotRecipeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  pivotRecipeName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginTop: 2,
  },
  pivotActionBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pivotActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recoveryStepsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  recoveryStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recoveryStepIndexPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  recoveryStepIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  recoveryStepText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  scienceBox: {
    marginTop: 8,
    backgroundColor: theme.colors.surfaceCard,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scienceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  scienceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
