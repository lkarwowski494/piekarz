// ============================================================================
// Piekarz — nawigacja kalendarza na pasie „Dziś” (BR-KAL-008, BR-KAL-013; makiety roli 04 a2 `101-przewijanie`
// i `12-miesiac`; D-114) [M3 D7]. Wiersz „‹ okres Dziś › [Miesiąc]” (strzałki 44 × 44 pt, „Dziś” tylko poza
// bieżącym okresem; przycisk „Miesiąc”/„Tydzień” w wierszu zamiast segmentu, PRZ-18 b), a pod nim obszar gestu: przesunięcie palcem w bok zmienia okres
// (kierunekGestu). Gest nie przejmuje dotyku (onTouchStart/End), więc dni paska zostają przyciskami.
// Kolory tylko z tokenów pasa (naPasie, naPasie2, pas).
// ============================================================================

import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NawigacjaWidoku } from '../../hooks/useKalendarz';
import { t } from '../../lib/i18n';
import { kierunekGestu, type TrybWidoku } from '../../lib/kalendarz-widok';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { IkonaStartu } from '../start/IkonaStartu';
import { OznaczeniePro } from '../OznaczeniePro';
import { etykietaPro } from '../../lib/platnosci/nazwy-pro';

/** Próg dużego tekstu jak na „Dziś” (`app/(tabs)/(dzis)/index.tsx`, DUZY_TEKST). */
const DUZY_TEKST = 2;

const TRYBY: readonly { tryb: TrybWidoku; tekst: () => string }[] = [
  { tryb: 'tydzien', tekst: () => t('Tydzień') },
  { tryb: 'miesiac', tekst: () => t('Miesiąc') },
];

export function NawigacjaKalendarza({ widok, children }: { widok: NawigacjaWidoku; children: React.ReactNode }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const tydzien = widok.tryb === 'tydzien';
  // PRZ-18 (b, D-118): jeden przycisk w wierszu okresu przełącza na drugi widok; „Pro” tylko przy wejściu w Miesiąc bez Pro
  const inny = TRYBY[tydzien ? 1 : 0]!;
  const pro = tydzien && widok.miesiacPro === true;
  // Duży tekst (próg 2 jak kafle „Dziś”): „Dziś” i „Miesiąc” w osobnym, zawijanym rzędzie pod „‹ okres ›”, żeby
  // przy AX5 i 320 pt „›” i „Miesiąc” zostały na ekranie [04-studio-projektowe-004]
  const duzy = useWindowDimensions().fontScale >= DUZY_TEKST;
  const styl = duzy ? [styles.dzis, styles.dzisZwezany] : styles.dzis;
  const dzis = !widok.biezacy && (
    <Pressable testID="kalendarz-dzis" accessibilityRole="button" style={styl} onPress={widok.dzis}>
      <Text style={styles.dzisTekst}>{t('Dziś')}</Text>
    </Pressable>
  );
  const nastepny = (
    <Pressable testID="kalendarz-nastepny" accessibilityRole="button" accessibilityLabel={tydzien ? t('Następny tydzień') : t('Następny miesiąc')}
      style={styles.strzalka} onPress={() => widok.przesun(1)}>
      <IkonaStartu nazwa="dalej" kolor={theme.colors.naPasie} rozmiar={22} />
    </Pressable>
  );
  const tryb = (
    <Pressable testID={`kalendarz-tryb-${inny.tryb}`} accessibilityRole="button" accessibilityLabel={etykietaPro(inny.tekst(), !pro)}
      style={styl} onPress={() => widok.ustawTryb(inny.tryb)}>
      <Text style={styles.dzisTekst}>{inny.tekst()}</Text>
      {pro && <OznaczeniePro kolor={theme.colors.naPasie} />}
    </Pressable>
  );
  return (
    <View style={styles.calosc}>
      <View style={styles.wiersz}>
        <Pressable testID="kalendarz-poprzedni" accessibilityRole="button" accessibilityLabel={tydzien ? t('Poprzedni tydzień') : t('Poprzedni miesiąc')}
          style={styles.strzalka} onPress={() => widok.przesun(-1)}>
          <IkonaStartu nazwa="wstecz" kolor={theme.colors.naPasie} rozmiar={22} />
        </Pressable>
        <Text style={styles.tytul} testID="kalendarz-tytul" accessibilityRole="header">{widok.tytul}</Text>
        {!duzy && dzis}
        {nastepny}
        {!duzy && tryb}
      </View>
      {duzy && <View style={styles.wierszDuzy}>{dzis}{tryb}</View>}
      <View
        testID="kalendarz-gest"
        onTouchStart={(e) => { start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }; }}
        onTouchEnd={(e) => {
          const s = start.current;
          start.current = null;
          if (!s) return;
          const k = kierunekGestu(e.nativeEvent.pageX - s.x, e.nativeEvent.pageY - s.y);
          if (k !== 0) widok.przesun(k);
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calosc: { gap: odstepy.xs },
  wiersz: { flexDirection: 'row', alignItems: 'center', gap: odstepy.xs },
  wierszDuzy: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.xs },
  dzisZwezany: { flexShrink: 1, maxWidth: '100%' },
  strzalka: { minWidth: theme.cele.pozostale, minHeight: theme.cele.pozostale, alignItems: 'center', justifyContent: 'center' },
  tytul: { flex: 1, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naPasie, textAlign: 'center' },
  dzis: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.xs, minHeight: theme.cele.pozostale, minWidth: theme.cele.pozostale, justifyContent: 'center', alignItems: 'center', paddingHorizontal: odstepy.s, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.naPasie2 },
  dzisTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie },
});
