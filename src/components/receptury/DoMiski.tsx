// ============================================================================
// Piekarz — ilości na ekranie receptury (design-spec §11c „106”, stany `receptura` i `receptura-zaczyn`):
// grupa trybu (Bochenki + Masa bochenka albo Masa mąki), „Do miski” jako lista grupowana z odhaczaniem
// (z zaczynem: „Zaczyn: {rodzaj}” + „Do miski”), zdanie o hydratacji i „Razem {masa}”. Liczby z rachunku
// receptury (useRecipeCalculations) bez zmian; tryb liczenia wybiera się w arkuszu „Składniki”.
// Zastępuje kartę DoMiskiScaleCard i karty liczb CalculatorSacredCard (§12a). [M1-audytor-generalny-106]
// ============================================================================

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { nazwaMakiMieszanki } from '../../lib/nazwa-maki-mieszanki';
import { formatFixed, formatNumber } from '../../lib/format';
import type { DoughRecipeResult } from '../../core/domain-rules';
import type { PrefermentBreakdownResult, PrefermentType } from '../../core/preferments';
import { NumInput } from '../NumInput';
import { useUnitSystem, formatWeight, formatDoseWeight, gramsToOunces, roundTo } from '../../lib/unit-converter';
import { nazwaZaczynu } from './nazwy-receptur';
import { s } from './style-receptur';

export interface DoMiskiProps {
  calculations: DoughRecipeResult;
  waterPct: number;
  starterPct: number;
  starterHydration: number;
  saltPct: number;
  yeastPct: number;
  calcMode: 'loaves' | 'flour';
  loavesCount: number;
  onLoavesChange: (n: number) => void;
  loafWeightGrams: number;
  onLoafWeightChange: (g: number) => void;
  flourGrams: number;
  onFlourGramsChange: (g: number) => void;
  prefermentType: PrefermentType;
  prefermentBreakdown: PrefermentBreakdownResult | null;
}

const proc = (n: number) => `${formatNumber(n, undefined, { maximumFractionDigits: 1 })}%`;

function haptyka(styl: Haptics.ImpactFeedbackStyle) {
  try {
    void Haptics.impactAsync(styl);
  } catch {
    // Haptyka jest dodatkiem: brak wibracji nie blokuje zmiany
  }
}

function WierszWagi({ id, nazwa, procent, masa, zaznaczony, onPress }: { id: string; nazwa: string; procent?: string; masa: string; zaznaczony: boolean; onPress: () => void }) {
  return (
    <Pressable
      testID={id}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: zaznaczony }}
      style={[s.kom, styles.waga]}
      onPress={onPress}
    >
      <View style={[styles.pole, zaznaczony && styles.poleZaznaczone]}>
        {zaznaczony && <Text style={styles.znak}>✓</Text>}
      </View>
      <View style={s.roz}>
        <Text style={s.etykieta}>{nazwa}</Text>
        {procent !== undefined && <Text style={s.przypis}>{procent}</Text>}
      </View>
      <Text style={[s.liczba, styles.masa]}>{masa}</Text>
    </Pressable>
  );
}

function PoleMasy({ id, etykieta, gramy, onChange }: { id: string; etykieta: string; gramy: number; onChange: (g: number) => void }) {
  const unitSystem = useUnitSystem();
  const jednostka = unitSystem === 'imperial' ? 'oz' : 'g';
  const wartosc = unitSystem === 'imperial' ? roundTo(gramsToOunces(gramy), 1) : Math.round(gramy);
  return (
    <View style={s.kom}>
      <Text style={[s.etykieta, s.roz]}>{etykieta}</Text>
      <View style={styles.poleRzad}>
        <NumInput testID={id} accessibilityLabel={etykieta} value={wartosc} stored={gramy} unit={jednostka} min={50} onChangeNumber={onChange} style={s.pole} />
        <Text style={s.wartosc}>{jednostka}</Text>
      </View>
    </View>
  );
}

export function DoMiski(p: DoMiskiProps) {
  const unitSystem = useUnitSystem();
  const [odhaczone, setOdhaczone] = useState<Record<string, boolean>>({});
  const c = p.calculations;
  const b = p.prefermentBreakdown;
  const w = (g: number) => formatWeight(g, unitSystem);
  const d = (g: number) => formatDoseWeight(g, unitSystem);
  const wiersz = (id: string, nazwa: string, masa: string, procent?: string) => (
    <WierszWagi
      key={id}
      id={id}
      nazwa={nazwa}
      procent={procent}
      masa={masa}
      zaznaczony={!!odhaczone[id]}
      onPress={() => {
        haptyka(Haptics.ImpactFeedbackStyle.Light);
        setOdhaczone((o) => ({ ...o, [id]: !o[id] }));
      }}
    />
  );
  const zakwas = c.starterGrams > 0
    ? wiersz('scale-item-starter', t('Zakwas ({n}% wody)', { n: formatNumber(p.starterHydration) }), w(c.starterGrams), proc(p.starterPct))
    : null;
  const zmienBochenki = (delta: number) => {
    haptyka(Haptics.ImpactFeedbackStyle.Medium);
    p.onLoavesChange(Math.max(1, Math.min(20, p.loavesCount + delta)));
  };
  const hydratacja = formatNumber(c.overallHydrationPercent, undefined, { maximumFractionDigits: 1 });

  return (
    <>
      <View style={s.grupa} testID="recipe-mode">
        {p.calcMode === 'loaves' ? (
          <>
            <View style={s.kom}>
              <Text style={[s.etykieta, s.roz]}>{t('Bochenki')}</Text>
              <View style={styles.stepper}>
                <Pressable testID="loaves-decrement-btn" accessibilityRole="button" accessibilityLabel={t('Mniej bochenków')} disabled={p.loavesCount <= 1} style={styles.krok} onPress={() => zmienBochenki(-1)}>
                  <Text style={[styles.krokTekst, p.loavesCount <= 1 && styles.krokNieaktywny]}>−</Text>
                </Pressable>
                <Text style={[s.liczba, styles.ile]} testID="loaves-count-display">{p.loavesCount}</Text>
                <Pressable testID="loaves-increment-btn" accessibilityRole="button" accessibilityLabel={t('Więcej bochenków')} style={styles.krok} onPress={() => zmienBochenki(1)}>
                  <Text style={styles.krokTekst}>+</Text>
                </Pressable>
              </View>
            </View>
            <PoleMasy id="loaf-weight-input" etykieta={t('Masa bochenka')} gramy={p.loafWeightGrams} onChange={p.onLoafWeightChange} />
          </>
        ) : (
          <PoleMasy id="flour-weight-input" etykieta={t('Masa mąki')} gramy={p.flourGrams} onChange={p.onFlourGramsChange} />
        )}
      </View>

      {b ? (
        <>
          <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Zaczyn: {rodzaj}', { rodzaj: nazwaZaczynu(p.prefermentType) })}</Text>
          <View style={s.grupa} testID="do-miski-zaczyn">
            {wiersz('scale-item-preferment-flour', t('Mąka'), w(b.prefermentFlourGrams))}
            {wiersz('scale-item-preferment-water', t('Woda'), w(b.prefermentWaterGrams))}
            {b.prefermentYeastGrams > 0 && wiersz('scale-item-preferment-yeast', t('Drożdże'), d(b.prefermentYeastGrams))}
            {b.prefermentSaltGrams > 0 && wiersz('scale-item-preferment-salt', t('Sól'), d(b.prefermentSaltGrams))}
          </View>
          <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Do miski')}</Text>
          <View style={s.grupa} testID="do-miski-ciasto">
            {wiersz('scale-item-preferment-all', t('{rodzaj} (cały)', { rodzaj: nazwaZaczynu(p.prefermentType) }), w(b.prefermentTotalWeightGrams))}
            {wiersz('scale-item-flour', t('Mąka'), w(b.doughAddedFlourGrams))}
            {wiersz('scale-item-water', t('Woda'), w(b.doughAddedWaterGrams))}
            {zakwas}
            {wiersz('scale-item-salt', t('Sól'), d(b.doughAddedSaltGrams), `${formatFixed(p.saltPct, 1)}%`)}
            {b.doughYeastGrams > 0 && wiersz('scale-item-yeast', t('Drożdże'), d(b.doughYeastGrams))}
          </View>
        </>
      ) : (
        <>
          <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Do miski (odhaczaj przy ważeniu)')}</Text>
          <View style={s.grupa} testID="do-miski">
            {c.flours.map((f, i) => wiersz(`scale-item-flour-${i}`, nazwaMakiMieszanki(f), w(f.weightGrams), proc(f.percentage)))}
            {wiersz('scale-item-water', t('Woda'), w(c.waterGrams), proc(p.waterPct))}
            {zakwas}
            {wiersz('scale-item-salt', t('Sól'), d(c.saltGrams), `${formatFixed(p.saltPct, 1)}%`)}
            {c.yeastGrams > 0 && wiersz('scale-item-yeast', t('Drożdże'), d(c.yeastGrams), proc(p.yeastPct))}
          </View>
        </>
      )}

      <Text style={s.info} testID="recipe-hydration">
        {b
          ? t('Hydratacja całkowita {n}%: woda z zaczynu jest wliczona.', { n: hydratacja })
          : c.starterGrams > 0
            ? t('Hydratacja całkowita {n}%: woda z zakwasu jest wliczona.', { n: hydratacja })
            : t('Hydratacja całkowita {n}%.', { n: hydratacja })}
      </Text>
      <Text style={[s.info, styles.razem]} testID="recipe-total">
        {t('Razem {masa}', { masa: w(c.targetDoughWeightGrams) })}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  waga: {
    flexWrap: 'nowrap',
    minHeight: theme.cele.glownyPrzeplyw,
  },
  pole: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poleZaznaczone: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  znak: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  masa: {
    marginLeft: 'auto',
  },
  poleRzad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  krok: {
    minWidth: theme.cele.glownyPrzeplyw,
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  krokTekst: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  krokNieaktywny: {
    color: theme.colors.zablokowane,
  },
  ile: {
    minWidth: 48,
    textAlign: 'center',
  },
  razem: {
    fontWeight: '600',
    color: theme.colors.tusz,
  },
});
