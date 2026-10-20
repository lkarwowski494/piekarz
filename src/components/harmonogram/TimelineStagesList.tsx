// ============================================================================
// Apps4Craft Studio — TimelineStagesList Component
// Interactive timeline displaying chronological baking stages and sleep collisions.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { ScheduledStage } from '../../scheduler/reverse-scheduler';

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
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>{t('Oś czasu przygotowania')}</Text>

      <View style={styles.timeline}>
        {stages.map((stage: ScheduledStage, idx: number) => {
          const isColliding = stage.isSleepCollision;
          return (
            <View key={stage.id} style={styles.timelineItem}>
              <View style={styles.timeColumn}>
                <Text style={[styles.startTimeText, isColliding && styles.timeCollision]}>
                  {formatTime(stage.startTime)}
                </Text>
                <Text style={styles.endTimeText}>– {formatTime(stage.endTime)}</Text>
                <Text style={styles.dateText}>{formatDayBadge(stage.startTime)}</Text>
              </View>

              <View style={styles.bulletColumn}>
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
              </View>

              <View style={styles.contentColumn}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageName}>{t(stage.namePl)}</Text>
                </View>

                <View style={styles.stageMetaRow}>
                  <Text style={styles.stageDuration}>
                    {stage.durationMinutes >= 60
                      ? stage.durationMinutes % 60 > 0
                        ? t('{h}h {m}min', { h: Math.floor(stage.durationMinutes / 60), m: stage.durationMinutes % 60 })
                        : t('{h}h', { h: Math.floor(stage.durationMinutes / 60) })
                      : t('{n} min', { n: stage.durationMinutes })}
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
                      {stage.isPassive ? t('Pasywne') : t('Wymaga obecności')}
                    </Text>
                  </View>
                  {isColliding && (
                    <View style={styles.collisionBadge}>
                      <Text style={styles.collisionBadgeText}>{t('Kolizja nocna!')}</Text>
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
  timeColumn: {
    width: 65,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 2,
  },
  startTimeText: {
    fontSize: 13,
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
    fontSize: 12,
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
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 16,
    marginTop: 2,
  },
});
