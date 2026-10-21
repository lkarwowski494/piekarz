/**
 * Audyt niezależny D-8: przejście do innego kroku z arkusza „Plan wypieku” uruchamiało zegar tego kroku od teraz,
 * a dalsze kroki i ich powiadomienia zostawały na dawnych godzinach planu. Teraz plan od wybranego kroku przesuwa się
 * tak, że wybrany krok zaczyna się teraz (jak „Zrobione”, BR-HARMO-005) [audyt-niezalezny D-8].
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
import { planBakeSteps } from '../core/bake-steps';
import { planBakeStepNotifications } from '../core/notification-plan';
import { skokDoKroku } from '../core/step-confirm';
import { PlanWypiekuArkusz } from '../components/stolnica/PlanWypiekuArkusz';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};

describe('D-8: skok do kroku przelicza plan', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
  });

  it('jump to step 4 from the plan sheet: step 4 starts now, later steps and notifications follow it', async () => {
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    setActiveBake({ id: 'bake_d8', recipeName: 'Chleb', startedAt: start, currentStageId: steps[0].id, steps });
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => { tree = renderer.create(<StolnicaScreen />); });
    await settle();
    const przed = Date.now();
    await act(async () => {
      tree!.root.findByType(PlanWypiekuArkusz).props.onGoToStep(3);
    });
    await settle();
    const sesja = (await loadBakeSession())!;
    act(() => tree!.unmount());
    expect(sesja.stepIdx).toBe(3);
    const k = sesja.steps;
    expect(k[3].plannedStart!).toBeGreaterThanOrEqual(przed);
    expect(k[3].plannedStart!).toBeLessThanOrEqual(Date.now());
    for (let i = 4; i < k.length; i++) expect(k[i].plannedStart).toBe(k[i - 1].plannedEnd);
    expect(Math.abs((sesja.timerEndsAt ?? 0) - (k[3].plannedEnd ?? 0))).toBeLessThan(5_000);
    const pow = planBakeStepNotifications(sesja, Date.now()).find((p) => p.id.endsWith('krok.4'));
    expect(pow?.triggerAt).toBe(k[4].plannedEnd);
  });

  it('skokDoKroku: earlier steps unchanged, a step without hours does not shift anything', () => {
    const steps = planBakeSteps({ startAt: 1_000_000, isHighRye: false });
    const p = { steps, stepIdx: 0, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: null };
    const wynik = skokDoKroku(p, 2, 5_000_000);
    expect(wynik.steps.slice(0, 2)).toEqual(steps.slice(0, 2));
    expect(wynik.steps[2].plannedStart).toBe(5_000_000);
    expect(wynik.stepIdx).toBe(2);
    const bezGodzin = steps.map((s) => ({ ...s, plannedStart: null, plannedEnd: null }));
    expect(skokDoKroku({ ...p, steps: bezGodzin }, 2, 5_000_000).steps).toEqual(bezGodzin);
  });
});
