/**
 * 216: wybór rodzaju drożdży w interfejsie (BR-KALK-009 „Świeże na suche”, DEC-26 a). Procent drożdży w recepturze
 * to drożdże świeże (jak drożdże zaczynu, D-060); wybór „suche” w arkuszu „Składniki” przelicza wszystkie wiersze
 * drożdży × 0,4 (RD-19) i nazywa rodzaj w wierszu i w kopii tekstowej. Wybór zostaje w app_settings (bez migracji)
 * [M1-audytor-generalny-216; M1-audytor-generalny-207].
 */
const mockUstawienia = new Map<string, string>();
jest.mock('../../../data/sqlite-store', () => ({
  getAppSetting: jest.fn(async (k: string) => mockUstawienia.get(k)),
  setAppSetting: jest.fn(async (k: string, v: string) => void mockUstawienia.set(k, v)),
}));
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DoMiski, DoMiskiProps } from '../DoMiski';
import { SkladnikiSheet, SkladnikiSheetProps } from '../SkladnikiSheet';
import { calculateDoughRecipe } from '../../../core/domain-rules';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../../../core/zaczyn-w-formule';
import { setLang, t } from '../../../lib/i18n';
import { formatRecipeText } from '../../../lib/recipe-formatter';
import {
  KLUCZ_RODZAJU_DROZDZY,
  _resetRodzajDrozdzy,
  biezacyRodzajDrozdzy,
  gramyDrozdzy,
  nazwaDrozdzy,
  parsujRodzajDrozdzy,
  rodzajDrozdzy,
  useRodzajDrozdzy,
  zapiszRodzajDrozdzy,
  type RodzajDrozdzy,
} from '../../../lib/rodzaj-drozdzy';

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);

// 1000 g mąki, drożdże 1% → 10 g drożdży świeżych (RD-19-W1)
const formula = { flours: [{ name: 'Mąka pszenna typ 650', percentage: 100 }], waterPercentage: 69, saltPercentage: 0, starterPercentage: 0, extraYeastPercentage: 1, targetDoughWeightGrams: 1700 };

function bezZaczynu(): DoMiskiProps {
  return {
    calculations: calculateDoughRecipe(formula),
    waterPct: 69, starterPct: 0, starterHydration: 100, saltPct: 0, yeastPct: 1,
    calcMode: 'loaves', loavesCount: 1, onLoavesChange: jest.fn(), loafWeightGrams: 1700, onLoafWeightChange: jest.fn(),
    flourGrams: 1000, onFlourGramsChange: jest.fn(), prefermentType: 'direct', prefermentBreakdown: null,
  };
}

function zBiga(): DoMiskiProps {
  const f = { waterPercentage: 70, saltPercentage: 2, starterPercentage: 0, starterHydration: 100, yeastPercentage: 0.5 };
  const wej = { ...f, prefermentType: 'biga' as const, prefermentFlourPercentage: 50 };
  const proc = procentyFormulyZZaczynem(wej);
  return {
    ...bezZaczynu(),
    yeastPct: proc.yeastPercentage,
    prefermentType: 'biga',
    prefermentBreakdown: zaczynWFormule({ ...wej, ...proc, targetDoughWeightGrams: 1000 }),
  };
}

async function render(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  return tree!;
}

describe('216: rodzaj drożdży (BR-KALK-009, DEC-26 a)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(() => {
    mockUstawienia.clear();
    mockUstawienia.set('unit_system', 'metric');
    _resetRodzajDrozdzy();
    setLang('pl');
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
  });

  it('domyślnie świeże: wiersz drożdży nazywa rodzaj i pokazuje 10 g', async () => {
    tree = await render(<DoMiski {...bezZaczynu()} />);
    const wiersz = host(tree.root, 'scale-item-yeast')[0];
    expect(tekst(wiersz)).toContain('Drożdże świeże (prasowane)');
    expect(tekst(wiersz)).toMatch(/10(,0)? g/);
  });

  it('BR-KALK-009 Świeże na suche: receptura z 10 g drożdży świeżych, wybór „suche” → 4 g drożdży suchych (RD-19-W1)', async () => {
    tree = await render(<DoMiski {...bezZaczynu()} />);
    await act(async () => {
      await zapiszRodzajDrozdzy('suche');
    });
    const wiersz = host(tree.root, 'scale-item-yeast')[0];
    expect(tekst(wiersz)).toContain('Drożdże suche');
    expect(tekst(wiersz)).toMatch(/(^|\s)4(,0)? g/);
    expect(tekst(wiersz)).toContain('0,4%');
    expect(tekst(wiersz)).not.toContain('świeże');
  });

  it('z zaczynem: drożdże zaczynu i ciasta przeliczone tym samym rodzajem', async () => {
    const p = zBiga();
    const b = p.prefermentBreakdown!;
    await zapiszRodzajDrozdzy('suche');
    tree = await render(<DoMiski {...p} />);
    const zaczyn = tekst(host(tree.root, 'scale-item-preferment-yeast')[0]);
    expect(zaczyn).toContain('Drożdże suche');
    expect(zaczyn).toContain(`${String(Math.round(b.prefermentYeastGrams * 0.4 * 10) / 10).replace('.', ',')}`);
  });

  it('wybór w arkuszu „Składniki” zapisuje się w app_settings i wraca po ponownym uruchomieniu', async () => {
    const props: SkladnikiSheetProps = {
      visible: true, onClose: jest.fn(), calcMode: 'flour', onCalcModeChange: jest.fn(),
      flourBlend: [{ name: 'Mąka pszenna typ 650', percentage: 100, type: 'pszenna_650' }], onFlourBlendChange: jest.fn(),
      waterPct: 70, onWaterPctChange: jest.fn(), starterPct: 0, onStarterPctChange: jest.fn(),
      starterHydration: 100, onStarterHydrationChange: jest.fn(), saltPct: 2, onSaltPctChange: jest.fn(),
      yeastPct: 1, onYeastPctChange: jest.fn(), prefermentType: 'direct', onPrefermentTypeChange: jest.fn(),
      prefermentFlourPct: 20, onPrefermentFlourPctChange: jest.fn(), prefermentBreakdown: null,
    };
    tree = await render(<SkladnikiSheet {...props} />);
    expect(host(tree.root, 'yeast-type-fresh')[0].props.accessibilityState).toMatchObject({ checked: true });
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'yeast-type-dry' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(host(tree.root, 'yeast-type-dry')[0].props.accessibilityState).toMatchObject({ checked: true });
    expect(mockUstawienia.get(KLUCZ_RODZAJU_DROZDZY)).toBe('suche');
    _resetRodzajDrozdzy();
    expect(await rodzajDrozdzy()).toBe('suche');
  });

  it('kopia tekstowa nazywa rodzaj i podaje gramy wybranego rodzaju', async () => {
    const calc = calculateDoughRecipe(formula);
    expect(formatRecipeText({ recipeName: 'Test', calc, unitSystem: 'metric' })).toMatch(/Drożdże świeże \(prasowane\): 10(,0)? g/);
    await zapiszRodzajDrozdzy('suche');
    expect(formatRecipeText({ recipeName: 'Test', calc, unitSystem: 'metric' })).toMatch(/Drożdże suche: 4(,0)? g/);
  });

  it('arkusz pokazuje grupę wyboru z objaśnieniem tylko, gdy receptura ma drożdże', async () => {
    const bez: SkladnikiSheetProps = {
      visible: true, onClose: jest.fn(), calcMode: 'flour', onCalcModeChange: jest.fn(),
      flourBlend: [{ name: 'Mąka pszenna typ 650', percentage: 100, type: 'pszenna_650' }], onFlourBlendChange: jest.fn(),
      waterPct: 70, onWaterPctChange: jest.fn(), starterPct: 20, onStarterPctChange: jest.fn(),
      starterHydration: 100, onStarterHydrationChange: jest.fn(), saltPct: 2, onSaltPctChange: jest.fn(),
      yeastPct: 0, onYeastPctChange: jest.fn(), prefermentType: 'direct', onPrefermentTypeChange: jest.fn(),
      prefermentFlourPct: 20, onPrefermentFlourPctChange: jest.fn(), prefermentBreakdown: null,
    };
    tree = await render(<SkladnikiSheet {...bez} />);
    expect(host(tree.root, 'yeast-type-fresh')).toHaveLength(0);
    act(() => tree!.update(<SkladnikiSheet {...bez} yeastPct={0.5} />));
    const caly = tekst(tree.root);
    for (const k of ['Drożdże do odważenia', 'Procent drożdży w recepturze to drożdże świeże. Drożdży suchych (instant albo aktywnych) odważysz 0,4 tej masy.']) {
      expect(caly).toContain(t(k));
    }
    expect(tekst(host(tree.root, 'yeast-type-fresh')[0])).toBe(t('świeże|drożdże'));
    expect(tekst(host(tree.root, 'yeast-type-dry')[0])).toBe(t('suche|drożdże'));
    expect(t('świeże|drożdże')).toBe('świeże');
  });

  it('funkcje modułu: parsujRodzajDrozdzy, biezacyRodzajDrozdzy, gramyDrozdzy, nazwaDrozdzy, useRodzajDrozdzy', async () => {
    const r: RodzajDrozdzy[] = ['swieze', 'suche'];
    expect(r.map((x) => parsujRodzajDrozdzy(x))).toEqual(r);
    expect(parsujRodzajDrozdzy(undefined)).toBe('swieze');
    expect(parsujRodzajDrozdzy('instant')).toBe('swieze');
    expect(biezacyRodzajDrozdzy()).toBe('swieze');
    expect(gramyDrozdzy(10, 'suche')).toBe(4);
    expect(gramyDrozdzy(25, 'suche')).toBe(10);
    expect(gramyDrozdzy(10, 'swieze')).toBe(10);
    expect(nazwaDrozdzy('suche')).toBe('Drożdże suche');
    expect(nazwaDrozdzy('swieze')).toBe('Drożdże świeże (prasowane)');
    const widziane: RodzajDrozdzy[] = [];
    function Sonda() {
      widziane.push(useRodzajDrozdzy());
      return null;
    }
    mockUstawienia.set(KLUCZ_RODZAJU_DROZDZY, 'suche');
    tree = await render(<Sonda />);
    expect(widziane[0]).toBe('swieze');
    expect(widziane[widziane.length - 1]).toBe('suche');
    expect(biezacyRodzajDrozdzy()).toBe('suche');
  });

  it('EN: dry yeast row in English', async () => {
    setLang('en');
    await zapiszRodzajDrozdzy('suche');
    tree = await render(<DoMiski {...bezZaczynu()} />);
    expect(tekst(host(tree.root, 'scale-item-yeast')[0])).toContain('Dry yeast');
  });
});
