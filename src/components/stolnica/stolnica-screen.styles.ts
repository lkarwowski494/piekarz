import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  // Prowadzenie w widoku skupionym (design-spec §11b „056”): strefa planu i strefa kroku [M1-audytor-generalny-056]
  recipeTag: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
    marginBottom: odstepy.s,
  },
  krokNzN: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz,
    textAlign: 'center',
  },
  // „Krok n z N” i „Gotowe {dzień} o {godzina}” (makieta: t-obj, p2) [M1-audytor-generalny-114]
  planOpis: {
    gap: odstepy.xs,
    marginBottom: odstepy.l,
  },
  gotowe: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
    textAlign: 'center',
  },
  // „do {godzina}, potem …” pod czasem kroku i „Ekran nie zgaśnie…” (makieta: t-tresc p2, info) [M1-audytor-generalny-114]
  potem: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz2,
    marginBottom: odstepy.m,
  },
  ekran: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: odstepy.s,
    marginBottom: odstepy.l,
  },
  ekranTekst: {
    flex: 1,
    minWidth: 0,
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
  activeStepTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytulKroku.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: odstepy.xs,
  },
  czas: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.czas.pt,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: theme.colors.tusz,
    marginBottom: odstepy.s,
  },
  activeStepDesc: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz2,
    marginBottom: odstepy.l,
  },
});
