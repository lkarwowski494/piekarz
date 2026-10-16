// ============================================================================
// Piekarz (Crust) — Wektorowy Wykres Radarowy Sensoryki Chleba (SVG Spider Chart)
// 5 Osi Rzemieślniczych: Chrupkość, Sprężystość, Kwasowość, Otwartość, Karmelizacja
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

export interface BreadSensoryProfile {
  crustCrispness: number;  // 1 - 5 (Chrupkość skórki)
  crumbElasticity: number; // 1 - 5 (Sprężystość miękiszu)
  acidity: number;         // 1 - 5 (Kwasowość)
  openCrumb: number;       // 1 - 5 (Otwartość miękiszu)
  caramelization: number;  // 1 - 5 (Karmelizacja i aromat)
}

export const DEFAULT_BREAD_SENSORY_PROFILE: BreadSensoryProfile = {
  crustCrispness: 4,
  crumbElasticity: 4,
  acidity: 3,
  openCrumb: 3,
  caramelization: 4,
};

export interface BreadAxisDefinition {
  key: keyof BreadSensoryProfile;
  labelPl: string;
  labelEn: string;
}

export const BREAD_SENSORY_AXES: BreadAxisDefinition[] = [
  { key: 'crustCrispness', labelPl: 'Chrupkość', labelEn: 'Crispness' },
  { key: 'crumbElasticity', labelPl: 'Sprężystość', labelEn: 'Elasticity' },
  { key: 'acidity', labelPl: 'Kwasowość', labelEn: 'Acidity' },
  { key: 'openCrumb', labelPl: 'Otwartość', labelEn: 'Open Crumb' },
  { key: 'caramelization', labelPl: 'Karmelizacja', labelEn: 'Roast/Aroma' },
];

export interface SensoryRadarChartProps {
  profile: BreadSensoryProfile;
  size?: number;
  language?: 'pl' | 'en';
  showLabels?: boolean;
  interactive?: boolean;
  onChangeProfile?: (newProfile: BreadSensoryProfile) => void;
  testID?: string;
}

export const SensoryRadarChart: React.FC<SensoryRadarChartProps> = ({
  profile,
  size = 220,
  language = 'pl',
  showLabels = true,
  interactive = false,
  onChangeProfile,
  testID,
}) => {
  const center = size / 2;
  const maxRadius = (size / 2) * 0.68;
  const levels = [1, 2, 3, 4, 5];
  const numAxes = BREAD_SENSORY_AXES.length;

  const getCoordinates = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getLevelPolygonPoints = (level: number) => {
    const r = (level / 5) * maxRadius;
    return BREAD_SENSORY_AXES.map((_, i) => {
      const { x, y } = getCoordinates(i, r);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const dataPoints = BREAD_SENSORY_AXES.map((axis, i) => {
    const rawVal = profile[axis.key] ?? 3;
    const clampedVal = Math.min(5, Math.max(1, rawVal));
    const r = (clampedVal / 5) * maxRadius;
    return getCoordinates(i, r);
  });

  const dataPolygonPointsString = dataPoints
    .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(' ');

  const handleStepValue = (key: keyof BreadSensoryProfile, delta: number) => {
    if (!onChangeProfile) return;
    const current = profile[key] ?? 3;
    const updated = Math.min(5, Math.max(1, current + delta));
    onChangeProfile({
      ...profile,
      [key]: updated,
    });
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} testID="bread-sensory-radar-svg">
          {/* Concentric grid polygons */}
          {levels.map((level) => (
            <Polygon
              key={`level-${level}`}
              points={getLevelPolygonPoints(level)}
              fill={level === 5 ? 'rgba(217, 119, 36, 0.04)' : 'none'}
              stroke={theme.colors.border}
              strokeWidth={level === 5 ? '1.5' : '1'}
              strokeDasharray={level < 5 ? '2,2' : undefined}
            />
          ))}

          {/* Spokes */}
          {BREAD_SENSORY_AXES.map((_, i) => {
            const { x, y } = getCoordinates(i, maxRadius);
            return (
              <Line
                key={`spoke-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={theme.colors.border}
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Sensory Polygon */}
          <Polygon
            points={dataPolygonPointsString}
            fill="rgba(217, 119, 36, 0.35)"
            stroke={theme.colors.accent}
            strokeWidth="2.5"
          />

          {/* Data Vertex Dots */}
          {dataPoints.map((pt, i) => (
            <Circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill={theme.colors.accent}
              stroke={theme.colors.surface}
              strokeWidth="1.5"
            />
          ))}

          {/* Outer Labels */}
          {showLabels &&
            BREAD_SENSORY_AXES.map((axis, i) => {
              const labelRadius = maxRadius + 14;
              const { x, y } = getCoordinates(i, labelRadius);
              const labelText = language === 'pl' ? axis.labelPl : axis.labelEn;

              let textAnchor: 'middle' | 'start' | 'end' = 'middle';
              if (i === 1 || i === 2) textAnchor = 'start';
              else if (i === 3 || i === 4) textAnchor = 'end';

              const dy = i === 0 ? -4 : i === 2 || i === 3 ? 10 : 4;

              return (
                <SvgText
                  key={`label-${axis.key}`}
                  x={x}
                  y={y + dy}
                  fill={theme.colors.textPrimary}
                  fontSize="10"
                  fontWeight="600"
                  textAnchor={textAnchor}
                >
                  {labelText} ({profile[axis.key] ?? 3})
                </SvgText>
              );
            })}
        </Svg>
      </View>

      {/* Interactive Controls (Steppers) */}
      {interactive && onChangeProfile && (
        <View style={styles.controlsContainer} testID="radar-interactive-controls">
          {BREAD_SENSORY_AXES.map((axis) => {
            const val = profile[axis.key] ?? 3;
            const label = language === 'pl' ? axis.labelPl : axis.labelEn;
            return (
              <View key={axis.key} style={styles.controlRow}>
                <Text style={styles.controlLabel}>{label}</Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    testID={`minus-radar-${axis.key}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('Zmniejsz')}: ${label}`}
                    style={[styles.stepperBtn, val <= 1 && styles.stepperBtnDisabled]}
                    disabled={val <= 1}
                    onPress={() => handleStepValue(axis.key, -1)}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </Pressable>

                  <Text style={styles.stepperValue} testID={`radar-val-${axis.key}`}>
                    {val}/5
                  </Text>

                  <Pressable
                    testID={`plus-radar-${axis.key}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('Zwiększ')}: ${label}`}
                    style={[styles.stepperBtn, val >= 5 && styles.stepperBtnDisabled]}
                    disabled={val >= 5}
                    onPress={() => handleStepValue(axis.key, 1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.sm,
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accent,
    minWidth: 28,
    textAlign: 'center',
  },
});
