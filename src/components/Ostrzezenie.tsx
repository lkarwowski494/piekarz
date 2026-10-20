// ============================================================================
// Piekarz — Ostrzeżenie (komponent systemu, design-spec §3, §4): żółte pole ostrzTlo z tekstem ostrzTusz, ikona
// trójkąta (logika ISO 7010, nie kopia znaku) + tytuł + tekst, role=alert. Tylko ostrzeżenia bezpieczeństwa
// (RD-21…RD-23); makieta .ostrz w docs/design/ekrany/wspolne.css [M1-audytor-generalny-103].
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';
import { useMotyw } from '../ui/motyw';

export function Ostrzezenie({ tytul, teksty, testID = 'step-warning' }: { tytul: string; teksty: readonly string[]; testID?: string }) {
  const { kolory } = useMotyw();
  return (
    <View testID={testID} accessible accessibilityRole="alert" style={styles.pole}>
      <Svg width={30} height={30} viewBox="0 0 24 24" accessible={false}>
        <Path d="M12 3 2 21h20L12 3z" fill="none" stroke={kolory.ostrzTusz} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M12 10v5M12 17.5v.5" stroke={kolory.ostrzTusz} strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <View style={styles.tresc}>
        <Text testID={`${testID}-title`} style={styles.tytul}>{tytul}</Text>
        {teksty.map((tekst) => (
          <Text key={tekst} testID={`${testID}-text`} style={styles.tekst}>{tekst}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pole: {
    backgroundColor: theme.colors.ostrzTlo,
    borderRadius: promienie.ostrzezenie,
    padding: odstepy.m,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.s,
    marginBottom: odstepy.l,
  },
  tresc: { flexGrow: 1, flexShrink: 1, flexBasis: 160, minWidth: 0, gap: odstepy.xs },
  tytul: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.ostrzTusz },
  tekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.ostrzTusz },
});
