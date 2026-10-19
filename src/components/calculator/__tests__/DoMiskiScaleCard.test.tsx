import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DoMiskiScaleCard } from '../DoMiskiScaleCard';
import { calculateDoughRecipe } from '../../../core/domain-rules';

describe('DoMiskiScaleCard Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnLoavesChange = jest.fn();
  const mockOnSelectPreset = jest.fn();
  const mockOnStartBake = jest.fn();

  const sampleCalc = calculateDoughRecipe({
    flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    targetDoughWeightGrams: 960,
  });

  const presets = [
    { id: 'p1', name: 'Klasyczny pszenno-żytni' },
    { id: 'p2', name: 'Bagietka francuska' },
    { id: 'p3', name: 'Pizza Napoletana' },
    { id: 'p4', name: 'Chleb żytni 100%' },
  ];

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
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

  it('renders quick bread chips, loaf count stepper, and ingredient weights', async () => {
    await act(async () => {
      tree = renderer.create(
        <DoMiskiScaleCard
          calculations={sampleCalc}
          saltPercent={2}
          recipeName="Klasyczny pszenno-żytni"
          loavesCount={1}
          onLoavesChange={mockOnLoavesChange}
          presets={presets}
          selectedPresetId="p1"
          onSelectPreset={mockOnSelectPreset}
          onStartBake={mockOnStartBake}
        />
      );
    });

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Co dzisiaj pieczemy?');
    expect(fullText).toContain('Klasyczny pszenno-żytni');
    expect(fullText).toContain('Liczba bochenków');
    expect(fullText).toContain('Do miski na wagę');
    expect(fullText).toContain('500 g'); // Base flour added to bowl: 500g (fixing double-counted starter flour)
    expect(fullText).toContain('350 g'); // Water: 350g
    expect(fullText).toContain('100 g'); // Starter: 100g
    expect(fullText).toContain('10 g');  // Salt: 10g
  });

  it('steps loaves count and calls onLoavesChange', async () => {
    await act(async () => {
      tree = renderer.create(
        <DoMiskiScaleCard
          calculations={sampleCalc}
          saltPercent={2}
          recipeName="Klasyczny pszenno-żytni"
          loavesCount={1}
          onLoavesChange={mockOnLoavesChange}
          presets={presets}
          selectedPresetId="p1"
          onSelectPreset={mockOnSelectPreset}
          onStartBake={mockOnStartBake}
        />
      );
    });

    const incBtn = tree!.root.findByProps({ testID: 'loaves-increment-btn' });
    await act(async () => {
      incBtn.props.onPress();
    });

    expect(mockOnLoavesChange).toHaveBeenCalledWith(2);
  });

  it('toggles ingredient checkbox on tap with visual checkmark', async () => {
    await act(async () => {
      tree = renderer.create(
        <DoMiskiScaleCard
          calculations={sampleCalc}
          saltPercent={2}
          recipeName="Klasyczny pszenno-żytni"
          loavesCount={1}
          onLoavesChange={mockOnLoavesChange}
          presets={presets}
          selectedPresetId="p1"
          onSelectPreset={mockOnSelectPreset}
          onStartBake={mockOnStartBake}
        />
      );
    });

    const flourItem = tree!.root.findByProps({ testID: 'scale-item-flour' });
    await act(async () => {
      flourItem.props.onPress();
    });

    let text = extractCleanText(tree?.toJSON());
    expect(text).toContain('✓');
  });

  it('switches preset upon tapping bread chip', async () => {
    await act(async () => {
      tree = renderer.create(
        <DoMiskiScaleCard
          calculations={sampleCalc}
          saltPercent={2}
          recipeName="Klasyczny pszenno-żytni"
          loavesCount={1}
          onLoavesChange={mockOnLoavesChange}
          presets={presets}
          selectedPresetId="p1"
          onSelectPreset={mockOnSelectPreset}
          onStartBake={mockOnStartBake}
        />
      );
    });

    const chipP2 = tree!.root.findByProps({ testID: 'preset-chip-p2' });
    await act(async () => {
      chipP2.props.onPress();
    });

    expect(mockOnSelectPreset).toHaveBeenCalledWith('p2');
  });

  it('triggers onStartBake when tapping primary CTA button', async () => {
    await act(async () => {
      tree = renderer.create(
        <DoMiskiScaleCard
          calculations={sampleCalc}
          saltPercent={2}
          recipeName="Klasyczny pszenno-żytni"
          loavesCount={1}
          onLoavesChange={mockOnLoavesChange}
          presets={presets}
          selectedPresetId="p1"
          onSelectPreset={mockOnSelectPreset}
          onStartBake={mockOnStartBake}
        />
      );
    });

    const startBtn = tree!.root.findByProps({ testID: 'fast-start-bake-cta-btn' });
    await act(async () => {
      startBtn.props.onPress();
    });

    expect(mockOnStartBake).toHaveBeenCalled();
  });
});
