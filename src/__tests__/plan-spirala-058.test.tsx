// Plan wypieku przed startem: Spirala koszyka w wariancie planu (design-spec §11b 058, wiersz „plan przed startem”)
// [M1-audytor-generalny-058; 04-studio-projektowe-023]
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { setLang } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';

jest.setTimeout(20000);

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

let tree: renderer.ReactTestRenderer | null = null;

beforeEach(async () => {
  zUprawnieniem();
  setActiveBake(null);
  await initDatabase();
});

afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  setLang('pl');
});

async function renderPlan() {
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!.root;
}

const spirale = (root: renderer.ReactTestInstance) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral');
const odcinki = (root: renderer.ReactTestInstance) =>
  root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('brand-spiral-odcinek-') && n.props.strokeWidth !== undefined);

describe('Plan wypieku: Spirala planu przed startem (058)', () => {
  it('M1-audytor-generalny-058: plan ma brand-spiral z rolą obrazu i etykietą z danych planu', async () => {
    const root = await renderPlan();
    const s = spirale(root);
    expect(s).toHaveLength(1);
    expect(s[0].props.accessibilityRole).toBe('image');
    const etykieta: string = s[0].props.accessibilityLabel;
    // przy otwarciu plan na najwcześniejszą godzinę, gdy domyślna „jutro 10:00” dałaby start w przeszłości (107);
    // liczba kroków w etykiecie = liczba odcinków spirali (kroki planu)
    const m = /^Plan wypieku: (\d+) kroków\. Gotowe .+ o \d\d:\d\d\.$/.exec(etykieta);
    expect(m).not.toBeNull();
    const n = Number(m![1]);
    expect(n).toBeGreaterThan(4);
    expect(new Set(odcinki(root).map((o) => o.props.testID)).size).toBe(n);
  });

  it('M1-audytor-generalny-058: wszystkie zwoje cienkie, bez znacznika „teraz” i bez postępu', async () => {
    const root = await renderPlan();
    const grubosci = new Set(odcinki(root).map((o) => o.props.strokeWidth));
    expect([...grubosci]).toEqual([3]);
    expect(root.findAll((n) => n.props.testID === 'brand-spiral-teraz')).toHaveLength(0);
    expect(root.findAll((n) => n.props.testID === 'brand-spiral-postep')).toHaveLength(0);
  });

  it('M1-audytor-generalny-058: zmiana godziny gotowości zmienia etykietę (dane planu, nie przykład)', async () => {
    const root = await renderPlan();
    const tekst = (n: renderer.ReactTestInstance): string =>
      n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
    // 107: godzina z pola zamiast domyślnej (przy otwarciu może być najwcześniejsza); chipy godziny usunięte w 128,
    // więc jutro 10:00 przyciskami ±30 min obok pola
    await ustawGodzinePlanu(root, 'Jutro', 10);
    const plus = root.findAll((n) => typeof n.props.onPress === 'function' && tekst(n).includes('+30 min'))[0];
    await act(async () => {
      plus.props.onPress();
      await Promise.resolve();
    });
    expect(spirale(root)[0]?.props.accessibilityLabel).toMatch(/Gotowe jutro o 10:30\.$/);
  });
});
