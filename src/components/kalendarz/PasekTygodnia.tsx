// ============================================================================
// Piekarz — pasek tygodnia na pasie „Dziś” (BR-KAL-001, BR-KAL-002; D-105, makieta roli 04 a2 `a2-03` 3+1) [M3 D4b]
// Siedem dni od krawędzi do krawędzi: każdy dzień to cały przycisk (≥ 44 pt; przy 320 pt 320/7 ≈ 45,7 pt, pomiar roli 04),
// dziś w ramce (kształt, nie tylko kolor), glify zdarzeń kształtem, wypiek wielodniowy jako ciągła linia. Etykieta
// VoiceOver dnia z danych (etykietaDnia). AX5: lista dni zamiast 7 kolumn — dziś i „Pokaż cały tydzień” (makieta AX5).
// Kolory tylko z tokenów pasa (naPasie, naPasie2, ratanNaPasie) i ostrzeżenia.
// ============================================================================

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import { ciagDnia, glifyDnia, type DzienPaska } from '../../lib/kalendarz-pasek';
import { czesciDnia, etykietaDnia } from '../../lib/kalendarz-teksty';
import type { ZdarzenieKalendarza } from '../../core/kalendarz-zdarzenia';
import type { ZnacznikDnia } from '../../core/kalendarz-nastepne';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { GlifPiekarnika, GlifZaleglego, GlifZdarzenia } from './GlifZdarzenia';
import { WierszDniaAx5 } from './WierszDniaAx5';

export interface PasekTygodniaProps {
  dni: readonly DzienPaska[];
  zdarzenia: readonly ZdarzenieKalendarza[];
  znaczniki: Record<string, ZnacznikDnia>;
  /** Id wypieków w kolejności (drugi = trójkąt). */
  wypieki: readonly string[];
  now: number;
  wieleWypiekow: boolean;
  /** Duży tekst (AX1–AX5): lista dni. */
  duzyTekst: boolean;
  /** Wąski ekran (≤ 336 pt): dni od krawędzi do krawędzi. */
  waski: boolean;
  onDzien: (klucz: string) => void;
}

export function PasekTygodnia(p: PasekTygodniaProps) {
  const [caly, ustawCaly] = useState(false);
  const ciag = ciagDnia(p.znaczniki, p.dni.map((d) => d.klucz));
  const o = { now: p.now, wieleWypiekow: p.wieleWypiekow };
  const dnia = (d: DzienPaska) => p.zdarzenia.filter((z) => z.dzien === d.klucz);
  const etykieta = (d: DzienPaska) => etykietaDnia(dnia(d), d, o);
  const czesci = (d: DzienPaska) => czesciDnia(dnia(d), d, o);

  if (p.duzyTekst) {
    // Inny tydzień niż bieżący (BR-KAL-008) nie ma „dziś”: cały tydzień od razu [M3 D7]
    const bezDzis = !p.dni.some((d) => d.dzis);
    const widoczne = caly || bezDzis ? p.dni : p.dni.filter((d) => d.dzis);
    return (
      <View style={styles.lista} accessibilityRole="list" accessibilityLabel={t('Ten tydzień')} testID="pasek-tygodnia">
        {widoczne.map((d) => (
          <WierszDniaAx5 key={d.klucz} testID={`pasek-dzien-${d.klucz}`} etykieta={etykieta(d)} czesci={czesci(d)} wypieki={p.wypieki}
            dzis={d.dzis} onPress={() => p.onDzien(d.klucz)} />
        ))}
        {!caly && !bezDzis && (
          <Pressable testID="pasek-caly-tydzien" accessibilityRole="button" style={styles.calyTydzien} onPress={() => ustawCaly(true)}>
            <Text style={styles.calyTydzienTekst}>{t('Pokaż cały tydzień')}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.rzad, p.waski ? styles.rzadWaski : styles.rzadSzeroki]} accessibilityLabel={t('Ten tydzień')} testID="pasek-tygodnia">
      {p.dni.map((d) => {
        const g = glifyDnia(p.zdarzenia, d.klucz, p.wypieki);
        const c = ciag[d.klucz];
        return (
          <Pressable key={d.klucz} testID={`pasek-dzien-${d.klucz}`} accessibilityRole="button" accessibilityLabel={etykieta(d)}
            accessibilityState={{ selected: d.dzis }} style={styles.dzien} onPress={() => p.onDzien(d.klucz)}>
            <Text style={styles.skrot} accessible={false}>{d.skrot}</Text>
            <View style={[styles.numer, d.dzis && styles.ramka]}>
              <Text style={[styles.numerTekst, d.dzis && styles.dzisTekst]}>{d.numer}</Text>
            </View>
            <View style={styles.glify}>
              {g.zalegle && <GlifZaleglego tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={12} />}
              {g.glify.map((x) =>
                x === 'piekarnik' ? (
                  <GlifPiekarnika key={x} tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={12} />
                ) : (
                  <GlifZdarzenia key={x} glif={x} kolor={x === 'plan' ? theme.colors.naPasie2 : theme.colors.ratanNaPasie} />
                )
              )}
            </View>
            {c && (c.lewa || c.prawa) && (
              <View testID={`pasek-ciag-${d.klucz}`} style={[styles.ciag, { left: c.lewa ? 0 : '50%', right: c.prawa ? 0 : '50%' }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rzad: { flexDirection: 'row' },
  rzadWaski: { marginHorizontal: -odstepy.l },
  rzadSzeroki: { marginHorizontal: -odstepy.xs },
  dzien: { flex: 1, minHeight: theme.cele.pozostale, alignItems: 'center', paddingVertical: odstepy.xs, gap: 2 },
  skrot: { fontSize: typografia.style.podpis.pt, color: theme.colors.naPasie2 },
  numer: { minWidth: 36, minHeight: 36, borderRadius: promienie.przycisk, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  numerTekst: { fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.naPasie, fontVariant: ['tabular-nums'] },
  ramka: { borderColor: theme.colors.naPasie },
  dzisTekst: { fontWeight: '700' },
  glify: { flexDirection: 'row', gap: 2, minHeight: 14, alignItems: 'center' },
  ciag: { position: 'absolute', bottom: 0, height: 2, backgroundColor: theme.colors.ratanNaPasie },
  lista: { gap: odstepy.s },
  calyTydzien: { minHeight: theme.cele.pozostale, justifyContent: 'center', alignItems: 'center', borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.naPasie2, paddingHorizontal: odstepy.m },
  calyTydzienTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.naPasie, textAlign: 'center' },
});
