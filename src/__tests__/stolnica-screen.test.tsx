import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import {
  initDatabase,
  getActiveBake,
  setActiveBake,
  getBakeLogs,
  saveBakeLog,
  getFlourInventory,
  _resetMemStore,
} from '../data/sqlite-store';
import { getPendingRecipeToLoad } from '../lib/recipe-navigation';

import { zUprawnieniem } from '../../tests/helpers/platnosci';
jest.setTimeout(20000);

jest.mock('expo-keep-awake', () => ({
  useKeepAwake: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

// Mock confirmDiscardBake and confirmDeleteBakeLog to immediately execute onConfirm
jest.mock('../lib/confirm', () => ({
  confirmDiscardBake: (onConfirm: () => void) => onConfirm(),
  confirmDeleteBakeLog: (onConfirm: () => void) => onConfirm(),
}));

function extractCleanText(node: any): string {
  function walk(n: any): string {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (!n) return '';
    if (Array.isArray(n)) return n.map(walk).join('');
    if (n.children) return walk(n.children);
    if (n.props && n.props.children) return walk(n.props.children);
    return '';
  }
  return walk(node).replace(/\s+/g, ' ').trim();
}

function findButtonByText(root: renderer.ReactTestInstance, text: string): renderer.ReactTestInstance | undefined {
  const pressables = root.findAll((n) => typeof n.props?.onPress === 'function');
  return pressables.find((p) => {
    const content = extractCleanText(p.props.children);
    return content.includes(text);
  });
}

describe('StolnicaScreen UI Interactions (app/(tabs)/stolnica.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
    jest.clearAllMocks();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  const renderScreen = async () => {
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('renders idle state with start bake button and history', async () => {
    await renderScreen();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Stolnica');
    expect(fullText).toContain('Brak aktywnego wypieku');
    expect(fullText).toContain('Rozpocznij wypiek');
    expect(fullText).toContain('Historia wypieków');
  });

  it('starts bake from idle when tapping Rozpocznij wypiek button', async () => {
    await renderScreen();

    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    expect(startBtn).toBeDefined();

    await act(async () => {
      startBtn?.props.onPress();
    });

    const activeText = extractCleanText(tree?.toJSON());
    // Domyślny chleb pszenny: kroki z planu Harmonogramu liczonego od teraz [M1-audytor-generalny-030]
    expect(activeText).toContain('Krok 1 z 11');
    expect(activeText).toContain('Dokarmienie zakwasu (osiągnięcie szczytu)');
    expect(activeText).toContain('6:00:00');
    expect(activeText).not.toContain('Składanie 1 (Stretch & Fold)');
  });

  it('displays transferred recipe ingredients when active bake was set from Calculator', async () => {
    setActiveBake({
      id: 'bake_test_calc',
      recipeName: 'Wiejski chleb 72%',
      startedAt: Date.now(),
      currentStageId: 'step_1',
      ambientTempC: 22.0,
      actualDdtC: 25.0,
      calculatedRecipe: {
        targetDoughWeightGrams: 1700,
        baseFlourWeightGrams: 895,
        flours: [{ name: 'Mąka pszenna', percentage: 100.0, weightGrams: 895 }],
        waterGrams: 608,
        saltGrams: 17.9,
        starterGrams: 179,
        starterFlourGrams: 89,
        starterWaterGrams: 89,
        yeastGrams: 0,
        totalFlourGrams: 984,
        totalWaterGrams: 697,
        overallHydrationPercent: 70.8,
        sumCheckGrams: 1700,
        isHighRye: false,
      },
    });

    await renderScreen();

    const text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Wiejski chleb 72%');
    expect(text).toContain('Składniki do odważenia');
    expect(text).toContain('895 g');
    expect(text).toContain('608 g');
    expect(text).toContain('179 g');
  });

  it('controls the kitchen timer: starts, pauses, and adds 5 minutes', async () => {
    await renderScreen();

    // Start bake
    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    await act(async () => {
      startBtn?.props.onPress();
    });

    // Initial timer is the first plan stage (6 h) and paused
    expect(extractCleanText(tree?.toJSON())).toContain('6:00:00');
    expect(extractCleanText(tree?.toJSON())).toContain('Wstrzymano');

    // Tap Start timer
    const playBtn = findButtonByText(tree!.root, 'Start');
    expect(playBtn).toBeDefined();

    await act(async () => {
      playBtn?.props.onPress();
    });

    // Now running
    expect(extractCleanText(tree?.toJSON())).toContain('Odliczanie trwa');
    expect(extractCleanText(tree?.toJSON())).toContain('Wstrzymaj');

    // Tap +5 min
    const addFiveBtn = findButtonByText(tree!.root, '+5 min');
    expect(addFiveBtn).toBeDefined();

    await act(async () => {
      addFiveBtn?.props.onPress();
    });

    // 6 h + 5 min = 6:05:00
    expect(extractCleanText(tree?.toJSON())).toContain('6:05:00');

    // Tap Reset
    const resetBtn = findButtonByText(tree!.root, 'Resetuj');
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.props.onPress();
    });

    // Back to 6:00:00
    expect(extractCleanText(tree?.toJSON())).toContain('6:00:00');
  });

  it('advances to next step when tapping Następny krok', async () => {
    await renderScreen();

    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    await act(async () => {
      startBtn?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Dokarmienie zakwasu');

    // Tap Następny krok
    const nextBtn = findButtonByText(tree!.root, 'Następny krok');
    expect(nextBtn).toBeDefined();

    await act(async () => {
      nextBtn?.props.onPress();
    });

    // Advanced to step 2 of the plan: Autoliza (45 min)
    const text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Krok 2 z 11');
    expect(text).toContain('Autoliza (mąka + woda)');
    expect(text).toContain('45:00');
  });

  it('discards active bake cleanly and returns to idle state', async () => {
    await renderScreen();

    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    await act(async () => {
      startBtn?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Krok 1 z 11');

    // Tap Odrzuć wypiek
    const discardBtn = findButtonByText(tree!.root, 'Odrzuć wypiek');
    expect(discardBtn).toBeDefined();

    await act(async () => {
      discardBtn?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Brak aktywnego wypieku');
    expect(getActiveBake()).toBeNull();
  });

  it('deletes bake log from history when delete button is pressed', async () => {
    const { saveBakeLog } = require('../data/sqlite-store');
    await saveBakeLog({
      id: 'bake_to_remove',
      recipeName: 'Chleb do skasowania',
      startedAt: Date.now() - 3600000,
      finishedAt: Date.now(),
      ratingStars: 4,
      notes: 'Zaraz zniknie',
    });

    await renderScreen();
    expect(extractCleanText(tree?.toJSON())).toContain('Chleb do skasowania');

    const deleteBtn = tree!.root.findByProps({ testID: 'delete-bake-log-bake_to_remove' });
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      await deleteBtn.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).not.toContain('Chleb do skasowania');
    const logs = await getBakeLogs();
    expect(logs.find((l: any) => l.id === 'bake_to_remove')).toBeUndefined();
  });

  it('completes bake with sensory evaluation (crumb, crust, taste) and persists to SQLite', async () => {
    await renderScreen();

    // Start bake
    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    await act(async () => {
      startBtn?.props.onPress();
    });

    // Jump directly to the last plan step (cooling)
    const step8Btn = tree!.root.findAll((n) => typeof n.props?.onPress === 'function').find((p) => {
      return extractCleanText(p.props.children).includes('Studzenie na kratce');
    });
    expect(step8Btn).toBeDefined();

    await act(async () => {
      step8Btn?.props.onPress();
    });

    // Tap Zakończ wypiek button on last step to open Finish Modal
    const finishTriggerBtn = tree!.root.findByProps({ testID: 'next-or-finish-step-btn' });
    await act(async () => {
      finishTriggerBtn.props.onPress();
    });

    const fullModalText = extractCleanText(tree?.toJSON());
    expect(fullModalText).toContain('Zakończ wypiek');
    expect(fullModalText).toContain('Struktura miękiszu');
    expect(fullModalText).toContain('Jakość skórki');
    expect(fullModalText).toContain('Profil smakowy');

    // Select crumb score 5
    const crumb5 = tree!.root.findByProps({ testID: 'crumb-score-5' });
    await act(async () => {
      crumb5.props.onPress();
    });

    // Select crust score 4
    const crust4 = tree!.root.findByProps({ testID: 'crust-score-4' });
    await act(async () => {
      crust4.props.onPress();
    });

    // Select taste profile 'sour'
    const tasteSour = tree!.root.findByProps({ testID: 'taste-sour' });
    await act(async () => {
      tasteSour.props.onPress();
    });

    // Save bake
    const saveHistoryBtn = findButtonByText(tree!.root, 'Zapisz w historii');
    await act(async () => {
      await saveHistoryBtn?.props.onPress();
    });

    const logs = await getBakeLogs();
    expect(logs.length).toBeGreaterThanOrEqual(1);
    const latest = logs[0];
    expect(latest.crumbScore).toBe(5);
    expect(latest.crustScore).toBe(4);
    expect(latest.tasteProfile).toBe('sour');
  });

  it('manages Two-Phase Dutch Oven baking with steam release alert and phase transition', async () => {
    jest.useFakeTimers();
    try {
      await renderScreen();

      // Start bake
      const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
      await act(async () => {
        startBtn?.props.onPress();
      });

      // Jump to the plan's bake stage (Wypiek z parą i rumienienie)
      const step8Btn = tree!.root.findAll((n) => typeof n.props?.onPress === 'function').find((p) => {
        return extractCleanText(p.props.children).includes('Wypiek z parą i rumienienie');
      });
      await act(async () => {
        step8Btn?.props.onPress();
      });

      // Verify Dutch oven phase card is visible with Phase 1 default (20 min)
      const phaseCard = tree!.root.findByProps({ testID: 'dutch-oven-phase-card' });
      expect(phaseCard).toBeDefined();

      let fullText = extractCleanText(tree?.toJSON());
      expect(fullText).toContain('Faza 1: Pod pokrywką');
      expect(fullText).toContain('240°C');
      expect(fullText).toContain('20:00');

      // Switch manually to Phase 2 (Bez pokrywki)
      const phase2Tab = tree!.root.findByProps({ testID: 'phase-tab-lid-off' });
      await act(async () => {
        phase2Tab.props.onPress();
      });

      fullText = extractCleanText(tree?.toJSON());
      expect(fullText).toContain('Faza 2: Bez pokrywki');
      expect(fullText).toContain('210°C');
      expect(fullText).toContain('25:00');

      // Switch back to Phase 1
      const phase1Tab = tree!.root.findByProps({ testID: 'phase-tab-lid-on' });
      await act(async () => {
        phase1Tab.props.onPress();
      });

      expect(extractCleanText(tree?.toJSON())).toContain('20:00');

      // Start timer in Phase 1
      const timerToggleBtn = findButtonByText(tree!.root, 'Start');
      await act(async () => {
        timerToggleBtn?.props.onPress();
      });

      // Advance timers by 20 minutes (1201 seconds)
      await act(async () => {
        jest.advanceTimersByTime(1201 * 1000);
      });

      // Steam gate alert banner appears
      const steamAlert = tree!.root.findByProps({ testID: 'steam-gate-alert' });
      expect(steamAlert).toBeDefined();
      expect(extractCleanText(tree?.toJSON())).toContain('Zdejmij pokrywkę');

      // Tap Rozpocznij Fazę 2
      const startPhase2Btn = tree!.root.findByProps({ testID: 'start-phase-2-btn' });
      await act(async () => {
        startPhase2Btn.props.onPress();
      });

      // Phase 2 is now active with 25:00
      fullText = extractCleanText(tree?.toJSON());
      expect(fullText).toContain('Faza 2: Bez pokrywki');
      expect(fullText).toContain('25:00');
    } finally {
      jest.useRealTimers();
    }
  });

  it('displays artisan bake statistics card when history contains logs', async () => {
    // Seed sample bakes
    await saveBakeLog({
      id: 'bake_test_1',
      recipeName: 'Chleb Wiejski 72%',
      startedAt: Date.now() - 1000 * 60 * 60 * 24,
      finishedAt: Date.now() - 1000 * 60 * 60 * 22,
      ratingStars: 5,
      crumbScore: 5,
      crustScore: 4,
      tasteProfile: 'balanced',
    });
    await saveBakeLog({
      id: 'bake_test_2',
      recipeName: 'San Francisco Sourdough',
      startedAt: Date.now() - 1000 * 60 * 60 * 48,
      finishedAt: Date.now() - 1000 * 60 * 60 * 46,
      ratingStars: 4,
      crumbScore: 4,
      crustScore: 5,
      tasteProfile: 'sour',
    });

    await renderScreen();

    const statsCard = tree!.root.findByProps({ testID: 'bake-stats-card' });
    expect(statsCard).toBeDefined();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Statystyki piekarni domowej');
    expect(fullText).toContain('Łącznie wypieków');
    expect(fullText).toContain('Średnia ocena');
    expect(fullText).toContain('Śr. miękisz');
    expect(fullText).toContain('Śr. skórka');
    expect(fullText).toContain('4.5'); // (5+4)/2 = 4.5
  });

  it('filters history logs when tapping taste profile chip', async () => {
    await saveBakeLog({
      id: 'bake_sour_1',
      recipeName: 'San Francisco Sourdough',
      startedAt: Date.now() - 1000 * 60 * 60 * 10,
      ratingStars: 5,
      crumbScore: 5,
      crustScore: 5,
      tasteProfile: 'sour',
    });
    await saveBakeLog({
      id: 'bake_mild_1',
      recipeName: 'Bagietka z Poolishem',
      startedAt: Date.now() - 1000 * 60 * 60 * 20,
      ratingStars: 4,
      crumbScore: 4,
      crustScore: 4,
      tasteProfile: 'mild',
    });

    await renderScreen();

    // Both logs are initially visible
    expect(extractCleanText(tree?.toJSON())).toContain('San Francisco Sourdough');
    expect(extractCleanText(tree?.toJSON())).toContain('Bagietka z Poolishem');

    // Tap sour taste filter chip
    const sourFilter = tree!.root.findByProps({ testID: 'filter-taste-sour' });
    expect(sourFilter).toBeDefined();

    await act(async () => {
      sourFilter.props.onPress();
    });

    const filteredText = extractCleanText(tree?.toJSON());
    expect(filteredText).toContain('San Francisco Sourdough');
    expect(filteredText).not.toContain('Bagietka z Poolishem');
  });

  it('renders crumb, crust and taste badges in history card', async () => {
    await saveBakeLog({
      id: 'bake_badge_test',
      recipeName: 'Tartine Style 80%',
      startedAt: Date.now() - 1000 * 60 * 60 * 5,
      ratingStars: 5,
      crumbScore: 5,
      crustScore: 5,
      tasteProfile: 'balanced',
    });

    await renderScreen();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Miękisz: 5/5');
    expect(fullText).toContain('Skórka: 5/5');
    expect(fullText).toContain('Zbalansowany');
  });

  it('triggers Bake Again when tapping Piecz ponownie button on a history card', async () => {
    await saveBakeLog({
      id: 'bake_again_test_id',
      recipeName: 'Wiejski chleb codzienny na zakwasie',
      startedAt: Date.now() - 1000 * 60 * 60 * 24,
      ratingStars: 5,
      crumbScore: 4,
      crustScore: 4,
    });

    await renderScreen();

    const bakeAgainBtn = tree!.root.findByProps({ testID: 'bake-again-btn-bake_again_test_id' });
    expect(bakeAgainBtn).toBeDefined();

    await act(async () => {
      await bakeAgainBtn.props.onPress();
    });

    const pending = getPendingRecipeToLoad();
    expect(pending).not.toBeNull();
    expect(pending?.name).toBe('Wiejski chleb codzienny na zakwasie');
    expect(pending?.formula.waterPercentage).toBe(68.0);
  });

  it('adjusts active timer in-flight (-10s, +10s, +5m, -5m)', async () => {
    setActiveBake({
      id: 'bake_timer_adjust',
      recipeName: 'Tartine 75%',
      startedAt: Date.now(),
      currentStageId: 'step_1',
      ambientTempC: 22,
      actualDdtC: 25,
    });

    await renderScreen();

    const plus10s = tree!.root.findByProps({ testID: 'adjust-time-plus-10s' });
    const minus10s = tree!.root.findByProps({ testID: 'adjust-time-minus-10s' });
    const plus5m = tree!.root.findByProps({ testID: 'adjust-time-plus-5m' });
    const minus5m = tree!.root.findByProps({ testID: 'adjust-time-minus-5m' });

    expect(plus10s).toBeDefined();
    expect(minus10s).toBeDefined();
    expect(plus5m).toBeDefined();
    expect(minus5m).toBeDefined();

    // First plan stage 6 h = 6:00:00. +10s -> 6:00:10
    await act(async () => {
      plus10s.props.onPress();
    });
    expect(extractCleanText(tree?.toJSON())).toContain('6:00:10');

    // -10s -> 6:00:00
    await act(async () => {
      minus10s.props.onPress();
    });
    expect(extractCleanText(tree?.toJSON())).toContain('6:00:00');

    // +5m -> 6:05:00
    await act(async () => {
      plus5m.props.onPress();
    });
    expect(extractCleanText(tree?.toJSON())).toContain('6:05:00');

    // -5m -> 6:00:00
    await act(async () => {
      minus5m.props.onPress();
    });
    expect(extractCleanText(tree?.toJSON())).toContain('6:00:00');
  });

  it('renders imperial units when unitSystem is set to imperial', async () => {
    const { setUnitSystem, _resetUnitSystemForTests } = require('../lib/unit-converter');
    setUnitSystem('imperial');

    setActiveBake({
      id: 'bake_test_imperial',
      recipeName: 'Mistrzowski Wiejski 80%',
      startedAt: Date.now(),
      currentStageId: 'step_1',
      ambientTempC: 22,
      actualDdtC: 25,
      calculatedRecipe: {
        targetDoughWeightGrams: 900,
        baseFlourWeightGrams: 500,
        flours: [{ name: 'Mąka pszenna chlebowa', percentage: 100, weightGrams: 500 }],
        waterGrams: 400,
        saltGrams: 10,
        starterGrams: 100,
        starterFlourGrams: 50,
        starterWaterGrams: 50,
        totalFlourGrams: 550,
        totalWaterGrams: 450,
        overallHydrationPercent: 81.82,
        sumCheckGrams: 910,
        isHighRye: false,
        yeastGrams: 0,
      },
    });

    await renderScreen();
    const fullText = extractCleanText(tree?.toJSON());

    // In imperial mode, temperatures are in °F and weights in oz / lb
    expect(fullText).toContain('lb');
    expect(fullText).toContain('oz');

    _resetUnitSystemForTests();
  });
});

