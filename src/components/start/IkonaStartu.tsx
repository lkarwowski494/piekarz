// ============================================================================
// Piekarz — ikony Startu: słoik, bochenek, pizza (Wybór czynności), kłódka, ustawienia.
// Kształty z makiety docs/design/ekrany/wspolne.js (IKONY), rysowane zastępczo za symbole SF (design-spec §4);
// ikona jest ozdobą obok nazwy, poza drzewem dostępności. [M1-audytor-generalny-101]
// ============================================================================

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { ColorValue } from 'react-native';

export type NazwaIkonyStartu = 'sloik' | 'bochenek' | 'pizza' | 'zamek' | 'ustawienia';

export function IkonaStartu({ nazwa, kolor, rozmiar = 28 }: { nazwa: NazwaIkonyStartu; kolor: ColorValue; rozmiar?: number }) {
  const p = { fill: 'none', stroke: kolor, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={rozmiar} height={rozmiar} viewBox="0 0 24 24" accessible={false}>
      {nazwa === 'sloik' && (
        <>
          <Rect {...p} x={6} y={6} width={12} height={15} rx={2.5} />
          <Path {...p} d="M8 3h8v3H8z" />
          <Path {...p} d="M6 14h12" />
        </>
      )}
      {nazwa === 'bochenek' && (
        <>
          <Path {...p} d="M3 15c0-5 4-8 9-8s9 3 9 8v2H3z" />
          <Path {...p} d="M8 10l2 3M12 9l2 3M16 10l2 3" />
        </>
      )}
      {nazwa === 'pizza' && (
        <>
          <Path {...p} d="M12 21L3.5 6a14 14 0 0 1 17 0z" />
          <Circle {...p} cx={11} cy={10} r={1.3} />
          <Circle {...p} cx={14} cy={14} r={1.3} />
        </>
      )}
      {nazwa === 'zamek' && (
        <>
          <Rect {...p} x={5} y={10.5} width={14} height={10} rx={2} />
          <Path {...p} d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </>
      )}
      {nazwa === 'ustawienia' && (
        <>
          <Circle {...p} cx={12} cy={12} r={3.2} />
          <Path {...p} d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" />
        </>
      )}
    </Svg>
  );
}
