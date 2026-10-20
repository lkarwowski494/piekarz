import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CraftHeader,
  sharedCraftTokens,
} from '@apps4craft/ui';
import { t } from '../../src/lib/i18n';
import { guardSave } from '../../src/lib/save-guard';
import {
  BAKE_LOSS_PRESETS,
  BakeTypePresetId,
  POPULAR_FLOUR_BLENDS,
  FlourItemInput,
} from '../../src/core/domain-rules';
import { MASTER_RECIPES, filterMasterRecipes, ritualCategoryFilter } from '../../src/recipes/presets';
import {
  getRecipes,
  deleteRecipe,
  setActiveBake,
  hasCompletedOnboarding,
  getBakerRitualProfile,
} from '../../src/data/sqlite-store';
import { StoredRecipe } from '../../src/data/db';
import { confirmDeleteRecipe } from '../../src/lib/confirm';
import type { PendingRecipeToLoad } from '../../src/lib/recipe-navigation';
import { usePendingRecipeLoader } from '../../src/hooks/usePendingRecipeLoader';
import { PrefermentType } from '../../src/core/preferments';
import { useAppAccess } from '../../src/lib/app-access';
import { BlokadaFunkcji } from '../../src/components/BlokadaFunkcji';
import { DoMiskiScaleCard } from '../../src/components/calculator/DoMiskiScaleCard';
import { ArtisanAccordionPro } from '../../src/components/calculator/ArtisanAccordionPro';
import { SaveRecipeModal } from '../../src/components/calculator/SaveRecipeModal';
import { CalculatorActionButtons } from '../../src/components/calculator/CalculatorActionButtons';
import { FormulaPresetSelector, CategoryFilterType } from '../../src/components/calculator/FormulaPresetSelector';
import { CalculatorModalsProvider } from '../../src/components/calculator/CalculatorModalsProvider';
import { useUnitSystem } from '../../src/lib/unit-converter';
import { CalculatorSacredCard } from '../../src/components/calculator/CalculatorSacredCard';
import { useRecipeCalculations } from '../../src/hooks/useRecipeCalculations';
import {
  executePrintRecipePdf,
  executeExportRecipeJson,
  executeCopyRecipe,
  executeCloneRecipe,
  executeSaveCustomRecipe,
} from '../../src/lib/calculator-actions';
import { openPrintMenu } from '../../src/lib/print-menu';
import { CorruptStateRecoveryBanner } from '../../src/components/CorruptStateRecoveryBanner';
import { styles } from '../../src/components/calculator/calculator-screen.styles';

type CalculationMode = 'loaves' | 'flour';

export default function CalculatorScreen() {
  const router = useRouter();

  // Jeden strażnik dostępu; bez uprawnienia tylko odczyt, eksport i usunięcie (027)
  const { chron, blokada, moze, requireActionAccess } = useAppAccess();

  const [isArtisanAccordionOpen, setIsArtisanAccordionOpen] = useState<boolean>(false);

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
  const [yeastPct, setYeastPct] = useState<number>(0); // drożdże z receptury [M1-audytor-generalny-092]
  const [starterHydration, setStarterHydration] = useState<number>(100.0);

  // DDT parameters
  const [targetDdt, setTargetDdt] = useState<number>(25.0);
  const [flourTemp] = useState<number>(21.0);
  const [roomTemp] = useState<number>(22.0);
  const [starterTemp] = useState<number>(21.0);
  const [frictionFactor] = useState<number>(2.0);
  const [tapWaterTemp] = useState<number>(16.0);

  // Bake Loss & Crumb Moisture state
  const [selectedBakeLossPresetId, setSelectedBakeLossPresetId] = useState<BakeTypePresetId>('batard_boule');
  const [customBakeLossPercent, setCustomBakeLossPercent] = useState<number>(14.0);

  // Custom recipes & Settings state
  const [customRecipes, setCustomRecipes] = useState<StoredRecipe[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveRecipeNameInput, setSaveRecipeNameInput] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBlendModalOpen, setIsBlendModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isShareQrOpen, setIsShareQrOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [importInitialInput, setImportInitialInput] = useState<string>('');
  const [isEquivModalOpen, setIsEquivModalOpen] = useState<boolean>(false);
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState<boolean>(false);
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<CategoryFilterType>('all');

  // Artisan Preferments state
  const [prefermentType, setPrefermentType] = useState<PrefermentType>('direct');
  const [prefermentFlourPct, setPrefermentFlourPct] = useState<number>(20.0);

  const unitSystem = useUnitSystem();

  // Unified recipe setter
  const applyFormula = useCallback((id: string, name: string, formula: any, ddt?: number) => {
    setSelectedPresetId(id);
    setRecipeName(name);
    setFlourBlend(formula.flours);
    setWaterPct(formula.waterPercentage);
    setStarterPct(formula.starterPercentage);
    setSaltPct(formula.saltPercentage);
    setYeastPct(formula.extraYeastPercentage ?? 0);
    setStarterHydration(formula.starterHydration ?? 100.0);
    if (ddt !== undefined) setTargetDdt(ddt);
  }, []);

  // Derived Calculations Hook
  const {
    targetDoughWeightGrams,
    calculations,
    currentRecipeForShare,
    ddtResult,
    iceResult,
    bakeLossMetrics,
    bakedTotalWeight,
    bakedSingleLoafWeight,
    hydrationDifficulty,
    blendAbsorption,
    prefermentBreakdown,
  } = useRecipeCalculations({
    calcMode,
    loavesCount,
    loafWeightGrams,
    flourGrams,
    flourBlend,
    waterPct,
    starterPct,
    saltPct,
    extraYeastPct: yeastPct,
    starterHydration,
    targetDdt,
    flourTemp,
    roomTemp,
    starterTemp,
    frictionFactor,
    tapWaterTemp,
    customBakeLossPercent,
    prefermentType,
    prefermentFlourPct,
    selectedPresetId,
    recipeName,
  });

  const handlePrintRecipePdf = async () => {
    await executePrintRecipePdf({
      recipeName,
      calculations,
      starterHydration,
      saltPct,
      targetDdt,
      waterTempTarget: ddtResult.waterTempTarget,
      roomTemp,
      loavesCount: calcMode === 'loaves' ? loavesCount : 1,
      bakedSingleLoafWeight,
      selectedPresetId,
    });
  };

  const loadRecipesFromStore = useCallback(async () => {
    const all = await getRecipes();
    setCustomRecipes(all.filter((r) => !r.isBuiltIn));
  }, []);

  usePendingRecipeLoader((pending: PendingRecipeToLoad) => {
    applyFormula(pending.id ?? selectedPresetId, pending.name, pending.formula, pending.targetDDT);
    if (pending.formula.targetDoughWeightGrams !== undefined) {
      setCalcMode('loaves');
      setLoavesCount(1);
      setLoafWeightGrams(pending.formula.targetDoughWeightGrams);
    }
  }, loadRecipesFromStore, [loadRecipesFromStore, applyFormula, selectedPresetId]);

  useEffect(() => {
    void hasCompletedOnboarding().then((completed) => {
      if (!completed) setIsOnboardingOpen(true);
    });
    void getBakerRitualProfile().then(applyRitual);
  }, []);

  // Rytuał ustawia widoczny filtr kategorii, nie ukrywa receptur (F-26, ZM-14) [M1-audytor-generalny-032]
  function applyRitual(p: string) {
    setMasterCategoryFilter(ritualCategoryFilter(p));
  }
  const filteredMasterRecipes = useMemo(() => filterMasterRecipes(masterCategoryFilter), [masterCategoryFilter]);

  const currentMasterPreset = useMemo(() => {
    return MASTER_RECIPES.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  // Import działa zawsze (D-039): bez uprawnienia receptura trafia na listę, bez ekranu zakupu [M1-audytor-generalny-026]
  const handleImportSuccess = (imported: StoredRecipe) => {
    if (moze('kalkulator')) applyFormula(imported.id, imported.name, imported.formula, imported.targetDDT);
    loadRecipesFromStore();
  };

  const handleScanRecipe = (scannedData: string) => {
    setIsScannerOpen(false);
    setImportInitialInput(scannedData);
    setIsImportModalOpen(true);
  };

  const handleSelectMasterPreset = (presetId: string) => {
    const preset = MASTER_RECIPES.find((p) => p.id === presetId);
    if (preset) applyFormula(preset.id, preset.namePl, preset.formula, preset.targetDDT);
  };

  const handleSelectCustomRecipe = (recipe: StoredRecipe) => {
    applyFormula(recipe.id, recipe.name, recipe.formula, recipe.targetDDT);
  };

  // Usuwanie własnych danych nie wymaga zakupu (DEC-48) [M1-audytor-generalny-007]
  const handleDeleteCustomRecipe = (recipe: StoredRecipe) => {
    confirmDeleteRecipe(recipe.name, guardSave(async () => {
      await deleteRecipe(recipe.id);
      if (selectedPresetId === recipe.id) {
        handleSelectMasterPreset(MASTER_RECIPES[0].id);
      }
      await loadRecipesFromStore();
    }));
  };

  const handleCloneAsCustomRecipe = async () => {
    requireActionAccess(guardSave(async () => {
      const cloned = await executeCloneRecipe(
        recipeName,
        flourBlend,
        waterPct,
        saltPct,
        starterPct,
        starterHydration,
        targetDoughWeightGrams,
        targetDdt
      );
      await loadRecipesFromStore();
      setSelectedPresetId(cloned.id);
      setRecipeName(cloned.name);
    }));
  };

  const handleSelectFlourBlend = (blend: typeof POPULAR_FLOUR_BLENDS[number]) => {
    setFlourBlend(blend.flours);
  };

  const handleSelectBakeLossPreset = (presetId: BakeTypePresetId) => {
    setSelectedBakeLossPresetId(presetId);
    const p = BAKE_LOSS_PRESETS.find((item) => item.id === presetId);
    if (p) setCustomBakeLossPercent(p.defaultLossPercent);
  };

  const handleSaveCustomRecipe = async () => {
    requireActionAccess(guardSave(async () => {
      const saved = await executeSaveCustomRecipe(
        saveRecipeNameInput,
        flourBlend,
        waterPct,
        saltPct,
        starterPct,
        starterHydration,
        targetDoughWeightGrams,
        targetDdt
      );
      if (saved) {
        await loadRecipesFromStore();
        setSelectedPresetId(saved.id);
        setRecipeName(saved.name);
        setIsSaveModalOpen(false);
        setSaveRecipeNameInput('');
      }
    }));
  };

  const handleStartBakeOnWorkbench = () => {
    requireActionAccess(() => {
      setActiveBake({
        id: `bake_${Date.now()}`,
        recipeName,
        startedAt: Date.now(),
        currentStageId: 'step_1',
        ambientTempC: roomTemp,
        calculatedRecipe: calculations,
        recipeFormula: {
          flours: flourBlend,
          waterPercentage: waterPct,
          saltPercentage: saltPct,
          starterPercentage: starterPct,
          extraYeastPercentage: yeastPct,
          starterHydration,
          targetDoughWeightGrams,
        },
      });

      router.push('/(tabs)/stolnica');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* CraftHeader */}
        <CraftHeader
          title={t('Kalkulator')}
          subtitle={t('True Baker’s % & DDT')}
          testID="calculator-header"
          rightAction={
            <Pressable
              testID="open-settings-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Ustawienia')}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              style={styles.settingsHeaderBtn}
              onPress={() => setIsSettingsOpen(true)}
            >
              <Text style={styles.settingsHeaderBtnText}>⚙️</Text>
            </Pressable>
          }
        />

        <CorruptStateRecoveryBanner />

        {/* Sacred Numbers Glanceable Countertop Card */}
        <CalculatorSacredCard
          overallHydrationPercent={calculations.overallHydrationPercent}
          targetDoughWeightGrams={calculations.targetDoughWeightGrams}
          totalFlourGrams={calculations.totalFlourGrams}
          targetDdt={targetDdt}
        />

        <BlokadaFunkcji {...blokada('kalkulator')}>
        <DoMiskiScaleCard
          calculations={calculations}
          saltPercent={saltPct}
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

        <ArtisanAccordionPro
          isOpen={isArtisanAccordionOpen}
          onToggle={() => setIsArtisanAccordionOpen((prev) => !prev)}
          targetDdt={targetDdt}
          onTargetDdtChange={setTargetDdt}
          waterTempTarget={ddtResult.waterTempTarget}
          waterTempWarning={ddtResult.status === 'too_hot_danger' ? ddtResult.warningMessagePl : undefined}
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
        </BlokadaFunkcji>

        {/* Master & Custom Recipes Selector */}
        <FormulaPresetSelector
          filteredMasterRecipes={filteredMasterRecipes}
          totalMasterRecipesCount={MASTER_RECIPES.length}
          masterCategoryFilter={masterCategoryFilter}
          onCategoryFilterChange={setMasterCategoryFilter}
          selectedPresetId={selectedPresetId}
          onSelectMasterPreset={(id) => chron('kalkulator', () => handleSelectMasterPreset(id))()}
          currentMasterPreset={currentMasterPreset}
          customRecipes={customRecipes}
          onSelectCustomRecipe={handleSelectCustomRecipe}
          onDeleteCustomRecipe={handleDeleteCustomRecipe}
          onOpenVolumeConverter={chron('kalkulator', () => setIsVolumeModalOpen(true))}
          onOpenImportRecipe={() => setIsImportModalOpen(true)}
          onOpenScanQr={() => setIsScannerOpen(true)}
          unitSystem={unitSystem}
        />

        {/* Action Buttons: Save Custom Recipe, Copy Recipe & Start Bake on Workbench */}
        <CalculatorActionButtons
          onCopyRecipe={() =>
            executeCopyRecipe({
              recipeName,
              calculations,
              bakeLossMetrics,
              targetDdt,
              waterTempTarget: ddtResult.waterTempTarget,
              iceGrams: iceResult?.iceGrams,
              tapWaterTemp,
              loavesCount: calcMode === 'loaves' ? loavesCount : 1,
            })
          }
          onCloneRecipe={handleCloneAsCustomRecipe}
          onExportJson={() => executeExportRecipeJson(currentRecipeForShare as any)}
          onShareQr={chron('udostepnianie', () => setIsShareQrOpen(true))}
          onPrintMenu={chron('kalkulator', () => openPrintMenu(handlePrintRecipePdf))}
          onImportJson={() => setIsImportModalOpen(true)}
          onOpenInventory={chron('spizarnia', () => setIsInventoryOpen(true))}
          onSaveCustomRecipe={chron('receptury', () => {
            setSaveRecipeNameInput(recipeName);
            setIsSaveModalOpen(true);
          })}
          onStartBake={handleStartBakeOnWorkbench}
        />

        {/* Modal: Save Recipe */}
        <SaveRecipeModal
          visible={isSaveModalOpen}
          recipeName={saveRecipeNameInput}
          onRecipeNameChange={setSaveRecipeNameInput}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveCustomRecipe}
        />

        {/* Calculator Modals Provider */}
        <CalculatorModalsProvider
          isSettingsOpen={isSettingsOpen}
          onCloseSettings={() => {
            setIsSettingsOpen(false);
            void getBakerRitualProfile().then(applyRitual);
          }}
          isOnboardingOpen={isOnboardingOpen}
          onCompleteOnboarding={(profile) => {
            setIsOnboardingOpen(false);
            applyRitual(profile);
          }}
          isBlendModalOpen={isBlendModalOpen}
          flourBlend={flourBlend}
          onApplyBlend={setFlourBlend}
          onCloseBlend={() => setIsBlendModalOpen(false)}
          isInventoryOpen={isInventoryOpen}
          onCloseInventory={() => setIsInventoryOpen(false)}
          recipeFlours={calculations.flours}
          isImportModalOpen={isImportModalOpen}
          importInitialInput={importInitialInput}
          onCloseImport={() => {
            setIsImportModalOpen(false);
            setImportInitialInput('');
          }}
          onImportSuccess={handleImportSuccess}
          isShareQrOpen={isShareQrOpen}
          currentRecipeForShare={currentRecipeForShare}
          onCloseShareQr={() => setIsShareQrOpen(false)}
          isScannerOpen={isScannerOpen}
          onCloseScanner={() => setIsScannerOpen(false)}
          onScanRecipe={handleScanRecipe}
          isEquivModalOpen={isEquivModalOpen}
          onCloseEquiv={() => setIsEquivModalOpen(false)}
          isVolumeModalOpen={isVolumeModalOpen}
          onCloseVolume={() => setIsVolumeModalOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
