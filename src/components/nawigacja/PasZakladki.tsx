// ============================================================================
// Piekarz — pas nagłówka zakładki w kolorze nocy do samej góry ekranu (D-105 wariant 3+1; D10 opcja A: pas na każdej
// zakładce, makieta roli 04 `d10-A-pas-390`) [M3 D4b → D10]. Wspólny dla „Dziś”, Receptur, karty receptury, karty
// zakwasu i Dziennika: rząd nawigacji (wstecz po lewej, akcje po prawej, cel 44 pt), tytuł (nagłówek VoiceOver),
// zdanie pod tytułem i sterowanie ekranu (dzieci). Pas zastępuje natywny duży tytuł: ekran ukrywa nagłówek stosu
// (a1: na iOS 26 tło przy dużym tytule ukrywa tytuł), pasek stanu jasny na pasie. Tylko tokeny pasa (pas, naPasie,
// naPasie2) i promienie.pas, promienie.chip.
// ============================================================================

import React, { useCallback } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { PrzyciskNaglowka } from './PrzyciskNaglowka';
import { IkonaStartu } from '../start/IkonaStartu';
import { usePogrubionyTekst, wagaTytulu } from '../../ui/pogrubiony-tekst';

/** Duży tekst jak na „Dziś”, w wierszu okresu i na ekranie Pro (fontScale ≥ 2). */
const DUZY_TEKST = 2;

export function PasZakladki<T extends string = string>({ gora, tytul, podtytul, wstecz, akcje, filtry, children, testID = 'pas-zakladki' }: {
  /** Wysokość paska stanu (safe area): pas sięga do samej góry, treść pod paskiem stanu. */
  gora: number;
  tytul: string;
  /** Zdanie pod tytułem (data na „Dziś”, „Ostatni wypiek: …” w Dzienniku). */
  podtytul?: string;
  /** Powrót w stosie zakładki (ekran z push): tekst = tytuł poprzedniego ekranu. */
  wstecz?: { tekst: string; onPress: () => void };
  /** Akcje nagłówka po prawej (PrzyciskNaglowka z `naPasie`). */
  akcje?: React.ReactNode;
  /** Filtry (chipy): na pasie, a przy dużym tekście pod pasem (D-120 b). */
  filtry?: FiltryPasa<T>;
  /** Sterowanie ekranu na pasie (spirala zakwasu, kalendarz). */
  children?: React.ReactNode;
  testID?: string;
}) {
  // Krój Sofia reaguje na „Pogrubiony tekst” jak tytuł kroku (158) [04-studio-projektowe-014]
  const waga = { fontWeight: wagaTytulu(usePogrubionyTekst()) };
  // Duży tekst: zdanie i filtry pod pasem, na pasie rząd nawigacji, tytuł i sterowanie (D-120 b, W-fix2); przy AX5
  // i 320 pt pas z filtrami i zdaniem był wyższy niż ekran (Dziennik ok. 830 pt na 568 pt)
  const duzy = useWindowDimensions().fontScale >= DUZY_TEKST;
  const pod = duzy && (podtytul || filtry) ? (
    <View style={styles.pod} testID="pas-pod">
      {podtytul ? <Text style={styles.podtytulPod}>{podtytul}</Text> : null}
      {filtry ? <FiltryNaPasie {...filtry} naPasie={false} /> : null}
    </View>
  ) : null;
  return (
    <>
    <View style={[styles.pas, { paddingTop: gora + odstepy.xs }]} testID={testID}>
      {(wstecz || akcje) && (
        <View style={styles.gora}>
          {wstecz ? (
            <PrzyciskNaglowka testID="pas-wstecz-btn" etykieta={wstecz.tekst} tekst={wstecz.tekst} naPasie onPress={wstecz.onPress}
              ikona={<IkonaStartu nazwa="wstecz" kolor={theme.colors.naPasie} rozmiar={22} />} />
          ) : <View />}
          <View style={styles.akcje}>{akcje}</View>
        </View>
      )}
      {/* Tytuł najwyżej 1,5× (51 pt) jak podpisy zakładek i przyciski pasa: przy AX5 i 320 pt bez łamania słów i bez
          pasa na cały ekran [04-studio-projektowe-003] */}
      <Text style={[styles.tytul, waga]} accessibilityRole="header" maxFontSizeMultiplier={1.5}>{tytul}</Text>
      {podtytul && !duzy ? <Text style={styles.podtytul}>{podtytul}</Text> : null}
      {children}
      {filtry && !duzy ? <FiltryNaPasie {...filtry} /> : null}
    </View>
    {pod}
    </>
  );
}

/** Przy przeciągnięciu w dół nad pasem dalej kolor pasa, nie tło ekranu (pierwsze dziecko treści ScrollView). */
export function NadPasem() {
  return <View style={styles.nadPasem} />;
}

/** Ekrany z pasem na wierzchu: przy przejściu między dwoma (push, zmiana zakładki) kolejność focus/blur nie gra roli. */
let ekranyZPasem = 0;

/** Pasek stanu jasny na ciemnym pasie, gdy ekran jest na wierzchu; gdy żaden ekran z pasem, domyślny (app/_layout.tsx). */
export function usePasekStanuJasny() {
  useFocusEffect(
    useCallback(() => {
      ekranyZPasem += 1;
      StatusBar.setBarStyle('light-content', true);
      return () => {
        ekranyZPasem = Math.max(0, ekranyZPasem - 1);
        if (ekranyZPasem === 0) StatusBar.setBarStyle('default', true);
      };
    }, [])
  );
}

export interface FiltrNaPasie<T extends string> {
  id: T;
  testID: string;
  /** Tekst już przetłumaczony. */
  etykieta: string;
}

export interface FiltryPasa<T extends string> {
  filtry: readonly FiltrNaPasie<T>[];
  wybrany: T;
  onWybierz: (id: T) => void;
  /** Etykieta grupy dla VoiceOver. */
  etykieta?: string;
}

/**
 * Filtry (chipy): zawijane, cel 44 pt; na pasie wybrany jasny (naPasie / pas, 9,83:1); pod pasem (duży tekst, D-120 b)
 * jak chipy na tle ekranu (obwódka, tusz; wybrany akcent / naAkcencie).
 */
export function FiltryNaPasie<T extends string>({ filtry, wybrany, onWybierz, etykieta, naPasie = true }: FiltryPasa<T> & { naPasie?: boolean }) {
  return (
    <View style={styles.filtry} accessibilityRole="radiogroup" accessibilityLabel={etykieta} testID="pas-filtry">
      {filtry.map((f) => {
        const wyb = f.id === wybrany;
        return (
          <Pressable key={f.id} testID={f.testID} accessibilityRole="button" accessibilityState={{ selected: wyb }}
            style={[styles.chip, wyb && styles.chipWybrany, !naPasie && styles.chipPod, !naPasie && wyb && styles.chipPodWybrany]}
            onPress={() => onWybierz(f.id)}>
            <Text style={[styles.chipTekst, wyb && styles.chipTekstWybrany, !naPasie && styles.chipTekstPod, !naPasie && wyb && styles.chipTekstPodWybrany]}>
              {f.etykieta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pas: {
    backgroundColor: theme.colors.pas,
    paddingHorizontal: odstepy.l,
    paddingBottom: odstepy.l,
    gap: odstepy.s,
    borderBottomLeftRadius: promienie.pas,
    borderBottomRightRadius: promienie.pas,
  },
  gora: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: -odstepy.s },
  akcje: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' },
  tytul: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytulDuzy.pt,
    fontWeight: '700',
    color: theme.colors.naPasie,
  },
  podtytul: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie2, marginTop: -odstepy.xs },
  nadPasem: { position: 'absolute', top: -1000, left: 0, right: 0, height: 1000, backgroundColor: theme.colors.pas },
  filtry: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s, marginTop: odstepy.xs },
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    borderRadius: promienie.chip,
    borderWidth: 1.5,
    borderColor: theme.colors.naPasie2,
  },
  chipWybrany: { backgroundColor: theme.colors.naPasie, borderColor: theme.colors.naPasie },
  chipTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie },
  chipTekstWybrany: { color: theme.colors.pas, fontWeight: '600' },
  pod: { paddingHorizontal: odstepy.l, paddingTop: odstepy.m, gap: odstepy.s },
  podtytulPod: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  chipPod: { borderColor: theme.colors.obwodka, backgroundColor: theme.colors.powierzchnia },
  chipPodWybrany: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  chipTekstPod: { color: theme.colors.tusz },
  chipTekstPodWybrany: { color: theme.colors.naAkcencie, fontWeight: '600' },
});
