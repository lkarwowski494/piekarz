import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Text, type ColorValue } from 'react-native';
import { lang } from '../lib/i18n';

export type TabIconName = 'calculator' | 'schedule' | 'workbench' | 'starter' | 'doctor';

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
  const solid = { fill: color };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {/* Kalkulator — Waga piekarska / Procenty */}
      {name === 'calculator' ? (
        <>
          <Rect {...p} x={4} y={3} width={16} height={18} rx={2} />
          <Rect {...p} x={7} y={6} width={10} height={3.5} rx={1} />
          <Circle {...solid} cx={8} cy={13} r={1.2} />
          <Circle {...solid} cx={12} cy={13} r={1.2} />
          <Circle {...solid} cx={16} cy={13} r={1.2} />
          <Circle {...solid} cx={8} cy={17} r={1.2} />
          <Circle {...solid} cx={12} cy={17} r={1.2} />
          <Circle {...solid} cx={16} cy={17} r={1.2} />
        </>
      ) : null}

      {/* Harmonogram — Czas i oś fermentacji */}
      {name === 'schedule' ? (
        <>
          <Circle {...p} cx={12} cy={12} r={9} />
          <Path {...p} d="M12 7v5l3.5 2" />
        </>
      ) : null}

      {/* Stolnica — Bochenek chleba z nacięciem */}
      {name === 'workbench' ? (
        <>
          <Path {...p} d="M3 15c0-4.5 4-8 9-8s9 3.5 9 8H3z" />
          <Path {...p} d="M8 11c1.5 1 2.5 1 4 0" />
          <Path {...p} d="M13 11c1.5 1 2.5 1 4 0" />
          <Path {...p} d="M2 18h20" />
        </>
      ) : null}

      {/* Zakwas — Słoik z pęcherzykami fermentacji */}
      {name === 'starter' ? (
        <>
          <Rect {...p} x={6} y={6} width={12} height={15} rx={2.5} />
          <Path {...p} d="M8 3h8v3H8z" />
          <Circle {...solid} cx={10} cy={12} r={1} />
          <Circle {...solid} cx={14} cy={14} r={1.2} />
          <Circle {...solid} cx={11} cy={17} r={1.4} />
        </>
      ) : null}

      {/* Doktor Chleba — Kłos i krzyż diagnostyczny */}
      {name === 'doctor' ? (
        <>
          <Circle {...p} cx={12} cy={12} r={9} />
          <Path {...p} d="M12 8v8M8 12h8" />
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
      allowFontScaling={false}
      style={[
        {
          color,
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: 'transparent',
        },
        position === 'below-icon'
          ? { fontSize: 10 }
          : { fontSize: 13, marginStart: 4, marginEnd: 8, lineHeight: 22 },
      ]}
    >
      {children}
    </Text>
  );
}
