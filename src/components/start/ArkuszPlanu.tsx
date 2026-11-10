// ============================================================================
// Piekarz — arkusz zaplanowanego wypieku z „Dziś” („Zobacz plan”; BR-KAL-009, D-108) [M3 D5]
// Systemowy arkusz (Modal pageSheet jak arkusz dnia): „{receptura}: gotowe {dzień} o {godzina}”, „Start …”, kroki
// planu z godzinami; „Zacznij wypiek”, gdy nadszedł czas startu (start ≤ teraz; przed czasem plan czeka), „Usuń plan”
// bez pytania z paskiem „Przywróć” na „Dziś” (D-051 1a). Element nowy spoza makiety (makieta ma tylko „Zobacz plan”) —
// do przeglądu roli 04. Na systemie kart: „Zamknij” w pasku arkusza, tytuł planu jako nagłówek karty z krokami,
// przyciski pod kartą (README §1, §3) [M1-audytor-generalny-007; 04-studio-projektowe-003].
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PlannedBake } from '../../data/bake-sessions-store';
import { startNadszedl } from '../../core/plany-wypiekow';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { CLOSE_TEST_ID } from '../CloseButton';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
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
    <ArkuszKart visible={plan !== null} onRequestClose={onClose} onDismiss={onDismiss}
      lewy={{ tekst: t('Zamknij'), onPress: onClose, testID: CLOSE_TEST_ID }}>
      {plan && (
        <>
          <Karta testID="arkusz-planu" tytul={tytulPlanu(plan, teraz)} ikona={<IkonaKarty nazwa="zegar" />} podpis={startPlanuTekst(plan, teraz)}>
            <View>
              {plan.steps.map((k, i) => (
                <View key={`${k.id}-${i}`} style={[styles.wiersz, i > 0 && styles.wierszLinia]}>
                  <Text style={styles.godzina}>{k.plannedStart === null ? '' : formatTime(k.plannedStart)}</Text>
                  <Text style={styles.opis}>{t(k.name)}</Text>
                </View>
              ))}
            </View>
          </Karta>
          {startNadszedl(plan, teraz) && (
            <Pressable testID="plan-zacznij-btn" accessibilityRole="button" accessibilityLabel={t('Zacznij wypiek')} style={styles.glowny} onPress={() => onZacznij(plan)}>
              <Text style={styles.glownyTekst}>{t('Zacznij wypiek')}</Text>
            </Pressable>
          )}
          <DodajDoKalendarza plan={{ id: plan.id, nazwa: plan.recipeName, kroki: plan.steps }} onPro={onPro} />
          <Pressable testID="plan-usun-btn" accessibilityRole="button" accessibilityLabel={t('Usuń plan')} style={styles.usun} onPress={() => onUsun(plan)}>
            <Text style={styles.usunTekst}>{t('Usuń plan')}</Text>
          </Pressable>
        </>
      )}
    </ArkuszKart>
  );
}

const styles = StyleSheet.create({
  wiersz: { flexDirection: 'row', flexWrap: 'wrap', columnGap: odstepy.m, minHeight: theme.cele.pozostale, alignItems: 'center', borderTopColor: theme.colors.linia },
  wierszLinia: { borderTopWidth: StyleSheet.hairlineWidth },
  godzina: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz2, fontVariant: ['tabular-nums'] },
  opis: { flexShrink: 1, flexBasis: 160, flexGrow: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  glowny: { minHeight: theme.cele.przyciskKciuka, borderRadius: promienie.przyciskGlowny, backgroundColor: theme.colors.akcent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
  usun: { minHeight: theme.cele.pozostale, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m },
  usunTekst: { fontSize: typografia.style.naglowek.pt, color: theme.colors.blad, textAlign: 'center' },
});
