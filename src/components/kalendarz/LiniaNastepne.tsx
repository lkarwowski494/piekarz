// ============================================================================
// Piekarz — linia „Następne” i zaległe z „Zrobione”/„Pomiń” (BR-KAL-003; D-094, D-105; makieta roli 04 a2-03) [M3 D4b]
// Zaległe na początku, każde z dwoma przyciskami (≥ 44 pt), potem jedno zdanie „Następne: … · …” w kroju treści
// i „+N” (44 × 44 pt) do arkusza najbliższych. Opcjonalne tym samym krojem i kolorem (różni je słowo). Bez przyszłych
// zdarzeń linii „Następne” nie ma (BR-KAL-003 „Brak przyszłych zdarzeń”). Ten sam wiersz zaległego w arkuszu dnia.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ZdarzenieKalendarza } from '../../core/kalendarz-zdarzenia';
import { etykietyZaleglego, napisyZaleglego, type OpcjeTekstu, type TekstyNastepne } from '../../lib/kalendarz-teksty';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { GlifZaleglego } from './GlifZdarzenia';

export interface AkcjeZaleglego {
  onZrobione: (z: ZdarzenieKalendarza) => void;
  onPomin: (z: ZdarzenieKalendarza) => void;
}

/** „Pomiń” ma sens, gdy jest następny krok albo termin karmienia; „gotowe” po ostatnim kroku kończy się na Stolnicy. */
const moznaPominac = (z: ZdarzenieKalendarza) => z.rodzaj !== 'wypiek-gotowe';

export function WierszZaleglego({ z, tekst, o, naPasie, akcje }: { z: ZdarzenieKalendarza; tekst: string; o: OpcjeTekstu; naPasie: boolean; akcje: AkcjeZaleglego }) {
  const napisy = napisyZaleglego();
  const etykiety = etykietyZaleglego(z, o);
  const kolor = naPasie ? styles.tekstNaPasie : styles.tekstZwykly;
  return (
    <View style={styles.zalegle} testID={`zalegle-${z.id}`}>
      <View style={styles.zdanie}>
        <GlifZaleglego tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} />
        <Text style={[styles.tresc, kolor]}>{tekst}</Text>
      </View>
      <View style={styles.przyciski}>
        <Pressable testID={`zalegle-zrobione-${z.id}`} accessibilityRole="button" accessibilityLabel={etykiety.zrobione}
          style={[styles.przycisk, styles.zrobione]} onPress={() => akcje.onZrobione(z)}>
          <Text style={styles.zrobioneTekst}>{napisy.zrobione}</Text>
        </Pressable>
        {moznaPominac(z) && (
          <Pressable testID={`zalegle-pomin-${z.id}`} accessibilityRole="button" accessibilityLabel={etykiety.pomin}
            style={[styles.przycisk, naPasie ? styles.pominNaPasie : styles.pominZwykly]} onPress={() => akcje.onPomin(z)}>
            <Text style={[styles.pominTekst, kolor]}>{napisy.pomin}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function LiniaNastepne({ teksty, zalegle, o, akcje, onPlus }: {
  teksty: TekstyNastepne;
  zalegle: readonly ZdarzenieKalendarza[];
  o: OpcjeTekstu;
  akcje: AkcjeZaleglego;
  onPlus: () => void;
}) {
  if (zalegle.length === 0 && teksty.nastepne === null) return null;
  return (
    <View style={styles.linia} testID="linia-nastepne">
      {zalegle.map((z, i) => (
        <WierszZaleglego key={z.id} z={z} tekst={teksty.zalegle[i] ?? ''} o={o} naPasie akcje={akcje} />
      ))}
      {teksty.nastepne !== null && (
        <View style={styles.nastepne}>
          {/* Jedno zdanie dla VoiceOver: pełna lista przyszłych, także spod „+N” (D-106 pkt 5) */}
          <Text testID="linia-nastepne-zdanie" style={[styles.tresc, styles.tekstNaPasie]} accessibilityLabel={teksty.etykieta}>
            {teksty.nastepne}
          </Text>
          {teksty.plus !== null && (
            <Pressable testID="linia-nastepne-plus" accessibilityRole="button" accessibilityLabel={teksty.etykietaPlus ?? undefined} style={styles.plus} onPress={onPlus}>
              <Text style={[styles.plusTekst, styles.tekstNaPasie]}>{teksty.plus}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linia: { gap: odstepy.s },
  zalegle: { gap: odstepy.s },
  zdanie: { flexDirection: 'row', alignItems: 'flex-start', gap: odstepy.s },
  tresc: { flexShrink: 1, fontSize: typografia.style.tresc.pt },
  tekstNaPasie: { color: theme.colors.naPasie },
  tekstZwykly: { color: theme.colors.tusz },
  przyciski: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s },
  przycisk: { flexGrow: 1, flexBasis: 120, minHeight: theme.cele.pozostale, borderRadius: promienie.przycisk, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m, paddingVertical: odstepy.xs },
  zrobione: { backgroundColor: theme.colors.ostrzTlo },
  zrobioneTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.ostrzTusz, textAlign: 'center' },
  pominNaPasie: { borderWidth: 1.5, borderColor: theme.colors.naPasie },
  pominZwykly: { borderWidth: 1.5, borderColor: theme.colors.obwodka },
  pominTekst: { fontSize: typografia.style.naglowek.pt, textAlign: 'center' },
  nastepne: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: odstepy.xs },
  plus: { minWidth: theme.cele.pozostale, minHeight: theme.cele.pozostale, alignItems: 'center', justifyContent: 'center' },
  plusTekst: { fontSize: typografia.style.tresc.pt, fontWeight: '700', textDecorationLine: 'underline' },
});
