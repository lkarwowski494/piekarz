// ============================================================================
// Piekarz — plan wypieku: informacja „za późno” i akcja naprawy (design-spec §11c „107”, makieta
// docs/design/ekrany/inne.html stan `plan-za-pozno`) [M1-audytor-generalny-107; 04-studio-projektowe-024].
// Pole `powierzchnia` z obwódką `tusz` 2 pt, ikona zegara, rola statusu (nie alert: to nie zagrożenie, §3);
// pod nim przycisk drugi 48 pt „Ustaw tę godzinę”.
// ============================================================================

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { announce } from '../../lib/announce';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { IkonaStartu } from '../start/IkonaStartu';

export function PlanZaPozno({ tytul, tresc, onUstawNajwczesniej }: { tytul: string; tresc: string; onUstawNajwczesniej: () => void }) {
  // accessibilityLiveRegion działa tylko na Androidzie; na iOS ogłoszenie wprost [audyt-niezalezny G-8]
  const komunikat = `${tytul}. ${tresc}`;
  useEffect(() => {
    announce(komunikat);
  }, [komunikat]);
  return (
    <View style={styles.kontener}>
      <View style={styles.pole} accessible role="status" accessibilityLiveRegion="polite" accessibilityLabel={komunikat} testID="plan-too-late">
        <IkonaStartu nazwa="zegar" kolor={theme.colors.tusz} rozmiar={24} />
        <View style={styles.teksty}>
          <Text style={styles.tytul}>{tytul}</Text>
          <Text style={styles.tresc}>{tresc}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" testID="plan-use-earliest-btn" style={styles.drugi} onPress={onUstawNajwczesniej}>
        <Text style={styles.drugiTekst}>{t('Ustaw tę godzinę')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  kontener: { gap: odstepy.m, marginBottom: theme.spacing.md },
  pole: {
    flexDirection: 'row',
    gap: odstepy.m,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 2,
    borderColor: theme.colors.tusz,
    borderRadius: promienie.ostrzezenie,
    padding: odstepy.l,
  },
  teksty: { flex: 1, gap: odstepy.xs },
  tytul: { fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.tusz },
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  drugi: {
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz, textAlign: 'center' },
});
