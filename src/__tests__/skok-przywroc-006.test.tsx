/**
 * Skok do kroku z arkusza „Plan wypieku” ma „Przywróć”, a stuknięcie bieżącego kroku nie zeruje zegara
 * [M1-audytor-generalny-006; 04-studio-projektowe-002, opcja A]: „Przywróć” odtwarza indeks kroku, godziny kroków,
 * zegar i stan „Cofnij poprzedni” sprzed skoku.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
  useLocalSearchParams: () => ({}), // Stolnica czyta id wypieku z trasy (M3 D3a)
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { loadBakeSession, saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps, isDutchOvenStep } from '../core/bake-steps';
import { PlanWypiekuArkusz } from '../components/stolnica/PlanWypiekuArkusz';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang, t } from '../lib/i18n';

import { PasekCofnijKroku } from '../components/stolnica/PasekCofnijKroku';
import { PasekKciuka } from '../components/stolnica/PasekKciuka';

const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};

describe('006: skok do kroku z „Przywróć”', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
  });

  async function ekran() {
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    setActiveBake({ id: 'bake_006', recipeName: 'Chleb', startedAt: start, currentStageId: steps[0].id, steps });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<StolnicaScreen />); });
    await settle();
    return tree;
  }

  it('po skoku pasek z „Przywróć”; „Przywróć” odtwarza krok, plan, zegar i „Cofnij poprzedni”', async () => {
    const tree = await ekran();
    await act(async () => { tree.root.findByType(PasekKciuka).props.onZrobione(); });
    await settle();
    const przed = (await loadBakeSession())!;
    expect(przed.stepIdx).toBe(1);
    expect(tree.root.findByType(PasekKciuka).props.cofnijDostepne).toBe(true);
    await act(async () => { tree.root.findByType(PlanWypiekuArkusz).props.onGoToStep(3); });
    await settle();
    expect((await loadBakeSession())!.stepIdx).toBe(3);
    const pasek = tree.root.findAllByType(PasekCofnijKroku);
    expect(pasek).toHaveLength(1);
    const napis = t('Przejście do „{krok}”: dalsze kroki i powiadomienia przesunięte.', { krok: t(przed.steps[3].name) });
    expect(JSON.stringify(tree.toJSON())).toContain(napis);
    await act(async () => { pasek[0].props.onPrzywroc(); });
    await settle();
    const po = (await loadBakeSession())!;
    expect(po.stepIdx).toBe(przed.stepIdx);
    expect(po.steps).toEqual(przed.steps);
    expect(po.timerEndsAt).toBe(przed.timerEndsAt);
    expect(tree.root.findByType(PasekKciuka).props.cofnijDostepne).toBe(true);
    expect(tree.root.findAllByType(PasekCofnijKroku)).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('stuknięcie bieżącego kroku nie zeruje zegara i nie przesuwa planu', async () => {
    const tree = await ekran();
    await act(async () => { tree.root.findByType(PasekKciuka).props.onZrobione(); });
    await settle();
    const przed = (await loadBakeSession())!;
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    await act(async () => { tree.root.findByType(PlanWypiekuArkusz).props.onGoToStep(przed.stepIdx); });
    await settle();
    const po = (await loadBakeSession())!;
    expect(po.timerEndsAt).toBe(przed.timerEndsAt);
    expect(po.steps).toEqual(przed.steps);
    expect(tree.root.findAllByType(PasekCofnijKroku)).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('zdjęcie pokrywki po skoku chowa pasek: „Przywróć” nie cofa późniejszej akcji (przegląd 006, P2-1)', async () => {
    const tree = await ekran();
    const kroki = (await loadBakeSession())!.steps;
    const garnek = kroki.findIndex((k) => isDutchOvenStep(k));
    expect(garnek).toBeGreaterThan(0);
    await act(async () => { tree.root.findByType(PlanWypiekuArkusz).props.onGoToStep(garnek); });
    await settle();
    expect(tree.root.findAllByType(PasekCofnijKroku)).toHaveLength(1);
    await act(async () => { tree.root.findByType(PasekKciuka).props.onZrobione(); });
    await settle();
    expect((await loadBakeSession())!.dutchOvenPhase).toBe('lid_off');
    expect(tree.root.findAllByType(PasekCofnijKroku)).toHaveLength(0);
    act(() => tree.unmount());
  });
});
