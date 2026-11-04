// ============================================================================
// Piekarz — sekcja „O recepturze” na ekranie receptury bazowej (design-spec §11c „106”): opis, pieczenie,
// naczynie i wskazówki pod zdaniem o hydratacji, poza pierwszym widokiem, w przewijanej treści. Kategoria
// i trudność są tylko na liście receptur. Treść z receptury (rola 06). Zastępuje kartę szczegółów receptury
// z dawnego wyboru receptur (FormulaPresetSelector). [M1-audytor-generalny-106]
// M3 p3 (karty/README.md §4, makieta karty/receptury.html #receptura): informacje w karcie „O recepturze”. [M3 p3]
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import type { RecipePreset } from '../../recipes/presets';
import { formatTemperature, useUnitSystem } from '../../lib/unit-converter';
import { s } from './style-receptur';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { typografia } from '../../ui/tokeny';
function naczynie(v: RecipePreset['recommendedVessel']): string {
  if (v === 'dutch_oven') return t('garnek żeliwny');
  if (v === 'bread_pan') return t('foremka keksówka');
  if (v === 'baking_steel') return t('stal piekarska');
  return t('blacha piekarnika');
}

/** `wskazowki`: wskazówki wersji drożdżowej zamiast wskazówek receptury (D-154) [M3 p9b]. */
export function ORecepturze({ receptura, wskazowki }: { receptura: RecipePreset; wskazowki?: string }) {
  const unitSystem = useUnitSystem();
  const r = receptura;
  const notatka = wskazowki ?? r.notesPl;
  return (
    <Karta testID="karta-o-recepturze" tytul={t('O recepturze')} ikona={<IkonaKarty nazwa="ksiazka" />}>
      <View testID="recipe-about" style={styles.tresc}>
        <Text style={s.etykieta}>{t(r.descriptionPl)}</Text>
        <Text style={styles.wiersz}>
          <Text style={styles.mocny}>{t('Pieczenie')}:</Text> {formatTemperature(r.bakeTempSteamC, unitSystem)} ({t('{n} min', { n: r.bakeTimeSteamMinutes })} {t('para')} +{' '}
          {t('{n} min w {temp}',{ n: r.bakeTimeBrowningMinutes, temp: formatTemperature(r.bakeTempBrowningC, unitSystem) })})
        </Text>
        <Text style={styles.wiersz}>
          <Text style={styles.mocny}>{t('Naczynie')}:</Text> {naczynie(r.recommendedVessel)}
        </Text>
        {notatka ? (
          <Text style={styles.wiersz}>
            <Text style={styles.mocny}>{t('Wskazówki')}:</Text> {t(notatka)}
          </Text>
        ) : null}
      </View>
    </Karta>
  );
}

const styles = StyleSheet.create({
  tresc: {
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
