// ============================================================================
// Piekarz — zakładka „Dziś” w wariancie 3+1 (D-105; makiety roli 04 a2 `a2-03` w31 i `dwa-tory-v2`) z kalendarzem 1.0
// (BR-KAL-001…007, D-106) [M3 D4b; wcześniej Start „Co dziś robisz?”, M1-audytor-generalny-101]. Od góry: pas w kolorze
// nocy do samej góry ekranu (tytuł, data, pasek tygodnia, „Następne”, zaległe z „Zrobione”/„Pomiń”, zębatka Ustawień),
// trzy kafle obok siebie (AX5 pod sobą), trwający wypiek jako duża spirala (dwa = jedna spirala z dwoma torami
// i legendą). Pas zastępuje natywny duży tytuł: nagłówek stosu ukryty, pasek stanu jasny na pasie (naglowek.ts, a1).
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../../src/lib/i18n';
import { useAppAccess } from '../../../src/lib/app-access';
import { rodzajDostepu } from '../../../src/lib/platnosci/stan';
import { CZYNNOSCI_STARTU, celCzynnosci, stanStartu, ustawRodzajReceptur, type CzynnoscStartu } from '../../../src/lib/start-stan';
import { useStanStartu } from '../../../src/hooks/useStanStartu';
import { useKalendarz } from '../../../src/hooks/useKalendarz';
import { useAkcjeDzis } from '../../../src/hooks/useAkcjeDzis';
import { WyborCzynnosci } from '../../../src/components/start/WyborCzynnosci';
import { WypiekiNaSpirali } from '../../../src/components/start/WypiekiNaSpirali';
import { PlanyWypiekow } from '../../../src/components/start/PlanyWypiekow';
import { ArkuszPlanu } from '../../../src/components/start/ArkuszPlanu';
import { usePlanyDzis } from '../../../src/hooks/usePlanyDzis';
import { ustawDzienGotowe } from '../../../src/lib/plan-receptury';
import { PasDzis } from '../../../src/components/start/PasDzis';
import { ArkuszDnia, type TrybArkusza } from '../../../src/components/kalendarz/ArkuszDnia';
import { PasekCofnij } from '../../../src/components/PasekCofnij';
import { SettingsModal } from '../../../src/components/SettingsModal';
import { CorruptStateRecoveryBanner } from '../../../src/components/CorruptStateRecoveryBanner';
import { UprzedzenieProby, useUprzedzenieProby } from '../../../src/components/start/UprzedzenieProby';
import { dataSlownie } from '../../../src/lib/kalendarz-pasek';
import { tekstyNastepne } from '../../../src/lib/kalendarz-teksty';
import type { ZdarzenieKalendarza } from '../../../src/core/kalendarz-zdarzenia';
import { theme } from '../../../src/ui/theme';
import { odstepy, promienie, typografia } from '../../../src/ui/tokeny';

/** Duży tekst (AX1–AX5) jak na innych ekranach (fontScale ≥ 2, 200); wąski ekran: pasek od krawędzi (pomiar roli 04). */
const DUZY_TEKST = 2;
const WASKI_PT = 336;

export default function StartScreen() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const gora = useSafeAreaInsets().top;
  const duzyTekst = fontScale >= DUZY_TEKST;
  const { access, loading, setPaywallVisible, requireActionAccess } = useAppAccess();
  const [odczyt, setOdczyt] = useState(0);
  const dane = useStanStartu(odczyt);
  // Ponowny odczyt po ustaleniu dostępu (koniec próby chowa terminy karmienia, BR-KAL-006)
  const kal = useKalendarz(`${access.canCreateNewBake}:${loading}`);
  const [ustawienia, setUstawienia] = useState(false);
  const [arkusz, setArkusz] = useState<TrybArkusza | null>(null);
  // Do pierwszego odczytu sklepu bez kłódek: brak odpowiedzi App Store to nie koniec próby
  const stan = stanStartu({ trwaWypiek: dane.wypieki.length > 0, dostep: access.canCreateNewBake || loading, maDane: dane.maDane });
  const uprzedzenie = useUprzedzenieProby();
  // Nagłówek „tylko historia” mówi o końcu próby tylko po dostępie z App Store [M1-audytor-generalny-143; audyt C-7]
  const [bylaProba, setBylaProba] = useState<boolean | null>(null);
  useEffect(() => {
    let zywy = true;
    if (stan === 'tylko-historia') void rodzajDostepu().then((r) => zywy && setBylaProba(r === 'proba'));
    return () => {
      zywy = false;
    };
  }, [stan]);

  // Pasek stanu jasny na ciemnym pasie tylko na „Dziś”; inne zakładki wracają do domyślnego (app/_layout.tsx)
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true);
      return () => StatusBar.setBarStyle('default', true);
    }, [])
  );

  const odswiez = useCallback(() => {
    kal.odswiez();
    setOdczyt((n) => n + 1);
  }, [kal]);
  const otworzWypiek = useCallback((id: string) => router.push({ pathname: '/stolnica', params: { wypiek: id } }), [router]);
  // Zaplanowane wypieki: arkusz planu, start (D-104) i usunięcie (BR-KAL-009, D-108) [M3 D5]
  const plany = usePlanyDzis({ onZmiana: odswiez, otworzWypiek, requireActionAccess });
  const akcje = useAkcjeDzis({ onZmiana: odswiez, otworzWypiek, otworzPlan: plany.otworz });
  const planOtwarty = dane.plany.find((p) => p.id === plany.otwarty) ?? null;
  // Skrót z arkusza dnia (BR-KAL-015): wybór receptury na zakwasie, potem plan z tym dniem „gotowe” [M3 D5]
  const zaplanujNaDzien = (dzienMs: number) => {
    setArkusz(null);
    ustawDzienGotowe(dzienMs);
    ustawRodzajReceptur('sourdough');
    router.navigate('/receptury');
  };

  // Wybór otwiera pierwszy ekran przepływu bez oferty (D-047); oferta przy pierwszej akcji liczącej lub zapisującej
  const wybierz = (c: CzynnoscStartu) => {
    const cel = celCzynnosci(c);
    if (cel.rodzaj) ustawRodzajReceptur(cel.rodzaj);
    router.navigate(cel.trasa);
  };
  // Przejście z arkusza dnia do źródła: trwający wypiek → jego Stolnica, zakwas → karta zakwasu, wpis → Dziennik
  const przejdz = (z: ZdarzenieKalendarza) => {
    setArkusz(null);
    if (z.zrodlo.typ === 'wypiek' && z.zaplanowany) plany.otworz(z.zrodlo.id);
    else if (z.zrodlo.typ === 'wypiek') otworzWypiek(z.zrodlo.id);
    else if (z.zrodlo.typ === 'zakwas') router.navigate('/zakwasy');
    // Wpis Dziennika: ten wpis wyróżniony i przewinięty (BR-KAL-013) [M3 D7]
    else if (z.zrodlo.typ === 'dziennik') router.navigate({ pathname: '/dziennik', params: { wpis: z.zrodlo.id } });
  };

  const o = { now: kal.now, wieleWypiekow: kal.wypieki.length > 1 };
  const teksty = tekstyNastepne(kal.linia, o);
  const banerProby = uprzedzenie.wariant ? <UprzedzenieProby wariant={uprzedzenie.wariant} onZamknij={uprzedzenie.zamknij} /> : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: stan === 'wybor' ? t('Co dziś robisz?') : t('Dziś') }} />
      <ScrollView style={styles.ekran} contentContainerStyle={styles.tresc} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled">
        {/* Przy przeciągnięciu w dół nad pasem dalej kolor pasa, nie tło ekranu */}
        <View style={styles.nadPasem} />
        <PasDzis
          gora={gora}
          data={dataSlownie(kal.now)}
          pasek={{ dni: kal.dni, zdarzenia: kal.zdarzenia, znaczniki: kal.znaczniki, wypieki: kal.wypieki, now: kal.now, wieleWypiekow: o.wieleWypiekow, duzyTekst, waski: width <= WASKI_PT, onDzien: (k) => setArkusz({ dzien: k, ms: kal.dni.find((d) => d.klucz === k)?.ms ?? kal.now }) }}
          widok={kal.widok}
          miesiac={kal.widok.tryb === 'miesiac' ? { tygodnie: kal.miesiac, zdarzenia: kal.zdarzenia, wypieki: kal.wypieki, o, duzyTekst, waski: width <= WASKI_PT, onDzien: (d) => setArkusz({ dzien: d.klucz, ms: d.ms }) } : null}
          pusty={kal.gotowe && kal.pusty}
          teksty={teksty}
          zalegle={kal.linia.zalegle}
          o={o}
          akcje={akcje}
          onPlus={() => setArkusz({ najblizsze: true })}
          onUstawienia={() => setUstawienia(true)}
        />
        {akcje.cofnij && <PasekCofnij tekst={akcje.cofnij.tekst} onPrzywroc={akcje.cofnij.przywroc} onUkryj={akcje.cofnij.ukryj} />}
        {plany.cofnij && (
          <PasekCofnij tekst={plany.cofnij.tekst} onPrzywroc={plany.cofnij.przywroc} onUkryj={plany.cofnij.ukryj} testID="plan-undo-bar" przywrocTestID="plan-undo-restore-btn" />
        )}
        <View style={styles.dol}>
          <CorruptStateRecoveryBanner />
          {/* Uprzedzenie przed końcem próby nie spycha powrotu do wypieku: przy trwającym pod spiralą (126) */}
          {stan !== 'trwa-wypiek' && banerProby}
          {dane.gotowe && stan === 'tylko-historia' && (
            <View style={styles.baner} testID="start-tylko-historia">
              {bylaProba !== null && (
                <Text style={styles.banerHeading}>{bylaProba ? t('Okres próbny się skończył') : t('Piekarz Pro nie jest aktywny')}</Text>
              )}
              <Text style={styles.banerTekst}>
                {t('Twoje receptury, zakwasy i dziennik są do przeglądania, eksportu i usunięcia. Przypomnienia o dokarmianiu są wyłączone. Liczenie, plan i prowadzenie wymagają Piekarz Pro.')}
              </Text>
              <Pressable testID="start-zobacz-plany-btn" accessibilityRole="button" accessibilityLabel={t('Zobacz plany')} style={styles.drugi} onPress={() => setPaywallVisible(true)}>
                <Text style={styles.drugiTekst}>{t('Zobacz plany')}</Text>
              </Pressable>
            </View>
          )}
          <View style={[styles.kafle, duzyTekst && styles.kafleDuze]} testID="start-czynnosci" accessibilityLabel={t('Co dziś robisz?')}>
            {CZYNNOSCI_STARTU.map((c) => (
              <WyborCzynnosci key={c} czynnosc={c} zablokowane={stan === 'tylko-historia'} duzyTekst={duzyTekst} onPress={() => wybierz(c)} />
            ))}
          </View>
          {dane.gotowe && stan !== 'tylko-historia' && (dane.wypieki.length > 0 || dane.plany.length === 0) && (
            <WypiekiNaSpirali wypieki={dane.wypieki} teraz={dane.teraz} duzyTekst={duzyTekst} onWroc={otworzWypiek} />
          )}
          {/* Plany: bez trwającego najbliższy na spirali, inaczej lista pod spiralą (makieta a2-03 w31) [M3 D5] */}
          {dane.gotowe && stan !== 'tylko-historia' && (
            <PlanyWypiekow plany={dane.plany} teraz={dane.teraz} naSpirali={dane.wypieki.length === 0} duzyTekst={duzyTekst} onZobacz={plany.otworz} />
          )}
          {stan === 'trwa-wypiek' && banerProby}
          {dane.gotowe && stan === 'wybor' && !dane.maDane && (
            <Text style={styles.objasnienie}>{t('Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.')}</Text>
          )}
        </View>
      </ScrollView>
      <ArkuszDnia tryb={arkusz} zdarzenia={kal.zdarzenia} o={o} akcje={akcje} onPrzejdz={przejdz} onClose={() => setArkusz(null)}
        liczbaPlanow={dane.plany.length} onZaplanuj={stan === 'tylko-historia' ? undefined : zaplanujNaDzien} />
      <ArkuszPlanu plan={planOtwarty} teraz={Date.now()} onZacznij={plany.zacznij} onUsun={plany.usun} onClose={plany.zamknij} />
      <SettingsModal visible={ustawienia} onClose={() => setUstawienia(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: theme.colors.tlo },
  tresc: { paddingBottom: odstepy.xxl, gap: odstepy.m },
  nadPasem: { position: 'absolute', top: -1000, left: 0, right: 0, height: 1000, backgroundColor: theme.colors.pas },
  dol: { paddingHorizontal: odstepy.l, gap: odstepy.m },
  kafle: { flexDirection: 'row', gap: odstepy.s },
  kafleDuze: { flexDirection: 'column' },
  objasnienie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  baner: { backgroundColor: theme.colors.powierzchnia, borderRadius: promienie.grupa, borderWidth: 1.5, borderColor: theme.colors.obwodka, padding: odstepy.l, gap: odstepy.s },
  banerHeading: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz, get fontFamily() { return theme.typography.krojTytulow; } },
  banerTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  drugi: { minHeight: theme.cele.glownyPrzeplyw, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
});
