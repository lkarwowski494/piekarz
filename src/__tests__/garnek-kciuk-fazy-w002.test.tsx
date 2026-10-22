/**
 * 04-studio-projektowe-002 (P1, weryfikacja W przebiegu M3): w kroku w garnku duży „Zrobione” (PasekKciuka) w fazie
 * z pokrywką przechodził od razu do następnego kroku albo do oceny. Faza bez pokrywki (DUTCH_OVEN_PHASES.lid_off)
 * znikała razem z zegarem i powiadomieniem „wypiek gotowy”. Teraz kciuk prowadzi przez fazy: w fazie lid_on
 * „Zrobione” zdejmuje pokrywkę (faza lid_off z jej zegarem i powiadomieniem), a dopiero w lid_off kończy krok.
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
  useLocalSearchParams: () => ({}),
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
import { isDutchOvenStep, planBakeSteps } from '../core/bake-steps';
import { DUTCH_OVEN_PHASES } from '../core/baking-phases';
import { planBakeNotification } from '../core/notification-plan';
import { PlanWypiekuArkusz } from '../components/stolnica/PlanWypiekuArkusz';
import { PasekKciuka } from '../components/stolnica/PasekKciuka';
import { FinishBakeModal } from '../components/stolnica/FinishBakeModal';
import { StrefaKroku } from '../components/stolnica/StrefaKroku';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};

describe('04-studio-projektowe-002: kciuk „Zrobione” prowadzi przez fazy garnka', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
  });

  it('w fazie z pokrywką „Zrobione” zdejmuje pokrywkę: ten sam krok, faza lid_off z zegarem i powiadomieniem', async () => {
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    const garnek = steps.findIndex(isDutchOvenStep);
    expect(garnek).toBeGreaterThan(0);
    setActiveBake({ id: 'bake_w002', recipeName: 'Chleb', startedAt: start, currentStageId: steps[0].id, steps });
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => { tree = renderer.create(<StolnicaScreen />); });
    await settle();
    await act(async () => { tree!.root.findByType(PlanWypiekuArkusz).props.onGoToStep(garnek); });
    await settle();
    expect((await loadBakeSession())!.dutchOvenPhase).toBe('lid_on');

    const przed = Date.now();
    await act(async () => { tree!.root.findByType(PasekKciuka).props.onZrobione(); });
    await settle();
    const sesja = (await loadBakeSession())!;
    expect(sesja.stepIdx).toBe(garnek);
    expect(sesja.dutchOvenPhase).toBe('lid_off');
    const fazaMs = DUTCH_OVEN_PHASES.lid_off.durationMin * 60_000;
    expect(sesja.timerEndsAt!).toBeGreaterThanOrEqual(przed + fazaMs);
    expect(sesja.timerEndsAt!).toBeLessThanOrEqual(Date.now() + fazaMs);
    const pow = planBakeNotification({ ...sesja, id: 'bake_w002' }, Date.now());
    expect(pow?.textKey).toBe('krok.wypiekGotowy');
    expect(pow?.triggerAt).toBe(sesja.timerEndsAt);
    expect(tree!.root.findByType(FinishBakeModal).props.visible).toBe(false);

    // Drugie „Zrobione” (faza bez pokrywki) kończy krok jak dotąd
    await act(async () => { tree!.root.findByType(PasekKciuka).props.onZrobione(); });
    await settle();
    const po = (await loadBakeSession())!;
    act(() => tree!.unmount());
    expect(po.stepIdx).toBe(garnek + 1);
  });

  it('04-studio-projektowe-019: ponowne stuknięcie aktywnej fazy nie zeruje zegara; zmiana fazy działa jak dotąd', async () => {
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    const garnek = steps.findIndex(isDutchOvenStep);
    setActiveBake({ id: 'bake_w019', recipeName: 'Chleb', startedAt: start, currentStageId: steps[0].id, steps });
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => { tree = renderer.create(<StolnicaScreen />); });
    await settle();
    await act(async () => { tree!.root.findByType(PlanWypiekuArkusz).props.onGoToStep(garnek); });
    await settle();
    const przed = (await loadBakeSession())!;
    expect(przed.dutchOvenPhase).toBe('lid_on');
    const teraz = Date.now();
    const zegar = jest.spyOn(Date, 'now').mockReturnValue(teraz + 5 * 60_000);
    await act(async () => { tree!.root.findByType(StrefaKroku).props.onSwitchPhase('lid_on'); });
    // Mijają 3 s i sekunda zegara (tick): ekran przelicza czas od końca kroku, odświeża się i zapisuje postęp
    zegar.mockReturnValue(teraz + 5 * 60_000 + 3_000);
    await act(async () => { await new Promise((r) => setTimeout(r, 1100)); });
    await settle();
    expect((await loadBakeSession())!.timerEndsAt).toBe(przed.timerEndsAt);
    await act(async () => { tree!.root.findByType(StrefaKroku).props.onSwitchPhase('lid_off'); });
    await settle();
    const po = (await loadBakeSession())!;
    zegar.mockRestore();
    act(() => tree!.unmount());
    expect(po.dutchOvenPhase).toBe('lid_off');
    expect(po.timerEndsAt).toBe(teraz + 5 * 60_000 + 3_000 + DUTCH_OVEN_PHASES.lid_off.durationMin * 60_000);
  });
});
