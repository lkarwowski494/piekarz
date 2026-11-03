// ============================================================================
// Piekarz — „Ostatnie wpisy” zakwasu: „Edytuj” przy wpisie (poprawa bez kasowania historii, F-62) i „Usuń wpis”
// bez pytania z paskiem „Przywróć” (D-051 1a) (design-spec §5; BR-ZAKW-007) [M1-audytor-generalny-104]
// ============================================================================

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StoredStarterEntry } from '../../data/db';
import { NumInput } from '../NumInput';
import { PasekCofnij } from '../PasekCofnij';
import { t } from '../../lib/i18n';
import { opisWpisu, zmienGodzine } from '../../lib/zakwas-widok';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';

/** Ile ostatnich wpisów pokazuje karta. */
export const LIMIT_WPISOW = 10;

export function StarterEntriesList({ entries, now, usuniety, onPopraw, onUsun, onPrzywroc, onSchowajPasek }: {
  entries: readonly StoredStarterEntry[];
  now: number;
  usuniety: StoredStarterEntry | null;
  onPopraw: (wpis: StoredStarterEntry, occurredAt: number) => void;
  onUsun: (id: string) => void;
  onPrzywroc: () => void;
  onSchowajPasek: () => void;
}) {
  const [edytowany, setEdytowany] = useState<StoredStarterEntry | null>(null);
  const [godzina, setGodzina] = useState(0);
  const [minuta, setMinuta] = useState(0);
  const [blad, setBlad] = useState(false);
  // Przy dużym tekście opis wpisu na całą szerokość, akcje pod nim (flexBasis od fontScale, README §7a) [M3 p2]
  const opisSzer = { flexBasis: useDuzyTekst() ? '100%' : 160 } as const;

  const otworz = (e: StoredStarterEntry) => {
    const d = new Date(e.occurredAt);
    setGodzina(d.getHours());
    setMinuta(d.getMinutes());
    setBlad(false);
    setEdytowany(e);
  };
  const zapisz = () => {
    if (!edytowany) return;
    const at = zmienGodzine(edytowany.occurredAt, godzina, minuta);
    if (at === null) {
      setBlad(true);
      return;
    }
    onPopraw(edytowany, at);
    setEdytowany(null);
  };

  return (
    <View style={styles.sekcja}>
      {/* Karta „Ostatnie wpisy” z wierszami (karty/README.md §2, makieta zakwasy.html) [M3 p2] */}
      {entries.length > 0 && (
        <Karta testID="karta-wpisy" tytul={t('Ostatnie wpisy')} ikona={<IkonaKarty nazwa="lista" />} bezWypelnienia>
          {entries.slice(0, LIMIT_WPISOW).map((e, i) => {
            const opis = opisWpisu(e, now);
            return (
              <View key={e.id} testID={`wpis-${e.id}`} style={[styles.wiersz, styles.linia, i === 0 && styles.bezLinii]}>
                <Text style={[styles.opis, opisSzer]}>{opis}</Text>
                <Pressable testID={`wpis-edytuj-${e.id}`} accessibilityRole="button" accessibilityLabel={t('Edytuj wpis: {opis}', { opis })} style={styles.akcja} onPress={() => otworz(e)}>
                  <Text style={styles.akcjaTekst}>{t('Edytuj')}</Text>
                </Pressable>
                <Pressable testID={`wpis-usun-${e.id}`} accessibilityRole="button" accessibilityLabel={t('Usuń wpis: {opis}', { opis })} style={styles.akcja} onPress={() => onUsun(e.id)}>
                  <Text style={styles.akcjaTekst}>{t('Usuń wpis')}</Text>
                </Pressable>
              </View>
            );
          })}
        </Karta>
      )}
      {usuniety && <PasekCofnij tekst={t('Usunięto wpis')} onPrzywroc={onPrzywroc} onUkryj={onSchowajPasek} testID="pasek-cofnij" przywrocTestID="pasek-cofnij-przywroc" />}
      <Modal visible={edytowany !== null} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setEdytowany(null)}>
        <View style={styles.tlo}>
          <View testID="wpis-arkusz" style={styles.arkusz}>
            <Text style={styles.naglowek}>{t('Edytuj wpis')}</Text>
            {edytowany && <Text style={styles.opis}>{opisWpisu(edytowany, now)}</Text>}
            <View style={styles.pola}>
              <View style={styles.pole}>
                <Text style={styles.etykieta}>{t('Godzina')}</Text>
                <NumInput testID="wpis-godzina" keyboardType="number-pad" value={godzina} onChangeNumber={setGodzina} accessibilityLabel={t('Godzina')} />
              </View>
              <View style={styles.pole}>
                <Text style={styles.etykieta}>{t('Minuta')}</Text>
                <NumInput testID="wpis-minuta" keyboardType="number-pad" value={minuta} onChangeNumber={setMinuta} accessibilityLabel={t('Minuta')} />
              </View>
            </View>
            {blad && <Text style={styles.blad}>{t('Godzina od 0 do 23, minuty od 0 do 59.')}</Text>}
            <View style={styles.rzad}>
              <Pressable testID="wpis-anuluj" accessibilityRole="button" style={styles.przycisk} onPress={() => setEdytowany(null)}>
                <Text style={styles.akcjaTekst}>{t('Anuluj')}</Text>
              </Pressable>
              <Pressable testID="wpis-zapisz" accessibilityRole="button" style={[styles.przycisk, styles.glowny]} onPress={zapisz}>
                <Text style={styles.glownyTekst}>{t('Zapisz')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sekcja: { gap: odstepy.s },
  naglowek: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz2 },
  // Wiersz w karcie: min 52, linia `linia` między wierszami (karty/README.md §2) [M3 p2]
  wiersz: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.s, minHeight: 52, paddingHorizontal: odstepy.l, paddingVertical: odstepy.xs },
  linia: { borderTopWidth: 1, borderTopColor: theme.colors.linia },
  bezLinii: { borderTopWidth: 0 },
  opis: { flex: 1, minWidth: 0, fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  akcja: { minHeight: theme.cele.pozostale, justifyContent: 'center', paddingHorizontal: odstepy.xs },
  akcjaTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.akcentTekst },
  tlo: { flex: 1, backgroundColor: theme.colors.tlo },
  arkusz: { gap: odstepy.m, padding: odstepy.xxl },
  pola: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.l },
  pole: { flexGrow: 1, flexBasis: 120, gap: odstepy.xs },
  etykieta: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  blad: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.blad },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s },
  przycisk: {
    flexGrow: 1,
    flexBasis: 120,
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  glowny: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  glownyTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '700', color: theme.colors.naAkcencie },
});
