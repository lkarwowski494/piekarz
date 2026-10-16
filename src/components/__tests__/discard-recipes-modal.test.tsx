import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DiscardRecipesModal } from '../DiscardRecipesModal';

describe('DiscardRecipesModal Component (Z-043)', () => {
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

  it('renders modal when visible is true and shows category filter chips', async () => {
    await act(async () => {
      tree = renderer.create(
        <DiscardRecipesModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-discard-modal-btn' });
    expect(closeBtn).toBeDefined();

    const crackersFilter = root.findByProps({ testID: 'discard-filter-crackers' });
    expect(crackersFilter).toBeDefined();

    const pancakeFilter = root.findByProps({ testID: 'discard-filter-pancakes' });
    expect(pancakeFilter).toBeDefined();
  });

  it('filters recipes when a category chip is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <DiscardRecipesModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const crackersFilter = root.findByProps({ testID: 'discard-filter-crackers' });

    await act(async () => {
      crackersFilter.props.onPress();
    });

    const crackerCard = root.findByProps({ testID: 'discard-card-discard_crackers_herb' });
    expect(crackerCard).toBeDefined();

    const pancakeCards = root.findAllByProps({ testID: 'discard-card-discard_fluffy_pancakes' });
    expect(pancakeCards.length).toBe(0);
  });

  it('expands recipe details on press and shows ingredients and steps', async () => {
    await act(async () => {
      tree = renderer.create(
        <DiscardRecipesModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const toggleBtn = root.findByProps({ testID: 'toggle-discard-discard_crackers_herb' });

    await act(async () => {
      toggleBtn.props.onPress();
    });

    const card = root.findByProps({ testID: 'discard-card-discard_crackers_herb' });
    expect(card).toBeDefined();
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <DiscardRecipesModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-discard-modal-btn' });

    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
