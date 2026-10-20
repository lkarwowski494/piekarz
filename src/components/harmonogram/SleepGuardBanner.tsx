// ============================================================================
// Apps4Craft Studio — SleepGuardBanner Component
// Alert or reassurance banner for nighttime fermentation & sleep collisions.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { SLEEP_COLLISION_TEMPLATE_PL, SleepCollision, sleepCollisionParams } from '../../scheduler/reverse-scheduler';

export interface SleepGuardBannerProps {
  hasSleepCollision: boolean;
  sleepCollisions: SleepCollision[];
  suggestedActionPl?: string;
  autoResolved: { adjustedColdRetardHours: number } | null;
  onApplyAutoResolution: (hours: number) => void;
}

export function SleepGuardBanner({
  hasSleepCollision,
  sleepCollisions,
  suggestedActionPl,
  autoResolved,
  onApplyAutoResolution,
}: SleepGuardBannerProps) {
  if (hasSleepCollision) {
    return (
      <View style={styles.sleepGuardAlert}>
        <Text style={styles.sleepGuardTitle}>{t('Uwaga: Kolizja ze snem!')}</Text>
        <Text style={styles.sleepGuardBody}>
          {sleepCollisions
            .map((c) => t(SLEEP_COLLISION_TEMPLATE_PL, { ...sleepCollisionParams(c), etap: t(c.stageNamePl) }))
            .join('; ')}
        </Text>
        {autoResolved && (
          <Pressable
            accessibilityRole="button"
            style={styles.autoFixBtn}
            onPress={() => onApplyAutoResolution(autoResolved.adjustedColdRetardHours)}
          >
            <Text style={styles.autoFixBtnText}>
              {t('Rozwiąż kolizję')} ({t('lodówka')}: {autoResolved.adjustedColdRetardHours}h)
            </Text>
          </Pressable>
        )}
        {suggestedActionPl && (
          <Text style={styles.sleepGuardAction}>{t(suggestedActionPl)}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.sleepGuardSafe}>
      <Text style={styles.sleepGuardSafeTitle}>
        ✓ {t('Ochrona snu aktywna')}
      </Text>
      <Text style={styles.sleepGuardSafeBody}>
        {t(
          'Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu (23:00 – 06:30).'
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sleepGuardAlert: {
    backgroundColor: theme.colors.powierzchnia, // kolizja ze snem: informacja, nie błąd (mapa-rol.md §3)
    borderWidth: 2,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sleepGuardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  sleepGuardBody: {
    fontSize: 13,
    color: theme.colors.tusz,
    lineHeight: 18,
    marginBottom: 10,
  },
  autoFixBtn: {
    backgroundColor: theme.colors.akcent,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    marginBottom: 8,
  },
  autoFixBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  sleepGuardAction: {
    fontSize: 12,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
  },
  sleepGuardSafe: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sleepGuardSafeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 2,
  },
  sleepGuardSafeBody: {
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 16,
  },
});
