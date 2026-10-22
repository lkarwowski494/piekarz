// ============================================================================
// Piekarz — zakładka „Dziś” w wariancie 3+1 (D-105; makiety roli 04 a2 `a2-03` w31 i `dwa-tory-v2`) z kalendarzem 1.0
// (BR-KAL-001…007, D-106) [M3 D4b; wcześniej Start „Co dziś robisz?”, M1-audytor-generalny-101]. Od góry: pas w kolorze
// nocy do samej góry ekranu (tytuł, data, pasek tygodnia, „Następne”, zaległe z „Zrobione”/„Pomiń”, zębatka Ustawień),
// trzy kafle obok siebie (AX5 pod sobą), trwający wypiek jako duża spirala (dwa = jedna spirala z dwoma torami
// i legendą). Pas zastępuje natywny duży tytuł: nagłówek stosu ukryty, pasek stanu jasny na pasie (naglowek.ts, a1).
// ============================================================================

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../../src/lib/i18n';
import { useAppAccess } from '../../../src/lib/app-access';
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
import { NadPasem, usePasekStanuJasny } from '../../../src/components/nawigacja/PasZakladki';
import { ArkuszDnia, type TrybArkusza } from '../../../src/components/kalendarz/ArkuszDnia';
import { PasekCofnij } from '../../../src/components/PasekCofnij';
import { SettingsModal } from '../../../src/components/SettingsModal';
import { CorruptStateRecoveryBanner } from '../../../src/components/CorruptStateRecoveryBanner';
import { UprzedzenieKoncaPro, useUprzedzenieKoncaPro } from '../../../src/components/start/UprzedzenieKoncaPro';
import { dataSlownie } from '../../../src/lib/kalendarz-pasek';
import { tekstyNastepne } from '../../../src/lib/kalendarz-teksty';
import type { ZdarzenieKalendarza } from '../../../src/core/kalendarz-zdarzenia';
import { theme } from '../../../src/ui/theme';
import { odstepy, typografia } from '../../../src/ui/tokeny';

/** Duży tekst (AX1–AX5) jak na innych ekranach (fontScale ≥ 2, 200); wąski ekran: pasek od krawędzi (pomiar roli 04). */
const DUZY_TEKST = 2;
const WASKI_PT = 336;

export default function StartScreen() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const gora = useSafeAreaInsets().top;
  const duzyTekst = fontScale >= DUZY_TEKST;
  const { access, loading, chron, requireActionAccess, moze } = useAppAccess();
  const [odczyt, setOdczyt] = useState(0);
  const dane = useStanStartu(odczyt);
  // Ponowny odczyt po ustaleniu dostępu (koniec Pro chowa terminy karmienia poza zakładaniem, D-113)
  const kal = useKalendarz(`${access.canCreateNewBake}:${loading}`);
  const [ustawienia, setUstawienia] = useState(false);
  const [arkusz, setArkusz] = useState<TrybArkusza | null>(null);
  // Basic działa zawsze (D-112): „Dziś” bez stanu „tylko historia” i bez ekranu Pro przy starcie
  const stan = stanStartu({ trwaWypiek: dane.wypieki.length > 0 });
  const uprzedzenie = useUprzedzenieKoncaPro();
  // Widok miesiąca to Pro (BR-KAL-013), bez Pro z oznaczeniem „Pro” [M3 P-b]; tydzień i powrót do niego w Basic
  const widok = {
    ...kal.widok,
    ustawTryb: (tryb: typeof kal.widok.tryb) => (tryb === 'miesiac' ? chron('miesiac', () => kal.widok.ustawTryb(tryb))() : kal.widok.ustawTryb(tryb)),
    miesiacPro: !moze('miesiac'),
  };

  // Pasek stanu jasny na ciemnym pasie (wspólny z zakładkami D10); po wyjściu domyślny (app/_layout.tsx)
  usePasekStanuJasny();

  const odswiez = useCallback(() => {
    kal.odswiez();
    setOdczyt((n) => n + 1);
  }, [kal]);
  const otworzWypiek = useCallback((id: string) => router.push({ pathname: '/stolnica', params: { wypiek: id } }), [router]);
  // Zaplanowane wypieki: arkusz planu, start (D-104) i usunięcie (BR-KAL-009, D-108) [M3 D5]
  const plany = usePlanyDzis({ onZmiana: odswiez, otworzWypiek, requireActionAccess, moze });
  const akcje = useAkcjeDzis({ onZmiana: odswiez, otworzWypiek, otworzPlan: plany.otworz });
  const planOtwarty = dane.plany.find((p) => p.id === plany.otwarty) ?? null;
  // Skrót z arkusza dnia (BR-KAL-015): wybór receptury na zakwasie, potem plan z tym dniem „gotowe” [M3 D5]; Pro (D-113)
  const zaplanujNaDzien = (dzienMs: number) =>
    chron('plany-przyszle', () => {
      setArkusz(null);
      ustawDzienGotowe(dzienMs);
      ustawRodzajReceptur('sourdough');
      router.navigate('/receptury');
    })();

  // Wybór otwiera pierwszy ekran przepływu bez ekranu Pro (D-047, D-112); trzy czynności są w Basic
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
  const banerPro = uprzedzenie.wariant ? <UprzedzenieKoncaPro wariant={uprzedzenie.wariant} onZamknij={uprzedzenie.zamknij} /> : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: stan === 'wybor' ? t('Co dziś robisz?') : t('Dziś') }} />
      <ScrollView style={styles.ekran} contentContainerStyle={styles.tresc} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled">
        {/* Przy przeciągnięciu w dół nad pasem dalej kolor pasa, nie tło ekranu */}
        <NadPasem />
        <PasDzis
          gora={gora}
          data={dataSlownie(kal.now)}
          pasek={{ dni: kal.dni, zdarzenia: kal.zdarzenia, znaczniki: kal.znaczniki, wypieki: kal.wypieki, now: kal.now, wieleWypiekow: o.wieleWypiekow, duzyTekst, waski: width <= WASKI_PT, onDzien: (k) => setArkusz({ dzien: k, ms: kal.dni.find((d) => d.klucz === k)?.ms ?? kal.now }) }}
          widok={widok}
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
          {/* Uprzedzenie o końcu Pro nie spycha powrotu do wypieku: przy trwającym pod spiralą (126, D-113) */}
          {stan !== 'trwa-wypiek' && banerPro}
          <View style={[styles.kafle, duzyTekst && styles.kafleDuze]} testID="start-czynnosci" accessibilityLabel={t('Co dziś robisz?')}>
            {CZYNNOSCI_STARTU.map((c) => (
              <WyborCzynnosci key={c} czynnosc={c} duzyTekst={duzyTekst} onPress={() => wybierz(c)} />
            ))}
          </View>
          {dane.gotowe && (dane.wypieki.length > 0 || dane.plany.length === 0) && (
            <WypiekiNaSpirali wypieki={dane.wypieki} teraz={dane.teraz} duzyTekst={duzyTekst} onWroc={otworzWypiek} />
          )}
          {/* Plany: bez trwającego najbliższy na spirali, inaczej lista pod spiralą (makieta a2-03 w31) [M3 D5]; plany
              zapisane z Pro zostają widoczne i do startu także bez Pro (start w Basic) */}
          {dane.gotowe && (
            <PlanyWypiekow plany={dane.plany} teraz={dane.teraz} naSpirali={dane.wypieki.length === 0} duzyTekst={duzyTekst} onZobacz={plany.otworz} />
          )}
          {stan === 'trwa-wypiek' && banerPro}
          {dane.gotowe && stan === 'wybor' && !dane.maDane && (
            <Text style={styles.objasnienie}>{t('Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.')}</Text>
          )}
        </View>
      </ScrollView>
      <ArkuszDnia tryb={arkusz} zdarzenia={kal.zdarzenia} o={o} akcje={akcje} onPrzejdz={przejdz} onClose={() => setArkusz(null)}
        liczbaPlanow={dane.plany.length} onZaplanuj={zaplanujNaDzien} zaplanujPro={!moze('plany-przyszle')} />
      <ArkuszPlanu plan={planOtwarty} teraz={Date.now()} onZacznij={plany.zacznij} onUsun={plany.usun} onClose={plany.zamknij} />
      <SettingsModal visible={ustawienia} onClose={() => setUstawienia(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: theme.colors.tlo },
  tresc: { paddingBottom: odstepy.xxl, gap: odstepy.m },
  dol: { paddingHorizontal: odstepy.l, gap: odstepy.m },
  kafle: { flexDirection: 'row', gap: odstepy.s },
  kafleDuze: { flexDirection: 'column' },
  objasnienie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
});
