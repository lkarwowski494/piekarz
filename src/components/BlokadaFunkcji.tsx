// ============================================================================
// Piekarz — obszar funkcji Pro bez Piekarz Pro [M1-audytor-generalny-027, -108; D-116; M3 P-b, D-117]
// Kontrakt (docs/monetyzacja.md „Reguły dostępu”): funkcja Pro jest widoczna z oznaczeniem „Pro”, stuknięcie otwiera ekran
// Pro przez jedynego strażnika (useAppAccess().requireActionAccess). Zamiast kłódki wiersz z nazwą funkcji i słowem
// „Pro” (VoiceOver: „{funkcja}, Pro”, podpowiedź „wymaga Piekarz Pro”). Treść funkcji Pro nie jest pokazywana, bo
// zdradzałaby jej wynik bez zakupu (gotowość, proporcje, statystyki); `podglad` zostawia treść do odczytu tam, gdzie
// obszar pokazuje też część Basic (plan od teraz w Planie wypieku): wtedy dotknięcie w treści też otwiera ekran Pro.
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { odstepy, typografia } from '../ui/tokeny';
import { t } from '../lib/i18n';
import type { Funkcja } from '../lib/platnosci/konfiguracja';
import { etykietaPro, nazwaBlokady } from '../lib/platnosci/nazwy-pro';
import { OznaczeniePro } from './OznaczeniePro';
import { Karta } from '../ui/karty/Karta';
import { useDuzyTekst } from '../ui/karty/duzy-tekst';

export interface BlokadaFunkcjiProps {
  funkcja: Funkcja;
  odblokowane: boolean;
  onZablokowane: () => void;
  /** Treść widoczna do odczytu także bez Pro (obszar z częścią Basic); domyślnie bez treści. */
  podglad?: boolean;
  /** Ekran na systemie kart: blokada jako karta z nazwą funkcji w nagłówku i „Pro” jako znacznikiem (ikona karty;
   *  karty/README.md §1, §4 „Proporcje dokarmiania” w karcie) [M3 p2]. */
  ikonaKarty?: React.ReactNode;
  children: React.ReactNode;
}

export function BlokadaFunkcji({ funkcja, odblokowane, onZablokowane, podglad = false, ikonaKarty, children }: BlokadaFunkcjiProps) {
  const duzy = useDuzyTekst();
  if (odblokowane) return <>{children}</>;
  const nazwa = nazwaBlokady(funkcja);
  return (
    <View>
      <Pressable
        testID={`blokada-${funkcja}`}
        style={[styles.wiersz, ikonaKarty ? styles.wKarcie : null]}
        onPress={onZablokowane}
        accessibilityRole="button"
        accessibilityLabel={etykietaPro(nazwa, false)}
        accessibilityHint={t('wymaga Piekarz Pro')}
      >
        {ikonaKarty ? (
          // Przy dużym tekście „Pro” pod nazwą (kolejność czytania: nazwa, potem „Pro”), inaczej po prawej nagłówka
          <Karta testID={`karta-blokada-${funkcja}`} tytul={nazwa} ikona={ikonaKarty} znacznik={duzy ? undefined : <OznaczeniePro />}>
            {duzy ? <OznaczeniePro /> : null}
          </Karta>
        ) : (
          <>
            <Text style={styles.nazwa}>{nazwa}</Text>
            <OznaczeniePro />
          </>
        )}
      </Pressable>
      {podglad && (
        <View
          testID={`blokada-${funkcja}-tresc`}
          pointerEvents="box-only"
          onStartShouldSetResponder={() => true}
          onResponderRelease={onZablokowane}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wKarcie: { flexDirection: 'column', alignItems: 'stretch', paddingVertical: 0, marginBottom: 0 },
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
  nazwa: { flexShrink: 1, fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz },
});
