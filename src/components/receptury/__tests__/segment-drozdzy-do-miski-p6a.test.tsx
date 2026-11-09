/**
 * M3 p6a (D-136, D-200, BR-KALK-012): wybór „świeże / suche” przy wierszu drożdży na karcie „Do miski” — ten sam
 * wybór co w arkuszu „Składniki” (rodzaj_drozdzy w app_settings, zapiszRodzajDrozdzy z guardSave; bez migracji).
 * Makieta docs/design/karty/receptury.html #receptura-drozdze; README §4 (wiersz D-136), §7a (duży tekst).
 * Gramy liczone z gramyDrozdzy (przelicznik RD-19 w jednym miejscu, convertYeast), nie z wpisanej liczby.
 */
const mockUstawienia = new Map<string, string>();
const mockZapis = { blad: false };
jest.mock('../../../data/sqlite-store', () => {
  const { StorageWriteError } = jest.requireActual('../../../data/storage-status');
  return {
    getAppSetting: jest.fn(async (k: string) => mockUstawienia.get(k)),
    setAppSetting: jest.fn(async (k: string, v: string) => {
      if (mockZapis.blad) throw new StorageWriteError('disk full');
      mockUstawienia.set(k, v);
    }),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DoMiski, DoMiskiProps } from '../DoMiski';
import { SkladnikiSheet, SkladnikiSheetProps } from '../SkladnikiSheet';
import { calculateDoughRecipe } from '../../../core/domain-rules';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../../../core/zaczyn-w-formule';
import { setLang, t } from '../../../lib/i18n';
import { formatDoseWeight } from '../../../lib/unit-converter';
import { KLUCZ_RODZAJU_DROZDZY, _resetRodzajDrozdzy, gramyDrozdzy, rodzajDrozdzy } from '../../../lib/rodzaj-drozdzy';
import { theme } from '../../../ui/theme';

type Wezel = renderer.ReactTestInstance;
const tekst = (n: Wezel): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const host = (root: Wezel, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props?.testID === id);
// Jeden element o testID: brak daje czerwień na asercji, nie TypeError
const jeden = (root: Wezel, id: string): Wezel => {
  const w = host(root, id);
  expect(w.map(() => id)).toEqual([id]);
  return w[0];
};
const nacisnij = async (root: Wezel, id: string) => {
  jeden(root, id);
  const [p] = root.findAll((n) => n.props?.testID === id && typeof n.props.onPress === 'function');
  await act(async () => {
    await p.props.onPress();
  });
};
const wybrany = (root: Wezel, id: string) => jeden(root, id).props.accessibilityState;

// 25 g drożdży świeżych: 1000 g mąki, drożdże 2,5% (kryterium BR-KALK-012)
const formula = (yeast: number, starter = 0) => ({
  flours: [{ name: 'Mąka pszenna typ 650', percentage: 100 }], waterPercentage: 68, saltPercentage: 2,
  starterPercentage: starter, extraYeastPercentage: yeast, targetDoughWeightGrams: 1000 * (1 + 0.68 + 0.02 + yeast / 100 + starter / 100),
});
function props(yeast = 2.5, starter = 0): DoMiskiProps {
  return {
    calculations: calculateDoughRecipe(formula(yeast, starter)),
    waterPct: 68, starterPct: starter, starterHydration: 100, saltPct: 2, yeastPct: yeast,
    calcMode: 'loaves', loavesCount: 1, onLoavesChange: jest.fn(), loafWeightGrams: 1000, onLoafWeightChange: jest.fn(),
    flourGrams: 1000, onFlourGramsChange: jest.fn(), prefermentType: 'direct', prefermentBreakdown: null,
  };
}
function zBiga(): DoMiskiProps {
  const f = { waterPercentage: 70, saltPercentage: 2, starterPercentage: 0, starterHydration: 100, yeastPercentage: 0.5 };
  const wej = { ...f, prefermentType: 'biga' as const, prefermentFlourPercentage: 50 };
  const proc = procentyFormulyZZaczynem(wej);
  return { ...props(), yeastPct: proc.yeastPercentage, prefermentType: 'biga', prefermentBreakdown: zaczynWFormule({ ...wej, ...proc, targetDoughWeightGrams: 1000 }) };
}
const arkusz = (yeastPct: number): SkladnikiSheetProps => ({
  visible: true, onClose: jest.fn(), calcMode: 'flour', onCalcModeChange: jest.fn(),
  flourBlend: [{ name: 'Mąka pszenna typ 650', percentage: 100, type: 'pszenna_650' }], onFlourBlendChange: jest.fn(),
  waterPct: 68, onWaterPctChange: jest.fn(), starterPct: 0, onStarterPctChange: jest.fn(),
  starterHydration: 100, onStarterHydrationChange: jest.fn(), saltPct: 2, onSaltPctChange: jest.fn(),
  yeastPct, onYeastPctChange: jest.fn(), prefermentType: 'direct', onPrefermentTypeChange: jest.fn(),
  prefermentFlourPct: 20, onPrefermentFlourPctChange: jest.fn(), prefermentBreakdown: null,
});

async function render(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  return tree!;
}
const masa = (g: number) => formatDoseWeight(g, 'metric');

describe('M3 p6a: segment drożdży przy wierszu „Do miski” (BR-KALK-012, D-136)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(() => {
    mockUstawienia.clear();
    mockUstawienia.set('unit_system', 'metric');
    mockZapis.blad = false;
    Object.assign(mockOkno, { width: 390, fontScale: 1 });
    _resetRodzajDrozdzy();
    setLang('pl');
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    jest.restoreAllMocks();
  });

  it('BR-KALK-012 Wybór przy wierszu drożdży: „suche” przy wierszu zmienia gramy wiersza bez otwierania arkusza', async () => {
    const p = props();
    expect(p.calculations.yeastGrams).toBe(25);
    tree = await render(<DoMiski {...p} />);
    const grupa = host(tree.root, 'do-miski-yeast-type');
    expect(grupa).toHaveLength(1);
    expect(grupa[0].props.accessibilityRole).toBe('radiogroup');
    expect(wybrany(tree.root, 'do-miski-yeast-fresh')).toMatchObject({ checked: true });
    expect(tekst(jeden(tree.root, 'do-miski-yeast-fresh'))).toBe(t('świeże|drożdże'));
    expect(tekst(jeden(tree.root, 'do-miski-yeast-dry'))).toBe(t('suche|drożdże'));
    expect(tekst(host(tree.root, 'scale-item-yeast')[0])).toContain(masa(25));
    await nacisnij(tree.root, 'do-miski-yeast-dry');
    expect(wybrany(tree.root, 'do-miski-yeast-dry')).toMatchObject({ checked: true, selected: true });
    expect(wybrany(tree.root, 'do-miski-yeast-fresh')).toMatchObject({ checked: false });
    const wiersz = tekst(host(tree.root, 'scale-item-yeast')[0]);
    expect(wiersz).toContain('Drożdże suche');
    expect(wiersz).toContain(masa(gramyDrozdzy(25, 'suche')));
    expect(host(tree.root, 'ingredients-sheet')).toHaveLength(0);
    expect(mockUstawienia.get(KLUCZ_RODZAJU_DROZDZY)).toBe('suche');
  });

  it('BR-KALK-012 Jeden wybór w dwóch miejscach: arkusz „Składniki” → wiersz i wiersz → arkusz', async () => {
    tree = await render(
      <View>
        <DoMiski {...props()} />
        <SkladnikiSheet {...arkusz(2.5)} />
      </View>,
    );
    await nacisnij(tree.root, 'yeast-type-dry');
    expect(wybrany(tree.root, 'do-miski-yeast-dry')).toMatchObject({ checked: true });
    expect(tekst(host(tree.root, 'scale-item-yeast')[0])).toContain(masa(gramyDrozdzy(25, 'suche')));
    await nacisnij(tree.root, 'do-miski-yeast-fresh');
    expect(wybrany(tree.root, 'yeast-type-fresh')).toMatchObject({ checked: true });
    expect(wybrany(tree.root, 'yeast-type-dry')).toMatchObject({ checked: false });
    expect(tekst(host(tree.root, 'scale-item-yeast')[0])).toContain(masa(25));
    _resetRodzajDrozdzy();
    expect(await rodzajDrozdzy()).toBe('swieze');
  });

  it('wybór zapisany w arkuszu wcześniej: karta „Do miski” otwiera się z „suche” i masą drożdży suchych', async () => {
    mockUstawienia.set(KLUCZ_RODZAJU_DROZDZY, 'suche');
    tree = await render(<DoMiski {...props()} />);
    expect(wybrany(tree.root, 'do-miski-yeast-dry')).toMatchObject({ checked: true });
    expect(tekst(host(tree.root, 'scale-item-yeast')[0])).toContain(masa(gramyDrozdzy(25, 'suche')));
  });

  it('BR-KALK-012 Receptura bez drożdży (sam zakwas) i zero drożdży: brak wiersza i brak wyboru; 0 g zostaje 0 g', async () => {
    tree = await render(<DoMiski {...props(0, 20)} />);
    expect(host(tree.root, 'scale-item-starter')).toHaveLength(1);
    expect(host(tree.root, 'scale-item-yeast')).toHaveLength(0);
    expect(host(tree.root, 'do-miski-yeast-type')).toHaveLength(0);
    expect(host(tree.root, 'do-miski-yeast-dry')).toHaveLength(0);
    // RD-19-W3: zero drożdży świeżych to zero suchych
    expect(gramyDrozdzy(0, 'suche')).toBe(0);
  });

  it('z zaczynem (biga): jeden wybór przy drożdżach, przelicza wiersze zaczynu i ciasta', async () => {
    const p = zBiga();
    const b = p.prefermentBreakdown!;
    tree = await render(<DoMiski {...p} />);
    expect(host(tree.root, 'do-miski-yeast-type')).toHaveLength(1);
    await nacisnij(tree.root, 'do-miski-yeast-dry');
    expect(tekst(host(tree.root, 'scale-item-preferment-yeast')[0])).toContain(masa(gramyDrozdzy(b.prefermentYeastGrams, 'suche')));
  });

  it('BR-KALK-012 Bez Pro: segment bez znacznika Pro i bez oferty; wybór działa', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    tree = await render(<DoMiski {...props()} />);
    expect(tekst(jeden(tree.root, 'do-miski-yeast-type'))).not.toMatch(/Pro/);
    await nacisnij(tree.root, 'do-miski-yeast-dry');
    expect(wybrany(tree.root, 'do-miski-yeast-dry')).toMatchObject({ checked: true });
    expect(alert).not.toHaveBeenCalled();
  });

  it('nieudany zapis: „Nie zapisano”, wybór działa w tej sesji', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockZapis.blad = true;
    tree = await render(<DoMiski {...props()} />);
    await nacisnij(tree.root, 'do-miski-yeast-dry');
    expect(alert).toHaveBeenCalledWith(t('Nie zapisano'), expect.any(String));
    expect(mockUstawienia.get(KLUCZ_RODZAJU_DROZDZY)).toBeUndefined();
    expect(wybrany(tree.root, 'do-miski-yeast-dry')).toMatchObject({ checked: true });
    expect(tekst(host(tree.root, 'scale-item-yeast')[0])).toContain(masa(gramyDrozdzy(25, 'suche')));
  });

  it('pole dotyku ≥ 44 pt; duży tekst (AX5 przy 320 pt): każda opcja na całą szerokość (§7a) (styl, bez pomiaru)', async () => {
    tree = await render(<DoMiski {...props()} />);
    for (const id of ['do-miski-yeast-fresh', 'do-miski-yeast-dry']) {
      const st = StyleSheet.flatten(jeden(tree.root, id).props.style);
      expect(st.minHeight).toBeGreaterThanOrEqual(theme.cele.pozostale);
      expect(st.flexBasis).not.toBe('100%');
    }
    act(() => tree?.unmount());
    Object.assign(mockOkno, { width: 320, fontScale: 3.12 });
    tree = await render(<DoMiski {...props()} />);
    for (const id of ['do-miski-yeast-fresh', 'do-miski-yeast-dry']) {
      const st = StyleSheet.flatten(jeden(tree.root, id).props.style);
      expect(st.flexBasis).toBe('100%');
      expect(st.minHeight).toBeGreaterThanOrEqual(theme.cele.pozostale);
      expect(host(tree.root, id)[0].findAll((n) => n.props.maxFontSizeMultiplier !== undefined)).toHaveLength(0);
    }
  });

  it('EN: segment labels from existing keys', async () => {
    setLang('en');
    tree = await render(<DoMiski {...props()} />);
    expect(tekst(jeden(tree.root, 'do-miski-yeast-fresh'))).toBe('fresh');
    expect(tekst(jeden(tree.root, 'do-miski-yeast-dry'))).toBe('dry');
  });
});

describe('M3 p6a: przelicznik × 0,35 przy wierszu (D-205, D-172, RD-19-W2)', () => {
  beforeEach(() => {
    mockUstawienia.clear();
    mockUstawienia.set('unit_system', 'metric');
    mockZapis.blad = false;
    Object.assign(mockOkno, { width: 390, fontScale: 1 });
    _resetRodzajDrozdzy();
    setLang('pl');
  });

  it('BR-KALK-012 Wybór przy wierszu drożdży: 25 g świeżych → 8,75 g suchych', async () => {
    const tree = await render(<DoMiski {...props()} />);
    await nacisnij(tree.root, 'do-miski-yeast-dry');
    expect(gramyDrozdzy(25, 'suche')).toBe(8.75);
    expect(tekst(jeden(tree.root, 'scale-item-yeast'))).toContain(masa(8.75));
    act(() => tree.unmount());
  });
});
