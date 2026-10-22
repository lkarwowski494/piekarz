// ============================================================================
// Piekarz — zaplanowane wypieki na „Dziś” (BR-KAL-009, D-108; makieta roli 04 a2-03 w31 „sobota-zaplanowany”
// i „kilka-planow”) [M3 D5]. Bez trwającego wypieku: najbliższy plan na spirali (wariant „plan”, bez znacznika
// postępu) z „{receptura}: gotowe {dzień} o {godzina}”, „Start {dzień} o {godzina}” i „Zobacz plan”; pozostałe plany
// (i wszystkie przy trwającym wypieku) listą pod spiralą: glif spirali, „{dzień} {godzina} {receptura}”, cały wiersz
// otwiera arkusz planu (≥ 44 pt).
// ============================================================================

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PlannedBake } from '../../data/bake-sessions-store';
import { startPlanuAt } from '../../core/plany-wypiekow';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { nazwaReceptury } from '../../lib/nazwa-receptury';
import { dzienSlownie, etykietaPlanuPrzedStartem } from '../../lib/spirala-etykieta';
import { krokiSpiraliZSesji } from '../../lib/spirala-geometria';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Spirala } from '../Spirala';
import { GlifZdarzenia } from '../kalendarz/GlifZdarzenia';

/** Godzina „gotowe” planu: koniec ostatniego kroku; brak zostaje brakiem. */
export const gotowePlanu = (p: PlannedBake): number | null => p.steps[p.steps.length - 1]?.plannedEnd ?? null;

/** „{receptura}: gotowe {dzień} o {godzina}” albo sama nazwa, gdy plan nie ma godziny końca. */
export function tytulPlanu(p: PlannedBake, teraz: number): string {
  const g = gotowePlanu(p);
  const nazwa = nazwaReceptury(p.recipeName);
  return g === null ? nazwa : t('{nazwa}: gotowe {dzien} o {godzina}', { nazwa, dzien: dzienSlownie(new Date(g), new Date(teraz)), godzina: formatTime(g) });
}

/** „Start {dzień} o {godzina}” (klucz z planu wypieku). */
export function startPlanuTekst(p: PlannedBake, teraz: number): string {
  const s = startPlanuAt(p);
  return t('Start {dzien} o {godzina}', { dzien: dzienSlownie(new Date(s), new Date(teraz)), godzina: formatTime(s) });
}

function NaSpirali({ p, teraz, duzyTekst, onZobacz }: { p: PlannedBake; teraz: number; duzyTekst: boolean; onZobacz: (id: string) => void }) {
  const kroki = useMemo(() => krokiSpiraliZSesji(p.steps), [p.steps]);
  const g = gotowePlanu(p);
  const etykieta = etykietaPlanuPrzedStartem({ liczbaKrokow: p.steps.length, gotowe: g === null ? null : new Date(g), teraz: new Date(teraz) });
  return (
    <View style={styles.jeden} testID="start-plan-spirala">
      <Spirala kroki={kroki} wariant="plan" etykieta={etykieta} rozmiar={duzyTekst ? 150 : 220} />
      <Text style={styles.tytul}>{tytulPlanu(p, teraz)}</Text>
      <Text style={styles.objasnienie}>{startPlanuTekst(p, teraz)}</Text>
      <Pressable testID={`plan-zobacz-${p.id}`} accessibilityRole="button" accessibilityLabel={t('Zobacz plan')} style={styles.drugi} onPress={() => onZobacz(p.id)}>
        <Text style={styles.drugiTekst}>{t('Zobacz plan')}</Text>
      </Pressable>
    </View>
  );
}

function Wiersz({ p, teraz, onZobacz }: { p: PlannedBake; teraz: number; onZobacz: (id: string) => void }) {
  const g = gotowePlanu(p) ?? startPlanuAt(p);
  const tekst = t('{kiedy} {h} {co}', { kiedy: dzienSlownie(new Date(g), new Date(teraz)), h: formatTime(g), co: nazwaReceptury(p.recipeName) });
  return (
    <Pressable testID={`plan-wiersz-${p.id}`} accessibilityRole="button" accessibilityLabel={tekst} style={styles.wiersz} onPress={() => onZobacz(p.id)}>
      <GlifZdarzenia glif="plan" kolor={theme.colors.nocDane} rozmiar={14} />
      <Text style={styles.wierszTekst}>{tekst}</Text>
    </Pressable>
  );
}

export function PlanyWypiekow({ plany, teraz, naSpirali, duzyTekst, onZobacz }: {
  plany: readonly PlannedBake[];
  teraz: number;
  /** Nic nie trwa: najbliższy plan na spirali zamiast pustej spirali. */
  naSpirali: boolean;
  duzyTekst: boolean;
  onZobacz: (id: string) => void;
}) {
  const [pierwszy, ...reszta] = plany;
  if (!pierwszy) return null;
  const lista = naSpirali ? reszta : plany;
  return (
    <View style={styles.plany}>
      {naSpirali && <NaSpirali p={pierwszy} teraz={teraz} duzyTekst={duzyTekst} onZobacz={onZobacz} />}
      {lista.length > 0 && (
        <View style={styles.lista} testID="start-plany" accessibilityLabel={t('Zaplanowane wypieki')}>
          {lista.map((p) => <Wiersz key={p.id} p={p} teraz={teraz} onZobacz={onZobacz} />)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plany: { gap: odstepy.m },
  jeden: { alignItems: 'center', gap: odstepy.xs },
  tytul: { get fontFamily() { return theme.typography.krojTytulow; }, fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.tusz, textAlign: 'center', marginTop: odstepy.s },
  objasnienie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2, textAlign: 'center' },
  drugi: { alignSelf: 'stretch', minHeight: theme.cele.pozostale, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m, paddingVertical: odstepy.xs, marginTop: odstepy.m },
  drugiTekst: { fontSize: typografia.style.naglowek.pt, color: theme.colors.tusz, textAlign: 'center' },
  lista: { borderRadius: promienie.grupa, backgroundColor: theme.colors.powierzchnia, paddingHorizontal: odstepy.m },
  wiersz: { flexDirection: 'row', alignItems: 'center', gap: odstepy.s, minHeight: theme.cele.pozostale, paddingVertical: odstepy.s, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.linia },
  wierszTekst: { flexShrink: 1, fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
});
