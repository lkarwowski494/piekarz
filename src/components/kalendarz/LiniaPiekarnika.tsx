// ============================================================================
// Piekarz — zdanie o piekarniku pod paskiem tygodnia na pasie „Dziś” (BR-KAL-016 „Jeden piekarnik”; makieta roli 04 a2
// `piekarnik-3-kalendarz`) [M3 D6]. Najbliższa kolizja od dziś: glif piekarnika (kształt), zdanie „{dzień}: piekarnik
// zajęty o {godzina}” (słowo) i tło ostrzeżenia pod glifem (kolor jako trzeci sygnał). Bez kolizji nic.
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ZdarzenieKalendarza } from '../../core/kalendarz-zdarzenia';
import { startOfLocalDay } from '../../core/dzien-lokalny';
import { t } from '../../lib/i18n';
import { appLocale, formatTime } from '../../lib/format';
import { dzienSlownie } from '../../lib/spirala-etykieta';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { GlifPiekarnika } from './GlifZdarzenia';

export function LiniaPiekarnika({ zdarzenia, now }: { zdarzenia: readonly ZdarzenieKalendarza[]; now: number }) {
  const od = startOfLocalDay(now);
  const z = [...zdarzenia].filter((x) => x.rodzaj === 'piekarnik-zajety' && x.at >= od).sort((a, b) => a.at - b.at)[0];
  if (!z) return null;
  const dzien = dzienSlownie(new Date(z.at), new Date(now));
  const tekst = t('{dzien}: piekarnik zajęty o {h}', { dzien: dzien.charAt(0).toLocaleUpperCase(appLocale()) + dzien.slice(1), h: formatTime(z.at) });
  return (
    <View style={styles.linia} testID="linia-piekarnika" accessible accessibilityLabel={tekst}>
      <GlifPiekarnika tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={18} />
      <Text style={styles.tekst}>{tekst}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linia: { flexDirection: 'row', alignItems: 'flex-start', gap: odstepy.s },
  tekst: { flex: 1, fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.naPasie },
});
