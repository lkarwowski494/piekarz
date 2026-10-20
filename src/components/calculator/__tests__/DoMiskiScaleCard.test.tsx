import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DoMiskiScaleCard } from '../DoMiskiScaleCard';
import { calculateDoughRecipe } from '../../../core/domain-rules';

describe('DoMiskiScaleCard Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnLoavesChange = jest.fn();

  const sampleCalc = calculateDoughRecipe({
    flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    targetDoughWeightGrams: 960,
  });

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

  const renderCard = async () => {
    await act(async () => {
      tree = renderer.create(
        <DoMiskiScaleCard
          calculations={sampleCalc}
          saltPercent={2}
          recipeName="Klasyczny pszenno-żytni"
          loavesCount={1}
          onLoavesChange={mockOnLoavesChange}
        />
      );
    });
  };

  it('renders loaf count stepper and ingredient weights', async () => {
    await renderCard();

    const fullText = extractCleanText(tree?.toJSON());
    // 057: jeden wybór receptury (lista receptur) — karta nie ma własnych chipów „Co dzisiaj pieczemy?”
    expect(fullText).not.toContain('Co dzisiaj pieczemy?');
    expect(fullText).toContain('Klasyczny pszenno-żytni');
    expect(fullText).toContain('Liczba bochenków');
    expect(fullText).toContain('Do miski na wagę');
    expect(fullText).toContain('500 g'); // Base flour added to bowl: 500g (fixing double-counted starter flour)
    expect(fullText).toContain('350 g'); // Water: 350g
    expect(fullText).toContain('100 g'); // Starter: 100g
    expect(fullText).toContain('10 g');  // Salt: 10g
  });

  it('steps loaves count and calls onLoavesChange', async () => {
    await renderCard();

    const incBtn = tree!.root.findByProps({ testID: 'loaves-increment-btn' });
    await act(async () => {
      incBtn.props.onPress();
    });

    expect(mockOnLoavesChange).toHaveBeenCalledWith(2);
  });

  it('toggles ingredient checkbox on tap with visual checkmark', async () => {
    await renderCard();

    const flourItem = tree!.root.findByProps({ testID: 'scale-item-flour' });
    await act(async () => {
      flourItem.props.onPress();
    });

    let text = extractCleanText(tree?.toJSON());
    expect(text).toContain('✓');
  });

  // 057 (design-spec §11b): wybór receptury tylko z listy receptur, bez drugiego zestawu chipów z tymi samymi testID
  it('has no recipe chips of its own', async () => {
    await renderCard();

    expect(tree!.root.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('preset-chip-'))).toHaveLength(0);
  });

  // 057: „Ułóż plan” jest jedną akcją obszaru akcji receptury (start-bake-btn ×1), karta nie ma przycisku startu
  it('has no start button of its own', async () => {
    await renderCard();

    for (const id of ['fast-start-bake-cta-btn', 'start-bake-btn']) {
      expect({ id, n: tree!.root.findAllByProps({ testID: id }).length }).toEqual({ id, n: 0 });
    }
    expect(extractCleanText(tree?.toJSON())).not.toContain('Zacznij wypiek');
  });
});
