/**
 * Audyt niezależny D-5: „Zacznij wypiek” uruchamiał zegar kroku 1 od teraz, a kolejne kroki i powiadomienia
 * zostawały na godzinach planu (rozjazd do kilku godzin). Wariant (b): wypiek zaczęty przed godziną startu planu
 * czeka do niej — prowadzenie pokazuje czas do startu i „Start {dzień} o {godzina}”, ekran może zgasnąć,
 * powiadomienie przychodzi o starcie kroku 1, a zegar kroku 1 kończy się o planowanym końcu, więc dalsze kroki
 * i powiadomienia zgadzają się z planem. Przesunięcie całego planu na teraz (wariant a) odrzucone: plan otwiera
 * się na godzinie bez kroków czynnych w nocy (129), a przesunięcie wpychałoby je w sen [audyt-niezalezny D-5].
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
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { loadBakeSession, saveBakeSession, koniecPierwszegoWPlanie } from '../data/bake-session-store';
import { czekaNaStart } from '../lib/prowadzenie-teksty';
import type { SessionStep } from '../core/bake-steps';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeStepNotifications } from '../core/notification-plan';
import { notificationText } from '../lib/notifications';
import { StolnicaKeepAwake } from '../components/stolnica/StolnicaKeepAwake';
import { formatTime } from '../lib/format';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { setLang } from '../lib/i18n';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const button = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];

async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('D-5: wypiek zaczęty przed godziną startu planu czeka do niej', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
    for (const s of await getStarters()) await deleteStarter(s.id);
  });

  it('plan for the day after tomorrow: step 1 timer ends at the plan end, guidance shows the start, notifications follow the plan', async () => {
    const harm = await render(<HarmonogramScreen />);
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await act(async () => {
      button(harm.root, 'Zacznij wypiek').props.onPress();
    });
    act(() => harm.unmount());

    const kroki = getActiveBake()!.steps!;
    const start = kroki[0].plannedStart!;
    expect(start).toBeGreaterThan(Date.now() + 3_600_000);

    const stol = await render(<StolnicaScreen />);
    const tekst = textOf(stol.toJSON());
    // Prowadzenie: „Start {dzień} o {godzina}”, ekran nie trzyma się włączony przez godziny czekania
    expect(tekst).toContain(`o ${formatTime(start)}`);
    expect(tekst).toMatch(/Start (jutro|pojutrze|dziś)/);
    expect(stol.root.findByType(StolnicaKeepAwake).props.active).toBe(false);
    const sesja = await loadBakeSession();
    act(() => stol.unmount());

    // Zegar kroku 1 kończy się o planowanym końcu (nie teraz + czas kroku), więc kroki 2… zgadzają się z planem
    expect(sesja!.timerEndsAt).toBe(kroki[0].plannedEnd);
    const powiadomienia = planBakeStepNotifications(sesja, Date.now());
    const startPow = powiadomienia.find((p) => p.textKey === 'krok.start');
    expect(startPow?.triggerAt).toBe(start);
    expect(notificationText(startPow!).title).toBe(`${kroki[0].name}: czas zacząć`);
    expect(notificationText(startPow!).body).toBe(`Do ${formatTime(new Date(kroki[0].plannedEnd!))}.`);
    const koniec1 = powiadomienia.find((p) => p.params.stepId === kroki[0].id && p.textKey === 'krok.koniec');
    expect(koniec1?.triggerAt).toBe(kroki[0].plannedEnd);
    const krok2 = powiadomienia.find((p) => p.id.endsWith('krok.1'));
    if (kroki[1].durationMin !== null) expect(krok2?.triggerAt).toBe(kroki[1].plannedEnd);
  });

  const krok = (plannedStart: number | null, plannedEnd: number | null, durationMin: number | null = 30): SessionStep => ({
    id: 'mix', name: 'Mieszanie', category: 'mix', durationMin, isPassive: false, instructions: '', plannedStart, plannedEnd,
  });

  it('koniecPierwszegoWPlanie: plan end of step 1 only when the plan starts later and step 1 has a timer', () => {
    expect(koniecPierwszegoWPlanie([krok(5_000, 9_000)], 1_000)).toBe(9_000);
    expect(koniecPierwszegoWPlanie([krok(1_000, 9_000)], 1_000)).toBeNull();
    expect(koniecPierwszegoWPlanie([krok(null, null)], 1_000)).toBeNull();
    expect(koniecPierwszegoWPlanie([krok(5_000, 9_000, null)], 1_000)).toBeNull();
    expect(koniecPierwszegoWPlanie([], 1_000)).toBeNull();
  });

  it('czekaNaStart: only the first step before its planned start waits', () => {
    const k = [krok(5_000, 9_000), krok(9_000, 12_000)];
    expect(czekaNaStart(k, 0, 1_000)).toBe(5_000);
    expect(czekaNaStart(k, 0, 5_000)).toBeNull();
    expect(czekaNaStart(k, 1, 1_000)).toBeNull();
    expect(czekaNaStart([krok(null, null)], 0, 1_000)).toBeNull();
  });
});
