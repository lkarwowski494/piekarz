/**
 * M1-audytor-generalny-104, BR-ZAKW-007 (ADR-008, T4 roli 05): poprawa godziny jednego wpisu bez kasowania historii,
 * usunięcie jednego wpisu i „Cofnij” (D-051 1a). Przypomnienie liczy się od poprawionej godziny.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import { planNotifications } from '../../core/notification-plan';
import { FEED_ROOM_TEMP_AFTER_MS } from '../../core/notification-config';
import type { StoredStarter, StoredStarterEntry } from '../db';

const at = (h: number) => new Date(2026, 9, 20, h, 0, 0).getTime();
const starter: StoredStarter = { id: 's1', name: 'Bolek', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP' };
const entry = (id: string, kind: 'feeding' | 'observation', when: number): StoredStarterEntry => ({
  id, starterId: 's1', kind, occurredAt: when, feedRatio: kind === 'feeding' ? '1:1:1' : undefined, signs: kind === 'observation' ? ['bubbles'] : [], createdAt: when, updatedAt: when,
});

async function setup() {
  const app = restartApp();
  await app.schema.initDatabase();
  const store = require('../starter-entries-store') as typeof import('../starter-entries-store');
  await store.createStarterWithEntry(starter, entry('f-early', 'feeding', at(6) - 24 * 3600_000));
  await store.addStarterEntry(entry('obs', 'observation', at(7)));
  await store.addStarterEntry(entry('f-wrong', 'feeding', at(18)));
  return { app, store };
}

describe('BR-ZAKW-007: poprawa pomyłki we wpisie bez kasowania historii (104)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('BR-ZAKW-007 zła godzina 18:00 → 08:00: lastFedAt i przypomnienie od 08:00, pozostałe wpisy bez zmian', async () => {
    const { app, store } = await setup();
    const before = await store.getStarterEntries('s1');
    const others = before.filter((e) => e.id !== 'f-wrong');

    const wrong = before.find((e) => e.id === 'f-wrong')!;
    await store.updateStarterEntry({ ...wrong, occurredAt: at(8), updatedAt: at(19) });

    const after = await store.getStarterEntries('s1');
    expect(after.filter((e) => e.id !== 'f-wrong')).toEqual(others);
    expect(after.find((e) => e.id === 'f-wrong')).toEqual({ ...wrong, occurredAt: at(8), updatedAt: at(19) });

    const s = (await app.store.getStarters()).find((x) => x.id === 's1')!;
    expect(s.lastFedAt).toBe(at(8));
    const plan = planNotifications({ sessions: [], starters: [s] }, at(19));
    expect(plan.map((p) => p.triggerAt)).toEqual([at(8) + FEED_ROOM_TEMP_AFTER_MS]);

    // Po restarcie to samo
    const again = restartApp();
    await again.schema.initDatabase();
    expect((await again.store.getStarters()).find((x) => x.id === 's1')?.lastFedAt).toBe(at(8));
  });

  it('poprawa nieistniejącego wpisu to błąd, nic się nie zmienia', async () => {
    const { store } = await setup();
    const before = await store.getStarterEntries('s1');
    await expect(store.updateStarterEntry(entry('nie-ma', 'feeding', at(9)))).rejects.toThrow();
    expect(await store.getStarterEntries('s1')).toEqual(before);
  });

  it('BR-ZAKW-007 usunięcie jednego wpisu: znika tylko ten wpis; Cofnij przywraca identyczny wiersz', async () => {
    const { app, store } = await setup();
    const before = await store.getStarterEntries('s1');
    const removed = await store.deleteStarterEntry('f-wrong');
    expect(removed).toEqual(before.find((e) => e.id === 'f-wrong'));
    expect(await store.getStarterEntries('s1')).toEqual(before.filter((e) => e.id !== 'f-wrong'));
    expect((await app.store.getStarters()).find((x) => x.id === 's1')?.lastFedAt).toBe(at(6) - 24 * 3600_000);

    await store.restoreStarterEntry(removed!);
    expect(await store.getStarterEntries('s1')).toEqual(before);
  });

  it('zamknięcie aplikacji po usunięciu (bez Cofnij) utrwala usunięcie', async () => {
    const { store } = await setup();
    await store.deleteStarterEntry('obs');
    const again = restartApp();
    await again.schema.initDatabase();
    const fresh = require('../starter-entries-store') as typeof import('../starter-entries-store');
    expect((await fresh.getStarterEntries('s1')).map((e) => e.id)).toEqual(['f-wrong', 'f-early']);
    expect(await fresh.deleteStarterEntry('nie-ma')).toBeNull();
  });
});
