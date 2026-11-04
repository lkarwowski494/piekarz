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
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { PoleObjawu } from '../../ui/karty/PoleObjawu';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
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

/** Objawy w kartach (kolejność i teksty bez zmian); etykieta jako wywołanie t() z dosłownym kluczem (skan i18n). */
type Objaw = { klucz: keyof BreadInspectionCriteria; etykieta: () => string };
const MIEKISZ: Objaw[] = [
  { klucz: 'crumbHasHugeTopHolesWithDenseBottom', etykieta: () => t('Wielkie dziury pod skórką i zbity dół (Jaskinie)') },
  { klucz: 'crumbHasSmallUniformFoamLikeHoles', etykieta: () => t('Drobne, jednolite pęcherzyki jak gąbka/pianka') },
  { klucz: 'crumbIsWetGummyToKnife', etykieta: () => t('Mokry, lepki miękisz, brudzi nóż') },
  { klucz: 'crumbIsUniformlyDenseAllOver', etykieta: () => t('Jednolicie gęsty i ciężki miękisz (brak napowietrzenia)') },
];
const SKORKA: Objaw[] = [
  { klucz: 'loafIsFlatLikeDisk', etykieta: () => t('Chleb płaski jak dysk (rozlał się na boki)') },
  { klucz: 'loafCollapsedAfterScoring', etykieta: () => t('Opadł / zapadł się natychmiast po nacięciu żyletką') },
  { klucz: 'loafBurstAtBottomSide', etykieta: () => t('Rozerwanie boku przy spodzie') },
  { klucz: 'crustIsPaleLackColor', etykieta: () => t('Blada skórka, brak złocisto-karmelowego rumienia') },
  { klucz: 'crustLacksEarCutDidNotOpen', etykieta: () => t('Brak otwartego ucha (nacięcie się zasklepiło)') },
  { klucz: 'cutImmediatelyWhileSteamingHot', etykieta: () => t('Krojony gorący, prosto po wyjęciu z piekarnika') },
];
const SMAK: Objaw[] = [
  { klucz: 'breadIsExcessivelySour', etykieta: () => t('Zbyt kwaśny, octowy smak') },
  { klucz: 'breadIsBlandNoFlavor', etykieta: () => t('Płaski smak bez głębi (jałowy)') },
];

export function SymptomSelectorSection({
  symptoms,
  onToggleSymptom,
  onApplyPreset,
  hasAnySymptom,
  onClear,
}: SymptomSelectorSectionProps) {
  const duzy = useDuzyTekst();
  // Wiersze PoleObjawu (README §2, M3 p5b): jedna kontrolka objawów w zakwasie i w Doktorze; stuknięcie przełącza objaw
  const wiersze = (objawy: Objaw[]) => (
    <View style={styles.wiersze}>
      {objawy.map((o) => (
        <PoleObjawu
          key={o.klucz}
          testID={`objaw-${o.klucz}`}
          etykieta={o.etykieta()}
          zaznaczone={!!symptoms[o.klucz]}
          onZmien={() => onToggleSymptom(o.klucz)}
        />
      ))}
    </View>
  );
  return (
    // M3 p5: grupy objawów w kartach z ikoną (README §1); p5b: objawy jako wiersze PoleObjawu (D-198, D-200)
    <View style={styles.container}>
      {/* Quick Presets; przy dużym tekście rząd zawijany zamiast przewijania w poziomie (§7a, D-142) */}
      <Karta testID="karta-szablony" tytul={t('Szybkie szablony typowych problemów')} ikona={<IkonaKarty nazwa="lista" />}>
      <ScrollView
        horizontal={!duzy}
        scrollEnabled={!duzy}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.presetsRow, duzy && styles.presetsZawijane]}
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
      </Karta>

      <Karta testID="karta-miekisz" tytul={t('Miękisz (Wnętrze bochenka)')} ikona={<IkonaKarty nazwa="bochenek" />}>
        {wiersze(MIEKISZ)}
      </Karta>

      <Karta testID="karta-skorka" tytul={t('Skórka i Kształt bochenka')} ikona={<IkonaKarty nazwa="bochenek" />}>
        {wiersze(SKORKA)}
      </Karta>

      <Karta testID="karta-smak" tytul={t('Smak i Aromat')} ikona={<IkonaKarty nazwa="miska" />}>
        {wiersze(SMAK)}
      </Karta>

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
    gap: theme.spacing.md,
  },
  presetsRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 4,
  },
  // §7a, D-142: przy dużym tekście szablony w zawijanym rzędzie
  presetsZawijane: { flexDirection: 'row', flexWrap: 'wrap' },
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
  wiersze: { gap: 8 },
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
