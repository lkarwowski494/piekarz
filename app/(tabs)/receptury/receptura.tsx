// Ekran receptury (design-spec §11c „106”, stany `receptura`, `receptura-zaczyn`, `receptura-wiecej`): push ze
// stosu zakładki „Receptury” z listy receptur; tytuł paska = nazwa receptury. Od góry: grupa trybu → „Do miski”
// → zdanie o hydratacji → „Razem {masa}” → „O recepturze” (receptury bazowe); strefa akcji (§11b „057”)
// przyklejona do dołu poza przewijaniem, a gdy zajęłaby ponad 40% wysokości (duży tekst), na końcu treści.
// Tryb, mąki, proporcje i zaczyn: arkusz „Składniki”; temperatura: arkusz „Temperatura wody”.
// Rachunek (useRecipeCalculations), zapis, plan i wczytanie receptury bez zmian. [M1-audytor-generalny-106]
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { guardSave } from '../../../src/lib/save-guard';
import { FlourItemInput } from '../../../src/core/domain-rules';
import { MASTER_RECIPES } from '../../../src/recipes/presets';
import type { PendingRecipeFormula, PendingRecipeToLoad } from '../../../src/lib/recipe-navigation';
import { usePendingRecipeLoader } from '../../../src/hooks/usePendingRecipeLoader';
import { PrefermentType } from '../../../src/core/preferments';
import { useAppAccess } from '../../../src/lib/app-access';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { SaveRecipeModal } from '../../../src/components/calculator/SaveRecipeModal';
import { CalculatorActionButtons } from '../../../src/components/calculator/CalculatorActionButtons';
import { CalculatorModalsProvider } from '../../../src/components/calculator/CalculatorModalsProvider';
import { useRecipeCalculations } from '../../../src/hooks/useRecipeCalculations';
import {
  executePrintRecipePdf,
  executeExportRecipeJson,
  executeCopyRecipe,
  executeSaveCustomRecipe,
} from '../../../src/lib/calculator-actions';
import { openPrintMenu } from '../../../src/lib/print-menu';
import { pozycjeMenuReceptury, zarejestrujMenuReceptury, PozycjaMenuReceptury } from '../../../src/lib/menu-receptury';
import { ustawRecepturePlanu, powodBezZakwasu } from '../../../src/lib/plan-receptury';
import { TemperaturaWodySheet } from '../../../src/components/calculator/TemperaturaWodySheet';
import { TemperaturyDdt, brakujacaTemperatura, ETYKIETY_TEMPERATUR } from '../../../src/components/calculator/accordion/PolaTemperaturDdt';
import { DoMiski } from '../../../src/components/receptury/DoMiski';
import { ORecepturze } from '../../../src/components/receptury/ORecepturze';
import { SkladnikiSheet } from '../../../src/components/receptury/SkladnikiSheet';
import { powiadomOZmianieReceptur, zglosEkranReceptury } from '../../../src/components/receptury/stos-receptur';
import { s } from '../../../src/components/receptury/style-receptur';
import { theme } from '../../../src/ui/theme';
import { typografia } from '../../../src/ui/tokeny';

type CalculationMode = 'loaves' | 'flour';
const bezAkcji = () => undefined;

export default function EkranReceptury() {
  const router = useRouter();

  // Jeden strażnik dostępu; bez uprawnienia tylko odczyt, eksport i usunięcie (027)
  const { chron, blokada, requireActionAccess } = useAppAccess();

  const [calcMode, setCalcMode] = useState<CalculationMode>('loaves');
  const [loavesCount, setLoavesCount] = useState<number>(2);
  const [loafWeightGrams, setLoafWeightGrams] = useState<number>(850);
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
  // Temperatury do wzoru wody: pola w arkuszu „Temperatura wody”, null = puste pole (BR-KALK-004, RD-16)
  // [M1-audytor-generalny-146]
  const [temperatury, setTemperatury] = useState<TemperaturyDdt>({ maka: 21.0, kuchnia: 22.0, zaczyn: 21.0, tarcie: 2.0 });
  const [tapWaterTemp] = useState<number>(16.0);

  // Strata piecowa: F-48 PÓŹNIEJ bez wejścia (§11c 106); kopia receptury pomija ją, dopóki wejście jest ukryte (DEC-25 a, 199)
  const [customBakeLossPercent] = useState<number>(14.0);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveRecipeNameInput, setSaveRecipeNameInput] = useState<string>('');
  const [isIngredientsOpen, setIsIngredientsOpen] = useState<boolean>(false);
  const [isShareQrOpen, setIsShareQrOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isEquivModalOpen, setIsEquivModalOpen] = useState<boolean>(false);
  const [isWaterTempOpen, setIsWaterTempOpen] = useState<boolean>(false);

  // Artisan Preferments state
  const [prefermentType, setPrefermentType] = useState<PrefermentType>('direct');
  const [prefermentFlourPct, setPrefermentFlourPct] = useState<number>(20.0);

  // Strefa akcji poza przewijaniem, chyba że zajęłaby ponad 40% wysokości ekranu (§11c 106)
  const [wysokoscEkranu, setWysokoscEkranu] = useState<number>(0);
  const [wysokoscAkcji, setWysokoscAkcji] = useState<number>(0);
  const akcjeWTresci = wysokoscEkranu > 0 && wysokoscAkcji > 0.4 * wysokoscEkranu;

  // Lista receptur nie otwiera drugiego ekranu receptury, gdy ten jest otwarty (stos-receptur.ts)
  useEffect(() => zglosEkranReceptury(), []);

  // Tytuł paska nawigacji = nazwa receptury, także po wczytaniu innej i po zapisie jako moja
  const routerRef = useRef(router);
  routerRef.current = router;
  useEffect(() => {
    routerRef.current.setParams?.({ nazwa: recipeName });
  }, [recipeName]);

  // Unified recipe setter
  const applyFormula = useCallback((id: string, name: string, formula: PendingRecipeFormula, ddt?: number) => {
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

  const roomTemp = temperatury.kuchnia ?? 0;
  const zZaczynem = starterPct > 0 || prefermentType !== 'direct';
  const brakTemperatury = brakujacaTemperatura(temperatury, zZaczynem);

  // Derived Calculations Hook
  const {
    recipeFormula,
    calculations,
    bladMak,
    currentRecipeForShare,
    ddtResult,
    bakeLossMetrics,
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
    flourTemp: temperatury.maka ?? 0,
    roomTemp,
    starterTemp: zZaczynem ? temperatury.zaczyn ?? 0 : undefined,
    frictionFactor: temperatury.tarcie ?? 0,
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

  // Receptura z listy, z „Piecz ponownie” albo z importu w Ustawieniach (F-33) [M1-audytor-generalny-057]
  usePendingRecipeLoader((pending: PendingRecipeToLoad) => {
    applyFormula(pending.id ?? selectedPresetId, pending.name, pending.formula, pending.targetDDT);
    if (pending.formula.targetDoughWeightGrams !== undefined) {
      setCalcMode('loaves');
      setLoavesCount(1);
      setLoafWeightGrams(pending.formula.targetDoughWeightGrams);
    }
  }, bezAkcji, [applyFormula, selectedPresetId]);

  const currentMasterPreset = useMemo(() => MASTER_RECIPES.find((p) => p.id === selectedPresetId), [selectedPresetId]);

  const handleSaveCustomRecipe = async () => {
    requireActionAccess(guardSave(async () => {
      // Cała formuła jak dla planu, z drożdżami [audyt-niezalezny D-2]
      const saved = await executeSaveCustomRecipe(saveRecipeNameInput, recipeFormula, targetDdt);
      if (saved) {
        powiadomOZmianieReceptur();
        setSelectedPresetId(saved.id);
        setRecipeName(saved.name);
        setIsSaveModalOpen(false);
        setSaveRecipeNameInput('');
      }
    }));
  };

  // „Ułóż plan” (słownik §5): plan wstecz z tą recepturą; wypiek zaczyna „Zacznij wypiek” na planie [M1-audytor-generalny-057]
  const handleMakePlan = () => {
    requireActionAccess(() => {
      ustawRecepturePlanu({
        recipeName,
        calculatedRecipe: calculations,
        recipeFormula,

      });
      router.push('/receptury/harmonogram');
    });
  };

  // Menu „Więcej” w pasku nawigacji (057): pozycje z bieżącą recepturą przy każdym otwarciu
  const menuWiecej = useRef<() => PozycjaMenuReceptury[]>(() => []);
  menuWiecej.current = () =>
    pozycjeMenuReceptury({
      kopiuj: () =>
        void executeCopyRecipe({
          recipeName,
          calculations,
          bakeLossMetrics,
          targetDdt,
          waterTempTarget: ddtResult.waterTempTarget,
          tapWaterTemp,
          loavesCount: calcMode === 'loaves' ? loavesCount : 1,
        }),
      udostepnijPlik: () => void executeExportRecipeJson(currentRecipeForShare),
      udostepnijQr: chron('udostepnianie', () => setIsShareQrOpen(true)),
      drukuj: chron('kalkulator', () => openPrintMenu(handlePrintRecipePdf)),
    });
  useEffect(() => zarejestrujMenuReceptury(() => menuWiecej.current()), []);

  // Obszar akcji receptury: dokładnie 4 akcje główne (057); reszta w menu „Więcej” w pasku nawigacji
  const akcje = (
    <CalculatorActionButtons
      onMakePlan={handleMakePlan}
      powodBezPlanu={powodBezZakwasu(recipeFormula)}
      onSaveCustomRecipe={chron('receptury', () => {
        setSaveRecipeNameInput(recipeName);
        setIsSaveModalOpen(true);
      })}
      onWaterTemp={chron('kalkulator', () => setIsWaterTempOpen(true))}
      onEditIngredients={chron('kalkulator', () => setIsIngredientsOpen(true))}
    />
  );

  return (
    <SafeAreaView style={s.ekran} edges={['left', 'right', 'bottom']}>
      <View style={s.ekran} onLayout={(e) => setWysokoscEkranu(e.nativeEvent.layout.height)}>
        <ScrollView contentContainerStyle={s.tresc} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
          <BlokadaFunkcji {...blokada('kalkulator')}>
            {/* Suma mąk ≠ 100% (np. receptura z kopii): komunikat zamiast wywrotki ekranu [M1-audytor-generalny-150] */}
            {bladMak ? (
              <Text testID="receptura-blad-mak" accessibilityRole="alert" style={styles.bladMak}>
                {bladMak}
              </Text>
            ) : null}
            <DoMiski
              calculations={calculations}
              waterPct={waterPct}
              starterPct={starterPct}
              starterHydration={starterHydration}
              saltPct={saltPct}
              yeastPct={yeastPct}
              calcMode={calcMode}
              loavesCount={loavesCount}
              onLoavesChange={setLoavesCount}
              loafWeightGrams={loafWeightGrams}
              onLoafWeightChange={setLoafWeightGrams}
              flourGrams={flourGrams}
              onFlourGramsChange={setFlourGrams}
              prefermentType={prefermentType}
              prefermentBreakdown={prefermentBreakdown}
            />
          </BlokadaFunkcji>
          {currentMasterPreset && <ORecepturze receptura={currentMasterPreset} />}
          {akcjeWTresci && akcje}
        </ScrollView>
        {!akcjeWTresci && (
          <View style={styles.strefaAkcji} onLayout={(e) => setWysokoscAkcji(e.nativeEvent.layout.height)}>
            {akcje}
          </View>
        )}
      </View>

      <SkladnikiSheet
        visible={isIngredientsOpen}
        onClose={() => setIsIngredientsOpen(false)}
        calcMode={calcMode}
        onCalcModeChange={setCalcMode}
        flourBlend={flourBlend}
        onFlourBlendChange={setFlourBlend}
        waterPct={waterPct}
        onWaterPctChange={setWaterPct}
        starterPct={starterPct}
        onStarterPctChange={setStarterPct}
        starterHydration={starterHydration}
        onStarterHydrationChange={setStarterHydration}
        saltPct={saltPct}
        onSaltPctChange={setSaltPct}
        yeastPct={yeastPct}
        onYeastPctChange={setYeastPct}
        prefermentType={prefermentType}
        onPrefermentTypeChange={setPrefermentType}
        prefermentFlourPct={prefermentFlourPct}
        onPrefermentFlourPctChange={setPrefermentFlourPct}
        prefermentBreakdown={prefermentBreakdown}
        hydrationDifficulty={hydrationDifficulty}
        blendAbsorption={blendAbsorption}
        onOpenInventory={chron('spizarnia', () => setIsInventoryOpen(true))}
        onOpenEquivalents={() => setIsEquivModalOpen(true)}
      />

      <TemperaturaWodySheet
        visible={isWaterTempOpen}
        onClose={() => setIsWaterTempOpen(false)}
        targetDdt={targetDdt}
        onTargetDdtChange={setTargetDdt}
        waterTempTarget={ddtResult.waterTempTarget}
        waterTempWarning={ddtResult.status === 'too_hot_danger' ? ddtResult.warningMessagePl : undefined}
        temperatury={{ wartosci: temperatury, zZaczynem, onChange: (z) => setTemperatury((p) => ({ ...p, ...z })) }}
        brakPola={brakTemperatury ? ETYKIETY_TEMPERATUR[brakTemperatury] : null}
      />

      <SaveRecipeModal
        visible={isSaveModalOpen}
        recipeName={saveRecipeNameInput}
        onRecipeNameChange={setSaveRecipeNameInput}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveCustomRecipe}
      />

      {/* Okna wejść PÓŹNIEJ (QR, spiżarnia, odpowiedniki mąk): otwierane tylko, gdy wejście jest widoczne */}
      <CalculatorModalsProvider
        isBlendModalOpen={false}
        flourBlend={flourBlend}
        onApplyBlend={setFlourBlend}
        onCloseBlend={bezAkcji}
        isInventoryOpen={isInventoryOpen}
        onCloseInventory={() => setIsInventoryOpen(false)}
        recipeFlours={calculations.flours}
        isImportModalOpen={false}
        importInitialInput=""
        onCloseImport={bezAkcji}
        onImportSuccess={bezAkcji}
        isShareQrOpen={isShareQrOpen}
        currentRecipeForShare={currentRecipeForShare}
        onCloseShareQr={() => setIsShareQrOpen(false)}
        isScannerOpen={false}
        onCloseScanner={bezAkcji}
        onScanRecipe={bezAkcji}
        isEquivModalOpen={isEquivModalOpen}
        onCloseEquiv={() => setIsEquivModalOpen(false)}
        isVolumeModalOpen={false}
        onCloseVolume={bezAkcji}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bladMak: { color: theme.colors.tusz, fontSize: typografia.style.tresc.pt, lineHeight: 22, marginBottom: theme.spacing.md },
  strefaAkcji: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.tlo,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.linia,
  },
});
