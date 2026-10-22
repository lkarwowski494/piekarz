// ============================================================================
// Piekarz — nawigacja kalendarza na pasie „Dziś” (BR-KAL-008, BR-KAL-013; makiety roli 04 a2 `101-przewijanie`
// i `12-miesiac`; D-110) [M3 D7]. Przełącznik „Tydzień”/„Miesiąc”, wiersz „‹ okres Dziś ›” (strzałki 44 × 44 pt,
// „Dziś” tylko poza bieżącym okresem), a pod nimi obszar gestu: przesunięcie palcem w bok zmienia okres
// (kierunekGestu). Gest nie przejmuje dotyku (onTouchStart/End), więc dni paska zostają przyciskami.
// Kolory tylko z tokenów pasa (naPasie, naPasie2, pas).
// ============================================================================

import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NawigacjaWidoku } from '../../hooks/useKalendarz';
import { t } from '../../lib/i18n';
import { kierunekGestu, type TrybWidoku } from '../../lib/kalendarz-widok';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { IkonaStartu } from '../start/IkonaStartu';

const TRYBY: readonly { tryb: TrybWidoku; tekst: () => string }[] = [
  { tryb: 'tydzien', tekst: () => t('Tydzień') },
  { tryb: 'miesiac', tekst: () => t('Miesiąc') },
];

export function NawigacjaKalendarza({ widok, children }: { widok: NawigacjaWidoku; children: React.ReactNode }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const tydzien = widok.tryb === 'tydzien';
  return (
    <View style={styles.calosc}>
      <View style={styles.segment} accessibilityRole="tablist">
        {TRYBY.map((x) => {
          const wybrany = widok.tryb === x.tryb;
          return (
            <Pressable key={x.tryb} testID={`kalendarz-tryb-${x.tryb}`} accessibilityRole="button" accessibilityState={{ selected: wybrany }}
              style={[styles.segmentPole, wybrany && styles.segmentWybrany]} onPress={() => widok.ustawTryb(x.tryb)}>
              <Text style={[styles.segmentTekst, wybrany && styles.segmentTekstWybrany]}>{x.tekst()}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.wiersz}>
        <Pressable testID="kalendarz-poprzedni" accessibilityRole="button" accessibilityLabel={tydzien ? t('Poprzedni tydzień') : t('Poprzedni miesiąc')}
          style={styles.strzalka} onPress={() => widok.przesun(-1)}>
          <IkonaStartu nazwa="wstecz" kolor={theme.colors.naPasie} rozmiar={22} />
        </Pressable>
        <Text style={styles.tytul} testID="kalendarz-tytul" accessibilityRole="header">{widok.tytul}</Text>
        {!widok.biezacy && (
          <Pressable testID="kalendarz-dzis" accessibilityRole="button" style={styles.dzis} onPress={widok.dzis}>
            <Text style={styles.dzisTekst}>{t('Dziś')}</Text>
          </Pressable>
        )}
        <Pressable testID="kalendarz-nastepny" accessibilityRole="button" accessibilityLabel={tydzien ? t('Następny tydzień') : t('Następny miesiąc')}
          style={styles.strzalka} onPress={() => widok.przesun(1)}>
          <IkonaStartu nazwa="dalej" kolor={theme.colors.naPasie} rozmiar={22} />
        </Pressable>
      </View>
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
  segment: { flexDirection: 'row', borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.naPasie2, overflow: 'hidden' },
  segmentPole: { flex: 1, minHeight: theme.cele.pozostale, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.s },
  segmentWybrany: { backgroundColor: theme.colors.naPasie },
  segmentTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie, textAlign: 'center' },
  segmentTekstWybrany: { color: theme.colors.pas, fontWeight: '600' },
  wiersz: { flexDirection: 'row', alignItems: 'center', gap: odstepy.xs },
  strzalka: { minWidth: theme.cele.pozostale, minHeight: theme.cele.pozostale, alignItems: 'center', justifyContent: 'center' },
  tytul: { flex: 1, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naPasie, textAlign: 'center' },
  dzis: { minHeight: theme.cele.pozostale, minWidth: theme.cele.pozostale, justifyContent: 'center', alignItems: 'center', paddingHorizontal: odstepy.s, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.naPasie2 },
  dzisTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie },
});
