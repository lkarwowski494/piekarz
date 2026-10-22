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
import { formatTextUnits, UnitSystem } from '../../lib/unit-converter';

import { typografia } from '../../ui/tokeny';
export interface EmergencyRecoverySectionProps {
  selectedRecoveryId: EmergencyCode | null;
  onSelectRecoveryId: (id: EmergencyCode | null) => void;
  unitSystem: UnitSystem;
}

export function EmergencyRecoverySection({
  selectedRecoveryId,
  onSelectRecoveryId,
  unitSystem,
}: EmergencyRecoverySectionProps) {
  const selectedProto = selectedRecoveryId
    ? getDoughRecoveryProtocol(selectedRecoveryId)
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>{t('Protokoły ratunkowe (Pogotowie ciasta)')}</Text>
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
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
              key={proto.id}
              testID={`recovery-chip-${proto.id}`}
              style={[styles.presetChip, isSelected && styles.recoveryChipActive]}
              onPress={() => onSelectRecoveryId(isSelected ? null : (proto.id as EmergencyCode))}
            >
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
              {t(selectedProto.titlePl)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Zamknij protokół ratunkowy')}
              testID="close-recovery-card-btn"
              onPress={() => onSelectRecoveryId(null)}
              style={styles.closeRecoveryBtn}
            >
              <Text style={styles.closeRecoveryBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.recoveryTriggerText}>
            {formatTextUnits(t(selectedProto.triggerSummaryPl), unitSystem)}
          </Text>

          {/* Immediate Action Alert */}
          <View style={styles.immediateAlertBox}>
            <Text style={styles.immediateAlertLabel}>{t('Akcja natychmiastowa:')}</Text>
            <Text style={styles.immediateAlertText}>
              {formatTextUnits(t(selectedProto.immediateActionPl), unitSystem)}
            </Text>
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
            <Text style={styles.scienceLabel}>{t('Fizjologia ciasta:')}</Text>
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
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 8,
    marginBottom: 2,
  },
  sectionSubheading: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz3,
    marginBottom: 10,
  },
  presetsRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 8,
  },
  presetChip: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    marginRight: 6,
  },
  recoveryChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  recoveryChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  presetName: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    fontWeight: '600',
  },
  recoveryCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.akcent,
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
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.tusz,
    flex: 1,
  },
  closeRecoveryBtn: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeRecoveryBtnText: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz3,
    fontWeight: '700',
  },
  recoveryTriggerText: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    marginBottom: 10,
    lineHeight: 18,
  },
  immediateAlertBox: {
    backgroundColor: theme.colors.powierzchnia,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.blad,
    marginBottom: 10,
  },
  immediateAlertLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.blad,
    marginBottom: 2,
  },
  immediateAlertText: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    lineHeight: 17,
  },
  recoveryStepsHeading: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
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
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  recoveryStepIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  recoveryStepText: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    lineHeight: 18,
    flex: 1,
  },
  scienceBox: {
    marginTop: 8,
    backgroundColor: theme.colors.powierzchnia,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  scienceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz3,
    marginBottom: 2,
  },
  scienceText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
