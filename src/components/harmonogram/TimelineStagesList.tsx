// ============================================================================
// Apps4Craft Studio — TimelineStagesList Component
// Interactive timeline displaying chronological baking stages and sleep collisions.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { ScheduledStage } from '../../scheduler/reverse-scheduler';
import { czasTrwania } from '../../lib/czas-trwania';
import { IkonaStartu } from '../start/IkonaStartu';

import { typografia } from '../../ui/tokeny';

/** Szerokość kolumny godzin przy zwykłym tekście (makieta planu). */
const SZEROKOSC_GODZIN = 65;

export interface TimelineStagesListProps {
  stages: ScheduledStage[];
  formatTime: (d: Date) => string;
  formatDayBadge: (d: Date) => string;
}

export function TimelineStagesList({
  stages,
  formatTime,
  formatDayBadge,
}: TimelineStagesListProps) {
  // Kolumna godzin rośnie z Dynamic Type; od fontScale 2 (AX1–AX5, jak ekran zakupu 200) godziny idą nad treścią
  // w pełnej szerokości, bez kolumny kropek [audyt-niezalezny G-5]
  const { fontScale } = useWindowDimensions();
  const duzyTekst = fontScale >= 2;
  const kolumna = duzyTekst ? styles.timeRow : { width: Math.round(SZEROKOSC_GODZIN * Math.max(1, fontScale)) };
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>{t('Oś czasu przygotowania')}</Text>

      <View style={styles.timeline}>
        {stages.map((stage: ScheduledStage, idx: number) => {
          const isColliding = stage.isSleepCollision;
          return (
            <View key={stage.id} testID={`timeline-item-${idx}`} style={[styles.timelineItem, duzyTekst && styles.timelineItemKolumna]}>
              <View testID={`timeline-time-${idx}`} style={[styles.timeColumn, kolumna]}>
                <Text style={[styles.startTimeText, isColliding && styles.timeCollision]}>
                  {formatTime(stage.startTime)}
                </Text>
                <Text style={styles.endTimeText}>– {formatTime(stage.endTime)}</Text>
                <Text style={styles.dateText}>{formatDayBadge(stage.startTime)}</Text>
              </View>

              {!duzyTekst && <View testID={`timeline-bullet-${idx}`} style={styles.bulletColumn}>
                <View
                  style={[
                    styles.bullet,
                    isColliding
                      ? styles.bulletCollision
                      : stage.isPassive
                      ? styles.bulletPassive
                      : styles.bulletActive,
                  ]}
                />
                {idx < stages.length - 1 && <View style={styles.verticalLine} />}
              </View>}

              <View style={[styles.contentColumn, duzyTekst && styles.contentPelna]}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageName}>{t(stage.namePl)}</Text>
                </View>

                <View style={styles.stageMetaRow}>
                  {/* wspólny format czasu trwania (§11c 116) [M1-audytor-generalny-116] */}
                  <Text style={styles.stageDuration} accessibilityLabel={czasTrwania(stage.durationMinutes).etykieta}>
                    {czasTrwania(stage.durationMinutes).tekst}
                  </Text>
                  <View
                    style={[
                      styles.typeBadge,
                      stage.isPassive ? styles.typeBadgePassive : styles.typeBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        stage.isPassive ? styles.typeBadgeTextPassive : styles.typeBadgeTextActive,
                      ]}
                    >
                      {/* Krok bierny z rękami na starcie (dokarmienie, piekarnik) nie jest „Pasywne” [audyt-niezalezny D-6] */}
                      {stage.isPassive ? (stage.rekaNaStarcie ? t('Ręce tylko na starcie') : t('Pasywne')) : t('Wymaga obecności')}
                    </Text>
                  </View>
                  {isColliding && (
                    <View style={styles.collisionBadge}>
                      {/* „W nocy” + księżyc, nie sam kolor (§11c 116) */}
                      <IkonaStartu nazwa="ksiezyc" kolor={theme.colors.blad} rozmiar={12} />
                      <Text style={styles.collisionBadgeText}>{t('W nocy')}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.stageInstructions}>{t(stage.instructionsPl)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeading: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 8,
    marginBottom: 12,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineItemKolumna: {
    flexDirection: 'column',
  },
  timeColumn: {
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 6,
    paddingRight: 0,
  },
  contentPelna: {
    paddingLeft: 0,
  },
  startTimeText: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  endTimeText: {
    fontSize: 11,
    color: theme.colors.tusz3,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
    marginTop: 2,
  },
  timeCollision: {
    color: theme.colors.blad,
  },
  bulletColumn: {
    alignItems: 'center',
    width: 32,
  },
  bullet: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.linia,
    zIndex: 1,
  },
  bulletActive: {
    borderColor: theme.colors.akcent,
  },
  bulletPassive: {
    borderColor: theme.colors.linia,
  },
  bulletCollision: {
    borderColor: theme.colors.blad,
    backgroundColor: theme.colors.powierzchnia,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.linia,
    marginTop: 2,
    marginBottom: -8,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingTop: 2,
  },
  stageTitleRow: {
    get fontFamily() { return theme.typography.krojTytulow; },
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  stageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  stageDuration: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz3,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeActive: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
  },
  typeBadgePassive: {
    backgroundColor: theme.colors.powierzchnia,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  typeBadgeTextActive: {
    color: theme.colors.akcentTekst,
  },
  typeBadgeTextPassive: {
    color: theme.colors.tusz3,
  },
  collisionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.blad,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  collisionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.blad,
  },
  stageInstructions: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    lineHeight: 16,
    marginTop: 2,
  },
});
