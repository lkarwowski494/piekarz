// ============================================================================
// Apps4Craft Studio — ScheduleSummaryCard Component
// Overview card for start of feeding, total baking journey, and transfer CTA.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { czasTrwania } from '../../lib/czas-trwania';
import { dzienWZdaniu } from '../../lib/plan-za-pozno';

export interface ScheduleSummaryCardProps {
  /** Początek pierwszego kroku planu; null = bez linii „Start …” (stan „za późno”, §11c 107). */
  start: Date | null;
  /** Długość planu w minutach. */
  czasMin: number;
  teraz: number;
  onStartBakeOnWorkbench: () => void;
  onCopySchedule: () => void;
  /** Powód, dla którego „Zacznij wypiek” jest nieaktywny (stan „za późno”); brak = aktywny. */
  powodBlokady?: string | null;
}

export function ScheduleSummaryCard({
  start,
  czasMin,
  teraz,
  onStartBakeOnWorkbench,
  onCopySchedule,
  powodBlokady = null,
}: ScheduleSummaryCardProps) {
  const zablokowany = !!powodBlokady;
  const czas = czasTrwania(czasMin);

  return (
    <View style={styles.summaryCard}>
      {/* Bez strzałki: „Start {dzień} o {godzina}” i „Całość trwa {czas}.”; godzina „gotowe” jest w polu godziny
          (design-spec §11c 116) [M1-audytor-generalny-116] */}
      <View style={styles.summaryRow}>
        {start ? (
          <Text style={styles.summaryLine}>
            {t('Start {dzien} o {godzina}', { dzien: dzienWZdaniu(start, new Date(teraz)), godzina: formatTime(start) })}
          </Text>
        ) : null}
        <Text style={styles.summaryLine} accessibilityLabel={t('Całość trwa {czas}.', { czas: czas.etykieta })}>
          {t('Całość trwa {czas}.', { czas: czas.tekst })}
        </Text>
      </View>

      {/* Transfer to Stolnica Action Button; w stanie „za późno” nieaktywny z powodem (§11c 107) [M1-audytor-generalny-107] */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: zablokowany }}
        accessibilityHint={powodBlokady ?? undefined}
        disabled={zablokowany}
        testID="plan-start-bake-btn"
        style={[styles.transferBtn, zablokowany && styles.transferBtnZablokowany]}
        onPress={() => {
          if (!zablokowany) onStartBakeOnWorkbench();
        }}
      >
        <Text style={[styles.transferBtnText, zablokowany && styles.transferBtnTextZablokowany]}>
          {t('Zacznij wypiek')}
        </Text>
      </Pressable>
      {powodBlokady ? <Text style={styles.powod}>{powodBlokady}</Text> : null}

      {/* Copy Schedule Action Button */}
      <Pressable
        accessibilityRole="button"
        testID="copy-schedule-btn"
        style={styles.copyScheduleBtn}
        onPress={onCopySchedule}
      >
        <Text style={styles.copyScheduleBtnText}>
          {t('Kopiuj harmonogram')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    alignItems: 'center',
    gap: 2,
    marginBottom: 16,
  },
  summaryLine: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
    textAlign: 'center',
  },
  transferBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  transferBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  transferBtnZablokowany: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  transferBtnTextZablokowany: {
    color: theme.colors.zablokowane,
  },
  powod: {
    fontSize: 13,
    color: theme.colors.tusz2,
    textAlign: 'center',
    marginBottom: 8,
  },
  copyScheduleBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  copyScheduleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
});
