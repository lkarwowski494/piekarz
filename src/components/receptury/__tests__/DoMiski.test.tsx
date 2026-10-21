// „Do miski” na ekranie receptury (§11c 106): ilości z rachunku, stepper bochenków, odhaczanie i brak
// własnych chipów receptur oraz drugiego startu. Asercje przeniesione z testu dawnej karty
// DoMiskiScaleCard i akordeonu PRO, które nie były osiągalne z app/ [M1-audytor-generalny-149].
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DoMiski, DoMiskiProps } from '../DoMiski';
import { calculateDoughRecipe } from '../../../core/domain-rules';

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const host = (tree: renderer.ReactTestRenderer, id: string) =>
  tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);

// 960 g ciasta: 70% wody, 2% soli, 20% zakwasu o hydratacji 100% → do miski 500 g mąki, 350 g wody, 100 g zakwasu, 10 g soli
const calc = calculateDoughRecipe({
  flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
  waterPercentage: 70,
  saltPercentage: 2,
  starterPercentage: 20,
  targetDoughWeightGrams: 960,
});

const props = (over: Partial<DoMiskiProps> = {}): DoMiskiProps => ({
  calculations: calc,
  waterPct: 70,
  starterPct: 20,
  starterHydration: 100,
  saltPct: 2,
  yeastPct: 0,
  calcMode: 'loaves',
  loavesCount: 1,
  onLoavesChange: jest.fn(),
  loafWeightGrams: 960,
  onLoafWeightChange: jest.fn(),
  flourGrams: 500,
  onFlourGramsChange: jest.fn(),
  prefermentType: 'direct',
  prefermentBreakdown: null,
  ...over,
});

describe('DoMiski: ilości z rachunku receptury', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const render = async (p: DoMiskiProps) => {
    await act(async () => {
      tree = renderer.create(<DoMiski {...p} />);
    });
    return tree!;
  };
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('pokazuje masy do miski bez podwójnego liczenia mąki z zakwasu: 500 g mąki, 350 g wody, 100 g zakwasu, 10 g soli', async () => {
    const t = await render(props());
    expect(tekst(host(t, 'scale-item-flour-0')[0])).toContain('500 g');
    expect(tekst(host(t, 'scale-item-water')[0])).toContain('350 g');
    expect(tekst(host(t, 'scale-item-starter')[0])).toContain('100 g');
    expect(tekst(host(t, 'scale-item-salt')[0])).toContain('10 g');
  });

  it('mieszanka mąk: każda mąka ma swój wiersz z procentem mieszanki', async () => {
    const mieszanka = calculateDoughRecipe({
      flours: [
        { name: 'Mąka typ 750', percentage: 80 },
        { name: 'Mąka żytnia typ 720', percentage: 20 },
      ],
      waterPercentage: 70,
      saltPercentage: 2,
      starterPercentage: 0,
      targetDoughWeightGrams: 1720,
    });
    const t = await render(props({ calculations: mieszanka, starterPct: 0 }));
    expect(tekst(host(t, 'scale-item-flour-0')[0])).toMatch(/80%.*800 g/);
    expect(tekst(host(t, 'scale-item-flour-1')[0])).toMatch(/20%.*200 g/);
  });

  it('„Więcej bochenków” zgłasza 2 bochenki; „Mniej bochenków” przy 1 jest nieaktywne', async () => {
    const onLoavesChange = jest.fn();
    const t = await render(props({ onLoavesChange }));
    await act(async () => {
      t.root.findByProps({ testID: 'loaves-increment-btn' }).props.onPress();
    });
    expect(onLoavesChange).toHaveBeenCalledWith(2);
    expect(t.root.findByProps({ testID: 'loaves-decrement-btn' }).props.disabled).toBe(true);
  });

  it('dotknięcie składnika odhacza go znakiem ✓ i stanem „zaznaczone”', async () => {
    const t = await render(props());
    expect(tekst(t.root)).not.toContain('✓');
    await act(async () => {
      t.root.findByProps({ testID: 'scale-item-flour-0' }).props.onPress();
    });
    expect(tekst(host(t, 'scale-item-flour-0')[0])).toContain('✓');
    expect(host(t, 'scale-item-flour-0')[0].props.accessibilityState).toEqual({ checked: true });
  });

  // 057 (design-spec §11b): jeden wybór receptury (lista receptur) i jedna akcja „Ułóż plan” (obszar akcji)
  it('nie ma własnych chipów receptur ani przycisku startu wypieku', async () => {
    const t = await render(props());
    expect(t.root.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('preset-chip-'))).toHaveLength(0);
    for (const id of ['fast-start-bake-cta-btn', 'start-bake-btn']) {
      expect({ id, n: t.root.findAllByProps({ testID: id }).length }).toEqual({ id, n: 0 });
    }
    expect(tekst(t.root)).not.toContain('Zacznij wypiek');
  });
});
