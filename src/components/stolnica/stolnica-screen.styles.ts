import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';

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
  headerDoctorBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  headerDoctorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  activeCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: theme.colors.akcent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  recipeTag: {
    fontSize: 13,
    color: theme.colors.tusz3,
    fontWeight: '600',
  },
  activeStepTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 6,
  },
  activeStepDesc: {
    fontSize: 14,
    color: theme.colors.tusz2,
    lineHeight: 20,
    marginBottom: 16,
  },
  controlsRow: {
    marginBottom: 10,
  },
  actionBtnNext: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  actionBtnNextText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  discardBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  discardBtnText: {
    fontSize: 13,
    color: theme.colors.blad,
    fontWeight: '600',
  },
});
