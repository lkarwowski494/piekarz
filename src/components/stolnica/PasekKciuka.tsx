// ============================================================================
// Piekarz — Pasek kciuka prowadzenia (komponent systemu, design-spec §4, §11b „056”) [M1-audytor-generalny-056]
// „Zrobione” 64 pt pełnej szerokości (akcent + naAkcencie, promień 18), pod nim rząd 48 pt: „Cofnij poprzedni”
// i „Po co ten krok” (obwódka 1,5, promień 14). Przyklejony nad wskaźnikiem Home, poza przewijaną treścią.
// Zwarty (niski ekran, token uklad.niskiEkran, albo nad nim przełącznik wypieków): wszystkie trzy w jednym rzędzie,
// cel 48 pt (cele.glownyPrzeplyw), zawija się przy długich tekstach (rola 04 p4b) [M1-audytor-generalny-005].
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { useNiskiEkran } from '../../ui/niski-ekran';

export interface PasekKciukaProps {
  /** Nazwa bieżącego kroku (etykieta VoiceOver „Zrobione: {krok}”). */
  nazwaKroku: string;
  onZrobione: () => void;
  onCofnij: () => void;
  cofnijDostepne: boolean;
  onPoCo: () => void;
  poCoDostepne: boolean;
  /** Nad paskiem stoi przełącznik wypieków (dwa trwające): pasek zwarty jak na niskim ekranie. */
  przyPrzelaczniku?: boolean;
}

function Drugi({ testID, tekst, dostepny, onPress, zwarty }: { testID: string; tekst: string; dostepny: boolean; onPress: () => void; zwarty: boolean }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !dostepny }}
      disabled={!dostepny}
      onPress={onPress}
      style={[styles.drugi, zwarty && styles.drugiZwarty]}
    >
      <Text style={[styles.drugiTekst, !dostepny && styles.zablokowany]}>{tekst}</Text>
    </Pressable>
  );
}

export function PasekKciuka({ nazwaKroku, onZrobione, onCofnij, cofnijDostepne, onPoCo, poCoDostepne, przyPrzelaczniku = false }: PasekKciukaProps) {
  const zwarty = useNiskiEkran() || przyPrzelaczniku;
  return (
    <SafeAreaView edges={['bottom']} style={styles.tlo}>
      <View testID="thumb-bar" style={[styles.pasek, zwarty && styles.pasekZwarty]}>
        <Pressable
          testID="next-or-finish-step-btn"
          accessibilityRole="button"
          accessibilityLabel={t('Zrobione: {krok}', { krok: nazwaKroku })}
          onPress={onZrobione}
          style={[styles.glowny, zwarty && styles.glownyZwarty]}
        >
          <Text style={styles.glownyTekst}>{t('Zrobione')}</Text>
        </Pressable>
        <View style={[styles.rzad, zwarty && styles.rzadZwarty]}>
          <Drugi testID="step-undo-btn" tekst={t('Cofnij poprzedni')} dostepny={cofnijDostepne} onPress={onCofnij} zwarty={zwarty} />
          <Drugi testID="step-why-btn" tekst={t('Po co ten krok')} dostepny={poCoDostepne} onPress={onPoCo} zwarty={zwarty} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tlo: { backgroundColor: theme.colors.tlo },
  pasek: { paddingTop: odstepy.m, paddingHorizontal: odstepy.xl, paddingBottom: odstepy.m, gap: 10 },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  drugi: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  // Zwarty: „Zrobione” i oba drugie w jednym rzędzie (96 + 8 + 2 × 84 + 8 = 280 ≤ 288 przy 320 pt), wysokość 48
  pasekZwarty: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', paddingHorizontal: odstepy.l, paddingTop: odstepy.s, paddingBottom: odstepy.s, gap: odstepy.s },
  glownyZwarty: { minHeight: theme.cele.glownyPrzeplyw, flexGrow: 1, flexBasis: 96 },
  rzadZwarty: { flexGrow: 2, flexBasis: 176, gap: odstepy.s },
  drugiZwarty: { flexBasis: 84, paddingHorizontal: odstepy.xs, paddingVertical: odstepy.xs },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz, textAlign: 'center' },
  zablokowany: { color: theme.colors.zablokowane },
});
