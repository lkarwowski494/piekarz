// ============================================================================
// Apps4Craft Studio — BakeHistorySection Component
// History log list, sensory radar visualization, and "bake again" shortcuts.
// 100% Offline-First.
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
  // Położenie sekcji w treści ekranu: karta mierzy się względem sekcji
  const gora = React.useRef(0);
  return (
    <View style={styles.historyContainer} onLayout={(e) => { gora.current = e.nativeEvent.layout.y; }}>
      <Text style={styles.sectionHeading}>{t('Historia wypieków')}</Text>

      {/* Filtry smaku na pasie Dziennika (D10 opcja A): FILTRY_SMAKU w app/(tabs)/dziennik/index.tsx [M3 D10] */}

      {bakeHistory.length === 0 ? (
        // Pusty Dziennik: zaproszenie i jedna akcja do listy receptur (design-spec §11c 116, `dziennik-pusty`)
        // [M1-audytor-generalny-116]
        <View style={styles.emptyHistoryBox}>
          <Text style={styles.emptyHistoryTitle} accessibilityRole="header">{t('Tu zapiszą się twoje wypieki')}</Text>
          <Text style={styles.emptyHistoryText}>{t('Po każdym wypieku zapiszę recepturę, datę i twoją ocenę. Zacznij od receptury.')}</Text>
          <Pressable
            accessibilityRole="button"
            testID="journal-empty-choose-recipe-btn"
            style={styles.emptyHistoryBtn}
            onPress={onChooseRecipe}
          >
            <Text style={styles.emptyHistoryBtnText}>{t('Wybierz recepturę')}</Text>
          </Pressable>
        </View>
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
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyRecipeName}>{nazwaReceptury(log.recipeName)}</Text>
                <View style={styles.historyActionsRow}>
                  {log.ratingStars !== undefined && (
                    <Text style={styles.historyStars}>{t('Ocena: {n}/5', { n: log.ratingStars })}</Text>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    testID={`delete-bake-log-${log.id}`}
                    onPress={() => onDeleteBakeLog(log.id)}
                    style={styles.deleteHistoryBtn}
                    accessibilityLabel={t('Usuń wpis')}
                  >
                    <Text style={styles.deleteHistoryBtnText}>{t('Usuń wpis')}</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.historyDate}>{dateStr}</Text>

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

              {/* Bake Again Button (Zadanie P3) */}
              <Pressable
                testID={`bake-again-btn-${log.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${t('Piecz ponownie')}: ${nazwaReceptury(log.recipeName)}`}
                style={styles.bakeAgainBtn}
                onPress={() => onBakeAgain(log)}
              >
                <Text style={styles.bakeAgainBtnText}>{t('Piecz ponownie')}</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    marginTop: 10,
  },
  sectionHeading: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 10,
    marginTop: 6,
  },
  emptyHistoryBox: {
    gap: odstepy.m,
    marginTop: odstepy.xxl,
  },
  emptyHistoryTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytul2.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
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
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  historyCardWyrozniony: { borderWidth: 2, borderColor: theme.colors.akcent },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRecipeName: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    flex: 1,
  },
  historyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyStars: {
    fontSize: typografia.style.przypis.pt,
  },
  deleteHistoryBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    padding: 4,
  },
  deleteHistoryBtnText: {
    fontSize: 14,
    color: theme.colors.blad,
  },
  historyDate: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz3,
    marginTop: 2,
    marginBottom: 8,
  },
  historyPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  historyPill: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  historyRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    marginVertical: 8,
  },
  historyNotes: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 6,
  },
  bakeAgainBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  bakeAgainBtnText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
});
