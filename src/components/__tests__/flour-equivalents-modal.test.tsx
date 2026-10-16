import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlourEquivalentsModal } from '../FlourEquivalentsModal';

describe('FlourEquivalentsModal Component (Z-052)', () => {
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

  it('renders modal when visible is true and shows header and search input', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourEquivalentsModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const searchInput = root.findByProps({ testID: 'flour-equiv-search-input' });
    expect(searchInput).toBeDefined();

    const closeBtn = root.findByProps({ testID: 'close-flour-equiv-modal-btn' });
    expect(closeBtn).toBeDefined();
  });

  it('filters flour entries based on search input', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourEquivalentsModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const searchInput = root.findByProps({ testID: 'flour-equiv-search-input' });

    await act(async () => {
      searchInput.props.onChangeText('T65');
    });

    const card = root.findByProps({ testID: 'flour-equiv-card-flour_equiv_bread_light' });
    expect(card).toBeDefined();

    const wholeGrainCard = root.findAllByProps({ testID: 'flour-equiv-card-flour_equiv_whole_grain' });
    expect(wholeGrainCard.length).toBe(0);
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourEquivalentsModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-flour-equiv-modal-btn' });

    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
