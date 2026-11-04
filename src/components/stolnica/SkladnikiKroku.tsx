// ============================================================================
// Piekarz — składniki przy bieżącym kroku (BR-ETAP-001 „Bieżący krok”: co zrobić, potrzebne składniki i czas)
// [M1-audytor-generalny-130; 01-odkrywanie-501]. Te same wartości i etykiety co karta „Składniki do odważenia”
// w arkuszu „Plan wypieku” (BakeStepsList); bez nowych tekstów. Autoliza: mąka i woda; mieszanie po autolizie:
// zakwas i sól; mieszanie bez autolizy: wszystko; inne kroki: nic.
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { formatDoseWeight, formatWeight, UnitSystem } from '../../lib/unit-converter';
import type { SessionStep } from '../../core/bake-steps';
import type { DoughRecipeResult } from '../../core/domain-rules';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';

type Skladnik = 'maka' | 'woda' | 'zakwas' | 'sol';

/** Składniki odważane w kroku `idx` (czysta funkcja). */
export function skladnikiKroku(steps: readonly Pick<SessionStep, 'category'>[], idx: number): Skladnik[] {
  const kat = steps[idx]?.category;
  if (kat === 'autolyse') return ['maka', 'woda'];
  if (kat !== 'mix') return [];
  return steps.slice(0, idx).some((s) => s.category === 'autolyse') ? ['zakwas', 'sol'] : ['maka', 'woda', 'zakwas', 'sol'];
}

export interface SkladnikiKrokuProps {
  steps: readonly SessionStep[];
  stepIdx: number;
  calculatedRecipe?: DoughRecipeResult;
  unitSystem: UnitSystem;
}

export function SkladnikiKroku({ steps, stepIdx, calculatedRecipe, unitSystem }: SkladnikiKrokuProps) {
  const lista = skladnikiKroku(steps, stepIdx);
  const duzy = useDuzyTekst();
  if (!calculatedRecipe || lista.length === 0) return null;
  const wiersz: Record<Skladnik, [string, string]> = {
    maka: [t('Mąki'), formatWeight(calculatedRecipe.baseFlourWeightGrams, unitSystem)],
    woda: [t('Woda'), formatWeight(calculatedRecipe.waterGrams, unitSystem)],
    zakwas: [t('Zakwas|składnik'), formatWeight(calculatedRecipe.starterGrams, unitSystem)],
    sol: [t('Sól'), formatDoseWeight(calculatedRecipe.saltGrams, unitSystem)],
  };
  return (
    // Karta z ikoną (README §4 prowadzenie, M3 p4); przy dużym tekście nazwa na całą szerokość, masa pod nią (§7a, D-142)
    <View testID="skladniki-kroku" style={styles.odstep}>
      <Karta testID="karta-skladnikow-kroku" tytul={t('Składniki do odważenia')} ikona={<IkonaKarty nazwa="waga" />}>
        {lista.map((s) => (
          <View key={s} testID={`skladnik-${s}`} style={styles.wiersz}>
            <Text testID={`skladnik-${s}-nazwa`} style={[styles.nazwa, duzy && styles.nazwaPelna]}>{wiersz[s][0]}</Text>
            <Text style={styles.wartosc}>{wiersz[s][1]}</Text>
          </View>
        ))}
      </Karta>
    </View>
  );
}

const styles = StyleSheet.create({
  odstep: { marginTop: odstepy.m },
  wiersz: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: odstepy.s },
  nazwa: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  nazwaPelna: { flexBasis: '100%' },
  wartosc: { fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.tusz, fontVariant: ['tabular-nums'] },
});
