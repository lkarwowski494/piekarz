// ============================================================================
// Piekarz — ustawienia planu pod listą kroków: godziny snu, czas w lodówce, „Kopiuj harmonogram”
// [M1-audytor-generalny-128; 04-studio-projektowe-501]. Poza pierwszym widokiem: pierwsza propozycja planu
// i „Przesuń do lodówki” w banerze nocy wystarczają bez nich (`plan-sen`).
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { SLEEP_PROFILES, etykietaProfiluSnu } from './TargetReadyCard';

export interface UstawieniaPlanuProps {
  sleepStartHour: number;
  sleepEndHour: number;
  onSleepHoursChange: (start: number, end: number) => void;
  coldRetardHours: number;
  onColdRetardHoursChange: (hours: number) => void;
  onCopySchedule: () => void;
}

export function UstawieniaPlanu({
  sleepStartHour,
  sleepEndHour,
  onSleepHoursChange,
  coldRetardHours,
  onColdRetardHoursChange,
  onCopySchedule,
}: UstawieniaPlanuProps) {
  return (
    <View style={styles.sekcja}>
      <Text style={styles.naglowek}>
        {t('Godziny snu:')} {etykietaProfiluSnu({ start: sleepStartHour, end: sleepEndHour })}
      </Text>
      <View style={styles.kolumna}>
        {SLEEP_PROFILES.map((p) => {
          const wybrany = sleepStartHour === p.start && sleepEndHour === p.end;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: wybrany }}
              key={p.id}
              testID={`sleep-profile-${p.id}`}
              style={[styles.chip, wybrany && styles.chipWybrany]}
              onPress={() => onSleepHoursChange(p.start, p.end)}
            >
              <Text style={[styles.chipTekst, wybrany && styles.chipTekstWybrany]}>
                {t(p.namePl)} ({etykietaProfiluSnu(p)})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.naglowek}>
        {t('Czas w lodówce:')} {coldRetardHours}h
      </Text>
      <View style={styles.rzad}>
        {[10, 12, 14, 16, 18].map((h) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: coldRetardHours === h }}
            key={h}
            onPress={() => onColdRetardHoursChange(h)}
            style={[styles.chip, coldRetardHours === h && styles.chipWybrany]}
          >
            <Text style={[styles.chipTekst, coldRetardHours === h && styles.chipTekstWybranyAkcent]}>{h}h</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.przypis}>{t('Elastyczny bufor regulujący porę formowania i pieczenia')}</Text>

      <Pressable accessibilityRole="button" testID="copy-schedule-btn" style={styles.kopiuj} onPress={onCopySchedule}>
        <Text style={styles.chipTekst}>{t('Kopiuj harmonogram')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sekcja: { paddingTop: odstepy.m, borderTopWidth: 1, borderTopColor: theme.colors.linia, marginTop: odstepy.m },
  naglowek: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz, marginBottom: odstepy.s },
  kolumna: { gap: odstepy.s, marginBottom: odstepy.l },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s, marginBottom: odstepy.xs },
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  chipWybrany: { borderColor: theme.colors.akcent },
  chipTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  chipTekstWybrany: { color: theme.colors.akcentTekst, fontWeight: '600' },
  chipTekstWybranyAkcent: { color: theme.colors.akcentTekst, fontWeight: '700' },
  przypis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2, marginBottom: odstepy.l },
  kopiuj: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
});
