import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { initDatabase, getStarters, saveStarter, _resetMemStore } from '../data/sqlite-store';

import { zUprawnieniem } from '../../tests/helpers/platnosci';
jest.setTimeout(20000);

// F-47 i F-49 PÓŹNIEJ: wejścia ukryte w aplikacji (D-034, test wejscia-pozniej); tu sprawdzamy kod, który
// zostaje, z włączonymi wejściami [M1-audytor-generalny-032].
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));

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

jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
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

describe('ZakwasScreen UI Interactions (app/(tabs)/zakwasy/index.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
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
    expect(fullText).toContain('Szczyt aktywności');
    expect(fullText).toContain('Ilości do dokarmienia');
  });

  it('logs feeding and updates lastFedAt in SQLite', async () => {
    await renderScreen();

    const feedBtn = findButtonByText(tree!.root, 'Zapisz dokarmienie');
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

  it('evaluates biological safety flags and resets upon confirmation (BR-ZAKW-004 Biały nalot)', async () => {
    await renderScreen();

    // [M1-audytor-generalny-013] DEC-10 (a): przyciski i werdykty z docs/tresci/pl/zakwas-bezpieczenstwo.md;
    // wcześniej test oczekiwał werdyktu „Kahm Yeast” (bezpieczny kożuch) i „Zakwas jest zdrowy”.
    let text = extractCleanText(tree?.toJSON());
    expect(text).toContain('W razie wątpliwości wyrzuć zakwas.');
    expect(text).toContain('Nie zaznaczono żadnego objawu');
    for (const label of [
      'Zaznacz, co widzisz albo czujesz w słoiku.',
      'Płyn na powierzchni o zapachu alkoholu (hooch)',
      'Biały nalot lub kożuch na powierzchni',
      'Puszysty nalot w dowolnym kolorze, także biały',
      'Różowe, pomarańczowe lub inne przebarwienia, smugi albo plamy',
      'Nieprzyjemny, zgniły zapach',
    ]) {
      expect(text).toContain(label);
    }

    // Tap white film check button
    const filmBtn = findButtonByText(tree!.root, 'Biały nalot lub kożuch');
    expect(filmBtn).toBeDefined();

    await act(async () => {
      filmBtn?.props.onPress();
    });

    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Wyrzuć zakwas');

    // Tap colored spots and rotten smell (nowe przyciski)
    for (const label of ['Różowe, pomarańczowe', 'zgniły zapach', 'Puszysty nalot']) {
      const btn = findButtonByText(tree!.root, label);
      expect(btn).toBeDefined();
      await act(async () => {
        btn?.props.onPress();
      });
    }

    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Pleśń może sięgać w głąb zakwasu');

    // Tap Resetuj profil zakwasu
    const resetBtn = findButtonByText(tree!.root, 'Zacznij od nowa');
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.props.onPress();
    });

    text = extractCleanText(tree?.toJSON());
    expect(text).toContain('Nie zaznaczono żadnego objawu');
    expect(text).not.toContain('zdrowy');
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
    expect(copiedText).toContain('1. Zakwas matka: 30 g');
    expect(copiedText).toContain('2. Mąka (Żytnia razowa typ 2000): 60 g');
    expect(copiedText).toContain('3. Woda: 60 g');
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

  it('allows deleting a starter when multiple exist, but prevents deletion when only one remains (BR-ZAKW-001 Usunięcie zakwasu)', async () => {
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

  // W lodówce okna szczytu nie ma (M1-audytor-generalny-044); domyślny zakwas jest w lodówce
  it('hides the peak window for a starter stored in the fridge', async () => {
    await renderScreen();
    expect(tree!.root.findAll((n) => n.props?.testID === 'peak-prediction-box')).toHaveLength(0);
  });

  // Zakwas na blacie: czas od dokarmienia bez godziny szczytu, dopóki progi nie mają źródła (OP-39, F-24)
  // [M1-audytor-generalny-130; 01-odkrywanie-501] — wcześniej ten test utrwalał okno szczytu dla blatu
  it('hides the peak window for a starter on the counter too (BR-ZAKW-003 Przewidywanie z godzin)', async () => {
    const [first] = await getStarters();
    await saveStarter({ ...first, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 2 * 3_600_000 });
    await renderScreen();

    expect(tree!.root.findAll((n) => n.props?.testID === 'peak-prediction-box')).toHaveLength(0);
    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).not.toContain('Szacowane okno szczytu:');
    expect(fullText).toMatch(/od dokarmienia/);
    // wybór temperatury zostaje (faza na odznace) i nadal działa
    await act(async () => {
      tree!.root.findByProps({ testID: 'temp-chip-28' }).props.onPress();
    });
    expect(extractCleanText(tree?.toJSON())).toContain('Temperatura otoczenia: 28°C');
  });

  // Dojrzały zakwas bez podwojenia po 8 h od dokarmienia: rada karmienia co 12 h (RD-24-W3, ZAK-ZAL-007)
  // [M1-audytor-generalny-130; 01-odkrywanie-501]
  it('after 8.5 h without doubling the card advises feeding every 12 h (BR-ZAKW-003 Brak podwojenia w 8 h)', async () => {
    const [first] = await getStarters();
    await saveStarter({ ...first, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 8.5 * 3_600_000 });
    await renderScreen();
    expect(extractCleanText(tree?.toJSON())).toContain('Dokarmiaj dalej co 12 godzin, aż zakwas podwoi objętość w ciągu 6–8 godzin po dokarmieniu.');

    act(() => tree?.unmount());
    await saveStarter({ ...first, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 6 * 3_600_000 });
    await renderScreen();
    expect(extractCleanText(tree?.toJSON())).not.toContain('Dokarmiaj dalej co 12 godzin');
  });

  it('opens and closes Starter & Lievito Madre Converter modal', async () => {
    await renderScreen();

    const openConverterBtn = tree!.root.findByProps({ testID: 'open-converter-btn' });
    expect(openConverterBtn).toBeDefined();

    // Tap open converter
    await act(async () => {
      openConverterBtn.props.onPress();
    });

    const modal = tree!.root.findByProps({ testID: 'starter-converter-modal' });
    expect(modal).toBeDefined();

    let fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Konwerter zakwasu & Lievito Madre');
    expect(fullText).toContain('Zamiennik w przepisie');

    // Tap close
    const closeBtn = tree!.root.findByProps({ testID: 'close-converter-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    // Modal should now be closed (visible: false)
    const modalAfter = tree!.root.findAll((n) => n.props?.testID === 'starter-converter-modal');
    expect(modalAfter.length).toBe(0);
  });

  // Etykieta słoika drukowana z „Drukuj” w Kalkulatorze (BR-DRUK-001); asercje o danych etykiety
  // zostają, wejście na tym ekranie zniknęło [M1-audytor-generalny-032]
  it('prints the starter jar label of the saved starter through the Calculator print menu, not from this screen', async () => {
    const pdfModule = require('../lib/pdf-sheet-generator');
    const { printStarterJarLabel } = require('../lib/print-menu');
    await renderScreen();

    expect(tree!.root.findAllByProps({ testID: 'print-starter-label-btn' })).toHaveLength(0);

    await act(async () => {
      await printStarterJarLabel();
    });

    expect(pdfModule.exportStarterLabelAsPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        starterName: expect.stringContaining('Bolesław'),
        flourType: expect.any(String),
        hydration: 100,
      }),
      true
    );
  });

  it('renders imperial units when unitSystem is set to imperial', async () => {
    const { setUnitSystem, _resetUnitSystemForTests } = require('../lib/unit-converter');
    setUnitSystem('imperial');

    await renderScreen();
    const fullText = extractCleanText(tree?.toJSON());

    // In imperial mode, ambient temperature is in °F and feeding weights in oz
    expect(fullText).toContain('°F');
    expect(fullText).toContain('oz');

    _resetUnitSystemForTests();
  });
});
