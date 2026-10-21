// ============================================================================
// Piekarz — nawigacja systemowa z dużym tytułem zamiast CraftHeader (design-spec §4, mapa-rol.md §4, D-051 2a)
// Opcje natywnego stosu (react-native-screens przez expo-router 57: headerLargeTitleEnabled, odczyt typów
// node_modules/expo-router/build/react-navigation/native-stack/types.d.ts, 2026-10-20). Kolory i krój tylko
// z motywu: tło `tlo`, akcje `akcentTekst`, tytuł `tusz` krojem tytułów (D-050). [M1-audytor-generalny-101]
// ============================================================================

import { theme } from './theme';

const tytul = { get fontFamily() { return theme.typography.krojTytulow; }, fontWeight: '700' as const, color: theme.colors.tusz };

/** Nagłówek ekranu w stosie: zwykły tytuł, przycisk wstecz w kolorze akcji, bez linii pod paskiem. */
export const naglowekZwykly = {
  headerShown: true,
  headerLargeTitleEnabled: false,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: theme.colors.tlo },
  headerTintColor: theme.colors.akcentTekst,
  headerTitleStyle: tytul,
  contentStyle: { backgroundColor: theme.colors.tlo },
};

/** Nagłówek zakładki: duży tytuł, który zwija się przy przewijaniu (ScrollView z contentInsetAdjustmentBehavior). */
export const naglowekDuzy = {
  ...naglowekZwykly,
  headerLargeTitleEnabled: true,
  headerLargeTitleShadowVisible: false,
  headerLargeStyle: { backgroundColor: theme.colors.tlo },
  headerLargeTitleStyle: tytul,
};
