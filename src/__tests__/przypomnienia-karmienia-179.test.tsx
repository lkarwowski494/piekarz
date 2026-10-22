/**
 * Zakwas w lodówce: jedno przypomnienie na cykl karmienia i przełącznik przypomnień o karmieniu w Ustawieniach
 * (DEC-22 a) [M1-audytor-generalny-179; 11-wzrost-503]. Przez ekrany: Zakwasy („Zapisz dokarmienie”) i Ustawienia;
 * zegar ustawiony w kilku porach doby; atrapa powiadomień z jest.setup.js.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Notifications from 'expo-notifications';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { SettingsModal } from '../components/SettingsModal';
import { initDatabase, _resetMemStore, setActiveBake, saveStarter, getStarters, deleteStarter, getAppSetting } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { planBakeSteps } from '../core/bake-steps';
import { resyncNotifications } from '../lib/notifications';
import {
  _resetPrzypomnieniaKarmienia,
  czyPrzypomnieniaKarmienia,
  parsujPrzypomnieniaKarmienia,
  usePrzypomnieniaKarmienia,
  zapiszPrzypomnieniaKarmienia,
  KLUCZ_PRZYPOMNIEN_KARMIENIA,
} from '../lib/przypomnienia-karmienia';
import { EN } from '../lib/i18n.en';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const notif = (Notifications as unknown as { __mock: { pending: Map<string, { trigger: { date: number } }>; iosStatus: number } }).__mock;
const H = 3600_000;
const D = 24 * H;
const ids = () => [...notif.pending.keys()].sort();
const karmienie = () => ids().filter((i) => i.includes('karmienie'));
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await new Promise((r) => setImmediate(r));
  });
};
async function mount(el: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(el);
  });
  await settle();
  return tree;
}

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Przypomnienia o karmieniu, zegar %s (179; BR-ZAKW-004 Zakwas w lodówce)', (_pora, teraz) => {
  beforeEach(async () => {
    zUprawnieniem();
    jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    _resetMemStore();
    _resetPrzypomnieniaKarmienia();
    setActiveBake(null);
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    await saveBakeSession(null);
    notif.pending.clear();
    notif.iosStatus = 2;
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dokarmienie zakwasu w lodówce: jedno oczekujące przypomnienie na cykl, w terminie 7 dni', async () => {
    await saveStarter({ id: 'z1', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE', lastFedAt: teraz - 2 * D });
    const tree = await mount(<ZakwasScreen />);
    const zapisz = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes('Zapisz dokarmienie'))[0];
    await act(async () => {
      await zapisz.props.onPress();
    });
    await settle();
    expect(karmienie()).toHaveLength(1);
    const [id] = karmienie();
    // 7 dni kalendarza o tej samej godzinie lokalnej (D-093), nie 7 × 24 h: przez zmianę czasu 25.10.2026 to inna chwila
    const f = new Date(teraz);
    expect(notif.pending.get(id)!.trigger.date).toBe(new Date(f.getFullYear(), f.getMonth(), f.getDate() + 7, f.getHours(), f.getMinutes(), f.getSeconds(), f.getMilliseconds()).getTime());
    act(() => tree.unmount());
  });

  it('przełącznik w Ustawieniach: wyłączony — plan karmienia pusty, kroki wypieku zostają; włączony — wraca', async () => {
    await saveStarter({ id: 'z1', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: teraz - H });
    await saveStarter({ id: 'z2', name: 'Basia', flourType: 'Pszenna', hydration: 100, birthDate: 1, storageState: 'FRIDGE', lastFedAt: teraz - D });
    const steps = planBakeSteps({ startAt: teraz, isHighRye: false }) ?? [];
    await saveBakeSession({ version: 2, steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: teraz + H, pausedLeftSec: 600, recipeName: 'Chleb', startedAt: teraz, bake: null });
    await resyncNotifications();
    expect(karmienie()).toHaveLength(2);
    expect(ids()).toContain('piekarz.wypiek.sesja-1014.krok');

    const tree = await mount(<SettingsModal visible onClose={() => undefined} />);
    // Element natywny z rolą switch (to, co czyta VoiceOver), nie komponent SwitchRow
    const przelacznik = () => tree.root.find((n) => typeof n.type === 'string' && n.props.testID === 'feeding-reminders-switch');
    const dotknij = () => tree.root.find((n) => n.props.testID === 'feeding-reminders-switch' && typeof n.props.onPress === 'function');
    expect(przelacznik().props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
    expect(przelacznik().props.accessibilityLabel).toBe('Przypomnienia o karmieniu');
    await act(async () => {
      dotknij().props.onPress();
    });
    await settle();
    expect(przelacznik().props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
    expect(karmienie()).toEqual([]);
    expect(ids()).toContain('piekarz.wypiek.sesja-1014.krok');
    expect(await czyPrzypomnieniaKarmienia()).toBe(false);

    // Następne uruchomienie pamięta wybór
    _resetPrzypomnieniaKarmienia();
    expect(await czyPrzypomnieniaKarmienia()).toBe(false);
    await resyncNotifications();
    expect(karmienie()).toEqual([]);

    await act(async () => {
      dotknij().props.onPress();
    });
    await settle();
    expect(karmienie()).toHaveLength(2);
    act(() => tree.unmount());
  });

  it('zapis wyboru: app_settings, brak albo nieznana wartość = włączone; hook słucha zmian', async () => {
    expect(parsujPrzypomnieniaKarmienia(undefined)).toBe(true);
    expect(parsujPrzypomnieniaKarmienia('x')).toBe(true);
    expect(parsujPrzypomnieniaKarmienia('0')).toBe(false);
    const widziane: boolean[] = [];
    const Sonda = () => {
      widziane.push(usePrzypomnieniaKarmienia());
      return null;
    };
    const tree = await mount(<Sonda />);
    await act(async () => {
      await zapiszPrzypomnieniaKarmienia(false);
    });
    expect(await getAppSetting(KLUCZ_PRZYPOMNIEN_KARMIENIA)).toBe('0');
    expect(widziane[widziane.length - 1]).toBe(false);
    act(() => tree.unmount());
  });

  it('nowe teksty mają wpis EN', () => {
    expect(EN['Przypomnienia o karmieniu']).toBe('Feeding reminders');
    expect(EN['Gdy zakwas czeka na karmienie. Powiadomienia o krokach wypieku działają niezależnie.']).toBe(
      "When a starter is due for feeding. Bake step notifications work regardless."
    );
  });
});
