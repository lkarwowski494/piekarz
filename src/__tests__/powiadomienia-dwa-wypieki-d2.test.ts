/**
 * Uzgadnianie powiadomień z listą wypieków z bazy (M3 D2): dwa trwające wypieki, start zaplanowanego, stary zestaw z 1014
 * zastąpiony bez dubli i stały dzień karmienia z kolumn starters [BR-KAL-009, BR-KAL-010, BR-KAL-016].
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as Notifications from 'expo-notifications';
import { initDatabase, saveStarter } from '../data/sqlite-store';
import { dbFilePath, openRaw, useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { saveActiveBakeSession, savePlannedBake, deleteBakeSession, type PlannedBake } from '../data/bake-sessions-store';
import type { BakeSession } from '../data/bake-session-store';
import { resyncNotifications } from '../lib/notifications';
import { planBakeSteps } from '../core/bake-steps';
import { MAX_PENDING_NOTIFICATIONS } from '../core/notification-config';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

type Pending = { identifier: string; content: { title: string; body: string; data: { fp?: string } }; trigger: { date: number } };
type Mock = { pending: Map<string, Pending>; iosStatus: number; grantOnRequest: boolean };
const mock = (Notifications as unknown as { __mock: Mock }).__mock;
const ids = () => [...mock.pending.keys()].sort();
const MIN = 60_000;
const now = new Date(2026, 9, 21, 10, 0).getTime(); // środa 21.10.2026 10:00 (czas lokalny)

/** Trwający wypiek od `startedAt`: kroki z planu, zegar kroku 1 do jego planowanego końca. */
function wypiek(id: string, recipeName: string, startedAt: number): BakeSession {
  const steps = planBakeSteps({ startAt: startedAt, isHighRye: false });
  return {
    version: 2,
    steps,
    stepIdx: 0,
    dutchOvenPhase: 'lid_on',
    timerEndsAt: steps[0]!.plannedEnd,
    pausedLeftSec: null,
    recipeName,
    startedAt,
    bake: { id, recipeName, startedAt, currentStageId: steps[0]!.id },
  };
}

describe('D2: resyncNotifications z listą wypieków z bazy', () => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    mock.pending.clear();
    mock.iosStatus = 2;
    mock.grantOnRequest = true;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
    const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
    raw.exec('DELETE FROM bake_sessions; DELETE FROM starters;');
    raw.close();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('BR-KAL-016: dwa trwające wypieki mają osobne powiadomienia z nazwą wypieku w treści', async () => {
    expect(await saveActiveBakeSession(wypiek('bake_chleb', 'Chleb pszenny', now))).toEqual({ ok: true });
    expect(await saveActiveBakeSession(wypiek('bake_pizza', 'Pizza', now + 30 * MIN))).toEqual({ ok: true });
    await resyncNotifications();
    const chleb = ids().filter((id) => id.startsWith('piekarz.wypiek.bake_chleb.'));
    const pizza = ids().filter((id) => id.startsWith('piekarz.wypiek.bake_pizza.'));
    expect(chleb.length).toBeGreaterThan(5);
    expect(pizza.length).toBeGreaterThan(5);
    expect(ids().filter((id) => id.startsWith('piekarz.krok'))).toEqual([]);
    expect(ids().length).toBeLessThanOrEqual(MAX_PENDING_NOTIFICATIONS);
    for (const id of chleb) expect(mock.pending.get(id)!.content.body).toContain('Wypiek: Chleb pszenny.');
    for (const id of pizza) expect(mock.pending.get(id)!.content.body).toContain('Wypiek: Pizza.');

    // Koniec jednego wypieku: jego powiadomienia znikają, drugi zostaje bez nazwy w treści (trwa już tylko jeden)
    await deleteBakeSession('bake_pizza');
    await resyncNotifications();
    expect(ids().filter((id) => id.startsWith('piekarz.wypiek.bake_pizza.'))).toEqual([]);
    expect(ids().filter((id) => id.startsWith('piekarz.wypiek.bake_chleb.'))).toEqual(chleb);
    for (const id of chleb) expect(mock.pending.get(id)!.content.body).not.toContain('Wypiek:');
  });

  it('aktualizacja z 1014: stare piekarz.krok* zastąpione nowymi, bez dubli; obce i karmienie bez zmian', async () => {
    const stare = ['piekarz.krok', 'piekarz.krok.2', 'piekarz.krok.5.pokrywka', 'piekarz.krok.start'];
    for (const id of [...stare, 'inna-aplikacja']) {
      mock.pending.set(id, { identifier: id, content: { title: 't', body: 'b', data: { fp: 'stary' } }, trigger: { date: now + 60 * MIN } });
    }
    await saveActiveBakeSession(wypiek('bake_chleb', 'Chleb', now));
    await resyncNotifications();
    expect(ids().filter((id) => id.startsWith('piekarz.krok'))).toEqual([]);
    expect(ids()).toContain('inna-aplikacja');
    expect(ids().filter((id) => id.startsWith('piekarz.wypiek.bake_chleb.')).length).toBeGreaterThan(5);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('piekarz.krok');
    // Drugie uzgadnianie bez zmian niczego nie planuje od nowa
    const zaplanowano = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length;
    await resyncNotifications();
    expect((Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length).toBe(zaplanowano);
  });

  it('BR-KAL-009: zaplanowany wypiek ma powiadomienie o starcie, a po usunięciu planu znika', async () => {
    const start = new Date(2026, 9, 24, 8, 0).getTime();
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    const plan: PlannedBake = { version: 1, id: 'plan_sob', recipeName: 'Chleb na sobotę', plannedStartAt: start, steps };
    expect(await savePlannedBake(plan)).toEqual({ ok: true });
    await resyncNotifications();
    expect(ids()).toEqual(['piekarz.wypiek.plan_sob.start']);
    const p = mock.pending.get('piekarz.wypiek.plan_sob.start')!;
    expect(p.trigger.date).toBe(steps[0]!.plannedStart);
    expect(p.content.body).toContain('Wypiek: Chleb na sobotę.');
    await deleteBakeSession('plan_sob');
    await resyncNotifications();
    expect(ids()).toEqual([]);
  });

  it('BR-KAL-010: zakwas w lodówce ze stałym dniem (niedziela 10:00) dostaje przypomnienie w najbliższą niedzielę', async () => {
    await saveStarter({ id: 'z1', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE', lastFedAt: new Date(2026, 9, 15, 10, 0).getTime() });
    const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
    raw.prepare('UPDATE starters SET fridge_feed_weekday = 7, fridge_feed_minute = 600 WHERE id = ?').run('z1');
    raw.close();
    await resyncNotifications();
    const p = mock.pending.get('piekarz.karmienie.z1.1')!;
    expect(p.trigger.date).toBe(new Date(2026, 9, 25, 10, 0).getTime());
    expect(p.content.body).toBe('Dziś ustalony dzień karmienia zakwasu „Ania”.');
  });
});
