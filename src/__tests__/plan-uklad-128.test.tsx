// Plan wypieku w układzie wzorca `plan-sen` (design-spec §6, `docs/design/ekrany/inne.html`) [M1-audytor-generalny-128;
// 04-studio-projektowe-501]: pytanie „Kiedy chleb ma być gotowy?”, jedno pole dnia i godziny, temperatura z zakresem,
// Spirala z opisem, „Zacznij wypiek” w pasku kciuka poza przewijaną treścią (pierwszy widok przy każdej wysokości).
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ScrollView } from 'react-native';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { setActiveBake, initDatabase } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

function tekst(n: any): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n) return '';
  if (Array.isArray(n)) return n.map(tekst).join('');
  if (n.children) return tekst(n.children);
  if (n.props && n.props.children) return tekst(n.props.children);
  return '';
}
const czysty = (n: any) => tekst(n).replace(/\s+/g, ' ').trim();

function wScrollView(n: renderer.ReactTestInstance): boolean {
  for (let p: renderer.ReactTestInstance | null = n.parent; p; p = p.parent) if (p.type === ScrollView) return true;
  return false;
}

describe('Plan wypieku: układ `plan-sen` (128)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    // Zegar stały (SYS-06): 21.10.2026 02:00
    jest.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 9, 21, 2, 0).getTime());
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    act(() => tree?.unmount());
    tree = null;
  });

  it('kolejność sekcji jak `plan-sen`: pytanie, pole godziny, temperatura z zakresem, Spirala z opisem, kroki', () => {
    const root = tree!.root;
    const caly = czysty(root);
    const pole = root.findByProps({ testID: 'plan-pole-gotowosci' });
    const kolejnosc = [
      caly.indexOf('Kiedy chleb ma być gotowy?'),
      caly.indexOf(czysty(pole)),
      caly.indexOf('Temperatura w kuchni'),
      // zakres modelu z pliku treści (FER-Q10-002, docs/tresci/pl/fermentacja-temperatura.md), nie zdanie robocze makiety
      caly.indexOf('ważne w 20–26 °C'),
      caly.indexOf('Całość trwa'),
      caly.indexOf('Studzenie na kratce'),
    ];
    expect(kolejnosc.every((i) => i >= 0)).toBe(true);
    expect([...kolejnosc].sort((a, b) => a - b)).toEqual(kolejnosc);
  });

  it('„Zacznij wypiek” w pasku kciuka poza przewijaną treścią', () => {
    const root = tree!.root;
    const pasek = root.findByProps({ testID: 'plan-thumb-bar' });
    expect(wScrollView(pasek)).toBe(false);
    const start = root.findByProps({ testID: 'plan-start-bake-btn' });
    expect(wScrollView(start)).toBe(false);
    expect(czysty(start)).toBe('Zacznij wypiek');
  });

  it('bez dawnego ekranu ustawień w pierwszym widoku: scenariusze, 5 chipów godziny, ustawienia nocy i lodówki po krokach', () => {
    const root = tree!.root;
    const caly = czysty(root);
    expect(caly).not.toContain('Scenariusze wypieku');
    expect(caly).not.toContain('Godzina podania na stół');
    expect(root.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('scenario-'))).toHaveLength(0);
    const przyciski = root.findAll((n) => typeof n.props?.onPress === 'function').map((p) => czysty(p.props.children));
    for (const h of ['08:00', '13:00', '18:00', '20:00']) expect(przyciski).not.toContain(h);
    // Godziny snu i czas w lodówce zostają dostępne, ale pod listą kroków (poza pierwszym widokiem)
    const krokiKoniec = caly.indexOf('Studzenie na kratce');
    expect(caly.indexOf('Godziny snu')).toBeGreaterThan(krokiKoniec);
    expect(caly.indexOf('Czas w lodówce')).toBeGreaterThan(krokiKoniec);
  });
});
