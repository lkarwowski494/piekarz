/**
 * Ujawnienia na ekranie zakupu (MON-10, MON-11) [M1-audytor-generalny-011; 02-monetyzacja-004, 02-monetyzacja-008].
 * Źródło: developer.apple.com/app-store/subscriptions (odczyt 2026-10-19): pełna cena odnowienia z walutą,
 * kwota rozliczenia jako najważniejszy element ceny, długość okresu próbnego i cena po nim, przywracanie,
 * łatwy dostęp do systemowego zarządzania subskrypcją; linki do warunków (standardowa EULA Apple) i prywatności.
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Linking, StyleSheet } from 'react-native';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../PaywallModal';
import { ZakupySection } from '../settings/ZakupySection';
import { APPLE_EULA_URL, APPLE_SUBSCRIPTIONS_URL, PRIVACY_URL } from '../../lib/links';
import { zarzadzajSubskrypcja } from '../../lib/platnosci/sklep';
import { t } from '../../lib/i18n';

const mockIap = (Iap as unknown as { __mock: any }).__mock;

const produkty = (zProba: boolean) => {
  const oferta = zProba
    ? [{ id: 'i1', type: 'introductory', paymentMode: 'free-trial', period: { unit: 'day', value: 14 }, periodCount: 1, displayPrice: '0 zł', price: 0 }]
    : [];
  mockIap.products = [
    { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: oferta },
    { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: oferta },
    { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '79,99 zł', type: 'in-app' },
  ];
};

function text(node: unknown): string {
  const walk = (n: unknown): string => {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (!n || typeof n !== 'object') return '';
    if (Array.isArray(n)) return n.map(walk).join('');
    const children: unknown = Reflect.get(n, 'children');
    return walk(children);
  };
  return walk(node).replace(/\s+/g, ' ').trim();
}

async function mount(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<PaywallModal visible={true} onClose={() => undefined} onSubscribe={() => undefined} onRestore={() => false} />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('Purchase screen disclosures (011)', () => {
  let open: jest.SpyInstance;
  beforeEach(() => {
    mockIap.reset();
    (Iap.deepLinkToSubscriptions as jest.Mock).mockClear();
    open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });
  afterEach(() => open.mockRestore());

  it('shows the three store plans with displayPrice, period and automatic renewal terms', async () => {
    produkty(false);
    const tree = await mount();
    const all = text(tree.toJSON());
    for (const cena of ['4,99 zł', '29,99 zł', '79,99 zł']) expect(all).toContain(cena);
    expect(all).toContain(t('12 miesięcy'));
    expect(all).toContain(t('1 miesiąc'));
    expect(all).toContain(t('Odnawia się automatycznie co rok'));
    expect(all).toContain(t('Odnawia się automatycznie co miesiąc'));
    expect(all).toContain(
      t('Subskrypcja odnawia się automatycznie za cenę podaną przy planie, dopóki jej nie anulujesz. Płatność pobiera App Store z Twojego konta Apple. Subskrypcję anulujesz w każdej chwili w ustawieniach konta Apple albo przyciskiem „Zarządzaj subskrypcją”.')
    );
    expect(all).toContain(t('Dostęp dożywotni to jednorazowy zakup bez odnawiania.'));
    await act(async () => {
      tree.root.findByProps({ testID: 'plan-monthly-btn' }).props.onPress();
    });
    expect(text(tree.toJSON())).toContain(t('Aktywuj plan miesięczny'));
    act(() => tree.unmount());
  });

  it('the yearly billed amount is the most prominent price element of the yearly plan', async () => {
    produkty(false);
    const tree = await mount();
    const roczny = tree.root.findByProps({ testID: 'plan-yearly-btn' });
    const teksty = roczny.findAll((n) => String(n.type) === 'Text');
    const rozmiar = (n: renderer.ReactTestInstance) => Number(StyleSheet.flatten(n.props.style)?.fontSize ?? 0);
    const najwiekszy = teksty.reduce((a, b) => (rozmiar(b) > rozmiar(a) ? b : a));
    expect(text(najwiekszy)).toBe('29,99 zł');
    expect(text(roczny)).not.toMatch(/\/\s*(mies|month)/);
    act(() => tree.unmount());
  });

  it('the 14-day introductory offer is shown only to eligible users, with the price after it', async () => {
    produkty(true);
    let tree = await mount();
    expect(text(tree.toJSON())).toContain(t('Pierwsze {dni} dni bezpłatnie, potem {cena}', { dni: 14, cena: '29,99 zł' }));
    act(() => tree.unmount());
    produkty(true);
    mockIap.eligible = false;
    tree = await mount();
    expect(text(tree.toJSON())).not.toMatch(/bezpłatnie|Wypróbuj/);
    act(() => tree.unmount());
  });

  it('has no labels without data: no "most popular", espresso or "cancel anytime"', async () => {
    produkty(false);
    const tree = await mount();
    const all = text(tree.toJSON());
    expect(all).not.toMatch(/NAJPOPULARNIEJSZY|NAJLEPSZA CENA|espresso|Anuluj kiedy chcesz|~/i);
    act(() => tree.unmount());
    const dir = path.join(__dirname, '../../lib/i18n-en');
    const slownik = fs.readdirSync(dir).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
    expect(slownik).not.toMatch(/najpopularniejsz|most popular|espresso|Anuluj kiedy chcesz|Cancel anytime/i);
  });

  it('opens the system subscription management, the Apple standard EULA and the privacy policy', async () => {
    produkty(false);
    const tree = await mount();
    await act(async () => {
      await tree.root.findByProps({ testID: 'manage-subscriptions-btn' }).props.onPress();
    });
    expect(Iap.deepLinkToSubscriptions).toHaveBeenCalledTimes(1);
    await act(async () => {
      tree.root.findByProps({ testID: 'terms-of-use-btn' }).props.onPress();
      tree.root.findByProps({ testID: 'privacy-policy-btn' }).props.onPress();
    });
    expect(open).toHaveBeenCalledWith(APPLE_EULA_URL);
    expect(open).toHaveBeenCalledWith(PRIVACY_URL);
    expect(APPLE_EULA_URL).toBe('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
    expect(tree.root.findAllByProps({ testID: 'restore-purchases-btn' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('zarzadzajSubskrypcja falls back to the Apple Account subscriptions page when the sheet fails', async () => {
    (Iap.deepLinkToSubscriptions as jest.Mock).mockRejectedValueOnce(new Error('unsupported'));
    await zarzadzajSubskrypcja();
    expect(open).toHaveBeenCalledWith(APPLE_SUBSCRIPTIONS_URL);
    expect(APPLE_SUBSCRIPTIONS_URL).toBe('https://apps.apple.com/account/subscriptions');
  });

  it('Settings: "Manage subscription" opens the system subscription management', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<ZakupySection />);
    });
    await act(async () => {
      await tree!.root.findByProps({ testID: 'settings-manage-subscriptions-btn' }).props.onPress();
    });
    expect(Iap.deepLinkToSubscriptions).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });
});
