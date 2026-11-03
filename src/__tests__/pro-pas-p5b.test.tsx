/**
 * M3 p5b (D-200, O3a D-141, README §4 „Piekarz Pro”, makieta docs/design/karty/inne.html `data-ekran="pro"`): ekran
 * Piekarz Pro z pasem marki: na pasie „Zamknij”, tytuł (nagłówek VoiceOver) i zdanie Basic (stan ekranu); treść
 * w kartach („Co daje Pro” z ikoną, komunikat bez sieci na powierzchni karty). Ujawnienia (cena, okres, odnowienie,
 * przywracanie, regulamin, prywatność) pilnują ekran-zakupu-ujawnienia i ekran-pro-pb bez zmian (D-112/D-113).
 * §7a / D-142: przy AX5 (fontScale 3,1) opcja planu w jednej kolumnie (znacznik nad tekstem), węższe wcięcia,
 * w treści pod pasem żaden tekst bez `maxFontSizeMultiplier`.
 */
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StatusBar, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../components/PaywallModal';
import { theme } from '../ui/theme';
import { odstepy, promienie } from '../ui/tokeny';
import { setLang, t } from '../lib/i18n';

const mockIap = (Iap as unknown as { __mock: any }).__mock;
type Wezel = renderer.ReactTestInstance;

function produkty() {
  mockIap.products = [
    { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '79,99 zł', type: 'in-app' },
  ];
}

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj(props: Partial<React.ComponentProps<typeof PaywallModal>> = {}): Promise<Wezel> {
  await act(async () => {
    tree = renderer.create(<PaywallModal visible onClose={() => undefined} onSubscribe={() => undefined} onRestore={() => false} {...props} />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!.root;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const host = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const styl = (n: Wezel) => StyleSheet.flatten(n.props.style) ?? {};
const naPasie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (p.props?.testID === 'pas-zakladki') return true;
  return false;
};
const wKarcie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) {
    const s = typeof p.type === 'string' ? styl(p) : {};
    if (s.borderRadius === promienie.karta && s.backgroundColor === theme.colors.powierzchnia) return true;
  }
  return false;
};
const pas = (root: Wezel): Wezel => {
  const p = host(root, 'pas-zakladki');
  expect(p).toHaveLength(1);
  return p[0];
};

beforeEach(() => {
  mockIap.reset();
  setLang('pl');
  mockOkno.fontScale = 1;
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  mockOkno.fontScale = 1;
});

describe('p5b: Piekarz Pro z pasem marki i treścią w kartach (O3a, README §4)', () => {
  it('pas w kolorze `pas`: „Zamknij” po prawej, tytuł „Piekarz Pro” jako nagłówek, zdanie Basic pod tytułem', async () => {
    produkty();
    const zamknij = jest.fn();
    const root = await zamontuj({ onClose: zamknij });
    const p = pas(root);
    expect(styl(p).backgroundColor).toBe(theme.colors.pas);
    const tytul = p.findAll((n) => String(n.type) === 'Text' && n.props.accessibilityRole === 'header');
    expect(tytul.map(tekst)).toEqual([t('Piekarz Pro')]);
    expect(host(p, 'pro-opis').map(tekst)).toEqual([t('Basic zostaje bezpłatny na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur.')]);
    const z = p.findAll((n) => n.props.testID === 'close-modal' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function');
    expect(z.length).toBeGreaterThan(0);
    expect(z[0].props.accessibilityLabel).toBe(t('Zamknij'));
    await act(async () => z[0].props.onPress());
    expect(zamknij).toHaveBeenCalledTimes(1);
  });

  it('jasny pasek stanu na pasie, póki ekran Pro jest widoczny', async () => {
    produkty();
    const root = await zamontuj();
    expect(root.findAllByType(StatusBar).map((s) => s.props.barStyle)).toEqual(['light-content']);
  });

  it('„Co daje Pro” to karta z ikoną; żaden nagłówek poza pasem i kartą', async () => {
    produkty();
    const root = await zamontuj();
    const obszary = host(root, 'pro-obszary')[0];
    expect(styl(obszary).borderRadius).toBe(promienie.karta);
    expect(styl(obszary).backgroundColor).toBe(theme.colors.powierzchnia);
    expect(host(obszary, 'pro-obszary-ikona')).toHaveLength(1);
    const naglowki = root.findAll((n) => String(n.type) === 'Text' && n.props.accessibilityRole === 'header');
    expect(naglowki.filter((n) => !naPasie(n) && !wKarcie(n)).map(tekst)).toEqual([]);
  });

  it('Pro aktywne (z Ustawień): pas z tytułem, „Piekarz Pro jest aktywny.” na pasie, „Zarządzaj subskrypcją” bez zmian', async () => {
    const root = await zamontuj({ aktywny: { subskrypcja: true } });
    const p = pas(root);
    expect(host(p, 'pro-aktywny').map(tekst)).toEqual([t('Piekarz Pro jest aktywny.')]);
    expect(root.findAll((n) => n.props.testID === 'pro-manage-btn' && typeof n.props.onPress === 'function').length).toBeGreaterThan(0);
  });

  it('bez sieci: komunikat (rola alert) na powierzchni karty, nie na tle ekranu', async () => {
    mockIap.failProducts = true;
    const root = await zamontuj();
    const alert = root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'alert');
    expect(alert).toHaveLength(1);
    expect(wKarcie(alert[0])).toBe(true);
  });
});

describe('p5b §7a / D-142: Piekarz Pro przy AX5 i 320 pt', () => {
  it('AX5: opcja planu w jednej kolumnie (znacznik nad nazwą i ceną), treść z mniejszym wcięciem', async () => {
    mockOkno.fontScale = 3.1;
    produkty();
    const root = await zamontuj();
    const opcja = host(root, 'plan-yearly-btn')[0];
    expect(styl(opcja).flexDirection).toBe('column-reverse');
    expect(host(root, 'pro-tresc').map((n) => styl(n).paddingHorizontal)).toEqual([odstepy.l]);
  });

  it('tekst domyślny: opcja planu w rzędzie (jak dotąd), wcięcie treści bez zmian', async () => {
    produkty();
    const root = await zamontuj();
    expect(styl(host(root, 'plan-yearly-btn')[0]).flexDirection).toBe('row');
    expect(host(root, 'pro-tresc').map((n) => styl(n).paddingHorizontal)).toEqual([odstepy.xl]);
  });

  it('AX5: w treści pod pasem żaden tekst nie ma maxFontSizeMultiplier', async () => {
    mockOkno.fontScale = 3.1;
    produkty();
    const root = await zamontuj();
    const z = root.findAllByType(Text).filter((n) => !naPasie(n) && n.props.maxFontSizeMultiplier !== undefined);
    expect(z.map((n) => tekst(n))).toEqual([]);
  });
});
