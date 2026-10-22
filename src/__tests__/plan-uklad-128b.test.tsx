// Plan wypieku jak `plan-sen` po reaudycie pętli 2 [M1-audytor-generalny-128; 04-studio-projektowe-501, 04-studio-projektowe-607]:
// karta godzin snu po temperaturze (wzorzec: pole → temperatura → noc → Spirala), opis Spirali obok niej (`.kosz`:
// rząd z zawijaniem), więc „Start … o …” nie ląduje pod paskiem kciuka; przy szerokości < 360 pt oba ±30 min w rzędzie
// dni pod polem, a nie jeden przycisk w osobnym wierszu.
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { TargetReadyCard } from '../components/harmonogram/TargetReadyCard';
import { SleepGuardBanner } from '../components/harmonogram/SleepGuardBanner';
import { setActiveBake, initDatabase } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

let mockSzerokosc = 390;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockSzerokosc, height: 844, scale: 3, fontScale: 1 }),
}));
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
/** Najbliższy przodek-element natywny (z pominięciem komponentów złożonych Chip, Pressable). */
const rodzic = (n: renderer.ReactTestInstance): renderer.ReactTestInstance | null => {
  let p = n.parent;
  while (p && typeof p.type !== 'string') p = p.parent;
  return p;
};

describe('128: plan wypieku po reaudycie pętli 2', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockSzerokosc = 390;
  });

  async function plan() {
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    jest.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 9, 21, 20, 15).getTime());
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });
    return tree;
  }

  it('karta godzin snu stoi po temperaturze w kuchni i przed Spiralą', async () => {
    const tree = await plan();
    const caly = czysty(tree.root);
    const baner = tree.root.findAllByType(SleepGuardBanner);
    expect(baner).toHaveLength(1);
    const tekstBanera = czysty(baner[0]);
    expect(tekstBanera.length).toBeGreaterThan(0);
    const iTemp = caly.indexOf('Temperatura w kuchni');
    const iBaner = caly.indexOf(tekstBanera);
    const iCalosc = caly.indexOf('Całość trwa');
    expect(iTemp).toBeGreaterThanOrEqual(0);
    expect(iBaner).toBeGreaterThan(iTemp);
    expect(iCalosc).toBeGreaterThan(iBaner);
    act(() => tree.unmount());
  });

  it('opis Spirali („Start …”, „Całość trwa …”) w jednym rzędzie ze Spiralą (kosz z zawijaniem)', async () => {
    const tree = await plan();
    const spirala = tree.root.findByProps({ testID: 'brand-spiral' });
    let rzad: renderer.ReactTestInstance | null = spirala.parent;
    while (rzad && !(typeof rzad.type === 'string' && StyleSheet.flatten(rzad.props.style)?.flexDirection === 'row')) rzad = rzad.parent;
    expect(rzad).not.toBeNull();
    const styl = StyleSheet.flatten(rzad!.props.style);
    expect(styl.flexWrap).toBe('wrap');
    expect(czysty(rzad)).toContain('Całość trwa');
    expect(czysty(rzad)).toMatch(/Start /);
    act(() => tree.unmount());
  });

  function karta() {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TargetReadyCard targetDayOffset={1} onTargetDayOffsetChange={() => {}} targetHour={7} targetMinute={0}
          onAdjustTargetTime={() => {}} formattedDayBadge="Jutro" ambientTemp={24} onAmbientTempChange={() => {}} unitSystem="metric" />,
      );
    });
    const pole = tree.root.findByProps({ testID: 'plan-pole-gotowosci' });
    const chip = (s: string) => tree.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && czysty(n) === s)[0];
    return { tree, rzadPola: rodzic(pole)!, minus: chip('-30 min'), plus: chip('+30 min'), jutro: chip('Jutro') };
  }

  // Zmiana M3 D5 (D-108): rząd dni ma 15 dni i przewija się w poziomie, więc ±30 min przy 320 pt stoją w osobnym rzędzie
  // pod nim (w przewijanym rzędzie mogłyby zniknąć za krawędzią); nadal razem i poza rzędem pola
  it('320 pt: ±30 min razem pod rzędem dni (poza przewijanym rzędem), rząd pola tylko z polem', () => {
    mockSzerokosc = 320;
    const { tree, rzadPola, minus, plus, jutro } = karta();
    expect(minus).toBeDefined();
    expect(rodzic(minus) === rodzic(plus)).toBe(true);
    expect(jutro).toBeDefined();
    expect(rodzic(minus) === rodzic(jutro)).toBe(false);
    expect(rzadPola.findAll((n) => n === minus || n === plus)).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('390 pt: ±30 min po bokach pola, jak dotąd', () => {
    mockSzerokosc = 390;
    const { tree, rzadPola, minus, plus } = karta();
    expect(rodzic(minus) === rzadPola).toBe(true);
    expect(rodzic(plus) === rzadPola).toBe(true);
    act(() => tree.unmount());
  });
});
