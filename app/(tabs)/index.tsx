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
import { confirm, confirmDeleteRecipe } from '../../src/lib/confirm';
import * as Clipboard from 'expo-clipboard';
import { SettingsModal } from '../../src/components/SettingsModal';
import { FlourBlendModal } from '../../src/components/FlourBlendModal';
import { CostCalculatorModal } from '../../src/components/CostCalculatorModal';
import { FlourInventoryModal } from '../../src/components/FlourInventoryModal';
import { ImportRecipeModal } from '../../src/components/ImportRecipeModal';
import { FlourEquivalentsModal } from '../../src/components/FlourEquivalentsModal';
import { VolumeConverterModal } from '../../src/components/VolumeConverterModal';
import { ShareRecipeQrModal } from '../../src/components/ShareRecipeQrModal';
import { QrScannerModal } from '../../src/components/QrScannerModal';
import { formatRecipeText, copyRecipeToClipboard } from '../../src/lib/recipe-formatter';
import { exportRecipeToJson } from '../../src/lib/recipe-sharing';
import {
  useUnitSystem,
  formatTemperature,
  formatWeight,
  formatDoseWeight,
} from '../../src/lib/unit-converter';
import { exportRecipeSheetAsPdf } from '../../src/lib/pdf-sheet-generator';
import {
  getPendingRecipeToLoad,
  clearPendingRecipeToLoad,
  subscribePendingRecipe,
  PendingRecipeToLoad,
} from '../../src/lib/recipe-navigation';
import {
  calculatePrefermentBreakdown,
  PREFERMENT_DEFINITIONS,
  PrefermentType,
} from '../../src/core/preferments';
import { useAppAccess } from '../../src/lib/app-access';
import { PaywallModal } from '../../src/components/PaywallModal';
import { DoMiskiScaleCard } from '../../src/components/calculator/DoMiskiScaleCard';
import { ArtisanAccordionPro } from '../../src/components/calculator/ArtisanAccordionPro';

type CalculationMode = 'loaves' | 'flour';

export default function CalculatorScreen() {
  const router = useRouter();

  // Apps4Brew Monetization & Access (Cheaper than espresso)
  const {
    access,
    isPaywallVisible,
    setPaywallVisible,
    requireActionAccess,
    subscribe,
    restorePurchases,
  } = useAppAccess();

  // Progressive Disclosure: Artisan Accordion State
  const [isArtisanAccordionOpen, setIsArtisanAccordionOpen] = useState<boolean>(false);

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
  const [isBlendModalOpen, setIsBlendModalOpen] = useState<boolean>(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isShareQrOpen, setIsShareQrOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [importInitialInput, setImportInitialInput] = useState<string>('');
  const [isEquivModalOpen, setIsEquivModalOpen] = useState<boolean>(false);
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState<boolean>(false);
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<
    'all' | 'sourdough' | 'rye' | 'yeast' | 'pizza_sweet'
  >('all');

  const unitSystem = useUnitSystem();

  const handlePrintRecipePdf = async () => {
    try {
      await exportRecipeSheetAsPdf({
        recipeName,
        totalFlourGrams: calculations.totalFlourGrams,
        overallHydrationPercent: calculations.overallHydrationPercent,
        flours: calculations.flours,
        waterGrams: calculations.waterGrams,
        starterGrams: calculations.starterGrams,
        starterHydration,
        saltGrams: calculations.saltGrams,
        saltPercent: saltPct,
        targetDDT: targetDdt,
        waterTempTarget: ddtResult.waterTempTarget,
        ambientTemp: roomTemp,
        targetDoughWeightGrams: calculations.targetDoughWeightGrams,
        loavesCount: calcMode === 'loaves' ? loavesCount : 1,
        bakedSingleLoafWeight,
        notes: MASTER_RECIPES.find((r) => r.id === selectedPresetId)?.notesPl,
      });
    } catch {
      Alert.alert(t('Karta receptury'), t('Nie udało się wygenerować pliku PDF'));
    }
  };

  // Artisan Preferments state
  const [prefermentType, setPrefermentType] = useState<PrefermentType>('direct');
  const [prefermentFlourPct, setPrefermentFlourPct] = useState<number>(20.0);

  const loadRecipesFromStore = useCallback(async () => {
    const all = await getRecipes();
    setCustomRecipes(all.filter((r) => !r.isBuiltIn));
  }, []);

  useEffect(() => {
    loadRecipesFromStore();

    const applyPending = (pending: PendingRecipeToLoad) => {
      if (pending.id) setSelectedPresetId(pending.id);
      setRecipeName(pending.name);
      setFlourBlend(pending.formula.flours);
      setWaterPct(pending.formula.waterPercentage);
      setStarterPct(pending.formula.starterPercentage);
      setSaltPct(pending.formula.saltPercentage);
      if (pending.formula.starterHydration !== undefined) {
        setStarterHydration(pending.formula.starterHydration);
      }
      if (pending.targetDDT !== undefined) {
        setTargetDdt(pending.targetDDT);
      }
      if (pending.formula.targetDoughWeightGrams !== undefined) {
        setCalcMode('loaves');
        setLoavesCount(1);
        setLoafWeightGrams(pending.formula.targetDoughWeightGrams);
      }
    };

    const initialPending = getPendingRecipeToLoad();
    if (initialPending) {
      applyPending(initialPending);
      clearPendingRecipeToLoad();
    }

    const unsubscribe = subscribePendingRecipe((pending) => {
      applyPending(pending);
      clearPendingRecipeToLoad();
    });

    return unsubscribe;
  }, [loadRecipesFromStore]);

  const filteredMasterRecipes = useMemo(() => {
    if (masterCategoryFilter === 'all') return MASTER_RECIPES;
    if (masterCategoryFilter === 'pizza_sweet') {
      return MASTER_RECIPES.filter((p) => p.category === 'pizza' || p.category === 'sweet');
    }
    return MASTER_RECIPES.filter((p) => p.category === masterCategoryFilter);
  }, [masterCategoryFilter]);

  const currentMasterPreset = useMemo(() => {
    return MASTER_RECIPES.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  const handleExportRecipeJson = async () => {
    const payload = {
      id: selectedPresetId,
      name: recipeName,
      targetDDT: targetDdt,
      formula: {
        flours: flourBlend,
        waterPercentage: waterPct,
        saltPercentage: saltPct,
        starterPercentage: starterPct,
        starterHydration,
        targetDoughWeightGrams,
      },
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    const json = exportRecipeToJson(payload as any);
    await Clipboard.setStringAsync(json);
    Alert.alert(t('Eksport JSON'), t('Skopiowano kod JSON receptury do schowka.'));
  };

  const handleImportSuccess = (imported: StoredRecipe) => {
    requireActionAccess(() => {
      setSelectedPresetId(imported.id);
      setRecipeName(imported.name);
      setFlourBlend(imported.formula.flours);
      setWaterPct(imported.formula.waterPercentage);
      setStarterPct(imported.formula.starterPercentage);
      setSaltPct(imported.formula.saltPercentage);
      setStarterHydration(imported.formula.starterHydration ?? 100.0);
      setTargetDdt(imported.targetDDT);
      loadRecipesFromStore();
    });
  };

  const handleScanRecipe = (scannedData: string) => {
    setImportInitialInput(scannedData);
    setIsScannerOpen(false);
    setIsImportModalOpen(true);
  };

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
    requireActionAccess(() => {
      confirmDeleteRecipe(recipe.name, async () => {
        await deleteRecipe(recipe.id);
        if (selectedPresetId === recipe.id) {
          handleSelectMasterPreset(MASTER_RECIPES[0].id);
        }
        await loadRecipesFromStore();
      });
    });
  };

  // Clone Recipe as Custom
  const handleCloneAsCustomRecipe = async () => {
    requireActionAccess(async () => {
      const cloneName = `${recipeName} (${t('Kopia')})`;
      const cloned: StoredRecipe = {
        id: `recipe_${Date.now()}`,
        name: cloneName,
        formula: {
          flours: [...flourBlend],
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

      await saveRecipe(cloned);
      await loadRecipesFromStore();
      setSelectedPresetId(cloned.id);
      setRecipeName(cloned.name);
      Alert.alert(t('Sklonowano przepis'), t('Utworzono edytowalną kopię w Twojej bibliotece.'));
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

  const currentRecipeForShare = useMemo(() => {
    return {
      id: selectedPresetId,
      name: recipeName,
      targetDDT: targetDdt,
      formula: {
        flours: flourBlend,
        waterPercentage: waterPct,
        saltPercentage: saltPct,
        starterPercentage: starterPct,
        starterHydration,
        targetDoughWeightGrams,
      },
      isBuiltIn: false,
      createdAt: Date.now(),
    };
  }, [
    selectedPresetId,
    recipeName,
    targetDdt,
    flourBlend,
    waterPct,
    saltPct,
    starterPct,
    starterHydration,
    targetDoughWeightGrams,
  ]);

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

  const prefermentBreakdown = useMemo(() => {
    if (prefermentType === 'direct') return null;
    return calculatePrefermentBreakdown({
      prefermentType,
      prefermentFlourPercentage: prefermentFlourPct,
      totalFlourGrams: calculations.totalFlourGrams,
      totalTargetHydration: calculations.overallHydrationPercent,
      saltPercentage: saltPct,
      customPrefermentHydration: prefermentType === 'levain' ? starterHydration : undefined,
    });
  }, [
    prefermentType,
    prefermentFlourPct,
    calculations.totalFlourGrams,
    calculations.overallHydrationPercent,
    saltPct,
    starterHydration,
  ]);

  // Save Custom Recipe Handler
  const handleSaveCustomRecipe = async () => {
    requireActionAccess(async () => {
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
    });
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
    requireActionAccess(() => {
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
    });
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

        {/* Progressive Disclosure Level 1: 1-Tap Scale Card (< 30s to bowl) */}
        <DoMiskiScaleCard
          calculations={calculations}
          recipeName={recipeName}
          loavesCount={calcMode === 'loaves' ? loavesCount : 1}
          onLoavesChange={(count) => {
            setCalcMode('loaves');
            setLoavesCount(count);
          }}
          presets={MASTER_RECIPES.map((r) => ({ id: r.id, name: r.namePl }))}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectMasterPreset}
          onStartBake={handleStartBakeOnWorkbench}
          calcMode={calcMode}
          onCalcModeChange={setCalcMode}
          flourGrams={flourGrams}
          onFlourGramsChange={setFlourGrams}
          loafWeightGrams={loafWeightGrams}
          onLoafWeightGramsChange={setLoafWeightGrams}
        />

        {/* Progressive Disclosure Level 2: Artisan Collapsible Drawer */}
        <ArtisanAccordionPro
          isOpen={isArtisanAccordionOpen}
          onToggle={() => setIsArtisanAccordionOpen((prev) => !prev)}
          targetDdt={targetDdt}
          onTargetDdtChange={setTargetDdt}
          waterTempTarget={ddtResult.waterTempTarget}
          iceGrams={iceResult?.iceGrams}
          ambientTemp={roomTemp}
          flourTemp={flourTemp}
          frictionFactor={frictionFactor}
          flourBlend={flourBlend}
          onOpenBlendModal={() => setIsBlendModalOpen(true)}
          onSelectFlourBlend={handleSelectFlourBlend}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenEquivalents={() => setIsEquivModalOpen(true)}
          waterPct={waterPct}
          onWaterPctChange={setWaterPct}
          hydrationDifficulty={hydrationDifficulty}
          blendAbsorption={blendAbsorption}
          prefermentType={prefermentType}
          onPrefermentTypeChange={setPrefermentType}
          prefermentFlourPct={prefermentFlourPct}
          onPrefermentFlourPctChange={setPrefermentFlourPct}
          prefermentBreakdown={prefermentBreakdown}
          bakeLossPercent={customBakeLossPercent}
          onBakeLossPercentChange={setCustomBakeLossPercent}
          bakedTotalWeightGrams={bakedTotalWeight}
          bakeLossMetrics={bakeLossMetrics}
          selectedBakeLossPresetId={selectedBakeLossPresetId}
          onSelectBakeLossPreset={handleSelectBakeLossPreset}
        />

        {/* Master & Custom Recipes Selector */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{t('Receptury mistrzowskie')}</Text>
          <View style={styles.headerPillsRow}>
            <Pressable
              testID="open-volume-converter-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Przelicznik objętości')}
              style={styles.headerActionPill}
              onPress={() => setIsVolumeModalOpen(true)}
            >
              <Text style={styles.headerActionPillText}>⚖️ {t('Przelicznik objętości')}</Text>
            </Pressable>
            <Pressable
              testID="open-import-recipe-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Importuj JSON')}
              style={styles.headerActionPill}
              onPress={() => setIsImportModalOpen(true)}
            >
              <Text style={styles.headerActionPillText}>📥 {t('Importuj JSON')}</Text>
            </Pressable>
            <Pressable
              testID="open-scan-qr-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Skanuj QR')}
              style={styles.headerActionPill}
              onPress={() => setIsScannerOpen(true)}
            >
              <Text style={styles.headerActionPillText}>📷 {t('Skanuj QR')}</Text>
            </Pressable>
            <Pressable
              testID="header-print-pdf-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Drukuj PDF')}
              style={styles.headerActionPill}
              onPress={handlePrintRecipePdf}
            >
              <Text style={styles.headerActionPillText}>🖨️ {t('Drukuj PDF')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Master Recipes Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterScroll}>
          <Pressable
            testID="category-filter-all"
            onPress={() => setMasterCategoryFilter('all')}
            style={[styles.categoryFilterChip, masterCategoryFilter === 'all' && styles.categoryFilterChipActive]}
          >
            <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'all' && styles.categoryFilterChipTextActive]}>
              {t('Wszystkie')} ({MASTER_RECIPES.length})
            </Text>
          </Pressable>
          <Pressable
            testID="category-filter-sourdough"
            onPress={() => setMasterCategoryFilter('sourdough')}
            style={[styles.categoryFilterChip, masterCategoryFilter === 'sourdough' && styles.categoryFilterChipActive]}
          >
            <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'sourdough' && styles.categoryFilterChipTextActive]}>
              🌾 {t('Na zakwasie')}
            </Text>
          </Pressable>
          <Pressable
            testID="category-filter-rye"
            onPress={() => setMasterCategoryFilter('rye')}
            style={[styles.categoryFilterChip, masterCategoryFilter === 'rye' && styles.categoryFilterChipActive]}
          >
            <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'rye' && styles.categoryFilterChipTextActive]}>
              🍞 {t('Żytnie')}
            </Text>
          </Pressable>
          <Pressable
            testID="category-filter-yeast"
            onPress={() => setMasterCategoryFilter('yeast')}
            style={[styles.categoryFilterChip, masterCategoryFilter === 'yeast' && styles.categoryFilterChipActive]}
          >
            <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'yeast' && styles.categoryFilterChipTextActive]}>
              🥖 {t('Drożdżowe')}
            </Text>
          </Pressable>
          <Pressable
            testID="category-filter-pizza-sweet"
            onPress={() => setMasterCategoryFilter('pizza_sweet')}
            style={[styles.categoryFilterChip, masterCategoryFilter === 'pizza_sweet' && styles.categoryFilterChipActive]}
          >
            <Text style={[styles.categoryFilterChipText, masterCategoryFilter === 'pizza_sweet' && styles.categoryFilterChipTextActive]}>
              🍕 {t('Pizza i słodkie')}
            </Text>
          </Pressable>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {filteredMasterRecipes.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <Pressable
                key={preset.id}
                testID={`preset-chip-${preset.id}`}
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

        {/* Master Recipe Details Card */}
        {currentMasterPreset && (
          <View style={styles.masterRecipeInfoCard} testID="master-recipe-info-card">
            <View style={styles.masterInfoPillsRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {currentMasterPreset.category === 'sourdough' && `🌾 ${t('Na zakwasie')}`}
                  {currentMasterPreset.category === 'rye' && `🍞 ${t('Żytni')}`}
                  {currentMasterPreset.category === 'yeast' && `🥖 ${t('Drożdżowy')}`}
                  {currentMasterPreset.category === 'pizza' && `🍕 ${t('Pizza')}`}
                  {currentMasterPreset.category === 'sweet' && `🥐 ${t('Słodkie')}`}
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
                  {currentMasterPreset.difficulty === 'easy' && `🟢 ${t('Łatwy')}`}
                  {currentMasterPreset.difficulty === 'medium' && `🟡 ${t('Średni')}`}
                  {currentMasterPreset.difficulty === 'hard' && `🟠 ${t('Wymagający')}`}
                  {currentMasterPreset.difficulty === 'artisan' && `🔴 ${t('Mistrzowski')}`}
                </Text>
              </View>
            </View>

            <Text style={styles.masterDescriptionText}>{currentMasterPreset.descriptionPl}</Text>

            <View style={styles.masterTechniqueBox}>
              <Text style={styles.masterTechniqueItem}>
                ♨️ <Text style={styles.boldText}>{t('Pieczenie')}:</Text>{' '}
                {currentMasterPreset.bakeTempSteamC}°C (
                {currentMasterPreset.bakeTimeSteamMinutes}m {t('para')} +{' '}
                {currentMasterPreset.bakeTimeBrowningMinutes}m w {currentMasterPreset.bakeTempBrowningC}°C)
              </Text>
              <Text style={styles.masterTechniqueItem}>
                🥖 <Text style={styles.boldText}>{t('Naczynie')}:</Text>{' '}
                {currentMasterPreset.recommendedVessel === 'dutch_oven'
                  ? 'garnek żeliwny'
                  : currentMasterPreset.recommendedVessel === 'bread_pan'
                  ? 'foremka keksówka'
                  : currentMasterPreset.recommendedVessel === 'baking_steel'
                  ? 'stal piekarska'
                  : 'blacha piekarnika'}
              </Text>
              {currentMasterPreset.notesPl ? (
                <Text style={styles.masterTechniqueItem}>
                  📝 <Text style={styles.boldText}>{t('Wskazówki')}:</Text> {currentMasterPreset.notesPl}
                </Text>
              ) : null}
            </View>
          </View>
        )}

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
            testID="clone-recipe-btn"
            style={styles.cloneRecipeBtn}
            onPress={handleCloneAsCustomRecipe}
          >
            <Text style={styles.cloneRecipeBtnText}>✨ {t('Klonuj recepturę')}</Text>
          </Pressable>

          <Pressable
            testID="export-recipe-json-btn"
            style={styles.cloneRecipeBtn}
            onPress={handleExportRecipeJson}
          >
            <Text style={styles.cloneRecipeBtnText}>📦 {t('Eksportuj JSON')}</Text>
          </Pressable>

          <Pressable
            testID="share-recipe-qr-btn"
            style={styles.cloneRecipeBtn}
            onPress={() => setIsShareQrOpen(true)}
          >
            <Text style={styles.cloneRecipeBtnText}>🏁 {t('Udostępnij kod QR')}</Text>
          </Pressable>

          <Pressable
            testID="print-recipe-pdf-btn"
            style={styles.cloneRecipeBtn}
            onPress={handlePrintRecipePdf}
          >
            <Text style={styles.cloneRecipeBtnText}>🖨️ {t('Drukuj kartę A4 (PDF)')}</Text>
          </Pressable>

          <Pressable
            testID="import-recipe-json-btn"
            style={styles.cloneRecipeBtn}
            onPress={() => setIsImportModalOpen(true)}
          >
            <Text style={styles.cloneRecipeBtnText}>📥 {t('Importuj JSON')}</Text>
          </Pressable>

          <Pressable
            testID="open-cost-modal-btn"
            style={styles.cloneRecipeBtn}
            onPress={() => setIsCostModalOpen(true)}
          >
            <Text style={styles.cloneRecipeBtnText}>💰 {t('Kalkulator kosztów')}</Text>
          </Pressable>

          <Pressable
            testID="open-flour-inventory-btn"
            style={styles.cloneRecipeBtn}
            onPress={() => setIsInventoryOpen(true)}
          >
            <Text style={styles.cloneRecipeBtnText}>🌾 {t('Spiżarnia mąk & Stan zapasów')}</Text>
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

        {/* Modal: Custom Flour Blend Builder */}
        <FlourBlendModal
          visible={isBlendModalOpen}
          initialBlend={flourBlend}
          onApply={(newBlend) => {
            setFlourBlend(newBlend);
          }}
          onClose={() => setIsBlendModalOpen(false)}
        />

        {/* Modal: Cost & Yield Batch Calculator */}
        <CostCalculatorModal
          visible={isCostModalOpen}
          onClose={() => setIsCostModalOpen(false)}
          totalFlourGrams={calculations.baseFlourWeightGrams}
          totalWaterGrams={calculations.waterGrams}
          totalSaltGrams={calculations.saltGrams}
          loavesCount={calcMode === 'loaves' ? loavesCount : 1}
          bakedLoafWeightGrams={bakedSingleLoafWeight}
        />

        {/* Modal: Flour Inventory (Magazyn Mąk) */}
        <FlourInventoryModal
          visible={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          recipeFlours={calculations.flours}
        />

        {/* Modal: Import Recipe JSON / QR Link */}
        <ImportRecipeModal
          visible={isImportModalOpen}
          initialInput={importInitialInput}
          onClose={() => {
            setIsImportModalOpen(false);
            setImportInitialInput('');
          }}
          onImportSuccess={handleImportSuccess}
        />

        {/* Modal: Share Recipe via Vector QR Code & Deep Link */}
        <ShareRecipeQrModal
          visible={isShareQrOpen}
          recipe={currentRecipeForShare as any}
          onClose={() => setIsShareQrOpen(false)}
        />

        {/* Modal: Scan Recipe QR Code with Camera */}
        <QrScannerModal
          visible={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanRecipe={handleScanRecipe}
        />

        {/* Modal: Flour Equivalents Dictionary (Z-052) */}
        <FlourEquivalentsModal
          visible={isEquivModalOpen}
          onClose={() => setIsEquivModalOpen(false)}
        />

        {/* Modal: Volume to Weight Converter (Z-013) */}
        <VolumeConverterModal
          visible={isVolumeModalOpen}
          onClose={() => setIsVolumeModalOpen(false)}
        />

        {/* Apps4Brew Pass Paywall Modal ($0.99 / $4.99 / $14.99) */}
        <PaywallModal
          visible={isPaywallVisible}
          onClose={() => setPaywallVisible(false)}
          onSubscribe={subscribe}
          onRestore={restorePurchases}
          trialDaysRemaining={access.trialDaysRemaining}
          completedBakesCount={access.completedBakesCount}
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
  cloneRecipeBtn: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cloneRecipeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  prefermentDetailsBlock: {
    marginTop: 12,
    backgroundColor: theme.colors.surfaceCard,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prefermentGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  prefermentCol: {
    flex: 1,
  },
  prefermentColHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  prefermentItemText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  prefermentTipText: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  customBlendBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  customBlendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  flourInventoryBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  flourInventoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  headerPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionPill: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerActionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  categoryFilterScroll: {
    marginBottom: 8,
  },
  categoryFilterChip: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryFilterChipActive: {
    backgroundColor: theme.colors.crustGold,
    borderColor: theme.colors.crustGold,
  },
  categoryFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  masterRecipeInfoCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: 8,
    marginBottom: 12,
  },
  masterInfoPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  difficultyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyEasy: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  difficultyMedium: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  difficultyHard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  difficultyArtisan: {
    backgroundColor: '#FBE9E7',
    borderColor: '#FFAB91',
  },
  difficultyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  masterDescriptionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  masterTechniqueBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 10,
    gap: 5,
  },
  masterTechniqueItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
