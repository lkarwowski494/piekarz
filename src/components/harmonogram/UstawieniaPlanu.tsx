// ============================================================================
// Piekarz — ustawienia planu pod listą kroków: godziny snu (tylko odczyt, wybór w Ustawieniach, D-066 1a), czas
// w lodówce, „Kopiuj jako tekst” [M1-audytor-generalny-128, -130; 04-studio-projektowe-501]. Poza pierwszym
// widokiem: pierwsza propozycja planu i „Przesuń do lodówki” w banerze nocy wystarczają bez nich (`plan-sen`).
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { etykietaProfiluSnu } from './TargetReadyCard';
import type { OknoSnu } from '../../lib/plan-bez-nocy';
import { czasTrwania } from '../../lib/czas-trwania';

export interface UstawieniaPlanuProps {
  /** Okno snu z Ustawień; null = „Bez godzin snu”. */
  okno: OknoSnu | null;
  coldRetardHours: number;
  onColdRetardHoursChange: (hours: number) => void;
  onCopySchedule: () => void;
  /** Plan żytni: rozrost w formie w cieple (ZYT-ETA-005), bez przełącznika lodówki [audyt-niezalezny D-7] */
  bezLodowki?: boolean;
}

export function UstawieniaPlanu({ okno, coldRetardHours, onColdRetardHoursChange, onCopySchedule, bezLodowki = false }: UstawieniaPlanuProps) {
  return (
    <View style={styles.sekcja}>
      <Text style={styles.naglowek}>
        {t('Godziny snu:')} {okno ? etykietaProfiluSnu({ start: okno.startH, end: okno.koniecH }) : t('Bez godzin snu')}
      </Text>

      {bezLodowki ? null : (
        <>
          <Text style={styles.naglowek}>
            {t('Czas w lodówce:')} {czasTrwania(coldRetardHours * 60).tekst}
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
                <Text style={[styles.chipTekst, coldRetardHours === h && styles.chipTekstWybranyAkcent]}>{czasTrwania(h * 60).tekst}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.przypis}>{t('Elastyczny bufor regulujący porę formowania i pieczenia')}</Text>
        </>
      )}

      <Pressable accessibilityRole="button" testID="copy-schedule-btn" style={styles.kopiuj} onPress={onCopySchedule}>
        <Text style={styles.chipTekst}>{t('Kopiuj jako tekst')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sekcja: { paddingTop: odstepy.m, borderTopWidth: 1, borderTopColor: theme.colors.linia, marginTop: odstepy.m },
  naglowek: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz, marginBottom: odstepy.s },
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
