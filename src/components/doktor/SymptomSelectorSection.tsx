// ============================================================================
// Apps4Craft Studio — SymptomSelectorSection Component
// Quick presets and comprehensive symptom selectors for crumb, crust, and taste.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BreadInspectionCriteria } from '../../doctor/diagnostics';

import { typografia } from '../../ui/tokeny';
export interface DiagnosticPreset {
  id: string;
  name: string;
  symptoms: BreadInspectionCriteria;
}

export const DIAGNOSTIC_PRESETS: DiagnosticPreset[] = [
  {
    id: 'preset_under',
    name: 'Jaskinie (Niedofermentowany)',
    symptoms: { crumbHasHugeTopHolesWithDenseBottom: true },
  },
  {
    id: 'preset_over',
    name: 'Płaski dysk (Przerośnięty)',
    symptoms: { loafIsFlatLikeDisk: true, loafCollapsedAfterScoring: true },
  },
  {
    id: 'preset_gummy',
    name: 'Gumowaty (Krojony na gorąco)', // przyczyna jak EN, KRO-POC-015 [M1-audytor-generalny-148]
    symptoms: { cutImmediatelyWhileSteamingHot: true },
  },
  {
    id: 'preset_blowout',
    name: 'Pęknięty bok',
    symptoms: { loafBurstAtBottomSide: true },
  },
  {
    id: 'preset_sour',
    name: 'Zbyt kwaśny (Octowy)',
    symptoms: { breadIsExcessivelySour: true },
  },
  {
    id: 'preset_bland',
    name: 'Płaski smak (Jałowy)',
    symptoms: { breadIsBlandNoFlavor: true },
  },
];

export interface SymptomSelectorSectionProps {
  symptoms: BreadInspectionCriteria;
  onToggleSymptom: (key: keyof BreadInspectionCriteria) => void;
  onApplyPreset: (preset: DiagnosticPreset) => void;
  hasAnySymptom: boolean;
  onClear: () => void;
}

export function SymptomSelectorSection({
  symptoms,
  onToggleSymptom,
  onApplyPreset,
  hasAnySymptom,
  onClear,
}: SymptomSelectorSectionProps) {
  return (
    <View style={styles.container}>
      {/* Quick Presets */}
      <Text style={styles.sectionHeading}>{t('Szybkie szablony typowych problemów')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsRow}
      >
        {DIAGNOSTIC_PRESETS.map((preset) => (
          <Pressable
            accessibilityRole="button"
            key={preset.id}
            style={styles.presetChip}
            onPress={() => onApplyPreset(preset)}
          >
            <Text style={styles.presetName}>{t(preset.name)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Symptoms Section: Miękisz */}
      <Text style={styles.sectionHeading}>{t('Miękisz (Wnętrze bochenka)')}</Text>
      <View style={styles.chipsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.crumbHasHugeTopHolesWithDenseBottom) }}
          style={[
            styles.symptomChip,
            symptoms.crumbHasHugeTopHolesWithDenseBottom && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('crumbHasHugeTopHolesWithDenseBottom')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.crumbHasHugeTopHolesWithDenseBottom && styles.symptomChipTextActive,
            ]}
          >
            {t('Wielkie dziury pod skórką i zbity dół (Jaskinie)')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.crumbHasSmallUniformFoamLikeHoles) }}
          style={[
            styles.symptomChip,
            symptoms.crumbHasSmallUniformFoamLikeHoles && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('crumbHasSmallUniformFoamLikeHoles')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.crumbHasSmallUniformFoamLikeHoles && styles.symptomChipTextActive,
            ]}
          >
            {t('Drobne, jednolite pęcherzyki jak gąbka/pianka')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.crumbIsWetGummyToKnife) }}
          style={[
            styles.symptomChip,
            symptoms.crumbIsWetGummyToKnife && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('crumbIsWetGummyToKnife')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.crumbIsWetGummyToKnife && styles.symptomChipTextActive,
            ]}
          >
            {t('Mokry, lepki miękisz, brudzi nóż')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.crumbIsUniformlyDenseAllOver) }}
          style={[
            styles.symptomChip,
            symptoms.crumbIsUniformlyDenseAllOver && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('crumbIsUniformlyDenseAllOver')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.crumbIsUniformlyDenseAllOver && styles.symptomChipTextActive,
            ]}
          >
            {t('Jednolicie gęsty i ciężki miękisz (brak napowietrzenia)')}
          </Text>
        </Pressable>
      </View>

      {/* Symptoms Section: Skórka i Kształt */}
      <Text style={styles.sectionHeading}>{t('Skórka i Kształt bochenka')}</Text>
      <View style={styles.chipsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.loafIsFlatLikeDisk) }}
          style={[
            styles.symptomChip,
            symptoms.loafIsFlatLikeDisk && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('loafIsFlatLikeDisk')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.loafIsFlatLikeDisk && styles.symptomChipTextActive,
            ]}
          >
            {t('Chleb płaski jak dysk (rozlał się na boki)')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.loafCollapsedAfterScoring) }}
          style={[
            styles.symptomChip,
            symptoms.loafCollapsedAfterScoring && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('loafCollapsedAfterScoring')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.loafCollapsedAfterScoring && styles.symptomChipTextActive,
            ]}
          >
            {t('Opadł / zapadł się natychmiast po nacięciu żyletką')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.loafBurstAtBottomSide) }}
          style={[
            styles.symptomChip,
            symptoms.loafBurstAtBottomSide && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('loafBurstAtBottomSide')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.loafBurstAtBottomSide && styles.symptomChipTextActive,
            ]}
          >
            {t('Rozerwanie boku przy spodzie')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.crustIsPaleLackColor) }}
          style={[
            styles.symptomChip,
            symptoms.crustIsPaleLackColor && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('crustIsPaleLackColor')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.crustIsPaleLackColor && styles.symptomChipTextActive,
            ]}
          >
            {t('Blada skórka, brak złocisto-karmelowego rumienia')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.crustLacksEarCutDidNotOpen) }}
          style={[
            styles.symptomChip,
            symptoms.crustLacksEarCutDidNotOpen && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('crustLacksEarCutDidNotOpen')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.crustLacksEarCutDidNotOpen && styles.symptomChipTextActive,
            ]}
          >
            {t('Brak otwartego ucha (nacięcie się zasklepiło)')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.cutImmediatelyWhileSteamingHot) }}
          style={[
            styles.symptomChip,
            symptoms.cutImmediatelyWhileSteamingHot && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('cutImmediatelyWhileSteamingHot')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.cutImmediatelyWhileSteamingHot && styles.symptomChipTextActive,
            ]}
          >
            {t('Krojony gorący, prosto po wyjęciu z piekarnika')}
          </Text>
        </Pressable>
      </View>

      {/* Symptoms Section: Smak i Aromat */}
      <Text style={styles.sectionHeading}>{t('Smak i Aromat')}</Text>
      <View style={styles.chipsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.breadIsExcessivelySour) }}
          style={[
            styles.symptomChip,
            symptoms.breadIsExcessivelySour && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('breadIsExcessivelySour')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.breadIsExcessivelySour && styles.symptomChipTextActive,
            ]}
          >
            {t('Zbyt kwaśny, octowy smak')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!(symptoms.breadIsBlandNoFlavor) }}
          style={[
            styles.symptomChip,
            symptoms.breadIsBlandNoFlavor && styles.symptomChipActive,
          ]}
          onPress={() => onToggleSymptom('breadIsBlandNoFlavor')}
        >
          <Text
            style={[
              styles.symptomChipText,
              symptoms.breadIsBlandNoFlavor && styles.symptomChipTextActive,
            ]}
          >
            {t('Płaski smak bez głębi (jałowy)')}
          </Text>
        </Pressable>
      </View>

      {/* Clear Button */}
      {hasAnySymptom && (
        <Pressable accessibilityRole="button" style={styles.clearBtn} onPress={onClear}>
          <Text style={styles.clearBtnText}>{t('Wyczyść zaznaczone objawy')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  sectionHeading: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 12,
    marginBottom: 8,
  },
  presetsRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 4,
  },
  presetChip: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    marginRight: 6,
  },
  presetName: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    fontWeight: '600',
  },
  chipsContainer: {
    gap: 8,
    marginBottom: 8,
  },
  symptomChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  symptomChipActive: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.akcent,
  },
  symptomChipText: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    fontWeight: '500',
  },
  symptomChipTextActive: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
  },
  clearBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  clearBtnText: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '600',
    color: theme.colors.tusz3,
  },
});
