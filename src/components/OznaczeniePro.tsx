// ============================================================================
// Piekarz — oznaczenie „Pro” przy funkcji Pro bez dostępu (kontrakt docs/monetyzacja.md „Reguły dostępu”; przegląd P-a
// P2-4) [M3 P-b, D-117]. Słowo „Pro” w obwódce, nie sam kolor ani kłódka; stoi wewnątrz przycisku, którego etykieta
// VoiceOver mówi „{funkcja}, Pro” (etykietaPro). Kolor z tokenów (domyślnie akcentTekst; na pasie „Dziś” naPasie).
// Element spoza design-spec: do akceptacji roli 04 (najbliższe istniejące tokeny: promienie.znacznik, objaśnienie).
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
import { t } from '../lib/i18n';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';

export function OznaczeniePro({ kolor = theme.colors.akcentTekst }: { kolor?: ColorValue }) {
  return (
    <View testID="oznaczenie-pro" style={[styles.znak, { borderColor: kolor }]}>
      <Text style={[styles.tekst, { color: kolor }]}>{t('Pro')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  znak: { borderWidth: 1, borderRadius: promienie.znacznik, paddingHorizontal: odstepy.xs + 2, alignSelf: 'center' },
  tekst: { fontSize: typografia.style.przypis.pt, fontWeight: '600' },
});
