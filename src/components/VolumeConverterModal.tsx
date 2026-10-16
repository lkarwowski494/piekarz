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

interface VolumeConverterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyGrams?: (grams: number, ingredientId: VolumeIngredientId) => void;
}

export function VolumeConverterModal({
  visible,
  onClose,
  onApplyGrams,
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>⚖️ {t('Przelicznik Objętość ↔ Waga')}</Text>
            <Pressable
              testID="close-volume-modal-btn"
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel={t('Zamknij przelicznik')}
            >
              <Text style={styles.closeBtnText}>✕</Text>
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
              {result.warningNoticePl || VOLUME_ACCURACY_WARNING_PL}
            </Text>
          </View>

          {/* Cup Standard Switcher */}
          {unit === 'cup' && (
            <View style={styles.standardRow}>
              <Text style={styles.label}>{t('Standard szklanki:')}</Text>
              <View style={styles.chipRow}>
                <Pressable
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
                    🇪🇺 {t('Metryczna')} (250 ml)
                  </Text>
                </Pressable>
                <Pressable
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
                    🇺🇸 US Cup (236,6 ml)
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Unit Switcher */}
          <View style={styles.unitTabsRow}>
            <Pressable
              testID="unit-cup-btn"
              style={[styles.unitTab, unit === 'cup' && styles.unitTabActive]}
              onPress={() => setUnit('cup')}
            >
              <Text style={[styles.unitTabText, unit === 'cup' && styles.unitTabTextActive]}>
                🥛 {t('Szklanki')}
              </Text>
            </Pressable>
            <Pressable
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
                🥄 {t('Łyżki')} (15 ml)
              </Text>
            </Pressable>
            <Pressable
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
                🥄 {t('Łyżeczki')} (5 ml)
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
                    {item.namePl}
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
            <Text style={styles.resultItemName}>{result.ingredient.namePl}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  warningBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  warningBannerText: {
    fontSize: 12,
    color: '#6D4C41',
    lineHeight: 16,
  },
  standardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  smallChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  smallChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  smallChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  unitTabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unitTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  unitTabActive: {
    backgroundColor: theme.colors.surface,
  },
  unitTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  unitTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  ingredientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  ingredientChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ingredientChipActive: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.accent,
  },
  ingredientChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  ingredientChipTextActive: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  amountInput: {
    width: 80,
    height: 44,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  resultCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  resultSub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  resultGrams: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  resultItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
