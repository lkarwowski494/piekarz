// ============================================================================
// Piekarz — arkusz „Po co ten krok” (design-spec §5: arkusz z wyjaśnieniem roli 06; zamknięcie wraca do kroku
// bez zmian, F-44) [M1-audytor-generalny-100]. Zdania z src/core/po-co-ten-krok.ts, każde z ID twierdzenia.
// ============================================================================

import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { CloseButton } from '../CloseButton';
import type { ZdaniePoCo } from '../../core/po-co-ten-krok';

export function PoCoTenKrokArkusz({ zdania, nazwaKroku, onClose }: { zdania: readonly ZdaniePoCo[] | null; nazwaKroku: string; onClose: () => void }) {
  return (
    <Modal visible={zdania !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.arkusz} edges={['top', 'bottom', 'left', 'right']}>
        <View testID="why-step-sheet">
          <View style={styles.naglowek}>
            <Text style={styles.tytul} accessibilityRole="header">{t('Po co ten krok')}</Text>
            <CloseButton akcja="zamknij" onPress={onClose} />
          </View>
          <ScrollView contentContainerStyle={styles.tresc}>
            <Text style={styles.krok}>{nazwaKroku}</Text>
            {(zdania ?? []).map((zd, i) => (
              <Text key={`${zd.id}-${i}`} style={styles.zdanie}>{t(zd.tekst)}</Text>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  arkusz: { flex: 1, backgroundColor: theme.colors.tlo },
  naglowek: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: odstepy.l,
    paddingVertical: odstepy.s,
    gap: odstepy.s,
  },
  tytul: { flex: 1, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  tresc: { padding: odstepy.l, gap: odstepy.m },
  krok: { get fontFamily() { return theme.typography.krojTytulow; }, fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.tusz },
  zdanie: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
});
