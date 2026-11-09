// ============================================================================
// Piekarz — zdanie przed systemową prośbą o zgodę na powiadomienia (makieta `prowadzenie.html`, stan `zgoda`;
// design-spec §5 „prośba o zgodę — po co, jednym zdaniem”; BR-CZAS-003) [M1-audytor-generalny-130].
// Arkusz nad prowadzeniem: tytuł i zdanie z makiety, „Dalej”; dopiero „Dalej” wywołuje prośbę iOS.
// Zdanie makiety „Wypiek trwa do jutra.” pominięte: długość wypieku zależy od planu (do przeglądu roli 04).
// Na systemie kart (README §1, §3): ArkuszKart bez przycisków paska, tytuł jako nagłówek karty ze zdaniem, „Dalej”
// pod kartą jak przyciski w ArkuszPlanu; przesunięcie w dół = „Dalej” jak dotąd [M2-014; 04-studio-projektowe-007].
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export interface ZgodaPowiadomienProps {
  visible: boolean;
  onDalej: () => void;
}

export function ZgodaPowiadomien({ visible, onDalej }: ZgodaPowiadomienProps) {
  if (!visible) return null;
  return (
    <ArkuszKart visible onRequestClose={onDalej} trescTestID="zgoda-powiadomien">
      <Karta testID="karta-zgody" tytul={t('Dam znać o każdym kroku')} ikona={<IkonaKarty nazwa="dzwonek" />}>
        <Text style={styles.opis}>{t('Gdy telefon śpi, powiadomienie powie, co i kiedy zrobić. Za chwilę telefon zapyta o zgodę.')}</Text>
      </Karta>
      <Pressable testID="zgoda-dalej-btn" accessibilityRole="button" onPress={onDalej} style={styles.glowny}>
        <Text style={styles.glownyTekst}>{t('Dalej')}</Text>
      </Pressable>
    </ArkuszKart>
  );
}

const styles = StyleSheet.create({
  opis: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
  },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie },
});
