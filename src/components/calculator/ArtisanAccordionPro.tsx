// ============================================================================
// Apps4Brew Studio — ArtisanAccordionPro (Progressive Disclosure Level 2)
// Zwijany panel dla rzemieślników: 4-DDT, lód, prefermenty, strata piecowa
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { PrefermentType, PREFERMENT_DEFINITIONS } from '../../core/preferments';
import { FlourItemInput } from '../../core/domain-rules';

export interface ArtisanAccordionProProps {
  isOpen: boolean;
  onToggle: () => void;
  // DDT
  targetDdt: number;
  onTargetDdtChange: (val: number) => void;
  waterTempTarget: number;
  iceGrams?: number;
  ambientTemp: number;
  flourTemp: number;
  frictionFactor: number;
  // Flour blend
  flourBlend: FlourItemInput[];
  onOpenBlendModal: () => void;
  waterPct: number;
  onWaterPctChange: (pct: number) => void;
  // Preferments
  prefermentType: PrefermentType;
  onPrefermentTypeChange: (type: PrefermentType) => void;
  // Bake Loss
  bakeLossPercent: number;
  bakedTotalWeightGrams: number;
}

export function ArtisanAccordionPro({
  isOpen,
  onToggle,
  targetDdt,
  onTargetDdtChange,
  waterTempTarget,
  iceGrams,
  ambientTemp,
  flourTemp,
  frictionFactor,
  flourBlend,
  onOpenBlendModal,
  waterPct,
  onWaterPctChange,
  prefermentType,
  onPrefermentTypeChange,
  bakeLossPercent,
  bakedTotalWeightGrams,
}: ArtisanAccordionProProps) {
  return (
    <View style={styles.container} testID="artisan-accordion-pro">
      {/* Accordion Header / Toggle */}
      <Pressable
        testID="artisan-accordion-toggle-btn"
        style={styles.toggleHeader}
        onPress={onToggle}
      >
        <View style={styles.toggleTitleRow}>
          <Text style={styles.toggleEmoji}>🔬</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>
              {t('Parametry Rzemieślnicze & Mąki')}
            </Text>
            <Text style={styles.toggleSubtitle}>
              {t('4-DDT, matematyka lodu, prefermenty, strata piecowa')}
            </Text>
          </View>
        </View>
        <View style={[styles.arrowBadge, isOpen && styles.arrowBadgeOpen]}>
          <Text style={styles.arrowText}>{isOpen ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {/* Accordion Body */}
      {isOpen && (
        <View style={styles.bodyContent} testID="artisan-accordion-body">
          {/* 1. Sekcja 4-DDT & Temperatura Wody */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>
              🌡️ {t('Kalkulator 4-DDT i Temperatura Wody')}
            </Text>
            <Text style={styles.sectionDesc}>
              {t(
                'Właściwa temperatura wody zapewnia docelową temperaturę ciasta po wymieszaniu.'
              )}
            </Text>

            <View style={styles.ddtResultCard}>
              <View style={styles.ddtResultRow}>
                <Text style={styles.ddtResultLabel}>{t('Docelowa temp. wody:')}</Text>
                <Text style={styles.ddtResultValue}>
                  {waterTempTarget > 0 ? `${waterTempTarget.toFixed(1)}°C` : '0°C (Lód)'}
                </Text>
              </View>

              {iceGrams !== undefined && iceGrams > 0 && (
                <View style={styles.iceAlertRow}>
                  <Text style={styles.iceIcon}>🧊</Text>
                  <Text style={styles.iceText}>
                    {t('Zastąp część wody lodem:')} {Math.round(iceGrams)} g {t('lodu')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.gridParams}>
              <View style={styles.paramBox}>
                <Text style={styles.paramLabel}>{t('Docelowe DDT')}</Text>
                <View style={styles.stepperInline}>
                  <Pressable
                    testID="ddt-minus-btn"
                    style={styles.miniBtn}
                    onPress={() => onTargetDdtChange(Math.max(18, targetDdt - 0.5))}
                  >
                    <Text style={styles.miniBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.paramValue}>{targetDdt.toFixed(1)}°C</Text>
                  <Pressable
                    testID="ddt-plus-btn"
                    style={styles.miniBtn}
                    onPress={() => onTargetDdtChange(Math.min(32, targetDdt + 0.5))}
                  >
                    <Text style={styles.miniBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.paramBox}>
                <Text style={styles.paramLabel}>{t('Hydratacja bazy')}</Text>
                <View style={styles.stepperInline}>
                  <Pressable
                    testID="water-pct-minus-btn"
                    style={styles.miniBtn}
                    onPress={() => onWaterPctChange(Math.max(50, waterPct - 1))}
                  >
                    <Text style={styles.miniBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.paramValue}>{waterPct}%</Text>
                  <Pressable
                    testID="water-pct-plus-btn"
                    style={styles.miniBtn}
                    onPress={() => onWaterPctChange(Math.min(100, waterPct + 1))}
                  >
                    <Text style={styles.miniBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* 2. Blend Mąk i Chłonność */}
          <View style={styles.sectionBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeaderTitle}>🌾 {t('Kompozycja Mąk')}</Text>
              <Pressable
                testID="edit-blend-pro-btn"
                style={styles.pillActionBtn}
                onPress={onOpenBlendModal}
              >
                <Text style={styles.pillActionText}>{t('Edytuj blend')}</Text>
              </Pressable>
            </View>
            <View style={styles.flourPillsContainer}>
              {flourBlend.map((f, i) => (
                <View key={i} style={styles.flourTag}>
                  <Text style={styles.flourTagText}>
                    {f.name}: {f.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. Prefermenty Rzemieślnicze */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>🏺 {t('Preferment (Zaczyn)')}</Text>
            <View style={styles.prefermentButtonsRow}>
              {(['direct', 'poolish', 'biga', 'levain'] as PrefermentType[]).map(
                (pType) => {
                  const isSel = prefermentType === pType;
                  return (
                    <Pressable
                      key={pType}
                      testID={`pref-type-${pType}`}
                      style={[styles.prefBtn, isSel && styles.prefBtnSelected]}
                      onPress={() => onPrefermentTypeChange(pType)}
                    >
                      <Text
                        style={[
                          styles.prefBtnText,
                          isSel && styles.prefBtnTextSelected,
                        ]}
                      >
                        {pType === 'direct'
                          ? t('Bezpośrednie')
                          : pType.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          {/* 4. Strata Piecowa */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>🔥 {t('Strata Piecowa')}</Text>
            <View style={styles.bakeLossRow}>
              <Text style={styles.bakeLossLabel}>
                {t('Szacowany ubytek masy')} ({bakeLossPercent}%):
              </Text>
              <Text style={styles.bakeLossValue}>
                ≈ {Math.round(bakedTotalWeightGrams)} g {t('upieczonego')}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceCard,
    minHeight: 52, // Zasada Brudnego Kciuka
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBadgeOpen: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  arrowText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  bodyContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionBlock: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  ddtResultCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  ddtResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ddtResultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ddtResultValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  iceAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  iceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  iceText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  gridParams: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paramBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paramLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  stepperInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniBtn: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  miniBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  pillActionBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  pillActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  flourPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  flourTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flourTagText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  prefermentButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  prefBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  prefBtnSelected: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  prefBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  prefBtnTextSelected: {
    color: theme.colors.textPrimary,
  },
  bakeLossRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bakeLossLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  bakeLossValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
