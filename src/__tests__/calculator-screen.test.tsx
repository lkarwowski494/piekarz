import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/index';
import {
  initDatabase,
  getActiveBake,
  setActiveBake,
  _resetMemStore,
  getRecipes,
  saveRecipe,
} from '../data/sqlite-store';

jest.setTimeout(20000);

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../lib/confirm', () => ({
  confirm: ({ onConfirm }: any) => onConfirm(),
  confirmDeleteRecipe: (_name: string, onConfirm: () => void) => onConfirm(),
}));

jest.mock('../lib/pdf-sheet-generator', () => ({
  exportRecipeSheetAsPdf: jest.fn().mockResolvedValue('file:///mock/recipe.pdf'),
  printRecipeSheetDirectly: jest.fn().mockResolvedValue(undefined),
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

describe('CalculatorScreen UI (app/(tabs)/index.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
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
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('renders correctly with master recipes and scale card', async () => {
    await renderScreen();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Kalkulator');
    expect(fullText).toContain('Receptury mistrzowskie');
    expect(fullText).toContain('Do miski na wagę');
    expect(fullText).toContain('Wiejski chleb');
  });

  it('switches between Loaves and Flour mass mode', async () => {
    await renderScreen();

    // Default Loaves mode
    expect(extractCleanText(tree?.toJSON())).toContain('Liczba bochenków i gramatura');

    // Tap Flour mass tab
    const flourTab = findButtonByText(tree!.root, 'Masa mąki');
    expect(flourTab).toBeDefined();

    await act(async () => {
      flourTab?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Masa mąki bazowej');

    // Tap back to Loaves tab
    const loavesTab = findButtonByText(tree!.root, 'Bochenki');
    expect(loavesTab).toBeDefined();

    await act(async () => {
      loavesTab?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('Liczba bochenków i gramatura');
  });

  it('updates dough weight when changing loaves count in Loaves mode', async () => {
    await renderScreen();

    expect(extractCleanText(tree?.toJSON())).toContain('1700 g');

    const threeLoavesBtn = findButtonByText(tree!.root, '3 szt.');
    expect(threeLoavesBtn).toBeDefined();

    await act(async () => {
      threeLoavesBtn?.props.onPress();
    });

    expect(extractCleanText(tree?.toJSON())).toContain('2550 g');
  });

  it('adjusts hydration percentage and difficulty badge when pressing +5%', async () => {
    await renderScreen();

    expect(extractCleanText(tree?.toJSON())).toContain('68.0%');

    const plusFiveBtn = findButtonByText(tree!.root, '+5%');
    expect(plusFiveBtn).toBeDefined();

    await act(async () => {
      plusFiveBtn?.props.onPress();
    });

    const updatedText = extractCleanText(tree?.toJSON());
    expect(updatedText).toContain('73.0%');
    expect(updatedText).toContain('Klasyk rzemieślniczy');
  });

  it('applies popular flour blend preset upon tapping', async () => {
    await renderScreen();

    const blendPreset = findButtonByText(tree!.root, '70% Pszenna + 20% Orkisz + 10% Żytnia');
    expect(blendPreset).toBeDefined();

    await act(async () => {
      blendPreset?.props.onPress();
    });

    const updatedText = extractCleanText(tree?.toJSON());
    expect(updatedText).toContain('Mąka orkiszowa jasna typ 630');
    expect(updatedText).toContain('Mąka żytnia razowa typ 2000');
  });

  it('transfers calculated recipe to Workbench and navigates upon tapping action button', async () => {
    await renderScreen();

    const startBakeBtn = findButtonByText(tree!.root, 'Rozpocznij wypiek na Stolnicy');
    expect(startBakeBtn).toBeDefined();

    await act(async () => {
      startBakeBtn?.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/stolnica');

    const active = getActiveBake();
    expect(active).not.toBeNull();
    expect(active?.calculatedRecipe).toBeDefined();
    expect(active?.calculatedRecipe?.targetDoughWeightGrams).toBeGreaterThan(0);
  });

  it('renders Bake Loss & Crumb Moisture card and displays live metrics', async () => {
    await renderScreen();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Strata wypiekowa i wilgotność miękiszu');
    expect(fullText).toContain('Upieczony bochenek');
    expect(fullText).toContain('Odparowana woda');
    expect(fullText).toContain('Szacowana wilgotność miękiszu');
    expect(fullText).toContain('14.0%');
  });

  it('updates baked weight when switching bake loss preset and stepping percentage', async () => {
    await renderScreen();

    // Find Baguettes preset (18%)
    const baguetteBtn = tree!.root.findByProps({ testID: 'bake-loss-preset-baguette_roll' });
    expect(baguetteBtn).toBeDefined();

    await act(async () => {
      baguetteBtn.props.onPress();
    });

    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('18.0%');

    // Step down by 0.5% with minus button
    const minusBtn = tree!.root.findByProps({ testID: 'bake-loss-minus' });
    expect(minusBtn).toBeDefined();

    await act(async () => {
      minusBtn.props.onPress();
    });

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('17.5%');
  });

  it('opens Settings and Backup modal when tapping settings gear in header', async () => {
    await renderScreen();

    const settingsBtn = tree!.root.findByProps({ testID: 'open-settings-btn' });
    expect(settingsBtn).toBeDefined();

    await act(async () => {
      settingsBtn.props.onPress();
    });

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Ustawienia');
    expect(fullText).toContain('Kopia zapasowa');
  });

  it('triggers copy recipe to clipboard when tapping copy recipe button', async () => {
    await renderScreen();

    const copyBtn = tree!.root.findByProps({ testID: 'copy-recipe-btn' });
    expect(copyBtn).toBeDefined();

    await act(async () => {
      await copyBtn.props.onPress();
    });

    expect(tree).toBeDefined();
  });

  it('clones active master recipe into an editable custom recipe', async () => {
    await renderScreen();

    const cloneBtn = tree!.root.findByProps({ testID: 'clone-recipe-btn' });
    expect(cloneBtn).toBeDefined();

    await act(async () => {
      await cloneBtn.props.onPress();
    });

    const recipes = await getRecipes();
    const cloned = recipes.find((r) => r.name.includes('(Kopia)'));
    expect(cloned).toBeDefined();
    expect(cloned?.isBuiltIn).toBe(false);

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('(Kopia)');
  });

  it('deletes custom recipe upon confirmation and selects default preset', async () => {
    await saveRecipe({
      id: 'custom_to_delete',
      name: 'Chleb do skasowania',
      formula: {
        flours: [{ name: 'Mąka T650', percentage: 100 }],
        waterPercentage: 70,
        saltPercentage: 2,
        starterPercentage: 20,
        targetDoughWeightGrams: 800,
      },
      targetDDT: 25,
      isBuiltIn: false,
      createdAt: Date.now(),
    });

    await renderScreen();

    let text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Chleb do skasowania');

    // Find delete button
    const deleteButtons = tree!.root.findAll((n) => typeof n.props?.onPress === 'function' && extractCleanText(n.props.children) === '✕');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      await deleteButtons[0].props.onPress();
    });

    const recipes = await getRecipes();
    expect(recipes.find((r) => r.id === 'custom_to_delete')).toBeUndefined();
  });

  it('switches preferment mode and displays artisan decomposition (Poolish / Biga)', async () => {
    await renderScreen();

    // Default mode is direct
    expect(tree!.root.findAll((n) => n.props?.testID === 'preferment-details-block')).toHaveLength(0);

    // Switch to Poolish
    const poolishChip = tree!.root.findByProps({ testID: 'preferment-type-poolish' });
    expect(poolishChip).toBeDefined();

    await act(async () => {
      poolishChip.props.onPress();
    });

    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Poolish');
    expect(fullText).toContain('Mąka w zaczynie');
    expect(fullText).toContain('Woda w zaczynie');

    // Change preferment % to 30%
    const thirtyPct = tree!.root.findByProps({ testID: 'preferment-pct-30' });
    await act(async () => {
      thirtyPct.props.onPress();
    });

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('30%');

    // Switch to Biga
    const bigaChip = tree!.root.findByProps({ testID: 'preferment-type-biga' });
    await act(async () => {
      bigaChip.props.onPress();
    });

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Biga');
  });

  it('opens custom flour blend builder, adjusts proportions, and applies custom blend', async () => {
    await renderScreen();

    // Find and open custom blend builder
    const openBtn = tree!.root.findByProps({ testID: 'open-blend-builder-btn' });
    expect(openBtn).toBeDefined();

    await act(async () => {
      openBtn.props.onPress();
    });

    // Check modal rendered
    const modal = tree!.root.findByProps({ testID: 'flour-blend-modal' });
    expect(modal).toBeDefined();

    // Adjust first flour percentage: -10%
    const minusBtn = tree!.root.findByProps({ testID: 'flour-minus-10-0' });
    await act(async () => {
      minusBtn.props.onPress();
    });

    // Rebalance with normalize
    const normalizeBtn = tree!.root.findByProps({ testID: 'normalize-blend-btn' });
    await act(async () => {
      normalizeBtn.props.onPress();
    });

    // Apply blend
    const applyBtn = tree!.root.findByProps({ testID: 'apply-blend-btn' });
    expect(applyBtn.props.disabled).toBe(false);

    await act(async () => {
      applyBtn.props.onPress();
    });

    // Verify calculator updated
    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Mieszanka mąk');
  });

  it('opens cost and yield batch calculator modal and displays cost metrics', async () => {
    await renderScreen();

    // Open cost modal
    const openCostBtn = tree!.root.findByProps({ testID: 'open-cost-modal-btn' });
    expect(openCostBtn).toBeDefined();

    await act(async () => {
      openCostBtn.props.onPress();
    });

    // Check modal rendered
    const modal = tree!.root.findByProps({ testID: 'cost-calculator-modal' });
    expect(modal).toBeDefined();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Kalkulator kosztów wypieku');
    expect(fullText).toContain('Koszt za bochenek');

    // Close modal
    const closeBtn = tree!.root.findByProps({ testID: 'close-cost-modal-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });
  });

  it('opens flour pantry inventory modal and checks recipe stock status', async () => {
    await renderScreen();

    // Open inventory modal
    const openInvBtn = tree!.root.findByProps({ testID: 'open-flour-inventory-btn' });
    expect(openInvBtn).toBeDefined();

    await act(async () => {
      openInvBtn.props.onPress();
    });

    // Check modal rendered
    const modal = tree!.root.findByProps({ testID: 'flour-inventory-modal' });
    expect(modal).toBeDefined();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Spiżarnia mąk (Magazyn)');
    expect(fullText).toContain('Twoje zapasy mąk');

    // Close modal
    const closeBtn = tree!.root.findByProps({ testID: 'close-inventory-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });
  });

  it('filters master recipes by category and displays artisan details card', async () => {
    await renderScreen();

    // Check default info card for initial master recipe (country loaf)
    const infoCard = tree!.root.findByProps({ testID: 'master-recipe-info-card' });
    expect(infoCard).toBeDefined();

    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Na zakwasie');
    expect(fullText).toContain('Pieczenie');
    expect(fullText).toContain('garnek żeliwny');

    // Switch category filter to Rye (Żytnie)
    const ryeFilterBtn = tree!.root.findByProps({ testID: 'category-filter-rye' });
    await act(async () => {
      ryeFilterBtn.props.onPress();
    });

    // Check that rye recipe chip is present
    const ryeChip = tree!.root.findByProps({ testID: 'preset-chip-rye_100_pan' });
    expect(ryeChip).toBeDefined();

    // Select Borodinsky rye recipe
    const borodinskyChip = tree!.root.findByProps({ testID: 'preset-chip-borodinsky_rye' });
    expect(borodinskyChip).toBeDefined();

    await act(async () => {
      borodinskyChip.props.onPress();
    });

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Chleb Borodyński');
    expect(fullText).toContain('foremka keksówka');
  });

  it('copies recipe JSON to clipboard and opens import modal', async () => {
    await renderScreen();

    // Export JSON button
    const exportJsonBtn = tree!.root.findByProps({ testID: 'export-recipe-json-btn' });
    expect(exportJsonBtn).toBeDefined();

    await act(async () => {
      exportJsonBtn.props.onPress();
    });

    // Open import modal
    const openImportBtn = tree!.root.findByProps({ testID: 'open-import-recipe-btn' });
    expect(openImportBtn).toBeDefined();

    await act(async () => {
      openImportBtn.props.onPress();
    });

    const importModal = tree!.root.findByProps({ testID: 'import-recipe-modal' });
    expect(importModal).toBeDefined();

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Importuj recepturę');

    // Close import modal
    const closeImportBtn = tree!.root.findByProps({ testID: 'close-import-btn' });
    await act(async () => {
      closeImportBtn.props.onPress();
    });
  });

  it('triggers exportRecipeSheetAsPdf when tapping print recipe PDF buttons', async () => {
    const pdfModule = require('../lib/pdf-sheet-generator');
    await renderScreen();

    const headerPrintBtn = tree!.root.findByProps({ testID: 'header-print-pdf-btn' });
    expect(headerPrintBtn).toBeDefined();

    await act(async () => {
      await headerPrintBtn.props.onPress();
    });

    expect(pdfModule.exportRecipeSheetAsPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        recipeName: expect.any(String),
        totalFlourGrams: expect.any(Number),
        waterGrams: expect.any(Number),
      })
    );

    const bottomPrintBtn = tree!.root.findByProps({ testID: 'print-recipe-pdf-btn' });
    expect(bottomPrintBtn).toBeDefined();

    await act(async () => {
      await bottomPrintBtn.props.onPress();
    });

    expect(pdfModule.exportRecipeSheetAsPdf).toHaveBeenCalledTimes(2);
  });

  it('renders imperial units when unitSystem is set to imperial', async () => {
    const { setUnitSystem, _resetUnitSystemForTests } = require('../lib/unit-converter');
    setUnitSystem('imperial');

    await renderScreen();
    const fullText = extractCleanText(tree?.toJSON());

    // In imperial mode, temperature is in °F and weights are in oz / lb
    expect(fullText).toContain('°F');
    expect(fullText).toContain('oz');

    _resetUnitSystemForTests();
  });
});


