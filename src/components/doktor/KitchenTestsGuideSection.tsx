// ============================================================================
// Apps4Craft Studio — KitchenTestsGuideSection Component
// Interactive kitchen testing guides for Poke Test and Windowpane Test.
// 100% Offline-First.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';

import { typografia } from '../../ui/tokeny';
import { wygladKarty } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
export function KitchenTestsGuideSection() {
  // §7a / D-142 (M3 p5b): przy dużym tekście ikona i strzałka w rzędzie nad tytułem, tytuł na całą szerokość
  const duzy = useDuzyTekst();
  const ikona = <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden><IkonaKarty nazwa="miska" /></View>;
  const [showPokeTest, setShowPokeTest] = useState<boolean>(false);
  const [showWindowpaneTest, setShowWindowpaneTest] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>{t('Kuchenne testy piekarskie')}</Text>

      {/* Poke Test Card */}
      <Pressable
        accessibilityRole="button"
        style={styles.guideCard}
        onPress={() => setShowPokeTest((prev) => !prev)}
      >
        {/* Nagłówek karty z ikoną jak NaglowekKarty (20 pt, krój tytułów; M3 p5), tytuł jako tekst przycisku: tak go
            szuka doktor-screen (D-198); strzałka rozwinięcia po prawej */}
        <View style={duzy ? styles.guideHeaderStos : styles.guideHeader}>
          {duzy ? <View style={styles.guideWstep}>{ikona}<Text style={styles.guideToggle}>{showPokeTest ? '▲' : '▼'}</Text></View> : ikona}
          <Text style={[styles.guideTitle, !duzy && styles.guideTitleRzad]} accessibilityRole="header">{t('Test palca')}</Text>
          {duzy ? null : <Text style={styles.guideToggle}>{showPokeTest ? '▲' : '▼'}</Text>}
        </View>
        <Text style={styles.guideSummary}>
          {t('Jak sprawdzić, czy bochenek w koszyku jest gotowy do pieczenia')}
        </Text>
        {showPokeTest && (
          <View style={styles.guideDetails}>
            <Text style={styles.guideStep}>
              • <Text style={styles.guideBold}>{t('Szybko odskakuje:')}</Text>{' '}
              {t('Niedofermentowany. Pozostaw w cieple na kolejne 30–60 minut.')}
            </Text>
            <Text style={styles.guideStep}>
              • <Text style={styles.guideBold}>{t('Wraca powoli do połowy:')}</Text>{' '}
              {t('Optymalny moment. Rozgrzewaj piec i szykuj żyletkę.')}
            </Text>
            <Text style={styles.guideStep}>
              • <Text style={styles.guideBold}>{t('Zostaje wgłębienie i ciasto siada:')}</Text>{' '}
              {t('Przerośnięty. Piecz bezzwłocznie, nacinaj bardzo płytko.')}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Windowpane Test Card */}
      <Pressable
        accessibilityRole="button"
        style={styles.guideCard}
        onPress={() => setShowWindowpaneTest((prev) => !prev)}
      >
        {/* Nagłówek karty z ikoną jak NaglowekKarty (20 pt, krój tytułów; M3 p5), tytuł jako tekst przycisku: tak go
            szuka doktor-screen (D-198); strzałka rozwinięcia po prawej */}
        <View style={duzy ? styles.guideHeaderStos : styles.guideHeader}>
          {duzy ? <View style={styles.guideWstep}>{ikona}<Text style={styles.guideToggle}>{showWindowpaneTest ? '▲' : '▼'}</Text></View> : ikona}
          <Text style={[styles.guideTitle, !duzy && styles.guideTitleRzad]} accessibilityRole="header">{t('Test okna glutenowego')}</Text>
          {duzy ? null : <Text style={styles.guideToggle}>{showWindowpaneTest ? '▲' : '▼'}</Text>}
        </View>
        <Text style={styles.guideSummary}>
          {t('Ocena rozwoju siatki glutenowej po autolizie i składaniach')}
        </Text>
        {showWindowpaneTest && (
          <View style={styles.guideDetails}>
            <Text style={styles.guideStep}>
              • <Text style={styles.guideBold}>{t('Ciasto rwie się przy rozciąganiu:')}</Text>{' '}
              {t('Słaby gluten. Wykonaj dodatkową serię składań coil fold.')}
            </Text>
            <Text style={styles.guideStep}>
              • <Text style={styles.guideBold}>{t('Cienka, przezroczysta membrana:')}</Text>{' '}
              {t('Gluten perfekcyjnie rozwinięty. Gotowe do formowania wstępnego.')}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeading: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 8,
    marginBottom: 8,
  },
  guideCard: {
    ...wygladKarty,
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: 10,
  },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  guideHeaderStos: { flexDirection: 'column', alignItems: 'stretch', gap: theme.spacing.md },
  guideWstep: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guideTitleRzad: { flex: 1, flexShrink: 1 },
  guideTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytul2.pt - 2,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  guideToggle: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz3,
  },
  guideSummary: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    lineHeight: 16,
  },
  guideDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.linia,
    gap: 6,
  },
  guideStep: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    lineHeight: 17,
  },
  guideBold: {
    fontWeight: '700',
    color: theme.colors.tusz,
  },
});
