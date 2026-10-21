// ============================================================================
// Piekarz — lista receptur, ekran główny zakładki „Receptury” (design-spec §11c „106”, stan `lista-receptur`
// w docs/design/ekrany/kalkulator.html): filtr rodzaju jako zawijane chipy 44 pt bez licznika, grupa
// „Moje receptury” nad „Receptury bazowe”, wiersz z nazwą, podpisem i szewronem; pusty filtr z „Pokaż wszystkie”.
// Usuwanie własnej receptury bez zmian (z pytaniem; zmiana to osobne znalezisko 04-studio-projektowe-038).
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

import { typografia } from '../../ui/tokeny';
/** Filtr rodzaju na liście receptur bazowych (chipy niżej). */
export type CategoryFilterType = 'all' | 'sourdough' | 'rye' | 'yeast' | 'pizza_sweet';

const FILTRY: { id: CategoryFilterType; testID: string; etykieta: string }[] = [
  { id: 'all', testID: 'category-filter-all', etykieta: 'Wszystkie' },
  { id: 'sourdough', testID: 'category-filter-sourdough', etykieta: 'Na zakwasie' },
  { id: 'rye', testID: 'category-filter-rye', etykieta: 'Żytnie' },
  { id: 'yeast', testID: 'category-filter-yeast', etykieta: 'Drożdżowe' },
  { id: 'pizza_sweet', testID: 'category-filter-pizza-sweet', etykieta: 'Pizza i słodkie' },
];

export interface ListaRecepturProps {
  filtr: CategoryFilterType;
  onFiltr: (f: CategoryFilterType) => void;
  bazowe: RecipePreset[];
  moje: StoredRecipe[];
  onOtworzBazowa: (r: RecipePreset) => void;
  onOtworzMoja: (r: StoredRecipe) => void;
  onUsunMoja: (r: StoredRecipe) => void;
}

function Wiersz({ id, nazwa, opis, ostatni, onPress }: { id: string; nazwa: string; opis: string; ostatni: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      testID={`recipe-row-${id}`}
      style={[s.kom, styles.wiersz, ostatni && s.komOstatnia]}
      onPress={onPress}
    >
      <View style={s.roz}>
        <Text style={s.etykieta}>{nazwa}</Text>
        <Text style={s.przypis}>{opis}</Text>
      </View>
      <Text style={s.szewron} accessible={false}>
        ›
      </Text>
    </Pressable>
  );
}

export function ListaReceptur({ filtr, onFiltr, bazowe, moje, onOtworzBazowa, onOtworzMoja, onUsunMoja }: ListaRecepturProps) {
  return (
    <View testID="recipe-list">
      <View style={s.chipy} accessibilityRole="radiogroup" accessibilityLabel={t('Rodzaj receptur')}>
        {FILTRY.map((f) => {
          const wyb = filtr === f.id;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              accessibilityState={{ selected: wyb }}
              testID={f.testID}
              style={[s.chip, styles.chipCel, wyb && s.chipWybrany]}
              onPress={() => onFiltr(f.id)}
            >
              <Text style={[s.chipTekst, wyb && s.chipTekstWybrany]}>{t(f.etykieta)}</Text>
            </Pressable>
          );
        })}
      </View>

      {moje.length > 0 && (
        <>
          <Text style={s.naglowekGrupy} accessibilityRole="header">
            {t('Moje receptury')}
          </Text>
          <View style={s.grupa}>
            {moje.map((r, i) => (
              <View key={r.id} style={styles.mojaRzad}>
                <View style={styles.mojaWiersz}>
                  <Wiersz
                    id={r.id}
                    nazwa={r.name}
                    opis={t('moja, woda {n}%', { n: formatNumber(r.formula.waterPercentage) })}
                    ostatni={i === moje.length - 1}
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

      <Text style={s.naglowekGrupy} accessibilityRole="header">
        {t('Receptury bazowe')}
      </Text>
      {bazowe.length === 0 ? (
        <View style={[s.grupa, styles.pusty]}>
          <Text style={s.etykieta}>{t('Brak receptur tego rodzaju.')}</Text>
          <Pressable accessibilityRole="button" testID="show-all-recipes-btn" style={styles.pokazWszystkie} onPress={() => onFiltr('all')}>
            <Text style={s.akcja}>{t('Pokaż wszystkie')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.grupa}>
          {bazowe.map((r, i) => (
            <Wiersz key={r.id} id={r.id} nazwa={t(r.namePl)} opis={opisReceptury(r)} ostatni={i === bazowe.length - 1} onPress={() => onOtworzBazowa(r)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wiersz: {
    flexWrap: 'nowrap',
    minHeight: theme.cele.glownyPrzeplyw,
  },
  chipCel: {
    minHeight: theme.cele.pozostale,
  },
  mojaRzad: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pusty: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pokazWszystkie: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
