// ============================================================================
// Piekarz — Start, stan „trwa wypiek” (design-spec §6, makieta ekrany/start.html `trwa-wypiek`; F-58):
// karta z małą Spiralą 92 pt (§2, §11b 058: dane planu tego wypieku), bieżący krok, ile zostało i godzina
// „gotowe”; „Wróć do wypieku” jednym dotknięciem otwiera prowadzenie na bieżącym kroku. [M1-audytor-generalny-101]
// ============================================================================

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BakeSession } from '../../data/bake-session-store';
import type { TimerState } from '../../core/bake-session';
import { stepHasTimer } from '../../core/bake-session';
import { t } from '../../lib/i18n';
import { nazwaReceptury } from '../../lib/nazwa-receptury';
import { formatTime } from '../../lib/format';
import { czasSlownie, dzienSlownie, etykietaPlanuWypieku } from '../../lib/spirala-etykieta';
import { krokiSpiraliZSesji } from '../../lib/spirala-geometria';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Spirala } from '../Spirala';

export function TrwajacyWypiek({ sesja, zegar, teraz, onWroc }: {
  sesja: BakeSession;
  zegar: TimerState;
  teraz: number;
  onWroc: () => void;
}) {
  const krok = sesja.steps[sesja.stepIdx];
  const kroki = useMemo(() => krokiSpiraliZSesji(sesja.steps), [sesja.steps]);
  const nazwa = t(krok?.name ?? '');
  const zMinutnikiem = stepHasTimer(krok);
  const pozostaloMin = zMinutnikiem ? Math.ceil(zegar.timeLeftSec / 60) : null;
  const pelnyMin = krok?.durationMin ?? null;
  const postep = pozostaloMin !== null && pelnyMin ? Math.min(1, Math.max(0, 1 - pozostaloMin / pelnyMin)) : 0;
  // Koniec kroku: zegar biegnie → teraz + pozostało; zatrzymany → godzina z planu; brak obu → bez godziny
  const koniecKroku = zMinutnikiem && zegar.isRunning ? teraz + zegar.timeLeftSec * 1000 : krok?.plannedEnd ?? null;
  const gotoweMs = sesja.steps[sesja.steps.length - 1]?.plannedEnd ?? null;
  const gotowe = gotoweMs === null ? null : new Date(gotoweMs);
  const etykieta = etykietaPlanuWypieku({
    krok: sesja.stepIdx + 1,
    liczbaKrokow: sesja.steps.length,
    nazwa,
    pozostaloMin,
    gotowe,
    teraz: new Date(teraz),
  });

  return (
    <View style={styles.sekcja}>
      <Text style={styles.naglowekGrupy} accessibilityRole="header">{t('Trwa wypiek')}</Text>
      <View style={styles.karta} testID="start-trwa-wypiek">
        <Spirala kroki={kroki} wariant="mala" biezacy={sesja.stepIdx} postepKroku={postep} etykieta={etykieta} />
        <View style={styles.opis}>
          <Text style={styles.krokTitle}>{nazwa}</Text>
          {pozostaloMin !== null && (
            <Text style={styles.tresc}>
              {koniecKroku === null
                ? t('zostało {czas}', { czas: czasSlownie(pozostaloMin) })
                : t('zostało {czas}, do {godzina}', { czas: czasSlownie(pozostaloMin), godzina: formatTime(koniecKroku) })}
            </Text>
          )}
          <Text style={styles.objasnienie}>
            {gotowe === null
              ? nazwaReceptury(sesja.recipeName)
              : t('{nazwa}: gotowe {dzien} o {godzina}', {
                  nazwa: nazwaReceptury(sesja.recipeName),
                  dzien: dzienSlownie(gotowe, new Date(teraz)),
                  godzina: formatTime(gotowe),
                })}
          </Text>
        </View>
      </View>
      <Pressable
        testID="resume-bake-btn"
        accessibilityRole="button"
        accessibilityLabel={t('Wróć do wypieku')}
        style={styles.glowny}
        onPress={onWroc}
      >
        <Text style={styles.glownyTekst}>{t('Wróć do wypieku')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sekcja: { gap: odstepy.m },
  naglowekGrupy: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  karta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: odstepy.m,
    padding: odstepy.l,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.powierzchnia,
  },
  opis: { flexGrow: 1, flexShrink: 1, flexBasis: 160, minWidth: 0, gap: odstepy.xs },
  krokTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: typografia.style.tytul2.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  objasnienie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
});
