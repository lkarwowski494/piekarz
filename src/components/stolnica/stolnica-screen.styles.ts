import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  // Pas na całą szerokość u góry przewijanej treści, treść pod nim z wcięciem (M3 p4b, D-194)
  container: {
    paddingBottom: 40,
  },
  tresc: {
    padding: theme.spacing.md,
  },
  // Niski ekran (005, rola 04 p4b): karta kroku bliżej zwartego pasa
  trescZwarta: { paddingTop: odstepy.s },
  // Tekst na pasie prowadzenia (tokeny pasa, D-194)
  naPasie: { color: theme.colors.naPasie },
  naPasie2: { color: theme.colors.naPasie2 },
  header: {
    marginBottom: theme.spacing.md,
  },
  // Prowadzenie w widoku skupionym (design-spec §11b „056”): strefa planu i strefa kroku [M1-audytor-generalny-056]
  recipeTag: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
    marginBottom: odstepy.s,
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
  // W karcie kroku odstęp daje `gap` karty, a dół jej wypełnienie (README §2): bez własnych marginesów, karta kroku
  // z ostrzeżeniem w pierwszym ekranie [M1-audytor-generalny-005]
  ekran: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: odstepy.s,
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
  // Niski ekran (rola 04 p4b, 005): czas tytulKroku 28 pt i „potem …” obok w jednym rzędzie (zawija się pod czas)
  czasRzad: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: odstepy.m },
  czasZwarty: { fontSize: typografia.style.tytulKroku.pt, marginBottom: 0 },
  potemZwarty: { flexGrow: 1, flexShrink: 1, flexBasis: 150, marginBottom: 0, fontSize: typografia.style.objasnienie.pt },
  activeStepDesc: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz2,
  },
});
