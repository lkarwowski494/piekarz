// ============================================================================
// Apps4Craft Studio — KitchenTestsGuideSection Component
// Interactive kitchen testing guides for Poke Test and Windowpane Test.
// 100% Offline-First.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';

export function KitchenTestsGuideSection() {
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
        <View style={styles.guideHeader}>
          <Text style={styles.guideTitle}>{t('Test palca')}</Text>
          <Text style={styles.guideToggle}>{showPokeTest ? '▲' : '▼'}</Text>
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
        <View style={styles.guideHeader}>
          <Text style={styles.guideTitle}>{t('Test okna glutenowego')}</Text>
          <Text style={styles.guideToggle}>{showWindowpaneTest ? '▲' : '▼'}</Text>
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
    fontFamily: theme.typography.krojTytulow,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 8,
    marginBottom: 8,
  },
  guideCard: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: 10,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  guideTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  guideToggle: {
    fontSize: 12,
    color: theme.colors.tusz3,
  },
  guideSummary: {
    fontSize: 12,
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
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 17,
  },
  guideBold: {
    fontWeight: '700',
    color: theme.colors.tusz,
  },
});
