// ============================================================================
// Piekarz — ArkuszKart i PasekArkusza: arkusz z paskiem u góry i treścią w kartach (README §1, §3; karty.css
// `.ark-nav`) [M3 p7, 04-002]
// Pasek arkusza: „Anuluj” / „Zamknij” z lewej, tytuł pośrodku (nagłówek VoiceOver), „Zapisz” / „Gotowe” z prawej;
// przy dużym tekście rząd się zawija (README §7a). Arkusz: okno `pageSheet` na tle `tlo`, pasek poza przewijaniem,
// treść przewijana z odstępem 12 między kartami. Komponent nie ma własnych tekstów; wszystkie dostaje od arkusza.
// ============================================================================

import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmDiscard, przyciskNaglowka } from '../DraftHeader';
import { t } from '../../lib/i18n';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { usePogrubionyTekst, wagaTytulu } from '../../ui/pogrubiony-tekst';

export interface PrzyciskArkusza {
  /** Tekst już przetłumaczony. */
  tekst: string;
  onPress: () => void;
  testID?: string;
  /** Etykieta VoiceOver, gdy inna niż tekst. */
  etykieta?: string;
  /** Przycisk chwilowo nieczynny (np. „Dodaj” w trakcie zapisu importu). */
  wylaczony?: boolean;
}

/** Miejsce po pustej stronie paska, żeby tytuł został pośrodku (makieta: 72 px). */
const PUSTE = 72;

export function PasekArkusza({ tytul, lewy, prawy, testID = 'pasek-arkusza' }: {
  tytul?: string;
  lewy?: PrzyciskArkusza;
  prawy?: PrzyciskArkusza;
  testID?: string;
}) {
  const waga = { fontWeight: wagaTytulu(usePogrubionyTekst()) };
  const przycisk = (p: PrzyciskArkusza | undefined, strona: 'lewy' | 'prawy') =>
    p ? (
      przyciskNaglowka({ testID: p.testID ?? `${testID}-${strona}`, title: p.tekst, label: p.etykieta, bold: strona === 'prawy', onPress: p.onPress, disabled: p.wylaczony })
    ) : (
      <View style={styles.puste} />
    );
  return (
    <View testID={testID} style={styles.pasek}>
      {przycisk(lewy, 'lewy')}
      {tytul ? (
        <Text testID={`${testID}-tytul`} accessibilityRole="header" style={[styles.tytul, waga]}>{tytul}</Text>
      ) : (
        <View style={styles.srodek} />
      )}
      {przycisk(prawy, 'prawy')}
    </View>
  );
}

export function ArkuszKart({ visible, onRequestClose, onDismiss, trescTestID, tytul, lewy, prawy, zmieniony, contentContainerStyle, children }: {
  visible: boolean;
  /** Przesunięcie arkusza w dół (systemowe zamknięcie). */
  onRequestClose: () => void;
  onDismiss?: () => void;
  /** testID widoku arkusza (w oknie, więc znika z drzewa po zamknięciu). */
  trescTestID?: string;
  tytul?: string;
  lewy?: PrzyciskArkusza;
  prawy?: PrzyciskArkusza;
  /**
   * Formularz zmieniony od otwarcia: „Anuluj” (lewy) i przesunięcie w dół pytają „Odrzucić zmiany?” (confirmDiscard,
   * 04-007). Bez tej wartości arkusz zamyka się od razu (arkusze informacyjne).
   */
  zmieniony?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const pytaj = (zamknij: () => void) => (zmieniony === undefined ? zamknij : () => confirmDiscard(zmieniony, t('Wpisane zmiany nie zostaną zapisane.'), zamknij));
  const lewyZPytaniem = lewy && { ...lewy, onPress: pytaj(lewy.onPress) };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={pytaj(onRequestClose)} onDismiss={onDismiss}>
      <SafeAreaView style={styles.ekran} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.ekran} testID={trescTestID}>
          <PasekArkusza tytul={tytul} lewy={lewyZPytaniem} prawy={prawy} />
          {/* Treść przewijana pod paskiem: przy 320 pt i AX5 pasek z „Zapisz” zostaje na ekranie [04-studio-projektowe-001] */}
          <ScrollView
            style={styles.przewijane}
            contentContainerStyle={[styles.tresc, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: theme.colors.tlo },
  pasek: {
    minHeight: 52,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: odstepy.s,
    paddingVertical: odstepy.xs,
    paddingHorizontal: odstepy.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
  },
  puste: { minWidth: PUSTE },
  srodek: { flex: 1 },
  tytul: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.naglowek.pt,
    color: theme.colors.tusz,
  },
  przewijane: { flex: 1 },
  tresc: { padding: odstepy.l, paddingBottom: odstepy.xxl, gap: odstepy.m },
});
