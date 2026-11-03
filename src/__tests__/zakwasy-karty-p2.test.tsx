/**
 * M3 p2 (D-160, D-166): ekran Zakwasy i Doktor zakwasu na systemie kart (docs/design/karty/README.md §1–§4, §7a;
 * makieta docs/design/karty/zakwasy.html, 3 stany). Struktura, nie wygląd (wygląd: zrzuty):
 * czapka paska stanu; wybór zakwasu jako chipy na pasie; karty z jednym krojem nagłówka (tytul2 − 2 = 20 pt);
 * objawy przez PoleObjawu; przy dużym tekście chipy zawijane z flexBasis zależnym od fontScale, w kartach bez
 * maxFontSizeMultiplier; w src/components/zakwas koniec stylu 16/14/11/10 pt.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import fs from 'fs';
import path from 'path';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ZakwasyScreen from '../../app/(tabs)/zakwasy/index';
import DoktorZakwasuScreen from '../../app/(tabs)/zakwasy/doktor-zakwasu';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getStarters, deleteStarter, saveStarter } from '../data/sqlite-store';
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';
import { theme } from '../ui/theme';
import { typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;
const ROOT = path.join(__dirname, '..', '..');
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function zamontuj(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const jeden = (root: Wezel, id: string): Wezel => {
  const w = poId(root, id);
  expect(w.length).toBeGreaterThan(0);
  return w[0];
};
/** Nagłówki kart: tekst z rolą nagłówka w kroju tytułów i rozmiarze karty. */
const naglowkiKart = (root: Wezel): string[] =>
  root
    .findAllByType(Text)
    .filter((n) => n.props.accessibilityRole === 'header')
    .filter((n) => {
      const s = StyleSheet.flatten(n.props.style) ?? {};
      return s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
    })
    .map(tekst);

describe('M3 p2: Zakwasy na kartach', () => {
  beforeEach(async () => {
    setLang('pl');
    Object.assign(mockOkno, { fontScale: 1 });
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
  });

  it('z zakwasem: czapka paska stanu, chipy zakwasów i „Edytuj” na pasie', async () => {
    const [z] = await getStarters();
    const tree = await zamontuj(<ZakwasyScreen />);
    jeden(tree.root, 'czapka-paska');
    const pas = jeden(tree.root, 'pas-zakladki');
    expect(poId(pas, `select-starter-${z.id}`).length).toBeGreaterThan(0);
    expect(poId(pas, 'add-starter-btn').length).toBeGreaterThan(0);
    expect(poId(pas, 'edit-profile-btn').length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('z zakwasem (Pro): każda sekcja w karcie z jednym krojem nagłówka', async () => {
    const tree = await zamontuj(<ZakwasyScreen />);
    const naglowki = naglowkiKart(tree.root);
    for (const n of ['Profil zakwasu', 'Cykl dokarmiania', 'Szczyt aktywności', 'Stały dzień karmienia', 'Ilości do dokarmienia', 'Kontrola biologiczna (Bezpieczeństwo)']) {
      expect(naglowki).toContain(n);
    }
    act(() => tree.unmount());
  });

  it('bez zakwasu (Basic): zdanie na pasie, „Zakładam zakwas” i „Proporcje dokarmiania” w kartach', async () => {
    bezUprawnienia();
    for (const s of await getStarters()) await deleteStarter(s.id);
    const tree = await zamontuj(<ZakwasyScreen />);
    const pas = jeden(tree.root, 'pas-zakladki');
    expect(tekst(pas)).toContain('Nie masz jeszcze zakwasu. Dodaj zakwas, który masz, albo załóż nowy.');
    const naglowki = naglowkiKart(tree.root);
    for (const n of ['Zakładam zakwas', 'Proporcje dokarmiania', 'Kontrola biologiczna (Bezpieczeństwo)']) {
      expect(naglowki).toContain(n);
    }
    jeden(tree.root, 'add-starter-btn');
    act(() => tree.unmount());
  });

  it('objawy w karcie bezpieczeństwa i w Doktorze zakwasu przez PoleObjawu (pole 28×28)', async () => {
    const tree = await zamontuj(<ZakwasyScreen />);
    for (const id of ['check-hooch', 'check-film', 'check-mold', 'check-colored', 'check-smell']) jeden(tree.root, `${id}-kwadrat`);
    act(() => tree.unmount());
    const doktor = await zamontuj(<DoktorZakwasuScreen />);
    jeden(doktor.root, 'doktor-zakwasu-objaw-mold_signs-kwadrat');
    expect(naglowkiKart(doktor.root)).toContain('Co widzisz?');
    act(() => doktor.unmount());
  });

  it('duży tekst (AX5, fontScale 3,1): chipy zakwasów zawijane, flexBasis zależny od fontScale; w kartach bez maxFontSizeMultiplier', async () => {
    const [z] = await getStarters();
    await saveStarter({ ...z, id: 'drugi', name: 'Drugi zakwas' });
    const podstawa = async (fs: number) => {
      Object.assign(mockOkno, { fontScale: fs });
      const tree = await zamontuj(<ZakwasyScreen />);
      const rzad = StyleSheet.flatten(jeden(tree.root, 'zakwas-chipy').props.style);
      const chip = StyleSheet.flatten(jeden(tree.root, `select-starter-${z.id}`).props.style);
      const zLimitem = tree.root
        .findAll((n) => typeof n.props?.testID === 'string' && /^karta-/.test(n.props.testID) && typeof n.type === 'string')
        .flatMap((k) => k.findAllByType(Text))
        .filter((n) => n.props.maxFontSizeMultiplier !== undefined)
        .map(tekst);
      act(() => tree.unmount());
      return { rzad, flexBasis: chip.flexBasis, zLimitem };
    };
    const maly = await podstawa(1);
    const duzy = await podstawa(3.1);
    expect(duzy.rzad.flexWrap).toBe('wrap');
    expect(duzy.flexBasis).not.toEqual(maly.flexBasis);
    expect(duzy.zLimitem).toEqual([]);
  });

  it('src/components/zakwas: bez stylu 16/14/11/10 pt (rozmiary tylko z tokenów typografii)', () => {
    const dir = path.join(ROOT, 'src', 'components', 'zakwas');
    const zLiteralem = fs
      .readdirSync(dir)
      .filter((f) => /\.tsx$/.test(f) && !/Modal\.tsx$/.test(f))
      .filter((f) => /fontSize:\s*\d/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    expect(zLiteralem).toEqual([]);
  });
});
