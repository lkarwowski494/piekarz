/**
 * Receptura z sumą mąk poza 95–105% (dane z dawnych importów) nie znika przy imporcie kopii [reaudit-noc N-8;
 * M1-audytor-generalny-150]. Import zachowuje proporcje bez zmian (ekran receptury liczy je proporcjonalnie
 * i pokazuje komunikat o sumie mąk, `obliczRecepture`), więc ponowny import i kopia przed importem jej nie gubią.
 * Prawdziwy SQLite (node:sqlite), eksport → import → restart.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import { buildBackup, parseAndValidateBackup } from '../../lib/backup';
import { obliczRecepture } from '../../core/domain-rules';
import type { StoredRecipe } from '../db';

const ZLA: StoredRecipe = {
  id: 'r_80',
  name: 'Stara mieszanka 80%',
  formula: {
    flours: [
      { name: 'Mąka pszenna typ 750', percentage: 50 },
      { name: 'Mąka żytnia typ 2000', percentage: 30 },
    ],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    starterHydration: 100,
    targetDoughWeightGrams: 1000,
  },
  targetDDT: 25,
  notes: 'z dawnego importu',
  isBuiltIn: false,
  createdAt: 1700000000000,
};

describe('N-8: receptura z sumą mąk 80% przechodzi przez import kopii', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('eksport → import → restart: receptura jest, z tymi samymi proporcjami; ekran liczy ją z komunikatem', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    await first.store.saveRecipe(ZLA);
    const kopia = JSON.stringify(buildBackup(await first.store.collectBackupData()));
    const wynik = parseAndValidateBackup(kopia);
    await first.store.restoreFromBackupData(wynik.state);

    const second = restartApp();
    await second.schema.initDatabase();
    const r = (await second.store.getRecipes()).find((x) => x.id === ZLA.id);
    expect(r).toEqual(ZLA);
    expect(obliczRecepture(ZLA.formula).blad).toEqual({ sumaMak: 80 });
  });
});
