// ============================================================================
// Piekarz — EkranZPasem: przewijana treść z pasem marki i czapką paska stanu (README §2, D-139; M3 p7, 04-001)
// Jedno miejsce na wzór „ekranu z pasem”: przewijanie (bez systemowego wcięcia), kolor pasa nad pasem przy
// przeciągnięciu w dół (`NadPasem`), pas ekranu i przypięta czapka paska stanu. Gdy pas odjedzie przy przewijaniu,
// pod paskiem stanu zostaje kolor pasa, nie treść; mały tytuł pojawia się w czapce, gdy pas schowa się pod nią.
// Ekran podaje pas jako funkcję, która dostaje `onLayout` (wysokość pasa), i resztę treści jako dzieci.
// Czapka jest rodzeństwem przewijania: rodzic ekranu (SafeAreaView bez krawędzi `top` albo View) ją pozycjonuje.
// ============================================================================

import React, { useState } from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { CzapkaPaska } from '../../ui/karty/CzapkaPaska';
import { NadPasem } from './PasZakladki';

/** Przewijanie ekranu z pasem (ref do `scrollTo`, np. wpis z kalendarza w Dzienniku). */
export type PrzewijanieEkranu = ScrollView;

export function EkranZPasem({ gora, tytul, pas, children, przewijanieRef, style, contentContainerStyle }: {
  /** Wysokość paska stanu (safe area). */
  gora: number;
  /** Mały tytuł w czapce po schowaniu pasa, już przetłumaczony. */
  tytul?: string;
  /** Pas ekranu; `onLayout` podaje jego wysokość (od niej zależy mały tytuł w czapce). */
  pas: (onLayout: (wysokosc: number) => void) => React.ReactNode;
  children?: React.ReactNode;
  przewijanieRef?: React.Ref<ScrollView>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const [wysokoscPasa, setWysokoscPasa] = useState<number>(0);
  const [przewiniety, setPrzewiniety] = useState<boolean>(false);
  return (
    <>
      <ScrollView
        ref={przewijanieRef}
        style={style}
        contentContainerStyle={contentContainerStyle}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(e) => {
          const p = e.nativeEvent.contentOffset.y > Math.max(0, wysokoscPasa - gora);
          if (p !== przewiniety) setPrzewiniety(p);
        }}
      >
        {/* Przy przeciągnięciu w dół nad pasem dalej kolor pasa, nie tło ekranu */}
        <NadPasem />
        {pas(setWysokoscPasa)}
        {children}
      </ScrollView>
      <CzapkaPaska gora={gora} tytul={tytul} pokazTytul={przewiniety} />
    </>
  );
}
