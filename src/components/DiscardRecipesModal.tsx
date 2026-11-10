import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { ArkuszKart } from './arkusz/ArkuszKart';
import { Karta, wygladKarty } from '../ui/karty/Karta';
import { IkonaKarty } from '../ui/karty/IkonaKarty';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { useUnitSystem, formatWeight } from '../lib/unit-converter';
import {
  filterDiscardRecipes,
  DiscardCategory,
} from '../recipes/discard-recipes';

import { typografia } from '../ui/tokeny';
interface DiscardRecipesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DiscardRecipesModal({ visible, onClose }: DiscardRecipesModalProps) {
  // Masy w jednostkach z ustawienia (D-044) [M1-audytor-generalny-096]
  const unitSystem = useUnitSystem();
  const [selectedCategory, setSelectedCategory] = useState<DiscardCategory | 'all'>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const recipes = useMemo(() => {
    return filterDiscardRecipes(selectedCategory);
  }, [selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedRecipeId((prev) => (prev === id ? null : id));
  };

  return (
    // Arkusz na kartach: „Zamknij” w pasku arkusza, filtr w karcie, każdy przepis jako karta (README §1, §3) [M3 p7, 04-002]
    <ArkuszKart visible={visible} onRequestClose={onClose}
      lewy={{ tekst: t('Zamknij'), onPress: onClose, testID: 'close-discard-modal-btn', etykieta: t('Zamknij przepisy na odrzut') }}>
        <Karta testID="karta-odrzutu" tytul={t('Przepisy na Odrzut Zakwasu')} ikona={<IkonaKarty nazwa="sloik" />}
          podpis={t('Kuchnia zero-waste: krakersy, naleśniki, gofry i ciasteczka bez marnowania zakwasu')}>
          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === 'all' }}
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
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === 'crackers' }}
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
                {t('Krakersy')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === 'pancakes' }}
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
                {t('Naleśniki')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === 'waffles' }}
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
                {t('Gofry')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === 'cookies' }}
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
                {t('Ciasteczka')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === 'flatbread' }}
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
                {t('Podpłomyki')}
              </Text>
            </Pressable>
          </ScrollView>
        </Karta>

          {recipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <View
                key={recipe.id}
                style={styles.card}
                testID={`discard-card-${recipe.id}`}
              >
                <Pressable
                  accessibilityRole="button"
                  testID={`toggle-discard-${recipe.id}`}
                  onPress={() => toggleExpand(recipe.id)}
                  style={styles.cardHeaderPressable}
                >
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>{t(recipe.titlePl)}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.discardGramsPill}>
                        <Text style={styles.discardGramsText}>
                          {formatWeight(recipe.discardWeightGrams, unitSystem)} {t('odrzutu')}
                        </Text>
                      </View>
                      <Text style={styles.timeMeta}>
                        {t('{n} min', { n: recipe.prepTimeMinutes + recipe.cookTimeMinutes })}
                      </Text>
                      <Text style={styles.yieldMeta}>{t(recipe.yieldPl)}</Text>
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
                          <Text style={styles.ingredientName}>{t(ing.namePl)}</Text>
                          <Text style={styles.ingredientAmount}>
                            {ing.unit === 'g' ? formatWeight(ing.amount, unitSystem) : ` `}
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
                        <Text style={styles.stepText}>{t(step)}</Text>
                      </View>
                    ))}

                    {/* Pro tip */}
                    <View style={styles.proTipBox}>
                      <Text style={styles.proTipTitle}>{t('Wskazówka rzemieślnicza:')}</Text>
                      <Text style={styles.proTipText}>{t(recipe.proTipPl)}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
    </ArkuszKart>
  );
}

const styles = StyleSheet.create({
  categoryScroll: {
    marginTop: 4,
  },
  categoryChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  categoryChipText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  // Przepis jako karta (README §2: tło, obwódka kartaLinia, promień karta) [M3 p7]
  card: {
    ...wygladKarty,
    padding: theme.spacing.md,
  },
  cardHeaderPressable: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleBlock: {
    get fontFamily() { return theme.typography.krojTytulow; },
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  discardGramsPill: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  discardGramsText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  timeMeta: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
  },
  yieldMeta: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz3,
  },
  toggleIcon: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz3,
    padding: 4,
  },
  expandedContent: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.linia,
    paddingTop: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 6,
    marginTop: 6,
  },
  ingredientsBox: {
    backgroundColor: theme.colors.powierzchnia,
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
    color: theme.colors.akcentTekst,
    marginRight: 6,
    fontSize: typografia.style.objasnienie.pt,
  },
  ingredientName: {
    flex: 1,
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz,
  },
  ingredientAmount: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    backgroundColor: theme.colors.akcent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  stepText: {
    flex: 1,
    fontSize: typografia.style.podpis.pt,
    lineHeight: 18,
    color: theme.colors.tusz2,
  },
  proTipBox: {
    backgroundColor: theme.colors.powierzchnia,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.akcent,
    padding: 8,
    borderRadius: theme.radius.sm,
    marginTop: 8,
  },
  proTipTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
    marginBottom: 2,
  },
  proTipText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz,
    lineHeight: 16,
  },
});
