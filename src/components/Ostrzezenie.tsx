// ============================================================================
// Piekarz — komponent systemu „Ostrzeżenie” (design-spec §3, §4): żółte pole z ikoną, tytułem i tekstem,
// rola alert. Kolor `ostrzTlo` z czarnym tekstem `ostrzTusz` i trójkątem — tylko ostrzeżenia bezpieczeństwa
// i zasada ostrożności (RD-21…RD-23). Makieta: ekrany/zakwas.html (.ostrz, stan `plesn`). [M1-audytor-generalny-104]
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';

export function Ostrzezenie({ tytul, tekst, testID = 'ostrzezenie' }: { tytul: string; tekst?: string; testID?: string }) {
  return (
    <View testID={testID} accessible accessibilityRole="alert" accessibilityLabel={tekst ? `${tytul} ${tekst}` : tytul} style={styles.pole}>
      <Svg width={28} height={28} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Path d="M12 2.5 L23 21.5 H1 Z" fill="none" stroke={theme.colors.ostrzTusz} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M12 9 V14.5 M12 17.2 V17.8" stroke={theme.colors.ostrzTusz} strokeWidth={2.4} strokeLinecap="round" />
      </Svg>
      <View style={styles.tekst}>
        <Text style={styles.tytul}>{tytul}</Text>
        {tekst ? <Text style={styles.opis}>{tekst}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pole: {
    flexDirection: 'row',
    gap: odstepy.m,
    alignItems: 'flex-start',
    padding: odstepy.l,
    borderRadius: promienie.ostrzezenie,
    backgroundColor: theme.colors.ostrzTlo,
  },
  tekst: { flex: 1, minWidth: 0, gap: odstepy.xs },
  tytul: { fontSize: typografia.style.tresc.pt, fontWeight: '700', color: theme.colors.ostrzTusz },
  opis: { fontSize: typografia.style.tresc.pt, color: theme.colors.ostrzTusz },
});
