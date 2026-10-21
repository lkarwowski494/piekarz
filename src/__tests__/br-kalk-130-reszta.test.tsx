/**
 * Reszta kryteriów BRD z zadania 130 (01-odkrywanie-501): BR-KALK-002 (hydratacja zakwasu poza polem 20–200%,
 * ER-58), BR-KALK-011 (informacja o nietypowej ilości soli, RD-27, S-37), BR-KALK-005 (udział żyta i wariant
 * żytni na ekranie receptury, RD-20) [M1-audytor-generalny-130].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SkladnikiSheet, SkladnikiSheetProps } from '../components/receptury/SkladnikiSheet';
import { DoMiski } from '../components/receptury/DoMiski';
import { calculateDoughRecipeFromFlour, convertYeast, FlourItemInput } from '../core/domain-rules';
import { ocenaSoli, OcenaSoli, SOL_TYPOWA_OD, SOL_TYPOWA_DO } from '../core/sol';
import { setLang, t } from '../lib/i18n';

jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);

async function render(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  return tree!;
}

function arkusz(nadpisz: Partial<SkladnikiSheetProps> = {}): SkladnikiSheetProps {
  return {
    visible: true, onClose: jest.fn(), calcMode: 'flour', onCalcModeChange: jest.fn(),
    flourBlend: [{ name: 'Mąka pszenna typ 650', percentage: 100, type: 'pszenna_650' }], onFlourBlendChange: jest.fn(),
    waterPct: 70, onWaterPctChange: jest.fn(), starterPct: 20, onStarterPctChange: jest.fn(),
    starterHydration: 100, onStarterHydrationChange: jest.fn(), saltPct: 2, onSaltPctChange: jest.fn(),
    yeastPct: 0, onYeastPctChange: jest.fn(), prefermentType: 'direct', onPrefermentTypeChange: jest.fn(),
    prefermentFlourPct: 20, onPrefermentFlourPctChange: jest.fn(), prefermentBreakdown: null,
    ...nadpisz,
  };
}

async function wpisz(root: renderer.ReactTestInstance, id: string, wartosc: string) {
  const pole = host(root, id)[0];
  await act(async () => {
    pole.props.onFocus?.();
    pole.props.onChangeText(wartosc);
  });
  await act(async () => {
    pole.props.onBlur?.({});
  });
}

describe('BR-KALK-002 Hydratacja zakwasu w polu 20–200% (ER-58)', () => {
  it('BR-KALK-002 Ujemna hydratacja zakwasu: −1% w polu zostaje przycięte do 20% i wynik liczy się z 20%', async () => {
    const onStarterHydrationChange = jest.fn();
    const tree = await render(<SkladnikiSheet {...arkusz({ onStarterHydrationChange })} />);
    await wpisz(tree.root, 'starter-hydration-input', '-1');
    expect(onStarterHydrationChange).toHaveBeenLastCalledWith(20);
    const r = calculateDoughRecipeFromFlour(1000, { flours: [{ name: 'Pszenna', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, starterHydration: 20 });
    expect(Number.isFinite(r.overallHydrationPercent)).toBe(true);
  });

  it('BR-KALK-002 Zakwas z samej mąki na granicy: 0% w polu zostaje przycięte do 20%', async () => {
    const onStarterHydrationChange = jest.fn();
    const tree = await render(<SkladnikiSheet {...arkusz({ onStarterHydrationChange })} />);
    await wpisz(tree.root, 'starter-hydration-input', '0');
    expect(onStarterHydrationChange).toHaveBeenLastCalledWith(20);
  });
});

describe('BR-KALK-011 Informacja o nietypowej ilości soli (RD-27, S-37)', () => {
  afterEach(() => setLang('pl'));

  it('RD-27: 1,8–2,0% typowe (granice włącznie), poza zakresem informacja', () => {
    const oceny: OcenaSoli[] = [1.79, 1.8, 1.9, 2.0, 2.01].map(ocenaSoli);
    expect(oceny).toEqual(['ponizej', 'typowa', 'typowa', 'typowa', 'powyzej']);
    expect([SOL_TYPOWA_OD, SOL_TYPOWA_DO]).toEqual([1.8, 2.0]);
    expect(ocenaSoli((20 / 1000) * 100)).toBe('typowa');
  });

  it('BR-KALK-011 Sól na granicy: 1000 g mąki i 20 g soli (2,0%) — bez informacji', async () => {
    const tree = await render(<SkladnikiSheet {...arkusz({ saltPct: 2.0 })} />);
    expect(host(tree.root, 'salt-info')).toHaveLength(0);
  });

  it('BR-KALK-011 Sól powyżej typowej: 1000 g mąki i 20,1 g soli (2,01%) — informacja bez blokady', async () => {
    const onSaltPctChange = jest.fn();
    const tree = await render(<SkladnikiSheet {...arkusz({ saltPct: 2.01, onSaltPctChange })} />);
    const info = host(tree.root, 'salt-info');
    expect(info).toHaveLength(1);
    expect(tekst(info[0])).toContain('więcej niż typowe 1,8–2,0% masy mąki');
    expect(tekst(info[0])).toContain('King Arthur Baking');
    expect(info[0].props.accessibilityRole).not.toBe('alert');
    await wpisz(tree.root, 'salt-pct-input', '2,01');
    expect(onSaltPctChange).toHaveBeenLastCalledWith(2.01);
  });

  it('BR-KALK-011 po angielsku: „more than the typical 1.8–2.0%”', async () => {
    setLang('en');
    const tree = await render(<SkladnikiSheet {...arkusz({ saltPct: 1.5 })} />);
    const info = host(tree.root, 'salt-info');
    expect(tekst(info[0])).toContain('less than the typical 1.8–2.0% of flour weight');
  });
});

describe('130: nowe teksty PL i EN (klucze z parametrami)', () => {
  afterEach(() => setLang('pl'));
  it.each([
    ['Sól {procent} to więcej niż typowe 1,8–2,0% masy mąki (według King Arthur Baking).', 'Salt at 2.5% is more than the typical 1.8–2.0% of flour weight (according to King Arthur Baking).'],
    ['Sól {procent} to mniej niż typowe 1,8–2,0% masy mąki (według King Arthur Baking).', 'Salt at 2.5% is less than the typical 1.8–2.0% of flour weight (according to King Arthur Baking).'],
    ['Udział żyta {n}%: wariant żytni, plan bez składań.', 'Rye share 2.5%: rye variant, no folds in the plan.'],
    ['Udział żyta {n}%: wariant pszenny.', 'Rye share 2.5%: wheat variant.'],
  ])('„%s” ma przekład EN', (pl, en) => {
    setLang('en');
    expect(t(pl, { procent: '2.5%', n: '2.5' })).toBe(en);
  });
});

describe('BR-KALK-009 Rodzaj drożdży: przelicznik RD-19 (S-40, S-39: × 0,4)', () => {
  it('BR-KALK-009 Świeże na suche: 10 g drożdży świeżych → 4 g suchych (RD-19-W1)', () => {
    expect(convertYeast(10, 'fresh').instantGrams).toBe(4);
    expect(convertYeast(25, 'fresh').instantGrams).toBe(10);
    expect(convertYeast(0.1, 'fresh').instantGrams).toBe(0.04);
    expect(convertYeast(4, 'instant').freshGrams).toBe(10);
  });

  it('BR-KALK-009 Ujemna masa: −1 g drożdży → błąd danych (RD-19-W4)', () => {
    expect(() => convertYeast(-1, 'fresh')).toThrow('Masa drożdży nie może być ujemna');
  });
});

describe('BR-KALK-005 Kilka mąk w recepturze: udział żyta i wariant (RD-20)', () => {
  afterEach(() => setLang('pl'));

  async function ekran(flours: FlourItemInput[]) {
    const calculations = calculateDoughRecipeFromFlour(1000, { flours, waterPercentage: 80, saltPercentage: 2, starterPercentage: 0 });
    return render(
      <DoMiski
        calculations={calculations} waterPct={80} starterPct={0} starterHydration={100} saltPct={2} yeastPct={0}
        calcMode="flour" loavesCount={1} onLoavesChange={jest.fn()} loafWeightGrams={1000} onLoafWeightChange={jest.fn()}
        flourGrams={1000} onFlourGramsChange={jest.fn()} prefermentType="direct" prefermentBreakdown={null}
      />,
    );
  }

  it('BR-KALK-005 Udział żyta wybiera wariant: 600 g żytniej i 400 g pszennej → udział żyta 60%, wariant żytni', async () => {
    const tree = await ekran([
      { name: 'Mąka żytnia typ 720', percentage: 60, type: 'zytnia_720' },
      { name: 'Mąka pszenna typ 650', percentage: 40, type: 'pszenna_650' },
    ]);
    const el = host(tree.root, 'recipe-rye-share');
    expect(tekst(el[0])).toBe('Udział żyta 60%: wariant żytni, plan bez składań.');
  });

  it('BR-KALK-005 Granica 50%: 500 g żytniej i 500 g pszennej → wariant pszenny', async () => {
    const tree = await ekran([
      { name: 'Mąka żytnia typ 720', percentage: 50, type: 'zytnia_720' },
      { name: 'Mąka pszenna typ 650', percentage: 50, type: 'pszenna_650' },
    ]);
    expect(tekst(host(tree.root, 'recipe-rye-share')[0])).toBe('Udział żyta 50%: wariant pszenny.');
  });

  it('bez mąki żytniej wiersza udziału żyta nie ma; po angielsku „Rye share 60%: rye variant”', async () => {
    const bez = await ekran([{ name: 'Mąka pszenna typ 650', percentage: 100, type: 'pszenna_650' }]);
    expect(host(bez.root, 'recipe-rye-share')).toHaveLength(0);
    setLang('en');
    const en = await ekran([
      { name: 'Mąka żytnia typ 720', percentage: 60, type: 'zytnia_720' },
      { name: 'Mąka pszenna typ 650', percentage: 40, type: 'pszenna_650' },
    ]);
    expect(tekst(host(en.root, 'recipe-rye-share')[0])).toBe('Rye share 60%: rye variant, no folds in the plan.');
  });
});
