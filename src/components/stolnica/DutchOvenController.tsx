// ============================================================================
// Apps4Craft Studio — DutchOvenController Component
// Two-phase baking controller with steam release alert gate.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { DUTCH_OVEN_PHASES, DutchOvenBakePhase } from '../../core/baking-phases';
import { formatTemperature, formatTextUnits, UnitSystem } from '../../lib/unit-converter';

export interface DutchOvenControllerProps {
  dutchOvenPhase: DutchOvenBakePhase;
  onSwitchPhase: (phase: DutchOvenBakePhase) => void;
  unitSystem: UnitSystem;
  isCompleted: boolean;
  onStartPhase2AfterSteamAlert: () => void;
}

export function DutchOvenController({
  dutchOvenPhase,
  onSwitchPhase,
  unitSystem,
  isCompleted,
  onStartPhase2AfterSteamAlert,
}: DutchOvenControllerProps) {
  return (
    <View style={styles.dutchOvenContainer} testID="dutch-oven-phase-card">
      {/* Phase selector tabs */}
      <View style={styles.phaseTabsRow}>
        <Pressable
          testID="phase-tab-lid-on"
          style={[
            styles.phaseTabBtn,
            dutchOvenPhase === 'lid_on' && styles.phaseTabBtnActive,
          ]}
          onPress={() => onSwitchPhase('lid_on')}
        >
          <Text
            style={[
              styles.phaseTabBtnText,
              dutchOvenPhase === 'lid_on' && styles.phaseTabBtnTextActive,
            ]}
          >
            🍲 {t('Faza 1: Pod pokrywką (Para)')}
          </Text>
        </Pressable>

        <Pressable
          testID="phase-tab-lid-off"
          style={[
            styles.phaseTabBtn,
            dutchOvenPhase === 'lid_off' && styles.phaseTabBtnActive,
          ]}
          onPress={() => onSwitchPhase('lid_off')}
        >
          <Text
            style={[
              styles.phaseTabBtnText,
              dutchOvenPhase === 'lid_off' && styles.phaseTabBtnTextActive,
            ]}
          >
            🔥 {t('Faza 2: Bez pokrywki (Karmelizacja)')}
          </Text>
        </Pressable>
      </View>

      {/* Phase Info Card */}
      <View style={styles.phaseInfoCard}>
        <View style={styles.phaseHeaderRow}>
          <Text style={styles.phaseTitle}>
            {dutchOvenPhase === 'lid_on'
              ? t('Faza 1: Pod pokrywką (Para)')
              : t('Faza 2: Bez pokrywki (Karmelizacja)')}
          </Text>
          <View style={styles.phaseTempBadge}>
            <Text style={styles.phaseTempBadgeText}>
              {formatTemperature(DUTCH_OVEN_PHASES[dutchOvenPhase].temperatureC, unitSystem)}
            </Text>
          </View>
        </View>
        <Text style={styles.phaseDesc}>
          {formatTextUnits(t(DUTCH_OVEN_PHASES[dutchOvenPhase].descriptionPl), unitSystem)}
        </Text>
        <Text style={styles.phaseTip}>
          💡 {formatTextUnits(t(DUTCH_OVEN_PHASES[dutchOvenPhase].tipPl), unitSystem)}
        </Text>
      </View>

      {/* Steam Release Alert Gate (if lid_on finished) */}
      {dutchOvenPhase === 'lid_on' && isCompleted && (
        <View style={styles.steamAlertBanner} testID="steam-gate-alert">
          <Text style={styles.steamAlertTitle}>
            🔥 {t('Zdejmij pokrywkę garnka! Wypuść parę.')}
          </Text>
          <Text style={styles.steamAlertDesc}>
            {formatTextUnits(t('Zdejmij ostrożnie pokrywkę, pozwól parze ulecieć i obniż temperaturę pieca do 210°C dla karmelizacji skórki.'), unitSystem)}
          </Text>
          {/* Ostrzeżenie fazy lid_off (BEZ-OPA-001..003, RD-23-W1) [M1-audytor-generalny-086] */}
          {DUTCH_OVEN_PHASES.lid_off.safetyWarningPl ? (
            <Text style={styles.steamAlertDesc} accessibilityRole="alert" testID="steam-gate-safety-warning">
              {t(DUTCH_OVEN_PHASES.lid_off.safetyWarningPl)}
            </Text>
          ) : null}
          <Pressable
            testID="start-phase-2-btn"
            style={styles.steamAlertActionBtn}
            onPress={onStartPhase2AfterSteamAlert}
          >
            <Text style={styles.steamAlertActionBtnText}>
              ▶ {t('Rozpocznij Fazę 2')} ({t('{n} min', { n: 25 })} @ {formatTemperature(210, unitSystem)})
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dutchOvenContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phaseTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  phaseTabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phaseTabBtnActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  phaseTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  phaseTabBtnTextActive: {
    color: '#FFFFFF',
  },
  phaseInfoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phaseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  phaseTempBadge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  phaseTempBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  phaseDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  phaseTip: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  steamAlertBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 12,
  },
  steamAlertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 4,
  },
  steamAlertDesc: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 10,
  },
  steamAlertActionBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  steamAlertActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
