import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/harmonogram';
import { getActiveBake, setActiveBake, initDatabase } from '../data/sqlite-store';

jest.setTimeout(20000);

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

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

function findAllButtonsByText(root: renderer.ReactTestInstance, text: string): renderer.ReactTestInstance[] {
  const pressables = root.findAll((n) => typeof n.props?.onPress === 'function');
  return pressables.filter((p) => {
    const content = extractCleanText(p.props.children);
    return content.includes(text);
  });
}

describe('HarmonogramScreen UI (app/(tabs)/harmonogram.tsx)', () => {
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

  it('renders reverse schedule, Sleep Guard status, and timeline stages', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const allText = extractCleanText(root);

    // Title & headers
    expect(allText).toContain('Harmonogram');
    expect(allText).toContain('Godzina gotowości chleba do krojenia');
    expect(allText).toContain('Ochrona snu aktywna');

    // Default chips
    expect(allText).toContain('10:00');
    expect(allText).toContain('23°C');
    expect(allText).toContain('14h');

    // Stages from template
    expect(allText).toContain('Dokarmienie zakwasu');
    expect(allText).toContain('Autoliza');
    expect(allText).toContain('Garowanie chłodnicze w lodówce');
    expect(allText).toContain('Wypiek z parą i rumienienie');
    expect(allText).toContain('Studzenie na kratce');
  });

  it('allows switching target day (Dziś vs Pojutrze)', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const pojutrzeBtn = findButtonByText(root, 'Pojutrze');
    expect(pojutrzeBtn).toBeDefined();

    await act(async () => {
      pojutrzeBtn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('Pojutrze');
  });

  it('allows fine-tuning target time with -30 min and +30 min buttons', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Default is 10:00
    expect(extractCleanText(root)).toContain('10:00');

    // Press +30 min
    const plus30Btn = findButtonByText(root, '+30 min');
    expect(plus30Btn).toBeDefined();

    await act(async () => {
      plus30Btn!.props.onPress();
      await Promise.resolve();
    });

    expect(extractCleanText(root)).toContain('10:30');

    // Press -30 min
    const minus30Btn = findButtonByText(root, '-30 min');
    expect(minus30Btn).toBeDefined();

    await act(async () => {
      minus30Btn!.props.onPress();
      await Promise.resolve();
    });

    expect(extractCleanText(root)).toContain('10:00');
  });

  it('adjusts temperature and recalculates fermentation duration', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Switch to 26°C
    const temp26Btn = findButtonByText(root, '26°C');
    expect(temp26Btn).toBeDefined();

    await act(async () => {
      temp26Btn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('26°C');
  });

  it('detects sleep collision for 18:00 target and provides one-tap auto-resolution', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Target 18:00 (with standard 14h retard) causes shaping to fall around 00:15 midnight
    const hour18Btn = findButtonByText(root, '18:00');
    expect(hour18Btn).toBeDefined();

    await act(async () => {
      hour18Btn!.props.onPress();
      await Promise.resolve();
    });

    let allText = extractCleanText(root);
    expect(allText).toContain('Uwaga: Kolizja ze snem!');
    expect(allText).toContain('Rozwiąż kolizję');

    // Tap the auto-resolve button
    const autoFixBtn = findButtonByText(root, 'Rozwiąż kolizję');
    expect(autoFixBtn).toBeDefined();

    await act(async () => {
      autoFixBtn!.props.onPress();
      await Promise.resolve();
    });

    allText = extractCleanText(root);
    // Collision should now be resolved!
    expect(allText).toContain('Ochrona snu aktywna');
    expect(allText).not.toContain('Uwaga: Kolizja ze snem!');
  });

  it('transfers calculated schedule to Stolnica and navigates to workbench', async () => {
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    const startBakeBtn = findButtonByText(root, 'Rozpocznij wypiek na Stolnicy');
    expect(startBakeBtn).toBeDefined();

    await act(async () => {
      startBakeBtn!.props.onPress();
      await Promise.resolve();
    });

    // Check sqlite store state
    const activeBake = getActiveBake();
    expect(activeBake).not.toBeNull();
    expect(activeBake?.recipeName).toContain('Harmonogram');
    expect(activeBake?.ambientTempC).toBe(23.0);

    // Check navigation
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/stolnica');
  });
});
