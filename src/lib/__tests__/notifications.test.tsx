/** Adapter powiadomień i baner braku zgody (ADR-006) [M1-audytor-generalny-006]. */
import React from 'react';
import { Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Notifications from 'expo-notifications';
import {
  getNotificationPermission,
  ensureNotificationPermission,
  subscribeNotificationPermission,
  notificationText,
  configureNotificationHandler,
  resyncNotifications,
  NotificationPermission,
} from '../notifications';
import { NotificationsOffBanner } from '../../components/NotificationsOffBanner';
import { setLang } from '../i18n';
import type { NotificationKind, NotificationLevel, NotificationTextKey, PlannedNotification } from '../../core/notification-plan';

type Mock = { pending: Map<string, unknown>; iosStatus: number; grantOnRequest: boolean };
const mock = (Notifications as unknown as { __mock: Mock }).__mock;

const planned = (textKey: NotificationTextKey, params: Record<string, string>): PlannedNotification => {
  const kind: NotificationKind = textKey.startsWith('krok') ? 'krok' : 'karmienie';
  const level: NotificationLevel = 'active';
  return { id: 'piekarz.x', kind, level, textKey, params, triggerAt: 1, route: '/stolnica' };
};

describe('notifications adapter (006)', () => {
  beforeEach(() => {
    mock.pending.clear();
    mock.iosStatus = 0;
    mock.grantOnRequest = true;
    jest.clearAllMocks();
    setLang('pl');
  });

  it('getNotificationPermission maps iOS statuses', async () => {
    const seen: NotificationPermission[] = [];
    for (const s of [0, 1, 2, 3]) {
      mock.iosStatus = s;
      seen.push(await getNotificationPermission());
    }
    expect(seen).toEqual(['undetermined', 'denied', 'granted', 'granted']);
  });

  it('ensureNotificationPermission asks only when undetermined and notifies listeners', async () => {
    const heard: NotificationPermission[] = [];
    const off = subscribeNotificationPermission((s) => heard.push(s));
    expect(await ensureNotificationPermission()).toBe('granted');
    expect(await ensureNotificationPermission()).toBe('granted');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    off();
    await resyncNotifications();
    expect(heard).toEqual(['granted', 'granted']);
  });

  it('notificationText gives a title and body for every key, in Polish and English', () => {
    const keys: NotificationTextKey[] = ['krok.koniec', 'krok.zdejmijPokrywke', 'krok.wypiekGotowy', 'karmienie.blat', 'karmienie.lodowkaPrzypomnienie', 'karmienie.lodowkaTermin'];
    for (const k of keys) {
      const txt = notificationText(planned(k, { stepId: 'step_1', starterName: 'Ania' }));
      expect(txt.title.length).toBeGreaterThan(0);
      expect(txt.body.length).toBeGreaterThan(0);
    }
    expect(notificationText(planned('karmienie.blat', { starterName: 'Ania' })).body).toBe('Zakwas „Ania” stoi na blacie od doby bez karmienia.');
    setLang('en');
    expect(notificationText(planned('krok.zdejmijPokrywke', {})).title).toBe('Take the lid off');
    setLang('pl');
  });

  it('configureNotificationHandler: step alarms show without sound (timer-audio plays), feeding with sound', async () => {
    configureNotificationHandler();
    const handler = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0];
    const krok = await handler.handleNotification({ request: { content: { data: { kind: 'krok' } } } });
    const karm = await handler.handleNotification({ request: { content: { data: { kind: 'karmienie' } } } });
    expect(krok).toEqual(expect.objectContaining({ shouldShowBanner: true, shouldPlaySound: false, shouldSetBadge: false }));
    expect(karm.shouldPlaySound).toBe(true);
  });

  it('NotificationsOffBanner appears only without permission and opens system Settings', async () => {
    mock.iosStatus = 1;
    const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<NotificationsOffBanner />);
    });
    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Powiadomienia wyłączone');
    expect(text).toContain('Zegar działa w aplikacji, ale przy zablokowanym telefonie nie przypomni o końcu kroku ani o karmieniu.');
    expect(text).toContain('Otwórz Ustawienia');
    await act(async () => {
      tree!.root.findByProps({ testID: 'notifications-open-settings' }).props.onPress();
    });
    expect(open).toHaveBeenCalled();
    mock.iosStatus = 2;
    await act(async () => {
      await resyncNotifications();
    });
    expect(tree!.toJSON()).toBeNull();
    act(() => tree!.unmount());
    open.mockRestore();
  });
});
