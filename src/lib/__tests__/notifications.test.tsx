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
import { planBakeNotification, type NotificationKind, type NotificationLevel, type NotificationTextKey, type PlannedNotification } from '../../core/notification-plan';

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
    const keys: NotificationTextKey[] = ['krok.koniec', 'krok.zdejmijPokrywke', 'krok.wypiekGotowy', 'karmienie.blat', 'karmienie.lodowkaTermin'];
    for (const k of keys) {
      const txt = notificationText(planned(k, { stepId: 'step_1', starterName: 'Ania' }));
      expect(txt.title.length).toBeGreaterThan(0);
      expect(txt.body.length).toBeGreaterThan(0);
    }
    expect(notificationText(planned('karmienie.blat', { starterName: 'Ania' })).body).toBe('Zakwas „Ania” stoi na blacie od 12 godzin bez dokarmienia.'); // D-043 OP-38 [M1-audytor-generalny-090]
    setLang('en');
    expect(notificationText(planned('krok.zdejmijPokrywke', {})).title).toBe('Take the lid off');
    setLang('pl');
  });

  // Powiadomienie o końcu kroku mówi, co teraz: nazwa następnego kroku i jego godzina (design-spec §10)
  // [M1-audytor-generalny-130; 01-odkrywanie-501]
  it('koniec kroku: tytuł z nazwą następnego kroku i jego godziną; ostatni krok bez następnego (BR-CZAS-002 Koniec kroku przy zablokowanym ekranie)', () => {
    const krok = (id: string, name: string, plannedEnd: number | null) => ({ id, name, category: 'bulk_ferment' as const, plannedEnd });
    const do1430 = new Date(2026, 9, 21, 14, 30).getTime();
    const steps = [krok('bulk_ferment', 'Fermentacja burzliwa ze składaniami', null), krok('pre_shape', 'Formowanie wstępne', do1430)];
    const p = planBakeNotification({ id: 'bake_a', recipeName: 'Chleb', stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: 2_000, steps }, 1_000);
    expect(p ? notificationText(p) : null).toEqual({ title: 'Formowanie wstępne: czas zacząć', body: 'Do 14:30.' });
    const ostatni = planBakeNotification({ id: 'bake_a', recipeName: 'Chleb', stepIdx: 1, dutchOvenPhase: 'lid_on', timerEndsAt: 2_000, steps }, 1_000);
    expect(ostatni ? notificationText(ostatni) : null).toEqual({ title: 'Koniec kroku', body: 'Krok „Formowanie wstępne” dobiegł końca.' });
    setLang('en');
    expect(p ? notificationText(p).title : '').toBe('Pre-shaping (Pre-shape): time to start');
    setLang('pl');
  });

  // Przy dwóch wypiekach treść nazywa wypiek, którego krok dotyczy (M3 D2)
  it('BR-KAL-016 Który krok czyj: treść powiadomienia kroku nazywa wypiek, gdy trwają dwa; po angielsku też', () => {
    const krok = (id: string, name: string, plannedEnd: number | null) => ({ id, name, category: 'bulk_ferment' as const, plannedEnd });
    const do1430 = new Date(2026, 9, 21, 14, 30).getTime();
    const steps = [krok('bulk_ferment', 'Fermentacja burzliwa ze składaniami', null), krok('pre_shape', 'Formowanie wstępne', do1430)];
    const sesja = { id: 'bake_b', recipeName: 'Pizza neapolitańska', dutchOvenPhase: 'lid_on' as const, timerEndsAt: 2_000, steps };
    const nastepny = planBakeNotification({ ...sesja, stepIdx: 0 }, 1_000, true);
    expect(nastepny ? notificationText(nastepny) : null).toEqual({ title: 'Formowanie wstępne: czas zacząć', body: 'Do 14:30. Wypiek: Pizza neapolitańska.' });
    const ostatni = planBakeNotification({ ...sesja, stepIdx: 1 }, 1_000, true);
    expect(ostatni ? notificationText(ostatni) : null).toEqual({
      title: 'Koniec kroku',
      body: 'Krok „Formowanie wstępne” dobiegł końca. Wypiek: Pizza neapolitańska.',
    });
    const pokrywka = notificationText(planned('krok.zdejmijPokrywke', { recipeName: 'Chleb' }));
    expect(pokrywka).toEqual({ title: 'Zdejmij pokrywkę', body: 'Czas zdjąć pokrywkę z garnka i piec dalej bez pary. Wypiek: Chleb.' });
    // Start zaplanowanego wypieku bez godziny końca kroku: sama nazwa wypieku w treści
    expect(notificationText(planned('krok.start', { stepName: 'Dokarmienie zakwasu', recipeName: 'Chleb na sobotę' }))).toEqual({
      title: 'Dokarmienie zakwasu: czas zacząć',
      body: 'Wypiek: Chleb na sobotę.',
    });
    setLang('en');
    expect(ostatni ? notificationText(ostatni).body : '').toBe('The step “Pre-shaping (Pre-shape)” has finished. Bake: Pizza neapolitańska.');
    setLang('pl');
  });

  it('BR-KAL-010: stały dzień karmienia ma własną treść, nie „czeka od 7 dni”', () => {
    expect(notificationText(planned('karmienie.lodowkaDzien', { starterName: 'Ania' }))).toEqual({
      title: 'Nakarm zakwas dziś',
      body: 'Dziś ustalony dzień karmienia zakwasu „Ania”.',
    });
    setLang('en');
    expect(notificationText(planned('karmienie.lodowkaDzien', { starterName: 'Ania' })).body).toBe('Today is the set feeding day for the starter “Ania”.');
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

  it('NotificationsOffBanner appears only without permission and opens system Settings (BR-CZAS-003 Odmowa)', async () => {
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
