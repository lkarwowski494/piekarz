import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StarterConverterModal } from '../StarterConverterModal';

describe('StarterConverterModal Component (src/components/StarterConverterModal.tsx)', () => {
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
    currentStarterHydration: 100,
    currentStarterName: 'Bolesław',
  };

  it('renders substitution section by default with computed results', async () => {
    await act(async () => {
      tree = renderer.create(<StarterConverterModal {...baseProps} />);
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'starter-converter-modal' })).toBeDefined();
    expect(root.findByProps({ testID: 'substitution-section' })).toBeDefined();

    const resultCard = root.findByProps({ testID: 'substitution-result-card' });
    expect(resultCard).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Konwerter zakwasu & Lievito Madre');
    expect(fullText).toContain('U\u017cyj Twojego zakwasu');
    expect(fullText).toContain('Korekta wody w cieście');
  });

  it('updates recipe substitution when user toggles starter hydration to 50% (Lievito Madre)', async () => {
    await act(async () => {
      tree = renderer.create(<StarterConverterModal {...baseProps} />);
    });

    const root = tree!.root;

    // Toggle user starter hydration to 50%
    const userHydr50Btn = root.findByProps({ testID: 'user-hydr-50' });
    expect(userHydr50Btn).toBeDefined();

    await act(async () => {
      userHydr50Btn.props.onPress();
    });

    const fullText = JSON.stringify(tree!.toJSON());
    // Recipe is 150g at 100% -> user starter at 50% requires 113g and +37.5g water
    expect(fullText).toContain('113g');
    expect(fullText).toContain('+37,5g wody'); // PL: przecinek dziesiętny [M1-audytor-generalny-070]
  });

  it('switches to shift (odrost) tab and computes seed, flour and water additions', async () => {
    await act(async () => {
      tree = renderer.create(<StarterConverterModal {...baseProps} />);
    });

    const root = tree!.root;

    // Switch to tab shift
    const shiftTab = root.findByProps({ testID: 'tab-shift' });
    await act(async () => {
      shiftTab.props.onPress();
    });

    expect(root.findByProps({ testID: 'shift-section' })).toBeDefined();
    const resultCard = root.findByProps({ testID: 'shift-result-card' });
    expect(resultCard).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Receptura odrostu');
    expect(fullText).toContain('Zakwas matka (Seed)');
    expect(fullText).toContain('Mąka dodana');
    expect(fullText).toContain('Woda dodana');
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(<StarterConverterModal {...baseProps} />);
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-converter-btn' });
    expect(closeBtn).toBeDefined();

    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
