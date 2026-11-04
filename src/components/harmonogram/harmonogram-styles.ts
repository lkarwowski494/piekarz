// ============================================================================
// Piekarz — style ekranu planu (app/(tabs)/receptury/harmonogram.tsx), wydzielone (limit 20 480 B) [M3 p4b].
// ============================================================================
import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  przewijane: {
    flex: 1,
  },
  bezSnu: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
  // Karty co 12 (README §2)
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
    gap: odstepy.m,
  },
  kosz: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
  },
});
