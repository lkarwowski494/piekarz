// ============================================================================
// Piekarz — widok miesiąca na pasie „Dziś” (BR-KAL-013; makieta roli 04 a2 `12-miesiac`; D-114) [M3 D7]
// Siatka 7 kolumn od pierwszego dnia tygodnia regionu: każdy dzień to przycisk na całą komórkę (≥ 44 pt), dziś
// w ramce, dni sąsiednich miesięcy przygaszone, glify zdarzeń kształtem jak na pasku tygodnia; dotknięcie otwiera
// arkusz dnia (z niego przejście do wpisu Dziennika). Wąski ekran (≤ 336 pt): od krawędzi do krawędzi. AX5:
// lista dni z wpisami (etykieta słowami) zamiast siatki. Kolory tylko z tokenów pasa.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import { glifyDnia } from '../../lib/kalendarz-pasek';
import { etykietaDnia, type OpcjeTekstu } from '../../lib/kalendarz-teksty';
import type { DzienMiesiaca } from '../../lib/kalendarz-widok';
import type { ZdarzenieKalendarza } from '../../core/kalendarz-zdarzenia';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { GlifPiekarnika, GlifZaleglego, GlifZdarzenia } from './GlifZdarzenia';

export interface MiesiacKalendarzaProps {
  tygodnie: readonly (readonly DzienMiesiaca[])[];
  zdarzenia: readonly ZdarzenieKalendarza[];
  wypieki: readonly string[];
  o: OpcjeTekstu;
  duzyTekst: boolean;
  waski: boolean;
  onDzien: (d: DzienMiesiaca) => void;
}

export function MiesiacKalendarza(p: MiesiacKalendarzaProps) {
  const etykieta = (d: DzienMiesiaca) => etykietaDnia(p.zdarzenia.filter((z) => z.dzien === d.klucz), d, p.o);

  if (p.duzyTekst) {
    const zWpisami = p.tygodnie.flat().filter((d) => d.wMiesiacu && p.zdarzenia.some((z) => z.dzien === d.klucz));
    return (
      <View style={styles.lista} accessibilityRole="list" testID="miesiac-lista">
        {zWpisami.length === 0 && <Text style={styles.pusto}>{t('Nic w planach')}</Text>}
        {zWpisami.map((d) => (
          <Pressable key={d.klucz} testID={`miesiac-dzien-${d.klucz}`} accessibilityRole="button" accessibilityLabel={etykieta(d)}
            style={[styles.wiersz, d.dzis && styles.ramka]} onPress={() => p.onDzien(d)}>
            <Text style={styles.wierszTekst}>{etykieta(d)}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View testID="miesiac-siatka" style={p.waski ? styles.siatkaWaska : styles.siatkaSzeroka}>
      {p.tygodnie.map((tydzien, i) => (
        <View key={tydzien[0]?.klucz ?? i} style={styles.rzad}>
          {tydzien.map((d) => {
            const g = glifyDnia(p.zdarzenia, d.klucz, p.wypieki);
            return (
              <Pressable key={d.klucz} testID={`miesiac-dzien-${d.klucz}`} accessibilityRole="button" accessibilityLabel={etykieta(d)}
                accessibilityState={{ selected: d.dzis }} style={styles.dzien} onPress={() => p.onDzien(d)}>
                <View style={[styles.numer, d.dzis && styles.ramka]}>
                  <Text style={[styles.numerTekst, !d.wMiesiacu && styles.pozaMiesiacem, d.dzis && styles.dzisTekst]}>{d.numer}</Text>
                </View>
                <View style={styles.glify}>
                  {g.zalegle && <GlifZaleglego tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={10} />}
                  {g.glify.map((x) =>
                    x === 'piekarnik' ? (
                      <GlifPiekarnika key={x} tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={10} />
                    ) : (
                      <GlifZdarzenia key={x} glif={x} kolor={x === 'plan' ? theme.colors.naPasie2 : theme.colors.ratanNaPasie} />
                    )
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  siatkaWaska: { marginHorizontal: -odstepy.l },
  siatkaSzeroka: { marginHorizontal: -odstepy.xs },
  rzad: { flexDirection: 'row' },
  dzien: { flex: 1, minHeight: theme.cele.pozostale, alignItems: 'center', paddingVertical: 2, gap: 2 },
  numer: { minWidth: 32, minHeight: 32, borderRadius: promienie.przycisk, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  numerTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.naPasie, fontVariant: ['tabular-nums'] },
  pozaMiesiacem: { color: theme.colors.naPasie2 },
  dzisTekst: { fontWeight: '700' },
  ramka: { borderColor: theme.colors.naPasie },
  glify: { flexDirection: 'row', gap: 2, minHeight: 12, alignItems: 'center' },
  lista: { gap: odstepy.s },
  pusto: { fontSize: typografia.style.tresc.pt, color: theme.colors.naPasie2 },
  wiersz: { minHeight: theme.cele.pozostale, paddingVertical: odstepy.s, paddingHorizontal: odstepy.m, borderRadius: promienie.przycisk, borderWidth: 2, borderColor: 'transparent' },
  wierszTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.naPasie },
});
