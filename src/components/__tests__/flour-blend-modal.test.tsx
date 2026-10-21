import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlourBlendModal } from '../FlourBlendModal';
import { FLOUR_PROFILES } from '../../core/flour-atlas';

describe('FlourBlendModal Component (src/components/FlourBlendModal.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnApply = jest.fn();
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

  const initialBlend = [
    { name: 'Mąka pszenna chlebowa typ 750', percentage: 70.0, type: 'wheat_750' },
    { name: 'Mąka żytnia typ 720', percentage: 30.0, type: 'rye_720' },
  ];

  it('renders correctly with initial blend and valid status', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal
          visible={true}
          initialBlend={initialBlend}
          onApply={mockOnApply}
          onClose={mockOnClose}
        />
      );
    });

    const root = tree!.root;
    const banner = root.findByProps({ testID: 'blend-validation-banner' });
    expect(banner).toBeDefined();

    // Check flour rows
    const row0 = root.findByProps({ testID: 'flour-row-0' });
    const row1 = root.findByProps({ testID: 'flour-row-1' });
    expect(row0).toBeDefined();
    expect(row1).toBeDefined();

    // Apply button should be enabled
    const applyBtn = root.findByProps({ testID: 'apply-blend-btn' });
    expect(applyBtn.props.disabled).toBe(false);
  });

  it('adjusts percentages using steppers and warns when total deviates from 100%', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal
          visible={true}
          initialBlend={initialBlend}
          onApply={mockOnApply}
          onClose={mockOnClose}
        />
      );
    });

    const root = tree!.root;
    const minusBtn = root.findByProps({ testID: 'flour-minus-10-0' });

    // Deduct 10% from flour 0 (70% -> 60%)
    await act(async () => {
      minusBtn.props.onPress();
    });

    // Total is now 60% + 30% = 90%
    const applyBtn = root.findByProps({ testID: 'apply-blend-btn' });
    expect(applyBtn.props.disabled).toBe(true);

    // Normalize button appears
    const normalizeBtn = root.findByProps({ testID: 'normalize-blend-btn' });
    expect(normalizeBtn).toBeDefined();

    // Tap normalize button to re-balance to 100%
    await act(async () => {
      normalizeBtn.props.onPress();
    });

    // Re-balanced: 60/90 = 66.7%, 30/90 = 33.3% -> total 100%
    expect(applyBtn.props.disabled).toBe(false);
  });

  it('adds flour from Atlas profile chips', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal
          visible={true}
          initialBlend={initialBlend}
          onApply={mockOnApply}
          onClose={mockOnClose}
        />
      );
    });

    const root = tree!.root;
    // Add Manitoba flour
    const manitobaChip = root.findByProps({ testID: 'add-flour-wheat_manitoba' });
    expect(manitobaChip).toBeDefined();

    await act(async () => {
      manitobaChip.props.onPress();
    });

    // Now 3 rows exist
    expect(root.findByProps({ testID: 'flour-row-2' })).toBeDefined();
  });

  it('removes flour row when remove button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal
          visible={true}
          initialBlend={initialBlend}
          onApply={mockOnApply}
          onClose={mockOnClose}
        />
      );
    });

    const root = tree!.root;
    const removeBtn1 = root.findByProps({ testID: 'flour-remove-1' });

    await act(async () => {
      removeBtn1.props.onPress();
    });

    // Only 1 row left
    expect(() => root.findByProps({ testID: 'flour-row-1' })).toThrow();
  });

  it('calls onApply with updated blend when valid apply is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal
          visible={true}
          initialBlend={initialBlend}
          onApply={mockOnApply}
          onClose={mockOnClose}
        />
      );
    });

    const root = tree!.root;
    const applyBtn = root.findByProps({ testID: 'apply-blend-btn' });

    await act(async () => {
      applyBtn.props.onPress();
    });

    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith(initialBlend);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal
          visible={true}
          initialBlend={initialBlend}
          onApply={mockOnApply}
          onClose={mockOnClose}
        />
      );
    });

    const root = tree!.root;
    const cancelBtn = root.findByProps({ testID: 'close-blend-modal-btn' });

    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnApply).not.toHaveBeenCalled();
  });

  it('przy dużym tekście przyciski udziału mąki przechodzą do następnego wiersza zamiast wychodzić poza ekran 320 pt [audyt-niezalezny G-11]', async () => {
    await act(async () => {
      tree = renderer.create(<FlourBlendModal visible={true} initialBlend={initialBlend} onApply={mockOnApply} onClose={mockOnClose} />);
    });
    const { StyleSheet } = jest.requireActual('react-native');
    const grupa = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'flour-stepper-0');
    expect(grupa).toHaveLength(1);
    const s = StyleSheet.flatten(grupa[0].props.style);
    expect({ flexDirection: s.flexDirection, flexWrap: s.flexWrap }).toEqual({ flexDirection: 'row', flexWrap: 'wrap' });
  });

  it('„✕” usuwania mąki ma pole dotyku co najmniej 44 × 44 pt (RD-ENG-03) [audyt-niezalezny G-6]', async () => {
    await act(async () => {
      tree = renderer.create(<FlourBlendModal visible={true} initialBlend={initialBlend} onApply={mockOnApply} onClose={mockOnClose} />);
    });
    const { StyleSheet } = jest.requireActual('react-native');
    // G-10: przyciski -10/-5/+5/+10 miały minWidth 38 pt [audyt-niezalezny G-10]
    const przyciski = tree!.root.findAll((n) => typeof n.props.testID === 'string' && /^flour-(remove|minus-\d+|plus-\d+)-\d+$/.test(n.props.testID) && n.props.style);
    expect(przyciski.length).toBeGreaterThan(2);
    expect(przyciski.length).toBeGreaterThan(0);
    for (const p of przyciski) {
      const s = StyleSheet.flatten(p.props.style);
      expect({ minWidth: s.minWidth >= 44, minHeight: s.minHeight >= 44 }).toEqual({ minWidth: true, minHeight: true });
    }
  });
});
