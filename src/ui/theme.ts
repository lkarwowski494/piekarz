// ============================================================================
// Piekarz — motyw ekranów (system „Koszyk spiralny”, D-045, D-046, D-049)
// Kolory: tokeny z src/ui/tokeny.ts przez DynamicColorIOS (src/ui/motyw.ts), 4 warianty według iOS.
// Odstępy i promienie: aliasy dawnych nazw wskazujące tokeny (odstepy, promienie), żeby nie zmieniać
// kilkuset miejsc w stylach; nowy kod używa nazw tokenów. [M1-audytor-generalny-050]
// ============================================================================

import { koloryMotywu } from './motyw';
import { cele, odstepy, promienie, typografia } from './tokeny';

export const theme = {
  colors: koloryMotywu,
  spacing: {
    xs: odstepy.xs, // 4
    sm: odstepy.s, // 8
    md: odstepy.l, // 16
    lg: odstepy.xxl, // 24
    xl: odstepy.xxxl, // 32
  },
  radius: {
    sm: promienie.znacznik, // 6
    md: promienie.grupa, // 12
    lg: promienie.grupa, // 12: karty i arkusze (.grupa, .arkusz w docs/design/ekrany/wspolne.css); dawniej 16 spoza systemu
    full: 9999, // kształt koła lub kapsuły (kropka, znacznik wyboru), nie stopień hierarchii promieni
  },
  // Cele dotykowe (DEC-15 a): 48 prowadzenie i akcje główne, 44 pozostałe, 64 przycisk kciuka [M1-audytor-generalny-052]
  // Krój tytułów, czasów i cen (D-050); treść krojem systemowym (fontFamily nieustawione) [M1-audytor-generalny-055]
  typography: {
    krojTytulow: typografia.krojTytulow,
  },
  cele: {
    glownyPrzeplyw: cele.glownyPrzeplyw,
    pozostale: cele.pozostale,
    przyciskKciuka: cele.przyciskKciuka,
  },
};
