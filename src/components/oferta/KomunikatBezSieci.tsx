// ============================================================================
// Piekarz — komunikat stanu „bez sieci” ekranu zakupu: ikona chmury przekreślonej + tekst w kolorze błędu, role=alert
// (design-spec §11e 127; makieta .blad i IKONY.chmura w docs/design/ekrany/wspolne.css / wspolne.js) [M1-audytor-generalny-127;
// BR-PRYW-001]. Ikona rośnie z tekstem (dopasowanie do Dynamic Type), poza drzewem dostępności.
// ============================================================================

import React from 'react';
import { PixelRatio, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { t } from '../../lib/i18n';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';

export function KomunikatBezSieci() {
  const tekst = t('Nie ma połączenia z App Store, więc zakup i przywrócenie zakupów teraz się nie udadzą. Reszta aplikacji działa jak dotąd. Sprawdź internet i spróbuj ponownie.');
  const rozmiar = Math.round(20 * Math.max(1, PixelRatio.getFontScale()));
  return (
    <View style={styles.blad} accessible accessibilityRole="alert" accessibilityLabel={tekst}>
      <Svg width={rozmiar} height={rozmiar} viewBox="0 0 24 24" accessible={false} style={styles.ikona}>
        <Path
          d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.5A3.3 3.3 0 0 0 7 18zM4 4l16 16"
          fill="none"
          stroke={theme.colors.blad}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text testID="offer-no-connection" style={styles.tekst}>
        {tekst}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  blad: { flexDirection: 'row', alignItems: 'flex-start', gap: odstepy.s, width: '100%' },
  ikona: { marginTop: 2 },
  tekst: { flex: 1, minWidth: 0, fontSize: typografia.style.tresc.pt, color: theme.colors.blad },
});
