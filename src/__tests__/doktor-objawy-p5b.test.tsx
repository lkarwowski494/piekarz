/**
 * M3 p5b (D-200, D-198; karty/README.md §2 „pole wyboru objawu”): objawy Doktora Chleba jako wiersze `PoleObjawu`
 * (rola checkbox ze stanem checked, kwadrat 28×28) zamiast chipów — jedna kontrolka objawów w zakwasie i w Doktorze.
 * Wybór objawu dalej daje diagnozę (zachowanie bez zmian: doktor-screen, prosba-o-ocene-po-doktorze-n12).
 * §7a / D-142: przy AX5 (fontScale 3,1) szablony i protokoły ratunkowe zawijają się w rzędy zamiast przewijania
 * w poziomie; przy zwykłym tekście przewijanie w poziomie jak dotąd.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import DoctorScreen from '../../app/doktor';
import { setLang, t } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;

const OBJAWY: Record<string, string[]> = {
  'karta-miekisz': [
    'Wielkie dziury pod skórką i zbity dół (Jaskinie)',
    'Drobne, jednolite pęcherzyki jak gąbka/pianka',
    'Mokry, lepki miękisz, brudzi nóż',
    'Jednolicie gęsty i ciężki miękisz (brak napowietrzenia)',
  ],
  'karta-skorka': [
    'Chleb płaski jak dysk (rozlał się na boki)',
    'Opadł / zapadł się natychmiast po nacięciu żyletką',
    'Rozerwanie boku przy spodzie',
    'Blada skórka, brak złocisto-karmelowego rumienia',
    'Brak otwartego ucha (nacięcie się zasklepiło)',
    'Krojony gorący, prosto po wyjęciu z piekarnika',
  ],
  'karta-smak': ['Zbyt kwaśny, octowy smak', 'Płaski smak bez głębi (jałowy)'],
};

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj(): Promise<Wezel> {
  await act(async () => {
    tree = renderer.create(<DoctorScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!.root;
}
const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const host = (root: Wezel, id: string): Wezel => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string')[0];
const pola = (karta: Wezel): Wezel[] => karta.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'checkbox');

beforeEach(() => {
  setLang('pl');
  mockOkno.fontScale = 1;
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  mockOkno.fontScale = 1;
});

describe('p5b: objawy Doktora Chleba jako wiersze PoleObjawu (README §2, D-198)', () => {
  it('każda karta objawów ma wiersze z polem wyboru (checkbox, niezaznaczone na starcie), bez chipów-przycisków', async () => {
    const root = await zamontuj();
    for (const [id, objawy] of Object.entries(OBJAWY)) {
      const karta = host(root, id);
      const w = pola(karta);
      expect([id, w.map((n) => n.props.accessibilityLabel)]).toEqual([id, objawy.map((o) => t(o))]);
      expect(w.every((n) => n.props.accessibilityState?.checked === false)).toBe(true);
      expect(karta.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'button')).toHaveLength(0);
    }
  });

  it('stuknięcie wiersza zaznacza objaw (checked, znak w polu) i pokazuje diagnozę; drugie odznacza', async () => {
    const root = await zamontuj();
    const wiersz = () => pola(host(root, 'karta-miekisz'))[0];
    const pole = root.findAll((n) => n.props.accessibilityRole === 'checkbox' && typeof n.props.onPress === 'function')[0];
    await act(async () => pole.props.onPress());
    expect(wiersz().props.accessibilityState.checked).toBe(true);
    expect(wiersz().findAll((n) => typeof n.type === 'string' && String(n.props.testID ?? '').endsWith('-znak'))).toHaveLength(1);
    expect(tekst(root)).toContain(t('Niedofermentowanie'));
    await act(async () => pole.props.onPress());
    expect(wiersz().props.accessibilityState.checked).toBe(false);
    expect(tekst(root)).toContain(t('Wybierz objawy bochenka'));
  });
});

describe('p5b §7a / D-142: Doktor Chleba przy AX5', () => {
  const przewijania = (root: Wezel, karta: string) => host(root, karta).findAllByType(ScrollView);

  it.each(['karta-szablony', 'karta-protokoly'])('%s: AX5 — rząd zawijany zamiast przewijania w poziomie', async (karta) => {
    mockOkno.fontScale = 3.1;
    const root = await zamontuj();
    const [s] = przewijania(root, karta);
    expect(s.props.horizontal).toBe(false);
    expect(StyleSheet.flatten(s.props.contentContainerStyle)).toEqual(expect.objectContaining({ flexDirection: 'row', flexWrap: 'wrap' }));
  });

  it.each(['karta-szablony', 'karta-protokoly'])('%s: tekst domyślny — przewijanie w poziomie jak dotąd', async (karta) => {
    const root = await zamontuj();
    const [s] = przewijania(root, karta);
    expect(s.props.horizontal).toBe(true);
  });
});

describe('p5b §7a / D-142: nagłówki w kartach Doktora przy AX5 (ikona i znacznik nad tytułem, README §7a)', () => {
  const rodzicTytulu = (root: Wezel, tytul: string): Wezel => {
    const n = root.findAll((x) => typeof x.type === 'string' && x.props.accessibilityRole === 'header' && tekst(x) === tytul)[0];
    return n.parent!;
  };
  const kierunek = (n: Wezel) => StyleSheet.flatten(n.props.style)?.flexDirection;

  it('testy w kuchni: AX5 — tytuł pod rzędem ikony i strzałki, na całą szerokość; tekst domyślny — jeden rząd', async () => {
    mockOkno.fontScale = 3.1;
    let root = await zamontuj();
    for (const tytul of ['Test palca', 'Test okna glutenowego']) {
      const naglowek = rodzicTytulu(root, t(tytul)).parent!;
      expect([tytul, kierunek(naglowek)]).toEqual([tytul, 'column']);
    }
    act(() => tree?.unmount());
    mockOkno.fontScale = 1;
    root = await zamontuj();
    expect(kierunek(rodzicTytulu(root, t('Test palca')).parent!)).toBe('row');
  });

  it('protokół ratunkowy: AX5 — „Zamknij protokół” nad tytułem (column-reverse, kolejność czytania bez zmian)', async () => {
    mockOkno.fontScale = 3.1;
    const root = await zamontuj();
    const chip = root.findAll((n) => n.props.testID === 'recovery-chip-COLD_SLUGGISH' && typeof n.props.onPress === 'function')[0];
    await act(async () => chip.props.onPress());
    const karta = host(root, 'recovery-protocol-card');
    const zamknij = karta.findAll((n) => typeof n.type === 'string' && n.props.testID === 'close-recovery-card-btn')[0];
    let rzad = zamknij.parent;
    while (rzad && typeof rzad.type !== 'string') rzad = rzad.parent;
    expect(kierunek(rzad!)).toBe('column-reverse');
  });
});
