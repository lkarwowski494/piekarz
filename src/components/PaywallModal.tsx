// ============================================================================
// Piekarz — ekran zakupu „Piekarz Pro” (design-spec §11e 127, makieta docs/design/ekrany/oferta.html; D-063, DEC-17 a)
// [M1-audytor-generalny-127; 04-studio-projektowe-502; 02-monetyzacja-506]. Ceny wyłącznie z App Store (displayPrice)
// [M1-audytor-generalny-008]; próba tylko jako oferta wprowadzająca dla uprawnionych [M1-audytor-generalny-009];
// ujawnienia U2–U8 z kontraktu płatności (docs/monetyzacja.md); bez sieci komunikat i ponowny odczyt (BR-PRYW-001).
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';
import { t, tPlural } from '../lib/i18n';
import { APPLE_EULA_URL, PRIVACY_URL } from '../lib/links';
import { CloseButton } from './CloseButton';
import { przywrocZKomunikatem } from './przywroc-zakupy';
import type { Plan } from '../lib/platnosci/konfiguracja';
import { pobierzOferte, Oferta } from '../lib/platnosci/sklep';
import { OpcjaPlanu } from './oferta/OpcjaPlanu';
import { KomunikatBezSieci } from './oferta/KomunikatBezSieci';
import { cenaPlanu, nazwaPlanu, napisPrzycisku, PLANY_OFERTY, stanOferty } from './oferta/stan-oferty';

export type PlanOption = Plan;

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (tier: PlanOption) => Promise<void> | void;
  onRestore?: () => Promise<boolean | void> | boolean | void;
}

const ID_OPCJI: Record<Plan, string> = { yearly: 'plan-yearly-btn', monthly: 'plan-monthly-btn', lifetime: 'plan-lifetime-btn' };

function Ujawnienia({ teksty }: { teksty: string[] }) {
  return (
    <View style={styles.ujawnienia} testID="subscription-terms">
      {teksty.map((u) => (
        <View key={u} style={styles.ujawnienie}>
          <View style={styles.kropka} />
          <Text style={styles.ujawnienieTekst}>{u}</Text>
        </View>
      ))}
    </View>
  );
}

export function PaywallModal({ visible, onClose, onSubscribe, onRestore }: PaywallModalProps) {
  const [wybrany, setWybrany] = useState<PlanOption>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [oferta, setOferta] = useState<Oferta[] | null>(null);
  const [blad, setBlad] = useState(false);
  const [odczyt, setOdczyt] = useState(0);

  // Ceny z produktów App Store Connect; bez odczytu sklepu ekran nie pokazuje żadnej kwoty.
  useEffect(() => {
    if (!visible) return;
    let aktywny = true;
    setOferta(null);
    setBlad(false);
    pobierzOferte()
      .then((o) => {
        if (aktywny) setOferta(o);
      })
      .catch(() => {
        if (aktywny) setBlad(true);
      });
    return () => {
      aktywny = false;
    };
  }, [visible, odczyt]);

  const stan = stanOferty(oferta, blad);
  const doPlanu = (plan: Plan) => oferta?.find((o) => o.plan === plan);
  // Opcja, której sklep nie zwrócił, nie jest rysowana; przy ładowaniu trzy opcje bez kwot (§11e 127).
  const plany = stan === 'ladowanie' ? PLANY_OFERTY : PLANY_OFERTY.filter((p) => doPlanu(p));
  const plan = plany.includes(wybrany) ? wybrany : (plany[0] ?? wybrany);
  const dniProby = Math.max(0, ...(oferta ?? []).map((o) => o.probaDni ?? 0));

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      await onSubscribe(plan);
    } catch {
      Alert.alert(t('Zakup'), t('Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setIsProcessing(true);
    try {
      if (await przywrocZKomunikatem(onRestore)) onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const ponow = useCallback(() => setOdczyt((n) => n + 1), []);

  const ujawnienia =
    stan === 'oferta-proba'
      ? [
          t('Subskrypcja odnawia się sama. Żeby nie płacić, anuluj ją najpóźniej 24 godziny przed końcem próby: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.'),
          t('Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.'),
          t('Próba jest jedna na oba plany subskrypcji.'),
          t('Założenie zakwasu wymaga kilku dni regularnego dokarmiania; średnio trwa 7–10 dni.'),
          t('Zakup wymaga połączenia z App Store.'),
        ]
      : [
          t('Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.'),
          t('Zakup wymaga połączenia z App Store.'),
        ];
  const opisDozywotniego =
    stan === 'oferta-proba'
      ? t('Jedna opłata. Ten plan nie potrzebuje próby; jeśli masz zaczętą próbę subskrypcji, anuluj ją, żeby za nią nie płacić.')
      : undefined;

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

          {stan === 'bez-sieci' ? (
            <KomunikatBezSieci />
          ) : (
            <>
              {stan === 'oferta-proba' && (
                <Text style={styles.proba} testID="offer-trial-length">
                  {t('Okres próbny: {dni}', {
                    dni: tPlural(dniProby, { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' }),
                  })}
                </Text>
              )}
              <Text style={styles.opis}>
                {t('Liczenie receptur, plan wypieku, prowadzenie z powiadomieniami, zakwasy i dziennik. Bez reklam, bez konta.')}
              </Text>

              <View style={styles.opcje} accessibilityRole="radiogroup">
                {plany.map((p) => {
                  const o = doPlanu(p);
                  return (
                    <OpcjaPlanu
                      key={p}
                      testID={ID_OPCJI[p]}
                      nazwa={nazwaPlanu(p)}
                      cena={o ? cenaPlanu(o) : null}
                      opis={p === 'lifetime' ? opisDozywotniego : undefined}
                      wybrana={p === plan}
                      onPress={() => setWybrany(p)}
                    />
                  );
                })}
              </View>

              {stan !== 'ladowanie' && <Ujawnienia teksty={ujawnienia} />}
            </>
          )}
        </ScrollView>

        <View style={styles.kciuk}>
          {stan === 'bez-sieci' ? (
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
              <Text style={styles.glownyTekst}>{napisPrzycisku(doPlanu(plan), plan)}</Text>
            </Pressable>
          )}

          {/* Przywracanie i linki (Apple 3.1.2: Terms of Use i Privacy Policy w aplikacji) */}
          <View style={styles.linki}>
            {onRestore && (
              <Pressable accessibilityRole="button" testID="restore-purchases-btn" onPress={handleRestore} style={styles.link}>
                <Text style={styles.linkTekst}>{t('Przywróć zakupy')}</Text>
              </Pressable>
            )}
            <Pressable
              testID="terms-of-use-btn"
              onPress={() => Linking.openURL(APPLE_EULA_URL)}
              style={styles.link}
              accessibilityRole="link"
            >
              <Text style={styles.linkTekst}>{t('Warunki użytkowania')}</Text>
            </Pressable>
            <Pressable
              testID="privacy-policy-btn"
              onPress={() => Linking.openURL(PRIVACY_URL)}
              style={styles.link}
              accessibilityRole="link"
            >
              <Text style={styles.linkTekst}>{t('Polityka prywatności')}</Text>
            </Pressable>
          </View>
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
    fontFamily: theme.typography.krojTytulow,
    fontSize: typografia.style.tytulDuzy.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  proba: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  opis: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
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
