import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { theme } from './src/ui/theme';
import { MASTER_RECIPES, RecipePreset } from './src/recipes/presets';
import {
  calculateDoughRecipe,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateStarterFeeding,
  DoughRecipeInput,
  DoughRecipeResult,
} from './src/core/domain-rules';
import {
  calculateReverseSchedule,
  ReverseScheduleResult,
} from './src/scheduler/reverse-scheduler';
import {
  diagnoseBreadDefect,
  BreadInspectionCriteria,
  DiagnosticResult,
} from './src/doctor/diagnostics';
import { dbStore, StoredStarter } from './src/data/db';

type AppTab = 'calculator' | 'schedule' | 'workbench' | 'starter' | 'doctor';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('calculator');

  // Initialize DB store
  useEffect(() => {
    dbStore.init();
  }, []);

  // ==========================================
  // TAB 1: KALKULATOR % & DDT
  // ==========================================
  const [selectedRecipe, setSelectedRecipe] = useState<RecipePreset>(MASTER_RECIPES[0]);
  const [targetWeight, setTargetWeight] = useState<number>(selectedRecipe.formula.targetDoughWeightGrams);
  const [waterPct, setWaterPct] = useState<number>(selectedRecipe.formula.waterPercentage);
  const [saltPct, setSaltPct] = useState<number>(selectedRecipe.formula.saltPercentage);
  const [starterPct, setStarterPct] = useState<number>(selectedRecipe.formula.starterPercentage);

  // DDT inputs
  const [roomTemp, setRoomTemp] = useState<number>(22.0);
  const [flourTemp, setFlourTemp] = useState<number>(20.0);
  const [starterTemp, setStarterTemp] = useState<number>(22.0);
  const [targetDDT, setTargetDDT] = useState<number>(selectedRecipe.targetDDT);
  const [frictionFactor, setFrictionFactor] = useState<number>(2.0);

  // Select preset
  const handleSelectPreset = (preset: RecipePreset) => {
    setSelectedRecipe(preset);
    setTargetWeight(preset.formula.targetDoughWeightGrams);
    setWaterPct(preset.formula.waterPercentage);
    setSaltPct(preset.formula.saltPercentage);
    setStarterPct(preset.formula.starterPercentage);
    setTargetDDT(preset.targetDDT);
  };

  // Recipe calculation result
  const recipeInput: DoughRecipeInput = {
    flours: selectedRecipe.formula.flours,
    waterPercentage: waterPct,
    saltPercentage: saltPct,
    starterPercentage: starterPct,
    starterHydration: selectedRecipe.formula.starterHydration ?? 100.0,
    extraYeastPercentage: selectedRecipe.formula.extraYeastPercentage ?? 0.0,
    targetDoughWeightGrams: targetWeight,
  };

  let calculationResult: DoughRecipeResult | null = null;
  try {
    calculationResult = calculateDoughRecipe(recipeInput);
  } catch (e) {
    // handled gracefully
  }

  // DDT calculation
  const ddtResult = calculateDDTWaterTemp({
    targetDDT,
    flourTemp,
    roomTemp,
    starterTemp,
    frictionFactor,
  });

  // Ice calculation if water temp is below 4°C
  const iceReq =
    ddtResult.waterTempTarget < 4.0 && calculationResult
      ? calculateIceRequirement(calculationResult.waterGrams, 18.0, Math.max(0, ddtResult.waterTempTarget))
      : null;

  // ==========================================
  // TAB 2: HARMONOGRAM WSTECZNY
  // ==========================================
  const [targetHour, setTargetHour] = useState<number>(9);
  const [targetMinute, setTargetMinute] = useState<number>(0);
  const [scheduleAmbientTemp, setScheduleAmbientTemp] = useState<number>(24.0);

  // Compute target Date for next morning
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 1);
  targetDate.setHours(targetHour, targetMinute, 0, 0);

  const scheduleResult: ReverseScheduleResult = calculateReverseSchedule(targetDate, {
    ambientTemperatureC: scheduleAmbientTemp,
    sleepStartHour: 23.0,
    sleepEndHour: 6.5,
  });

  // ==========================================
  // TAB 3: STOLNICA I ETAPY (LIVE SESSION)
  // ==========================================
  const [activeStageIndex, setActiveStageIndex] = useState<number>(3); // e.g. Coil Fold 1
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // 30 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  const handleNextStage = () => {
    setActiveStageIndex((prev) => prev + 1);
    setSecondsRemaining(1800);
    setIsTimerRunning(true);
  };

  // ==========================================
  // TAB 4: ZAKWAS
  // ==========================================
  const starters = dbStore.getStarters();
  const activeStarter: StoredStarter = starters[0] ?? {
    id: 's1',
    name: 'Zakwas Bolesław',
    flourType: 'Żytnia 2000',
    hydration: 100,
    birthDate: Date.now() - 1000 * 60 * 60 * 24 * 90,
    storageState: 'FRIDGE',
  };
  const [targetFeedYield, setTargetFeedYield] = useState<number>(150);
  const feedCalc = calculateStarterFeeding(targetFeedYield, [1, 2, 2]);

  // ==========================================
  // TAB 5: DOKTOR CHLEBA (DIAGNOSTYKA)
  // ==========================================
  const [symptoms, setSymptoms] = useState<BreadInspectionCriteria>({});
  const diagnosticResult: DiagnosticResult = diagnoseBreadDefect(symptoms);

  const toggleSymptom = (key: keyof BreadInspectionCriteria) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PIEKARZ</Text>
          <Text style={styles.headerSubtitle}>Apps4Brew · Rzemiosło stolnicy</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>100% OFFLINE</Text>
        </View>
      </View>

      {/* TAB SELECTOR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'calculator' && styles.tabButtonActive]}
          onPress={() => setActiveTab('calculator')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'calculator' && styles.tabButtonTextActive]}>
            Kalkulator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'schedule' && styles.tabButtonActive]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'schedule' && styles.tabButtonTextActive]}>
            Harmonogram
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'workbench' && styles.tabButtonActive]}
          onPress={() => setActiveTab('workbench')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'workbench' && styles.tabButtonTextActive]}>
            Stolnica
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'starter' && styles.tabButtonActive]}
          onPress={() => setActiveTab('starter')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'starter' && styles.tabButtonTextActive]}>
            Zakwas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'doctor' && styles.tabButtonActive]}
          onPress={() => setActiveTab('doctor')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'doctor' && styles.tabButtonTextActive]}>
            Doktor
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT AREA */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
        {/* ==================================================== */}
        {/* TAB 1: KALKULATOR % & DDT */}
        {/* ==================================================== */}
        {activeTab === 'calculator' && (
          <View>
            <Text style={styles.sectionHeader}>Receptura bazowa</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {MASTER_RECIPES.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetCard, selectedRecipe.id === preset.id && styles.presetCardActive]}
                  onPress={() => handleSelectPreset(preset)}
                >
                  <Text style={[styles.presetTitle, selectedRecipe.id === preset.id && styles.presetTitleActive]}>
                    {preset.namePl}
                  </Text>
                  <Text style={styles.presetMeta}>
                    {preset.formula.waterPercentage}% wody · {preset.recommendedVessel === 'dutch_oven' ? 'Garnek żeliwny' : 'Foremka'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* WEIGHT & HYDRATION CONTROLS */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Parametry ciasta</Text>

              <View style={styles.rowBetween}>
                <Text style={styles.paramLabel}>Docelowa masa ciasta:</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => setTargetWeight((w) => Math.max(300, w - 100))}
                  >
                    <Text style={styles.smallBtnText}>-100</Text>
                  </TouchableOpacity>
                  <Text style={styles.paramValueBold}>{targetWeight} g</Text>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => setTargetWeight((w) => w + 100)}
                  >
                    <Text style={styles.smallBtnText}>+100</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.paramLabel}>Woda dodana (% mąki):</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => setWaterPct((p) => Math.max(50, p - 1))}
                  >
                    <Text style={styles.smallBtnText}>-1%</Text>
                  </TouchableOpacity>
                  <Text style={styles.paramValueBold}>{waterPct}%</Text>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => setWaterPct((p) => Math.min(95, p + 1))}
                  >
                    <Text style={styles.smallBtnText}>+1%</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.paramLabel}>Zakwas (% mąki):</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => setStarterPct((p) => Math.max(0, p - 5))}
                  >
                    <Text style={styles.smallBtnText}>-5%</Text>
                  </TouchableOpacity>
                  <Text style={styles.paramValueBold}>{starterPct}%</Text>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => setStarterPct((p) => Math.min(50, p + 5))}
                  >
                    <Text style={styles.smallBtnText}>+5%</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* TRUE OVERALL HYDRATION BANNER */}
              {calculationResult && (
                <View style={styles.hydrationBanner}>
                  <Text style={styles.hydrationBannerTitle}>
                    Całkowita hydratacja ciasta: {calculationResult.overallHydrationPercent}%
                  </Text>
                  <Text style={styles.hydrationBannerDesc}>
                    (True Baker's %: uwzględniono mąkę i wodę ze startera)
                  </Text>
                </View>
              )}
            </View>

            {/* INGREDIENTS LIST */}
            {calculationResult && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Wagi składników do miski</Text>
                {calculationResult.flours.map((flour, i) => (
                  <View key={i} style={styles.rowBetween}>
                    <Text style={styles.ingredientText}>
                      {flour.name} ({flour.percentage}%):
                    </Text>
                    <Text style={styles.ingredientValue}>{flour.weightGrams} g</Text>
                  </View>
                ))}
                <View style={styles.rowBetween}>
                  <Text style={styles.ingredientText}>Woda do dolania:</Text>
                  <Text style={styles.ingredientValue}>{calculationResult.waterGrams} g</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.ingredientText}>Zakwas (starter):</Text>
                  <Text style={styles.ingredientValue}>{calculationResult.starterGrams} g</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.ingredientText}>Sól niejodowana (2%):</Text>
                  <Text style={styles.ingredientValue}>{calculationResult.saltGrams} g</Text>
                </View>
                <View style={[styles.rowBetween, styles.totalRow]}>
                  <Text style={styles.totalText}>Suma kęsa ciasta:</Text>
                  <Text style={styles.totalValue}>{calculationResult.sumCheckGrams} g</Text>
                </View>
              </View>
            )}

            {/* DDT CALCULATOR */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Temperatura wody (DDT)</Text>
              <Text style={styles.cardDesc}>
                Docelowa temperatura ciasta: {targetDDT}°C · Formuła 4-składnikowa
              </Text>
              <View style={styles.rowBetween}>
                <Text style={styles.paramLabel}>Temp. mąki: {flourTemp}°C</Text>
                <Text style={styles.paramLabel}>Temp. kuchni: {roomTemp}°C</Text>
              </View>
              <View style={styles.ddtBanner}>
                <Text style={styles.ddtBannerTitle}>
                  Wymagana temperatura wody: {ddtResult.waterTempTarget}°C
                </Text>
                {ddtResult.warningMessagePl && (
                  <Text style={styles.ddtWarningText}>{ddtResult.warningMessagePl}</Text>
                )}
                {iceReq && (
                  <Text style={styles.iceText}>
                    Wymóg schłodzenia: {iceReq.iceGrams} g lodu + {iceReq.waterGrams} g wody z kranu.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ==================================================== */}
        {/* TAB 2: HARMONOGRAM WSTECZNY */}
        {/* ==================================================== */}
        {activeTab === 'schedule' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Plan wypieku liczony wstecz</Text>
              <Text style={styles.cardDesc}>
                Chcę wyjąć gotowy chleb z pieca jutro o {targetHour.toString().padStart(2, '0')}:
                {targetMinute.toString().padStart(2, '0')}
              </Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.smallBtn, { marginRight: 8 }]}
                  onPress={() => setTargetHour((h) => (h === 6 ? 12 : h - 1))}
                >
                  <Text style={styles.smallBtnText}>Wcześniej</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={() => setTargetHour((h) => (h === 22 ? 6 : h + 1))}
                >
                  <Text style={styles.smallBtnText}>Później</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SLEEP GUARD ALERT */}
            {scheduleResult.hasSleepCollision && (
              <View style={styles.dangerCard}>
                <Text style={styles.dangerTitle}>Ostrzeżenie: Sleep Guard</Text>
                <Text style={styles.dangerText}>{scheduleResult.collisionDetailsPl}</Text>
                <Text style={styles.dangerSuggestion}>{scheduleResult.suggestedActionPl}</Text>
              </View>
            )}

            {/* TIMELINE */}
            <Text style={styles.sectionHeader}>Oś czasu przygotowania</Text>
            {scheduleResult.stages.map((stage, idx) => (
              <View key={stage.id} style={[styles.timelineItem, stage.isSleepCollision && styles.timelineItemCollision]}>
                <View style={styles.timelineTimeBox}>
                  <Text style={styles.timelineTimeText}>
                    {stage.startTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.timelineDurationText}>{stage.durationMinutes} min</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStageName}>{stage.namePl}</Text>
                  <Text style={styles.timelineInstructions}>{stage.instructionsPl}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================================================== */}
        {/* TAB 3: STOLNICA (LIVE BAKING SESSION) */}
        {/* ==================================================== */}
        {activeTab === 'workbench' && (
          <View>
            <View style={styles.liveWorkbenchCard}>
              <Text style={styles.liveStageBadge}>AKTYWNY ETAP</Text>
              <Text style={styles.liveStageTitle}>Składanie zwojowe (Coil Fold)</Text>
              <Text style={styles.liveStageSubtitle}>Seria 2 z 4 · Fermentacja burzliwa</Text>

              {/* GIANT COUNTDOWN TIMER */}
              <View style={styles.giantTimerBox}>
                <Text style={styles.giantTimerText}>
                  {Math.floor(secondsRemaining / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(secondsRemaining % 60).toString().padStart(2, '0')}
                </Text>
              </View>

              {/* DOUGH-FRIENDLY LARGE TARGET BUTTONS (ZP-01) */}
              <TouchableOpacity style={styles.hugeActionButton} onPress={handleNextStage}>
                <Text style={styles.hugeActionText}>ODHACZ ZŁOŻENIE (DOUBLE TAP)</Text>
              </TouchableOpacity>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.workbenchSecondaryBtn}
                  onPress={() => setIsTimerRunning((r) => !r)}
                >
                  <Text style={styles.workbenchSecondaryText}>
                    {isTimerRunning ? 'Pauza' : 'Wznów'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.workbenchSecondaryBtn}
                  onPress={() => setSecondsRemaining((s) => s + 600)}
                >
                  <Text style={styles.workbenchSecondaryText}>+10 min</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.watchHintText}>
                Możesz także odhaczyć ten krok gestem podwójnego stuknięcia na Apple Watch lub przyciskiem na Garminie.
              </Text>
            </View>
          </View>
        )}

        {/* ==================================================== */}
        {/* TAB 4: ZAKWAS */}
        {/* ==================================================== */}
        {activeTab === 'starter' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{activeStarter.name}</Text>
              <Text style={styles.cardDesc}>
                Mąka: {activeStarter.flourType} · Hydratacja: {activeStarter.hydration}%
              </Text>
              <View style={styles.rowBetween}>
                <Text style={styles.paramLabel}>Stan zakwasu:</Text>
                <Text style={styles.paramValueBold}>
                  {activeStarter.storageState === 'FRIDGE' ? 'Uśpiony w lodówce' : 'Aktywny na blacie'}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.paramLabel}>Ostatnie dokarmienie:</Text>
                <Text style={styles.paramValueBold}>3 dni temu</Text>
              </View>
            </View>

            {/* STARTER FEEDING CALCULATOR */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Kalkulator dokarmiania (1:2:2)</Text>
              <Text style={styles.cardDesc}>
                Ile gramów zakwasu potrzebujesz: {targetFeedYield} g
              </Text>
              <View style={styles.rowBetween}>
                <Text style={styles.ingredientText}>Stary zakwas (matka):</Text>
                <Text style={styles.ingredientValue}>{feedCalc.starterGrams} g</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.ingredientText}>Świeża mąka żytnia:</Text>
                <Text style={styles.ingredientValue}>{feedCalc.flourGrams} g</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.ingredientText}>Letnia woda (26°C):</Text>
                <Text style={styles.ingredientValue}>{feedCalc.waterGrams} g</Text>
              </View>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => Alert.alert('Zapisano', 'Zarejestrowano dokarmienie zakwasu')}
              >
                <Text style={styles.actionBtnText}>ZATWIERDŹ DOKARMIENIE</Text>
              </TouchableOpacity>
            </View>

            {/* SAFETY GUIDE */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Bezpieczeństwo biologiczne</Text>
              <Text style={styles.safetyBullet}>
                ✓ Ciemny płyn na powierzchni (Hooch) o zapachu alkoholu = zakwas jest zdrowy, ale głodny.
              </Text>
              <Text style={styles.safetyBullet}>
                ✓ Sucha, biała powłoka (Kahm Yeast) = nieszkodliwy kożuch, zdejmij łyżką i dokarm.
              </Text>
              <Text style={[styles.safetyBullet, { color: theme.colors.statusDanger }]}>
                ✗ Różowe, zielone lub czarne wykwity = TOKSYCZNA PLEŚŃ. Wyrzuć cały zakwas do kosza!
              </Text>
            </View>
          </View>
        )}

        {/* ==================================================== */}
        {/* TAB 5: DOKTOR CHLEBA */}
        {/* ==================================================== */}
        {activeTab === 'doctor' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Drzewo diagnostyki bochenka</Text>
              <Text style={styles.cardDesc}>
                Co poszło nie tak? Zaznacz objawy, a system zidentyfikuje przyczynę biologiczną.
              </Text>

              <TouchableOpacity
                style={[styles.checkOption, symptoms.crumbHasHugeTopHolesWithDenseBottom && styles.checkOptionActive]}
                onPress={() => toggleSymptom('crumbHasHugeTopHolesWithDenseBottom')}
              >
                <Text style={styles.checkText}>
                  {symptoms.crumbHasHugeTopHolesWithDenseBottom ? '☒' : '☐'} Wielkie dziury pod skórką i ciężki, zbity dół
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkOption, symptoms.loafCollapsedAfterScoring && styles.checkOptionActive]}
                onPress={() => toggleSymptom('loafCollapsedAfterScoring')}
              >
                <Text style={styles.checkText}>
                  {symptoms.loafCollapsedAfterScoring ? '☒' : '☐'} Chleb rozlał się płasko lub oklapł po nacięciu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkOption, symptoms.loafBurstAtBottomSide && styles.checkOptionActive]}
                onPress={() => toggleSymptom('loafBurstAtBottomSide')}
              >
                <Text style={styles.checkText}>
                  {symptoms.loafBurstAtBottomSide ? '☒' : '☐'} Pęknięcie boku zamiast otwarcia w nacięciu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkOption, symptoms.crumbIsWetGummyToKnife && styles.checkOptionActive]}
                onPress={() => toggleSymptom('crumbIsWetGummyToKnife')}
              >
                <Text style={styles.checkText}>
                  {symptoms.crumbIsWetGummyToKnife ? '☒' : '☐'} Wilgotny, kleisty miękisz mażący się na nożu
                </Text>
              </TouchableOpacity>
            </View>

            {/* DIAGNOSIS RESULT */}
            <View style={styles.diagnosisCard}>
              <Text style={styles.diagnosisTitle}>{diagnosticResult.titlePl}</Text>
              <Text style={styles.diagnosisSubtitle}>{diagnosticResult.subtitlePl}</Text>
              <Text style={styles.diagnosisCause}>{diagnosticResult.biologicalCausePl}</Text>

              <Text style={styles.checklistHeader}>Co zrobić przy kolejnym wypieku:</Text>
              {diagnosticResult.actionChecklistPl.map((action, i) => (
                <Text key={i} style={styles.checklistItem}>
                  • {action}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  headerBadge: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.sm,
  },
  presetScroll: {
    marginBottom: theme.spacing.md,
  },
  presetCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    width: 220,
  },
  presetCardActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
    backgroundColor: theme.colors.surfaceCard,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  presetTitleActive: {
    color: theme.colors.accentDark,
  },
  presetMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  paramValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    minWidth: 60,
    textAlign: 'center',
  },
  smallBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  hydrationBanner: {
    backgroundColor: theme.colors.accentLight,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  hydrationBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  hydrationBannerDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  ingredientText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  ingredientValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 6,
    paddingTop: 8,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  ddtBanner: {
    backgroundColor: theme.colors.surfaceCard,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.sm,
  },
  ddtBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  ddtWarningText: {
    fontSize: 12,
    color: theme.colors.statusDanger,
    marginTop: 4,
  },
  iceText: {
    fontSize: 12,
    color: theme.colors.statusWarning,
    marginTop: 4,
    fontWeight: '600',
  },
  dangerCard: {
    backgroundColor: '#FEE2E2',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderColor: '#EF4444',
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 4,
  },
  dangerText: {
    fontSize: 13,
    color: '#7F1D1D',
    marginBottom: 4,
  },
  dangerSuggestion: {
    fontSize: 12,
    color: '#991B1B',
    fontStyle: 'italic',
  },
  timelineItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  timelineItemCollision: {
    borderLeftColor: theme.colors.statusDanger,
    backgroundColor: '#FEF2F2',
  },
  timelineTimeBox: {
    width: 65,
  },
  timelineTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  timelineDurationText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
  },
  timelineStageName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  timelineInstructions: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  liveWorkbenchCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  liveStageBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  liveStageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  liveStageSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  giantTimerBox: {
    marginVertical: theme.spacing.lg,
  },
  giantTimerText: {
    fontSize: 64,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  hugeActionButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: theme.radius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  hugeActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  workbenchSecondaryBtn: {
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 4,
  },
  workbenchSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  watchHintText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  actionBtnPrimary: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  safetyBullet: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  checkOption: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkOptionActive: {
    backgroundColor: theme.colors.surfaceCard,
  },
  checkText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  diagnosisCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    marginTop: theme.spacing.md,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  diagnosisSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  diagnosisCause: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  checklistHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 4,
  },
  checklistItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
});
