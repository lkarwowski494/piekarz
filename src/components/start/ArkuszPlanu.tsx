// ============================================================================
// Piekarz — arkusz zaplanowanego wypieku z „Dziś” („Zobacz plan”; BR-KAL-009, D-108) [M3 D5]
// Systemowy arkusz (Modal pageSheet jak arkusz dnia): „{receptura}: gotowe {dzień} o {godzina}”, „Start …”, kroki
// planu z godzinami; „Zacznij wypiek”, gdy nadszedł czas startu (start ≤ teraz; przed czasem plan czeka), „Usuń plan”
// bez pytania z paskiem „Przywróć” na „Dziś” (D-051 1a). Element nowy spoza makiety (makieta ma tylko „Zobacz plan”) —
// do przeglądu roli 04.
// ============================================================================

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PlannedBake } from '../../data/bake-sessions-store';
import { startNadszedl } from '../../core/plany-wypiekow';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { CloseButton } from '../CloseButton';
import { startPlanuTekst, tytulPlanu } from './PlanyWypiekow';
import { DodajDoKalendarza } from '../harmonogram/DodajDoKalendarza';

export function ArkuszPlanu({ plan, teraz, onZacznij, onUsun, onClose, onPro, onDismiss }: {
  plan: PlannedBake | null;
  teraz: number;
  onZacznij: (p: PlannedBake) => void;
  onUsun: (p: PlannedBake) => void;
  onClose: () => void;
  /** Funkcja Pro bez Pro z arkusza („Dodaj do kalendarza”): zamknięcie arkusza, ekran Pro po nim (D-117) [04-studio-projektowe-005]. */
  onPro?: (wznow?: () => void | Promise<void>) => void;
  /** Arkusz zniknął z ekranu (iOS). */
  onDismiss?: () => void;
}) {
  return (
    <Modal visible={plan !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} onDismiss={onDismiss}>
      <SafeAreaView style={styles.arkusz} edges={['top', 'bottom', 'left', 'right']}>
        {plan && (
          <>
            <View style={styles.naglowek}>
              <Text style={styles.tytul} accessibilityRole="header">{tytulPlanu(plan, teraz)}</Text>
              <CloseButton akcja="zamknij" onPress={onClose} />
            </View>
            <ScrollView contentContainerStyle={styles.tresc} testID="arkusz-planu">
              <Text style={styles.start}>{startPlanuTekst(plan, teraz)}</Text>
              {plan.steps.map((k, i) => (
                <View key={`${k.id}-${i}`} style={styles.wiersz}>
                  <Text style={styles.godzina}>{k.plannedStart === null ? '' : formatTime(k.plannedStart)}</Text>
                  <Text style={styles.opis}>{t(k.name)}</Text>
                </View>
              ))}
              {startNadszedl(plan, teraz) && (
                <Pressable testID="plan-zacznij-btn" accessibilityRole="button" accessibilityLabel={t('Zacznij wypiek')} style={styles.glowny} onPress={() => onZacznij(plan)}>
                  <Text style={styles.glownyTekst}>{t('Zacznij wypiek')}</Text>
                </Pressable>
              )}
              <DodajDoKalendarza plan={{ id: plan.id, nazwa: plan.recipeName, kroki: plan.steps }} onPro={onPro} />
              <Pressable testID="plan-usun-btn" accessibilityRole="button" accessibilityLabel={t('Usuń plan')} style={styles.usun} onPress={() => onUsun(plan)}>
                <Text style={styles.usunTekst}>{t('Usuń plan')}</Text>
              </Pressable>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  arkusz: { flex: 1, backgroundColor: theme.colors.tlo },
  naglowek: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: odstepy.l, paddingVertical: odstepy.s, gap: odstepy.s },
  tytul: { flex: 1, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  tresc: { padding: odstepy.l, paddingBottom: odstepy.xxxl, gap: odstepy.s },
  start: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz2 },
  wiersz: { flexDirection: 'row', flexWrap: 'wrap', columnGap: odstepy.m, minHeight: theme.cele.pozostale, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.linia },
  godzina: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz2, fontVariant: ['tabular-nums'] },
  opis: { flexShrink: 1, flexBasis: 160, flexGrow: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  glowny: { minHeight: theme.cele.przyciskKciuka, borderRadius: promienie.przyciskGlowny, backgroundColor: theme.colors.akcent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m, marginTop: odstepy.m },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
  usun: { minHeight: theme.cele.pozostale, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m, marginTop: odstepy.s },
  usunTekst: { fontSize: typografia.style.naglowek.pt, color: theme.colors.blad, textAlign: 'center' },
});
