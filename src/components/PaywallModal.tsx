// ============================================================================
// Apps4Brew Studio — Paywall Modal: ceny wyłącznie z App Store (displayPrice) [M1-audytor-generalny-008]
// Kitchen-Proof, 100% Offline-First, Zero Telemetry
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { APPLE_EULA_URL, PRIVACY_URL } from '../lib/links';
import { CloseButton } from './CloseButton';
import { przywrocZKomunikatem } from './przywroc-zakupy';
import type { Plan } from '../lib/platnosci/konfiguracja';
import { pobierzOferte, zarzadzajSubskrypcja, Oferta } from '../lib/platnosci/sklep';

export type PlanOption = Plan;

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (tier: PlanOption) => Promise<void> | void;
  onRestore?: () => Promise<boolean | void> | boolean | void;
}

export function PaywallModal({
  visible,
  onClose,
  onSubscribe,
  onRestore,
}: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [oferta, setOferta] = useState<Partial<Record<PlanOption, Oferta>>>({});

  // Ceny z produktów App Store Connect; bez odczytu sklepu ekran nie pokazuje żadnej kwoty.
  useEffect(() => {
    if (!visible) return;
    let aktywny = true;
    pobierzOferte()
      .then((oferta) => {
        if (aktywny) setOferta(Object.fromEntries(oferta.map((o) => [o.plan, o])));
      })
      .catch(() => undefined);
    return () => {
      aktywny = false;
    };
  }, [visible]);
  const cena = (plan: PlanOption) => oferta[plan]?.cena ?? '—';
  // Oferta wprowadzająca tylko dla uprawnionych; długość z App Store Connect [M1-audytor-generalny-009]
  const proba = (plan: PlanOption) => oferta[plan]?.probaDni ?? null;
  const probaTekst = (plan: PlanOption) => {
    const dni = proba(plan);
    return dni ? ` • ${t('Pierwsze {dni} dni bezpłatnie, potem {cena}', { dni, cena: cena(plan) })}` : '';
  };
  const wybranaProba = proba(selectedPlan);

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      await onSubscribe(selectedPlan);
    } catch {
      Alert.alert(t('Zakup'), t('Nie udało się dokończyć zakupu. Spróbuj ponownie.'));
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

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Text style={styles.passBadge}>APPS4CRAFT PASS</Text>
          </View>
          <CloseButton onPress={onClose} akcja="zamknij" />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t('Odblokuj pełny dostęp')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'Odblokuj wszystkie funkcje aplikacji. Bez zakupu dostępne zostają historia wypieków oraz podgląd, eksport i usuwanie Twoich danych.'
            )}
          </Text>

          {/* Guarantee banner: History Read-Only */}
          <View style={styles.guaranteeCard}>
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>
                {t('Twoja historia jest bezpieczna')}
              </Text>
              <Text style={styles.guaranteeDesc}>
                {t(
                  'Nawet bez zakupu Twoje notatki, archiwalne bochenki i receptury są zawsze bezpłatne do wglądu (tryb Read-Only).'
                )}
              </Text>
            </View>
          </View>

          {/* Pricing Options */}
          <View style={styles.plansContainer}>
            {/* Yearly: kwota rozliczenia jako najważniejszy element ceny; bez etykiet bez danych [M1-audytor-generalny-011] */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedPlan === 'yearly' }}
              testID="plan-yearly-btn"
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.planCardSelected,
              ]}
              onPress={() => handleSelectPlan('yearly')}
            >
              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{t('Roczny')}</Text>
                  <Text style={styles.planSubtext}>
                    {t('12 miesięcy')} • {t('Odnawia się automatycznie co rok')}{probaTekst('yearly')}
                  </Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.planPrice}>{cena('yearly')}</Text>
                  <Text style={styles.planPricePeriod}>/ {t('rok')}</Text>
                </View>
              </View>
            </Pressable>

            {/* Monthly */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedPlan === 'monthly' }}
              testID="plan-monthly-btn"
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => handleSelectPlan('monthly')}
            >
              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{t('Miesięczny')}</Text>
                  <Text style={styles.planSubtext}>
                    {t('1 miesiąc')} • {t('Odnawia się automatycznie co miesiąc')}{probaTekst('monthly')}
                  </Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.planPrice}>{cena('monthly')}</Text>
                  <Text style={styles.planPricePeriod}>/ {t('miesiąc')}</Text>
                </View>
              </View>
            </Pressable>

            {/* Lifetime */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedPlan === 'lifetime' }}
              testID="plan-lifetime-btn"
              style={[
                styles.planCard,
                selectedPlan === 'lifetime' && styles.planCardSelected,
              ]}
              onPress={() => handleSelectPlan('lifetime')}
            >
              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{t('Dożywotni (Lifetime)')}</Text>
                  <Text style={styles.planSubtext}>
                    {t('Jednorazowy zakup na zawsze • Wszystkie aktualizacje')}
                  </Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.planPrice}>{cena('lifetime')}</Text>
                  <Text style={styles.planPricePeriod}>{t('jednorazowo')}</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Pillars List */}
          <View style={styles.pillarsCard}>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarText}>
                {t('Bez chmury: dane zostają w telefonie')}
              </Text>
            </View>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarText}>
                {t('Zero reklam, zero śledzenia telemetrycznego')}
              </Text>
            </View>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarText}>
                {t('Wszystkie zaawansowane narzędzia i asystent stolnicy bez limitów')}
              </Text>
            </View>
          </View>

          {/* CTA Action */}
          <Pressable
            accessibilityRole="button"
            testID="subscribe-submit-btn"
            style={[styles.primaryCtaBtn, isProcessing && styles.btnDisabled]}
            disabled={isProcessing}
            onPress={handlePurchase}
          >
            <Text style={styles.primaryCtaBtnText}>
              {isProcessing
                ? t('Przetwarzanie...')
                : wybranaProba
                ? t('Wypróbuj {dni} dni', { dni: wybranaProba })
                : selectedPlan === 'yearly'
                ? t('Aktywuj plan roczny')
                : selectedPlan === 'monthly'
                ? t('Aktywuj plan miesięczny')
                : t('Kup dostęp dożywotni')}
            </Text>
          </Pressable>

          {/* Warunki odnawiania i anulowania (3.1.2; developer.apple.com/app-store/subscriptions, odczyt 2026-10-19) */}
          <Text style={styles.termsText} testID="subscription-terms">
            {t('Subskrypcja odnawia się automatycznie za cenę podaną przy planie, dopóki jej nie anulujesz. Płatność pobiera App Store z Twojego konta Apple. Subskrypcję anulujesz w każdej chwili w ustawieniach konta Apple albo przyciskiem „Zarządzaj subskrypcją”.')}{' '}
            {t('Dostęp dożywotni to jednorazowy zakup bez odnawiania.')}
          </Text>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <Pressable
              testID="manage-subscriptions-btn"
              onPress={() => zarzadzajSubskrypcja()}
              style={styles.textBtn}
              accessibilityRole="button"
              accessibilityLabel={t('Zarządzaj subskrypcją')}
            >
              <Text style={styles.textBtnLabel}>{t('Zarządzaj subskrypcją')}</Text>
            </Pressable>
            {onRestore && (
              <Pressable
                accessibilityRole="button"
                testID="restore-purchases-btn"
                onPress={handleRestore}
                style={styles.textBtn}
              >
                <Text style={styles.textBtnLabel}>{t('Przywróć zakupy')}</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              testID="read-only-continue-btn"
              onPress={onClose}
              style={styles.textBtn}
            >
              <Text style={styles.textBtnLabel}>
                {t('Przeglądaj historię (Read-Only)')}
              </Text>
            </Pressable>
          </View>

          {/* Legal Links (Apple Review Guideline 3.1.2 & DEC-49) */}
          <View style={styles.legalLinksRow}>
            <Pressable
              testID="terms-of-use-btn"
              onPress={() => Linking.openURL(APPLE_EULA_URL)}
              style={styles.legalBtn}
              accessibilityRole="link"
              accessibilityLabel={t('Warunki użytkowania (EULA)')}
            >
              <Text style={styles.legalLinkText}>{t('Warunki użytkowania (EULA)')}</Text>
            </Pressable>
            <Text style={styles.legalDividerText}>•</Text>
            <Pressable
              testID="privacy-policy-btn"
              onPress={() => Linking.openURL(PRIVACY_URL)}
              style={styles.legalBtn}
              accessibilityRole="link"
              accessibilityLabel={t('Polityka prywatności')}
            >
              <Text style={styles.legalLinkText}>{t('Polityka prywatności')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passBadge: {
    backgroundColor: theme.colors.akcent,
    color: theme.colors.naAkcencie,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.tusz,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.tusz2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  guaranteeCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  guaranteeDesc: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginTop: 2,
    lineHeight: 16,
  },
  plansContainer: {
    width: '100%',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  planCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 2,
    borderColor: theme.colors.linia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    minHeight: 64,
    justifyContent: 'center',
  },
  planCardSelected: {
    borderColor: theme.colors.akcent,
    borderWidth: 3,
    backgroundColor: theme.colors.powierzchnia,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.tusz2,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  planSubtext: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing.sm,
  },
  planPrice: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.tusz,
  },
  planPricePeriod: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 11,
    color: theme.colors.tusz3,
  },
  pillarsCard: {
    width: '100%',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    flex: 1,
  },
  primaryCtaBtn: {
    width: '100%',
    backgroundColor: theme.colors.akcent,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // Zasada Brudnego Kciuka
    marginBottom: theme.spacing.md,
  },
  primaryCtaBtnText: {
    color: theme.colors.naAkcencie,
    fontSize: 16,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  footerRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  textBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  textBtnLabel: {
    fontSize: 13,
    color: theme.colors.tusz2,
    textDecorationLine: 'underline',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  legalBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  legalLinkText: {
    fontSize: 12,
    color: theme.colors.tusz3,
    textDecorationLine: 'underline',
  },
  legalDividerText: {
    fontSize: 12,
    color: theme.colors.tusz3,
  },
});
