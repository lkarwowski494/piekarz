// ============================================================================
// Piekarz — komponent systemu „Wybór czynności” (design-spec §4): wiersz startu z ikoną, nazwą i jednym
// zdaniem; w stanie „tylko historia” zdanie zastępuje kłódka z tekstem (F-67). Makieta: ekrany/start.html
// (.wybor: min. 72 pt, odstęp 14, padding 12/16, linia między wierszami). [M1-audytor-generalny-101]
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import type { CzynnoscStartu } from '../../lib/start-stan';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
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

export function WyborCzynnosci({ czynnosc, zdanie, zablokowane, ostatni, onPress }: {
  czynnosc: CzynnoscStartu;
  /** Pokazać zdanie pod nazwą (pierwsze uruchomienie). */
  zdanie: boolean;
  /** Stan „tylko historia”: kłódka i „wymaga Piekarz Pro” zamiast zdania. */
  zablokowane: boolean;
  ostatni: boolean;
  onPress: () => void;
}) {
  const o = OPIS[czynnosc];
  const podpowiedz = zablokowane ? t('wymaga Piekarz Pro') : zdanie ? o.zdanie() : undefined;
  return (
    <Pressable
      testID={`start-${czynnosc}`}
      accessibilityRole="button"
      accessibilityLabel={o.nazwa()}
      accessibilityHint={podpowiedz}
      style={[styles.wiersz, !ostatni && styles.linia]}
      onPress={onPress}
    >
      <IkonaStartu nazwa={o.ikona} kolor={theme.colors.akcentTekst} />
      <View style={styles.rozmiar}>
        <Text style={styles.nazwa}>{o.nazwa()}</Text>
        {zablokowane ? (
          <View style={styles.zamek}>
            <IkonaStartu nazwa="zamek" kolor={theme.colors.zablokowane} rozmiar={20} />
            <Text style={styles.zamekTekst}>{t('wymaga Piekarz Pro')}</Text>
          </View>
        ) : zdanie ? (
          <Text style={styles.zdanie}>{o.zdanie()}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wiersz: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: odstepy.m,
    minHeight: 72,
    paddingVertical: odstepy.m,
    paddingHorizontal: odstepy.l,
  },
  linia: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.linia },
  rozmiar: { flex: 1, minWidth: 0, gap: 2 },
  nazwa: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  zdanie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  zamek: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  zamekTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.zablokowane },
});
