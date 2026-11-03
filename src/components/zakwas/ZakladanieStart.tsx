// ============================================================================
// Piekarz — start zakładania zakwasu od zera (BR-ZAKW-005 „Start”; Start → „Zakładam zakwas” → Zakwasy, PR-11)
// [M1-audytor-generalny-104]. Plan dnia 1 i „średnio 7–10 dni” dosłownie z docs/tresci/pl/zakwas-od-zera.md
// (rola 06); „Zapisz dokarmienie” tworzy zakwas w dniu 1 z pierwszym wpisem w jednej transakcji (ADR-008).
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StoredStarter } from '../../data/db';
import { createStarterWithEntry } from '../../data/starter-entries-store';
import { SETUP_GUIDE } from '../../core/starter-log';
import { t } from '../../lib/i18n';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { nowyWpis } from './useStarterLog';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

/** Nowy zakwas w dniu 1: mąka i woda w równych ilościach (ZAK-ZAL-002 → hydratacja 100%), na blacie (ZAK-ZAL-014). */
export function nowyZakwasZakladany(at: number): StoredStarter {
  return { id: `starter_${at}`, name: t('Mój zakwas'), flourType: '', hydration: 100, birthDate: at, storageState: 'ROOM_TEMP', setupStartedAt: at };
}

export function ZakladanieStart({ onZapisz }: { onZapisz: (utworz: () => Promise<void>) => void }) {
  const utworz = async () => {
    const at = Date.now();
    const s = nowyZakwasZakladany(at);
    await createStarterWithEntry(s, nowyWpis(s.id, 'feeding', at));
  };
  return (
    // Karta systemu kart (karty/README.md §2; makieta zakwasy.html, stan „pusty”) [M3 p2]
    <View testID="zakladanie-start">
    <Karta testID="karta-zakladanie" tytul={t('Zakładam zakwas')} ikona={<IkonaKarty nazwa="sloik" />}>
      {[...SETUP_GUIDE.start, ...SETUP_GUIDE.day1].map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
      <Pressable testID="zakladanie-pierwsze-dokarmienie-btn" accessibilityRole="button" style={styles.glowny} onPress={() => onZapisz(utworz)}>
        <Text style={styles.glownyTekst}>{t('Zapisz dokarmienie')}</Text>
      </Pressable>
    </Karta>
    </View>
  );
}

const styles = StyleSheet.create({
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  glowny: { minHeight: theme.cele.glownyPrzeplyw, justifyContent: 'center', alignItems: 'center', paddingHorizontal: odstepy.l, borderRadius: promienie.przyciskGlowny, backgroundColor: theme.colors.akcent },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '700', color: theme.colors.naAkcencie, textAlign: 'center' },
});
