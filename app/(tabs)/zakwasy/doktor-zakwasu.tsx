// ============================================================================
// Piekarz — Doktor zakwasu: „Coś mnie niepokoi” → objaw → możliwe przyczyny → co zrobić (BR-DIAG-002;
// design-spec §5) [M1-audytor-generalny-104]. Wynik z czystej funkcji diagnoseStarter, bez zapisu do bazy
// (ADR-008); teksty dosłownie z docs/tresci/pl/doktor-zakwasu.md (rola 06). Plamy albo nalot → Ostrzeżenie
// z poleceniem wyrzucenia (RD-21-W1) zamiast listy przyczyn. Bez uprawnienia diagnoza (objawy bez plam) otwiera
// ekran zakupu przez strażnika 'doktor', a wiersz plam i Ostrzeżenie zostają poza blokadą (docs/monetyzacja.md
// BR-DIAG-002: „ostrzeżenie RD-21 zawsze”) [M1-audytor-generalny-027; 02-monetyzacja-503].
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EkranZPasem } from '../../../src/components/nawigacja/EkranZPasem';
import { PasZakladki, usePasekStanuJasny } from '../../../src/components/nawigacja/PasZakladki';
import { t } from '../../../src/lib/i18n';
import { getStarters } from '../../../src/data/sqlite-store';
import { setupDay } from '../../../src/core/starter-log';
import { DOCTOR_ACTIONS_HEADER, DOCTOR_CAUSES_HEADER, STARTER_SYMPTOMS, diagnoseStarter, type StarterSymptom } from '../../../src/core/starter-doctor';
import { wZakladaniu } from '../../../src/lib/zakwas-widok';
import { Ostrzezenie } from '../../../src/components/Ostrzezenie';
import { Karta } from '../../../src/ui/karty/Karta';
import { PoleObjawu } from '../../../src/ui/karty/PoleObjawu';
import { IkonaKarty } from '../../../src/ui/karty/IkonaKarty';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { useAppAccess } from '../../../src/lib/app-access';
import { theme } from '../../../src/ui/theme';
import { odstepy, typografia } from '../../../src/ui/tokeny';

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
  // Pas O3a zamiast nagłówka stosu (04-005, D-219; jak Doktor Chleba, D-197): jasny pasek stanu nad pasem
  const router = useRouter();
  const gora = useSafeAreaInsets().top;
  usePasekStanuJasny();

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
  // Objawy jedną kontrolką PoleObjawu jak w karcie zakwasu; sekcje w kartach (karty/README.md §1–§2, §4) [M3 p2]
  const wiersz = (s: StarterSymptom) => (
    <PoleObjawu key={s} testID={`doktor-zakwasu-objaw-${s}`} etykieta={t(NAZWY[s])} zaznaczone={aktywne.includes(s)}
      onZmien={s === PLAMY ? () => przelacz(s) : chron('doktor', () => przelacz(s))} />
  );
  const lista = (naglowek: string, teksty: readonly string[]) =>
    teksty.length > 0 && (
      <View style={styles.lista}>
        <Text style={styles.naglowek}>{t(naglowek)}</Text>
        {teksty.map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
      </View>
    );

  return (
    <SafeAreaView style={styles.tlo} edges={['left', 'right']}>
      {/* Tytuł na pasie (nagłówek VoiceOver), powrót ikoną z etykietą jak w Doktorze Chleba; czapka paska stanu z EkranZPasem */}
      <EkranZPasem gora={gora} tytul={t('Doktor zakwasu')} contentContainerStyle={styles.ekran} pas={(onLayout) => (
        <View style={styles.pas}>
          <PasZakladki gora={gora} tytul={t('Doktor zakwasu')} wstecz={{ etykieta: t('Wstecz'), onPress: () => router.back() }} onLayout={onLayout} />
        </View>
      )}>
      <Karta testID="karta-objawy" tytul={t('Co widzisz?')} ikona={<IkonaKarty nazwa="sloik" />}>
        {dzien !== null && <Text style={styles.tresc}>{t('Dzień {n}', { n: dzien })}</Text>}
        {odblokowany ? (
          <View style={styles.grupa}>{STARTER_SYMPTOMS.map((s) => wiersz(s))}</View>
        ) : (
          <>
            <BlokadaFunkcji {...blokada('doktor')}>
              <View style={styles.grupa}>{PLATNE.map((s) => wiersz(s))}</View>
            </BlokadaFunkcji>
            <View style={styles.grupa}>{wiersz(PLAMY)}</View>
          </>
        )}
      </Karta>
      {wynik?.kind === 'discard' && <Ostrzezenie tytul={t(wynik.title)} tekst={t(wynik.action)} testID="doktor-zakwasu-wyrzuc" />}
      {wynik?.kind === 'advice' && (
        <View testID={`doktor-zakwasu-${wynik.symptom}`}>
          <Karta testID="karta-wynik" tytul={t(NAZWY[wynik.symptom === 'first_day' ? 'no_activity' : wynik.symptom])} ikona={<IkonaKarty nazwa="info" />}>
            {wynik.intro.map((z) => <Text key={z} style={styles.tresc}>{t(z)}</Text>)}
            {lista(DOCTOR_CAUSES_HEADER, wynik.causes)}
            {lista(DOCTOR_ACTIONS_HEADER, wynik.actions)}
          </Karta>
        </View>
      )}
      </EkranZPasem>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1, backgroundColor: theme.colors.tlo },
  // Pas na pełną szerokość i do samej góry mimo wcięcia treści (jak Doktor Chleba)
  pas: { marginHorizontal: -odstepy.l, marginTop: -odstepy.l },
  ekran: { gap: odstepy.m, padding: odstepy.l, paddingBottom: odstepy.xxxl },
  // Podnagłówek w karcie mniejszy niż nagłówek karty (20 pt) [M3 p2]
  naglowek: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  grupa: { gap: odstepy.s },
  lista: { gap: odstepy.xs },
});
