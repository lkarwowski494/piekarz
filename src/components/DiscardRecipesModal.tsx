import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import {
  getDiscardRecipes,
  filterDiscardRecipes,
  DiscardRecipe,
  DiscardCategory,
} from '../recipes/discard-recipes';

interface DiscardRecipesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DiscardRecipesModal({ visible, onClose }: DiscardRecipesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<DiscardCategory | 'all'>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const recipes = useMemo(() => {
    return filterDiscardRecipes(selectedCategory);
  }, [selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedRecipeId((prev) => (prev === id ? null : id));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>🥞 {t('Przepisy na Odrzut Zakwasu')}</Text>
            <Pressable
              testID="close-discard-modal-btn"
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              accessibilityLabel={t('Zamknij przepisy na odrzut')}
            >
              <CloseIcon size={20} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            {t('Kuchnia zero-waste: krakersy, naleśniki, gofry i ciasteczka bez marnowania zakwasu')}
          </Text>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <Pressable
              testID="discard-filter-all"
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'all' && styles.categoryChipTextActive,
                ]}
              >
                {t('Wszystkie')}
              </Text>
            </Pressable>
            <Pressable
              testID="discard-filter-crackers"
              style={[
                styles.categoryChip,
                selectedCategory === 'crackers' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('crackers')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'crackers' && styles.categoryChipTextActive,
                ]}
              >
                🧂 {t('Krakersy')}
              </Text>
            </Pressable>
            <Pressable
              testID="discard-filter-pancakes"
              style={[
                styles.categoryChip,
                selectedCategory === 'pancakes' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('pancakes')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'pancakes' && styles.categoryChipTextActive,
                ]}
              >
                🥞 {t('Naleśniki')}
              </Text>
            </Pressable>
            <Pressable
              testID="discard-filter-waffles"
              style={[
                styles.categoryChip,
                selectedCategory === 'waffles' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('waffles')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'waffles' && styles.categoryChipTextActive,
                ]}
              >
                🧇 {t('Gofry')}
              </Text>
            </Pressable>
            <Pressable
              testID="discard-filter-cookies"
              style={[
                styles.categoryChip,
                selectedCategory === 'cookies' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('cookies')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'cookies' && styles.categoryChipTextActive,
                ]}
              >
                🍪 {t('Ciasteczka')}
              </Text>
            </Pressable>
            <Pressable
              testID="discard-filter-flatbread"
              style={[
                styles.categoryChip,
                selectedCategory === 'flatbread' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('flatbread')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'flatbread' && styles.categoryChipTextActive,
                ]}
              >
                🫓 {t('Podpłomyki')}
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {recipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <View
                key={recipe.id}
                style={styles.card}
                testID={`discard-card-${recipe.id}`}
              >
                <Pressable
                  testID={`toggle-discard-${recipe.id}`}
                  onPress={() => toggleExpand(recipe.id)}
                  style={styles.cardHeaderPressable}
                >
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>{recipe.titlePl}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.discardGramsPill}>
                        <Text style={styles.discardGramsText}>
                          🫙 {recipe.discardWeightGrams} g {t('odrzutu')}
                        </Text>
                      </View>
                      <Text style={styles.timeMeta}>
                        ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
                      </Text>
                      <Text style={styles.yieldMeta}>🍽️ {recipe.yieldPl}</Text>
                    </View>
                  </View>
                  <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </Pressable>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {/* Ingredients */}
                    <Text style={styles.sectionSubtitle}>{t('Składniki:')}</Text>
                    <View style={styles.ingredientsBox}>
                      {recipe.ingredients.map((ing, idx) => (
                        <View key={idx} style={styles.ingredientRow}>
                          <Text style={styles.ingredientBullet}>•</Text>
                          <Text style={styles.ingredientName}>{ing.namePl}</Text>
                          <Text style={styles.ingredientAmount}>
                            {ing.amount} {ing.unit}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Step-by-step instructions */}
                    <Text style={styles.sectionSubtitle}>{t('Przygotowanie krok po kroku:')}</Text>
                    {recipe.stepsPl.map((step, idx) => (
                      <View key={idx} style={styles.stepRow}>
                        <View style={styles.stepNumberBadge}>
                          <Text style={styles.stepNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}

                    {/* Pro tip */}
                    <View style={styles.proTipBox}>
                      <Text style={styles.proTipTitle}>💡 {t('Wskazówka rzemieślnicza:')}</Text>
                      <Text style={styles.proTipText}>{recipe.proTipPl}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  categoryScroll: {
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  categoryChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeaderPressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  discardGramsPill: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  discardGramsText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  timeMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  yieldMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  toggleIcon: {
    fontSize: 14,
    color: theme.colors.textMuted,
    padding: 4,
  },
  expandedContent: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  ingredientsBox: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  ingredientBullet: {
    color: theme.colors.accent,
    marginRight: 6,
    fontSize: 14,
  },
  ingredientName: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  ingredientAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  proTipBox: {
    backgroundColor: theme.colors.surfaceCard,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    padding: 8,
    borderRadius: theme.radius.sm,
    marginTop: 8,
  },
  proTipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 2,
  },
  proTipText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
});
