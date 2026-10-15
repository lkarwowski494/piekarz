import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  calculateDoughRecipe,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateBakedWeight,
  calculateBakeLossMetrics,
  calculateRequiredRawDoughWeight,
  BAKE_LOSS_PRESETS,
  BakeTypePresetId,
  getHydrationDifficulty,
  POPULAR_FLOUR_BLENDS,
  FlourItemInput,
} from '../../src/core/domain-rules';
import { analyzeFlourBlendAbsorption } from '../../src/core/flour-atlas';
import { MASTER_RECIPES } from '../../src/recipes/presets';
import {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  setActiveBake,
} from '../../src/data/sqlite-store';
import { StoredRecipe } from '../../src/data/db';
import { confirm } from '../../src/lib/confirm';
import { SettingsModal } from '../../src/components/SettingsModal';
import { formatRecipeText, copyRecipeToClipboard } from '../../src/lib/recipe-formatter';

type CalculationMode = 'loaves' | 'flour';

export default function CalculatorScreen() {
  const router = useRouter();

  // Mode: Bochenki (loaves) vs Masa mąki (flour)
  const [calcMode, setCalcMode] = useState<CalculationMode>('loaves');

  // Loaves mode parameters
  const [loavesCount, setLoavesCount] = useState<number>(2);
  const [loafWeightGrams, setLoafWeightGrams] = useState<number>(850);

  // Flour mode parameters
  const [flourGrams, setFlourGrams] = useState<number>(500);

  // Recipe parameters
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MASTER_RECIPES[0].id);
  const [recipeName, setRecipeName] = useState<string>(MASTER_RECIPES[0].namePl);
  const [flourBlend, setFlourBlend] = useState<FlourItemInput[]>([
    { name: 'Mąka pszenna chlebowa typ 750', percentage: 80.0, type: 'pszenna_750' },
    { name: 'Mąka żytnia typ 720', percentage: 20.0, type: 'zytnia_720' },
  ]);
  const [waterPct, setWaterPct] = useState<number>(68.0);
  const [starterPct, setStarterPct] = useState<number>(20.0);
  const [saltPct, setSaltPct] = useState<number>(2.0);
  const [starterHydration, setStarterHydration] = useState<number>(100.0);

  // DDT parameters
  const [targetDdt, setTargetDdt] = useState<number>(25.0);
  const [flourTemp, setFlourTemp] = useState<number>(21.0);
  const [roomTemp, setRoomTemp] = useState<number>(22.0);
  const [starterTemp, setStarterTemp] = useState<number>(21.0);
  const [frictionFactor, setFrictionFactor] = useState<number>(2.0);
  const [tapWaterTemp, setTapWaterTemp] = useState<number>(16.0);

  // Bake Loss & Crumb Moisture state
  const [selectedBakeLossPresetId, setSelectedBakeLossPresetId] = useState<BakeTypePresetId>('batard_boule');
  const [customBakeLossPercent, setCustomBakeLossPercent] = useState<number>(14.0);

  // Custom recipes & Settings state
  const [customRecipes, setCustomRecipes] = useState<StoredRecipe[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveRecipeNameInput, setSaveRecipeNameInput] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const loadRecipesFromStore = useCallback(async () => {
    const all = await getRecipes();
    setCustomRecipes(all.filter((r) => !r.isBuiltIn));
  }, []);

  useEffect(() => {
    loadRecipesFromStore();
  }, [loadRecipesFromStore]);

  // Select Master Preset
  const handleSelectMasterPreset = (presetId: string) => {
    const preset = MASTER_RECIPES.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setRecipeName(preset.namePl);
    setFlourBlend(preset.formula.flours);
    setWaterPct(preset.formula.waterPercentage);
    setStarterPct(preset.formula.starterPercentage);
    setSaltPct(preset.formula.saltPercentage);
    setStarterHydration(preset.formula.starterHydration ?? 100.0);
    setTargetDdt(preset.targetDDT);
  };

  // Select Custom Recipe
  const handleSelectCustomRecipe = (recipe: StoredRecipe) => {
    setSelectedPresetId(recipe.id);
    setRecipeName(recipe.name);
    setFlourBlend(recipe.formula.flours);
    setWaterPct(recipe.formula.waterPercentage);
    setStarterPct(recipe.formula.starterPercentage);
    setSaltPct(recipe.formula.saltPercentage);
    setStarterHydration(recipe.formula.starterHydration ?? 100.0);
    setTargetDdt(recipe.targetDDT);
  };

  // Delete Custom Recipe
  const handleDeleteCustomRecipe = (recipe: StoredRecipe) => {
    confirm({
      title: t('Usunąć przepis?'),
      message: `${recipe.name} — ${t('Przepis zostanie trwale usunięty.')}`,
      action: t('Usuń'),
      destructive: true,
      onConfirm: async () => {
        await deleteRecipe(recipe.id);
        if (selectedPresetId === recipe.id) {
          handleSelectMasterPreset(MASTER_RECIPES[0].id);
        }
        await loadRecipesFromStore();
      },
    });
  };

  // Apply Flour Blend Preset
  const handleSelectFlourBlend = (blend: typeof POPULAR_FLOUR_BLENDS[number]) => {
    setFlourBlend(blend.flours);
  };

  // Target Dough Weight depending on mode
  const targetDoughWeightGrams = useMemo(() => {
    if (calcMode === 'loaves') {
      return Math.round(loavesCount * loafWeightGrams);
    }
    const totalPercent = 100.0 + waterPct + starterPct + saltPct;
    return Math.round(flourGrams * (totalPercent / 100.0));
  }, [calcMode, loavesCount, loafWeightGrams, flourGrams, waterPct, starterPct, saltPct]);

  // Calculations
  const calculations = useMemo(() => {
    return calculateDoughRecipe({
      flours: flourBlend,
      waterPercentage: waterPct,
      starterPercentage: starterPct,
      saltPercentage: saltPct,
      starterHydration,
      targetDoughWeightGrams,
    });
  }, [flourBlend, waterPct, starterPct, saltPct, starterHydration, targetDoughWeightGrams]);

  const ddtResult = useMemo(() => {
    return calculateDDTWaterTemp({
      targetDDT: targetDdt,
      flourTemp,
      roomTemp,
      starterTemp,
      frictionFactor,
    });
  }, [targetDdt, flourTemp, roomTemp, starterTemp, frictionFactor]);

  const iceResult = useMemo(() => {
    if (ddtResult.status === 'requires_ice') {
      return calculateIceRequirement(
        calculations.waterGrams,
        tapWaterTemp,
        ddtResult.waterTempTarget
      );
    }
    return null;
  }, [ddtResult, calculations.waterGrams, tapWaterTemp]);

  const bakeLossMetrics = useMemo(() => {
    return calculateBakeLossMetrics(
      calculations.targetDoughWeightGrams,
      customBakeLossPercent,
      calculations.totalWaterGrams,
      calcMode === 'loaves' ? loavesCount : 1
    );
  }, [
    calculations.targetDoughWeightGrams,
    customBakeLossPercent,
    calculations.totalWaterGrams,
    calcMode,
    loavesCount,
  ]);

  const bakedTotalWeight = bakeLossMetrics.bakedWeightGrams;
  const bakedSingleLoafWeight = bakeLossMetrics.singleLoafBakedGrams ?? bakeLossMetrics.bakedWeightGrams;

  const handleSelectBakeLossPreset = (presetId: BakeTypePresetId) => {
    setSelectedBakeLossPresetId(presetId);
    const p = BAKE_LOSS_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setCustomBakeLossPercent(p.defaultLossPercent);
    }
  };

  const hydrationDifficulty = useMemo(() => {
    return getHydrationDifficulty(waterPct);
  }, [waterPct]);

  const blendAbsorption = useMemo(() => {
    return analyzeFlourBlendAbsorption(flourBlend, waterPct);
  }, [flourBlend, waterPct]);

  // Save Custom Recipe Handler
  const handleSaveCustomRecipe = async () => {
    const trimmed = saveRecipeNameInput.trim();
    if (!trimmed) return;

    const newCustom: StoredRecipe = {
      id: `recipe_${Date.now()}`,
      name: trimmed,
      formula: {
        flours: flourBlend,
        waterPercentage: waterPct,
        saltPercentage: saltPct,
        starterPercentage: starterPct,
        starterHydration,
        targetDoughWeightGrams,
      },
      targetDDT: targetDdt,
      isBuiltIn: false,
      createdAt: Date.now(),
    };

    await saveRecipe(newCustom);
    await loadRecipesFromStore();
    setSelectedPresetId(newCustom.id);
    setRecipeName(newCustom.name);
    setIsSaveModalOpen(false);
    setSaveRecipeNameInput('');
    Alert.alert(t('Zapisano przepis'), t('Przepis „{name}” został zapisany w Twojej bibliotece.', { name: trimmed }));
  };

  // Copy Recipe to Clipboard
  const handleCopyRecipe = async () => {
    const text = formatRecipeText({
      recipeName,
      calc: calculations,
      bakeLoss: bakeLossMetrics,
      targetDdt,
      waterTempTarget: ddtResult.waterTempTarget,
      iceGrams: iceResult?.iceGrams,
      tapWaterTemp,
      loavesCount: calcMode === 'loaves' ? loavesCount : 1,
    });
    const copied = await copyRecipeToClipboard(text);
    if (copied) {
      Alert.alert(t('Kopiuj recepturę'), t('Skopiowano przepis do schowka'));
    }
  };

  // Transfer to Workbench (Stolnica)
  const handleStartBakeOnWorkbench = () => {
    setActiveBake({
      id: `bake_${Date.now()}`,
      recipeName,
      startedAt: Date.now(),
      currentStageId: 'step_1',
      ambientTempC: roomTemp,
      actualDdtC: targetDdt,
      calculatedRecipe: calculations,
      recipeFormula: {
        flours: flourBlend,
        waterPercentage: waterPct,
        saltPercentage: saltPct,
        starterPercentage: starterPct,
        starterHydration,
        targetDoughWeightGrams,
      },
    });

    router.push('/(tabs)/stolnica');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.flex1}>
            <Text style={styles.title}>{t('Kalkulator')}</Text>
            <Text style={styles.subtitle}>True Baker’s % & DDT (Apps4Brew)</Text>
          </View>
          <Pressable
            testID="open-settings-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Ustawienia')}
            style={styles.settingsHeaderBtn}
            onPress={() => setIsSettingsOpen(true)}
          >
            <Text style={styles.settingsHeaderBtnText}>⚙️</Text>
          </Pressable>
        </View>

        {/* Master & Custom Recipes Selector */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{t('Receptury mistrzowskie')}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {MASTER_RECIPES.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <Pressable
                key={preset.id}
                onPress={() => handleSelectMasterPreset(preset.id)}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
              >
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                  {preset.namePl}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {customRecipes.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>{t('Moje przepisy')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {customRecipes.map((custom) => {
                const isSelected = custom.id === selectedPresetId;
                return (
                  <View key={custom.id} style={styles.customChipWrapper}>
                    <Pressable
                      onPress={() => handleSelectCustomRecipe(custom)}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    >
                      <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                        ⭐ {custom.name}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteCustomRecipe(custom)}
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

        {/* Calculation Mode Switcher */}
        <View style={styles.modeSwitcherContainer}>
          <Pressable
            style={[styles.modeTab, calcMode === 'loaves' && styles.modeTabActive]}
            onPress={() => setCalcMode('loaves')}
          >
            <Text style={[styles.modeTabText, calcMode === 'loaves' && styles.modeTabTextActive]}>
              🥖 {t('Bochenki')} ({loavesCount} × {loafWeightGrams}g)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, calcMode === 'flour' && styles.modeTabActive]}
            onPress={() => setCalcMode('flour')}
          >
            <Text style={[styles.modeTabText, calcMode === 'flour' && styles.modeTabTextActive]}>
              🌾 {t('Masa mąki')} ({flourGrams}g)
            </Text>
          </Pressable>
        </View>

        {/* Mode-Specific Input Card */}
        {calcMode === 'loaves' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('Liczba bochenków')} i gramatura</Text>
            <Text style={styles.cardSubtitle}>
              Zaplanuj ile chlebów chcesz upiec — kalkulator przeliczy składniki
            </Text>

            {/* Loaves Count Selector */}
            <View style={styles.row}>
              <Text style={styles.label}>{t('Liczba bochenków')}</Text>
              <View style={styles.chipRow}>
                {[1, 2, 3, 4].map((count) => (
                  <Pressable
                    key={count}
                    onPress={() => setLoavesCount(count)}
                    style={[styles.smallChip, loavesCount === count && styles.smallChipActive]}
                  >
                    <Text style={[styles.smallChipText, loavesCount === count && styles.smallChipTextActive]}>
                      {count} szt.
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Single Loaf Raw Weight Selector */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>{t('Waga bochenka')}</Text>
                <Text style={styles.sublabel}>
                  Masa surowego ciasta (po upieczeniu ~{bakedSingleLoafWeight} g)
                </Text>
              </View>
              <View style={styles.inputGroup}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setLoafWeightGrams((prev) => Math.max(300, prev - 50))}
                >
                  <Text style={styles.stepBtnText}>-50</Text>
                </Pressable>
                <TextInput
                  keyboardType="numeric"
                  value={String(loafWeightGrams)}
                  onChangeText={(val) => setLoafWeightGrams(Math.max(100, Number(val) || 0))}
                  style={styles.numberInput}
                />
                <Text style={styles.unitText}>g</Text>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setLoafWeightGrams((prev) => prev + 50)}
                >
                  <Text style={styles.stepBtnText}>+50</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('Masa mąki')} bazowej</Text>
            <Text style={styles.cardSubtitle}>Mąka stanowi 100% bazy w procentach piekarskich</Text>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>{t('Mąka')} łącznie</Text>
                <Text style={styles.sublabel}>Podstawa zasypu do miski</Text>
              </View>
              <View style={styles.inputGroup}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setFlourGrams((prev) => Math.max(100, prev - 50))}
                >
                  <Text style={styles.stepBtnText}>-50</Text>
                </Pressable>
                <TextInput
                  keyboardType="numeric"
                  value={String(flourGrams)}
                  onChangeText={(val) => setFlourGrams(Math.max(50, Number(val) || 0))}
                  style={styles.numberInput}
                />
                <Text style={styles.unitText}>g</Text>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setFlourGrams((prev) => prev + 50)}
                >
                  <Text style={styles.stepBtnText}>+50</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Flour Blend Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Mieszanka mąk')}</Text>
          <Text style={styles.cardSubtitle}>
            Połącz mąkę chlebową z pełnoziarnistą lub żytnią dla smaku i chrupkości
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blendScroll}>
            {POPULAR_FLOUR_BLENDS.map((blend) => (
              <Pressable
                key={blend.id}
                onPress={() => handleSelectFlourBlend(blend)}
                style={styles.blendPresetChip}
              >
                <Text style={styles.blendPresetText}>{blend.namePl}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Breakdown per flour */}
          {calculations.flours.map((flour, idx) => (
            <View key={idx} style={styles.flourItemRow}>
              <View style={styles.flex1}>
                <Text style={styles.flourItemName}>{flour.name}</Text>
                <Text style={styles.flourItemPct}>{flour.percentage.toFixed(0)}% mąki bazowej</Text>
              </View>
              <Text style={styles.flourItemGrams}>{flour.weightGrams} g</Text>
            </View>
          ))}
        </View>

        {/* Hydration & Artisan Parameters */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parametry rzemieślnicze</Text>
          <Text style={styles.cardSubtitle}>True Baker’s % — proporcje względem mąki</Text>

          {/* Water / Hydration */}
          <View style={styles.paramBlock}>
            <View style={styles.paramHeaderRow}>
              <View>
                <Text style={styles.label}>{t('Woda')} (Hydratacja)</Text>
                <View style={[styles.diffBadge, { backgroundColor: hydrationDifficulty.badgeColor + '20' }]}>
                  <Text style={[styles.diffBadgeText, { color: hydrationDifficulty.badgeColor }]}>
                    ● {hydrationDifficulty.labelPl}
                  </Text>
                </View>
              </View>
              <Text style={styles.paramBigValue}>{waterPct.toFixed(1)}%</Text>
            </View>
            <Text style={styles.paramTip}>{hydrationDifficulty.tipPl}</Text>

            <View style={styles.stepperRow}>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setWaterPct((prev) => Math.max(50, Number((prev - 5).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>-5%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setWaterPct((prev) => Math.max(50, Number((prev - 1).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>-1%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setWaterPct((prev) => Math.min(100, Number((prev + 1).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>+1%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setWaterPct((prev) => Math.min(100, Number((prev + 5).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>+5%</Text>
              </Pressable>
            </View>

            {/* Flour Atlas Absorption Analysis Badge */}
            <View style={styles.absorptionBadge} testID="flour-absorption-badge">
              <View style={styles.absorptionHeaderRow}>
                <Text style={styles.absorptionLabel}>
                  🌾 {t('Chłonność mąk:')} {blendAbsorption.weightedAbsorptionPercent}% ({t('zalecana')}: {blendAbsorption.recommendedHydrationRange[0]}–{blendAbsorption.recommendedHydrationRange[1]}%)
                </Text>
                <Text style={styles.proteinTag}>
                  {t('Białko')}: ~{blendAbsorption.estimatedProteinPercent}%
                </Text>
              </View>
              <Text style={styles.absorptionAdviceText}>
                💡 {blendAbsorption.doughFeelAdvicePl}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Starter */}
          <View style={styles.paramBlock}>
            <View style={styles.paramHeaderRow}>
              <View>
                <Text style={styles.label}>{t('Zakwas (Levain)')}</Text>
                <Text style={styles.sublabel}>Aktywny zaczyn o hydratacji {starterHydration}%</Text>
              </View>
              <Text style={styles.paramBigValue}>{starterPct.toFixed(1)}%</Text>
            </View>

            <View style={styles.stepperRow}>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setStarterPct((prev) => Math.max(5, Number((prev - 2).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>-2%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setStarterPct((prev) => Math.min(40, Number((prev + 2).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>+2%</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Salt */}
          <View style={styles.paramBlock}>
            <View style={styles.paramHeaderRow}>
              <View>
                <Text style={styles.label}>{t('Sól')}</Text>
                <Text style={styles.sublabel}>Kłodawska, morska lub niejodowana</Text>
              </View>
              <Text style={styles.paramBigValue}>{saltPct.toFixed(1)}%</Text>
            </View>

            <View style={styles.stepperRow}>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setSaltPct((prev) => Math.max(1.0, Number((prev - 0.2).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>-0.2%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => setSaltPct((prev) => Math.min(3.5, Number((prev + 0.2).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>+0.2%</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Big Scale Card: "Do miski na wagę" */}
        <View style={styles.scaleCard}>
          <View style={styles.scaleCardHeader}>
            <Text style={styles.scaleCardTitle}>⚖️ {t('Do miski na wagę')}</Text>
            <Text style={styles.scaleCardSubtitle}>
              Kolejność dodawania składników i dokładne gramatury
            </Text>
          </View>

          <View style={styles.scaleGrid}>
            {/* Flours */}
            <View style={styles.scaleItem}>
              <Text style={styles.scaleItemLabel}>🌾 Mąki łącznie</Text>
              <Text style={styles.scaleItemValue}>{calculations.baseFlourWeightGrams} g</Text>
              <Text style={styles.scaleItemSub}>
                {calculations.flours.map((f) => `${f.weightGrams}g`).join(' + ')}
              </Text>
            </View>

            {/* Water */}
            <View style={styles.scaleItem}>
              <Text style={styles.scaleItemLabel}>💧 Woda</Text>
              <Text style={styles.scaleItemValue}>{calculations.waterGrams} g</Text>
              <Text style={styles.scaleItemSub}>
                {ddtResult.waterTempTarget > 0 ? `DDT: ${ddtResult.waterTempTarget.toFixed(1)}°C` : 'Woda chłodna'}
              </Text>
            </View>

            {/* Sourdough */}
            <View style={styles.scaleItem}>
              <Text style={styles.scaleItemLabel}>🏺 Zakwas (Levain)</Text>
              <Text style={styles.scaleItemValue}>{calculations.starterGrams} g</Text>
              <Text style={styles.scaleItemSub}>
                {calculations.starterFlourGrams}g mąki + {calculations.starterWaterGrams}g wody
              </Text>
            </View>

            {/* Salt */}
            <View style={styles.scaleItem}>
              <Text style={styles.scaleItemLabel}>🧂 Sól</Text>
              <Text style={styles.scaleItemValue}>{calculations.saltGrams} g</Text>
              <Text style={styles.scaleItemSub}>2.0% mąki</Text>
            </View>
          </View>

          {/* Mass & Hydration Balance Footer */}
          <View style={styles.scaleFooter}>
            <View style={styles.scaleFooterCol}>
              <Text style={styles.scaleFooterLabel}>{t('Hydratacja całkowita')}</Text>
              <Text style={styles.scaleFooterHighlight}>
                {calculations.overallHydrationPercent.toFixed(1)}%
              </Text>
              <Text style={styles.scaleFooterCaption}>True Baker’s %</Text>
            </View>
            <View style={styles.scaleFooterDivider} />
            <View style={styles.scaleFooterCol}>
              <Text style={styles.scaleFooterLabel}>Masa surowego ciasta</Text>
              <Text style={styles.scaleFooterHighlight}>
                {calculations.targetDoughWeightGrams} g
              </Text>
              <Text style={styles.scaleFooterCaption}>
                {calcMode === 'loaves' ? `${loavesCount} bochenki po ~${bakedSingleLoafWeight}g` : `Chleb: ~${bakedTotalWeight}g`}
              </Text>
            </View>
          </View>
        </View>

        {/* DDT & Water Temp */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Docelowa temperatura ciasta (DDT)')}</Text>
          <Text style={styles.cardSubtitle}>
            4-składnikowa formuła Mathonsa z uwzględnieniem zakwasu
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Cel DDT</Text>
            <Text style={styles.valueHighlight}>{targetDdt.toFixed(1)}°C</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('Temperatura mąki')}</Text>
            <Text style={styles.labelSmall}>{flourTemp.toFixed(1)}°C</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('Temperatura otoczenia')}</Text>
            <Text style={styles.labelSmall}>{roomTemp.toFixed(1)}°C</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('Ciepło tarcia')}</Text>
            <Text style={styles.labelSmall}>{frictionFactor.toFixed(1)}°C (ręcznie)</Text>
          </View>

          <View style={styles.ddtResultBox}>
            <Text style={styles.ddtResultLabel}>{t('Wymagana temperatura wody')}</Text>
            <Text style={styles.ddtResultValue}>{ddtResult.waterTempTarget.toFixed(1)}°C</Text>

            {ddtResult.status === 'too_hot_danger' && (
              <View style={styles.alertDanger}>
                <Text style={styles.alertText}>{ddtResult.warningMessagePl}</Text>
              </View>
            )}

            {ddtResult.status === 'requires_ice' && iceResult && (
              <View style={styles.alertWarning}>
                <Text style={styles.alertText}>
                  Woda poniżej 4°C! Dodaj {iceResult.iceGrams} g lodu do {iceResult.waterGrams} g wody z kranu ({tapWaterTemp}°C).
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bake Loss & Crumb Moisture Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Strata wypiekowa i wilgotność miękiszu')}</Text>
          <Text style={styles.cardSubtitle}>
            {t('Typ wypieku i odparowanie')} (10% – 22%)
          </Text>

          {/* Preset Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {BAKE_LOSS_PRESETS.map((preset) => {
              const isSelected = selectedBakeLossPresetId === preset.id;
              return (
                <Pressable
                  key={preset.id}
                  testID={`bake-loss-preset-${preset.id}`}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => handleSelectBakeLossPreset(preset.id)}
                >
                  <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                    {t(preset.namePl)} ({preset.defaultLossPercent}%)
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Loss % Adjuster */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>{t('Strata piecowa')}</Text>
              <Text style={styles.sublabel}>
                {BAKE_LOSS_PRESETS.find((p) => p.id === selectedBakeLossPresetId)?.descriptionPl}
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <Pressable
                style={styles.stepBtn}
                testID="bake-loss-minus"
                onPress={() => setCustomBakeLossPercent((prev) => Math.max(5.0, Number((prev - 0.5).toFixed(1))))}
              >
                <Text style={styles.stepBtnText}>-0.5%</Text>
              </Pressable>
              <Text style={styles.valueHighlight} testID="bake-loss-percent-value">
                {customBakeLossPercent.toFixed(1)}%
              </Text>
              <Pressable
                style={styles.stepBtn}
                testID="bake-loss-plus"
                onPress={() => setCustomBakeLossPercent((prev) => Math.min(30.0, Number((prev + 0.5).toFixed(1))))}
              >
                <Text style={styles.stepBtnText}>+0.5%</Text>
              </Pressable>
            </View>
          </View>

          {/* Results Grid */}
          <View style={styles.bakeLossGrid}>
            <View style={styles.bakeLossMetricCol}>
              <Text style={styles.bakeLossMetricLabel}>{t('Upieczony bochenek')}</Text>
              <Text style={styles.bakeLossMetricValue} testID="bake-loss-baked-grams">
                {bakeLossMetrics.bakedWeightGrams} g
              </Text>
              <Text style={styles.bakeLossMetricSub}>
                {calcMode === 'loaves' && loavesCount > 1
                  ? `(${loavesCount}x ~${bakeLossMetrics.singleLoafBakedGrams} g)`
                  : `~${bakeLossMetrics.bakedWeightGrams} g`}
              </Text>
            </View>

            <View style={styles.bakeLossMetricDivider} />

            <View style={styles.bakeLossMetricCol}>
              <Text style={styles.bakeLossMetricLabel}>{t('Odparowana woda')}</Text>
              <Text style={styles.bakeLossMetricValue} testID="bake-loss-evaporated-grams">
                -{bakeLossMetrics.evaporatedWaterGrams} g
              </Text>
              <Text style={styles.bakeLossMetricSub}>para w piecu</Text>
            </View>

            <View style={styles.bakeLossMetricDivider} />

            <View style={styles.bakeLossMetricCol}>
              <Text style={styles.bakeLossMetricLabel}>{t('Szacowana wilgotność miękiszu')}</Text>
              <Text style={[styles.bakeLossMetricValue, { color: theme.colors.accentDark }]} testID="bake-loss-moisture-value">
                {bakeLossMetrics.retainedMoisturePercent}%
              </Text>
              <Text style={styles.bakeLossMetricSub}>retencja wody</Text>
            </View>
          </View>

          {/* Category & Cooling Advice */}
          <View style={styles.crumbMoistureBox}>
            <View style={styles.crumbMoistureHeader}>
              <Text style={styles.crumbMoistureTitle} testID="bake-loss-category-label">
                {bakeLossMetrics.crumbMoistureCategory === 'custardy_wet' && '💧 '}
                {bakeLossMetrics.crumbMoistureCategory === 'balanced' && '🥖 '}
                {bakeLossMetrics.crumbMoistureCategory === 'dry' && '🌾 '}
                {t(bakeLossMetrics.categoryLabelPl)}
              </Text>
            </View>
            <Text style={styles.crumbMoistureAdvice}>
              {bakeLossMetrics.coolingAdvicePl}
            </Text>
          </View>
        </View>

        {/* Action Buttons: Save Custom Recipe, Copy Recipe & Start Bake on Workbench */}
        <View style={styles.actionButtonsContainer}>
          <Pressable
            testID="copy-recipe-btn"
            style={styles.copyRecipeBtn}
            onPress={handleCopyRecipe}
          >
            <Text style={styles.copyRecipeBtnText}>📋 {t('Kopiuj recepturę')}</Text>
          </Pressable>

          <Pressable
            testID="save-custom-recipe-btn"
            style={styles.secondaryBtn}
            onPress={() => {
              setSaveRecipeNameInput(recipeName);
              setIsSaveModalOpen(true);
            }}
          >
            <Text style={styles.secondaryBtnText}>💾 {t('Zapisz jako mój przepis')}</Text>
          </Pressable>

          <Pressable
            testID="start-bake-btn"
            style={styles.primaryBtn}
            onPress={handleStartBakeOnWorkbench}
          >
            <Text style={styles.primaryBtnText}>🥖 {t('Rozpocznij wypiek na Stolnicy')}</Text>
          </Pressable>
        </View>

        {/* Modal: Save Recipe */}
        <Modal visible={isSaveModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('Zapisz przepis')}</Text>
              <Text style={styles.modalSubtitle}>
                Wprowadź unikalną nazwę dla tej proporcji składników
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder={t('Wpisz nazwę przepisu')}
                placeholderTextColor={theme.colors.textMuted}
                value={saveRecipeNameInput}
                onChangeText={setSaveRecipeNameInput}
                autoFocus
              />

              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setIsSaveModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
                </Pressable>
                <Pressable
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveCustomRecipe}
                >
                  <Text style={styles.modalConfirmBtnText}>{t('Zapisz')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Settings & Backup Modal */}
        <SettingsModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  presetChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  presetChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customChipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteChipBtn: {
    marginLeft: -12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteChipText: {
    fontSize: 10,
    color: theme.colors.statusDanger,
    fontWeight: '700',
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  modeTabActive: {
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  modeTabTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sublabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  labelSmall: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  valueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  smallChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  smallChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  smallChipTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  numberInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    width: 65,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 6,
  },
  blendScroll: {
    marginBottom: 10,
  },
  blendPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  blendPresetText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  flourItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '60',
  },
  flourItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  flourItemPct: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  flourItemGrams: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  paramBlock: {
    paddingVertical: 6,
  },
  paramHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paramBigValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginTop: 4,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paramTip: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  paramStepBtn: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paramStepText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scaleCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.accentLight,
    marginBottom: theme.spacing.md,
  },
  scaleCardHeader: {
    marginBottom: 12,
  },
  scaleCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  scaleCardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scaleItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  scaleItemValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  scaleItemSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scaleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  scaleFooterCol: {
    alignItems: 'center',
    flex: 1,
  },
  scaleFooterDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  scaleFooterLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  scaleFooterHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  scaleFooterCaption: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  ddtResultBox: {
    marginTop: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  ddtResultLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  ddtResultValue: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.accent,
    marginVertical: 4,
  },
  alertDanger: {
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  alertWarning: {
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.statusWarning,
  },
  alertText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.accentDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bakeLossGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bakeLossMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  bakeLossMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  bakeLossMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  bakeLossMetricSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bakeLossMetricDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  crumbMoistureBox: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginTop: 4,
  },
  crumbMoistureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  crumbMoistureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  crumbMoistureAdvice: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  settingsHeaderBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingsHeaderBtnText: {
    fontSize: 20,
  },
  copyRecipeBtn: {
    minHeight: 44,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
  },
  copyRecipeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  absorptionBadge: {
    marginTop: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  absorptionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  absorptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  proteinTag: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.accentDark,
  },
  absorptionAdviceText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
});
