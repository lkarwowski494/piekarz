/**
 * M1-audytor-generalny-005, KO-018 (właściciel 2026-11-10: „A: ikony 44 pt”), D-337: w zwartym pasie prowadzenia
 * (niski ekran, np. 320×568 pt) akcje „Doktor” i „Plan wypieku” to przyciski-ikony z polem dotyku ≥ 44×44 pt
 * i etykietą VoiceOver z istniejących kluczy i18n; przy 393×852 pt przyciski z tekstem jak dotąd.
 */
jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (cb: () => void) => React.useEffect(cb, []) };
});

import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PasProwadzenia } from '../components/stolnica/PasProwadzenia';
import { IKONY_AKCJI_PASA } from '../components/stolnica/PrzyciskiProwadzenia';
import { planBakeSteps } from '../core/bake-steps';
import { setLang, t, type Lang } from '../lib/i18n';

const DOMYSLNE = Dimensions.get('window');
const krok = planBakeSteps({ startAt: 1_800_000_000_000, isHighRye: false })[9];
const ekran = (width: number, height: number) => {
  const w = { width, height, scale: 3, fontScale: 1 };
  Dimensions.set({ window: w, screen: w });
};

function pas(aktywny = true): renderer.ReactTestRenderer {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(
      <PasProwadzenia gora={20} krok={aktywny ? krok : undefined} numer={{ n: 10, m: 11 }} czas="30 min" potem={null}
        onLayout={() => undefined} onWstecz={() => undefined} onPlan={() => undefined} onDoktor={() => undefined} />,
    );
  });
  drzewo = tree;
  return tree!;
}

/** Element hosta (Pressable po renderze), nie komponent PrzyciskNaglowka o tym samym testID. */
const host = (tree: renderer.ReactTestRenderer, testID: string): renderer.ReactTestInstance => {
  const n = tree.root.findAll((x) => x.props.testID === testID && x.props.accessibilityRole !== undefined);
  expect(n.length).toBeGreaterThan(0);
  return n[0];
};
let drzewo: renderer.ReactTestRenderer | null = null;
const teksty = (n: renderer.ReactTestInstance): string[] =>
  n.findAll((x) => (x.type as unknown) === 'Text').flatMap((x) => x.props.children).filter((c: unknown) => typeof c === 'string');

describe('005 / D-337: akcje pasa jako ikony 44 pt w zwartym pasie', () => {
  afterEach(() => {
    act(() => drzewo?.unmount());
    drzewo = null;
    Dimensions.set({ window: DOMYSLNE, screen: DOMYSLNE });
    setLang('pl');
  });

  for (const jezyk of ['pl', 'fr', 'id'] as Lang[]) {
    it(`320×568, ${jezyk}: Doktor i Plan wypieku bez tekstu, ikona, etykieta VoiceOver, cel ≥ 44×44 pt (styl, bez pomiaru)`, () => {
      setLang(jezyk);
      ekran(320, 568);
      const tree = pas();
      for (const [id, etykieta, ikona] of [
        ['stolnica-doctor-shortcut-btn', t('Doktor Chleba'), IKONY_AKCJI_PASA.doktor],
        ['bake-plan-btn', t('Plan wypieku'), IKONY_AKCJI_PASA.plan],
      ] as const) {
        const btn = host(tree, id);
        expect(btn.props.accessibilityRole).toBe('button');
        expect(btn.props.accessibilityLabel).toBe(etykieta);
        expect(teksty(btn)).toEqual([]);
        expect(btn.findAll((x) => x.props.testID === `ikona-karty-${ikona}`).length).toBeGreaterThan(0);
        const s = StyleSheet.flatten(btn.props.style) as { minWidth: number; minHeight: number };
        expect(s.minWidth).toBeGreaterThanOrEqual(44);
        expect(s.minHeight).toBeGreaterThanOrEqual(44);
      }
    });
  }

  it('320×568 bez wypieku: sam Doktor jako ikona', () => {
    ekran(320, 568);
    const tree = pas(false);
    expect(tree.root.findAll((x) => x.props.testID === 'bake-plan-btn')).toHaveLength(0);
    expect(teksty(host(tree, 'stolnica-doctor-shortcut-btn'))).toEqual([]);
  });

  it('393×852: przyciski z tekstem jak dotąd (szersze i wyższe ekrany bez zmian)', () => {
    ekran(393, 852);
    const tree = pas();
    expect(teksty(host(tree, 'stolnica-doctor-shortcut-btn'))).toEqual([t('Doktor')]);
    expect(teksty(host(tree, 'bake-plan-btn'))).toEqual([t('Plan wypieku')]);
  });
});
