// ============================================================================
// Piekarz — nawigacja systemowa z dużym tytułem zamiast CraftHeader (design-spec §4, mapa-rol.md §4, D-051 2a)
// Opcje natywnego stosu (react-native-screens przez expo-router 57: headerLargeTitleEnabled, odczyt typów
// node_modules/expo-router/build/react-navigation/native-stack/types.d.ts, 2026-10-20). Kolory i krój tylko
// z motywu: tło `tlo`, akcje `akcentTekst`, tytuł `tusz` krojem tytułów (D-050). [M1-audytor-generalny-101]
// Kolory idą do natywnej strony jako hex bieżącego wariantu (useMotyw), nie jako DynamicColorIOS tworzone raz przy
// imporcie: na iOS 26 pas nagłówka miał tło wariantu jasnego przy tytule wariantu ciemnego [M3 p1 a1].
// ============================================================================

import { useMemo } from 'react';
import { useMotyw, type PaletaHex } from './motyw';
import { theme } from './theme';

/** Opcje nagłówka dla palety jednego wariantu; `duzy` = duży tytuł zakładki (zwija się przy przewijaniu). */
export function opcjeNaglowka(paleta: PaletaHex, duzy: boolean) {
  const tytul = { get fontFamily() { return theme.typography.krojTytulow; }, fontWeight: '700' as const, color: paleta.tusz };
  const zwykly = {
    headerShown: true,
    headerLargeTitleEnabled: false,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: paleta.tlo },
    headerTintColor: paleta.akcentTekst,
    headerTitleStyle: tytul,
    contentStyle: { backgroundColor: paleta.tlo },
  };
  return {
    ...zwykly,
    headerLargeTitleEnabled: duzy,
    headerLargeTitleShadowVisible: false,
    headerLargeStyle: { backgroundColor: paleta.tlo },
    headerLargeTitleStyle: tytul,
  };
}

/**
 * Opcje nagłówka bieżącego wariantu (jasny, ciemny, oba ze „Zwiększ kontrast”): `zwykly` do ekranów w stosie,
 * `duzy` do stosów zakładek. Liczone w komponencie, więc zmiana wyglądu albo kontrastu odświeża pasek.
 */
export function useNaglowek() {
  const { kolory } = useMotyw();
  return useMemo(() => ({ zwykly: opcjeNaglowka(kolory, false), duzy: opcjeNaglowka(kolory, true) }), [kolory]);
}
