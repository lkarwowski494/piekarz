// ============================================================================
// Piekarz — pas „Dziś” w kolorze nocy do samej góry ekranu (D-105, wariant 3+1; makieta roli 04 `a2-03` w31) [M3 D4b]
// Zastępuje natywny duży tytuł: „Co dziś robisz?”, data, pasek tygodnia, „Następne” jednym zdaniem i zaległe
// z „Zrobione”/„Pomiń”; zębatka Ustawień w prawym górnym rogu (D-051 2a). Pusty kalendarz: pasek z adnotacją bez
// linii „Następne” (D-105, BR-KAL-003 „Brak przyszłych zdarzeń”). Tło `pas` w obu motywach, tekst naPasie/naPasie2.
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import type { TekstyNastepne, OpcjeTekstu } from '../../lib/kalendarz-teksty';
import type { ZdarzenieKalendarza } from '../../core/kalendarz-zdarzenia';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { PrzyciskNaglowka } from '../nawigacja/PrzyciskNaglowka';
import { IkonaStartu } from './IkonaStartu';
import { PasekTygodnia, type PasekTygodniaProps } from '../kalendarz/PasekTygodnia';
import { LiniaNastepne, type AkcjeZaleglego } from '../kalendarz/LiniaNastepne';
import { LiniaPiekarnika } from '../kalendarz/LiniaPiekarnika';
import { NawigacjaKalendarza } from '../kalendarz/NawigacjaKalendarza';
import { MiesiacKalendarza, type MiesiacKalendarzaProps } from '../kalendarz/MiesiacKalendarza';
import type { NawigacjaWidoku } from '../../hooks/useKalendarz';

export function PasDzis({ gora, data, pasek, widok, miesiac, pusty, teksty, zalegle, o, akcje, onPlus, onUstawienia }: {
  /** Wysokość paska stanu (safe area): pas sięga do samej góry, treść pod paskiem stanu. */
  gora: number;
  data: string;
  pasek: PasekTygodniaProps;
  widok: NawigacjaWidoku;
  /** Widok miesiąca (tryb „miesiąc”), inaczej null i pasek tygodnia. */
  miesiac: MiesiacKalendarzaProps | null;
  pusty: boolean;
  teksty: TekstyNastepne;
  zalegle: readonly ZdarzenieKalendarza[];
  o: OpcjeTekstu;
  akcje: AkcjeZaleglego;
  onPlus: () => void;
  onUstawienia: () => void;
}) {
  return (
    <View style={[styles.pas, { paddingTop: gora + odstepy.xs }]} testID="pas-dzis">
      <View style={styles.gora}>
        <PrzyciskNaglowka
          testID="open-settings-btn"
          etykieta={t('Ustawienia')}
          ikona={<IkonaStartu nazwa="ustawienia" kolor={theme.colors.naPasie} rozmiar={24} />}
          onPress={onUstawienia}
        />
      </View>
      <Text style={styles.tytul} accessibilityRole="header">{t('Co dziś robisz?')}</Text>
      <Text style={styles.data}>{data}</Text>
      {/* Tydzień albo miesiąc z nawigacją i gestem (BR-KAL-008, BR-KAL-013) [M3 D7] */}
      <NawigacjaKalendarza widok={widok}>
        {miesiac ? <MiesiacKalendarza {...miesiac} /> : <PasekTygodnia {...pasek} />}
      </NawigacjaKalendarza>
      {/* Najbliższy dzień z zajętym piekarnikiem (BR-KAL-016, makieta `piekarnik-3-kalendarz`) [M3 D6] */}
      <LiniaPiekarnika zdarzenia={pasek.zdarzenia} now={pasek.now} />
      {pusty ? (
        <View style={styles.adnotacja} testID="pas-pusty">
          <Text style={styles.adnotacjaTytul}>{t('Nic nie mamy w planach')}</Text>
          <Text style={styles.adnotacjaTekst}>{t('Kalendarz jest pusty. Zapełni się, gdy założysz zakwas albo zaplanujesz wypiek.')}</Text>
        </View>
      ) : (
        <LiniaNastepne teksty={teksty} zalegle={zalegle} o={o} akcje={akcje} onPlus={onPlus} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pas: {
    backgroundColor: theme.colors.pas,
    paddingHorizontal: odstepy.l,
    paddingBottom: odstepy.l,
    gap: odstepy.s,
    borderBottomLeftRadius: promienie.przyciskGlowny,
    borderBottomRightRadius: promienie.przyciskGlowny,
  },
  gora: { flexDirection: 'row', justifyContent: 'flex-end', marginRight: -odstepy.s },
  tytul: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytulDuzy.pt,
    fontWeight: '700',
    color: theme.colors.naPasie,
  },
  data: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie2, marginTop: -odstepy.xs },
  adnotacja: { gap: odstepy.xs, marginTop: odstepy.xs },
  adnotacjaTytul: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naPasie },
  adnotacjaTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie2 },
});
