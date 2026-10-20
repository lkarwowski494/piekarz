// Komponent Spirala (element firmowy, design-spec §2, §11b 058) [M1-audytor-generalny-058]
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Animated } from 'react-native';
import { Spirala, SpiralaWypieku, LegendaSpirali } from '../Spirala';
import { kolory } from '../../ui/tokeny';
import { setLang, t } from '../../lib/i18n';
import { planBakeSteps } from '../../core/bake-steps';
import type { KrokSpirali } from '../../lib/spirala-geometria';

const PLAN: KrokSpirali[] = [
  { minuty: 240, bierny: true, noc: false },
  { minuty: 15, bierny: false, noc: false },
  { minuty: 30, bierny: false, noc: false },
  { minuty: 30, bierny: false, noc: false },
  { minuty: 960, bierny: true, noc: true },
  { minuty: 60, bierny: true, noc: false },
];
const J = kolory.jasny;

let tree: renderer.ReactTestRenderer | null = null;
const render = async (el: React.ReactElement) => {
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!.root;
};

afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  setLang('pl');
  jest.restoreAllMocks();
});

const odcinek = (root: renderer.ReactTestInstance, i: number) =>
  root.findAll((n) => n.props.testID === `brand-spiral-odcinek-${i}` && n.props.strokeWidth !== undefined)[0];

describe('Spirala', () => {
  it('ma testID brand-spiral, rolę obrazu i etykietę z danych', async () => {
    const root = await render(<Spirala kroki={PLAN} wariant="pelna" biezacy={2} postepKroku={0.5} etykieta="Plan wypieku, krok 3 z 6" />);
    const s = root.findAll((n) => n.props.testID === 'brand-spiral' && n.props.accessibilityRole !== undefined)[0];
    expect(s.props.accessibilityRole).toBe('image');
    expect(s.props.accessibilityLabel).toBe('Plan wypieku, krok 3 z 6');
    expect(s.props.accessible).toBe(true);
  });

  it('stany kroków: grubość, kolor tokenu (hex z motywu) i kropki nocy', async () => {
    const root = await render(<Spirala kroki={PLAN} wariant="pelna" biezacy={2} postepKroku={0.5} etykieta="x" />);
    expect([odcinek(root, 0).props.strokeWidth, odcinek(root, 0).props.stroke]).toEqual([7, J.ratan]);
    expect([odcinek(root, 2).props.strokeWidth, odcinek(root, 2).props.stroke]).toEqual([9, J.ratanSzary]);
    expect([odcinek(root, 3).props.strokeWidth, odcinek(root, 3).props.stroke]).toEqual([3, J.ratanSzary]);
    expect([odcinek(root, 4).props.stroke, odcinek(root, 4).props.strokeDasharray]).toEqual([J.nocDane, '2 5']);
    expect(odcinek(root, 3).props.strokeDasharray).toBeUndefined();
    const postep = root.findAll((n) => n.props.testID === 'brand-spiral-postep' && n.props.stroke !== undefined)[0];
    expect([postep.props.stroke, postep.props.strokeWidth]).toEqual([J.tusz, 9]);
    const teraz = root.findAll((n) => n.props.testID === 'brand-spiral-teraz' && n.props.stroke !== undefined)[0];
    expect([teraz.props.stroke, teraz.props.fill]).toEqual([J.tusz, J.tlo]);
  });

  it('wariant pusty: bez etykiety, poza drzewem dostępności', async () => {
    const root = await render(<Spirala kroki={[]} wariant="pusta" />);
    const s = root.findAll((n) => n.props.testID === 'brand-spiral' && n.props.importantForAccessibility !== undefined)[0];
    expect(s.props.accessible).toBe(false);
    expect(s.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(s.props.accessibilityElementsHidden).toBe(true);
    expect(s.props.accessibilityLabel).toBeUndefined();
    expect(s.props.accessibilityRole).toBeUndefined();
    expect(root.findAll((n) => n.props.testID === 'brand-spiral-teraz')).toHaveLength(0);
    expect(root.findAll((n) => n.props.testID === 'brand-spiral-odcinek-4' && n.props.strokeWidth !== undefined).length).toBeGreaterThan(0);
  });

  it('po „Zrobione” przejście 300 ms easeOut; przy „Ogranicz ruch” bez przejścia', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(<Spirala kroki={PLAN} wariant="pelna" biezacy={1} postepKroku={1} etykieta="x" />);
    await act(async () => {
      tree!.update(<Spirala kroki={PLAN} wariant="pelna" biezacy={2} postepKroku={0} etykieta="x" />);
    });
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing.mock.calls[0][1]).toEqual(expect.objectContaining({ duration: 300, useNativeDriver: false }));
    act(() => tree?.unmount());
    tree = null;

    timing.mockClear();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await render(<Spirala kroki={PLAN} wariant="pelna" biezacy={1} postepKroku={1} etykieta="x" />);
    await act(async () => {
      tree!.update(<Spirala kroki={PLAN} wariant="pelna" biezacy={2} postepKroku={0} etykieta="x" />);
    });
    expect(timing).not.toHaveBeenCalled();
  });
});

describe('LegendaSpirali', () => {
  it('tekstem: zrobione, przed nami, noc w lodówce (skrócona)', async () => {
    const root = await render(<LegendaSpirali kroki={PLAN} />);
    const teksty = root.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children);
    expect(teksty).toEqual(expect.arrayContaining(['zrobione', 'przed nami', 'noc w lodówce (skrócona)', 'długi krok (skrócony)']));
  });

  it('bez nocy i bez skróceń: tylko zrobione i przed nami', async () => {
    const root = await render(<LegendaSpirali kroki={[{ minuty: 30, bierny: false, noc: false }]} />);
    const teksty = root.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children);
    expect([...new Set(teksty)]).toEqual(['zrobione', 'przed nami']);
  });
});

describe('SpiralaWypieku: dane z planu użytkownika', () => {
  it('etykieta z kroków sesji: krok n z N, nazwa, zostało, gotowe', async () => {
    const start = new Date(2026, 9, 20, 6, 0).getTime();
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    const root = await render(<SpiralaWypieku steps={steps} stepIdx={3} pozostaloSec={18 * 60} pelnySec={30 * 60} />);
    const s = root.findAll((n) => n.props.testID === 'brand-spiral' && n.props.accessibilityRole === 'image')[0];
    expect(s.props.accessibilityLabel).toMatch(
      new RegExp(`^Plan wypieku, krok 4 z ${steps.length}: ${t(steps[3].name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, zostało 18 minut\\. Gotowe .+ o \\d\\d:\\d\\d\\.$`),
    );
    expect(root.findAll((n) => n.props.testID === `brand-spiral-odcinek-${steps.length - 1}` && n.props.strokeWidth !== undefined).length).toBeGreaterThan(0);
  });
});
