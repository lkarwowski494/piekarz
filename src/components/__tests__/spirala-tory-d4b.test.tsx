/**
 * Komponent Spirala z drugim torem (D-105, BR-KAL-016 „Jedna spirala z dwoma torami”): istniejąca Spirala rysuje dwa
 * plany na jednym obrazku; tor 2 kropkami (kształt), znaczniki „teraz” z numerem toru, jedna etykieta obrazu.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Spirala } from '../Spirala';
import { kolory } from '../../ui/tokeny';
import type { KrokSpirali } from '../../lib/spirala-geometria';

const PLAN: KrokSpirali[] = [
  { minuty: 60, bierny: false, noc: false },
  { minuty: 120, bierny: true, noc: false },
  { minuty: 600, bierny: true, noc: true },
  { minuty: 45, bierny: false, noc: false },
];
const PIZZA: KrokSpirali[] = [
  { minuty: 15, bierny: false, noc: false },
  { minuty: 240, bierny: true, noc: false },
  { minuty: 10, bierny: false, noc: false },
];

let tree: renderer.ReactTestRenderer | null = null;
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
});
const render = async (el: React.ReactElement) => {
  await act(async () => {
    tree = renderer.create(el);
  });
  return tree!.root;
};
/** Odcinki toru, po jednym węźle na testID (atrapa react-native-svg zagnieżdża węzły z tymi samymi propsami). */
const sciezki = (root: renderer.ReactTestInstance, tor: number) => {
  const wszystkie = root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith(`brand-spiral-tor-${tor}-odcinek-`) && n.props.strokeWidth !== undefined);
  return wszystkie.filter((n, i) => wszystkie.findIndex((m) => m.props.testID === n.props.testID) === i);
};

describe('Spirala z dwoma torami', () => {
  it('BR-KAL-016 Jedna spirala z dwoma torami: oba plany, tor 2 kropkami, numery na znacznikach', async () => {
    const root = await render(
      <Spirala kroki={PLAN} wariant="pelna" biezacy={1} postepKroku={0.4} drugi={{ kroki: PIZZA, biezacy: 1, postepKroku: 0.2 }} etykieta="Tor 1, Chleb: Składanie, 18 minut. Tor 2, Pizza: Fermentacja, 1 godzina" />
    );
    const t1 = sciezki(root, 1);
    const t2 = sciezki(root, 2);
    expect(t1).toHaveLength(PLAN.length);
    expect(t2).toHaveLength(PIZZA.length);
    // Tor 1: ciągły poza nocą w lodówce; tor 2: każdy odcinek kropkami
    expect(t1.map((s) => s.props.strokeDasharray === undefined)).toEqual([true, true, false, true]);
    expect(t2.every((s) => typeof s.props.strokeDasharray === 'string' && s.props.strokeDasharray.startsWith('0.1 '))).toBe(true);
    expect(t2.every((s) => s.props.strokeLinecap === 'round')).toBe(true);
    // Zrobiony krok toru 2 w ratanie (ten sam kolor co tor 1: rozróżnia kształt i numer)
    expect(t2[0].props.stroke).toBe(kolory.jasny.ratan);
    const numery = root.findAll((n) => typeof n.props.testID === 'string' && /^brand-spiral-numer-[12]$/.test(n.props.testID) && typeof n.props.children === 'string');
    expect([...new Set(numery.map((n) => `${n.props.testID}:${n.props.children}`))]).toEqual(['brand-spiral-numer-1:1', 'brand-spiral-numer-2:2']);
    const obraz = root.findAll((n) => n.props.testID === 'brand-spiral' && n.props.accessibilityRole === 'image')[0];
    expect(obraz.props.accessibilityLabel).toContain('Tor 2, Pizza');
    // Jeden obraz, bez drugiej Spirali
    expect(root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral' && n.props.accessibilityRole === 'image')).toHaveLength(1);
  });

  it('bez drugiego toru Spirala jak dotąd (odcinki bez numeru toru)', async () => {
    const root = await render(<Spirala kroki={PLAN} wariant="pelna" biezacy={1} postepKroku={0.4} etykieta="Plan" />);
    expect(sciezki(root, 1)).toHaveLength(0);
    expect(root.findAll((n) => n.props.testID === 'brand-spiral-odcinek-0' && n.props.strokeWidth !== undefined).length).toBeGreaterThan(0);
    expect(root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('brand-spiral-numer-'))).toHaveLength(0);
  });
});
