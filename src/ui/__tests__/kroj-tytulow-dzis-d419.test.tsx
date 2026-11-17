/**
 * Krój tytułów kart na „Dziś” po zmianie języka przy zamontowanym ekranie (KO-067, D-419, dopisek 2026-11-17).
 * Ten sam mechanizm co w `kroj-tytulow-zmiana-jezyka-d419.test.tsx`: `get fontFamily()` w `StyleSheet.create` jest
 * leniwy, więc styl z poprzedniego renderu po zmianie języka daje już nowy krój i natywny diff nie widzi zmiany.
 * Objęte: tytuł planu (`PlanyWypiekow`), nazwa kroku (`WypiekiNaSpirali`), tytuł banera (`UprzedzenieKoncaPro`).
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PlanyWypiekow } from '../../components/start/PlanyWypiekow';
import { WypiekiNaSpirali } from '../../components/start/WypiekiNaSpirali';
import { UprzedzenieKoncaPro } from '../../components/start/UprzedzenieKoncaPro';
import { planBakeSteps } from '../../core/bake-steps';
import { setLang } from '../../lib/i18n';
import { typografia } from '../tokeny';

type Wezel = renderer.ReactTestInstance;
const H = 3_600_000;
const start = Date.now();
const steps = planBakeSteps({ startAt: start + H, isHighRye: false });
const plan = { version: 1 as const, id: 'p1', recipeName: 'Chleb', plannedStartAt: start + H, steps };
const sesja = {
  id: 'a',
  zegar: { timeLeftSec: 600, isRunning: false, isCompleted: false },
  sesja: {
    version: 2 as const, steps, stepIdx: 3, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: 600,
    recipeName: 'Chleb', startedAt: start, bake: { id: 'a', recipeName: 'Chleb', startedAt: start, currentStageId: steps[3].id },
  },
};

const przypadki: Array<[string, () => React.ReactElement, (n: Wezel) => boolean]> = [
  ['PlanyWypiekow (tytuł planu)', () => <PlanyWypiekow plany={[plan]} teraz={start} naSpirali duzyTekst={false} onZobacz={jest.fn()} />,
    (n) => n.props.style !== undefined && StyleSheet.flatten(n.props.style).textAlign === 'center' && StyleSheet.flatten(n.props.style).fontWeight === '700'],
  ['WypiekiNaSpirali (nazwa kroku)', () => <WypiekiNaSpirali wypieki={[sesja]} teraz={start} duzyTekst={false} onWroc={jest.fn()} />,
    (n) => n.props.style !== undefined && StyleSheet.flatten(n.props.style).textAlign === 'center' && StyleSheet.flatten(n.props.style).fontWeight === '700'],
  ['UprzedzenieKoncaPro (tytuł banera)', () => <UprzedzenieKoncaPro wariant={{ rodzaj: 'wygaslo' }} onZamknij={jest.fn()} />,
    (n) => n.props.accessibilityRole === 'header'],
];

afterEach(() => setLang('pl'));

describe('krój tytułów na „Dziś” po zmianie języka bez ponownego montażu (D-419)', () => {
  it.each(przypadki)('%s: styl z renderu w pl zachowuje Sofię po przejściu na ru', (_n, el, szukaj) => {
    setLang('pl');
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(el()); });
    const cel = () => tree.root.findAll((n) => typeof n.type === 'string' && szukaj(n))[0]!;
    const stareProps = cel().props;
    expect(StyleSheet.flatten(stareProps.style).fontFamily).toBe(typografia.krojTytulow);
    act(() => { setLang('ru'); });
    act(() => { tree.update(el()); });
    expect(StyleSheet.flatten(cel().props.style).fontFamily).toBeUndefined();
    expect(StyleSheet.flatten(stareProps.style).fontFamily).toBe(typografia.krojTytulow);
  });
});
