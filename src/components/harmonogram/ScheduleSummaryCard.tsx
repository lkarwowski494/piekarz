// ============================================================================
// Piekarz — opis planu pod Spiralą (`plan-sen`): „Start {dzień} o {godzina}” i „Całość trwa {czas}.”
// (design-spec §11c 116) [M1-audytor-generalny-116]. „Zacznij wypiek” jest w pasku kciuka (PasekStartu.tsx),
// „Kopiuj harmonogram” pod listą kroków (UstawieniaPlanu.tsx) [M1-audytor-generalny-128].
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
}

export function ScheduleSummaryCard({ start, czasMin, teraz }: ScheduleSummaryCardProps) {
  const czas = czasTrwania(czasMin);
  return (
    <View style={styles.opis}>
      {start ? (
        <Text style={styles.linia}>
          {t('Start {dzien} o {godzina}', { dzien: dzienWZdaniu(start, new Date(teraz)), godzina: formatTime(start) })}
        </Text>
      ) : null}
      <Text style={styles.linia} accessibilityLabel={t('Całość trwa {czas}.', { czas: czas.etykieta })}>
        {t('Całość trwa {czas}.', { czas: czas.tekst })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  opis: { alignItems: 'center', gap: 2, marginBottom: 16 },
  linia: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2, textAlign: 'center' },
});
