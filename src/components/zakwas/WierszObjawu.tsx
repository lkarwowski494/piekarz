// ============================================================================
// Piekarz — wiersz objawu z polem wyboru (makieta ekrany/zakwas.html: .objaw, .checkbox; cel 48 pt). Stan
// zaznaczenia kształtem (znak) i kolorem, nie samym kolorem (design-spec §2). [M1-audytor-generalny-104]
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';

export function WierszObjawu({ tekst, zaznaczony, pierwszy, testID, onPress }: {
  tekst: string;
  zaznaczony: boolean;
  pierwszy: boolean;
  testID: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: zaznaczony }}
      accessibilityLabel={tekst}
      style={[styles.objaw, !pierwszy && styles.linia]}
      onPress={onPress}
    >
      <View style={[styles.pole, zaznaczony && styles.poleOn]}>
        {zaznaczony && (
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke={theme.colors.naAkcencie} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
      <Text style={styles.tekst}>{tekst}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  objaw: { flexDirection: 'row', alignItems: 'center', gap: odstepy.m, minHeight: theme.cele.glownyPrzeplyw, paddingHorizontal: odstepy.l, paddingVertical: odstepy.s },
  linia: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.linia },
  pole: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center' },
  poleOn: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  tekst: { flex: 1, minWidth: 0, fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
});
