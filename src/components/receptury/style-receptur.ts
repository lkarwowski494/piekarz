// ============================================================================
// Piekarz — wspólne style zakładki „Receptury” (design-spec §11c „106”, makieta kalkulator.html: `.grupa`,
// `.kom`, `.naglowek-grupy`, `.chipy`, `.info`). Kolory, promienie i cele tylko z motywu. [M1-audytor-generalny-106]
// ============================================================================

import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { promienie } from '../../ui/tokeny';

export const s = StyleSheet.create({
  ekran: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  tresc: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  naglowekGrupy: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
  },
  grupa: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: promienie.grupa,
    overflow: 'hidden',
  },
  kom: {
    minHeight: theme.cele.glownyPrzeplyw,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.linia,
  },
  komOstatnia: {
    borderBottomWidth: 0,
  },
  roz: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
  },
  etykieta: {
    fontSize: 17,
    color: theme.colors.tusz,
  },
  przypis: {
    fontSize: 13,
    color: theme.colors.tusz2,
    marginTop: 2,
  },
  wartosc: {
    fontSize: 17,
    color: theme.colors.tusz2,
  },
  liczba: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.tusz,
    fontVariant: ['tabular-nums'],
  },
  szewron: {
    fontSize: 22,
    color: theme.colors.tusz3,
  },
  akcja: {
    fontSize: 17,
    color: theme.colors.akcentTekst,
  },
  info: {
    fontSize: 15,
    color: theme.colors.tusz2,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  pole: {
    minWidth: 96,
    textAlign: 'right',
  },
  chipy: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: theme.cele.pozostale / 2,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  chipWybrany: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  chipTekst: {
    fontSize: 15,
    color: theme.colors.tusz,
  },
  chipTekstWybrany: {
    color: theme.colors.naAkcencie,
    fontWeight: '600',
  },
});
