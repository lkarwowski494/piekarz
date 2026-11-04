// ============================================================================
// Apps4Craft Studio — BakeHistorySection Component
// History log list, sensory radar visualization, and "bake again" shortcuts.
// 100% Offline-First.
// M3 p5 (karty/README.md §1, §4; inne.html #dziennik-pusty, #dziennik): nagłówek grupy z ikoną nad kartami (O2b),
// pusty stan w karcie, każdy wpis jako karta z ikoną i nazwą receptury w nagłówku; przyciski wpisu w rzędzie,
// przy dużym tekście jeden pod drugim (flexBasis od fontScale, D-142). Teksty i zachowanie bez zmian.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { nazwaReceptury } from '../../lib/nazwa-receptury';
import { appLocale, formatDate } from '../../lib/format';
import { formatTemperature, useUnitSystem } from '../../lib/unit-converter';
import { StoredBakeLog } from '../../data/db';
import { SensoryRadarChart } from '../SensoryRadarChart';
import { Karta, NaglowekKarty, wygladKarty } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';

export type FiltrSmaku = 'all' | 'mild' | 'balanced' | 'sour' | 'tangy';

/** Filtry smaku (etykieta = klucz PL do t()); na pasie Dziennika (D10) [M3 D10]. */
export const FILTRY_SMAKU: readonly { id: FiltrSmaku; testID: string; etykieta: string }[] = [
  { id: 'all', testID: 'filter-taste-all', etykieta: 'Wszystkie' },
  { id: 'mild', testID: 'filter-taste-mild', etykieta: 'Łagodny' },
  { id: 'balanced', testID: 'filter-taste-balanced', etykieta: 'Zbalansowany' },
  { id: 'sour', testID: 'filter-taste-sour', etykieta: 'Kwaśny' },
  { id: 'tangy', testID: 'filter-taste-tangy', etykieta: 'Bardzo kwaśny' },
];

export interface BakeHistorySectionProps {
  bakeHistory: StoredBakeLog[];
  filteredHistory: StoredBakeLog[];
  onDeleteBakeLog: (id: string) => void;
  onBakeAgain: (log: StoredBakeLog) => void;
  /** Pusty Dziennik: „Wybierz recepturę” prowadzi do zakładki Receptury. */
  onChooseRecipe: () => void;
  /** Wpis otwarty z kalendarza (BR-KAL-013): wyróżniony, a jego położenie w treści ekranu idzie do `onWyroznionyY`. */
  wyroznionyId?: string;
  onWyroznionyY?: (y: number) => void;
}

export function BakeHistorySection({
  bakeHistory,
  filteredHistory,
  onDeleteBakeLog,
  onBakeAgain,
  onChooseRecipe,
  wyroznionyId,
  onWyroznionyY,
}: BakeHistorySectionProps) {
  const unitSystem = useUnitSystem();
  const duzy = useDuzyTekst();
  const przycisk = { flexBasis: duzy ? ('100%' as const) : 0 };
  // Położenie sekcji w treści ekranu: karta mierzy się względem sekcji
  const gora = React.useRef(0);
  return (
    <View style={styles.historyContainer} onLayout={(e) => { gora.current = e.nativeEvent.layout.y; }}>
      <NaglowekKarty testID="grupa-historia" tytul={t('Historia wypieków')} ikona={<IkonaKarty nazwa="lista" />} style={styles.odstepGrupy} />

      {/* Filtry smaku na pasie Dziennika (D10 opcja A): FILTRY_SMAKU w app/(tabs)/dziennik/index.tsx [M3 D10] */}

      {bakeHistory.length === 0 ? (
        // Pusty Dziennik: zaproszenie i jedna akcja do listy receptur (design-spec §11c 116, `dziennik-pusty`)
        // [M1-audytor-generalny-116]
        <Karta testID="karta-dziennik-pusty" tytul={t('Tu zapiszą się twoje wypieki')} ikona={<IkonaKarty nazwa="kalendarz" />}>
          <Text style={styles.emptyHistoryText}>{t('Po każdym wypieku zapiszę recepturę, datę i twoją ocenę. Zacznij od receptury.')}</Text>
          <Pressable
            accessibilityRole="button"
            testID="journal-empty-choose-recipe-btn"
            style={styles.emptyHistoryBtn}
            onPress={onChooseRecipe}
          >
            <Text style={styles.emptyHistoryBtnText}>{t('Wybierz recepturę')}</Text>
          </Pressable>
        </Karta>
      ) : (
        // Wszystkie wpisy (BR-RECP-003 „Przegląd historii”; dawniej najwyżej 15) [M1-audytor-generalny-146]
        filteredHistory.map((log) => {
          const dateStr = formatDate(log.startedAt, appLocale(), {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            // Wpis z kalendarza (BR-KAL-013): obwódka akcentu i położenie do przewinięcia ekranu [M3 D7]
            <View key={log.id} style={[styles.historyCard, log.id === wyroznionyId && styles.historyCardWyrozniony]} testID={`bake-log-card-${log.id}`}
              onLayout={log.id === wyroznionyId && onWyroznionyY ? (e) => onWyroznionyY(gora.current + e.nativeEvent.layout.y) : undefined}>
              <NaglowekKarty testID={`bake-log-${log.id}`} tytul={nazwaReceptury(log.recipeName)} ikona={<IkonaKarty nazwa="bochenek" />} />
              {/* Data i ocena w jednym wierszu, jeden klucz z parametrami (makieta #dziennik, D-209) */}
              <Text style={styles.historyDate}>
                {log.ratingStars !== undefined ? t('{data}, ocena {n}/5', { data: dateStr, n: log.ratingStars }) : dateStr}
              </Text>

              {/* Crumb, crust & taste pills; temperatura w kuchni tylko zapisana przy wypieku (BR-RECP-003, bez zgadywania 017).
                  Temperatury ciasta wypiek dziś nie zapisuje (actualDdtC bez zapisu), więc jej nie pokazujemy [M1-audytor-generalny-146] */}
              <View style={styles.historyPillsRow}>
                {log.ambientTemp != null && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {t('Temperatura w kuchni:')} {formatTemperature(log.ambientTemp, unitSystem)}
                    </Text>
                  </View>
                )}
                {/* Metoda wypieku (D-260): tylko wpis z zapisaną metodą; starsze wpisy (null) bez etykiety [M3 p9b2f] */}
                {log.bakeMethod != null && (
                  <View style={styles.historyPill} testID={`bake-log-metoda-${log.id}`}>
                    <Text style={styles.historyPillText}>{log.bakeMethod === 'maszyna' ? t('Maszyna do chleba') : t('Piekarnik')}</Text>
                  </View>
                )}
                {log.crumbScore !== undefined && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {t('Miękisz:')} {log.crumbScore}/5
                    </Text>
                  </View>
                )}
                {log.crustScore !== undefined && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {t('Skórka:')} {log.crustScore}/5
                    </Text>
                  </View>
                )}
                {log.tasteProfile && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {log.tasteProfile === 'sour' ? t('Kwaśny') : log.tasteProfile === 'mild' ? t('Łagodny') : log.tasteProfile === 'tangy' ? t('Bardzo kwaśny') : t('Zbalansowany')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Wykres smaku tylko z zapisanego profilu: brak zostaje brakiem, bez zgadywanych wartości (PRZ-42) */}
              {log.sensoryProfile && (
                <View style={styles.historyRadarBox}>
                  <SensoryRadarChart
                    profile={log.sensoryProfile}
                    size={170}
                    showLabels={true}
                    testID={`history-radar-${log.id}`}
                  />
                </View>
              )}

              {log.notes && <Text style={styles.historyNotes}>{log.notes}</Text>}

              {/* „Piecz ponownie” i „Usuń wpis” w jednym rzędzie na dole karty (makieta #dziennik) [M3 p5] */}
              <View style={styles.historyActionsRow}>
                <Pressable
                  testID={`bake-again-btn-${log.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('Piecz ponownie')}: ${nazwaReceptury(log.recipeName)}`}
                  style={[styles.bakeAgainBtn, przycisk]}
                  onPress={() => onBakeAgain(log)}
                >
                  <Text style={styles.bakeAgainBtnText}>{t('Piecz ponownie')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  testID={`delete-bake-log-${log.id}`}
                  onPress={() => onDeleteBakeLog(log.id)}
                  style={[styles.bakeAgainBtn, przycisk]}
                  accessibilityLabel={t('Usuń wpis')}
                >
                  <Text style={styles.deleteHistoryBtnText}>{t('Usuń wpis')}</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    marginTop: odstepy.s,
    gap: odstepy.m,
  },
  // Nagłówek grupy nad kartami (O2b, D-184): ten sam co nagłówek karty
  odstepGrupy: { marginTop: odstepy.xs },
  emptyHistoryText: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz2,
  },
  emptyHistoryBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  emptyHistoryBtnText: {
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '600',
    color: theme.colors.tusz,
    textAlign: 'center',
  },
  historyCard: {
    ...wygladKarty,
    padding: odstepy.l,
    gap: odstepy.s,
    minWidth: 0,
  },
  historyCardWyrozniony: { borderWidth: 2, borderColor: theme.colors.akcent },
  historyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.s,
    marginTop: odstepy.xs,
  },
  deleteHistoryBtnText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.blad,
    textAlign: 'center',
  },
  historyDate: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
  historyPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.xs,
  },
  // Chip na karcie: kolory `tusz`/`obwodka` (README §2)
  historyPill: {
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    paddingHorizontal: odstepy.s,
    paddingVertical: odstepy.xs,
    borderRadius: promienie.znacznik,
  },
  historyPillText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  historyRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: odstepy.s,
  },
  historyNotes: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
  },
  bakeAgainBtn: {
    flexGrow: 1,
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    paddingVertical: odstepy.s,
    paddingHorizontal: odstepy.m,
    borderRadius: promienie.przycisk,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  bakeAgainBtnText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
    textAlign: 'center',
  },
});
