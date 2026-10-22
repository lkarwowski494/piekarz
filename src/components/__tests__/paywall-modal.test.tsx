import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../PaywallModal';
import { t } from '../../lib/i18n';

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
  it('renders the three store prices from displayPrice and guarantees (BR-ZAK-001 Ceny ze sklepu)', async () => {
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
    // Tytuł bez porównania z espresso (MON-11) [M1-audytor-generalny-011]
    // Nazwa produktu jak w App Store Connect, bez plakietki (design-spec §11e 127) [M1-audytor-generalny-127]
    expect(fullText).toContain(t('Piekarz Pro'));
    expect(fullText).not.toContain('APPS4CRAFT');
    expect(fullText).toContain('$0.99');
    expect(fullText).toContain('$6.99');
    expect(fullText).toContain('$14.99');
    expect(fullText).toContain(t('Zakup wymaga połączenia z App Store.'));
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

    const submitBtn = tree!.root.findByProps({ testID: 'subscribe-submit-btn' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(mockOnSubscribe).toHaveBeenCalledWith('yearly');
  });

  it('switches to monthly and lifetime plans upon tap and submits', async () => {
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

  it('triggers restore purchases and closes with "Zamknij" (no separate read-only button, §11e 127)', async () => {
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

    expect(tree!.root.findAllByProps({ testID: 'read-only-continue-btn' })).toHaveLength(0);
    const closeBtn = tree!.root.findAll((n) => n.props.testID === 'close-modal' && typeof n.props.onPress === 'function')[0];
    await act(async () => {
      closeBtn.props.onPress();
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

  // Przepisane z kontraktu D-038 (okres próbny jako oferta wprowadzająca dla uprawnionych) [M1-audytor-generalny-009;
  // M3 P-a]: bez próby (D-112) — ekran nie pokazuje oferty wprowadzającej, nawet gdy sklep ją jeszcze ma
  const withIntroOffer = (unit: string, value: number) => {
    mockIap.products = [
      { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1',
        subscriptionOffers: [{ id: 'i1', type: 'introductory', paymentMode: 'free-trial', period: { unit, value }, periodCount: 1, displayPrice: '0 zł', price: 0 }] },
      { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1',
        subscriptionOffers: [{ id: 'i2', type: 'introductory', paymentMode: 'free-trial', period: { unit, value }, periodCount: 1, displayPrice: '0 zł', price: 0 }] },
      { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '79,99 zł', type: 'in-app' },
    ];
  };

  it('eligible user sees no trial: prices without "po próbie", "Kup plan roczny"; lifetime "Kup dostęp dożywotni" (D-112)', async () => {
    withIntroOffer('week', 2);
    await act(async () => {
      tree = renderer.create(<PaywallModal visible={true} onClose={mockOnClose} onSubscribe={mockOnSubscribe} onRestore={mockOnRestore} />);
    });
    const text = extractCleanText(tree?.toJSON());
    expect(text).not.toMatch(/Okres próbny|po próbie|Zacznij okres próbny/);
    expect(text).toContain(t('{cena} rocznie', { cena: '29,99 zł' }));
    expect(text).toContain('4,99 zł miesięcznie');
    expect(text).toContain('Kup plan roczny');
    await act(async () => {
      tree!.root.findByProps({ testID: 'plan-lifetime-btn' }).props.onPress();
    });
    expect(extractCleanText(tree?.toJSON())).toContain('Kup dostęp dożywotni');
  });

  it('the app does not ask the store about introductory offer eligibility (D-112)', async () => {
    withIntroOffer('day', 14);
    const Iap = jest.requireMock('expo-iap') as { isEligibleForIntroOfferIOS: jest.Mock };
    Iap.isEligibleForIntroOfferIOS.mockClear();
    await act(async () => {
      tree = renderer.create(<PaywallModal visible={true} onClose={mockOnClose} onSubscribe={mockOnSubscribe} onRestore={mockOnRestore} />);
    });
    expect(extractCleanText(tree?.toJSON())).toContain('Kup plan roczny');
    expect(Iap.isEligibleForIntroOfferIOS).not.toHaveBeenCalled();
  });});
