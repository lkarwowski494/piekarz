// ============================================================================
// Piekarz — zakładanie zakwasu dzień po dniu (BR-ZAKW-005; design-spec §6 stany `zakladanie-dzien-3` i `plesn`;
// makieta ekrany/zakwas.html) [M1-audytor-generalny-104]. Dzień N, plan dnia i wynik obserwacji z czystych funkcji
// src/core/starter-log.ts; teksty dziedzinowe dosłownie z docs/tresci/pl/zakwas-od-zera.md (rola 06).
// Plamy albo nalot → komponent Ostrzeżenie (RD-21-W1) z „Zacznij od nowa” zamiast listy.
// ============================================================================

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ostrzezenie } from '../Ostrzezenie';
import { WierszObjawu } from './WierszObjawu';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { dzienSlownie } from '../../lib/spirala-etykieta';
import { NAZWY_OBJAWOW } from '../../lib/zakwas-widok';
import { SETUP_GUIDE, STARTER_SIGNS, setupStageForDay, type SetupOutcome, type StarterSign } from '../../core/starter-log';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

/** Dni na pasku: średnio 7–10 (ZAK-ZAL-001); dalsze dni rozszerzają pasek. */
const DNI_PASKA = 10;

export function StarterSetupCard({ dzien, wynik, now, onZapiszDzien, onZacznijOdNowa, onZostaw, onUlozPlan }: {
  dzien: number;
  /** Wynik ostatniego „Zapisz dzień N”; null = jeszcze nie zapisano. */
  wynik: SetupOutcome | null;
  now: number;
  onZapiszDzien: (signs: StarterSign[]) => void;
  onZacznijOdNowa: () => void;
  onZostaw: () => void;
  onUlozPlan: () => void;
}) {
  const [zaznaczone, setZaznaczone] = useState<StarterSign[]>([]);
  const przelacz = (s: StarterSign) => setZaznaczone((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const dni = Array.from({ length: Math.max(DNI_PASKA, dzien) }, (_, i) => i + 1);

  if (wynik?.kind === 'discard') {
    return (
      <View testID="zakladanie-plesn" style={styles.karta}>
        <Ostrzezenie tytul={t(wynik.texts[0])} tekst={t(wynik.texts[1])} testID="zakladanie-ostrzezenie" />
        <Pressable testID="zakladanie-od-nowa-btn" accessibilityRole="button" style={styles.glowny} onPress={onZacznijOdNowa}>
          <Text style={styles.glownyTekst}>{t('Zacznij od nowa')}</Text>
        </Pressable>
        <Pressable testID="zakladanie-zostaw-btn" accessibilityRole="button" style={styles.drugi} onPress={onZostaw}>
          <Text style={styles.drugiTekst}>{t('Zostaw zapis i wróć')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View testID="zakladanie-karta" style={styles.karta}>
      <Text accessibilityRole="header" style={styles.tytul}>{t('Dzień {n}', { n: dzien })}</Text>
      {SETUP_GUIDE.start.map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
      <View style={styles.dni} accessible accessibilityRole="image" accessibilityLabel={t('Dzień {n} zakładania zakwasu', { n: dzien })}>
        {dni.map((d) => (
          <View key={d} style={[styles.dzien, d < dzien && styles.dzienZrobiony, d === dzien && styles.dzienDzis]}>
            <Text style={[styles.dzienTekst, d < dzien && styles.dzienTekstZrobiony, d === dzien && styles.dzienTekstDzis]}>{d}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.naglowek}>{t('Co dziś zrobić')}</Text>
      {SETUP_GUIDE[setupStageForDay(dzien)].map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
      {wynik && (
        <View testID={`zakladanie-wynik-${wynik.kind}`} style={styles.wynik}>
          {wynik.texts.map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
          {(wynik.kind === 'first_day_normal' || wynik.kind === 'continue') && wynik.nextFeedingAt !== null && (
            <Text style={styles.wazne}>
              {t('Następne dokarmienie: {dzien} o {godzina}.', { dzien: dzienSlownie(new Date(wynik.nextFeedingAt), new Date(now)), godzina: formatTime(wynik.nextFeedingAt) })}
            </Text>
          )}
          {wynik.kind === 'ready' && (
            <Pressable testID="zakladanie-uloz-plan-btn" accessibilityRole="button" style={styles.glowny} onPress={onUlozPlan}>
              <Text style={styles.glownyTekst}>{t('Ułóż plan')}</Text>
            </Pressable>
          )}
        </View>
      )}
      <Text style={styles.naglowek}>{t('Co widzisz?')}</Text>
      <View style={styles.grupa}>
        {STARTER_SIGNS.map((s, i) => (
          <WierszObjawu key={s} testID={`zakladanie-objaw-${s}`} tekst={t(NAZWY_OBJAWOW[s])} zaznaczony={zaznaczone.includes(s)} pierwszy={i === 0} onPress={() => przelacz(s)} />
        ))}
      </View>
      <Pressable testID="zakladanie-zapisz-btn" accessibilityRole="button" style={styles.glowny} onPress={() => onZapiszDzien(zaznaczone)}>
        <Text style={styles.glownyTekst}>{t('Zapisz dzień {n}', { n: dzien })}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  karta: { gap: odstepy.m, padding: odstepy.l, marginBottom: odstepy.l, borderRadius: promienie.grupa, backgroundColor: theme.colors.powierzchnia },
  tytul: { fontFamily: typografia.krojTytulow, fontSize: typografia.style.tytulKroku.pt, fontWeight: '700', color: theme.colors.tusz },
  naglowek: { fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.tusz },
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  wazne: { fontSize: typografia.style.tresc.pt, fontWeight: '700', color: theme.colors.tusz },
  dni: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dzien: { minWidth: 40, minHeight: 40, borderRadius: 20, borderWidth: 1.5, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center' },
  dzienZrobiony: { backgroundColor: theme.colors.ratan, borderColor: theme.colors.ratan },
  dzienDzis: { borderWidth: 3, borderColor: theme.colors.tusz },
  dzienTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  dzienTekstZrobiony: { color: theme.colors.naAkcencie },
  dzienTekstDzis: { fontWeight: '700' },
  wynik: { gap: odstepy.s, padding: odstepy.m, borderRadius: promienie.grupa, backgroundColor: theme.colors.tloGrupa },
  grupa: { borderRadius: promienie.grupa, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.linia },
  glowny: { minHeight: theme.cele.glownyPrzeplyw, justifyContent: 'center', alignItems: 'center', paddingHorizontal: odstepy.l, borderRadius: promienie.przyciskGlowny, backgroundColor: theme.colors.akcent },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '700', color: theme.colors.naAkcencie, textAlign: 'center' },
  drugi: { minHeight: theme.cele.glownyPrzeplyw, justifyContent: 'center', alignItems: 'center', paddingHorizontal: odstepy.l, borderRadius: promienie.przycisk, borderWidth: 1, borderColor: theme.colors.obwodka },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.akcentTekst, textAlign: 'center' },
});
