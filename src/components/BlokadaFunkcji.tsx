// ============================================================================
// Piekarz — blokada obszaru funkcji bez uprawnienia [M1-audytor-generalny-027]
// Zawartość zostaje widoczna (odczyt), ale dotyk otwiera ekran zakupu przez jedynego strażnika
// (useAppAccess().requireActionAccess). Wygląd do akceptacji roli 04 (SP-09).
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import type { Funkcja } from '../lib/platnosci/konfiguracja';

export interface BlokadaFunkcjiProps {
  funkcja: Funkcja;
  odblokowane: boolean;
  onZablokowane: () => void;
  children: React.ReactNode;
}

export function BlokadaFunkcji({ funkcja, odblokowane, onZablokowane, children }: BlokadaFunkcjiProps) {
  if (odblokowane) return <>{children}</>;
  return (
    <View>
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </View>
      <Pressable
        testID={`blokada-${funkcja}`}
        style={styles.overlay}
        onPress={onZablokowane}
        accessibilityRole="button"
        accessibilityLabel={t('Odblokuj pełny dostęp')}
      >
        <Text style={styles.pill}>🔒 {t('Odblokuj pełny dostęp')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: theme.spacing.sm,
    minHeight: 44,
  },
  pill: {
    backgroundColor: theme.colors.akcent,
    color: theme.colors.naAkcencie,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
});
