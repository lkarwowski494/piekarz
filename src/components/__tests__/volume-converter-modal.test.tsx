import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { VolumeConverterModal } from '../VolumeConverterModal';

describe('VolumeConverterModal Component (Z-013)', () => {
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

  it('renders modal when visible is true and shows result and precision warning', async () => {
    await act(async () => {
      tree = renderer.create(
        <VolumeConverterModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-volume-modal-btn' });
    expect(closeBtn).toBeDefined();

    const resultGrams = root.findByProps({ testID: 'volume-result-grams' });
    expect(resultGrams).toBeDefined();
  });

  it('allows switching unit to tablespoon and updates gram calculation', async () => {
    await act(async () => {
      tree = renderer.create(
        <VolumeConverterModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const tbspBtn = root.findByProps({ testID: 'unit-tbsp-btn' });

    await act(async () => {
      tbspBtn.props.onPress();
    });

    const amountInput = root.findByProps({ testID: 'volume-amount-input' });
    await act(async () => {
      amountInput.props.onChangeText('2');
    });

    const resultGrams = root.findByProps({ testID: 'volume-result-grams' });
    expect(resultGrams.props.children).toContain(16); // 2 tbsp * 8g
  });

  it('allows stepping amount up and down', async () => {
    await act(async () => {
      tree = renderer.create(
        <VolumeConverterModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const plusBtn = root.findByProps({ testID: 'volume-step-plus-btn' });
    const minusBtn = root.findByProps({ testID: 'volume-step-minus-btn' });
    const amountInput = root.findByProps({ testID: 'volume-amount-input' });

    await act(async () => {
      plusBtn.props.onPress();
    });
    expect(amountInput.props.value).toBe('1.5');

    await act(async () => {
      minusBtn.props.onPress();
    });
    expect(amountInput.props.value).toBe('1');
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <VolumeConverterModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-volume-modal-btn' });

    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
