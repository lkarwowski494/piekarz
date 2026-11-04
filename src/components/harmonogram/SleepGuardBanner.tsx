// ============================================================================
// Apps4Craft Studio — SleepGuardBanner Component
// Alert or reassurance banner for nighttime fermentation & sleep collisions.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t, tPlural } from '../../lib/i18n';
import { SLEEP_COLLISION_TEMPLATE_PL, SleepCollision, sleepCollisionParams } from '../../scheduler/reverse-scheduler';
import { formatTime } from '../../lib/format';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

import { typografia } from '../../ui/tokeny';
export interface SleepGuardBannerProps {
  hasSleepCollision: boolean;
  sleepCollisions: SleepCollision[];
  suggestedActionPl?: string;
  autoResolved: { adjustedColdRetardHours: number } | null;
  onApplyAutoResolution: (hours: number) => void;
  /** Okno snu z Ustawień do potwierdzenia „poza oknem snu ({od} – {do})” (D-066 1a) [M1-audytor-generalny-130]. */
  okno?: { startH: number; koniecH: number };
}

const godzinaOkna = (h: number) => formatTime(new Date(2000, 0, 1, Math.floor(h) % 24, Math.round((h % 1) * 60)));

const KROKI_W_NOCY = {
  one: '{n} krok wypada w nocy',
  few: '{n} kroki wypadają w nocy',
  many: '{n} kroków wypada w nocy',
  other: '{n} kroków wypada w nocy',
};

/** Tytuł kolizji ze snem bez „Uwaga…!”: jeden krok z godziną, kilka z formą liczby (design-spec §11c 116) [M1-audytor-generalny-116]. */
function tytulKolizji(kolizje: SleepCollision[]): string {
  if (kolizje.length === 1) return t('{krok} wypada o {godzina} w nocy', { krok: t(kolizje[0].stageNamePl), godzina: kolizje[0].time });
  return tPlural(kolizje.length, KROKI_W_NOCY);
}

export function SleepGuardBanner({
  hasSleepCollision,
  sleepCollisions,
  suggestedActionPl,
  autoResolved,
  onApplyAutoResolution,
  okno = { startH: 23, koniecH: 7 },
}: SleepGuardBannerProps) {
  if (hasSleepCollision) {
    return (
      // Karta snu (README §4 plan, M3 p4): tytuł kolizji jako nagłówek karty; treść i „Przesuń do lodówki” bez zmian
      <Karta testID="karta-snu" tytul={tytulKolizji(sleepCollisions)} ikona={<IkonaKarty nazwa="zegar" />}>
      <View testID="sleep-guard-banner">
        {/* przy jednym kroku tytuł mówi już wszystko; przy kilku lista kroków z godzinami */}
        {sleepCollisions.length > 1 && (
          <Text style={styles.sleepGuardBody}>
            {sleepCollisions
              .map((c) => t(SLEEP_COLLISION_TEMPLATE_PL, { ...sleepCollisionParams(c), etap: t(c.stageNamePl) }))
              .join('; ')}
          </Text>
        )}
        {autoResolved && (
          <Pressable
            accessibilityRole="button"
            style={styles.autoFixBtn}
            onPress={() => onApplyAutoResolution(autoResolved.adjustedColdRetardHours)}
          >
            <Text style={styles.autoFixBtnText}>{t('Przesuń do lodówki')}</Text>
          </Pressable>
        )}
        {suggestedActionPl && (
          <Text style={styles.sleepGuardAction}>{t(suggestedActionPl)}</Text>
        )}
      </View>
      </Karta>
    );
  }

  return (
    <Karta testID="karta-snu" tytul={t('Ochrona snu aktywna')} ikona={<IkonaKarty nazwa="ptaszek" />}>
      <Text style={styles.sleepGuardSafeBody} testID="sleep-guard-banner">
        {t('Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu ({od} – {do}).', {
          od: godzinaOkna(okno.startH),
          do: godzinaOkna(okno.koniecH),
        })}
      </Text>
    </Karta>
  );
}

const styles = StyleSheet.create({
  sleepGuardBody: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz,
    lineHeight: 18,
    marginBottom: 10,
  },
  autoFixBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    marginBottom: 8,
  },
  autoFixBtnText: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  sleepGuardAction: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
  },
  sleepGuardSafeBody: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    lineHeight: 16,
  },
});
