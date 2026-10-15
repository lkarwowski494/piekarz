import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import {
  initDatabase,
  getActiveBake,
  setActiveBake,
  getBakeLogs,
} from '../data/sqlite-store';

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
    jest.clearAllMocks();
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
    expect(activeText).toContain('Krok 1 z 8');
    expect(activeText).toContain('Autoliza');
    expect(activeText).toContain('45:00');
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

    // Initial timer is 45:00 and paused
    expect(extractCleanText(tree?.toJSON())).toContain('45:00');
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

    // 45 min + 5 min = 50:00
    expect(extractCleanText(tree?.toJSON())).toContain('50:00');

    // Tap Reset
    const resetBtn = findButtonByText(tree!.root, 'Resetuj');
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.props.onPress();
    });

    // Back to 45:00
    expect(extractCleanText(tree?.toJSON())).toContain('45:00');
  });

  it('advances to next step when tapping Następny krok', async () => {
    await renderScreen();

    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    await act(async () => {
      startBtn?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Autoliza');

    // Tap Następny krok
    const nextBtn = findButtonByText(tree!.root, 'Następny krok');
    expect(nextBtn).toBeDefined();

    await act(async () => {
      nextBtn?.props.onPress();
    });

    // Advanced to step 2: Mieszanie i zaszczepienie (15 min)
    const text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Krok 2 z 8');
    expect(text).toContain('Mieszanie i zaszczepienie');
    expect(text).toContain('15:00');
  });

  it('discards active bake cleanly and returns to idle state', async () => {
    await renderScreen();

    const startBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek');
    await act(async () => {
      startBtn?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Krok 1 z 8');

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
});
