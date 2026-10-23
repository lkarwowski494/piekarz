// ============================================================================
// Piekarz — zakładka „Dziennik” (D-051 2a): historia wypieków ze statystykami, „Piecz ponownie”, usuwanie
// i wejście do Doktora Chleba. Dziennik, „Piecz ponownie” i Doktor w Basic; statystyki i porównanie w Pro
// (BR-RECP-004, D-113, D-116). [M1-audytor-generalny-101]
// Wejście z kalendarza z parametrem `wpis` wyróżnia ten wpis i przewija do niego (BR-KAL-013) [M3 D7].
// ============================================================================

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NadPasem, PasZakladki, usePasekStanuJasny } from '../../../src/components/nawigacja/PasZakladki';
import { FILTRY_SMAKU } from '../../../src/components/stolnica/BakeHistorySection';
import { ostatniWypiekMs, tekstOstatniegoWypieku } from '../../../src/lib/ostatni-wypiek';
import { t } from '../../../src/lib/i18n';
import { useAppAccess } from '../../../src/lib/app-access';
import { useBakeHistory } from '../../../src/hooks/useBakeHistory';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { BakeStatsCard } from '../../../src/components/stolnica/BakeStatsCard';
import { BakeHistorySection } from '../../../src/components/stolnica/BakeHistorySection';
import { PasekCofnij } from '../../../src/components/PasekCofnij';
import { theme } from '../../../src/ui/theme';
import { odstepy, promienie, typografia } from '../../../src/ui/tokeny';

export default function DziennikScreen() {
  const router = useRouter();
  const { blokada, requireActionAccess } = useAppAccess();
  const historia = useBakeHistory(requireActionAccess);
  const { loadHistory } = historia;
  const { wpis } = useLocalSearchParams<{ wpis?: string }>();
  const przewijane = React.useRef<ScrollView>(null);
  const gora = useSafeAreaInsets().top;
  usePasekStanuJasny();

  // Wpis z zakończonego wypieku pojawia się po powrocie na zakładkę
  useFocusEffect(
    React.useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  const ostatni = tekstOstatniegoWypieku(ostatniWypiekMs(historia.bakeHistory));
  return (
    <View style={styles.ekran}>
    <ScrollView
      ref={przewijane}
      style={styles.przewijane}
      contentContainerStyle={styles.tresc}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
    >
      <NadPasem />
      {/* Pas nocy (D10 opcja A): tytuł, „Ostatni wypiek: …” i filtry smaku (jak dawniej tylko przy wpisach) [M3 D10].
          Pas od krawędzi mimo marginesu treści: położenie wpisu z kalendarza liczone dalej od początku treści (D7) */}
      <View style={styles.pas}>
        <PasZakladki gora={gora} tytul={t('Dziennik')} podtytul={ostatni ?? undefined}
          filtry={historia.bakeHistory.length > 0
            ? { filtry: FILTRY_SMAKU.map((f) => ({ ...f, etykieta: t(f.etykieta) })), wybrany: historia.selectedTasteFilter, onWybierz: historia.setSelectedTasteFilter }
            : undefined} />
      </View>
      <BlokadaFunkcji {...blokada('historia')}>
        {historia.bakeHistory.length > 0 && (
          <BlokadaFunkcji {...blokada('porownanie')}>
            <BakeStatsCard stats={historia.bakeStats} />
          </BlokadaFunkcji>
        )}
        <BakeHistorySection
          bakeHistory={historia.bakeHistory}
          filteredHistory={historia.filteredHistory}
          onDeleteBakeLog={historia.handleDeleteBakeLog}
          onBakeAgain={historia.handleBakeAgain}
          onChooseRecipe={() => router.push('/receptury')}
          wyroznionyId={typeof wpis === 'string' ? wpis : undefined}
          onWyroznionyY={(y) => przewijane.current?.scrollTo({ y: Math.max(0, y - odstepy.l), animated: true })}
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
      {/* Pasek nad dolną krawędzią, widoczny bez przewijania do usuniętego wpisu (D-051 1a, 011) */}
      {historia.cofnijUsuniecie && (
        <PasekCofnij {...historia.cofnijUsuniecie} testID="dziennik-usun-cofnij" przywrocTestID="dziennik-usun-cofnij-przywroc" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: theme.colors.tlo },
  przewijane: { flex: 1 },
  tresc: { padding: theme.spacing.md, paddingBottom: 40, gap: odstepy.m },
  pas: { marginHorizontal: -theme.spacing.md, marginTop: -theme.spacing.md },
  wiersz: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: odstepy.l,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.powierzchnia,
  },
  wierszTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.akcentTekst },
});
