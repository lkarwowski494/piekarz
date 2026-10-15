import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwas';
import { initDatabase, getStarters, saveStarter, _resetMemStore } from '../data/sqlite-store';

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
  confirmDeleteStarter: (_name: string, onConfirm: () => void) => onConfirm(),
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
    _resetMemStore();
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

  it('copies feeding details to clipboard when copy button is pressed', async () => {
    const Clipboard = require('expo-clipboard');
    await renderScreen();

    const copyBtn = tree!.root.findByProps({ testID: 'copy-feeding-btn' });
    expect(copyBtn).toBeDefined();

    await act(async () => {
      copyBtn.props.onPress();
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalled();
    const copiedText = (Clipboard.setStringAsync as jest.Mock).mock.calls[0][0];
    expect(copiedText).toContain('Bolesław');
    expect(copiedText).toContain('1. 🫙 Zakwas matka: 30 g');
    expect(copiedText).toContain('2. 🌾 Mąka (Żytnia razowa typ 2000): 60 g');
    expect(copiedText).toContain('3. 💧 Woda: 60 g');
  });

  it('allows adding a new starter via modal and switches active starter', async () => {
    await renderScreen();

    const addBtn = tree!.root.findByProps({ testID: 'add-starter-btn' });
    expect(addBtn).toBeDefined();

    await act(async () => {
      addBtn.props.onPress();
    });

    const nameInput = tree!.root.findByProps({ testID: 'new-starter-name-input' });
    const flourInput = tree!.root.findByProps({ testID: 'new-starter-flour-input' });
    const saveBtn = tree!.root.findByProps({ testID: 'save-new-starter-btn' });

    await act(async () => {
      nameInput.props.onChangeText('San Francisco White');
      flourInput.props.onChangeText('Mąka pszenna chlebowa t750');
    });

    await act(async () => {
      saveBtn.props.onPress();
    });

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('San Francisco White');
    expect(fullText).toContain('Mąka pszenna chlebowa t750');

    const starters = await getStarters();
    expect(starters.length).toBe(2);
    expect(starters.some((s) => s.name === 'San Francisco White')).toBe(true);
  });

  it('switches active starter when clicking a starter pill', async () => {
    // Add second starter first
    await saveStarter({
      id: 'starter_francisco',
      name: 'San Francisco White',
      flourType: 'Pszenna t750',
      hydration: 100,
      birthDate: Date.now(),
      storageState: 'ROOM_TEMP',
      lastFedAt: Date.now(),
    });

    await renderScreen();

    // Select second starter
    const secondPill = tree!.root.findByProps({ testID: 'select-starter-starter_francisco' });
    expect(secondPill).toBeDefined();

    await act(async () => {
      secondPill.props.onPress();
    });

    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('San Francisco White');

    // Switch back to Bolesław
    const boleslawPill = tree!.root.findByProps({ testID: 'select-starter-starter_default' });
    expect(boleslawPill).toBeDefined();

    await act(async () => {
      boleslawPill.props.onPress();
    });

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Bolesław');
  });

  it('allows deleting a starter when multiple exist, but prevents deletion when only one remains', async () => {
    // Add second starter
    await saveStarter({
      id: 'starter_extra',
      name: 'Zakwas Tymczasowy',
      flourType: 'Orkiszowa',
      hydration: 100,
      birthDate: Date.now(),
      storageState: 'ROOM_TEMP',
      lastFedAt: Date.now(),
    });

    await renderScreen();

    // Select the temporary starter
    const tempPill = tree!.root.findByProps({ testID: 'select-starter-starter_extra' });
    await act(async () => {
      tempPill.props.onPress();
    });

    // Open edit modal
    const editBtn = tree!.root.findByProps({ testID: 'edit-profile-btn' });
    await act(async () => {
      editBtn.props.onPress();
    });

    // Delete button should be visible because startersList.length > 1
    const deleteBtn = tree!.root.findByProps({ testID: 'delete-starter-btn' });
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      deleteBtn.props.onPress();
    });

    const starters = await getStarters();
    expect(starters.length).toBe(1);
    expect(starters[0].name).toContain('Bolesław');

    // Re-open edit modal on the last remaining starter
    await act(async () => {
      editBtn.props.onPress();
    });

    // Delete button should NOT exist when only 1 starter remains
    const deleteBtnAfter = tree!.root.findAll((n) => n.props?.testID === 'delete-starter-btn');
    expect(deleteBtnAfter.length).toBe(0);
  });
});
