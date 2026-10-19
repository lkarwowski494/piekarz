/**
 * Eksport → import kopii zachowuje wszystkie pola wypieku, także profil sensoryczny
 * [M1-audytor-generalny-002; 05-architekt-002, 08-programista-002, 12-niezawodnosc-009, 07-jakosc-001].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';
import { buildBackup, parseAndValidateBackup } from '../../lib/backup';
import type { StoredBakeLog } from '../db';

const bake = (n: number): StoredBakeLog => ({
  id: `bake_${n}`,
  recipeName: `Chleb ${n}`,
  startedAt: 1700000000000 + n,
  finishedAt: 1700003600000 + n,
  ambientTemp: 22.5,
  actualDDT: 25.5,
  ratingStars: 4,
  notes: `notatka ${n}`,
  crumbScore: 4,
  crustScore: 5,
  tasteProfile: 'sour',
  sensoryProfile: { crustCrispness: n, crumbElasticity: 3, acidity: 4, openCrumb: 2, caramelization: 5 },
});

describe('Backup import keeps every bake field (002)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('export and import of 3 bakes with sensory profiles keeps 3/3 profiles after a restart', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    for (let n = 1; n <= 3; n++) await first.store.saveBakeLog({ ...bake(n), finishedAt: undefined });

    const exported = JSON.stringify(buildBackup(await first.store.collectBackupData()));
    await first.store.restoreFromBackupData(parseAndValidateBackup(exported).state);

    const second = restartApp();
    await second.schema.initDatabase();
    const logs = await second.store.getBakeLogs();
    expect(logs).toHaveLength(3);
    for (const log of logs) {
      const n = Number(log.id.slice('bake_'.length));
      expect(log).toEqual({ ...bake(n), finishedAt: undefined });
    }

    const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
    expect(tableCounts(raw).bakes).toBe(3);
    const withProfile = raw.prepare('SELECT count(*) AS c FROM bakes WHERE sensory_profile IS NOT NULL').get();
    expect(withProfile).toEqual({ c: 3 });
    raw.close();
  });
});
