/**
 * Zapis stałego dnia karmienia przez istniejący saveStarter (M3 D7; BR-KAL-010; kolumny fridge_feed_* z D1, bez
 * zmiany schematu; zasada wspólna 10): UPSERT zakwasu zapisuje dzień, gdy pole jest w obiekcie (null czyści), a bez
 * pola zostawia kolumny nietknięte; wpisy dziennika zakwasu (dzieci) zostają w tej samej liczbie i z tymi samymi polami;
 * po restarcie dzień wraca z bazy.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import type { StoredStarter } from '../db';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const kolumny = () => {
  const raw = openRaw(APP_DB());
  const r = raw.prepare('SELECT fridge_feed_weekday AS d, fridge_feed_minute AS m FROM starters WHERE id = ?').get('z1');
  const wpisy = raw.prepare('SELECT id, occurred_at, feed_ratio FROM starter_entries WHERE starter_id = ? ORDER BY id').all('z1');
  raw.close();
  return { r, wpisy };
};
const zakwas = (x: Partial<StoredStarter> = {}): StoredStarter => ({
  id: 'z1', name: 'Żytni', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE', lastFedAt: 1_700_000_000_000, feedingRatio: '1:2:2', ...x,
});

describe('D7: stały dzień karmienia w saveStarter (node:sqlite)', () => {
  beforeEach(() => useTempDbDir());

  it('BR-KAL-010 zapis dnia, zmiana, brak pola bez zmian, null czyści; wpisy zakwasu nietknięte; restart czyta dzień', async () => {
    let app = restartApp();
    await app.schema.initDatabase();
    await app.store.saveStarter(zakwas());
    const przed = kolumny();
    expect(przed.r).toEqual({ d: null, m: null });
    expect(przed.wpisy).toHaveLength(1);

    await app.store.saveStarter(zakwas({ fridgeFeedDay: { weekday: 7, minuteOfDay: 600 } }));
    expect(kolumny().r).toEqual({ d: 7, m: 600 });

    // Zapis profilu bez pola (np. starszy obiekt) nie gubi dnia
    await app.store.saveStarter(zakwas({ name: 'Żytni 2' }));
    expect(kolumny().r).toEqual({ d: 7, m: 600 });

    app = restartApp();
    await app.schema.initDatabase();
    expect((await app.store.getStarters()).find((s) => s.id === 'z1')?.fridgeFeedDay).toEqual({ weekday: 7, minuteOfDay: 600 });

    await app.store.saveStarter(zakwas({ name: 'Żytni 2', fridgeFeedDay: { weekday: 5, minuteOfDay: 630 } }));
    expect(kolumny().r).toEqual({ d: 5, m: 630 });
    await app.store.saveStarter(zakwas({ name: 'Żytni 2', fridgeFeedDay: null }));
    expect(kolumny().r).toEqual({ d: null, m: null });
    expect(kolumny().wpisy).toEqual(przed.wpisy);
    expect(app.status.getStorageState()).toBe('ok');
  });
});
