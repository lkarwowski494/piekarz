// ============================================================================
// Piekarz — zakładka „Dziś”: Start „Co dziś robisz?” (BR-START-001, F-68, H-08; design-spec §6, §10;
// makieta docs/design/ekrany/start.html) i Ustawienia z „Dziś” (D-051 2a). Zastępuje powitanie z wyborem
// stylu (OnboardingModal): bez intro, powrót do trwającego wypieku od razu. [M1-audytor-generalny-101]
// ============================================================================

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { useAppAccess } from '../../../src/lib/app-access';
import { czyBylDostep } from '../../../src/lib/platnosci/stan';
import { CZYNNOSCI_STARTU, celCzynnosci, stanStartu, ustawRodzajReceptur, type CzynnoscStartu } from '../../../src/lib/start-stan';
import { useStanStartu } from '../../../src/hooks/useStanStartu';
import { WyborCzynnosci } from '../../../src/components/start/WyborCzynnosci';
import { TrwajacyWypiek } from '../../../src/components/start/TrwajacyWypiek';
import { IkonaStartu } from '../../../src/components/start/IkonaStartu';
import { PrzyciskNaglowka } from '../../../src/components/nawigacja/PrzyciskNaglowka';
import { SettingsModal } from '../../../src/components/SettingsModal';
import { CorruptStateRecoveryBanner } from '../../../src/components/CorruptStateRecoveryBanner';
import { UprzedzenieProby, useUprzedzenieProby } from '../../../src/components/start/UprzedzenieProby';
import { theme } from '../../../src/ui/theme';
import { odstepy, promienie, typografia } from '../../../src/ui/tokeny';

export default function StartScreen() {
  const router = useRouter();
  const { access, loading, setPaywallVisible } = useAppAccess();
  const dane = useStanStartu();
  const [ustawienia, setUstawienia] = useState(false);
  // Do pierwszego odczytu sklepu bez kłódek: brak odpowiedzi App Store to nie koniec próby
  const stan = stanStartu({ trwaWypiek: dane.sesja !== null, dostep: access.canCreateNewBake || loading, maDane: dane.maDane });
  // Uprzedzenie przed końcem próby: raz, w treści „Dziś” (§11d 126) [M1-audytor-generalny-126]
  const uprzedzenie = useUprzedzenieProby();
  // Nagłówek „tylko historia” mówi o końcu próby tylko po dostępie z App Store (nie po samym imporcie) [M1-audytor-generalny-143]
  const [bylDostep, setBylDostep] = useState<boolean | null>(null);
  useEffect(() => {
    let zywy = true;
    if (stan === 'tylko-historia') void czyBylDostep().then((b) => zywy && setBylDostep(b));
    return () => {
      zywy = false;
    };
  }, [stan]);
  const banerProby = uprzedzenie.wariant ? <UprzedzenieProby wariant={uprzedzenie.wariant} onZamknij={uprzedzenie.zamknij} /> : null;

  // Wybór otwiera pierwszy ekran przepływu bez oferty (D-047); oferta przy pierwszej akcji liczącej lub zapisującej
  const wybierz = (c: CzynnoscStartu) => {
    const cel = celCzynnosci(c);
    if (cel.rodzaj) ustawRodzajReceptur(cel.rodzaj);
    router.navigate(cel.trasa);
  };

  const lista = (zdanie: boolean) => (
    <View style={styles.grupa} testID="start-czynnosci">
      {CZYNNOSCI_STARTU.map((c, i) => (
        <WyborCzynnosci
          key={c}
          czynnosc={c}
          zdanie={zdanie}
          zablokowane={stan === 'tylko-historia'}
          ostatni={i === CZYNNOSCI_STARTU.length - 1}
          onPress={() => wybierz(c)}
        />
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: stan === 'wybor' ? t('Co dziś robisz?') : t('Dziś'),
          headerRight: () => (
            <PrzyciskNaglowka
              testID="open-settings-btn"
              etykieta={t('Ustawienia')}
              ikona={<IkonaStartu nazwa="ustawienia" kolor={theme.colors.akcentTekst} rozmiar={24} />}
              onPress={() => setUstawienia(true)}
            />
          ),
        }}
      />
      <ScrollView
        style={styles.ekran}
        contentContainerStyle={styles.tresc}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <CorruptStateRecoveryBanner />
        {stan !== 'trwa-wypiek' && banerProby}
        {dane.gotowe && stan === 'trwa-wypiek' && dane.sesja && dane.zegar && (
          <>
            <TrwajacyWypiek sesja={dane.sesja} zegar={dane.zegar} teraz={dane.teraz} onWroc={() => router.push('/stolnica')} />
            {banerProby}
            <Text style={styles.naglowekGrupy} accessibilityRole="header">{t('Co jeszcze dziś robisz?')}</Text>
            {lista(false)}
          </>
        )}
        {dane.gotowe && stan === 'tylko-historia' && (
          <>
            <View style={styles.baner} testID="start-tylko-historia">
              {bylDostep !== null && (
                <Text style={styles.banerHeading}>{bylDostep ? t('Okres próbny się skończył') : t('Piekarz Pro nie jest aktywny')}</Text>
              )}
              <Text style={styles.banerTekst}>
                {t('Twoje receptury, zakwasy i dziennik są do przeglądania, eksportu i usunięcia. Przypomnienia o dokarmianiu są wyłączone. Liczenie, plan i prowadzenie wymagają Piekarz Pro.')}
              </Text>
              <Pressable
                testID="start-zobacz-plany-btn"
                accessibilityRole="button"
                accessibilityLabel={t('Zobacz plany')}
                style={styles.drugi}
                onPress={() => setPaywallVisible(true)}
              >
                <Text style={styles.drugiTekst}>{t('Zobacz plany')}</Text>
              </Pressable>
            </View>
            {lista(false)}
          </>
        )}
        {dane.gotowe && stan === 'wybor' && (
          <>
            {lista(true)}
            {!dane.maDane && (
              <Text style={styles.objasnienie}>
                {t('Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.')}
              </Text>
            )}
          </>
        )}
      </ScrollView>
      <SettingsModal visible={ustawienia} onClose={() => setUstawienia(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: theme.colors.tlo },
  tresc: { padding: odstepy.xl, paddingTop: odstepy.xs, gap: odstepy.m },
  grupa: { backgroundColor: theme.colors.powierzchnia, borderRadius: promienie.grupa, overflow: 'hidden' },
  naglowekGrupy: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2, marginTop: odstepy.xs },
  objasnienie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  baner: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: promienie.grupa,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    padding: odstepy.l,
    gap: odstepy.s,
  },
  banerHeading: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz, fontFamily: theme.typography.krojTytulow },
  banerTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  drugi: {
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
  },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
});
