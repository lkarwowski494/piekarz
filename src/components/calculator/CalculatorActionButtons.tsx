// ============================================================================
// Piekarz — obszar akcji receptury: dokładnie 4 akcje główne (design-spec §11b „057”, DEC-09 a)
// „Ułóż plan” 64 pt w kolorze akcji i trzy akcje drugie 48 pt; kopiowanie i udostępnianie pliku są w menu
// „Więcej” w pasku nawigacji (src/lib/menu-receptury.ts), import tylko w Ustawieniach (F-33); QR, druk,
// spiżarnia, przelicznik objętości i odpowiedniki mąk bez wejścia (PÓŹNIEJ). [M1-audytor-generalny-057]
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';

export interface CalculatorActionButtonsProps {
  onMakePlan: () => void;
  onSaveCustomRecipe: () => void;
  onWaterTemp: () => void;
  onEditIngredients: () => void;
}

export function CalculatorActionButtons({
  onMakePlan,
  onSaveCustomRecipe,
  onWaterTemp,
  onEditIngredients,
}: CalculatorActionButtonsProps) {
  return (
    <View style={styles.obszar} testID="recipe-actions">
      <Pressable accessibilityRole="button" testID="start-bake-btn" style={styles.glowny} onPress={onMakePlan}>
        <Text style={styles.glownyTekst}>{t('Ułóż plan')}</Text>
      </Pressable>
      <View style={styles.rzad}>
        <Pressable accessibilityRole="button" testID="save-custom-recipe-btn" style={[styles.drugi, styles.wRzedzie]} onPress={onSaveCustomRecipe}>
          <Text style={styles.drugiTekst}>{t('Zapisz jako moją')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" testID="water-temp-btn" style={[styles.drugi, styles.wRzedzie]} onPress={onWaterTemp}>
          <Text style={styles.drugiTekst}>{t('Temperatura wody')}</Text>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" testID="edit-ingredients-btn" style={styles.drugi} onPress={onEditIngredients}>
        <Text style={styles.drugiTekst}>{t('Zmień składniki')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  obszar: {
    marginTop: theme.spacing.lg,
    gap: 10,
  },
  rzad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wRzedzie: {
    flexGrow: 1,
    flexBasis: 140,
  },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.akcent,
    borderRadius: promienie.przyciskGlowny,
  },
  glownyTekst: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
    textAlign: 'center',
  },
  drugi: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    borderRadius: promienie.przycisk,
  },
  drugiTekst: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz,
    textAlign: 'center',
  },
});
