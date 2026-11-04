/**
 * M3 p7 (D-214, znalezisko 04-studio-projektowe-003; README §2, §4 „Dziś: karta pustej spirali”; makieta
 * docs/design/karty/dzis.html `<section class="karta">` wokół pustej spirali, karty.css `.kafel` z obwódką
 * `kartaLinia` i promieniem 16): pusta spirala w karcie, kafle czynności i karty dwóch trwających wypieków
 * na wyglądzie karty (tło `powierzchnia`, obwódka 1 px `kartaLinia`, promień `karta`).
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { WypiekiNaSpirali } from '../components/start/WypiekiNaSpirali';
import { WyborCzynnosci } from '../components/start/WyborCzynnosci';
import { CZYNNOSCI_STARTU } from '../lib/start-stan';
import { planBakeSteps } from '../core/bake-steps';
import { wygladKarty } from '../ui/karty/Karta';
import { setLang } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;
const H = 3_600_000;
const host = (root: Wezel, id: string): Wezel[] => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const styl = (n: Wezel) => StyleSheet.flatten(n.props.style) ?? {};
const maWygladKarty = (n: Wezel) => {
  const s = styl(n);
  return s.backgroundColor === wygladKarty.backgroundColor && s.borderWidth === wygladKarty.borderWidth &&
    s.borderColor === wygladKarty.borderColor && s.borderRadius === wygladKarty.borderRadius;
};
const wKarcie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n; p; p = p.parent) if (typeof p.type === 'string' && maWygladKarty(p)) return true;
  return false;
};
function zamontuj(el: React.ReactElement): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(el);
  });
  return tree;
}
const wypiek = (id: string, nazwa: string, stepIdx: number) => {
  const start = Date.now() - 2 * H;
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return {
    id,
    zegar: { timeLeftSec: 600, isRunning: false, isCompleted: false },
    sesja: {
      version: 2 as const, steps, stepIdx, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: 600,
      recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[stepIdx].id },
    },
  };
};

describe('M3 p7 (04-003): „Dziś” — karta pustej spirali i kafle na wyglądzie karty', () => {
  beforeEach(() => setLang('pl'));

  it('pusta spirala leży w karcie', () => {
    const tree = zamontuj(<WypiekiNaSpirali wypieki={[]} teraz={Date.now()} duzyTekst={false} onWroc={jest.fn()} />);
    const pusta = host(tree.root, 'start-pusta-spirala');
    expect(pusta).toHaveLength(1);
    expect(wKarcie(pusta[0])).toBe(true);
  });

  it.each(CZYNNOSCI_STARTU)('kafel %s: obwódka kartaLinia i promień karty', (c) => {
    const tree = zamontuj(<WyborCzynnosci czynnosc={c} duzyTekst={false} onPress={jest.fn()} />);
    const kafel = host(tree.root, `start-${c}`);
    expect(kafel).toHaveLength(1);
    expect(maWygladKarty(kafel[0])).toBe(true);
  });

  it('dwa trwające wypieki: każdy w karcie', () => {
    const tree = zamontuj(<WypiekiNaSpirali wypieki={[wypiek('a', 'Chleb', 3), wypiek('b', 'Pizza', 1)]} teraz={Date.now()} duzyTekst={false} onWroc={jest.fn()} />);
    const karty = host(tree.root, 'start-trwa-wypiek');
    expect(karty).toHaveLength(2);
    for (const k of karty) expect(maWygladKarty(k)).toBe(true);
  });
});
