// ============================================================================
// Piekarz — Ustawienia: „Źródła wiedzy” (D-123, M3 T2). Porady w aplikacji mówią bez przypisów, a nazwy źródeł są
// tylko tutaj (treść: src/core/zrodla-wiedzy.ts, rola 06). Adres to zwykły tekst do zaznaczenia, bez odnośnika
// i bez sieci (offline, CLAUDE.md §1). Wygląd z istniejących tokenów (karta i wiersz jak ZakupySection); do
// akceptacji roli 04. Duży tekst: bez stałych wysokości, tekst się zawija.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { typografia } from '../../ui/tokeny';
import { ZRODLA_WIEDZY, ZRODLA_WIEDZY_WSTEP } from '../../core/zrodla-wiedzy';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WIERSZ, wierszUstawien } from './wiersz-ustawien';

/** Karta w Ustawieniach z wejściem na ekran źródeł (M3 p5: karta z ikoną, wejście jako wiersz). */
export function ZrodlaWiedzySection({ onOtworz }: { onOtworz: () => void }) {
  return (
    <Karta testID="karta-zrodla" tytul={t('Źródła wiedzy')} ikona={<IkonaKarty nazwa="ksiazka" />}>
      <Text style={styles.opis}>{t('Skąd pochodzą porady, liczby i ostrzeżenia w aplikacji.')}</Text>
      <Pressable
        style={styles.wiersz}
        onPress={onOtworz}
        accessibilityRole="button"
        accessibilityLabel={t('Zobacz źródła')}
        testID="settings-zrodla-btn"
      >
        <Text style={wierszUstawien.akcja}>{t('Zobacz źródła')}</Text>
      </Pressable>
    </Karta>
  );
}

/** Treść ekranu „Źródła wiedzy”: wstęp i grupy z nagłówkami; każde źródło z nazwą, opisem i adresem. */
export function ZrodlaWiedzyEkran() {
  return (
    <>
      <Text style={styles.wstep}>{t(ZRODLA_WIEDZY_WSTEP)}</Text>
      {ZRODLA_WIEDZY.map((g) => (
        <View key={g.temat} style={styles.card}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t(g.temat)}</Text>
          {g.zrodla.map((z) => (
            <View key={z.nazwa} style={styles.zrodlo}>
              <Text style={styles.nazwa}>{t(z.nazwa)}</Text>
              <Text style={styles.opis}>{t(z.opis)}</Text>
              <Text style={styles.adres} selectable>{z.adres}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  // Wiersz w karcie (README §2): min 52, linia nad wierszem
  wiersz: { minHeight: 52, ...WIERSZ },
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  sectionTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  wstep: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz,
  },
  zrodlo: {
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.linia,
  },
  nazwa: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  opis: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    marginTop: 2,
  },
  adres: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    marginTop: 2,
  },
});
