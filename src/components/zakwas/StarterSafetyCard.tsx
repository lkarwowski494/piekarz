// ============================================================================
// Apps4Craft Studio — StarterSafetyCard Component
// Biological safety checker for sourdough starter (Hooch, Kahm, Toxic Mold).
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';

export interface StarterSafetyCardProps {
  hasHooch: boolean;
  onToggleHooch: () => void;
  hasKahm: boolean;
  onToggleKahm: () => void;
  hasMold: boolean;
  onToggleMold: () => void;
  safetyResult: any;
  onReset: () => void;
}

export function StarterSafetyCard({
  hasHooch,
  onToggleHooch,
  hasKahm,
  onToggleKahm,
  hasMold,
  onToggleMold,
  safetyResult,
  onReset,
}: StarterSafetyCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('Kontrola biologiczna (Bezpieczeństwo)')}</Text>
      <Text style={styles.cardSubtitle}>
        Sprawdź nietypowe zjawiska na powierzchni zakwasu
      </Text>

      <View style={styles.checkRow}>
        <Pressable
          style={[styles.checkBtn, hasHooch && styles.checkBtnActive]}
          onPress={onToggleHooch}
        >
          <Text style={[styles.checkBtnText, hasHooch && styles.checkBtnTextActive]}>
            {t('Ciemny płyn / zapach alkoholu (Hooch)')}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.checkBtn, hasKahm && styles.checkBtnActive]}
          onPress={onToggleKahm}
        >
          <Text style={[styles.checkBtnText, hasKahm && styles.checkBtnTextActive]}>
            {t('Biały matowy kożuch (Kahm Yeast)')}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.checkBtn, hasMold && styles.checkBtnDangerActive]}
          onPress={onToggleMold}
        >
          <Text style={[styles.checkBtnText, hasMold && styles.checkBtnDangerTextActive]}>
            {t('Puszyste kolorowe plamy (Pleśń / Zgnilizna)')}
          </Text>
        </Pressable>
      </View>

      {/* Diagnostic Result */}
      <View
        style={[
          styles.safetyBox,
          safetyResult.status === 'toxic_mold_danger'
            ? styles.safetyDanger
            : safetyResult.status === 'kahm_yeast_safe'
            ? styles.safetyWarning
            : styles.safetyHealthy,
        ]}
      >
        <Text style={styles.safetyTitle}>{safetyResult.titlePl}</Text>
        <Text style={styles.safetyAction}>{safetyResult.actionPl}</Text>
      </View>

      <Pressable style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetBtnText}>{t('Resetuj profil zakwasu')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  checkRow: {
    gap: 8,
    marginBottom: 12,
  },
  checkBtn: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  checkBtnText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  checkBtnTextActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  checkBtnDangerActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  checkBtnDangerTextActive: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  safetyBox: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
  },
  // Ciemne tło karty i kolor stanu na ramce — tylko istniejące tokeny motywu; jasny tekst ≥ 4,5:1
  // (wcześniej pastelowe tła pod jasnym tekstem: 1,04:1) [M1-audytor-generalny-016]
  safetyHealthy: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.statusSuccess,
  },
  safetyWarning: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.statusWarning,
  },
  safetyDanger: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.statusDanger,
    borderWidth: 2,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  safetyAction: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  resetBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});
