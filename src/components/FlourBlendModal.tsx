// ============================================================================
// Piekarz (Crust) — Flour Blend Builder & Editor Modal (WYG-002 & BR-MĄKA-001)
// Interactive multi-flour blend composition with live True Baker's % validation
// and proportional normalization to 100%.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { formatFixed } from '../lib/format';
import { FlourItemInput } from '../core/domain-rules';
import {
  FLOUR_PROFILES,
  validateFlourBlend,
  normalizeFlourBlend,
  FlourProfile,
} from '../core/flour-atlas';

export interface FlourBlendModalProps {
  visible: boolean;
  initialBlend: FlourItemInput[];
  onApply: (newBlend: FlourItemInput[]) => void;
  onClose: () => void;
}

export function FlourBlendModal({
  visible,
  initialBlend,
  onApply,
  onClose,
}: FlourBlendModalProps) {
  const [draftBlend, setDraftBlend] = useState<FlourItemInput[]>([]);

  useEffect(() => {
    if (visible) {
      setDraftBlend(initialBlend.length > 0 ? initialBlend.map((f) => ({ ...f })) : [
        { name: FLOUR_PROFILES[3].namePl, percentage: 100.0, type: FLOUR_PROFILES[3].id },
      ]);
    }
  }, [visible, initialBlend]);

  const validation = useMemo(() => validateFlourBlend(draftBlend), [draftBlend]);

  const updateFlourPercentage = (index: number, delta: number) => {
    setDraftBlend((prev) => {
      const next = prev.map((f, i) => {
        if (i !== index) return f;
        const raw = Math.round((f.percentage + delta) * 10) / 10;
        const clamped = Math.max(0, Math.min(100, raw));
        return { ...f, percentage: clamped };
      });
      return next;
    });
  };

  const removeFlour = (index: number) => {
    if (draftBlend.length <= 1) return;
    setDraftBlend((prev) => prev.filter((_, i) => i !== index));
  };

  const addFlourProfile = (profile: FlourProfile) => {
    const existingIndex = draftBlend.findIndex(
      (f) => f.name === profile.namePl || f.type === profile.id
    );
    if (existingIndex >= 0) {
      // Already present in blend, do not add duplicate
      return;
    }
    const defaultPct = validation.remainingPercentage > 0 ? validation.remainingPercentage : 10;
    setDraftBlend((prev) => [
      ...prev,
      {
        name: profile.namePl,
        percentage: defaultPct,
        type: profile.id,
      },
    ]);
  };

  const handleNormalize = () => {
    const normalized = normalizeFlourBlend(draftBlend);
    setDraftBlend(normalized);
  };

  const handleApply = () => {
    if (!validation.isValid) return;
    onApply(draftBlend);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard} testID="flour-blend-modal">
          {/* Header */}
          <Text style={styles.modalTitle}>{t('Kreator mieszanki mąk')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Dostosuj udział mąk. Suma musi wynosić dokładnie 100%.')}
          </Text>

          {/* Validation Status Banner */}
          <View
            testID="blend-validation-banner"
            style={[
              styles.validationBox,
              validation.isValid ? styles.validationBoxSuccess : styles.validationBoxWarning,
            ]}
          >
            <View style={styles.validationRow}>
              <Text
                style={[
                  styles.validationText,
                  validation.isValid ? styles.validationTextSuccess : styles.validationTextWarning,
                ]}
              >
                {validation.isValid
                  ? `✓ ${t('Proporcje poprawne (100%)')}`
                  : t(validation.errorTemplatePl ?? '', validation.errorParams)}
              </Text>
              {!validation.isValid && draftBlend.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  testID="normalize-blend-btn"
                  style={styles.normalizeBtn}
                  onPress={handleNormalize}
                >
                  <Text style={styles.normalizeBtnText}>{t('Wyrównaj do 100%')}</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Active Flour List */}
          <ScrollView style={styles.flourListScroll} showsVerticalScrollIndicator={false}>
            {draftBlend.map((flour, idx) => (
              <View key={idx} style={styles.flourRow} testID={`flour-row-${idx}`}>
                <View style={styles.flourMeta}>
                  <Text style={styles.flourName} numberOfLines={1}>
                    {flour.name}
                  </Text>
                  <Text style={styles.flourPctText}>{formatFixed(flour.percentage, 1)}%</Text>
                </View>

                {/* Steppers */}
                <View style={styles.stepperGroup}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Zmniejsz udział mąki {nazwa} o {n}%', { nazwa: flour.name, n: 10 })}
                    testID={`flour-minus-10-${idx}`}
                    style={styles.stepBtn}
                    onPress={() => updateFlourPercentage(idx, -10)}
                  >
                    <Text style={styles.stepBtnText}>-10</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Zmniejsz udział mąki {nazwa} o {n}%', { nazwa: flour.name, n: 5 })}
                    testID={`flour-minus-5-${idx}`}
                    style={styles.stepBtn}
                    onPress={() => updateFlourPercentage(idx, -5)}
                  >
                    <Text style={styles.stepBtnText}>-5</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Zwiększ udział mąki {nazwa} o {n}%', { nazwa: flour.name, n: 5 })}
                    testID={`flour-plus-5-${idx}`}
                    style={styles.stepBtn}
                    onPress={() => updateFlourPercentage(idx, 5)}
                  >
                    <Text style={styles.stepBtnText}>+5</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Zwiększ udział mąki {nazwa} o {n}%', { nazwa: flour.name, n: 10 })}
                    testID={`flour-plus-10-${idx}`}
                    style={styles.stepBtn}
                    onPress={() => updateFlourPercentage(idx, 10)}
                  >
                    <Text style={styles.stepBtnText}>+10</Text>
                  </Pressable>

                  {draftBlend.length > 1 && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Usuń mąkę: {nazwa}', { nazwa: flour.name })}
                      testID={`flour-remove-${idx}`}
                      style={styles.removeBtn}
                      onPress={() => removeFlour(idx)}
                    >
                      <Text style={styles.removeBtnText}>✕</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {/* Add Flour from Atlas section */}
            <View style={styles.addSection}>
              <Text style={styles.addSectionTitle}>+ {t('Dodaj mąkę z Atlasu')}</Text>
              {/* MAK-TYP-001, MAK-TYP-002 (docs/tresci/pl/maki-typy.md) [M1-audytor-generalny-091] */}
              <Text style={styles.addSectionNote}>
                {t('Typy mąki pszennej i żytniej określają Polskie Normy PN-A-74022:2003 i PN-A-74032:2002 według zawartości popiołu.')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.profileChipsScroll}
              >
                {FLOUR_PROFILES.filter(
                  (p) => !draftBlend.some((f) => f.name === p.namePl || f.type === p.id)
                ).map((profile) => (
                  <Pressable
                    accessibilityRole="button"
                    key={profile.id}
                    testID={`add-flour-${profile.id}`}
                    style={styles.profileChip}
                    onPress={() => addFlourProfile(profile)}
                  >
                    <Text style={styles.profileChipText}>{t(profile.namePl)}</Text>
                    {profile.estimatedFromTyp !== undefined && (
                      // Decyzja właściciela 2026-10-20 D-A: parametry bez źródła [M1-audytor-generalny-091]
                      <Text style={styles.profileChipNote}>
                        {t('Szacunek: parametry przyjęte z typu {typ}, bez źródła', {
                          typ: String(profile.estimatedFromTyp),
                        })}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalButtonsRow}>
            <Pressable
              accessibilityRole="button"
              testID="close-blend-modal-btn"
              style={styles.modalCancelBtn}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
            >
              <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              testID="apply-blend-btn"
              disabled={!validation.isValid}
              style={[
                styles.modalConfirmBtn,
                !validation.isValid && styles.modalConfirmBtnDisabled,
              ]}
              onPress={handleApply}
              hitSlop={sharedCraftTokens.hitSlopStandard}
            >
              <Text style={styles.modalConfirmBtnText}>{t('Zastosuj mieszankę')}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.tusz3,
    marginBottom: 12,
  },
  validationBox: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginBottom: 12,
  },
  validationBoxSuccess: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  validationBoxWarning: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
  },
  validationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  validationTextSuccess: {
    color: theme.colors.akcentTekst,
  },
  validationTextWarning: {
    color: theme.colors.tusz,
  },
  normalizeBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  normalizeBtnText: {
    color: theme.colors.naAkcencie,
    fontSize: 11,
    fontWeight: '700',
  },
  flourListScroll: {
    maxHeight: 340,
    marginBottom: 16,
  },
  flourRow: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  flourMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  flourName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
    flex: 1,
    marginRight: 8,
  },
  flourPctText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minWidth: 38,
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  removeBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.blad,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.blad,
  },
  addSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.linia,
  },
  addSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz2,
    marginBottom: 8,
  },
  addSectionNote: {
    fontSize: 11,
    color: theme.colors.tusz3,
    marginBottom: 8,
  },
  profileChipsScroll: {
    flexDirection: 'row',
  },
  profileChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  profileChipText: {
    fontSize: 11,
    color: theme.colors.tusz,
    fontWeight: '600',
  },
  profileChipNote: {
    fontSize: 10,
    color: theme.colors.tusz3,
    marginTop: 2,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: theme.colors.tusz3,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  modalConfirmBtnDisabled: {
    opacity: 0.4, // stan nieaktywny: brak tokenu (zgłoszenie do roli 04)
  },
  modalConfirmBtnText: {
    fontSize: 14,
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
});
