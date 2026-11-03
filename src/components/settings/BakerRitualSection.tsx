import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakingVessel } from '../../data/sqlite-store';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WIERSZ, wierszUstawien } from './wiersz-ustawien';

import { typografia } from '../../ui/tokeny';
// Bez wyboru stylu wypieku: rodzaj receptur wybiera się na Starcie; zapisana wartość
// baker_ritual_profile zostaje w bazie, kod jej nie czyta [M1-audytor-generalny-101; BR-START-001]
export interface BakerRitualSectionProps {
  bakingVessel: BakingVessel;
  onVesselChange: (vessel: BakingVessel) => void;
}

export function BakerRitualSection({
  bakingVessel,
  onVesselChange,
}: BakerRitualSectionProps) {
  return (
    <>
      {/* Baking Equipment Section */}
      {/* Karta z ikoną; naczynia jako wiersze z ✓ zamiast kafli z obwódką (M3 p5, inne.html #ustawienia) */}
      <Karta testID="karta-naczynie" tytul={t('Sprzęt i naczynie do wypieku')} ikona={<IkonaKarty nazwa="bochenek" />}>
        <Text style={styles.cardDescription}>
          {t('Wybierz domyślne naczynie piecowe dla procedury Stolnicy:')}
        </Text>
        <View style={styles.optionsCol}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'dutch_oven' }}
            testID="vessel-dutch-oven-btn"
            style={[styles.wiersz, wierszUstawien.rzad, wierszUstawien.pierwszy]}
            onPress={() => onVesselChange('dutch_oven')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'dutch_oven' && styles.optionTitleActive]}>
                {t('Garnek żeliwny')}
              </Text>
            </View>
            {bakingVessel === 'dutch_oven' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'cloche' }}
            testID="vessel-cloche-btn"
            style={[styles.wiersz, wierszUstawien.rzad]}
            onPress={() => onVesselChange('cloche')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'cloche' && styles.optionTitleActive]}>
                {t('Klosz ceramiczny')}
              </Text>
            </View>
            {bakingVessel === 'cloche' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'baking_steel' }}
            testID="vessel-steel-btn"
            style={[styles.wiersz, wierszUstawien.rzad]}
            onPress={() => onVesselChange('baking_steel')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'baking_steel' && styles.optionTitleActive]}>
                {t('Stal / Kamień szamotowy')}
              </Text>
            </View>
            {bakingVessel === 'baking_steel' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: bakingVessel === 'pullman_pan' }}
            testID="vessel-pullman-btn"
            style={[styles.wiersz, wierszUstawien.rzad]}
            onPress={() => onVesselChange('pullman_pan')}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'pullman_pan' && styles.optionTitleActive]}>
                {t('Foremka z pokrywą')}
              </Text>
            </View>
            {bakingVessel === 'pullman_pan' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        </View>
      </Karta>
    </>
  );
}

const styles = StyleSheet.create({
  // Wiersz w karcie (README §2): min 52, linia nad wierszem
  wiersz: { minHeight: 52, ...WIERSZ },
  cardDescription: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
  },
  optionsCol: {},
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz,
  },
  optionTitleActive: {
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  checkMark: {
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },
});
