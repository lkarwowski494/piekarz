// ============================================================================
// Piekarz — komponent systemu „Wybór czynności” jako kafel „Dziś” 3+1 (D-105; makieta roli 04 `a2-03`, kafle obok
// siebie, przy AX5 pod sobą; design-spec §4) [M3 D4b; wcześniej wiersz listy, M1-audytor-generalny-101]:
// ikona nad nazwą, bez zdania (zdanie w VoiceOver jako podpowiedź i na następnym ekranie, makieta a2); bez kłódki:
// trzy czynności są w Basic (D-112, D-113). Cel dotyku: cały kafel, ≥ 44 pt; nazwa się zawija, nigdy nie ucina
// (najdłuższy język przy 320 pt: pomiar roli 04 `pomiar-kafli-320.txt`, 88 × 146 pt).
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import type { CzynnoscStartu } from '../../lib/start-stan';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { IkonaStartu, type NazwaIkonyStartu } from './IkonaStartu';

const OPIS: Record<CzynnoscStartu, { ikona: NazwaIkonyStartu; nazwa: () => string; zdanie: () => string }> = {
  'zakladam-zakwas': {
    ikona: 'sloik',
    nazwa: () => t('Zakładam zakwas'),
    zdanie: () => t('Od mąki i wody do pierwszego bochenka, dzień po dniu.'),
  },
  'pieke-na-zakwasie': {
    ikona: 'bochenek',
    nazwa: () => t('Piekę na zakwasie'),
    zdanie: () => t('Mam zakwas. Wybieram recepturę i godzinę, o której chleb ma być gotowy.'),
  },
  'pieke-na-drozdzach': {
    ikona: 'pizza',
    nazwa: () => t('Piekę na drożdżach albo pizzę'),
    zdanie: () => t('Chleb drożdżowy, zaczyn poolish albo biga, ciasto na pizzę.'),
  },
};

export function WyborCzynnosci({ czynnosc, duzyTekst, onPress }: {
  czynnosc: CzynnoscStartu;
  /** AX1–AX5: kafle pod sobą, ikona obok nazwy. */
  duzyTekst: boolean;
  onPress: () => void;
}) {
  const o = OPIS[czynnosc];
  return (
    <Pressable
      testID={`start-${czynnosc}`}
      accessibilityRole="button"
      accessibilityLabel={o.nazwa()}
      accessibilityHint={o.zdanie()}
      style={[styles.kafel, duzyTekst && styles.kafelDuzy]}
      onPress={onPress}
    >
      <IkonaStartu nazwa={o.ikona} kolor={theme.colors.ratan} />
      <View style={[styles.opis, duzyTekst && styles.opisDuzy]}>
        <Text style={[styles.nazwa, duzyTekst && styles.nazwaDuza]}>{o.nazwa()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kafel: {
    flex: 1,
    minWidth: 0,
    minHeight: theme.cele.pozostale,
    alignItems: 'center',
    gap: odstepy.s,
    paddingVertical: odstepy.l,
    paddingHorizontal: odstepy.xs,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.powierzchnia,
  },
  kafelDuzy: { flex: 0, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: odstepy.l, gap: odstepy.m },
  opis: { alignItems: 'center', gap: odstepy.xs, minWidth: 0 },
  opisDuzy: { flex: 1, alignItems: 'flex-start' },
  nazwa: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz, textAlign: 'center' },
  nazwaDuza: { textAlign: 'left' },
});
