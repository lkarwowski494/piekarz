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
          accessibilityRole="button"
          accessibilityState={{ selected: dutchOvenPhase === 'lid_on' }}
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
            {t('Faza 1: Pod pokrywką (Para)')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: dutchOvenPhase === 'lid_off' }}
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
            {t('Faza 2: Bez pokrywki (Karmelizacja)')}
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
          {formatTextUnits(t(DUTCH_OVEN_PHASES[dutchOvenPhase].tipPl), unitSystem)}
        </Text>
      </View>

      {/* Steam Release Alert Gate (if lid_on finished) */}
      {dutchOvenPhase === 'lid_on' && isCompleted && (
        <View style={styles.steamAlertBanner} testID="steam-gate-alert">
          <Text style={styles.steamAlertTitle}>
            {t('Zdejmij pokrywkę garnka! Wypuść parę.')}
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
            accessibilityRole="button"
            testID="start-phase-2-btn"
            style={styles.steamAlertActionBtn}
            onPress={onStartPhase2AfterSteamAlert}
          >
            <Text style={styles.steamAlertActionBtnText}>
              {t('Rozpocznij Fazę 2')} ({t('{n} min', { n: 25 })} @ {formatTemperature(210, unitSystem)})
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dutchOvenContainer: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.linia,
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
    backgroundColor: theme.colors.powierzchnia,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  phaseTabBtnActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  phaseTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz2,
    textAlign: 'center',
  },
  phaseTabBtnTextActive: {
    color: theme.colors.naAkcencie,
  },
  phaseInfoCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.linia,
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
    color: theme.colors.tusz,
  },
  phaseTempBadge: {
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  phaseTempBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.naAkcencie,
  },
  phaseDesc: {
    fontSize: 13,
    color: theme.colors.tusz2,
    lineHeight: 18,
    marginBottom: 6,
  },
  phaseTip: {
    fontSize: 12,
    color: theme.colors.tusz3,
    fontStyle: 'italic',
  },
  steamAlertBanner: {
    backgroundColor: theme.colors.ostrzTlo, // Ostrzeżenie bezpieczeństwa: gorące naczynie i para (RD-23, mapa-rol.md §3)
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 12,
  },
  steamAlertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.ostrzTusz,
    marginBottom: 4,
  },
  steamAlertDesc: {
    fontSize: 12,
    color: theme.colors.ostrzTusz,
    lineHeight: 18,
    marginBottom: 10,
  },
  steamAlertActionBtn: {
    borderWidth: 1.5,
    borderColor: theme.colors.ostrzTusz,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  steamAlertActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ostrzTusz,
  },
});
