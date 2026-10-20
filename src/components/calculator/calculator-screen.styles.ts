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
  settingsHeaderBtn: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsHeaderBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
  },
});
