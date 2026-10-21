import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import {
  VOLUME_INGREDIENTS,
  convertVolumeToGrams,
  VolumeIngredientId,
  VolumeUnit,
  CupStandard,
  VOLUME_ACCURACY_WARNING_PL,
} from '../core/volume-converter';

import { typografia } from '../ui/tokeny';
interface VolumeConverterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyGrams?: (grams: number, ingredientId: VolumeIngredientId) => void;
}

export function VolumeConverterModal({
  visible,
  onClose,
}: VolumeConverterModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] =
    useState<VolumeIngredientId>('flour_wheat_sifted');
  const [unit, setUnit] = useState<VolumeUnit>('cup');
  const [standard, setStandard] = useState<CupStandard>('metric');
  const [amountStr, setAmountStr] = useState<string>('1');

  const amount = useMemo(() => {
    const num = parseFloat(amountStr.replace(',', '.'));
    return isNaN(num) || num < 0 ? 0 : num;
  }, [amountStr]);

  const result = useMemo(() => {
    return convertVolumeToGrams(selectedIngredientId, amount, unit, standard);
  }, [selectedIngredientId, amount, unit, standard]);

  const adjustAmount = (delta: number) => {
    const current = amount;
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    setAmountStr(String(next));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>{t('Przelicznik objętości')}</Text>
            <Pressable
              testID="close-volume-modal-btn"
              style={styles.closeBtn}
              accessibilityRole="button"
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              accessibilityLabel={t('Zamknij przelicznik')}
            >
              <Text style={styles.closeBtnText}>{t('Zamknij')}</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            {t('Przelicz szklanki, łyżki i łyżeczki na gramy (DEC-14 / Z-013)')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Baking Accuracy Warning Banner */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningBannerText}>
              {t(result.warningNoticePl || VOLUME_ACCURACY_WARNING_PL)}
            </Text>
          </View>

          {/* Cup Standard Switcher */}
          {unit === 'cup' && (
            <View style={styles.standardRow}>
              <Text style={styles.label}>{t('Standard szklanki:')}</Text>
              <View style={styles.chipRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: standard === 'metric' }}
                  testID="cup-metric-btn"
                  style={[styles.smallChip, standard === 'metric' && styles.smallChipActive]}
                  onPress={() => setStandard('metric')}
                >
                  <Text
                    style={[
                      styles.smallChipText,
                      standard === 'metric' && styles.smallChipTextActive,
                    ]}
                  >
                    {t('Metryczna')} (250 ml)
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: standard === 'us' }}
                  testID="cup-us-btn"
                  style={[styles.smallChip, standard === 'us' && styles.smallChipActive]}
                  onPress={() => setStandard('us')}
                >
                  <Text
                    style={[
                      styles.smallChipText,
                      standard === 'us' && styles.smallChipTextActive,
                    ]}
                  >
                    {t('US Cup (236,6 ml)')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Unit Switcher */}
          <View style={styles.unitTabsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: unit === 'cup' }}
              testID="unit-cup-btn"
              style={[styles.unitTab, unit === 'cup' && styles.unitTabActive]}
              onPress={() => setUnit('cup')}
            >
              <Text style={[styles.unitTabText, unit === 'cup' && styles.unitTabTextActive]}>
                {t('Szklanki')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: unit === 'tablespoon' }}
              testID="unit-tbsp-btn"
              style={[styles.unitTab, unit === 'tablespoon' && styles.unitTabActive]}
              onPress={() => setUnit('tablespoon')}
            >
              <Text
                style={[
                  styles.unitTabText,
                  unit === 'tablespoon' && styles.unitTabTextActive,
                ]}
              >
                {t('Łyżki')} (15 ml)
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: unit === 'teaspoon' }}
              testID="unit-tsp-btn"
              style={[styles.unitTab, unit === 'teaspoon' && styles.unitTabActive]}
              onPress={() => setUnit('teaspoon')}
            >
              <Text
                style={[
                  styles.unitTabText,
                  unit === 'teaspoon' && styles.unitTabTextActive,
                ]}
              >
                {t('Łyżeczki')} (5 ml)
              </Text>
            </Pressable>
          </View>

          {/* Ingredient Selector */}
          <Text style={styles.sectionHeading}>{t('Wybierz składnik:')}</Text>
          <View style={styles.ingredientList}>
            {VOLUME_INGREDIENTS.map((item) => {
              const isSelected = selectedIngredientId === item.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: !!(isSelected) }}
                  key={item.id}
                  testID={`volume-ingredient-${item.id}`}
                  style={[styles.ingredientChip, isSelected && styles.ingredientChipActive]}
                  onPress={() => setSelectedIngredientId(item.id)}
                >
                  <Text
                    style={[
                      styles.ingredientChipText,
                      isSelected && styles.ingredientChipTextActive,
                    ]}
                  >
                    {t(item.namePl)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Amount Stepper and Input */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>{t('Ilość objętościowa:')}</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Zmniejsz ilość o pół')}
                testID="volume-step-minus-btn"
                style={styles.stepBtn}
                onPress={() => adjustAmount(-0.5)}
              >
                <Text style={styles.stepBtnText}>-½</Text>
              </Pressable>
              <TextInput
                testID="volume-amount-input"
                keyboardType="numeric"
                value={amountStr}
                onChangeText={setAmountStr}
                style={styles.amountInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Zwiększ ilość o pół')}
                testID="volume-step-plus-btn"
                style={styles.stepBtn}
                onPress={() => adjustAmount(0.5)}
              >
                <Text style={styles.stepBtnText}>+½</Text>
              </Pressable>
            </View>
          </View>

          {/* Result Highlight Card */}
          <View style={styles.resultCard}>
            <Text style={styles.resultSub}>
              {amount}{' '}
              {unit === 'cup'
                ? t('szklanek')
                : unit === 'tablespoon'
                ? t('łyżek')
                : t('łyżeczek')}{' '}
              =
            </Text>
            <Text style={styles.resultGrams} testID="volume-result-grams">
              {result.grams} g
            </Text>
            <Text style={styles.resultItemName}>{t(result.ingredient.namePl)}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
    backgroundColor: theme.colors.powierzchnia,
  },
  headerTitleRow: {
    fontFamily: theme.typography.krojTytulow,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  subtitle: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz3,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.akcentTekst,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  warningBanner: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  warningBannerText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz,
    lineHeight: 16,
  },
  standardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  smallChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  smallChipText: {
    fontSize: 11,
    color: theme.colors.tusz2,
    fontWeight: '500',
  },
  smallChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  unitTabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  unitTab: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  unitTabActive: {
    backgroundColor: theme.colors.powierzchnia,
  },
  unitTabText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz3,
  },
  unitTabTextActive: {
    color: theme.colors.tusz,
    fontWeight: '700',
  },
  sectionHeading: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.xs,
  },
  ingredientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  ingredientChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  ingredientChipActive: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.akcent,
  },
  ingredientChipText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
  },
  ingredientChipTextActive: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
  },
  amountCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  amountInput: {
    width: 80,
    height: 44,
    backgroundColor: theme.colors.tlo,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.tusz,
  },
  resultCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.akcent,
  },
  resultSub: {
    fontSize: 14,
    color: theme.colors.tusz3,
    marginBottom: 4,
  },
  resultGrams: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
    marginBottom: 4,
  },
  resultItemName: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
});
