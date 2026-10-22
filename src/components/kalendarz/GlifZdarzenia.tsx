// ============================================================================
// Piekarz — glify zdarzeń paska tygodnia (makieta roli 04 a2, `a2.css`; BR-KAL-002) [M3 D4b]
// Kształty różne bez koloru (sprawdzone w skali szarości przez rolę 04): spirala, trójkąt (drugi wypiek), bochenek
// konturem („gotowe”) i pełny (Dziennik), kropka (dokarmiony), przerywany pierścień (następne karmienie), słoik
// (zakładanie); zaległe: koło z wykrzyknikiem na tle ostrzeżenia. Ozdoba poza drzewem dostępności — dzień czyta etykieta.
// ============================================================================

import React from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { GlifZdarzenia } from '../../lib/kalendarz-pasek';

export function GlifZdarzenia({ glif, kolor, rozmiar = 12 }: { glif: GlifZdarzenia; kolor: ColorValue; rozmiar?: number }) {
  const p = { fill: 'none', stroke: kolor, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={rozmiar} height={rozmiar} viewBox="0 0 12 12" accessible={false} testID={`glif-${glif}`}>
      {glif === 'wypiek' && <Path {...p} d="M6 6.2a.9.9 0 1 1 1-1 2.2 2.2 0 1 1-2.6-1.9 3.6 3.6 0 1 1-3 3.3" />}
      {glif === 'wypiek2' && <Path {...p} d="M6 1.5 10.5 10h-9z" />}
      {glif === 'gotowe' && <Path {...p} d="M1.5 8.5c0-3 2-4.8 4.5-4.8s4.5 1.8 4.5 4.8v1h-9z" />}
      {glif === 'dziennik' && <Path {...p} fill={kolor} d="M1.5 8.5c0-3 2-4.8 4.5-4.8s4.5 1.8 4.5 4.8v1h-9z" />}
      {glif === 'karmienie' && <Circle cx={6} cy={6} r={3} fill={kolor} />}
      {glif === 'karmienie-nastepne' && <Circle {...p} cx={6} cy={6} r={4} strokeDasharray="1.6 1.6" />}
      {glif === 'zakladanie' && (
        <>
          <Rect {...p} x={2.5} y={3.5} width={7} height={7} rx={1.5} />
          <Path {...p} d="M3.5 1.5h5" />
        </>
      )}
    </Svg>
  );
}

/** Glif zaległego: koło w kolorze ostrzeżenia z wykrzyknikiem (kształt + słowo „Zaległe” w tekście). */
export function GlifZaleglego({ tlo, znak, rozmiar = 14 }: { tlo: ColorValue; znak: ColorValue; rozmiar?: number }) {
  return (
    <Svg width={rozmiar} height={rozmiar} viewBox="0 0 14 14" accessible={false} testID="glif-zalegle">
      <Circle cx={7} cy={7} r={7} fill={tlo} />
      <Path d="M7 3.2v4.6" stroke={znak} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={7} cy={10.4} r={1.1} fill={znak} />
    </Svg>
  );
}
