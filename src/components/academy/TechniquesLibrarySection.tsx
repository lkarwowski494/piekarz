import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import {
  TechniqueCategory,
  TechniqueCard,
} from '../../core/baking-techniques';

export interface TechniquesLibrarySectionProps {
  techniques: TechniqueCard[];
  techCategory: TechniqueCategory | 'all';
  onCategoryChange: (category: TechniqueCategory | 'all') => void;
}

export function TechniquesLibrarySection({
  techniques,
  techCategory,
  onCategoryChange,
}: TechniquesLibrarySectionProps) {
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.tabIntroText}>
        {t(
          '12 autorskich kart rzemieślniczych z fizykochemicznymi regułami, krokami wykonania i typowymi błędami.'
        )}
      </Text>

      {/* Technique Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.techCategoryScroll}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: techCategory === 'all' }}
          style={[styles.smallChip, techCategory === 'all' && styles.smallChipActive]}
          onPress={() => onCategoryChange('all')}
        >
          <Text style={[styles.smallChipText, techCategory === 'all' && styles.smallChipTextActive]}>
            {t('Wszystkie')} (12)
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: techCategory === 'dough_prep' }}
          style={[styles.smallChip, techCategory === 'dough_prep' && styles.smallChipActive]}
          onPress={() => onCategoryChange('dough_prep')}
        >
          <Text style={[styles.smallChipText, techCategory === 'dough_prep' && styles.smallChipTextActive]}>
            {t('Wyrabianie')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: techCategory === 'bulk_fermentation' }}
          style={[styles.smallChip, techCategory === 'bulk_fermentation' && styles.smallChipActive]}
          onPress={() => onCategoryChange('bulk_fermentation')}
        >
          <Text style={[styles.smallChipText, techCategory === 'bulk_fermentation' && styles.smallChipTextActive]}>
            {t('Składania')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: techCategory === 'shaping' }}
          style={[styles.smallChip, techCategory === 'shaping' && styles.smallChipActive]}
          onPress={() => onCategoryChange('shaping')}
        >
          <Text style={[styles.smallChipText, techCategory === 'shaping' && styles.smallChipTextActive]}>
            {t('Formowanie')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: techCategory === 'baking_cooling' }}
          style={[styles.smallChip, techCategory === 'baking_cooling' && styles.smallChipActive]}
          onPress={() => onCategoryChange('baking_cooling')}
        >
          <Text style={[styles.smallChipText, techCategory === 'baking_cooling' && styles.smallChipTextActive]}>
            {t('Wypiek i studzenie')}
          </Text>
        </Pressable>
      </ScrollView>

      {techniques.map((tech) => {
        const isExpanded = expandedTechId === tech.id;
        return (
          <View key={tech.id} style={styles.card} testID={`tech-card-${tech.code}`}>
            <Pressable
              accessibilityRole="button"
              style={styles.lessonHeaderPressable}
              onPress={() =>
                setExpandedTechId((prev) => (prev === tech.id ? null : tech.id))
              }
            >
              <View style={styles.lessonTitleBlock}>
                <View style={styles.levelPillRow}>
                  <Text style={styles.techCodeTag}>{tech.code}</Text>
                </View>
                <Text style={styles.cardTitle}>{t(tech.titlePl)}</Text>
              </View>
              <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </Pressable>

            <Text style={styles.techPrincipleText}>{t(tech.physicalPrinciplePl)}</Text>

            {isExpanded && (
              <View style={styles.expandedLessonBox}>
                <Text style={styles.subSectionTitle}>{t('Prawidłowe wykonanie:')}</Text>
                {tech.executionStepsPl.map((step, idx) => (
                  <View key={idx} style={styles.stepItemRow}>
                    <Text style={styles.checkBullet}>✓</Text>
                    <Text style={styles.stepItemText}>{t(step)}</Text>
                  </View>
                ))}

                <Text style={styles.subSectionTitleMistake}>{t('Czego unikać (typowe błędy):')}</Text>
                {tech.commonMistakesPl.map((mistake, idx) => (
                  <View key={idx} style={styles.stepItemRow}>
                    <Text style={styles.crossBullet}>✕</Text>
                    <Text style={styles.mistakeText}>{t(mistake)}</Text>
                  </View>
                ))}

                <View style={styles.techProTipBox}>
                  <Text style={styles.proTipTitle}>{t('Złota rada rzemieślnika:')}</Text>
                  <Text style={styles.proTipText}>{t(tech.proTipsPl)}</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabIntroText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  techCategoryScroll: {
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  lessonHeaderPressable: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lessonTitleBlock: {
    get fontFamily() { return theme.typography.krojTytulow; },
    flex: 1,
    marginRight: 8,
  },
  levelPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  techCodeTag: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    color: theme.colors.akcentTekst,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  cardTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  toggleIcon: {
    fontSize: 14,
    color: theme.colors.tusz3,
    padding: 4,
  },
  techPrincipleText: {
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 16,
    marginBottom: 6,
  },
  expandedLessonBox: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.linia,
    paddingTop: theme.spacing.sm,
  },
  subSectionTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 8,
    marginBottom: 4,
  },
  subSectionTitleMistake: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.blad,
    marginTop: 8,
    marginBottom: 4,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  checkBullet: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
    marginRight: 6,
  },
  crossBullet: {
    color: theme.colors.blad,
    fontWeight: '700',
    marginRight: 6,
  },
  stepItemText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.tusz,
  },
  mistakeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.tusz2,
  },
  techProTipBox: {
    backgroundColor: theme.colors.powierzchnia,
    padding: 8,
    borderRadius: theme.radius.sm,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.akcent,
  },
  proTipTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
    marginBottom: 2,
  },
  proTipText: {
    fontSize: 11,
    color: theme.colors.tusz,
    lineHeight: 15,
  },
  smallChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    marginRight: 6,
  },
  smallChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  smallChipText: {
    fontSize: 11,
    color: theme.colors.tusz2,
  },
  smallChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
});
