// ============================================================================
// Piekarz — Doktor zakwasu: „Coś mnie niepokoi” → objaw → możliwe przyczyny → co zrobić (BR-DIAG-002;
// design-spec §5) [M1-audytor-generalny-104]. Wynik z czystej funkcji diagnoseStarter, bez zapisu do bazy
// (ADR-008); teksty dosłownie z docs/tresci/pl/doktor-zakwasu.md (rola 06). Plamy albo nalot → Ostrzeżenie
// z poleceniem wyrzucenia (RD-21-W1) zamiast listy przyczyn. Bez uprawnienia diagnoza (objawy bez plam) otwiera
// ekran zakupu przez strażnika 'doktor', a wiersz plam i Ostrzeżenie zostają poza blokadą (docs/monetyzacja.md
// BR-DIAG-002: „ostrzeżenie RD-21 zawsze”) [M1-audytor-generalny-027; 02-monetyzacja-503].
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { getStarters } from '../../../src/data/sqlite-store';
import { setupDay } from '../../../src/core/starter-log';
import { DOCTOR_ACTIONS_HEADER, DOCTOR_CAUSES_HEADER, STARTER_SYMPTOMS, diagnoseStarter, type StarterSymptom } from '../../../src/core/starter-doctor';
import { wZakladaniu } from '../../../src/lib/zakwas-widok';
import { Ostrzezenie } from '../../../src/components/Ostrzezenie';
import { WierszObjawu } from '../../../src/components/zakwas/WierszObjawu';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { useAppAccess } from '../../../src/lib/app-access';
import { theme } from '../../../src/ui/theme';
import { odstepy, promienie, typografia } from '../../../src/ui/tokeny';

/** Nazwy objawów (klucze PL dla t()); plamy i brak aktywności jak w zakładaniu (makieta zakwas.html). */
const NAZWY: Record<StarterSymptom, string> = {
  no_activity: 'Nic się nie dzieje',
  no_doubling: 'Nie podwaja objętości',
  long_unfed: 'Długo stał w lodówce bez dokarmiania',
  mold_signs: 'Kolorowe plamy albo puszysty nalot',
};
/** Objaw z ostrzeżeniem RD-21, dostępny zawsze; pozostałe objawy to płatna diagnoza. */
const PLAMY: StarterSymptom = 'mold_signs';
const PLATNE = STARTER_SYMPTOMS.filter((s) => s !== PLAMY);

export default function DoktorZakwasuScreen() {
  const { starterId } = useLocalSearchParams<{ starterId?: string }>();
  const [dzien, setDzien] = useState<number | null>(null);
  const [objawy, setObjawy] = useState<StarterSymptom[]>([]);
  const { blokada, chron, moze } = useAppAccess();
  const odblokowany = moze('doktor');

  useEffect(() => {
    void getStarters().then((lista) => {
      const s = lista.find((x) => x.id === starterId);
      setDzien(s && wZakladaniu(s) && s.setupStartedAt !== undefined ? setupDay(s.setupStartedAt, Date.now()) : null);
    });
  }, [starterId]);

  // Bez uprawnienia liczą się tylko plamy (także gdy dostęp wygasł na otwartym ekranie)
  const aktywne = useMemo(() => (odblokowany ? objawy : objawy.filter((s) => s === PLAMY)), [objawy, odblokowany]);
  const wynik = useMemo(() => diagnoseStarter({ setupDay: dzien, symptoms: aktywne }), [dzien, aktywne]);
  const przelacz = (s: StarterSymptom) => setObjawy((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const wiersz = (s: StarterSymptom, pierwszy: boolean) => (
    <WierszObjawu key={s} testID={`doktor-zakwasu-objaw-${s}`} tekst={t(NAZWY[s])} zaznaczony={aktywne.includes(s)} pierwszy={pierwszy}
      onPress={s === PLAMY ? () => przelacz(s) : chron('doktor', () => przelacz(s))} />
  );
  const lista = (naglowek: string, teksty: readonly string[]) =>
    teksty.length > 0 && (
      <View style={styles.lista}>
        <Text style={styles.naglowek}>{t(naglowek)}</Text>
        {teksty.map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.ekran} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" style={styles.tlo}>
      {dzien !== null && <Text style={styles.tresc}>{t('Dzień {n}', { n: dzien })}</Text>}
      <Text style={styles.naglowek}>{t('Co widzisz?')}</Text>
      {odblokowany ? (
        <View style={styles.grupa}>{STARTER_SYMPTOMS.map((s, i) => wiersz(s, i === 0))}</View>
      ) : (
        <>
          <BlokadaFunkcji {...blokada('doktor')}>
            <View style={styles.grupa}>{PLATNE.map((s, i) => wiersz(s, i === 0))}</View>
          </BlokadaFunkcji>
          <View style={styles.grupa}>{wiersz(PLAMY, true)}</View>
        </>
      )}
      {wynik?.kind === 'discard' && <Ostrzezenie tytul={t(wynik.title)} tekst={t(wynik.action)} testID="doktor-zakwasu-wyrzuc" />}
      {wynik?.kind === 'advice' && (
        <View testID={`doktor-zakwasu-${wynik.symptom}`} style={styles.wynik}>
          {wynik.intro.map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
          {lista(DOCTOR_CAUSES_HEADER, wynik.causes)}
          {lista(DOCTOR_ACTIONS_HEADER, wynik.actions)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tlo: { backgroundColor: theme.colors.tlo },
  ekran: { gap: odstepy.m, padding: odstepy.l, paddingBottom: odstepy.xxxl },
  naglowek: { fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.tusz },
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  grupa: { borderRadius: promienie.grupa, backgroundColor: theme.colors.powierzchnia },
  wynik: { gap: odstepy.m, padding: odstepy.l, borderRadius: promienie.grupa, backgroundColor: theme.colors.powierzchnia },
  lista: { gap: odstepy.xs },
});
