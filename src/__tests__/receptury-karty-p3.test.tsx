/**
 * M3 p3 (D-160, D-183): Receptury na systemie kart (docs/design/karty/README.md §1–§4, §7a; makieta
 * docs/design/karty/receptury.html: #lista, #pusty-filtr, #receptura, #skladniki; D-141 O2b). Struktura, nie wygląd:
 * lista — nagłówek grupy z ikoną nad kartami, każda receptura we własnej karcie z ikoną rodzaju, pusty filtr w karcie;
 * receptura — karta „Masa ciasta” (README §6: „Ile pieczesz”, D-185), „Do miski” z nagłówkiem w karcie (hydratacja w karcie), „O recepturze” w karcie;
 * arkusz „Składniki” — sekcje jako karty z ikonami; przy dużym tekście flexBasis zależny od fontScale, bez
 * maxFontSizeMultiplier. Zachowanie (liczby, filtr, zapis) pilnują istniejące testy 106, calculator-screen i inne.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []),
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), back: jest.fn(), setParams: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

import React from 'react';
import { ActionSheetIOS, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, _resetMemStore, saveRecipe, setActiveBake } from '../data/sqlite-store';
import { filterMasterRecipes } from '../recipes/presets';
import { clearPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ListaReceptur } from '../components/receptury/ListaReceptur';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { theme } from '../ui/theme';
import { promienie, typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

async function zamontuj(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const jeden = (root: Wezel, id: string): Wezel => {
  const w = poId(root, id);
  expect(w.length).toBeGreaterThan(0);
  return w[0];
};
const nacisnij = async (root: Wezel, id: string) => {
  const el = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
  if (!el) throw new Error(`brak ${id}`);
  await act(async () => {
    el.props.onPress();
  });
};
const jestNaglowkiemKarty = (n: Wezel) => {
  const s = StyleSheet.flatten(n.props.style) ?? {};
  return n.props.accessibilityRole === 'header' && s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
};
const naglowkiKart = (root: Wezel): string[] => root.findAllByType(Text).filter(jestNaglowkiemKarty).map(tekst);
/** Karta z danym nagłówkiem: najbliższy przodek z testID `karta…`, który zawiera ten nagłówek. */
const kartaZ = (root: Wezel, tytul: string): Wezel => {
  const n = root.findAllByType(Text).filter(jestNaglowkiemKarty).find((x) => tekst(x) === tytul);
  if (!n) throw new Error(`brak nagłówka karty „${tytul}”`);
  let p: Wezel | null = n.parent;
  while (p && !(typeof p.type === 'string' && typeof p.props.testID === 'string' && /^karta/.test(p.props.testID) && !/-(naglowek|tytul)$/.test(p.props.testID))) p = p.parent;
  if (!p) throw new Error(`nagłówek „${tytul}” poza kartą`);
  return p;
};
const maIkone = (k: Wezel) => k.findAll((n) => typeof n.props?.testID === 'string' && /^ikona-karty-/.test(n.props.testID)).length > 0;
/** Teksty z limitem skali w kartach (README §7a: w kartach bez maxFontSizeMultiplier; pas ma własną regułę). */
const bezLimituSkali = (root: Wezel) =>
  root
    .findAll((n) => typeof n.type === 'string' && typeof n.props?.testID === 'string' && /^(karta-|recipe-row-)/.test(n.props.testID))
    .flatMap((k) => k.findAllByType(Text))
    .filter((n) => n.props.maxFontSizeMultiplier !== undefined)
    .map(tekst);

describe('M3 p3: Receptury na kartach', () => {
  beforeEach(async () => {
    setLang('pl');
    Object.assign(mockOkno, { fontScale: 1 });
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    clearPendingRecipeToLoad();
    await initDatabase();
  });

  it('lista (O2b): nagłówek grupy z ikoną nad kartami; każda receptura we własnej karcie z ikoną rodzaju', async () => {
    await saveRecipe({
      id: 'moja_1', name: 'Mój wiejski 75%',
      formula: { flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }], waterPercentage: 75, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 },
      targetDDT: 25, isBuiltIn: false, createdAt: Date.now(),
    });
    const tree = await zamontuj(<RecepturyLista />);
    for (const [id, tytul] of [['grupa-moje', 'Moje receptury'], ['grupa-bazowe', 'Receptury bazowe']] as const) {
      const g = jeden(tree.root, `${id}-naglowek`);
      expect(tekst(jeden(g, `${id}-tytul`))).toBe(tytul);
      expect(maIkone(g)).toBe(true);
    }
    const ikonaRodzaju: Record<string, string> = { sourdough: 'bochenek', rye: 'sloik', yeast: 'miska', pizza: 'pizza', sweet: 'miska' };
    for (const r of filterMasterRecipes('all')) {
      const w = jeden(tree.root, `recipe-row-${r.id}`);
      const s = StyleSheet.flatten(w.props.style);
      expect(s.borderRadius).toBe(promienie.karta);
      expect(s.borderColor).toBe(theme.colors.kartaLinia);
      expect(poId(w, `ikona-karty-${ikonaRodzaju[r.category]}`)).toHaveLength(1);
    }
    expect(poId(jeden(tree.root, 'recipe-row-moja_1'), 'ikona-karty-bochenek')).toHaveLength(1);
    act(() => tree.unmount());
  });

  it('lista: pusty filtr w karcie „Receptury bazowe” z „Pokaż wszystkie”', async () => {
    // Dziś każdy rodzaj ma receptury bazowe, więc pusty filtr renderuje sama lista z pustą grupą bazowych
    const t2 = await zamontuj(<ListaReceptur onFiltr={() => undefined} bazowe={[]} moje={[]} onOtworzBazowa={() => undefined} onOtworzMoja={() => undefined} onUsunMoja={() => undefined} />);
    const k = kartaZ(t2.root, 'Receptury bazowe');
    expect(tekst(k)).toContain('Brak receptur tego rodzaju.');
    expect(poId(k, 'show-all-recipes-btn').length).toBeGreaterThan(0);
    expect(maIkone(k)).toBe(true);
    act(() => t2.unmount());
  });

  it('receptura: „Masa ciasta” (README §6: „Ile pieczesz”, D-185), „Do miski” z hydratacją i „O recepturze” w kartach z ikonami', async () => {
    const tree = await zamontuj(<EkranReceptury />);
    const naglowki = naglowkiKart(tree.root);
    for (const n of ['Masa ciasta', 'Do miski (odhaczaj przy ważeniu)', 'O recepturze']) expect(naglowki).toContain(n);
    const ile = kartaZ(tree.root, 'Masa ciasta');
    expect(poId(ile, 'recipe-mode').length).toBeGreaterThan(0);
    expect(poId(ile, 'loaves-increment-btn').length).toBeGreaterThan(0);
    const miska = kartaZ(tree.root, 'Do miski (odhaczaj przy ważeniu)');
    for (const id of ['scale-item-water', 'recipe-hydration', 'recipe-total']) expect(poId(miska, id).length).toBeGreaterThan(0);
    expect(poId(kartaZ(tree.root, 'O recepturze'), 'recipe-about').length).toBeGreaterThan(0);
    for (const n of ['Masa ciasta', 'Do miski (odhaczaj przy ważeniu)', 'O recepturze']) expect(maIkone(kartaZ(tree.root, n))).toBe(true);
    act(() => tree.unmount());
  });

  it('receptura z zaczynem: „Zaczyn: poolish” i „Do miski” jako dwie karty', async () => {
    const tree = await zamontuj(<EkranReceptury />);
    await nacisnij(tree.root, 'edit-ingredients-btn');
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    await nacisnij(tree.root, 'preferment-type-btn');
    await act(async () => sheet.mock.calls[0][1](1));
    expect(poId(kartaZ(tree.root, 'Zaczyn: poolish'), 'do-miski-zaczyn').length).toBeGreaterThan(0);
    expect(poId(kartaZ(tree.root, 'Do miski'), 'do-miski-ciasto').length).toBeGreaterThan(0);
    sheet.mockRestore();
    act(() => tree.unmount());
  });

  it('arkusz „Składniki”: sekcje jako karty z ikonami', async () => {
    const tree = await zamontuj(<EkranReceptury />);
    await nacisnij(tree.root, 'edit-ingredients-btn');
    const arkusz = jeden(tree.root, 'ingredients-sheet');
    const sekcje: [string, string][] = [
      ['Ilości liczę od', 'calc-mode-loaves'],
      ['Mąki (razem 100%)', 'add-flour-btn'],
      ['Proporcje (procent mąki)', 'water-pct-input'],
      ['Zaczyn', 'preferment-type-btn'],
    ];
    for (const [tytul, id] of sekcje) {
      const k = kartaZ(arkusz, tytul);
      expect(poId(k, id).length).toBeGreaterThan(0);
      expect(maIkone(k)).toBe(true);
    }
    // Arkusz systemowy bez zmian: tytuł i „Gotowe” w pasku arkusza, poza kartami
    expect(poId(arkusz, 'ingredients-done-btn').length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('duży tekst (AX5 przy 320 pt): flexBasis zależny od fontScale, bez maxFontSizeMultiplier', async () => {
    const pomiar = async (fs: number) => {
      Object.assign(mockOkno, { fontScale: fs });
      const tree = await zamontuj(<EkranReceptury />);
      await nacisnij(tree.root, 'edit-ingredients-btn');
      const wiersz = StyleSheet.flatten(jeden(tree.root, 'scale-item-water').props.style);
      const segment = StyleSheet.flatten(jeden(tree.root, 'calc-mode-loaves').props.style);
      const limit = bezLimituSkali(tree.root);
      act(() => tree.unmount());
      return { wiersz, segment, limit };
    };
    const maly = await pomiar(1);
    const duzy = await pomiar(3.1);
    expect(duzy.wiersz.flexWrap).toBe('wrap');
    expect(duzy.segment.flexBasis).toBe('100%');
    expect(maly.segment.flexBasis).not.toBe('100%');
    expect(duzy.limit).toEqual([]);
    expect(maly.limit).toEqual([]);
  });
});
