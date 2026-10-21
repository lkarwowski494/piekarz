/**
 * Audyt niezależny D-6: ochrona snu pomijała kroki bierne, które na starcie wymagają rąk (dokarmienie zakwasu,
 * autoliza = wymieszanie mąki z wodą, rozgrzanie piekarnika z garnkiem, włożenie chleba żytniego do pieca).
 * Flaga „ręce na starcie”: początek takiego kroku nie może wypaść w oknie snu; plan otwiera się na godzinie,
 * w której go nie ma, a lista kroków nie nazywa ich „Pasywne” [audyt-niezalezny D-6].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { getActiveBake, setActiveBake, initDatabase, getStarters, deleteStarter, saveStarter } from '../data/sqlite-store';
import type { StoredStarter } from '../data/db';
import { ustawZakwasPlanu } from '../lib/zakwas-planu';
import { setLang } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { DOMYSLNY_PROFIL_SNU } from '../lib/profile-snu';
import { zapiszProfilSnu } from '../lib/godziny-snu';
import { calculateReverseSchedule } from '../scheduler/reverse-scheduler';
import { startZRekamiWNocy, kolizjeKrokow } from '../lib/plan-bez-nocy';

jest.setTimeout(30000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

/** Niezależnie od kodu produkcyjnego: kroki bierne, które zaczyna ręka piekarza. */
const RECE_NA_STARCIE = ['starter_feed', 'fridge_wake_feed', 'autolyse', 'preheat_oven'];
const OKNO = { startH: 23, koniecH: 7 }; // profil domyślny Ustawień (D-066 1a)
const wSnie = (ms: number) => {
  const d = new Date(ms);
  const h = d.getHours() + d.getMinutes() / 60;
  return h >= OKNO.startH || h < OKNO.koniecH;
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const zakwasZLodowki: StoredStarter = { id: 'z1', name: 'Zakwas', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' };

describe('D-6: kroki z rękami na starcie a ochrona snu', () => {
  beforeEach(async () => {
    zUprawnieniem();
    setLang('pl');
    setActiveBake(null);
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    ustawZakwasPlanu(null);
    await zapiszProfilSnu(DOMYSLNY_PROFIL_SNU);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('plan ready at 11:15: feeding starts at 06:00 (in the sleep window) = night collision', () => {
    const plan = calculateReverseSchedule(new Date(2026, 6, 15, 11, 15), { ambientTemperatureC: 24, sleepStartHour: 23, sleepEndHour: 7 });
    const feed = plan.stages.find((s) => s.id === 'starter_feed')!;
    expect(feed.startTime.getHours()).toBe(6);
    expect(plan.stages.filter((s) => !s.isPassive && (wSnie(s.startTime.getTime()) || wSnie(s.endTime.getTime())))).toEqual([]);
    expect(feed.isSleepCollision).toBe(true);
    expect(plan.hasSleepCollision).toBe(true);
    expect(plan.sleepCollisions.map((c) => c.stageNamePl)).toContain(feed.namePl);
  });

  it.each([[0, 30], [6, 0], [12, 0], [17, 0], [20, 0], [22, 30]])(
    'clock %i:%i, starter from the fridge and from the counter: no hands-at-start step begins in the sleep window',
    async (h, m) => {
      for (const zLodowki of [false, true]) {
        for (const s of await getStarters()) await deleteStarter(s.id);
        if (zLodowki) await saveStarter(zakwasZLodowki);
        setActiveBake(null);
        jest.useFakeTimers({ now: new Date(2026, 6, 14, h, m, 0, 0), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
        let tree: renderer.ReactTestRenderer | null = null;
        await act(async () => { tree = renderer.create(<HarmonogramScreen />); });
        await act(async () => { await Promise.resolve(); });
        await act(async () => { await Promise.resolve(); });
        const teksty = tree!.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children)).join(' | ');
        expect(teksty).toContain('Ręce tylko na starcie');
        await act(async () => {
          tree!.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
        });
        const kroki = getActiveBake()!.steps!;
        const wNocy = kroki
          .filter((s) => RECE_NA_STARCIE.includes(s.id) && s.plannedStart !== null && wSnie(s.plannedStart))
          .map((s) => `${s.id} ${new Date(s.plannedStart!).toString()}`);
        expect({ zLodowki, wNocy }).toEqual({ zLodowki, wNocy: [] });
        act(() => tree!.unmount());
        jest.useRealTimers();
      }
    },
  );

  it('startZRekamiWNocy and kolizjeKrokow: only the start of a hands-at-start step counts', () => {
    const noc = new Date(2026, 6, 15, 2, 0).getTime();
    const dzien = new Date(2026, 6, 15, 9, 0).getTime();
    expect(startZRekamiWNocy({ isPassive: true, rekaNaStarcie: true, plannedStart: noc, plannedEnd: dzien }, OKNO)).toBe(true);
    expect(startZRekamiWNocy({ isPassive: true, rekaNaStarcie: true, plannedStart: dzien, plannedEnd: noc }, OKNO)).toBe(false);
    expect(startZRekamiWNocy({ isPassive: true, plannedStart: noc, plannedEnd: dzien }, OKNO)).toBe(false);
    const k = [{ name: 'Dokarmienie', isPassive: true, rekaNaStarcie: true, plannedStart: noc, plannedEnd: dzien }];
    expect(kolizjeKrokow(k, OKNO, () => '02:00')).toEqual([{ stageNamePl: 'Dokarmienie', time: '02:00' }]);
  });
});
