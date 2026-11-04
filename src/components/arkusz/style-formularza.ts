// ============================================================================
// Piekarz — style pól formularza w arkuszach na kartach (README §2: pole promień 10, etykieta i wybór jednym
// krojem; typografia z tokenów) [M3 p7, 04-002]. Wspólne dla zapisu receptury, dodania i edycji zakwasu
// (wybór przechowywania: WyborPrzechowywania).
// ============================================================================

import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export const formularz = StyleSheet.create({
  /** Etykieta z polem lub wyborem pod nią (karta ma odstęp 12 między grupami). */
  grupa: { gap: odstepy.xs },
  etykieta: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: odstepy.xs,
  },
  pole: {
    minHeight: theme.cele.pozostale,
    backgroundColor: theme.colors.tlo,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: promienie.pole,
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz,
  },
});
