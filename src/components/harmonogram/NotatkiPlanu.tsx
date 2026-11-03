// ============================================================================
// Piekarz — karta „Receptura” nad planem przy „Piecz ponownie” (README §1: treść tylko w kartach, M3 p4): notatka
// z poprzedniego wypieku (BR-RECP-003) [M1-audytor-generalny-146] i zmiana receptury bazowej (więcej drożdży) [M3 D3a].
// Bez żadnej z nich karty nie ma. Teksty i testID bez zmian; wydzielone z harmonogram.tsx (limit 20 KB).
// ============================================================================

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export function NotatkiPlanu({ notatka, bazowaZmieniona }: { notatka: string | null; bazowaZmieniona: boolean }) {
  if (!notatka && !bazowaZmieniona) return null;
  return (
    <Karta testID="karta-receptury-planu" tytul={t('Receptura')} ikona={<IkonaKarty nazwa="info" />}>
      {notatka ? (
        <Text style={styles.tekst} testID="plan-notatka-poprzednia">{t('Notatka z poprzedniego wypieku: {notatka}', { notatka })}</Text>
      ) : null}
      {bazowaZmieniona ? (
        <Text style={styles.tekst} testID="plan-bazowa-zmieniona">{t('Receptura bazowa zmieniła się od tamtego wypieku: ma teraz więcej drożdży.')}</Text>
      ) : null}
    </Karta>
  );
}

const styles = StyleSheet.create({
  tekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
});
