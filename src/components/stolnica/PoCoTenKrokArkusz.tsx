// ============================================================================
// Piekarz — arkusz „Po co ten krok” (design-spec §5: arkusz z wyjaśnieniem roli 06; zamknięcie wraca do kroku
// bez zmian, F-44) [M1-audytor-generalny-100]. Zdania z src/core/po-co-ten-krok.ts, każde z ID twierdzenia.
// Na systemie kart: „Zamknij” i tytuł w pasku arkusza, nazwa kroku jako nagłówek karty ze zdaniami (README §1, §3)
// [M1-audytor-generalny-007; 04-studio-projektowe-003].
// ============================================================================

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { CLOSE_TEST_ID } from '../CloseButton';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import type { ZdaniePoCo } from '../../core/po-co-ten-krok';

export function PoCoTenKrokArkusz({ zdania, nazwaKroku, onClose }: { zdania: readonly ZdaniePoCo[] | null; nazwaKroku: string; onClose: () => void }) {
  return (
    <ArkuszKart visible={zdania !== null} onRequestClose={onClose} trescTestID="why-step-sheet" tytul={t('Po co ten krok')}
      lewy={{ tekst: t('Zamknij'), onPress: onClose, testID: CLOSE_TEST_ID }}>
      <Karta testID="karta-po-co" tytul={nazwaKroku} ikona={<IkonaKarty nazwa="info" />}>
        {(zdania ?? []).map((zd, i) => (
          <Text key={`${zd.id}-${i}`} style={styles.zdanie}>{t(zd.tekst)}</Text>
        ))}
      </Karta>
    </ArkuszKart>
  );
}

const styles = StyleSheet.create({
  zdanie: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
});
