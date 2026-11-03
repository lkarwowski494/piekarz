// ============================================================================
// Apps4Craft Studio — StarterFeedingCard Component
// Sourdough starter feeding calculator with ratios and ingredient weights.
// 100% Offline-First.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NumInput } from '../NumInput';
import { dokarmienieZeZostawionego } from '../../core/dokarmianie';
import { theme } from '../../ui/theme';
import { t, tPlural } from '../../lib/i18n';
import { formatWeight, formatTemperature, UnitSystem } from '../../lib/unit-converter';

import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Karta } from '../../ui/karty/Karta';
import { WierszKarty } from '../../ui/karty/WierszKarty';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';

/** Części proporcji karmienia z formą liczby (EN: 1 part, 2 parts) [M1-audytor-generalny-074]. */
const CZESCI = { one: '{n} cz.', few: '{n} cz.', many: '{n} cz.', other: '{n} cz.' };

export interface StarterFeedingCardProps {
  selectedRatio: [number, number, number];
  onSelectRatio: (ratio: [number, number, number]) => void;
  targetYield: number;
  onTargetYieldChange: (y: number) => void;
  feeding: {
    starterGrams: number;
    flourGrams: number;
    waterGrams: number;
  };
  /** Hydratacja zakwasu (%) do wyniku z masy zostawionej w słoiku (BR-ZAKW-002). */
  hydratacjaZakwasu: number;
  unitSystem: UnitSystem;
  onCopyFeeding: () => void;
}

export function StarterFeedingCard({
  selectedRatio,
  onSelectRatio,
  targetYield,
  onTargetYieldChange,
  feeding,
  hydratacjaZakwasu,
  unitSystem,
  onCopyFeeding,
}: StarterFeedingCardProps) {
  // Masa zakwasu zostawionego w słoiku (g): z niej mąka, woda i hydratacja po dokarmieniu (RD-14, BR-ZAKW-002)
  // [M1-audytor-generalny-130]; puste pole = prośba o uzupełnienie, wynik z chipów masy zakwasu do ciasta zostaje
  const [zostawiam, setZostawiam] = useState<number | null>(null);
  const zZostawionego = zostawiam === null ? null : dokarmienieZeZostawionego(zostawiam, selectedRatio, hydratacjaZakwasu);
  // Chipy na karcie zawijane; przy dużym tekście każdy chip na całą szerokość (flexBasis od fontScale, README §7a) [M3 p2]
  const chipSzer = { flexBasis: useDuzyTekst() ? '100%' : 'auto' } as const;
  const chipTekst = (wyb: boolean) => [styles.chipTekst, wyb && styles.chipTekstWybrany];
  // Karta systemu kart, jeden krój nagłówka (karty/README.md §2, §4; makieta zakwasy.html) [M3 p2]
  return (
    <Karta testID="karta-dokarmianie" tytul={t('Ilości do dokarmienia')} ikona={<IkonaKarty nazwa="waga" />}>
      <Text style={styles.podpis}>
        {t('Wybierz proporcję i ile zakwasu potrzebujesz do ciasta. Policzę mąkę i wodę.')}
      </Text>

      <Text style={styles.subHeading}>{t('Zostawiam w słoiku')}</Text>
      <NumInput
        testID="zostawiam-input"
        accessibilityLabel={t('Zostawiam w słoiku')}
        unit="g"
        min={0}
        value={zostawiam ?? ''}
        onChangeText={(tekst) => {
          const n = Number(tekst.replace(',', '.'));
          setZostawiam(tekst.trim() === '' || !Number.isFinite(n) ? null : n);
        }}
      />
      {zZostawionego ? (
        <View testID="zostawiam-wynik" style={styles.zostawiamWynik}>
          <Text style={styles.wynikTekst}>{t('Mąka')}: {formatWeight(zZostawionego.makaG, unitSystem)}</Text>
          <Text style={styles.wynikTekst}>{t('Woda')}: {formatWeight(zZostawionego.wodaG, unitSystem)}</Text>
          <Text style={styles.wynikTekst}>{t('Hydratacja zakwasu {n}%', { n: zZostawionego.hydratacjaPct })}</Text>
        </View>
      ) : (
        <Text style={styles.wskazowka}>{t('Wpisz, ile zakwasu zostawiasz w słoiku.')}</Text>
      )}

      {/* Ratio Selector */}
      <Text style={styles.subHeading}>{t('Cykl dokarmiania')} ({t('Proporcja')})</Text>
      <View style={styles.chipy}>
        {[
          { ratio: [1, 1, 1] as [number, number, number], label: t('1:1:1 (szybki, 3–4 h)') },
          { ratio: [1, 2, 2] as [number, number, number], label: t('1:2:2 (klasyczny, 6–8 h)') },
          { ratio: [1, 3, 3] as [number, number, number], label: '1:3:3 (8–10 h)' },
          { ratio: [1, 5, 5] as [number, number, number], label: t('1:5:5 (na noc, 12 h)') },
        ].map((item, idx) => {
          const isSelected =
            selectedRatio[0] === item.ratio[0] &&
            selectedRatio[1] === item.ratio[1] &&
            selectedRatio[2] === item.ratio[2];
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
              key={idx}
              onPress={() => onSelectRatio(item.ratio)}
              style={[styles.chip, chipSzer, isSelected && styles.chipWybrany]}
            >
              <Text style={chipTekst(isSelected)}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Yield Amount Selector */}
      <Text style={styles.subHeading}>
        {t('Potrzebny zakwas')}: {formatWeight(targetYield, unitSystem)}
      </Text>
      <View style={styles.chipy}>
        {[100, 150, 200, 250, 300].map((y) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: targetYield === y }}
            key={y}
            onPress={() => onTargetYieldChange(y)}
            style={[styles.chip, chipSzer, targetYield === y && styles.chipWybrany]}
          >
            <Text style={chipTekst(targetYield === y)}>{formatWeight(y, unitSystem)}</Text>
          </Pressable>
        ))}
      </View>

      {/* Wynik jako wiersze w grupie karty (makieta: Zostawiam / Mąka / Woda z wartością 17 pt) [M3 p2] */}
      <View style={styles.grupa} testID="dokarmianie-wynik">
        <WierszKarty testID="dokarmianie-zakwas" etykieta={t('Stary zakwas')} wartosc={formatWeight(feeding.starterGrams, unitSystem)}
          podpis={tPlural(selectedRatio[0], CZESCI)} linia={false} />
        <WierszKarty testID="dokarmianie-maka" etykieta={t('Mąka')} wartosc={formatWeight(feeding.flourGrams, unitSystem)}
          podpis={tPlural(selectedRatio[1], CZESCI)} />
        <WierszKarty testID="dokarmianie-woda" etykieta={`${t('Woda')} (~${formatTemperature(28, unitSystem)})`} wartosc={formatWeight(feeding.waterGrams, unitSystem)}
          podpis={tPlural(selectedRatio[2], CZESCI)} />
      </View>
      <Text style={styles.wskazowka}>
        {t('Wskazówka: Z powstałych {masa} pobierz wymaganą ilość do ciasta, a resztkę (~{od}–{do}) schowaj do lodówki jako matkę na kolejny wypiek.', {
          masa: formatWeight(targetYield, unitSystem),
          od: formatWeight(20, unitSystem),
          do: formatWeight(25, unitSystem),
        })}
      </Text>

      <Pressable
        accessibilityRole="button"
        testID="copy-feeding-btn"
        style={styles.copyFeedingBtn}
        onPress={onCopyFeeding}
      >
        <Text style={styles.copyFeedingBtnText}>
          {t('Kopiuj jako tekst')}
        </Text>
      </Pressable>

      {/* Przelicznik hydratacji i wylewki: Basic, poza kartą proporcji (NarzedziaZakwasu) [M3 P-b2] */}
    </Karta>
  );
}

const styles = StyleSheet.create({
  podpis: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  subHeading: { get fontFamily() { return theme.typography.krojTytulow; }, fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz },
  chipy: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s },
  // Chip na karcie jak chip pasa: promień `chip`, obwódka, wybrany `akcent` (karty/README.md §2) [M3 p2]
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.xs,
    borderRadius: promienie.chip,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    maxWidth: '100%',
  },
  chipWybrany: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  chipTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz, textAlign: 'center' },
  chipTekstWybrany: { color: theme.colors.naAkcencie, fontWeight: '600' },
  // Grupa w karcie: obwódka `linia`, promień `grupa` 12 (hierarchia promieni, karty/README.md §2)
  grupa: { borderWidth: 1, borderColor: theme.colors.linia, borderRadius: promienie.grupa, overflow: 'hidden' },
  zostawiamWynik: { gap: 2 },
  wynikTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz },
  wskazowka: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  copyFeedingBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingVertical: odstepy.s,
    paddingHorizontal: odstepy.l,
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    alignItems: 'center',
  },
  copyFeedingBtnText: { fontSize: typografia.style.objasnienie.pt, fontWeight: '700', color: theme.colors.akcentTekst, textAlign: 'center' },
});
