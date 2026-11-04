// ============================================================================
// Piekarz — style kart trybu maszyny z tokenów (przycisk główny jak „Ułóż plan” w CalculatorActionButtons, wiersze jak
// „Do miski”); bez nowych kolorów ani rozmiarów [M3 p9b2].
// ============================================================================

import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export const sm = StyleSheet.create({
  wnetrze: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md },
  zdanie: { fontSize: typografia.style.przypis.pt, lineHeight: 20, color: theme.colors.tusz2, marginTop: odstepy.xs },
  numer: { minWidth: 28, fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.tusz, fontVariant: ['tabular-nums'] },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.akcent,
    borderRadius: promienie.przyciskGlowny,
  },
  glownyTekst: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
    textAlign: 'center',
  },
  glownyZablokowany: { backgroundColor: theme.colors.powierzchnia, borderWidth: 1.5, borderColor: theme.colors.obwodka },
  tekstZablokowany: { color: theme.colors.zablokowane },
  drugi: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.s,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  drugiTekst: { fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.tusz },
  // Segment w karcie: wcięcie jak w makiecie (0 16 10)
  segmentWKarcie: { marginHorizontal: theme.spacing.md, marginBottom: odstepy.m },
  naglowekGrupy: { marginBottom: odstepy.s },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.s },
});
