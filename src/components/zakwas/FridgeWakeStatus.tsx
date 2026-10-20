// ============================================================================
// Piekarz — stan zakwasu z lodówki przed wypiekiem (BR-ZAKW-006, D-052; ścieżka „niegotowy w dniu ciasta”)
// [M1-audytor-generalny-104]. Wynik z czystej funkcji fridgeWakeOutcome; teksty dosłownie z
// docs/tresci/pl/zakwas-z-lodowki.md (rola 06). Pokazywany na karcie zakwasu wybranego do trwającego wypieku.
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FridgeWakeOutcome } from '../../core/fridge-wake';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { dzienSlownie } from '../../lib/spirala-etykieta';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export function FridgeWakeStatus({ wynik, now }: { wynik: FridgeWakeOutcome; now: number }) {
  if (wynik.kind === 'no_feeding' || wynik.kind === 'ready') return null;
  const kiedy = (at: number) => ({ dzien: dzienSlownie(new Date(at), new Date(now)), godzina: formatTime(at) });
  return (
    <View testID={`lodowka-${wynik.kind}`} style={styles.pole}>
      {wynik.kind === 'waiting' ? (
        <Text style={styles.tekst}>{t('Sprawdź, czy podwoi objętość do {godzina}.', { godzina: formatTime(wynik.checkUntil) })}</Text>
      ) : (
        <>
          {wynik.texts.map((z) => <Text key={z} style={styles.tekst}>{t(z)}</Text>)}
          <Text style={styles.wazne}>{t('Proponowane mieszanie ciasta: {dzien} o {godzina}.', kiedy(wynik.proposedMixAt))}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pole: { gap: odstepy.s, padding: odstepy.m, borderRadius: promienie.grupa, backgroundColor: theme.colors.tloGrupa },
  tekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  wazne: { fontSize: typografia.style.tresc.pt, fontWeight: '700', color: theme.colors.tusz },
});
