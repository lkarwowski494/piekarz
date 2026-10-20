// ============================================================================
// Apps4Craft Studio — DiagnosisResultCard Component
// Bread defect diagnosis results card with biological causes and actions.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatTextUnits, UnitSystem } from '../../lib/unit-converter';
import type { DiagnosticResult } from '../../doctor/diagnostics';

export interface DiagnosisResultCardProps {
  diagnosis: DiagnosticResult | null;
  unitSystem: UnitSystem;
  onNavigateHarmonogram: () => void;
  onNavigateCalculator: () => void;
  onNavigateStolnica: () => void;
  onCopyDiagnosis: () => void;
}

export function DiagnosisResultCard({
  diagnosis,
  unitSystem,
  onNavigateHarmonogram,
  onNavigateCalculator,
  onNavigateStolnica,
  onCopyDiagnosis,
}: DiagnosisResultCardProps) {
  if (!diagnosis) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>{t('Wybierz objawy bochenka')}</Text>
        <Text style={styles.emptyText}>
          {t(
            'Zaznacz poniżej cechy miękiszu, skórki lub smaku, które Cię niepokoją, aby Doktor Chleba zidentyfikował błąd technologiczny i podał rozwiązanie.'
          )}
        </Text>
      </View>
    );
  }

  const getSeverityBadge = (severity: 'mild' | 'moderate' | 'critical') => {
    switch (severity) {
      case 'critical':
        return {
          label: t('Krytyczny błąd struktury'),
          badgeStyle: styles.badgeCritical,
          textStyle: styles.badgeTextCritical,
        };
      case 'moderate':
        return {
          label: t('Umiarkowana wada'),
          badgeStyle: styles.badgeModerate,
          textStyle: styles.badgeTextModerate,
        };
      case 'mild':
      default:
        return {
          label: t('Drobna niedoskonałość'),
          badgeStyle: styles.badgeMild,
          textStyle: styles.badgeTextMild,
        };
    }
  };

  const severityBadge = getSeverityBadge(diagnosis.severity);

  return (
    <View
      style={[
        styles.diagnosisCard,
        diagnosis.severity === 'critical'
          ? styles.severityCritical
          : diagnosis.severity === 'moderate'
          ? styles.severityModerate
          : styles.severityMild,
      ]}
    >
      <View style={styles.severityRow}>
        <View style={[styles.severityBadge, severityBadge.badgeStyle]}>
          <Text style={[styles.severityBadgeText, severityBadge.textStyle]}>
            {severityBadge.label}
          </Text>
        </View>
        <Text style={styles.defectCodeTag}>{diagnosis.defectCode}</Text>
      </View>

      <View style={styles.diagnosisHeader}>
        <Text style={styles.diagnosisTitle}>{t(diagnosis.titlePl)}</Text>
        <Text style={styles.diagnosisSubtitle}>{t(diagnosis.subtitlePl)}</Text>
      </View>

      <View style={styles.causeBox}>
        <Text style={styles.causeLabel}>{t('Przyczyna biologiczno-chemiczna:')}</Text>
        <Text style={styles.causeText}>
          {formatTextUnits(t(diagnosis.biologicalCausePl), unitSystem)}
        </Text>
      </View>

      <Text style={styles.checklistTitle}>{t('Co zrobić przy następnym wypieku:')}</Text>
      {diagnosis.actionChecklistPl.map((action: string, idx: number) => (
        <View key={idx} style={styles.checklistItem}>
          <Text style={styles.bulletCheck}>✓</Text>
          <Text style={styles.checklistText}>{formatTextUnits(t(action), unitSystem)}</Text>
        </View>
      ))}

      {/* Smart Navigation Link */}
      {(diagnosis.defectCode === 'UNDER_PROOFED' || diagnosis.defectCode === 'OVER_PROOFED') && (
        <Pressable
          accessibilityRole="button"
          style={styles.navActionBtn}
          onPress={onNavigateHarmonogram}
        >
          <Text style={styles.navActionBtnText}>
            {t('Przejdź do Harmonogramu')}
          </Text>
        </Pressable>
      )}

      {diagnosis.defectCode === 'DENSE_CRUMB' && (
        <Pressable
          accessibilityRole="button"
          style={styles.navActionBtn}
          onPress={onNavigateCalculator}
        >
          <Text style={styles.navActionBtnText}>
            {t('Dostosuj hydratację w Kalkulatorze')}
          </Text>
        </Pressable>
      )}

      {diagnosis.defectCode === 'GUMMY_CRUMB' && (
        <Pressable
          accessibilityRole="button"
          style={styles.navActionBtn}
          onPress={onNavigateStolnica}
        >
          <Text style={styles.navActionBtnText}>
            {t('Przejdź do Stolnicy')}
          </Text>
        </Pressable>
      )}

      {/* Copy Diagnosis to Clipboard Button */}
      <Pressable
        accessibilityRole="button"
        testID="copy-diagnosis-btn"
        style={styles.copyDiagnosisBtn}
        onPress={onCopyDiagnosis}
      >
        <Text style={styles.copyDiagnosisBtnText}>
          {t('Kopiuj diagnozę')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  diagnosisCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    backgroundColor: theme.colors.powierzchnia,
  },
  severityCritical: {
    borderColor: theme.colors.blad,
  },
  severityModerate: {
    borderColor: theme.colors.obwodka,
  },
  severityMild: {
    borderColor: theme.colors.linia,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeCritical: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeModerate: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeMild: {
    backgroundColor: theme.colors.tloGrupa,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextCritical: {
    color: theme.colors.blad,
  },
  badgeTextModerate: {
    color: theme.colors.tusz,
  },
  badgeTextMild: {
    color: theme.colors.tusz,
  },
  defectCodeTag: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: theme.colors.tusz3,
  },
  diagnosisHeader: {
    marginBottom: 12,
  },
  diagnosisTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.tusz,
  },
  diagnosisSubtitle: {
    fontSize: 14,
    color: theme.colors.tusz3,
    marginTop: 2,
  },
  causeBox: {
    backgroundColor: theme.colors.powierzchnia,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.akcent,
  },
  causeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
    marginBottom: 4,
  },
  causeText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    lineHeight: 18,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletCheck: {
    color: theme.colors.akcentTekst,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    marginTop: 1,
  },
  checklistText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    lineHeight: 18,
    flex: 1,
  },
  navActionBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    alignItems: 'center',
  },
  navActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  copyDiagnosisBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  copyDiagnosisBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  emptyCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.tusz3,
    textAlign: 'center',
    lineHeight: 18,
  },
});
