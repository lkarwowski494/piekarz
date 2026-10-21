import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Text, type ColorValue } from 'react-native';
import { lang } from '../lib/i18n';

import { typografia } from '../ui/tokeny';
// Zakładki D-051 (2a): Dziś, Receptury, Zakwasy, Dziennik; kształty z makiety docs/design/ekrany/wspolne.js
export type TabIconName = 'dzis' | 'receptury' | 'zakwasy' | 'dziennik';

export function TabIcon({
  name,
  color,
  size = 24,
}: {
  name: TabIconName;
  color: ColorValue;
  size?: number;
}) {
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {name === 'dzis' ? (
        <>
          <Circle {...p} cx={12} cy={12} r={8.5} />
          <Path {...p} d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === 'receptury' ? (
        <>
          <Path {...p} d="M5 3.5h11a3 3 0 0 1 3 3v14H8a3 3 0 0 1-3-3z" />
          <Path {...p} d="M9 8h6M9 12h6" />
        </>
      ) : null}
      {name === 'zakwasy' ? (
        <>
          <Rect {...p} x={6} y={7} width={12} height={14} rx={2.5} />
          <Path {...p} d="M8 3.5h8V7H8z" />
          <Path {...p} d="M6 13h12" />
        </>
      ) : null}
      {name === 'dziennik' ? (
        <>
          <Path {...p} d="M4 5h16v15H4z" />
          <Path {...p} d="M8 3v4M16 3v4M4 10h16" />
        </>
      ) : null}
    </Svg>
  );
}

export function TabLabel({
  color,
  position,
  children,
}: {
  color: ColorValue;
  position: 'beside-icon' | 'below-icon';
  children: string;
}) {
  return (
    <Text
      accessibilityLanguage={lang()}
      // Rośnie z Dynamic Type do 1,5× (pasek ma stałą wysokość), w jednym wierszu z dopasowaniem [audyt-niezalezny G-9]
      maxFontSizeMultiplier={1.5}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
      style={[
        {
          color,
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: 'transparent',
        },
        position === 'below-icon'
          ? { fontSize: 10 }
          : { fontSize: typografia.style.przypis.pt, marginStart: 4, marginEnd: 8, lineHeight: 22 },
      ]}
    >
      {children}
    </Text>
  );
}
