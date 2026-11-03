// ============================================================================
// Piekarz — ikona nagłówka karty (design-spec §14, karty/README.md §2: ikona 24 pt w kolorze `ratan`) [M3 p2]
// Kształty dosłownie z makiety docs/design/karty/karty.js (IK; siatka 24, kreska 1,8, zaokrąglone końce), tylko te,
// których używają ekrany wpięte w p2 (Zakwasy, Doktor zakwasu). Ozdoba: poza drzewem dostępności (Karta ją ukrywa).
// ============================================================================

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { theme } from '../theme';

export type NazwaIkonyKarty = 'sloik' | 'zegar' | 'kalendarz' | 'tarcza' | 'waga' | 'proporcje' | 'lista' | 'info';

export function IkonaKarty({ nazwa, rozmiar = 24 }: { nazwa: NazwaIkonyKarty; rozmiar?: number }) {
  const p = { fill: 'none', stroke: theme.colors.ratan, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={rozmiar} height={rozmiar} viewBox="0 0 24 24" accessible={false} testID={`ikona-karty-${nazwa}`}>
      {nazwa === 'sloik' && (
        <>
          <Rect {...p} x={6} y={6} width={12} height={15} rx={2.5} />
          <Path {...p} d="M8 3h8v3H8z" />
          <Path {...p} d="M6 14h12" />
        </>
      )}
      {nazwa === 'zegar' && (
        <>
          <Circle {...p} cx={12} cy={12} r={8.5} />
          <Path {...p} d="M12 7v5l3 2" />
        </>
      )}
      {nazwa === 'kalendarz' && (
        <>
          <Path {...p} d="M4 5h16v15H4z" />
          <Path {...p} d="M8 3v4M16 3v4M4 10h16" />
        </>
      )}
      {nazwa === 'tarcza' && (
        <>
          <Path {...p} d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
          <Path {...p} d="M9 12l2 2 4-4" />
        </>
      )}
      {nazwa === 'waga' && (
        <>
          <Path {...p} d="M4 20h16l-2-9H6z" />
          <Circle {...p} cx={12} cy={7} r={3} />
          <Path {...p} d="M12 6v1.5" />
        </>
      )}
      {nazwa === 'proporcje' && (
        <>
          <Path {...p} d="M4 20L20 4" />
          <Circle {...p} cx={7} cy={7} r={2.5} />
          <Circle {...p} cx={17} cy={17} r={2.5} />
        </>
      )}
      {nazwa === 'lista' && <Path {...p} d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />}
      {nazwa === 'info' && (
        <>
          <Circle {...p} cx={12} cy={12} r={8.5} />
          <Path {...p} d="M12 11v5M12 8h.01" />
        </>
      )}
    </Svg>
  );
}
