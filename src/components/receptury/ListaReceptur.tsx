// ============================================================================
// Piekarz — lista receptur, ekran główny zakładki „Receptury” (design-spec §11c „106”, stan `lista-receptur`
// w docs/design/ekrany/kalkulator.html): filtr rodzaju jako zawijane chipy 44 pt bez licznika (od D10 na pasie), grupa
// „Moje receptury” nad „Receptury bazowe”, wiersz z nazwą, podpisem i szewronem; pusty filtr z „Pokaż wszystkie”.
// Usuwanie własnej receptury bez zmian (z pytaniem; zmiana to osobne znalezisko 04-studio-projektowe-038).
// M3 p3 (D-141 O2b, karty/README.md §4, makieta karty/receptury.html #lista, #pusty-filtr): nagłówek grupy z ikoną
// nad kartami, każda receptura we własnej karcie z ikoną rodzaju, pusty filtr w karcie. [M3 p3, D-184]
// [M1-audytor-generalny-106; 04-studio-projektowe-022]
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatNumber } from '../../lib/format';
import type { StoredRecipe } from '../../data/db';
import type { RecipePreset } from '../../recipes/presets';
import { opisReceptury } from './nazwy-receptur';
import { s } from './style-receptur';
import { Karta, NaglowekKarty, wygladKarty } from '../../ui/karty/Karta';
import { IkonaKarty, type NazwaIkonyKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
import { odstepy, typografia } from '../../ui/tokeny';
/** Filtr rodzaju na liście receptur bazowych. */
export type CategoryFilterType = 'all' | 'sourdough' | 'rye' | 'yeast' | 'pizza_sweet';

/** Filtry rodzaju (etykieta = klucz PL do t()); na pasie listy receptur (D10). */
export const FILTRY_RECEPTUR: readonly { id: CategoryFilterType; testID: string; etykieta: string }[] = [
  { id: 'all', testID: 'category-filter-all', etykieta: 'Wszystkie' },
  { id: 'sourdough', testID: 'category-filter-sourdough', etykieta: 'Na zakwasie' },
  { id: 'rye', testID: 'category-filter-rye', etykieta: 'Żytnie' },
  { id: 'yeast', testID: 'category-filter-yeast', etykieta: 'Drożdżowe' },
  { id: 'pizza_sweet', testID: 'category-filter-pizza-sweet', etykieta: 'Pizza i słodkie' },
];

export interface ListaRecepturProps {
  /** „Pokaż wszystkie” przy pustym filtrze (filtr rodzaju jest na pasie ekranu). */
  onFiltr: (f: CategoryFilterType) => void;
  bazowe: RecipePreset[];
  moje: StoredRecipe[];
  onOtworzBazowa: (r: RecipePreset) => void;
  onOtworzMoja: (r: StoredRecipe) => void;
  onUsunMoja: (r: StoredRecipe) => void;
}

/** Ikona rodzaju receptury w karcie (kształty z karty.js; słodkie = ciasto drożdżowe w misce, D-184). */
const IKONA_RODZAJU: Record<RecipePreset['category'], NazwaIkonyKarty> = {
  sourdough: 'bochenek',
  rye: 'sloik',
  yeast: 'miska',
  pizza: 'pizza',
  sweet: 'miska',
};

function Wiersz({ id, nazwa, opis, ikona, onPress }: { id: string; nazwa: string; opis: string; ikona: NazwaIkonyKarty; onPress: () => void }) {
  // Przy dużym tekście opis na całą szerokość, ikona i szewron nad nim (flexBasis od fontScale, README §7a) [M3 p3]
  const duzy = useDuzyTekst();
  return (
    <Pressable
      accessibilityRole="button"
      testID={`recipe-row-${id}`}
      style={({ pressed }) => [wygladKarty, styles.wiersz, duzy && styles.wierszDuzy, pressed && styles.nacisniety]}
      onPress={onPress}
    >
      <View style={styles.ikona} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <IkonaKarty nazwa={ikona} rozmiar={28} />
      </View>
      <View style={[s.roz, duzy && styles.opisDuzy]}>
        <Text style={s.etykieta}>{nazwa}</Text>
        <Text style={s.przypis}>{opis}</Text>
      </View>
      <Text style={s.szewron} accessible={false}>
        ›
      </Text>
    </Pressable>
  );
}

export function ListaReceptur({ onFiltr, bazowe, moje, onOtworzBazowa, onOtworzMoja, onUsunMoja }: ListaRecepturProps) {
  return (
    <View testID="recipe-list">
      {/* Filtr rodzaju na pasie ekranu (D10 opcja A): FILTRY_RECEPTUR w app/(tabs)/receptury/index.tsx [M3 D10] */}
      {moje.length > 0 && (
        <>
          <NaglowekKarty testID="grupa-moje" tytul={t('Moje receptury')} ikona={<IkonaKarty nazwa="gwiazda" />} style={styles.grupa} />
          <View style={styles.karty}>
            {moje.map((r) => (
              <View key={r.id} style={styles.mojaRzad}>
                <View style={styles.mojaWiersz}>
                  <Wiersz
                    id={r.id}
                    nazwa={r.name}
                    opis={t('moja, woda {n}%', { n: formatNumber(r.formula.waterPercentage) })}
                    ikona="bochenek"
                    onPress={() => onOtworzMoja(r)}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Usuń recepturę: {nazwa}', { nazwa: r.name })}
                  style={styles.usun}
                  onPress={() => onUsunMoja(r)}
                >
                  <Text style={styles.usunTekst}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {bazowe.length === 0 ? (
        <Karta testID="karta-pusty-filtr" tytul={t('Receptury bazowe')} ikona={<IkonaKarty nazwa="receptury" />}>
          <Text style={s.etykieta}>{t('Brak receptur tego rodzaju.')}</Text>
          <Pressable accessibilityRole="button" testID="show-all-recipes-btn" style={styles.pokazWszystkie} onPress={() => onFiltr('all')}>
            <Text style={s.akcja}>{t('Pokaż wszystkie')}</Text>
          </Pressable>
        </Karta>
      ) : (
        <>
          <NaglowekKarty testID="grupa-bazowe" tytul={t('Receptury bazowe')} ikona={<IkonaKarty nazwa="receptury" />} style={styles.grupa} />
          <View style={styles.karty}>
            {bazowe.map((r) => (
              <Wiersz key={r.id} id={r.id} nazwa={t(r.namePl)} opis={opisReceptury(r)} ikona={IKONA_RODZAJU[r.category]} onPress={() => onOtworzBazowa(r)} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Nagłówek grupy nad kartami (O2b): ten sam nagłówek co w karcie, wcięty jak treść karty
  grupa: { paddingHorizontal: odstepy.xs, marginTop: odstepy.m },
  karty: { gap: odstepy.m },
  wiersz: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: odstepy.m,
    minHeight: theme.cele.glownyPrzeplyw,
    paddingHorizontal: odstepy.l,
    paddingVertical: odstepy.m,
  },
  wierszDuzy: { paddingHorizontal: odstepy.m, justifyContent: 'space-between' },
  opisDuzy: { flexBasis: '100%' },
  nacisniety: { backgroundColor: theme.colors.tloGrupa },
  ikona: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  mojaRzad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: odstepy.xs,
  },
  mojaWiersz: {
    flex: 1,
  },
  usun: {
    minWidth: theme.cele.pozostale,
    minHeight: theme.cele.pozostale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usunTekst: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.blad,
  },
  pokazWszystkie: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
