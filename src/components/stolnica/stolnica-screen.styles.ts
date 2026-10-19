import { StyleSheet } from 'react-native';
import { sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../../ui/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerDoctorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: sharedCraftTokens.borderRadius.full,
    backgroundColor: sharedCraftTokens.colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
  },
  headerDoctorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  activeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  recipeTag: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  activeStepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  activeStepDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  controlsRow: {
    marginBottom: 10,
  },
  actionBtnNext: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  actionBtnNextText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  discardBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  discardBtnText: {
    fontSize: 13,
    color: theme.colors.statusDanger,
    fontWeight: '600',
  },
});
