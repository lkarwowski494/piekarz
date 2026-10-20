// ============================================================================
// Apps4Craft Studio — FormulaPresetSelector Component
// Master recipes and custom user formulas selector with details preview.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { StoredRecipe } from '../../data/db';
import { formatTemperature, UnitSystem } from '../../lib/unit-converter';
import type { RecipePreset } from '../../recipes/presets';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';

export type CategoryFilterType = 'all' | 'sourdough' | 'rye' | 'yeast' | 'pizza_sweet';

export interface FormulaPresetSelectorProps {
  filteredMasterRecipes: RecipePreset[];
  totalMasterRecipesCount: number;
  masterCategoryFilter: CategoryFilterType;
  onCategoryFilterChange: (cat: CategoryFilterType) => void;
  selectedPresetId: string;
  onSelectMasterPreset: (id: string) => void;
  currentMasterPreset: RecipePreset | undefined;
  customRecipes: StoredRecipe[];
  onSelectCustomRecipe: (recipe: StoredRecipe) => void;
  onDeleteCustomRecipe: (recipe: StoredRecipe) => void;
  onOpenVolumeConverter: () => void;
  onOpenImportRecipe: () => void;
  onOpenScanQr: () => void;
  unitSystem: UnitSystem;
}

export function FormulaPresetSelector({
  filteredMasterRecipes,
  totalMasterRecipesCount,
  masterCategoryFilter,
  onCategoryFilterChange,
  selectedPresetId,
  onSelectMasterPreset,
  currentMasterPreset,
  customRecipes,
  onSelectCustomRecipe,
  onDeleteCustomRecipe,
  onOpenVolumeConverter,
  onOpenImportRecipe,
  onOpenScanQr,
  unitSystem,
}: FormulaPresetSelectorProps) {
  return (
    <View>
      {/* Master & Custom Recipes Selector Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>{t('Receptury mistrzowskie')}</Text>
        <View style={styles.headerPillsRow}>
          <Pressable
            testID="open-volume-converter-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Przelicznik objętości')}
            style={styles.headerActionPill}
            onPress={onOpenVolumeConverter}
          >
            <Text style={styles.headerActionPillText}>{t('Przelicznik objętości')}</Text>
          </Pressable>
          <Pressable
            testID="open-import-recipe-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Importuj JSON')}
            style={styles.headerActionPill}
            onPress={onOpenImportRecipe}
          >
            <Text style={styles.headerActionPillText}>{t('Importuj JSON')}</Text>
          </Pressable>
          {/* F-08 PÓŹNIEJ (D-043): skan QR ukryty, 1.0 nie prosi o aparat [M1-audytor-generalny-049] */}
          {wejscieWidoczne('qr') && (
            <Pressable
              testID="open-scan-qr-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Skanuj QR')}
              style={styles.headerActionPill}
              onPress={onOpenScanQr}
            >
              <Text style={styles.headerActionPillText}>{t('Skanuj QR')}</Text>
            </Pressable>
          )}
          {/* Druk tylko z akcji Kalkulatora: „Drukuj” (BR-DRUK-001) [M1-audytor-generalny-032] */}
        </View>
      </View>

      {/* Master Recipes Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterScroll}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: masterCategoryFilter === 'all' }}
          testID="category-filter-all"
          onPress={() => onCategoryFilterChange('all')}
          style={[styles.categoryFilterChip, masterCategoryFilter === 'all' && styles.categoryFilterChipActive]}
        >
          <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'all' && styles.categoryFilterChipTextActive]}>
            {t('Wszystkie')} ({totalMasterRecipesCount})
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: masterCategoryFilter === 'sourdough' }}
          testID="category-filter-sourdough"
          onPress={() => onCategoryFilterChange('sourdough')}
          style={[styles.categoryFilterChip, masterCategoryFilter === 'sourdough' && styles.categoryFilterChipActive]}
        >
          <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'sourdough' && styles.categoryFilterChipTextActive]}>
            {t('Na zakwasie')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: masterCategoryFilter === 'rye' }}
          testID="category-filter-rye"
          onPress={() => onCategoryFilterChange('rye')}
          style={[styles.categoryFilterChip, masterCategoryFilter === 'rye' && styles.categoryFilterChipActive]}
        >
          <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'rye' && styles.categoryFilterChipTextActive]}>
            {t('Żytnie')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: masterCategoryFilter === 'yeast' }}
          testID="category-filter-yeast"
          onPress={() => onCategoryFilterChange('yeast')}
          style={[styles.categoryFilterChip, masterCategoryFilter === 'yeast' && styles.categoryFilterChipActive]}
        >
          <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'yeast' && styles.categoryFilterChipTextActive]}>
            {t('Drożdżowe')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: masterCategoryFilter === 'pizza_sweet' }}
          testID="category-filter-pizza-sweet"
          onPress={() => onCategoryFilterChange('pizza_sweet')}
          style={[styles.categoryFilterChip, masterCategoryFilter === 'pizza_sweet' && styles.categoryFilterChipActive]}
        >
          <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'pizza_sweet' && styles.categoryFilterChipTextActive]}>
            {t('Pizza i słodkie')}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Master Preset Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {filteredMasterRecipes.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
              key={preset.id}
              testID={`preset-chip-${preset.id}`}
              onPress={() => onSelectMasterPreset(preset.id)}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
            >
              <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                {t(preset.namePl)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Master Recipe Details Card */}
      {currentMasterPreset && (
        <View style={styles.masterRecipeInfoCard} testID="master-recipe-info-card">
          <View style={styles.masterInfoPillsRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {currentMasterPreset.category === 'sourdough' && t('Na zakwasie')}
                {currentMasterPreset.category === 'rye' && t('Żytni')}
                {currentMasterPreset.category === 'yeast' && t('Drożdżowy')}
                {currentMasterPreset.category === 'pizza' && t('Pizza')}
                {currentMasterPreset.category === 'sweet' && t('Słodkie')}
              </Text>
            </View>
            <View
              style={[
                styles.difficultyPill,
                currentMasterPreset.difficulty === 'easy' && styles.difficultyEasy,
                currentMasterPreset.difficulty === 'medium' && styles.difficultyMedium,
                currentMasterPreset.difficulty === 'hard' && styles.difficultyHard,
                currentMasterPreset.difficulty === 'artisan' && styles.difficultyArtisan,
              ]}
            >
              <Text style={styles.difficultyPillText}>
                {currentMasterPreset.difficulty === 'easy' && t('Łatwy')}
                {currentMasterPreset.difficulty === 'medium' && t('Średni')}
                {currentMasterPreset.difficulty === 'hard' && t('Wymagający')}
                {currentMasterPreset.difficulty === 'artisan' && t('Mistrzowski')}
              </Text>
            </View>
          </View>

          <Text style={styles.masterDescriptionText}>{t(currentMasterPreset.descriptionPl)}</Text>

          <View style={styles.masterTechniqueBox}>
            <Text style={styles.masterTechniqueItem}>
 <Text style={styles.boldText}>{t('Pieczenie')}:</Text>{' '}
              {formatTemperature(currentMasterPreset.bakeTempSteamC, unitSystem)} (
              {currentMasterPreset.bakeTimeSteamMinutes}m {t('para')} +{' '}
              {t('{n}m w {temp}', { n: currentMasterPreset.bakeTimeBrowningMinutes, temp: formatTemperature(currentMasterPreset.bakeTempBrowningC, unitSystem) })})
            </Text>
            <Text style={styles.masterTechniqueItem}>
 <Text style={styles.boldText}>{t('Naczynie')}:</Text>{' '}
              {currentMasterPreset.recommendedVessel === 'dutch_oven'
                ? t('garnek żeliwny')
                : currentMasterPreset.recommendedVessel === 'bread_pan'
                ? t('foremka keksówka')
                : currentMasterPreset.recommendedVessel === 'baking_steel'
                ? t('stal piekarska')
                : t('blacha piekarnika')}
            </Text>
            {currentMasterPreset.notesPl ? (
              <Text style={styles.masterTechniqueItem}>
 <Text style={styles.boldText}>{t('Wskazówki')}:</Text> {t(currentMasterPreset.notesPl)}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Custom User Recipes List */}
      {customRecipes.length > 0 && (
        <View style={styles.customSectionContainer}>
          <Text style={styles.sectionHeading}>{t('Moje przepisy')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {customRecipes.map((custom) => {
              const isSelected = custom.id === selectedPresetId;
              return (
                <View key={custom.id} style={styles.customChipWrapper}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: !!(isSelected) }}
                    onPress={() => onSelectCustomRecipe(custom)}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  >
                    <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                      {custom.name}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Usuń recepturę: {nazwa}', { nazwa: custom.name })}
                    onPress={() => onDeleteCustomRecipe(custom)}
                    style={styles.deleteChipBtn}
                    hitSlop={8}
                  >
                    <Text style={styles.deleteChipText}>✕</Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeading: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: 8,
    marginTop: 8,
  },
  headerPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionPill: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerActionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  categoryFilterScroll: {
    marginBottom: 8,
  },
  categoryFilterChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryFilterChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  categoryFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  categoryFilterChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  presetScroll: {
    marginVertical: theme.spacing.sm,
  },
  presetChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  presetChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  presetChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  masterRecipeInfoCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    marginTop: 8,
    marginBottom: 12,
  },
  masterInfoPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  difficultyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyEasy: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  difficultyMedium: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  difficultyHard: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  difficultyArtisan: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  difficultyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  masterDescriptionText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    lineHeight: 18,
    marginBottom: 10,
  },
  masterTechniqueBox: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    gap: 5,
  },
  masterTechniqueItem: {
    fontSize: 12,
    color: theme.colors.tusz2,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  customSectionContainer: {
    marginTop: 6,
  },
  customChipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteChipBtn: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    marginLeft: -12,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  deleteChipText: {
    fontSize: 10,
    color: theme.colors.blad,
    fontWeight: '700',
  },
});
