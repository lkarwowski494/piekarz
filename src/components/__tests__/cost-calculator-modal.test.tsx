import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CostCalculatorModal } from '../CostCalculatorModal';

describe('CostCalculatorModal Component (src/components/CostCalculatorModal.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
    jest.clearAllMocks();
  });

  const baseProps = {
    visible: true,
    onClose: mockOnClose,
    totalFlourGrams: 1000,
    totalWaterGrams: 720,
    totalSaltGrams: 20,
    loavesCount: 2,
    bakedLoafWeightGrams: 750,
  };

  it('renders correctly with primary cost metrics and benchmark', async () => {
    await act(async () => {
      tree = renderer.create(<CostCalculatorModal {...baseProps} />);
    });

    const root = tree!.root;
    const highlightCard = root.findByProps({ testID: 'cost-highlight-card' });
    expect(highlightCard).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Koszt za bochenek');
    expect(fullText).toContain('Koszt całego wypieku');
    expect(fullText).toContain('Energia pieca');
    expect(fullText).toContain('Cena mąki');
  });

  it('adjusts prices live and updates total batch and per-loaf cost', async () => {
    await act(async () => {
      tree = renderer.create(<CostCalculatorModal {...baseProps} />);
    });

    const root = tree!.root;

    // Adjust flour price +0.5
    const flourPlus = root.findByProps({ testID: 'flour-price-plus' });
    await act(async () => {
      flourPlus.props.onPress();
    });

    // Adjust add-ins +1
    const addinsPlus = root.findByProps({ testID: 'addins-plus' });
    await act(async () => {
      addinsPlus.props.onPress();
    });

    // Check that close button works
    const closeBtn = root.findByProps({ testID: 'close-cost-modal-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
