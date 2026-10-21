// ============================================================================
// Piekarz — sekcja „O recepturze” na ekranie receptury bazowej (design-spec §11c „106”): opis, pieczenie,
// naczynie i wskazówki pod zdaniem o hydratacji, poza pierwszym widokiem, w przewijanej treści. Kategoria
// i trudność są tylko na liście receptur. Treść z receptury (rola 06). Zastępuje kartę szczegółów receptury
// z dawnego wyboru receptur (FormulaPresetSelector). [M1-audytor-generalny-106]
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import type { RecipePreset } from '../../recipes/presets';
import { formatTemperature, useUnitSystem } from '../../lib/unit-converter';
import { s } from './style-receptur';

import { typografia } from '../../ui/tokeny';
function naczynie(v: RecipePreset['recommendedVessel']): string {
  if (v === 'dutch_oven') return t('garnek żeliwny');
  if (v === 'bread_pan') return t('foremka keksówka');
  if (v === 'baking_steel') return t('stal piekarska');
  return t('blacha piekarnika');
}

export function ORecepturze({ receptura }: { receptura: RecipePreset }) {
  const unitSystem = useUnitSystem();
  const r = receptura;
  return (
    <View testID="recipe-about">
      <Text style={s.naglowekGrupy} accessibilityRole="header">
        {t('O recepturze')}
      </Text>
      <View style={[s.grupa, styles.tresc]}>
        <Text style={s.etykieta}>{t(r.descriptionPl)}</Text>
        <Text style={styles.wiersz}>
          <Text style={styles.mocny}>{t('Pieczenie')}:</Text> {formatTemperature(r.bakeTempSteamC, unitSystem)} ({t('{n} min', { n: r.bakeTimeSteamMinutes })} {t('para')} +{' '}
          {t('{n} min w {temp}',{ n: r.bakeTimeBrowningMinutes, temp: formatTemperature(r.bakeTempBrowningC, unitSystem) })})
        </Text>
        <Text style={styles.wiersz}>
          <Text style={styles.mocny}>{t('Naczynie')}:</Text> {naczynie(r.recommendedVessel)}
        </Text>
        {r.notesPl ? (
          <Text style={styles.wiersz}>
            <Text style={styles.mocny}>{t('Wskazówki')}:</Text> {t(r.notesPl)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tresc: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  wiersz: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
  mocny: {
    fontWeight: '600',
    color: theme.colors.tusz,
  },
});
