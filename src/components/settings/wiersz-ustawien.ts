// ============================================================================
// Piekarz — wiersz w karcie Ustawień (karty/README.md §2: wiersz min 52, odstęp 10, linia `linia` między wierszami)
// [M3 p5]. Akcje Ustawień jako wiersze zamiast siatek przycisków (makieta inne.html #ustawienia); pierwszy wiersz karty
// bez linii (`pierwszy`). Kolor tekstu akcji: `akcentTekst`, akcji niszczącej: `blad` (jak dotąd).
// Dlaczego wspólny plik: dziewięć sekcji Ustawień z osobnymi kopiami stylu rozjechałoby się przy pierwszej zmianie.
// ============================================================================

import { StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';

/** Wiersz bez wysokości: każdy plik dopisuje `minHeight: 52` w lokalnym `styles.wiersz` (skan celów dotyku czyta
 *  literał `minHeight` w stylu `styles.*` pliku z przyciskiem, tests/helpers/cele-dotykowe.ts). */
export const WIERSZ = {
  justifyContent: 'center',
  paddingVertical: 10,
  gap: odstepy.xs,
  borderTopWidth: 1,
  borderTopColor: theme.colors.linia,
} as const;

export const wierszUstawien = StyleSheet.create({
  rzad: { flexDirection: 'row', alignItems: 'center', gap: odstepy.m },
  pierwszy: { borderTopWidth: 0 },
  akcja: { fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.akcentTekst },
  usun: { fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.blad },
  opis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
});
