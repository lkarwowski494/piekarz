// ============================================================================
// Piekarz — zakładka „Dziennik” (D-051 2a): historia wypieków ze statystykami, „Piecz ponownie”, usuwanie
// i wejście do Doktora Chleba. Przegląd historii działa także bez uprawnienia (BEZ_UPRAWNIENIA: historia,
// F-67 „tylko historia”); Doktor jest płatny i blokuje się na swoim ekranie. [M1-audytor-generalny-101]
// ============================================================================

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { useAppAccess } from '../../../src/lib/app-access';
import { useBakeHistory } from '../../../src/hooks/useBakeHistory';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { BakeStatsCard } from '../../../src/components/stolnica/BakeStatsCard';
import { BakeHistorySection } from '../../../src/components/stolnica/BakeHistorySection';
import { theme } from '../../../src/ui/theme';
import { odstepy, promienie, typografia } from '../../../src/ui/tokeny';

export default function DziennikScreen() {
  const router = useRouter();
  const { blokada, requireActionAccess } = useAppAccess();
  const historia = useBakeHistory(requireActionAccess);
  const { loadHistory } = historia;

  // Wpis z zakończonego wypieku pojawia się po powrocie na zakładkę
  useFocusEffect(
    React.useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  return (
    <ScrollView
      style={styles.ekran}
      contentContainerStyle={styles.tresc}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <BlokadaFunkcji {...blokada('historia')}>
        {historia.bakeHistory.length > 0 && <BakeStatsCard stats={historia.bakeStats} />}
        <BakeHistorySection
          bakeHistory={historia.bakeHistory}
          selectedTasteFilter={historia.selectedTasteFilter}
          onSelectTasteFilter={historia.setSelectedTasteFilter}
          filteredHistory={historia.filteredHistory}
          onDeleteBakeLog={historia.handleDeleteBakeLog}
          onBakeAgain={historia.handleBakeAgain}
        />
      </BlokadaFunkcji>
      <Pressable
        testID="dziennik-doktor-btn"
        accessibilityRole="button"
        accessibilityLabel={t('Doktor Chleba')}
        style={styles.wiersz}
        onPress={() => router.push('/doktor')}
      >
        <Text style={styles.wierszTekst}>{t('Doktor Chleba')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: theme.colors.tlo },
  tresc: { padding: theme.spacing.md, paddingBottom: 40, gap: odstepy.m },
  wiersz: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: odstepy.l,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.powierzchnia,
  },
  wierszTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.akcentTekst },
});
