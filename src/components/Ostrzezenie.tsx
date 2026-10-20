// ============================================================================
// Piekarz — Ostrzeżenie (komponent systemu, design-spec §3, §4): żółte pole ostrzTlo z tekstem ostrzTusz, ikona
// trójkąta (logika ISO 7010, nie kopia znaku) + tytuł + tekst(y), role=alert, etykieta VoiceOver z tytułu i tekstów.
// Tylko ostrzeżenia bezpieczeństwa i zasada ostrożności (RD-21…RD-23); makiety .ostrz w docs/design/ekrany/wspolne.css
// i ekrany/zakwas.html (stan `plesn`). Jeden tekst (`tekst`) albo lista (`teksty`). [M1-audytor-generalny-103, -104]
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';
import { useMotyw } from '../ui/motyw';

/** Etykieta VoiceOver „{tytuł}. {zdania}” (§11c „109”); tytuł zakończony znakiem zdania bez dodatkowej kropki. */
function etykietaOstrzezenia(tytul: string, zdania: readonly string[]): string {
  if (zdania.length === 0) return tytul;
  return `${tytul}${/[.!?:]$/.test(tytul) ? '' : '.'} ${zdania.join(' ')}`;
}

export function Ostrzezenie({
  tytul,
  tekst,
  teksty,
  testID = 'step-warning',
}: {
  tytul: string;
  tekst?: string;
  teksty?: readonly string[];
  testID?: string;
}) {
  const { kolory } = useMotyw();
  const wszystkie = [...(tekst ? [tekst] : []), ...(teksty ?? [])];
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={etykietaOstrzezenia(tytul, wszystkie)}
      style={styles.pole}
    >
      <Svg width={30} height={30} viewBox="0 0 24 24" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Path d="M12 3 2 21h20L12 3z" fill="none" stroke={kolory.ostrzTusz} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M12 10v5M12 17.5v.5" stroke={kolory.ostrzTusz} strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <View style={styles.tresc}>
        <Text testID={`${testID}-title`} style={styles.tytul}>{tytul}</Text>
        {wszystkie.map((t) => (
          <Text key={t} testID={`${testID}-text`} style={styles.tekst}>{t}</Text>
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
