// ============================================================================
// Piekarz — arkusz dnia i arkusz najbliższych z „+N” (BR-KAL-004; makieta roli 04 a2 `10-arkusz-dnia`) [M3 D4b]
// Systemowy arkusz (Modal pageSheet jak „Plan wypieku”): tytuł z datą, w dniu dzisiejszym zaległe na górze z tymi
// samymi „Zrobione”/„Pomiń” co linia „Następne”, potem zdarzenia dnia w kolejności godzin, każde z przejściem do
// swojego ekranu; dzień pusty: „Tego dnia nic nie zaplanowano.” bez pustej listy. „+N”: 7 kolejnych dni po dniach.
// ============================================================================

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { arkuszDnia, najblizszeZdarzenia } from '../../core/kalendarz-nastepne';
import type { ZdarzenieKalendarza } from '../../core/kalendarz-zdarzenia';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { dataSlownie } from '../../lib/kalendarz-pasek';
import { opisZdarzenia, tekstyNastepne, type OpcjeTekstu } from '../../lib/kalendarz-teksty';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { CloseButton } from '../CloseButton';
import { WierszZaleglego, type AkcjeZaleglego } from './LiniaNastepne';

/** Co pokazuje arkusz: jeden dzień (klucz „RRRR-MM-DD” i jego północ) albo najbliższe dni z „+N”. */
export type TrybArkusza = { dzien: string; ms: number } | { najblizsze: true };

export interface ArkuszDniaProps {
  tryb: TrybArkusza | null;
  zdarzenia: readonly ZdarzenieKalendarza[];
  o: OpcjeTekstu;
  akcje: AkcjeZaleglego;
  /** Przejście do źródła zdarzenia (Stolnica, karta zakwasu, Dziennik); arkusz zamyka ekran. */
  onPrzejdz: (z: ZdarzenieKalendarza) => void;
  onClose: () => void;
}

function Wiersz({ z, o, onPrzejdz }: { z: ZdarzenieKalendarza; o: OpcjeTekstu; onPrzejdz: (z: ZdarzenieKalendarza) => void }) {
  const tekst = t('{h} {co}', { h: formatTime(z.at), co: opisZdarzenia(z, o) });
  return (
    <Pressable testID={`arkusz-zdarzenie-${z.id}`} accessibilityRole="button" accessibilityLabel={tekst} style={styles.wiersz} onPress={() => onPrzejdz(z)}>
      <Text style={styles.godzina}>{formatTime(z.at)}</Text>
      <Text style={styles.opis}>{opisZdarzenia(z, o)}</Text>
    </Pressable>
  );
}

export function ArkuszDnia({ tryb, zdarzenia, o, akcje, onPrzejdz, onClose }: ArkuszDniaProps) {
  const zalegleTeksty = (z: readonly ZdarzenieKalendarza[]) =>
    tekstyNastepne({ zalegle: [...z], przyszle: [], wiecej: 0, wszystkiePrzyszle: [] }, o).zalegle;
  const zalegle = (lista: readonly ZdarzenieKalendarza[]) => {
    const teksty = zalegleTeksty(lista);
    return lista.map((z, i) => <WierszZaleglego key={z.id} z={z} tekst={teksty[i] ?? ''} o={o} naPasie={false} akcje={akcje} />);
  };

  let tytul = '';
  let tresc: React.ReactNode = null;
  if (tryb && 'dzien' in tryb) {
    const a = arkuszDnia(zdarzenia, tryb.dzien, o.now);
    tytul = dataSlownie(tryb.ms);
    tresc =
      a.zalegle.length === 0 && a.zdarzenia.length === 0 ? (
        <Text style={styles.pusto}>{t('Tego dnia nic nie zaplanowano.')}</Text>
      ) : (
        <>
          {zalegle(a.zalegle)}
          {a.zdarzenia.map((z) => <Wiersz key={z.id} z={z} o={o} onPrzejdz={onPrzejdz} />)}
        </>
      );
  } else if (tryb) {
    const n = najblizszeZdarzenia(zdarzenia, o.now);
    tytul = t('Najbliższe dni');
    tresc = (
      <>
        {zalegle(n.zalegle)}
        {n.dni.map((d) => (
          <View key={d.dzien} style={styles.grupa}>
            <Text style={styles.naglowekDnia} accessibilityRole="header">{dataSlownie(d.zdarzenia[0]?.at ?? o.now)}</Text>
            {d.zdarzenia.map((z) => <Wiersz key={z.id} z={z} o={o} onPrzejdz={onPrzejdz} />)}
          </View>
        ))}
      </>
    );
  }

  return (
    <Modal visible={tryb !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.arkusz} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.naglowek}>
          <Text style={styles.tytul} accessibilityRole="header" testID="arkusz-dnia-tytul">{tytul}</Text>
          <CloseButton akcja="zamknij" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.tresc} keyboardShouldPersistTaps="handled" testID="arkusz-dnia">
          {tresc}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  arkusz: { flex: 1, backgroundColor: theme.colors.tlo },
  naglowek: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: odstepy.l, paddingVertical: odstepy.s, gap: odstepy.s },
  tytul: { flex: 1, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  tresc: { padding: odstepy.l, paddingBottom: odstepy.xxxl, gap: odstepy.m },
  pusto: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz2 },
  grupa: { gap: odstepy.xs },
  naglowekDnia: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz2, marginTop: odstepy.s },
  wiersz: { flexDirection: 'row', flexWrap: 'wrap', columnGap: odstepy.m, minHeight: theme.cele.pozostale, alignItems: 'center', paddingVertical: odstepy.s, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.linia },
  godzina: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz2, fontVariant: ['tabular-nums'] },
  opis: { flexShrink: 1, flexBasis: 160, flexGrow: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
});
