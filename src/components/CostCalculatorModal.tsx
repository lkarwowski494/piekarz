// ============================================================================
// Piekarz (Crust) — Artisan Batch Cost & Yield Calculator Modal
// Interactive evaluation of raw ingredient costs and oven energy consumption
// per batch and per loaf.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import {
  calculateBatchCost,
  DEFAULT_COST_PARAMETERS,
  BatchCostMetrics,
} from '../core/cost-calculator';

export interface CostCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  totalFlourGrams: number;
  totalWaterGrams: number;
  totalSaltGrams: number;
  loavesCount: number;
  bakedLoafWeightGrams?: number;
}

export function CostCalculatorModal({
  visible,
  onClose,
  totalFlourGrams,
  totalWaterGrams,
  totalSaltGrams,
  loavesCount,
  bakedLoafWeightGrams,
}: CostCalculatorModalProps) {
  const [flourPrice, setFlourPrice] = useState<number>(DEFAULT_COST_PARAMETERS.flourPricePerKg);
  const [electricityPrice, setElectricityPrice] = useState<number>(DEFAULT_COST_PARAMETERS.electricityPricePerKwh);
  const [addInsCost, setAddInsCost] = useState<number>(DEFAULT_COST_PARAMETERS.addInsCost);

  const metrics: BatchCostMetrics = useMemo(() => {
    return calculateBatchCost({
      totalFlourGrams,
      totalWaterGrams,
      totalSaltGrams,
      loavesCount,
      bakedLoafWeightGrams,
      flourPricePerKg: flourPrice,
      electricityPricePerKwh: electricityPrice,
      addInsCost,
    });
  }, [
    totalFlourGrams,
    totalWaterGrams,
    totalSaltGrams,
    loavesCount,
    bakedLoafWeightGrams,
    flourPrice,
    electricityPrice,
    addInsCost,
  ]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard} testID="cost-calculator-modal">
          {/* Header */}
          <Text style={styles.modalTitle}>💰 {t('Kalkulator kosztów wypieku')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Szacunkowy koszt składników i energii pieca')} • {t('Laboratorium B2B')} (KL-01)
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {/* Primary Result Banner */}
            <View style={styles.highlightCard} testID="cost-highlight-card">
              <Text style={styles.highlightLabel}>{t('Koszt za bochenek')}</Text>
              <Text style={styles.highlightValue}>{metrics.costPerLoaf.toFixed(2)} zł</Text>
              <Text style={styles.highlightSub}>
                {metrics.costPer100g.toFixed(2)} zł / 100g ({t('Koszt na 100g')})
              </Text>
            </View>

            {/* Breakdown Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('Koszt całego wypieku')}</Text>
                <Text style={styles.metricValue}>{metrics.totalBatchCost.toFixed(2)} zł</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('Składniki')}</Text>
                <Text style={styles.metricValue}>{metrics.ingredientsTotalCost.toFixed(2)} zł</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('Energia pieca')} (B2B Lab)</Text>
                <Text style={styles.metricValue}>
                  {metrics.energyTotalCost.toFixed(2)} zł ({metrics.ovenKwhConsumed} kWh)
                </Text>
              </View>
            </View>

            {/* Adjustable Parameters */}
            <View style={styles.controlsSection}>
              {/* Flour Price */}
              <View style={styles.controlRow}>
                <View style={styles.controlInfo}>
                  <Text style={styles.controlLabel}>{t('Cena mąki')}</Text>
                  <Text style={styles.controlValue}>{flourPrice.toFixed(2)} zł/kg</Text>
                </View>
                <View style={styles.stepperGroup}>
                  <Pressable
                    testID="flour-price-minus"
                    style={styles.stepBtn}
                    onPress={() => setFlourPrice((p) => Math.max(1.0, Math.round((p - 0.5) * 10) / 10))}
                  >
                    <Text style={styles.stepBtnText}>-0.5</Text>
                  </Pressable>
                  <Pressable
                    testID="flour-price-plus"
                    style={styles.stepBtn}
                    onPress={() => setFlourPrice((p) => Math.min(25.0, Math.round((p + 0.5) * 10) / 10))}
                  >
                    <Text style={styles.stepBtnText}>+0.5</Text>
                  </Pressable>
                </View>
              </View>

              {/* Electricity Price */}
              <View style={styles.controlRow}>
                <View style={styles.controlInfo}>
                  <Text style={styles.controlLabel}>{t('Cena energii')}</Text>
                  <Text style={styles.controlValue}>{electricityPrice.toFixed(2)} zł/kWh</Text>
                </View>
                <View style={styles.stepperGroup}>
                  <Pressable
                    testID="power-price-minus"
                    style={styles.stepBtn}
                    onPress={() => setElectricityPrice((p) => Math.max(0.2, Math.round((p - 0.1) * 10) / 10))}
                  >
                    <Text style={styles.stepBtnText}>-0.1</Text>
                  </Pressable>
                  <Pressable
                    testID="power-price-plus"
                    style={styles.stepBtn}
                    onPress={() => setElectricityPrice((p) => Math.min(5.0, Math.round((p + 0.1) * 10) / 10))}
                  >
                    <Text style={styles.stepBtnText}>+0.1</Text>
                  </Pressable>
                </View>
              </View>

              {/* Add-ins Cost */}
              <View style={styles.controlRow}>
                <View style={styles.controlInfo}>
                  <Text style={styles.controlLabel}>{t('Dodatki (orzechy, ziarna)')}</Text>
                  <Text style={styles.controlValue}>{addInsCost.toFixed(2)} zł</Text>
                </View>
                <View style={styles.stepperGroup}>
                  <Pressable
                    testID="addins-minus"
                    style={styles.stepBtn}
                    onPress={() => setAddInsCost((p) => Math.max(0.0, Math.round((p - 1.0) * 10) / 10))}
                  >
                    <Text style={styles.stepBtnText}>-1</Text>
                  </Pressable>
                  <Pressable
                    testID="addins-plus"
                    style={styles.stepBtn}
                    onPress={() => setAddInsCost((p) => Math.min(50.0, Math.round((p + 1.0) * 10) / 10))}
                  >
                    <Text style={styles.stepBtnText}>+1</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Benchmark Card */}
            <View style={styles.benchmarkBox}>
              <Text style={styles.benchmarkText}>
                🥖 Twój domowy chleb na zakwasie kosztuje zaledwie ~{metrics.costPerLoaf.toFixed(2)} zł,
                podczas gdy w piekarni rzemieślniczej za bochenek tej jakości zapłacisz 14–22 zł!
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <Pressable
            testID="close-cost-modal-btn"
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{t('Zamknij')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  scrollArea: {
    maxHeight: 400,
    marginBottom: 14,
  },
  highlightCard: {
    backgroundColor: theme.colors.accentLight,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  highlightSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    gap: 6,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  controlsSection: {
    marginBottom: 12,
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  controlInfo: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  controlValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepperGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minWidth: 38,
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  benchmarkBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginTop: 4,
  },
  benchmarkText: {
    fontSize: 12,
    color: theme.colors.statusSuccess,
    lineHeight: 16,
  },
  closeBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
