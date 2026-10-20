// ============================================================================
// Piekarz — blokada obszaru funkcji bez uprawnienia [M1-audytor-generalny-027, -108]
// Dane użytkownika zostają do odczytu, także dla VoiceOver, i nic ich nie zasłania (D-039, DEC-01 d).
// Zablokowane są akcje: dotknięcie w treści (palcem albo aktywacją VoiceOver) trafia w obszar treści
// (pointerEvents „box-only”) i otwiera ekran zakupu przez jedynego strażnika (useAppAccess().requireActionAccess).
// Nad treścią, we własnym wierszu, kłódka z „wymaga Piekarz Pro” i „Odblokuj pełny dostęp” — jak w stanie
// `tylko-historia` Startu (design-spec §6, start/WyborCzynnosci.tsx).
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { odstepy, typografia } from '../ui/tokeny';
import { t } from '../lib/i18n';
import type { Funkcja } from '../lib/platnosci/konfiguracja';
import { IkonaStartu } from './start/IkonaStartu';

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
      <Pressable
        testID={`blokada-${funkcja}`}
        style={styles.wiersz}
        onPress={onZablokowane}
        accessibilityRole="button"
        accessibilityLabel={t('Odblokuj pełny dostęp')}
        accessibilityHint={t('wymaga Piekarz Pro')}
      >
        <IkonaStartu nazwa="zamek" kolor={theme.colors.zablokowane} rozmiar={20} />
        <Text style={styles.wymaga}>{t('wymaga Piekarz Pro')}</Text>
        <Text style={styles.odblokuj}>{t('Odblokuj pełny dostęp')}</Text>
      </Pressable>
      <View
        testID={`blokada-${funkcja}-tresc`}
        pointerEvents="box-only"
        onStartShouldSetResponder={() => true}
        onResponderRelease={onZablokowane}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wiersz: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: odstepy.s,
    rowGap: odstepy.xs,
    minHeight: theme.cele.pozostale,
    paddingVertical: odstepy.s,
    marginBottom: odstepy.s,
  },
  wymaga: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.zablokowane },
  odblokuj: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.akcentTekst },
});
