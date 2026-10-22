// ============================================================================
// Piekarz — ekran Pro „Piekarz Pro” (design-spec §11e 127, makieta docs/design/ekrany/oferta.html; D-063, DEC-17 a)
// [M1-audytor-generalny-127; 04-studio-projektowe-502; 02-monetyzacja-506]. Ceny wyłącznie z App Store (displayPrice)
// [M1-audytor-generalny-008]; bez okresu próbnego i oferty wprowadzającej (D-112, D-116). Ujawnienia 1–5 kontraktu
// (docs/monetyzacja.md „Ujawnienia dla roli 04”) [M3 P-b, D-117]: (1) plan, okres i cena ze sklepu, krótki opis bez
// liczb; (2) odnawianie i anulowanie, „Przywróć zakupy”, Warunki (EULA Apple) i Polityka prywatności; (3) co daje Pro
// wobec Basic, jednym zdaniem na obszar (bez funkcji Basic, przegląd P-a P1-4); (4) dożywotni: jedna opłata; (5) „Zamknij”
// bez pytania, zakup wymaga połączenia z App Store, bez sieci komunikat i ponowny odczyt (BR-PRYW-001). Z Pro (wejście
// z Ustawień): „Piekarz Pro jest aktywny.” i dla subskrybenta „Zarządzaj subskrypcją”, bez opcji zakupu.
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';
import { t } from '../lib/i18n';
import { APPLE_EULA_URL, PRIVACY_URL } from '../lib/links';
import { CloseButton } from './CloseButton';
import { przywrocZKomunikatem } from './przywroc-zakupy';
import type { Plan } from '../lib/platnosci/konfiguracja';
import { pobierzOferte, Oferta, zarzadzajSubskrypcja } from '../lib/platnosci/sklep';
import { OpcjaPlanu } from './oferta/OpcjaPlanu';
import { KomunikatBezSieci } from './oferta/KomunikatBezSieci';
import { cenaPlanu, nazwaPlanu, napisPrzycisku, PLANY_OFERTY, stanOferty } from './oferta/stan-oferty';

export type PlanOption = Plan;

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  /** 'oczekuje' = zakup czeka na zatwierdzenie (Ask to Buy) [audyt-niezalezny C-4] */
  onSubscribe: (tier: PlanOption) => Promise<'oczekuje' | void> | 'oczekuje' | void;
  onRestore?: () => Promise<boolean | void> | boolean | void;
  /** Piekarz Pro aktywny (ekran otwarty z Ustawień): status zamiast zakupu; subskrypcja: „Zarządzaj subskrypcją”. */
  aktywny?: { subskrypcja: boolean } | null;
}

const ID_OPCJI: Record<Plan, string> = { yearly: 'plan-yearly-btn', monthly: 'plan-monthly-btn', lifetime: 'plan-lifetime-btn' };

function Lista({ teksty, testID }: { teksty: string[]; testID: string }) {
  return (
    <View style={styles.ujawnienia} testID={testID}>
      {teksty.map((u) => (
        <View key={u} style={styles.ujawnienie}>
          <View style={styles.kropka} />
          <Text style={styles.ujawnienieTekst}>{u}</Text>
        </View>
      ))}
    </View>
  );
}

/** Ujawnienie 3: co daje Pro wobec Basic, jedno zdanie na obszar; tylko funkcje Pro z wejściem w 1.0 (kontrakt, tabela). */
function CoDajePro() {
  return (
    <View style={styles.obszary} testID="pro-obszary">
      <Text style={styles.naglowek} accessibilityRole="header">{t('Co daje Pro')}</Text>
      <Lista
        testID="pro-obszary-lista"
        teksty={[
          t('Planowanie: plan wstecz od godziny „gotowe” z ochroną snu i czasem fermentacji z temperatury, wypieki na kolejne dni, dwa wypieki naraz, widok miesiąca i plan w kalendarzu telefonu.'),
          t('Zakwas: przypomnienia o dokarmianiu, proporcje karmienia, gotowość do ciasta, stały dzień karmienia w lodówce i kolejne zakwasy.'),
          t('Liczenie: zaczyn poolish, biga, stare ciasto albo levain w recepturze.'),
          t('Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.'),
        ]}
      />
    </View>
  );
}

export function PaywallModal({ visible, onClose, onSubscribe, onRestore, aktywny = null }: PaywallModalProps) {
  const [wybrany, setWybrany] = useState<PlanOption>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [oferta, setOferta] = useState<Oferta[] | null>(null);
  const [blad, setBlad] = useState(false);
  const [odczyt, setOdczyt] = useState(0);

  // Ceny z produktów App Store Connect; bez odczytu sklepu ekran nie pokazuje żadnej kwoty.
  const zPro = aktywny !== null;
  useEffect(() => {
    if (!visible || zPro) return;
    let zywy = true;
    setOferta(null);
    setBlad(false);
    pobierzOferte()
      .then((o) => {
        if (zywy) setOferta(o);
      })
      .catch(() => {
        if (zywy) setBlad(true);
      });
    return () => {
      zywy = false;
    };
  }, [visible, odczyt, zPro]);

  const stan = stanOferty(oferta, blad);
  // Bez sieci albo sklep bez produktów (A-3): komunikat i „Spróbuj ponownie” zamiast opcji
  const bezOferty = stan === 'bez-sieci' || stan === 'niedostepna';
  const doPlanu = (plan: Plan) => oferta?.find((o) => o.plan === plan);
  // Opcja, której sklep nie zwrócił, nie jest rysowana; przy ładowaniu trzy opcje bez kwot (§11e 127).
  const plany = stan === 'ladowanie' ? PLANY_OFERTY : PLANY_OFERTY.filter((p) => doPlanu(p));
  const plan = plany.includes(wybrany) ? wybrany : (plany[0] ?? wybrany);

  // Blokada przed drugim stuknięciem, zanim stan isProcessing zdąży się wyrenderować [audyt-niezalezny C-5]
  const trwa = useRef(false);
  const handlePurchase = async () => {
    if (trwa.current) return;
    trwa.current = true;
    setIsProcessing(true);
    try {
      if ((await onSubscribe(plan)) === 'oczekuje') {
        Alert.alert(t('Zakup czeka na zatwierdzenie'), t('Gdy zakup zostanie zatwierdzony, Piekarz Pro włączy się sam. Nie trzeba kupować ponownie.'));
      }
    } catch {
      Alert.alert(t('Zakup'), t('Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.'));
    } finally {
      trwa.current = false;
      setIsProcessing(false);
    }
  };

  const { fontScale } = useWindowDimensions();

  const handleRestore = async () => {
    if (!onRestore || trwa.current) return;
    trwa.current = true;
    setIsProcessing(true);
    try {
      if (await przywrocZKomunikatem(onRestore)) onClose();
    } finally {
      trwa.current = false;
      setIsProcessing(false);
    }
  };

  const ponow = useCallback(() => setOdczyt((n) => n + 1), []);

  // Ujawnienia 2 i 5 (bez okresu próbnego, D-112): odnawianie i anulowanie subskrypcji (gdy sklep ją pokazał), połączenie
  const ujawnienia = [
    ...(plany.some((p) => p !== 'lifetime')
      ? [t('Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.')]
      : []),
    t('Zakup wymaga połączenia z App Store.'),
  ];

  // Przy dużym tekście (fontScale ≥ 2, okolice AX1–AX5) przypięty zostaje tylko przycisk główny, a przywracanie
  // i linki idą na koniec przewijanej treści, żeby pasek nie zajmował połowy ekranu [M1-audytor-generalny-200]
  const duzyTekst = fontScale >= 2;
  // Przywracanie i linki (Apple 3.1.2: Terms of Use i Privacy Policy w aplikacji)
  const linki = (
    <View style={styles.linki}>
      {onRestore && (
        <Pressable accessibilityRole="button" testID="restore-purchases-btn" onPress={handleRestore} style={styles.link}>
          <Text style={styles.linkTekst}>{t('Przywróć zakupy')}</Text>
        </Pressable>
      )}
      <Pressable testID="terms-of-use-btn" onPress={() => Linking.openURL(APPLE_EULA_URL)} style={styles.link} accessibilityRole="link">
        <Text style={styles.linkTekst}>{t('Warunki użytkowania')}</Text>
      </Pressable>
      <Pressable testID="privacy-policy-btn" onPress={() => Linking.openURL(PRIVACY_URL)} style={styles.link} accessibilityRole="link">
        <Text style={styles.linkTekst}>{t('Polityka prywatności')}</Text>
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <CloseButton onPress={onClose} akcja="zamknij" />
        </View>

        <ScrollView contentContainerStyle={styles.tresc} keyboardShouldPersistTaps="handled">
          <Text style={styles.tytul} accessibilityRole="header">
            {t('Piekarz Pro')}
          </Text>

          {zPro ? (
            <>
              <Text style={styles.opis} testID="pro-aktywny">{t('Piekarz Pro jest aktywny.')}</Text>
              {aktywny?.subskrypcja && (
                <Pressable accessibilityRole="button" testID="pro-manage-btn" style={styles.drugi} onPress={() => void zarzadzajSubskrypcja()}>
                  <Text style={styles.drugiTekst}>{t('Zarządzaj subskrypcją')}</Text>
                </Pressable>
              )}
            </>
          ) : bezOferty ? (
            <KomunikatBezSieci niedostepna={stan === 'niedostepna'} />
          ) : (
            <>
              <Text style={styles.opis} testID="pro-opis">
                {t('Basic zostaje bezpłatny na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur.')}
              </Text>
              <CoDajePro />

              <View style={styles.opcje} accessibilityRole="radiogroup">
                {plany.map((p) => {
                  const o = doPlanu(p);
                  return (
                    <OpcjaPlanu
                      key={p}
                      testID={ID_OPCJI[p]}
                      nazwa={nazwaPlanu(p)}
                      cena={o ? cenaPlanu(o) : null}
                      // Ujawnienie 4: dożywotni to jedna opłata bez odnawiania
                      opis={p === 'lifetime' ? t('Jedna opłata, bez odnawiania.') : undefined}
                      wybrana={p === plan}
                      onPress={() => setWybrany(p)}
                    />
                  );
                })}
              </View>

              {stan !== 'ladowanie' && <Lista testID="subscription-terms" teksty={ujawnienia} />}
            </>
          )}
          {duzyTekst && linki}
        </ScrollView>

        <View style={styles.kciuk}>
          {zPro ? null : bezOferty ? (
            <Pressable accessibilityRole="button" testID="offer-retry-btn" style={styles.glowny} onPress={ponow}>
              <Text style={styles.glownyTekst}>{t('Spróbuj ponownie')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: stan === 'ladowanie' || isProcessing, busy: isProcessing }}
              testID="subscribe-submit-btn"
              style={[styles.glowny, (stan === 'ladowanie' || isProcessing) && styles.nieaktywny]}
              disabled={stan === 'ladowanie' || isProcessing}
              onPress={handlePurchase}
            >
              <Text style={styles.glownyTekst}>{napisPrzycisku(plan)}</Text>
            </Pressable>
          )}

          {!duzyTekst && linki}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.tlo },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: odstepy.l, paddingVertical: odstepy.s },
  tresc: { paddingHorizontal: odstepy.xl, paddingBottom: odstepy.l, gap: odstepy.m },
  tytul: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytulDuzy.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  opis: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  obszary: { gap: odstepy.s },
  naglowek: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
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
  opcje: { gap: odstepy.s },
  ujawnienia: { gap: odstepy.s },
  ujawnienie: { flexDirection: 'row', gap: odstepy.s, alignItems: 'flex-start' },
  kropka: { width: 6, height: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.tusz2, marginTop: 8 },
  ujawnienieTekst: { flex: 1, minWidth: 0, fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  kciuk: { paddingHorizontal: odstepy.xl - 6, paddingTop: odstepy.m, paddingBottom: odstepy.s, gap: odstepy.s },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  nieaktywny: { opacity: 0.6 },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
  linki: { flexDirection: 'row', flexWrap: 'wrap', columnGap: odstepy.l },
  link: { minHeight: theme.cele.pozostale, justifyContent: 'center' },
  linkTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.akcentTekst },
});
