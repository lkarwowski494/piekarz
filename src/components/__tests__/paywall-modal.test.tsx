import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../PaywallModal';

const mockIap = (Iap as unknown as { __mock: any }).__mock;

describe('PaywallModal Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();
  const mockOnSubscribe = jest.fn();
  const mockOnRestore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIap.reset();
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

  // Ceny tylko z produktów App Store (displayPrice), nigdy z kodu [M1-audytor-generalny-008]
  it('renders the three store prices from displayPrice and guarantees', async () => {
    mockIap.products = [
      { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '$0.99', type: 'subs' },
      { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '$6.99', type: 'subs' },
      { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '$14.99', type: 'in-app' },
    ];
    await act(async () => {
      tree = renderer.create(
        <PaywallModal
          visible={true}
          onClose={mockOnClose}
          onSubscribe={mockOnSubscribe}
          onRestore={mockOnRestore}
        />
      );
    });

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Taniej niż espresso');
    expect(fullText).toContain('$0.99');
    expect(fullText).toContain('$6.99');
    expect(fullText).toContain('$14.99');
    expect(fullText).toContain('Twoja historia jest bezpieczna');
    expect(fullText).toContain('100% Offline-First');
  });

  it('shows no price when the store returned no products', async () => {
    await act(async () => {
      tree = renderer.create(
        <PaywallModal visible={true} onClose={mockOnClose} onSubscribe={mockOnSubscribe} onRestore={mockOnRestore} />
      );
    });
    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).not.toMatch(/[$€]\s?\d|\d\s?zł/);
  });

  it('selects yearly by default and calls onSubscribe with yearly', async () => {
    await act(async () => {
      tree = renderer.create(
        <PaywallModal
          visible={true}
          onClose={mockOnClose}
          onSubscribe={mockOnSubscribe}
          onRestore={mockOnRestore}
        />
      );
    });

    const submitBtn = tree!.root.findByProps({ testID: 'subscribe-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(mockOnSubscribe).toHaveBeenCalledWith('yearly');
  });

  it('switches to monthly and lifetime plans upon tap and submits', async () => {
    await act(async () => {
      tree = renderer.create(
        <PaywallModal
          visible={true}
          onClose={mockOnClose}
          onSubscribe={mockOnSubscribe}
          onRestore={mockOnRestore}
        />
      );
    });

    // Select monthly
    const monthlyBtn = tree!.root.findByProps({ testID: 'plan-monthly-btn' });
    await act(async () => {
      monthlyBtn.props.onPress();
    });

    const submitBtn = tree!.root.findByProps({ testID: 'subscribe-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(mockOnSubscribe).toHaveBeenCalledWith('monthly');

    // Select lifetime
    const lifetimeBtn = tree!.root.findByProps({ testID: 'plan-lifetime-btn' });
    await act(async () => {
      lifetimeBtn.props.onPress();
    });

    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(mockOnSubscribe).toHaveBeenCalledWith('lifetime');
  });

  it('triggers restore purchases and closes on read-only continue', async () => {
    await act(async () => {
      tree = renderer.create(
        <PaywallModal
          visible={true}
          onClose={mockOnClose}
          onSubscribe={mockOnSubscribe}
          onRestore={mockOnRestore}
        />
      );
    });

    const restoreBtn = tree!.root.findByProps({ testID: 'restore-purchases-btn' });
    await act(async () => {
      restoreBtn.props.onPress();
    });
    expect(mockOnRestore).toHaveBeenCalled();

    const readOnlyBtn = tree!.root.findByProps({ testID: 'read-only-continue-btn' });
    await act(async () => {
      readOnlyBtn.props.onPress();
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders EULA and Privacy Policy legal links complying with Apple Guideline 3.1.2', async () => {
    await act(async () => {
      tree = renderer.create(
        <PaywallModal
          visible={true}
          onClose={mockOnClose}
          onSubscribe={mockOnSubscribe}
          onRestore={mockOnRestore}
        />
      );
    });

    const eulaBtn = tree!.root.findByProps({ testID: 'terms-of-use-btn' });
    const privacyBtn = tree!.root.findByProps({ testID: 'privacy-policy-btn' });
    expect(eulaBtn).toBeTruthy();
    expect(privacyBtn).toBeTruthy();
    expect(eulaBtn.props.accessibilityRole).toBe('link');
    expect(privacyBtn.props.accessibilityRole).toBe('link');
  });
});
