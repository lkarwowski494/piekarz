import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwas';
import { initDatabase, getStarters, saveStarter } from '../data/sqlite-store';

jest.setTimeout(20000);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

jest.mock('../lib/confirm', () => ({
  confirmResetStarter: (onConfirm: () => void) => onConfirm(),
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

describe('ZakwasScreen UI Interactions (app/(tabs)/zakwas.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    jest.clearAllMocks();
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
      tree = renderer.create(<ZakwasScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('renders starter profile card and peak timer', async () => {
    await renderScreen();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Zakwas');
    expect(fullText).toContain('Bolesław');
    expect(fullText).toContain('Żytnia razowa typ 2000');
    expect(fullText).toContain('Szczyt aktywności (Peak Timer)');
    expect(fullText).toContain('Kalkulator dokarmiania');
  });

  it('logs feeding and updates lastFedAt in SQLite', async () => {
    await renderScreen();

    const feedBtn = findButtonByText(tree!.root, 'Zarejestruj dokarmienie');
    expect(feedBtn).toBeDefined();

    const beforeStarters = await getStarters();
    const oldFedAt = beforeStarters[0]?.lastFedAt;

    await act(async () => {
      feedBtn?.props.onPress();
    });

    const afterStarters = await getStarters();
    expect(afterStarters[0].lastFedAt).toBeDefined();
    expect(afterStarters[0].lastFedAt).toBeGreaterThanOrEqual(oldFedAt ?? 0);
  });

  it('recalculates feeding amounts when changing yield and ratio', async () => {
    await renderScreen();

    // Default 150g yield & 1:2:2 ratio -> 30g starter + 60g flour + 60g water
    let text = extractCleanText(tree?.toJSON());
    expect(text).toContain('30 g');
    expect(text).toContain('60 g');

    // Click 200g yield
    const twoHundredBtn = findButtonByText(tree!.root, '200 g');
    expect(twoHundredBtn).toBeDefined();

    await act(async () => {
      twoHundredBtn?.props.onPress();
    });

    // 200g & 1:2:2 -> 40g starter + 80g flour + 80g water
    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('40 g');
    expect(text).toContain('80 g');

    // Switch ratio to 1:1:1
    const oneToOneBtn = findButtonByText(tree!.root, '1:1:1');
    expect(oneToOneBtn).toBeDefined();

    await act(async () => {
      oneToOneBtn?.props.onPress();
    });

    // 200g & 1:1:1 -> ~67g each
    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('67 g');
  });

  it('evaluates biological safety flags and resets upon confirmation', async () => {
    await renderScreen();

    // Tap Kahm Yeast check button
    const kahmBtn = findButtonByText(tree!.root, 'Kahm Yeast');
    expect(kahmBtn).toBeDefined();

    await act(async () => {
      kahmBtn?.props.onPress();
    });

    let text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Kahm Yeast');

    // Tap Mold check button
    const moldBtn = findButtonByText(tree!.root, 'Pleśń');
    expect(moldBtn).toBeDefined();

    await act(async () => {
      moldBtn?.props.onPress();
    });

    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('ALARM: Wykryto niebezpieczną pleśń');

    // Tap Resetuj profil zakwasu
    const resetBtn = findButtonByText(tree!.root, 'Resetuj profil zakwasu');
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.props.onPress();
    });

    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Zakwas jest zdrowy i aktywny');
  });
});
