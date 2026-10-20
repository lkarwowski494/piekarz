import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ActionSheetIOS } from 'react-native';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
// Lista receptur jest ekranem głównym zakładki, ekran receptury otwiera się z niej (§11c 106) [M1-audytor-generalny-106]
import RecepturyLista from '../../app/(tabs)/receptury/index';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import {
  initDatabase,
  getActiveBake,
  setActiveBake,
  _resetMemStore,
  getRecipes,
  saveRecipe,
  setBakerRitualProfile,
} from '../data/sqlite-store';
import { MASTER_RECIPES } from '../recipes/presets';
import { biezaceMenuReceptury } from '../lib/menu-receptury';
import { recepturaPlanu } from '../lib/plan-receptury';
import { ImportRecepturySection } from '../components/settings/ImportRecepturySection';

jest.setTimeout(20000);

/** Pozycja menu „Więcej” receptury (057): przycisk jest w pasku nawigacji, akcje rejestruje ekran. */
const pozycjaMenu = (id: string) => {
  const p = biezaceMenuReceptury().find((x) => x.id === id);
  if (!p) throw new Error(`brak pozycji menu ${id}`);
  return p;
};

// F-46 i F-48 PÓŹNIEJ: wejścia ukryte w aplikacji (D-034, test wejscia-pozniej); tu sprawdzamy kod, który
// zostaje, z włączonymi wejściami [M1-audytor-generalny-032].
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));

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

describe('CalculatorScreen UI (app/(tabs)/receptury/index.tsx)', () => {
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

  const renderScreen = async (el: React.ReactElement = <CalculatorScreen />) => {
    await act(async () => {
      tree = renderer.create(el);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  // Mąki, proporcje, tryb i zaczyn: arkusz „Składniki” z akcji „Zmień składniki” (§11c 106) [M1-audytor-generalny-106]
  const openIngredients = async () => {
    const btn = tree!.root.findByProps({ testID: 'edit-ingredients-btn' });
    await act(async () => {
      btn.props.onPress();
    });
  };
  const press = async (testID: string) => {
    const el = tree!.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function')[0];
    await act(async () => {
      el.props.onPress();
    });
  };
  const typeInto = async (testID: string, value: string) => {
    const pole = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID)[0];
    await act(async () => {
      pole.props.onFocus?.();
      pole.props.onChangeText(value);
    });
    await act(async () => {
      pole.props.onBlur?.({});
    });
  };
  /** Wybór z menu systemowego (arkusz działań iOS) po naciśnięciu wiersza arkusza „Składniki”. */
  const chooseFromMenu = async (testID: string, label: string) => {
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    await press(testID);
    const [opcje, wybor] = sheet.mock.calls[sheet.mock.calls.length - 1];
    const i = (opcje.options as string[]).indexOf(label);
    expect({ label, jest: i >= 0 }).toEqual({ label, jest: true });
    await act(async () => wybor(i));
    sheet.mockRestore();
  };

  // Temperatura wody i hydratacja: arkusz z akcji „Temperatura wody” (057) [M1-audytor-generalny-057]
  const openWaterTemp = async () => {
    const btn = tree!.root.findByProps({ testID: 'water-temp-btn' });
    await act(async () => {
      btn.props.onPress();
    });
  };

  // Zapisany styl z dawnego powitania zostaje w bazie, ale nie ustawia filtru: bez wyboru na Starcie
  // lista zaczyna od „Wszystkie” [M1-audytor-generalny-101; BR-START-001] (wcześniej filtr ze stylu, 032)
  it('a saved sourdough purist style no longer sets the filter: the list starts on "all"', async () => {
    await setBakerRitualProfile('sourdough_purist');
    await renderScreen(<RecepturyLista />);
    await act(async () => {
      await Promise.resolve();
    });
    // Ten sam testID ma element złożony i natywny: liczymy unikalne; wiersze listy zamiast chipów (§11c 106)
    const chips = () => [
      ...new Set(
        tree!.root
          .findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('recipe-row-'))
          .map((n) => String(n.props.testID))
      ),
    ];
    expect(chips()).toHaveLength(MASTER_RECIPES.length);
    await act(async () => {
      tree!.root.findByProps({ testID: 'category-filter-all' }).props.onPress();
    });
    expect(chips()).toHaveLength(MASTER_RECIPES.length);
  });

  it('renders correctly with master recipes and scale card', async () => {
    await renderScreen();

    const fullText = extractCleanText(tree?.toJSON());
    // „Do miski” jako lista grupowana; nazwa receptury jest tytułem paska nawigacji (§11c 106)
    expect(fullText).toContain('Do miski (odhaczaj przy ważeniu)');
    expect(fullText).toContain('Razem 1700 g');
    expect(fullText).toContain('O recepturze');
  });

  // Tryb liczenia wybiera się w arkuszu „Składniki” („Ilości liczę od”), ekran pokazuje wiersze trybu (§11c 106)
  it('switches between Loaves and Flour mass mode', async () => {
    await renderScreen();

    // Default Loaves mode
    expect(tree!.root.findAllByProps({ testID: 'loaves-increment-btn' }).length).toBeGreaterThan(0);

    await openIngredients();
    await press('calc-mode-flour');
    expect(tree!.root.findAllByProps({ testID: 'flour-weight-input' }).length).toBeGreaterThan(0);
    expect(tree!.root.findAllByProps({ testID: 'loaves-increment-btn' })).toHaveLength(0);
    expect(extractCleanText(tree?.toJSON())).toContain('Masa mąki');

    await press('calc-mode-loaves');
    expect(tree!.root.findAllByProps({ testID: 'loaves-increment-btn' }).length).toBeGreaterThan(0);
    expect(extractCleanText(tree?.toJSON())).toContain('Masa bochenka');
  });

  it('updates dough weight when changing loaves count in Loaves mode', async () => {
    await renderScreen();

    expect(extractCleanText(tree?.toJSON())).toContain('1700 g');

    // Chipy „1–4 szt.” zniknęły: ta sama wartość co stepper (§11c 106)
    await press('loaves-increment-btn');

    expect(extractCleanText(tree?.toJSON())).toContain('2550 g');
  });

  // Woda % w arkuszu „Składniki”, „Proporcje (procent mąki)” (§11c 106); dawniej stepper w arkuszu temperatury
  it('adjusts hydration percentage and difficulty badge when typing water 73%', async () => {
    await renderScreen();
    await openIngredients();

    expect(extractCleanText(tree?.toJSON())).toContain('68%');

    await typeInto('water-pct-input', '73');

    const updatedText = extractCleanText(tree?.toJSON());
    expect(updatedText).toContain('73%');
    expect(updatedText).toContain('Klasyk rzemieślniczy');
  });

  it('applies popular flour blend preset from the system menu', async () => {
    await renderScreen();
    await openIngredients();

    await chooseFromMenu('flour-blend-menu-btn', '70% Pszenna + 20% Orkisz + 10% Żytnia');

    const updatedText = extractCleanText(tree?.toJSON());
    expect(updatedText).toContain('Mąka orkiszowa jasna typ 630');
    expect(updatedText).toContain('Mąka żytnia razowa typ 2000');
  });

  // 057 (słownik §5): „Ułóż plan” prowadzi do planu wypieku z tą recepturą; wypiek z ilościami zapisuje
  // „Zacznij wypiek” na planie (src/__tests__/receptura-akcje-057.test.tsx, także actualDdtC bez zgadywania)
  it('transfers calculated recipe to the bake plan and navigates upon tapping action button', async () => {
    await renderScreen();

    const makePlanBtn = findButtonByText(tree!.root, 'Ułóż plan');
    expect(makePlanBtn).toBeDefined();

    await act(async () => {
      makePlanBtn?.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith('/receptury/harmonogram');
    expect(getActiveBake()).toBeNull();

    const plan = recepturaPlanu();
    expect(plan).not.toBeNull();
    expect(plan?.calculatedRecipe).toBeDefined();
    expect(plan?.calculatedRecipe.targetDoughWeightGrams).toBeGreaterThan(0);
  });

  // F-48 strata piecowa: bez miejsca w 1.0 (§11c 106: akordeon znika, wejście PÓŹNIEJ ukryte); nawet z widocznymi
  // wejściami ani ekran receptury, ani arkusz „Składniki” nie mają sekcji straty [M1-audytor-generalny-106]
  it('has no bake loss section on the recipe screen or in the ingredients sheet (F-48 LATER, no place in 1.0)', async () => {
    await renderScreen();
    await openIngredients();
    const ids = tree!.root.findAll((n) => typeof n.props?.testID === 'string').map((n) => String(n.props.testID));
    expect(ids.filter((id) => id.startsWith('bake-loss-'))).toEqual([]);
    expect(extractCleanText(tree?.toJSON())).not.toContain('Strata wypiekowa i wilgotność miękiszu');
  });

  // Ustawienia przeniesione na „Dziś” (D-051 2a); otwarcie z kopią zapasową: src/__tests__/start-co-dzis.test.tsx [M1-audytor-generalny-101]
  it('Receptury nie mają przycisku Ustawień (ustawienia z „Dziś”)', async () => {
    await renderScreen();
    expect(tree!.root.findAllByProps({ testID: 'open-settings-btn' })).toHaveLength(0);
  });

  it('triggers copy recipe to clipboard when tapping copy recipe button', async () => {
    await renderScreen();

    const copyBtn = pozycjaMenu('copy-recipe-btn');
    expect(copyBtn.etykieta).toBe('Kopiuj jako tekst');

    await act(async () => {
      copyBtn.akcja();
    });

    expect(tree).toBeDefined();
  });

  // 089: „Klonuj recepturę” to ta sama akcja co „Zapisz jako moją” (słownik §5) — jeden przycisk zapisu receptury
  it('has one save-as-mine action and no separate clone action', async () => {
    await renderScreen();

    expect(tree!.root.findAllByProps({ testID: 'clone-recipe-btn' })).toHaveLength(0);
    const saveBtn = tree!.root.findByProps({ testID: 'save-custom-recipe-btn' });
    expect(extractCleanText(saveBtn.props.children)).toContain('Zapisz jako moją');
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

    // Własne receptury są na liście receptur (grupa „Moje receptury”, §11c 106); usuwanie z pytaniem jak dotąd
    await renderScreen(<RecepturyLista />);

    const text = extractCleanText(tree?.toJSON());
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

  // Zaczyn w arkuszu „Składniki”: „Rodzaj” i „Mąka w zaczynie” z menu systemowego; „Do miski” w dwóch grupach (§11c 106)
  it('switches preferment mode and displays artisan decomposition (Poolish / Biga)', async () => {
    await renderScreen();
    await openIngredients();

    // Default mode is direct
    expect(tree!.root.findAll((n) => n.props?.testID === 'do-miski-zaczyn')).toHaveLength(0);

    await chooseFromMenu('preferment-type-btn', 'poolish');

    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Zaczyn: poolish');
    expect(fullText).toContain('Mąka w zaczynie');
    expect(tree!.root.findAll((n) => n.props?.testID === 'scale-item-preferment-water').length).toBeGreaterThan(0);

    // Change preferment % to 30%
    await chooseFromMenu('preferment-flour-btn', '30 %');

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('30 %');

    await chooseFromMenu('preferment-type-btn', 'biga');

    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Zaczyn: biga');
  });

  // Mąki edytuje się w arkuszu „Składniki” (pola procentu, „Dodaj mąkę” z menu); zastępuje edytor mieszanki (§11c 106)
  it('edits flour percentages in the ingredients sheet, warns until the flours make 100%, and adds a flour', async () => {
    await renderScreen();
    await openIngredients();

    await typeInto('flour-pct-input-0', '70');
    expect(tree!.root.findAll((n) => n.props?.testID === 'flour-sum-warning').length).toBeGreaterThan(0);

    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    await press('add-flour-btn');
    const [opcje, wybor] = sheet.mock.calls[0];
    expect((opcje.options as string[]).length).toBeGreaterThan(1);
    await act(async () => wybor(0));
    sheet.mockRestore();

    expect(tree!.root.findAll((n) => n.props?.testID === 'flour-sum-warning')).toHaveLength(0);
    expect(tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'flour-pct-input-2')).toHaveLength(1);
    expect(tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'scale-item-flour-2')).toHaveLength(1);
  });

  // Powitanie z wyborem stylu zastąpił Start „Co dziś robisz?” (F-68, design-spec §10: bez intro) [M1-audytor-generalny-101]
  it('first launch shows no onboarding modal on Receptury (Start replaces it)', async () => {
    await renderScreen();
    expect(tree!.root.findAllByProps({ testID: 'onboarding-pref-purist' })).toHaveLength(0);
    expect(tree!.root.findAllByProps({ testID: 'onboarding-start-btn' })).toHaveLength(0);
  });

  it('opens flour pantry inventory modal and checks recipe stock status', async () => {
    await renderScreen();
    // Jedno wejście spiżarni (po powrocie F-30): grupa „Mąki” w arkuszu „Składniki” (dawniej akordeon, §11c 106)
    await openIngredients();

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

  it('filters master recipes by category and displays artisan details card (BR-RECP-001 Wybór receptury bazowej)', async () => {
    // Szczegóły receptury bazowej: sekcja „O recepturze” na ekranie receptury (§11c 106)
    await renderScreen();
    expect(tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'recipe-about')).toHaveLength(1);
    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Pieczenie');
    expect(fullText).toContain('garnek żeliwny');
    act(() => tree!.unmount());

    // Filtr i wybór receptury: lista receptur (kategoria w podpisie wiersza)
    await renderScreen(<RecepturyLista />);
    expect(extractCleanText(tree?.toJSON())).toContain('Na zakwasie');
    await press('category-filter-rye');
    expect(tree!.root.findAll((n) => n.props?.testID === 'recipe-row-rye_100_pan').length).toBeGreaterThan(0);
    await press('recipe-row-borodinsky_rye');
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/receptury/receptura', params: { nazwa: expect.stringContaining('Chleb Borodyński') } });
    act(() => tree!.unmount());

    // Ekran receptury wczytuje wybraną recepturę
    await renderScreen();
    fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('foremka keksówka');
  });

  it('copies recipe JSON to clipboard and opens import modal', async () => {
    await renderScreen();

    // „Udostępnij plik receptury” w menu „Więcej” (057)
    const exportJsonBtn = pozycjaMenu('export-recipe-json-btn');

    await act(async () => {
      exportJsonBtn.akcja();
    });

    // Import receptury tylko w Ustawieniach (F-33, 057): na ekranie receptury nie ma wejścia importu
    expect(tree!.root.findAllByProps({ testID: 'open-import-recipe-btn' })).toHaveLength(0);
    act(() => tree!.unmount());
    await act(async () => {
      tree = renderer.create(<ImportRecepturySection />);
    });
    const openImportBtn = tree!.root.findByProps({ testID: 'import-recipe-json-btn' });

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

  // Jedno wejście „Drukuj” z wyborem karty (BR-DRUK-001): dawne dwa przyciski druku karty
  // (nagłówek receptur i akcje) zastąpione jednym [M1-audytor-generalny-032]
  it('triggers exportRecipeSheetAsPdf when choosing the A4 recipe card in the print menu', async () => {
    const pdfModule = require('../lib/pdf-sheet-generator');
    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await renderScreen();

    expect(tree!.root.findAllByProps({ testID: 'header-print-pdf-btn' })).toHaveLength(0);
    // Druk (po powrocie F-50) jest pozycją menu „Więcej” receptury (057)
    expect(tree!.root.findAllByProps({ testID: 'print-menu-btn' })).toHaveLength(0);
    const printBtn = pozycjaMenu('print-menu-btn');

    await act(async () => {
      printBtn.akcja();
    });
    const menu = alertSpy.mock.calls.find((c: unknown[]) => c[0] === 'Drukuj');
    const card = (menu![2] as { text: string; onPress: () => void }[]).find((b) => b.text === 'Karta receptury A4');
    await act(async () => {
      await card!.onPress();
    });

    expect(pdfModule.exportRecipeSheetAsPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        recipeName: expect.any(String),
        totalFlourGrams: expect.any(Number),
        waterGrams: expect.any(Number),
      })
    );
    expect(pdfModule.exportRecipeSheetAsPdf).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('renders imperial units when unitSystem is set to imperial', async () => {
    const { setUnitSystem, _resetUnitSystemForTests } = require('../lib/unit-converter');
    setUnitSystem('imperial');

    await renderScreen();
    await openWaterTemp();
    const fullText = extractCleanText(tree?.toJSON());

    // In imperial mode, temperature is in °F and weights are in oz / lb
    expect(fullText).toContain('°F');
    expect(fullText).toContain('oz');

    _resetUnitSystemForTests();
  });
});


