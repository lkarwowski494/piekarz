// ============================================================================
// Piekarz — nawigacja systemowa z dużym tytułem zamiast CraftHeader (design-spec §4, mapa-rol.md §4, D-051 2a)
// Opcje natywnego stosu (react-native-screens przez expo-router 57: headerLargeTitleEnabled, odczyt typów
// node_modules/expo-router/build/react-navigation/native-stack/types.d.ts, 2026-10-20). Kolory i krój tylko
// z motywu: tło `tlo`, akcje `akcentTekst`, tytuł `tusz` krojem tytułów (D-050). [M1-audytor-generalny-101]
// Błąd a1 (zrzut z TestFlight 1.0.0 (1014), iOS 26: jasny pas, niewidoczny tytuł) ma przyczynę NIEPOTWIERDZONĄ na
// urządzeniu; hipotezy: (1) DynamicColorIOS tworzone raz przy imporcie i rozwiązywane natywnie przy budowie paska,
// (2) tło paska przy dużym tytule na iOS 26 (komentarz biblioteki: expo-router useHeaderConfigProps.js:160).
// Dlatego kolory idą jako hex bieżącego wariantu (useMotyw), a duży tytuł na iOS bez tła paska [M3 p1 a1].
// ============================================================================

import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useMotyw, type PaletaHex } from './motyw';
import { theme } from './theme';

/**
 * Opcje nagłówka dla palety jednego wariantu; `duzy` = duży tytuł zakładki (zwija się przy przewijaniu).
 * Duży tytuł na iOS bez tła paska (headerStyle, headerLargeStyle): tak robi biblioteka, gdy go nie podamy,
 * a komentarz w niej mówi, że z tłem tytuł znika na iOS 26 (expo-router useHeaderConfigProps.js:157-163).
 * Tło ekranu zostaje w contentStyle; ScrollView z contentInsetAdjustmentBehavior wchodzi pod przezroczysty pasek.
 */
export function opcjeNaglowka(paleta: PaletaHex, duzy: boolean, platforma: string = Platform.OS) {
  const tytul = { get fontFamily() { return theme.typography.krojTytulow; }, fontWeight: '700' as const, color: paleta.tusz };
  const bezTlaPaska = duzy && platforma === 'ios';
  const tloPaska: { backgroundColor?: string } = bezTlaPaska ? {} : { backgroundColor: paleta.tlo };
  return {
    headerShown: true,
    headerLargeTitleEnabled: duzy,
    headerShadowVisible: false,
    headerStyle: tloPaska,
    headerTintColor: paleta.akcentTekst,
    headerTitleStyle: tytul,
    contentStyle: { backgroundColor: paleta.tlo },
    headerLargeTitleShadowVisible: false,
    headerLargeStyle: tloPaska,
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
