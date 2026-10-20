/**
 * M1-audytor-generalny-104 (BR-ZAKW-006, D-052): plan wypieku z zakwasem z lodówki w realnym przepływie.
 * Plan pokazuje dokładnie jedno dokarmienie z lodówki 12 h przed mieszaniem (withFridgeWake), a „Zacznij wypiek”
 * zapisuje zakwas wypieku (ActiveBakeState.starterId), żeby karta zakwasu pokazała stan „niegotowy”.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { getActiveBake, setActiveBake, initDatabase, getStarters, deleteStarter, saveStarter } from '../data/sqlite-store';
import type { StoredStarter } from '../data/db';
import { FRIDGE_WAKE_INSTRUCTIONS, FRIDGE_WAKE_STEP_ID, FRIDGE_WAKE_STEP_NAME, mixStartOf, withFridgeWake } from '../core/fridge-wake';
import { stepsFromSchedule } from '../core/bake-steps';
import { calculateReverseSchedule } from '../scheduler/reverse-scheduler';
import { ustawZakwasPlanu, zakwasPlanu, etapyPlanu } from '../lib/zakwas-planu';
import { setLang, t } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const H = 3600_000;
const zakwas = (id: string, storageState: StoredStarter['storageState']): StoredStarter => ({
  id, name: `Zakwas ${id}`, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState,
});
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

async function renderPlan(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

async function zacznij(tree: renderer.ReactTestRenderer) {
  await act(async () => {
    tree.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
  });
}

describe('plan wypieku z zakwasem z lodówki (104, D-052)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    setLang('pl');
    setActiveBake(null);
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    ustawZakwasPlanu(null);
  });

  it('BR-ZAKW-006: zakwas z lodówki — plan ma jedno dokarmienie 12 h przed mieszaniem, „Zacznij wypiek” zapisuje starterId', async () => {
    await saveStarter(zakwas('lod', 'FRIDGE'));
    const tree = await renderPlan();
    const nazwy = tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children));
    expect(nazwy.filter((s) => s === FRIDGE_WAKE_STEP_NAME)).toHaveLength(1);
    await zacznij(tree);
    const bake = getActiveBake()!;
    expect(bake.starterId).toBe('lod');
    const steps = bake.steps!;
    const mixAt = mixStartOf(steps)!;
    const feeds = steps.filter((s) => s.category === 'starter_feed' && s.plannedStart !== null && s.plannedStart < mixAt);
    expect(feeds.map((s) => ({ id: s.id, start: s.plannedStart, end: s.plannedEnd }))).toEqual([
      { id: FRIDGE_WAKE_STEP_ID, start: mixAt - 12 * H, end: mixAt },
    ]);
    act(() => tree.unmount());
  });

  it('zakwas z blatu: plan bez kroku z lodówki, starterId zapisany', async () => {
    await saveStarter(zakwas('blat', 'ROOM_TEMP'));
    const tree = await renderPlan();
    const nazwy = tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children));
    expect(nazwy).not.toContain(FRIDGE_WAKE_STEP_NAME);
    await zacznij(tree);
    expect(getActiveBake()!.starterId).toBe('blat');
    expect(getActiveBake()!.steps!.some((s) => s.id === FRIDGE_WAKE_STEP_ID)).toBe(false);
    act(() => tree.unmount());
  });

  it('bez zakwasu: plan bez kroku z lodówki i bez starterId', async () => {
    const tree = await renderPlan();
    await zacznij(tree);
    expect(getActiveBake()!.starterId).toBeUndefined();
    act(() => tree.unmount());
  });

  it('EN: opis kroku z lodówki na osi planu po angielsku (oba zdania plan.start)', async () => {
    await saveStarter(zakwas('lod', 'FRIDGE'));
    setLang('en');
    const tree = await renderPlan();
    const teksty = tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children));
    expect(teksty).toContain(FRIDGE_WAKE_INSTRUCTIONS.map((z) => t(z)).join(' '));
    expect(teksty).not.toContain(FRIDGE_WAKE_INSTRUCTIONS.join(' '));
    act(() => tree.unmount());
  });

  it('zakwas planu: wybrany na zakładce Zakwasy, inaczej pierwszy z listy (jak domyślny na Zakwasach)', () => {
    const lista = [zakwas('a', 'ROOM_TEMP'), zakwas('b', 'FRIDGE')];
    expect(zakwasPlanu(lista)?.id).toBe('a');
    ustawZakwasPlanu('b');
    expect(zakwasPlanu(lista)?.id).toBe('b');
    ustawZakwasPlanu('usuniety');
    expect(zakwasPlanu(lista)?.id).toBe('a');
    expect(zakwasPlanu([])).toBeNull();
  });

  it('etapyPlanu: etapy harmonogramu zostają, krok z lodówki dostaje etap z własnymi godzinami', () => {
    const schedule = calculateReverseSchedule(new Date(2026, 9, 22, 10, 0), { ambientTemperatureC: 23, coldRetardHours: 14, sleepStartHour: 23, sleepEndHour: 6.5 });
    const steps = withFridgeWake(stepsFromSchedule(schedule), { storageState: 'FRIDGE' });
    const etapy = etapyPlanu(steps, schedule.stages);
    expect(etapy).toHaveLength(schedule.stages.length);
    expect(etapy.slice(1)).toEqual(schedule.stages.slice(1));
    expect(etapy[0]).toEqual(expect.objectContaining({ id: FRIDGE_WAKE_STEP_ID, namePl: FRIDGE_WAKE_STEP_NAME, durationMinutes: 720, isSleepCollision: false }));
    expect(etapy[0].endTime.getTime() - etapy[0].startTime.getTime()).toBe(12 * H);
    expect(etapyPlanu(stepsFromSchedule(schedule), schedule.stages)).toEqual(schedule.stages);
  });
});
