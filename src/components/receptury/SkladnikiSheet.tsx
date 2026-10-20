// ============================================================================
// Piekarz — arkusz „Składniki” z akcji „Zmień składniki” (design-spec §11c „106”, stan `skladniki-pelne`
// w docs/design/ekrany/kalkulator.html): „Ilości liczę od” (bochenków / masy mąki) → „Mąki (razem 100%)”
// z „Dodaj mąkę” i „Wstaw gotową mieszankę” (menu systemowe) → „Proporcje (procent mąki)” (pola NumInput,
// przecinek i kropka) → „Zaczyn” (rodzaj i mąka w zaczynie z menu systemowego). Zastępuje akordeon
// „Parametry Rzemieślnicze & Mąki”, przełącznik trybu z karty „Do miski” i edytor mieszanki mąk.
// Arkusz systemowy pageSheet, „Gotowe” w pasku arkusza. [M1-audytor-generalny-106; 04-studio-projektowe-022]
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { nazwaMaki } from '../../lib/nazwa-maki';
import { POPULAR_FLOUR_BLENDS, FlourItemInput, HydrationDifficultyInfo } from '../../core/domain-rules';
import { FLOUR_PROFILES, BlendAbsorptionAnalysis, validateFlourBlend } from '../../core/flour-atlas';
import type { PrefermentBreakdownResult, PrefermentType } from '../../core/preferments';
import { NumInput } from '../NumInput';
import { HeaderButton } from '../DraftHeader';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';
import { nazwaZaczynu, ZACZYNY_W_MENU, PROCENTY_MAKI_W_ZACZYNIE } from './nazwy-receptur';
import { pokazMenuWyboru } from './stos-receptur';
import { s } from './style-receptur';

export interface SkladnikiSheetProps {
  visible: boolean;
  onClose: () => void;
  calcMode: 'loaves' | 'flour';
  onCalcModeChange: (m: 'loaves' | 'flour') => void;
  flourBlend: FlourItemInput[];
  onFlourBlendChange: (b: FlourItemInput[]) => void;
  waterPct: number;
  onWaterPctChange: (n: number) => void;
  starterPct: number;
  onStarterPctChange: (n: number) => void;
  starterHydration: number;
  onStarterHydrationChange: (n: number) => void;
  saltPct: number;
  onSaltPctChange: (n: number) => void;
  yeastPct: number;
  onYeastPctChange: (n: number) => void;
  prefermentType: PrefermentType;
  onPrefermentTypeChange: (p: PrefermentType) => void;
  prefermentFlourPct: number;
  onPrefermentFlourPctChange: (n: number) => void;
  prefermentBreakdown: PrefermentBreakdownResult | null;
  hydrationDifficulty?: HydrationDifficultyInfo;
  blendAbsorption?: BlendAbsorptionAnalysis;
  /** Wejścia PÓŹNIEJ (F-30 spiżarnia, F-46 odpowiedniki mąk): widoczne tylko, gdy wróci ich wejście (wejscia-pozniej.ts). */
  onOpenInventory?: () => void;
  onOpenEquivalents?: () => void;
}

function PoleProcentu({ id, etykieta, wartosc, min, max, onChange, ostatnie }: { id: string; etykieta: string; wartosc: number; min: number; max: number; onChange: (n: number) => void; ostatnie?: boolean }) {
  return (
    <View style={[s.kom, ostatnie && s.komOstatnia]}>
      <Text style={[s.etykieta, s.roz]}>{etykieta}</Text>
      <View style={styles.poleRzad}>
        <NumInput testID={id} accessibilityLabel={etykieta} value={wartosc} unit="%" min={min} max={max} onChangeNumber={onChange} style={s.pole} />
        <Text style={s.wartosc}>%</Text>
      </View>
    </View>
  );
}

function WierszMenu({ id, etykieta, wartosc, onPress, akcja }: { id: string; etykieta: string; wartosc?: string; onPress: () => void; akcja?: boolean }) {
  return (
    <Pressable testID={id} accessibilityRole="button" accessibilityLabel={wartosc ? `${etykieta}: ${wartosc}` : etykieta} style={[s.kom, styles.wiersz]} onPress={onPress}>
      <Text style={[akcja ? s.akcja : s.etykieta, s.roz]}>{etykieta}</Text>
      {wartosc !== undefined && <Text style={s.wartosc}>{wartosc}</Text>}
      <Text style={s.szewron} accessible={false}>›</Text>
    </Pressable>
  );
}

export function SkladnikiSheet(p: SkladnikiSheetProps) {
  // Szkic mąk: rachunek przyjmuje tylko mieszankę o sumie 100% (jak dawny edytor mieszanki), więc receptura
  // dostaje mąki dopiero, gdy suma się zgadza; do tego czasu informacja pod listą
  const [szkic, setSzkic] = useState<FlourItemInput[]>(p.flourBlend);
  const { visible, flourBlend, onFlourBlendChange } = p;
  useEffect(() => {
    if (visible) setSzkic(flourBlend);
  }, [visible, flourBlend]);
  const suma = szkic.reduce((acc, f) => acc + f.percentage, 0);
  const ustawMaki = (nowe: FlourItemInput[]) => {
    setSzkic(nowe);
    if (validateFlourBlend(nowe).isValid) onFlourBlendChange(nowe);
  };

  const zmienMake = (i: number, pct: number) => {
    const bez = pct <= 0 && szkic.length > 1;
    ustawMaki(bez ? szkic.filter((_, j) => j !== i) : szkic.map((f, j) => (j === i ? { ...f, percentage: pct } : f)));
  };

  const dodajMake = () => {
    const wolne = FLOUR_PROFILES.filter((f) => !szkic.some((b) => b.name === f.namePl || b.type === f.id));
    pokazMenuWyboru(t('Dodaj mąkę'), wolne.map((f) => nazwaMaki(f)), (i) => {
      const f = wolne[i];
      const reszta = Math.round((100 - suma) * 10) / 10;
      ustawMaki([...szkic, { name: f.namePl, percentage: reszta > 0 ? reszta : 10, type: f.id }]);
    });
  };

  const wstawMieszanke = () =>
    pokazMenuWyboru(t('Wstaw gotową mieszankę'), POPULAR_FLOUR_BLENDS.map((b) => t(b.namePl)), (i) =>
      ustawMaki(POPULAR_FLOUR_BLENDS[i].flours.map((f) => ({ ...f })))
    );

  const wybierzZaczyn = () =>
    pokazMenuWyboru(t('Zaczyn'), ZACZYNY_W_MENU.map(nazwaZaczynu), (i) => p.onPrefermentTypeChange(ZACZYNY_W_MENU[i]));

  const wybierzMakeZaczynu = () =>
    pokazMenuWyboru(t('Mąka w zaczynie'), PROCENTY_MAKI_W_ZACZYNIE.map((n) => `${n} %`), (i) => p.onPrefermentFlourPctChange(PROCENTY_MAKI_W_ZACZYNIE[i]));

  const tryb = (m: 'loaves' | 'flour', id: string, etykieta: string) => {
    const wyb = p.calcMode === m;
    return (
      <Pressable testID={id} accessibilityRole="radio" accessibilityState={{ checked: wyb, selected: wyb }} style={[styles.segment, wyb && styles.segmentWybrany]} onPress={() => p.onCalcModeChange(m)}>
        <Text style={[s.chipTekst, wyb && styles.segmentTekstWybrany]}>{etykieta}</Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={p.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={p.onClose}>
      <SafeAreaView style={s.ekran} edges={['top', 'bottom', 'left', 'right']}>
        <View style={s.ekran} testID="ingredients-sheet">
          <View style={styles.pasek}>
            <Text style={styles.tytul} accessibilityRole="header">{t('Składniki')}</Text>
            <HeaderButton testID="ingredients-done-btn" title={t('Gotowe')} onPress={p.onClose} />
          </View>
          <ScrollView contentContainerStyle={s.tresc} keyboardShouldPersistTaps="handled">
            <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Ilości liczę od')}</Text>
            <View style={styles.segmenty} accessibilityRole="radiogroup">
              {tryb('loaves', 'calc-mode-loaves', t('bochenków'))}
              {tryb('flour', 'calc-mode-flour', t('masy mąki'))}
            </View>

            <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Mąki (razem 100%)')}</Text>
            <View style={s.grupa}>
              {szkic.map((f, i) => (
                <PoleProcentu key={`${f.name}-${i}`} id={`flour-pct-input-${i}`} etykieta={t(f.name)} wartosc={f.percentage} min={0} max={100} onChange={(n) => zmienMake(i, n)} />
              ))}
              <WierszMenu id="add-flour-btn" etykieta={t('Dodaj mąkę')} onPress={dodajMake} akcja />
              <WierszMenu id="flour-blend-menu-btn" etykieta={t('Wstaw gotową mieszankę')} onPress={wstawMieszanke} akcja />
              {p.onOpenInventory && wejscieWidoczne('spizarnia') && (
                <WierszMenu id="open-flour-inventory-btn" etykieta={t('Spiżarnia mąk & Stan zapasów')} onPress={p.onOpenInventory} akcja />
              )}
              {p.onOpenEquivalents && wejscieWidoczne('slownik-mak') && (
                <WierszMenu id="open-flour-equivalents-btn" etykieta={t('Słownik Odpowiedników Mąk')} onPress={p.onOpenEquivalents} akcja />
              )}
            </View>
            {!validateFlourBlend(szkic).isValid && <Text style={s.info} testID="flour-sum-warning">{t('Dostosuj udział mąk. Suma musi wynosić dokładnie 100%.')}</Text>}
            {p.blendAbsorption && <Text style={s.info}>{t(p.blendAbsorption.doughFeelAdvicePl)}</Text>}

            <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Proporcje (procent mąki)')}</Text>
            <View style={s.grupa}>
              <PoleProcentu id="water-pct-input" etykieta={t('Woda')} wartosc={p.waterPct} min={0} max={150} onChange={p.onWaterPctChange} />
              <PoleProcentu id="starter-pct-input" etykieta={t('Zakwas')} wartosc={p.starterPct} min={0} max={100} onChange={p.onStarterPctChange} />
              {p.starterPct > 0 && (
                <PoleProcentu id="starter-hydration-input" etykieta={t('Hydratacja zakwasu')} wartosc={p.starterHydration} min={20} max={200} onChange={p.onStarterHydrationChange} />
              )}
              <PoleProcentu id="salt-pct-input" etykieta={t('Sól')} wartosc={p.saltPct} min={0} max={10} onChange={p.onSaltPctChange} />
              <PoleProcentu id="yeast-pct-input" etykieta={t('Drożdże')} wartosc={p.yeastPct} min={0} max={5} onChange={p.onYeastPctChange} ostatnie />
            </View>
            {p.hydrationDifficulty && (
              <Text style={s.info}>{`${t(p.hydrationDifficulty.labelPl)}. ${t(p.hydrationDifficulty.tipPl)}`}</Text>
            )}

            <Text style={s.naglowekGrupy} accessibilityRole="header">{t('Zaczyn')}</Text>
            <View style={s.grupa}>
              <WierszMenu id="preferment-type-btn" etykieta={t('Rodzaj')} wartosc={nazwaZaczynu(p.prefermentType)} onPress={wybierzZaczyn} />
              {p.prefermentType !== 'direct' && (
                <WierszMenu id="preferment-flour-btn" etykieta={t('Mąka w zaczynie')} wartosc={`${p.prefermentFlourPct} %`} onPress={wybierzMakeZaczynu} />
              )}
            </View>
            <Text style={s.info}>
              {p.prefermentBreakdown
                ? t(p.prefermentBreakdown.fermentationTipPl)
                : t('Z zaczynem (poolish, biga, stare ciasto, levain) wybierzesz, ile mąki idzie do zaczynu; „Do miski” pokaże zaczyn i ciasto osobno.')}
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wiersz: {
    minHeight: theme.cele.glownyPrzeplyw,
  },
  pasek: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
  },
  tytul: {
    flex: 1,
    fontFamily: theme.typography.krojTytulow,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  poleRzad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  segmenty: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    padding: 3,
    borderRadius: 12,
    backgroundColor: theme.colors.tloGrupa,
  },
  segment: {
    flexGrow: 1,
    flexBasis: 120,
    minHeight: theme.cele.pozostale,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentWybrany: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  segmentTekstWybrany: {
    fontWeight: '600',
  },
});
