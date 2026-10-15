import React from 'react';
import renderer, { act } from 'react-test-renderer';
import DoctorScreen from '../../app/(tabs)/doktor';

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

describe('DoctorScreen UI (app/(tabs)/doktor.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  it('renders initial diagnosis, biological cause, and action checklist', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const allText = extractCleanText(root);

    // Title & headers
    expect(allText).toContain('Doktor Chleba');
    expect(allText).toContain('Diagnostyka błędów wypieku');

    // Default under-proofed diagnosis
    expect(allText).toContain('Niedofermentowanie (Under-proofed / Flying Crust)');
    expect(allText).toContain('Przyczyna biologiczno-chemiczna:');
    expect(allText).toContain('Co zrobić przy następnym wypieku:');
    expect(allText).toContain('Wydłuż fermentację burzliwą');
    expect(allText).toContain('Krytyczny błąd struktury');
  });

  it('applies quick preset for over-proofed flat loaf', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const overPresetBtn = findButtonByText(root, 'Płaski dysk (Przerośnięty)');
    expect(overPresetBtn).toBeDefined();

    await act(async () => {
      overPresetBtn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('Przekwaszenie / Przerośnięcie (Over-proofed)');
    expect(allText).toContain('Bakterie kwasu mlekowego strawiły siatkę glutenową');
  });

  it('applies quick preset for gummy crumb and provides navigation button to Stolnica', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const gummyPresetBtn = findButtonByText(root, 'Gumowaty (Gorący nóż)');
    expect(gummyPresetBtn).toBeDefined();

    await act(async () => {
      gummyPresetBtn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('Gumowaty, lepki miękisz (Gummy Crumb)');

    // Navigation button to Stolnica
    const navBtn = findButtonByText(root, 'Przejdź do Stolnicy');
    expect(navBtn).toBeDefined();

    await act(async () => {
      navBtn!.props.onPress();
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/stolnica');
  });

  it('applies flavor defect presets (excessively sour and bland flavor)', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Test sour preset
    const sourBtn = findButtonByText(root, 'Zbyt kwaśny (Octowy)');
    expect(sourBtn).toBeDefined();

    await act(async () => {
      sourBtn!.props.onPress();
      await Promise.resolve();
    });

    let allText = extractCleanText(root);
    expect(allText).toContain('Zbyt kwaśny, octowy smak (Excessively Sour)');
    expect(allText).toContain('Acetobacter');

    // Test bland preset
    const blandBtn = findButtonByText(root, 'Płaski smak (Jałowy)');
    expect(blandBtn).toBeDefined();

    await act(async () => {
      blandBtn!.props.onPress();
      await Promise.resolve();
    });

    allText = extractCleanText(root);
    expect(allText).toContain('Płaski smak bez głębi (Bland Flavor)');
  });

  it('clears all symptoms and displays empty selection prompt', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const clearBtn = findButtonByText(root, 'Wyczyść zaznaczone objawy');
    expect(clearBtn).toBeDefined();

    await act(async () => {
      clearBtn!.props.onPress();
      await Promise.resolve();
    });

    const allText = extractCleanText(root);
    expect(allText).toContain('Wybierz objawy bochenka');
    expect(allText).not.toContain('Co zrobić przy następnym wypieku:');
  });

  it('expands kitchen baking tests (Poke Test and Windowpane Test)', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Expand Poke Test
    const pokeTestCard = findButtonByText(root, 'Test palca (Poke Test)');
    expect(pokeTestCard).toBeDefined();

    await act(async () => {
      pokeTestCard!.props.onPress();
      await Promise.resolve();
    });

    let allText = extractCleanText(root);
    expect(allText).toContain('Szybko odskakuje:');
    expect(allText).toContain('Wraca powoli do połowy:');
    expect(allText).toContain('Zostaje wgłębienie i ciasto siada:');

    // Expand Windowpane Test
    const windowCard = findButtonByText(root, 'Test okna glutenowego (Windowpane)');
    expect(windowCard).toBeDefined();

    await act(async () => {
      windowCard!.props.onPress();
      await Promise.resolve();
    });

    allText = extractCleanText(root);
    expect(allText).toContain('Ciasto rwie się przy rozciąganiu:');
    expect(allText).toContain('Cienka, przezroczysta membrana:');
  });

  it('navigates to Harmonogram when fixing under-proofed defect', async () => {
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const navBtn = findButtonByText(root, 'Przejdź do Harmonogramu (Sleep Guard)');
    expect(navBtn).toBeDefined();

    await act(async () => {
      navBtn!.props.onPress();
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/harmonogram');
  });
});
